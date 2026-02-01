/**
 * SQL queries for cache operations
 */
export const CACHE_QUERIES = {
    // Get cached entry if not expired
    GET: `
    SELECT data FROM analysis_cache 
    WHERE cache_key = $1 
    AND expires_at > NOW()
    `,

    // Store or update cache entry (24 hours TTL)
    SET: `
    INSERT INTO analysis_cache (cache_key, data, expires_at)
    VALUES ($1, $2, NOW() + INTERVAL '24 hours')
    ON CONFLICT (cache_key) DO UPDATE SET
        data = EXCLUDED.data,
        expires_at = EXCLUDED.expires_at,
        hit_count = analysis_cache.hit_count + 1; 
    `,

    // Increment hit counter on retrieval
    INCREMENT_HITS: `
    UPDATE analysis_cache 
    SET hit_count = hit_count + 1
    WHERE cache_key = $1
    `,

    // Delete expired entries
    CLEANUP: `
    DELETE FROM analysis_cache 
    WHERE expires_at <= NOW()
    `,

    // Get cache stats
    STATS: `
    SELECT 
        COUNT(*) as total_entries,
        SUM(hit_count) as total_hits,
        COUNT(*) FILTER (WHERE expires_at > NOW()) as active_entries
    FROM analysis_cache
    `,
};
