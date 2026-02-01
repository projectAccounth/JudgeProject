/**
 * Ollama Service
 * Manages communication with Ollama LLM server
 * Can be proxied through Fastify for security
 */

export interface OllamaGenerateRequest {
    model: string;
    prompt: string;
    stream?: boolean;
    temperature?: number;
    top_k?: number;
    top_p?: number;
    num_predict?: number;
}

export interface OllamaGenerateResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
    context?: number[];
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
}

export class OllamaService {
    private ollamaUrl: string;
    private model: string;

    constructor(
        ollamaUrl: string = process.env.OLLAMA_URL || "http://localhost:11434",
        model: string = process.env.OLLAMA_MODEL || "qwen2.5-coder:3b"
    ) {
        this.ollamaUrl = ollamaUrl;
        this.model = model;
    }

    /**
     * Check if Ollama server is available
     */
    async isAvailable(): Promise<boolean> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`${this.ollamaUrl}/api/tags`, {
                method: "GET",
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            console.log("[OLLAMA] Health check passed:", response.ok);
            return response.ok;
        } catch (error) {
            console.error("[OLLAMA] Health check failed:", error);
            return false;
        }
    }

    /**
     * Generate text using Ollama
     */
    async generate(prompt: string, options: Partial<OllamaGenerateRequest> = {}): Promise<string> {
        const available = await this.isAvailable();
        if (!available) {
            console.error("[OLLAMA] Server not available at", this.ollamaUrl);
            throw new Error("Ollama server is not available. Please start it first.");
        }

        console.log(`[OLLAMA] Generating with model: ${this.model} from URL: ${this.ollamaUrl}`);

        try {
            const response = await fetch(`${this.ollamaUrl}/api/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: this.model,
                    prompt,
                    stream: false,
                    ...options,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error(`[OLLAMA] Error: ${response.status}`, error);
                throw new Error(`Ollama error: ${response.status}`);
            }

            const data = (await response.json()) as OllamaGenerateResponse;
            console.log(`[OLLAMA] Response received (${data.response.length} chars)`);
            return data.response;
        } catch (error) {
            console.error("[OLLAMA] Request failed:", error);
            throw error;
        }
    }

    /**
     * Translate text using Ollama
     */
    async translate(text: string, targetLanguage: string, sourceLanguage: string = "en"): Promise<string> {
        const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Only provide the translation, no explanations.

Text: "${text}"

Translation:`;

        return this.generate(prompt, {
            temperature: 0.3,
            top_k: 40,
            top_p: 0.9,
            num_predict: 200,
        });
    }

    /**
     * Analyze code logic using Ollama
     */
    async analyzeCodeLogic(
        sourceCode: string,
        language: string,
        testResults: any,
        targetLanguage: string = "en"
    ): Promise<{ explanation: string; tip: string }> {
        const testSummary = testResults
            ? `Test Results: ${testResults.passed}/${testResults.total} passed. Failed tests:\n${(testResults.failedTests || []).slice(0, 3).map((t: any) => `- Input: ${t.input}, Expected: ${t.expected}, Got: ${t.output}`).join("\n")}`
            : "No test results available";

        const prompt = `You are a helpful coding mentor. Analyze the following code and provide feedback.

Language: ${language}
${testSummary}

Code:
\`\`\`${language}
${sourceCode}
\`\`\`

Provide a brief explanation of what the code is trying to do and identify any issues. Format your response as:
EXPLANATION: [explanation]
TIP: [suggestion for improvement]`;

        const response = await this.generate(prompt, {
            temperature: 0.5,
            num_predict: 500,
        });

        // Parse the response
        const explanationMatch = response.match(/EXPLANATION:\s*(.+?)(?=TIP:|$)/s);
        const tipMatch = response.match(/TIP:\s*(.+?)$/s);

        let explanation = explanationMatch ? explanationMatch[1].trim() : response;
        let tip = tipMatch ? tipMatch[1].trim() : "Keep practicing!";

        // Translate if needed
        if (targetLanguage && targetLanguage !== "en") {
            try {
                [explanation, tip] = await Promise.all([
                    this.translate(explanation, targetLanguage, "en"),
                    this.translate(tip, targetLanguage, "en"),
                ]);
            } catch (error) {
                console.warn("[OLLAMA] Translation failed, returning English:", error);
            }
        }

        return { explanation, tip };
    }
}
