/**
 * Utility function for backend API calls
 * Standardizes error handling and response parsing
 */

export interface FetchOptions extends RequestInit {
    throwOnError?: boolean;
}

export interface FetchResponse<T = unknown> {
    data?: T;
    error?: string;
    status: number;
}

export async function backendFetch<T = unknown>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<FetchResponse<T>> {
    const { throwOnError = true, ...fetchOptions } = options;

    try {
        // Ensure endpoint doesn't start with /api/ (routes don't use that prefix)
        const path = endpoint.startsWith("/api/") 
            ? endpoint.replace("/api/", "/") 
            : endpoint;

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
        const url = `${baseUrl}${path}`;

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...fetchOptions.headers,
            },
            ...fetchOptions,
        });

        const data = await response.json();

        if (!response.ok) {
            const error = data.error?.message || data.message || data.error || "Unknown error";
            if (throwOnError) {
                throw new Error(error);
            }
            return { error, status: response.status };
        }

        return { data, status: response.status };
    } catch (err) {
        const error = err instanceof Error ? err.message : "Network error";
        if (throwOnError) {
            throw err;
        }
        return { error, status: 0 };
    }
}

/**
 * GET request helper
 */
export async function backendGet<T = unknown>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<FetchResponse<T>> {
    return backendFetch<T>(endpoint, { ...options, method: "GET" });
}

/**
 * POST request helper
 */
export async function backendPost<T = unknown>(
    endpoint: string,
    body?: unknown,
    options: FetchOptions = {}
): Promise<FetchResponse<T>> {
    return backendFetch<T>(endpoint, {
        ...options,
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
    });
}

/**
 * PATCH request helper
 */
export async function backendPatch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options: FetchOptions = {}
): Promise<FetchResponse<T>> {
    return backendFetch<T>(endpoint, {
        ...options,
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined,
    });
}

/**
 * DELETE request helper
 */
export async function backendDelete<T = unknown>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<FetchResponse<T>> {
    return backendFetch<T>(endpoint, { ...options, method: "DELETE" });
}
