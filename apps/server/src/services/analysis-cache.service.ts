import { CACHE_QUERIES } from "../database/analysis-cache.migration";
import { db } from "../database/sql";


class AnalysisCacheService {
    /**
     * Get cached analysis if available and not expired
     */
    async get(cacheKey: string): Promise<any | null> {
        try {
            const result = await db.query(CACHE_QUERIES.GET, [cacheKey]);

            if (result.rows.length === 0) {
                console.log(`Cache miss for key: ${cacheKey}`);
                return null;
            }

            let data = result.rows[0].data;
            
            // If data is a string (shouldn't be with JSONB, but just in case), parse it
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            
            console.log(`Cache hit for key: ${cacheKey}`, data);

            // Increment hit counter
            await db.query(CACHE_QUERIES.INCREMENT_HITS, [cacheKey]);

            return data;
        } catch (error) {
            console.error("Cache GET error:", error);
            return null;
        }
    }

    /**
     * Store analysis result in cache (24 hour TTL)
     */
    async set(cacheKey: string, data: any): Promise<boolean> {
        try {
            console.log(`Storing cache for key: ${cacheKey}`, data);
            const jsonData = JSON.stringify(data);
            await db.query(CACHE_QUERIES.SET, [cacheKey, jsonData]);
            console.log(`Cache stored successfully for key: ${cacheKey}`);
            return true;
        } catch (error) {
            console.error("Cache SET error:", error);
            return false;
        }
    }

    /**
     * Clean up expired entries from database
     */
    async cleanup(): Promise<number> {
        try {
            const result = await db.query(CACHE_QUERIES.CLEANUP);
            return result.rowCount || 0;
        } catch (error) {
            console.error("Cache CLEANUP error:", error);
            return 0;
        }
    }

    /**
     * Get cache statistics for monitoring
     */
    async getStats(): Promise<any> {
        try {
            const result = await db.query(CACHE_QUERIES.STATS);
            return result.rows[0];
        } catch (error) {
            console.error("Cache STATS error:", error);
            return null;
        }
    }
}

export const analysisCacheService = new AnalysisCacheService();
