import { NextRequest, NextResponse } from "next/server";

/**
 * API endpoint for translating problem statements
 * 
 * POST /api/translate-problem
 * Body: { problemStatement: string, targetLanguage: string, provider?: "ollama" | "google" | "deepl" }
 * 
 * Uses local Ollama by default (no API key needed)
 * Falls back to external APIs (Google, DeepL) if configured
 */

const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.NEXT_PUBLIC_OLLAMA_MODEL || "qwen2.5-coder:3b";

interface TranslateRequest {
    problemStatement: string;
    targetLanguage: string;
    provider?: "ollama" | "google" | "deepl";
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as TranslateRequest;
        const { problemStatement, targetLanguage, provider = "ollama" } = body;

        if (!problemStatement || !targetLanguage) {
            return NextResponse.json(
                { error: "Missing problemStatement or targetLanguage" },
                { status: 400 }
            );
        }

        let translatedStatement: string;

        if (provider === "ollama" || provider === undefined) {
            translatedStatement = await translateWithOllama(problemStatement, targetLanguage);
        } else if (provider === "google") {
            translatedStatement = await translateWithGoogle(problemStatement, targetLanguage);
        } else if (provider === "deepl") {
            translatedStatement = await translateWithDeepL(problemStatement, targetLanguage);
        } else {
            translatedStatement = problemStatement;
        }

        return NextResponse.json({
            original: problemStatement.slice(0, 200),
            translated: translatedStatement,
            language: targetLanguage,
            provider,
        });
    } catch (error) {
        console.error("[TRANSLATE] Error:", error);
        return NextResponse.json(
            {
                error: "Failed to translate problem statement",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

/**
 * Translate using Ollama (local LLM, no API key needed)
 */
async function translateWithOllama(text: string, targetLanguage: string): Promise<string> {
    try {
        // Check if Ollama is available
        const healthCheck = await fetch(`${OLLAMA_URL}/api/tags`, {
            method: "GET",
            signal: AbortSignal.timeout(3000),
        });

        if (!healthCheck.ok) {
            throw new Error("Ollama not available");
        }

        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: `You are a professional translator. Translate the following problem statement to ${targetLanguage}. Keep all code examples, variable names, and technical terms EXACTLY the same. Only translate the human-readable explanations and descriptions.

Problem Statement:
${text}

Translated Problem Statement:`,
                stream: false,
                options: {
                    temperature: 0.1,
                    top_p: 0.5,
                    num_predict: 2000,
                    seed: 42,
                },
            }),
            signal: AbortSignal.timeout(60000),
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.status}`);
        }

        const data = (await response.json()) as { response: string };
        return data.response?.trim() || text;
    } catch (error) {
        console.error("[TRANSLATE] Ollama failed:", error);
        throw error;
    }
}

/**
 * Translate using Google Cloud Translation API
 * Requires: GOOGLE_TRANSLATE_API_KEY environment variable
 */
async function translateWithGoogle(text: string, targetLanguage: string): Promise<string> {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
        throw new Error("Google Translate API key not configured");
    }

    try {
        const langCode = normalizeLanguageCode(targetLanguage, "google");
        const response = await fetch("https://translation.googleapis.com/language/translate/v2", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                q: text,
                target: langCode,
                key: apiKey,
            }),
        });

        if (!response.ok) {
            throw new Error(`Google Translate error: ${response.status}`);
        }

        const data = (await response.json()) as {
            data?: { translations?: Array<{ translatedText: string }> };
        };
        return data.data?.translations?.[0]?.translatedText || text;
    } catch (error) {
        console.error("[TRANSLATE] Google failed:", error);
        throw error;
    }
}

/**
 * Translate using DeepL API (usually better quality)
 * Requires: DEEPL_API_KEY environment variable
 */
async function translateWithDeepL(text: string, targetLanguage: string): Promise<string> {
    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) {
        throw new Error("DeepL API key not configured");
    }

    try {
        const isProAPI = apiKey.includes(":fx");
        const baseURL = isProAPI
            ? "https://api.deepl.com/v2/translate"
            : "https://api-free.deepl.com/v2/translate";

        const langCode = normalizeLanguageCode(targetLanguage, "deepl");

        const response = await fetch(baseURL, {
            method: "POST",
            headers: {
                Authorization: `DeepL-Auth-Key ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: [text],
                target_lang: langCode.toUpperCase(),
            }),
        });

        if (!response.ok) {
            throw new Error(`DeepL error: ${response.status}`);
        }

        const data = (await response.json()) as { translations?: Array<{ text: string }> };
        return data.translations?.[0]?.text || text;
    } catch (error) {
        console.error("[TRANSLATE] DeepL failed:", error);
        throw error;
    }
}

/**
 * Normalize language codes for different translation services
 */
function normalizeLanguageCode(language: string, provider: "google" | "deepl"): string {
    const primary = language.split("-")[0].toLowerCase();

    const MAP: Record<string, Record<string, string>> = {
        google: {
            en: "en",
            fr: "fr",
            de: "de",
            es: "es",
            zh: "zh-CN",
            vi: "vi",
            ja: "ja",
            ko: "ko",
            pt: "pt",
            ru: "ru",
            ar: "ar",
            hi: "hi",
            it: "it",
            nl: "nl",
            pl: "pl",
            tr: "tr",
        },
        deepl: {
            en: "EN",
            fr: "FR",
            de: "DE",
            es: "ES",
            zh: "ZH",
            vi: "VI",
            ja: "JA",
            ko: "KO",
            pt: "PT",
            ru: "RU",
            ar: "AR",
            hi: "HI",
            it: "IT",
            nl: "NL",
            pl: "PL",
            tr: "TR",
        },
    };

    return MAP[provider]?.[primary] || primary;
}
