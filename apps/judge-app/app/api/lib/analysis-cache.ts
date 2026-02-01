import crypto from "crypto";

interface TestResults {
    passed?: number;
    total?: number;
}

interface CacheEntry {
    data: unknown;
    expiresAt: number;
}

class AnalysisCache {
    private readonly cache: Map<string, CacheEntry> = new Map();
    private readonly TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

    /**
     * Generate a hash from code and test results
     * Used as cache key to identify similar bugs across users
     */
    generateKey(sourceCode: string, language: string, testResults: TestResults): string {
        const key = `${sourceCode}|${language}|${testResults?.passed}/${testResults?.total}`;
        return crypto.createHash("sha256").update(key).digest("hex");
    }

    /**
     * Get cached analysis if available and not expired
     */
    get(key: string): unknown | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Store analysis result in cache
     */
    set(key: string, data: unknown): void {
        const expiresAt = Date.now() + this.TTL_MS;
        this.cache.set(key, { data, expiresAt });
    }

    /**
     * Clear expired entries (call periodically)
     */
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cache stats for monitoring
     */
    getStats(): { size: number; ttlHours: number } {
        return {
            size: this.cache.size,
            ttlHours: this.TTL_MS / (60 * 60 * 1000),
        };
    }
}

// Singleton instance
export const analysisCache = new AnalysisCache();

// Cleanup expired entries every hour
setInterval(() => {
    analysisCache.cleanup();
}, 60 * 60 * 1000);
