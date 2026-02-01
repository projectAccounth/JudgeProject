import { ProblemAuthorInput } from "@judgeapp/shared/api/dto/problem-author.dto";
import { TestCase } from "@judgeapp/shared/domain/testcase"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

type QueryParams = Record<string, string | number | boolean | string[] | undefined | null>;

async function apiFetch(
    path: string,
    options?: RequestInit & { params?: QueryParams }
) {
    const { params, ...fetchOptions } = options || {};
    let url = API_BASE + path;

    if (params) {
        const search = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) {
            if (v != null) {
                search.set(k, Array.isArray(v) ? v.join(",") : String(v));
            }
        }
        if (search.toString()) url += "?" + search.toString();
    }

    const res = await fetch(url, {
        ...fetchOptions,
        headers: {
            "Content-Type": "application/json",
            ...(fetchOptions.headers ?? {})
        },
        credentials: "include",
        cache: "no-store"
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export const api = {
    getProblems: (params: {
        limit?: number;
        after?: string;
        since?: string;
        q?: string;
        difficulty?: string;
        tags?: string[];
        category?: string[];
    }) => apiFetch("/getProblemData", { params }),

    getProblem: (id: string) =>
        apiFetch(`/problems/${id}`),

    submitSolution: (data: {
        problemId: string;
        sourceCode: string;
        userId: string;
        language: string;
    }) =>
        apiFetch(`/submissions`, {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getSubmissions: (params?: { limit?: number; after?: string }) => 
        apiFetch("/submissions", { params }),

    getSubmission: (id: string) =>
        apiFetch(`/submissions/${id}`),

    getSamples: (id: string) =>
        apiFetch(`/getProblemSamples/${id}`),

    getTestcases: (id: string) =>
        apiFetch(`/getProblemTestcases/${id}`),

    tryUpdateProblem: (input: ProblemAuthorInput) => {
        console.log(input);
        apiFetch(`/updateProblem`, {
            method: "POST",
            body: JSON.stringify(input)
        });
    },

    tryUpdateTestcase: (input: Readonly<{
        set_id: string;
        upserts?: TestCase[];
        remove?: string[];
    }>) => {
        return apiFetch("/updateTestcases", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },


    createProblem: (input: ProblemAuthorInput) =>
        apiFetch("/addProblem", {
            method: "POST",
            body: JSON.stringify(input),
        }),

    getHealth: () => apiFetch("/health"),
    
    getStats: () => apiFetch("/stats"),
    
    getGlobalStats: (params?: { language?: string; verdict?: string }) =>
        apiFetch("/stats/global", { params }),
    
    getProblemStats: (problemId: string, params?: { language?: string; verdict?: string }) =>
        apiFetch(`/stats/problem/${problemId}`, { params }),
    
    getLeaderboard: (limit?: number) =>
        apiFetch("/stats/leaderboard", { params: { limit } }),

    getUserStats: (userId: string) =>
        apiFetch(`/stats/user/${userId}`),

    getMe: async () => {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    logout: async () => {
        const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include", body: JSON.stringify({}) });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    getPublicProfile: (userId: string) =>
        apiFetch(`/users/${userId}/profile`),

    // Admin user management
    updateUser: (userId: string, updates: { username?: string; role?: string }) =>
        apiFetch(`/admin/users/${userId}`, {
            method: "PUT",
            body: JSON.stringify(updates),
        }),

    getAllUsers: (limit?: number, offset?: number) =>
        apiFetch("/admin/users", {
            params: { limit: limit ?? 20, offset: offset ?? 0 },
        }),

    getUser: (userId: string) =>
        apiFetch(`/admin/users/${userId}`),

    changeUserRole: (userId: string, role: string) =>
        apiFetch(`/admin/users/${userId}/role`, {
            method: "PUT",
            body: JSON.stringify({ role }),
        }),

    /**
     * Translate problem statement to target language
     * @param problemStatement - The problem statement to translate
     * @param targetLanguage - Target language code (en, fr, de, zh, vi, etc.)
     * @param provider - Translation provider: "ollama" (default, free, local), "google", or "deepl"
     */
    translateProblem: async (
        problemStatement: string,
        targetLanguage: string,
        provider: "ollama" | "google" | "deepl" = "ollama"
    ) => {
        const res = await fetch("/api/translate-problem", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ problemStatement, targetLanguage, provider })
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
}