/**
 * Ollama Translation Service
 * Communicates with local Ollama server for translations
 */

const OLLAMA_BASE_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.NEXT_PUBLIC_OLLAMA_MODEL || "llama2";

interface OllamaRequest {
    model: string;
    prompt: string;
    stream: false;
}

interface OllamaResponse {
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

/**
 * Translate text using local Ollama server
 * @param text Text to translate
 * @param targetLanguage Target language code (e.g., 'fr', 'de', 'cn', 'vi')
 * @param sourceLanguage Source language code (default: 'en')
 * @returns Translated text or original text if translation fails
 */
export async function translateWithOllama(
    text: string,
    targetLanguage: string,
    sourceLanguage: string = "en"
): Promise<string> {
    if (!text) return text;
    if (sourceLanguage === targetLanguage) return text;

    try {
        const languageNames: Record<string, string> = {
            en: "English",
            fr: "French",
            de: "German",
            cn: "Chinese",
            vi: "Vietnamese",
        };

        const sourceLang = languageNames[sourceLanguage] || sourceLanguage;
        const targetLang = languageNames[targetLanguage] || targetLanguage;

        const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. 
Respond with ONLY the translated text, nothing else. Adjust it to be suitable with the context.

Text to translate: "${text}"

Translated text:`;

        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false,
            } as OllamaRequest),
        });

        if (!response.ok) {
            console.error(
                `Ollama API error: ${response.status} ${response.statusText}`
            );
            return text;
        }

        const data = (await response.json()) as OllamaResponse;
        const translatedText = data.response?.trim() || text;

        // Remove common extra text that models might add
        return translatedText
            .replace(/^["']|["']$/g, "") // Remove surrounding quotes
            .replace(/\.{3}$/, "") // Remove trailing ellipsis
            .trim();
    } catch (error) {
        console.error("Ollama translation failed:", error);
        return text; // Fallback to original text on error
    }
}

/**
 * Batch translate multiple texts
 * @param texts Array of texts to translate
 * @param targetLanguage Target language code
 * @param sourceLanguage Source language code
 * @returns Array of translated texts
 */
export async function batchTranslateWithOllama(
    texts: string[],
    targetLanguage: string,
    sourceLanguage: string = "en"
): Promise<string[]> {
    return Promise.all(
        texts.map((text) =>
            translateWithOllama(text, targetLanguage, sourceLanguage)
        )
    );
}

/**
 * Check if Ollama server is available
 * @returns true if server is reachable, false otherwise
 */
export async function isOllamaAvailable(): Promise<boolean> {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
            method: "GET",
        });
        return response.ok;
    } catch (error) {
        console.warn("Ollama server not available:", error);
        return false;
    }
}

/**
 * Get list of available models on the Ollama server
 */
export async function getAvailableModels(): Promise<string[]> {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
            method: "GET",
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json() as { models?: Array<{ name: string }> };
        return data.models?.map((m) => m.name) || [];
    } catch (error) {
        console.error("Failed to fetch Ollama models:", error);
        return [];
    }
}
