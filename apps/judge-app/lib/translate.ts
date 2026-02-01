/**
 * Translation utilities for problem statements and content
 * Supports both Ollama (local) and external APIs
 */

/**
 * Translate problem statement using Ollama (local LLM)
 * No API keys needed, runs locally
 */
export async function translateProblemWithOllama(
    problemStatement: string,
    targetLanguage: string
): Promise<string> {
    const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434";
    const OLLAMA_MODEL = process.env.NEXT_PUBLIC_OLLAMA_MODEL || "qwen2.5-coder:3b";

    try {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: `Translate the following problem statement to ${targetLanguage}. Keep all code examples and technical terms exact. Only translate the human-readable text.

Problem Statement:
${problemStatement}

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
        return data.response?.trim() || problemStatement;
    } catch (error) {
        console.error("[TRANSLATE] Ollama translation failed:", error);
        return problemStatement; // Fallback to original
    }
}

/**
 * Translate problem statement using external API (Google Translate, DeepL, etc.)
 * Requires API key in environment variables
 * 
 * Supports:
 * - GOOGLE_TRANSLATE_API_KEY (Google Cloud Translation API)
 * - DEEPL_API_KEY (DeepL API)
 * - AWS_TRANSLATE (AWS Translate service)
 */
export async function translateProblemWithExternalAPI(
    problemStatement: string,
    targetLanguage: string,
    provider: "google" | "deepl" | "aws" = "google"
): Promise<string> {
    if (provider === "google") {
        return translateWithGoogle(problemStatement, targetLanguage);
    } else if (provider === "deepl") {
        return translateWithDeepL(problemStatement, targetLanguage);
    } else if (provider === "aws") {
        return translateWithAWS(problemStatement);
    }
    return problemStatement;
}

/**
 * Translate using Google Cloud Translation API
 * Requires: GOOGLE_TRANSLATE_API_KEY environment variable
 */
async function translateWithGoogle(text: string, targetLanguage: string): Promise<string> {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
        console.warn("[TRANSLATE] Google API key not configured");
        return text;
    }

    try {
        const response = await fetch("https://translation.googleapis.com/language/translate/v2", {
            method: "POST",
            body: JSON.stringify({
                q: text,
                target: normalizeLanguageCode(targetLanguage, "google"),
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
        console.error("[TRANSLATE] Google Translate failed:", error);
        return text;
    }
}

/**
 * Translate using DeepL API
 * Requires: DEEPL_API_KEY environment variable
 * DeepL offers better quality translations than Google for many language pairs
 */
async function translateWithDeepL(text: string, targetLanguage: string): Promise<string> {
    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) {
        console.warn("[TRANSLATE] DeepL API key not configured");
        return text;
    }

    try {
        const isProAPI = apiKey.includes(":fx"); // DeepL Pro uses :fx suffix
        const baseURL = isProAPI
            ? "https://api.deepl.com/v2/translate"
            : "https://api-free.deepl.com/v2/translate";

        const response = await fetch(baseURL, {
            method: "POST",
            headers: {
                Authorization: `DeepL-Auth-Key ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: [text],
                target_lang: normalizeLanguageCode(targetLanguage, "deepl").toUpperCase(),
            }),
        });

        if (!response.ok) {
            throw new Error(`DeepL error: ${response.status}`);
        }

        const data = (await response.json()) as { translations?: Array<{ text: string }> };
        return data.translations?.[0]?.text || text;
    } catch (error) {
        console.error("[TRANSLATE] DeepL translation failed:", error);
        return text;
    }
}

/**
 * Translate using AWS Translate (requires AWS SDK)
 * Requires: AWS credentials and TRANSLATE_REGION environment variable
 * Note: This requires aws-sdk to be installed
 */
async function translateWithAWS(text: string): Promise<string> {
    // This would require aws-sdk to be installed
    // For now, return the original text as AWS integration requires additional setup
    console.warn("[TRANSLATE] AWS Translate not yet implemented");
    return text;
}

/**
 * Normalize language codes between different translation services
 * Different services use different codes (en-US, EN, en, etc.)
 */
function normalizeLanguageCode(
    language: string,
    provider: "google" | "deepl" | "aws"
): string {
    // Extract primary language tag (en from en-US)
    const primary = language.split("-")[0].toLowerCase();

    const MAP: Record<string, Record<string, string>> = {
        google: {
            en: "en",
            fr: "fr",
            de: "de",
            es: "es",
            zh: "zh-CN", // Simplified Chinese
            "zh-CN": "zh-CN",
            "zh-TW": "zh-TW",
            vi: "vi",
            ja: "ja",
            ko: "ko",
            pt: "pt",
            ru: "ru",
            ar: "ar",
            hi: "hi",
        },
        deepl: {
            en: "EN",
            fr: "FR",
            de: "DE",
            es: "ES",
            zh: "ZH", // DeepL uses ZH for Chinese
            "zh-CN": "ZH",
            "zh-TW": "ZH",
            vi: "VI",
            ja: "JA",
            ko: "KO",
            pt: "PT",
            ru: "RU",
            ar: "AR",
            hi: "HI",
        },
        aws: {
            en: "en",
            fr: "fr",
            de: "de",
            es: "es",
            zh: "zh",
            "zh-CN": "zh",
            "zh-TW": "zh-TW",
            vi: "vi",
            ja: "ja",
            ko: "ko",
            pt: "pt",
            ru: "ru",
            ar: "ar",
            hi: "hi",
        },
    };

    return MAP[provider]?.[primary] || primary;
}
