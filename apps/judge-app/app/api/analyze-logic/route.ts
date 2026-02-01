import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { translateWithOllama } from "@/app/lib/ollama";

const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.NEXT_PUBLIC_OLLAMA_MODEL || "qwen2.5-coder:3b";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

const LANGUAGE_HINTS: Record<string, string> = {
    python: "Check for indentation, list slicing, type mismatches, and off-by-one errors.",
    javascript: "Check for null/undefined, async/await issues, array methods, and type coercion.",
    typescript: "Check for type errors, null checks, async/await, and generic type issues.",
    java: "Check for null pointers, loop conditions, array bounds, and object initialization.",
    cpp: "Check for pointer issues, memory leaks, off-by-one errors, and data type ranges.",
    c: "Check for pointer issues, memory allocation, off-by-one errors, and buffer overflows.",
    go: "Check for error handling, goroutine issues, nil pointers, and channel operations.",
    rust: "Check for borrow checker issues, ownership, unwrap/expect calls, and panic handling.",
};

// In-memory request deduping to prevent duplicate Ollama calls for identical requests
const inFlightRequests = new Map<string, Promise<Record<string, string>>>();

/**
 * Truncate test case output to prevent overwhelming the model
 * Keeps only the first N characters of long outputs
 */
function truncateTestOutput(output: string | undefined, maxLength: number = 300): string {
    if (!output?.trim()) return "";
    if (output.length <= maxLength) return output.trim();
    return output.slice(0, maxLength).trim() + "\n[... truncated ...]";
}

/**
 * Truncate problem statement to prevent overwhelming the model
 * Keeps only the first N characters
 */
function truncateProblemStatement(statement: string | undefined, maxLength: number = 1000): string {
    if (!statement?.trim()) return "";
    if (statement.length <= maxLength) return statement.trim();
    return statement.slice(0, maxLength).trim() + "\n[... full statement truncated for analysis ...]";
}

/**
 * Generate analysis cache key (language-independent, only depends on code)
 * We cache the full result (English + all language versions) under a single key
 */
function generateAnalysisCacheKey(
    sourceCode: string,
    language: string,
    testResults: { passed?: number; total?: number }
): string {
    const key = `analysis|${sourceCode}|${language}|${testResults?.passed}/${testResults?.total}`;
    return crypto.createHash("sha256").update(key).digest("hex");
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sourceCode, language, testResults, problemStatement, targetLanguage = "en" } = body;

        if (!sourceCode || !language) {
            return NextResponse.json(
                { error: "Missing sourceCode or language" },
                { status: 400 }
            );
        }

        // Normalize target language to primary tag (e.g., en-US -> en)
        const normalizedTarget = String(targetLanguage || "en").toLowerCase().split("-")[0];

        // Single cache key for all languages (English is always generated first)
        const cacheKey = generateAnalysisCacheKey(sourceCode, language, testResults);
        const requestKey = `req_${cacheKey}`; // For deduping in-flight requests

        // Check if we already have a cached result (valid for all language requests)
        try {
            console.log(`[CACHE] Checking for analysis cache...`);
            const cacheResponse = await fetch(`${BACKEND_URL}/analysis-cache/${cacheKey}`, {
                method: "GET",
            });

            if (cacheResponse.ok) {
                const cached = await cacheResponse.json();
                if (cached.data?.explanation && cached.data?.tip) {
                    console.log(`[CACHE] ✓ Cache hit!`);
                    // Return the target language version if available, otherwise English
                    const explanation = cached.data[`explanation_${normalizedTarget}`] || cached.data.explanation;
                    const tip = cached.data[`tip_${normalizedTarget}`] || cached.data.tip;
                    return NextResponse.json({
                        explanation,
                        tip,
                        passRate: cached.data.passRate || "",
                        language: normalizedTarget,
                    });
                }
            }
        } catch {
            console.warn("[CACHE] Cache lookup failed, will generate fresh analysis");
        }

        // Check if this exact request is already in-flight to dedupe
        if (inFlightRequests.has(requestKey)) {
            console.log(`[DEDUPE] Request already in-flight, waiting for existing promise...`);
            const result = await inFlightRequests.get(requestKey);
            if (result) {
                const explanation = result[`explanation_${normalizedTarget}`] || result.explanation;
                const tip = result[`tip_${normalizedTarget}`] || result.tip;
                return NextResponse.json({
                    explanation,
                    tip,
                    passRate: result.passRate || "",
                    language: normalizedTarget,
                });
            }
        }

        // Create a promise for this request and add to in-flight map
        const analysisPromise = performAnalysis(sourceCode, language, testResults, cacheKey, problemStatement);
        inFlightRequests.set(requestKey, analysisPromise);

        try {
            const result = await analysisPromise;
            const explanation = result[`explanation_${normalizedTarget}`] || result.explanation;
            const tip = result[`tip_${normalizedTarget}`] || result.tip;
            return NextResponse.json({
                explanation,
                tip,
                passRate: result.passRate || "",
                language: normalizedTarget,
            });
        } finally {
            // Clean up the in-flight request
            inFlightRequests.delete(requestKey);
        }
    } catch (error) {
        console.error("[ERROR] Code analysis failed:", error);
        return NextResponse.json(
            { error: "Failed to analyze code", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

/**
 * Perform the analysis and return result with translations for all common languages
 */
async function performAnalysis(
    sourceCode: string,
    language: string,
    testResults: { passed?: number; total?: number; case_results?: Array<Record<string, string>> },
    cacheKey: string,
    problemStatement?: string
): Promise<Record<string, string>> {
    // Check if Ollama is available
    try {
        const healthResponse = await fetch(`${OLLAMA_URL}/api/tags`, {
            method: "GET",
            signal: AbortSignal.timeout(3000),
        });
        if (!healthResponse.ok) {
            throw new Error("Ollama server is not available");
        }
    } catch {
        throw new Error("Ollama server is not available. Please start it first.");
    }

    // Extract failed test case information with both input and output
    const failedCases = testResults?.case_results
        ?.filter((c: Record<string, string>) => c.status !== "AC")
        .slice(0, 3)
        .map((c: Record<string, string>, idx: number) => {
            // Build test case info with explicit sections and TRUNCATION
            const sections: string[] = [`Test Case ${idx + 1}:`];
            
            // Only include input section if input exists (truncated to 250 chars)
            if (c.input?.trim()) {
                sections.push(`Input:\n${truncateTestOutput(c.input, 250)}`);
            } else {
                sections.push("Input: (no input required for this test)");
            }
            
            // Expected output (truncated to 300 chars)
            sections.push(`Expected Output:\n${truncateTestOutput(c.expected, 300) || "(empty output expected)"}`);
            
            // Actual output - this is what the code produced (truncated to 300 chars)
            sections.push(`Your Code's Output:\n${truncateTestOutput(c.stdout, 300) || "(no output produced)"}`);
            
            // Error message if any (truncated to 250 chars)
            if (c.stderr?.trim()) {
                sections.push(`Error Message:\n${truncateTestOutput(c.stderr, 250)}`);
            }
            
            return sections.join("\n");
        })
        .join("\n\n---\n\n");

    const passRate = testResults?.total 
        ? `${testResults.passed ?? 0}/${testResults.total} (${Math.round(((testResults.passed ?? 0) / testResults.total) * 100)}%)`
        : "Unknown";

    const languageHint = LANGUAGE_HINTS[language.toLowerCase()] || "Check for common logic errors.";

    const prompt = `You are an expert programming tutor analyzing a student's code submission. Your goal is to identify the EXACT root cause of why the code produces WRONG OUTPUT.

CRITICAL: Pay close attention to the difference between:
- "Your Code's Output" = what the code actually prints/returns
- "Expected Output" = what the judge expects
- Even small differences (extra spaces, missing punctuation, wrong case) matter!

Language: ${language}
Test Results: ${passRate} passed
Language-Specific Tips: ${languageHint}

${problemStatement ? `PROBLEM STATEMENT (truncated):\n${truncateProblemStatement(problemStatement, 1000)}\n\n` : ""}${failedCases ? `FAILED TEST CASES (showing input, expected output, and what your code produced):\n${failedCases}\n\nCarefully compare "Your Code's Output" with "Expected Output" to identify the exact issue.` : "No detailed test case information available"}

Source Code:
\`\`\`${language}
${sourceCode.slice(0, 2000)}
\`\`\`

INSTRUCTIONS:
1) Compare the "Your Code's Output" with "Expected Output" - identify the EXACT difference (wrong number? missing character? extra space?).
2) Trace through your code logic to explain WHY it produces that wrong output (1-2 sentences max).
3) Provide ONE specific, actionable TIP that fixes the root cause.
4) Format your answer exactly as:
EXPLANATION: [brief explanation of why output is wrong]
TIP: [specific code fix]

Example for "Hello World" problem:
EXPLANATION: The code prints "Hello World" but the expected output is "Hello World!" (with exclamation mark).
TIP: Change the print statement from print("Hello World") to print("Hello World!")

Respond only with EXPLANATION and TIP sections, nothing else.`;

    console.log(`[OLLAMA] Calling ${OLLAMA_MODEL}...`);

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.2,
                top_p: 0.6,
                num_predict: 250,
                seed: 42,
            },
        }),
        signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error(`[OLLAMA] Error: ${response.status}`, error);
        throw new Error(`Failed to analyze code with Ollama: ${error}`);
    }

    const data = await response.json() as { response: string };
    const content = data.response?.trim() || "";
    console.log(`[OLLAMA] Response received (${content.length} chars)`);

    // Parse response
    const explanationMatch = /EXPLANATION:\s*(.+?)(?=TIP:|$)/is.exec(content);
    const tipMatch = /TIP:\s*(.+?)$/is.exec(content);

    let englishExplanation = explanationMatch?.[1]?.trim() || "";
    let englishTip = tipMatch?.[1]?.trim() || "";

    // Clean up
    englishExplanation = englishExplanation
        .replace(/^\[/, "").replace(/\]$/, "")
        .replaceAll(/(?:^["']|["']$)/g, "")
        .split("\n")[0]
        .trim();
    
    englishTip = englishTip
        .replace(/^\[/, "").replace(/\]$/, "")
        .replaceAll(/(?:^["']|["']$)/g, "")
        .trim();

    // Fallbacks if parsing failed
    if (!englishExplanation || englishExplanation.length < 10) {
        englishExplanation = "The code produces incorrect output for the given test cases. Review the logic flow carefully.";
    }
    if (!englishTip || englishTip.length < 15) {
        englishTip = "Trace through your code with a failing test case and identify where it diverges from the expected output.";
    }

    // Build the result object with English as the base
    const result: Record<string, string> = {
        explanation: englishExplanation,
        tip: englishTip,
        passRate,
    };

    // Translate to commonly used languages
    const targetLanguages = ["fr", "de", "cn", "vi"];
    for (const lang of targetLanguages) {
        try {
            console.log(`[TRANSLATE] Translating to ${lang}...`);
            const [translatedExplanation, translatedTip] = await Promise.all([
                translateWithOllama(englishExplanation, lang, "en"),
                translateWithOllama(englishTip, lang, "en"),
            ]);
            result[`explanation_${lang}`] = translatedExplanation || englishExplanation;
            result[`tip_${lang}`] = translatedTip || englishTip;
            console.log(`[TRANSLATE] ✓ Translated to ${lang}`);
        } catch (err) {
            console.warn(`[TRANSLATE] Translation to ${lang} failed, skipping:`, err);
            // Fall back to English for this language
            result[`explanation_${lang}`] = englishExplanation;
            result[`tip_${lang}`] = englishTip;
        }
    }

    // Cache the result with all translations
    try {
        console.log(`[CACHE] Storing analysis with all translations...`);
        await fetch(`${BACKEND_URL}/analysis-cache`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                cacheKey, 
                data: result
            }),
        }).catch(() => {});
    } catch (error) {
        console.warn("[CACHE] Failed to store analysis:", error);
    }

    return result;
}
