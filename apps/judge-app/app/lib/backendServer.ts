/**
 * Backend Server Helper Functions
 * For secure server-only routes that require exchange key authentication
 * 
 * Used for:
 * - Analysis cache operations (/analysis-cache/*)
 * - Ollama proxy endpoints (/ollama/*)
 */

import { backendFetch, FetchOptions, FetchResponse } from "./backendFetch";

const EXCHANGE_KEY = process.env.NEXT_PUBLIC_EXCHANGE_KEY || "";

/**
 * Make authenticated backend request with exchange key
 * Used for sensitive operations that require server authentication
 */
export async function backendServerFetch<T = unknown>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<FetchResponse<T>> {
    if (!EXCHANGE_KEY) {
        console.warn("[SERVER-FETCH] EXCHANGE_KEY not configured - request will fail");
    }

    console.log("[SERVER-FETCH]", { endpoint, hasExchangeKey: !!EXCHANGE_KEY });

    return backendFetch<T>(endpoint, {
        ...options,
        headers: {
            ...(options.headers || {}),
            "X-Exchange-Key": EXCHANGE_KEY,
        },
    });
}

/**
 * GET request to secure backend endpoint
 */
export async function backendServerGet<T = unknown>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<FetchResponse<T>> {
    return backendServerFetch<T>(endpoint, { ...options, method: "GET" });
}

/**
 * POST request to secure backend endpoint
 */
export async function backendServerPost<T = unknown>(
    endpoint: string,
    body?: unknown,
    options: FetchOptions = {}
): Promise<FetchResponse<T>> {
    return backendServerFetch<T>(endpoint, {
        ...options,
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
    });
}

/**
 * PATCH request to secure backend endpoint
 */
export async function backendServerPatch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options: FetchOptions = {}
): Promise<FetchResponse<T>> {
    return backendServerFetch<T>(endpoint, {
        ...options,
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined,
    });
}

/**
 * DELETE request to secure backend endpoint
 */
export async function backendServerDelete<T = unknown>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<FetchResponse<T>> {
    return backendServerFetch<T>(endpoint, { ...options, method: "DELETE" });
}

/**
 * Ollama Proxy Functions
 * Call backend's Ollama endpoints instead of directly calling Ollama
 */

export interface OllamaAnalysisRequest {
    sourceCode: string;
    language: string;
    testResults?: {
        passed: number;
        total: number;
        failedTests?: Array<{
            input: string;
            expected: string;
            output: string;
        }>;
    };
    targetLanguage?: string;
}

export interface OllamaAnalysisResponse {
    explanation: string;
    tip: string;
}

/**
 * Analyze code using backend's Ollama proxy
 */
export async function analyzeCodeWithOllama(
    request: OllamaAnalysisRequest
): Promise<FetchResponse<OllamaAnalysisResponse>> {
    return backendServerPost<OllamaAnalysisResponse>(
        "/ollama/analyze-code",
        request
    );
}

export interface OllamaTranslateRequest {
    text: string;
    targetLanguage: string;
    sourceLanguage?: string;
}

/**
 * Translate text using backend's Ollama proxy
 */
export async function translateWithOllama(
    request: OllamaTranslateRequest
): Promise<FetchResponse<{ translated: string }>> {
    return backendServerPost<{ translated: string }>(
        "/ollama/translate",
        request
    );
}

/**
 * Check Ollama server health through backend proxy
 */
export async function checkOllamaHealth(): Promise<FetchResponse<{
    available: boolean;
    status: string;
    model: string;
}>> {
    return backendServerGet(
        "/ollama/health"
    );
}

/**
 * Analysis Cache Functions
 */

export interface AnalysisCacheRequest {
    cacheKey: string;
    data: any;
}

/**
 * Generate cache key for analysis result
 */
export async function generateAnalysisCacheKey(request: {
    sourceCode: string;
    language: string;
    testResults?: any;
}): Promise<FetchResponse<{ cacheKey: string }>> {
    return backendServerPost<{ cacheKey: string }>(
        "/analysis-cache/generate-key",
        request
    );
}

/**
 * Get cached analysis result
 */
export async function getAnalysisCache(
    cacheKey: string
): Promise<FetchResponse<{ data: any; cached: boolean }>> {
    return backendServerGet(
        `/analysis-cache/${cacheKey}`
    );
}

/**
 * Store analysis result in cache
 */
export async function setAnalysisCache(
    cacheKey: string,
    data: any
): Promise<FetchResponse<{ success: boolean; cacheKey: string }>> {
    return backendServerPost<{ success: boolean; cacheKey: string }>(
        "/analysis-cache",
        { cacheKey, data }
    );
}

/**
 * Get cache statistics
 */
export async function getAnalysisCacheStats(): Promise<
    FetchResponse<any>
> {
    return backendServerGet("/analysis-cache/stats");
}
