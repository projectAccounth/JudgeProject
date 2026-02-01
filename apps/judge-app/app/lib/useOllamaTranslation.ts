import { useState, useCallback } from "react";

interface TranslationCache {
  [key: string]: string;
}

/**
 * Hook for translating text using Ollama server
 */
export function useOllamaTranslation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<TranslationCache>({});

  const getCacheKey = useCallback(
    (text: string, targetLang: string, sourceLang: string) => {
      return `${text}|${targetLang}|${sourceLang}`;
    },
    []
  );

  const translate = useCallback(
    async (
      text: string,
      targetLanguage: string,
      sourceLanguage: string = "en"
    ): Promise<string> => {
      const cacheKey = getCacheKey(text, targetLanguage, sourceLanguage);

      // Check cache first
      if (cache[cacheKey]) {
        return cache[cacheKey];
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            targetLanguage,
            sourceLanguage,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP ${response.status}`
          );
        }

        const data = await response.json();
        const translated = data.translation || text;

        // Update cache
        setCache((prev) => ({
          ...prev,
          [cacheKey]: translated,
        }));

        return translated;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Translation error:", err);
        return text; // Return original text on error
      } finally {
        setLoading(false);
      }
    },
    [cache, getCacheKey]
  );

  const batchTranslate = useCallback(
    async (
      texts: string[],
      targetLanguage: string,
      sourceLanguage: string = "en"
    ): Promise<string[]> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            texts,
            targetLanguage,
            sourceLanguage,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP ${response.status}`
          );
        }

        const data = await response.json();
        const translations = data.translations || texts;

        // Update cache for each translation
        setCache((prev) => {
          const updated = { ...prev };
          texts.forEach((text, idx) => {
            const cacheKey = getCacheKey(
              text,
              targetLanguage,
              sourceLanguage
            );
            updated[cacheKey] = translations[idx];
          });
          return updated;
        });

        return translations;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Batch translation error:", err);
        return texts; // Return original texts on error
      } finally {
        setLoading(false);
      }
    },
    [getCacheKey]
  );

  const checkStatus = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/translate");
      const data = await response.json();
      return data.status === "available";
    } catch (err) {
      console.error("Failed to check Ollama status:", err);
      return false;
    }
  }, []);

  return {
    translate,
    batchTranslate,
    checkStatus,
    loading,
    error,
    clearCache: () => setCache({}),
  };
}
