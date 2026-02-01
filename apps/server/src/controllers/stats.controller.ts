import { Submission } from "@judgeapp/shared/domain/submission";

export class StatsController {
    constructor(private submissionService: any) {}

    async getGlobalStats(params?: {
        language?: string;
        verdict?: string;
        since?: string;
        until?: string;
        limit?: number;
    }) {
        // Get all submissions or filtered
        const submissions = await this.submissionService.getAllSubmissions(params);

        // Calculate statistics
        const total = submissions.length;
        const byStatus: Record<string, number> = {};
        const byLanguage: Record<string, number> = {};
        const byVerdict: Record<string, number> = {};

        let totalTime = 0;
        let totalMemory = 0;
        let fastestTime = Infinity;
        let peakMemory = 0;

        submissions.forEach((s: Submission) => {
            // Count by status
            byStatus[s.status] = (byStatus[s.status] || 0) + 1;

            // Count by language
            byLanguage[s.language] = (byLanguage[s.language] || 0) + 1;

            // Count by verdict (if done)
            if (s.status === 'DONE') {
                const verdict = s.result?.status || 'UNKNOWN';
                byVerdict[verdict] = (byVerdict[verdict] || 0) + 1;
            }

            // Track timing/memory stats
            if (s.result?.timeMs) {
                totalTime += s.result.timeMs;
                fastestTime = Math.min(fastestTime, s.result.timeMs);
            }
            if (s.result?.memoryKb) {
                totalMemory += s.result.memoryKb;
                peakMemory = Math.max(peakMemory, s.result.memoryKb);
            }
        });

        const acceptedCount = byVerdict['AC'] || 0;
        const acceptanceRate = total > 0 ? (acceptedCount / total * 100).toFixed(2) : '0.00';

        return {
            total,
            accepted: acceptedCount,
            rejected: total - acceptedCount,
            acceptanceRate: parseFloat(acceptanceRate),
            byStatus,
            byLanguage,
            byVerdict,
            performance: {
                avgTime: total > 0 ? (totalTime / total).toFixed(2) : 0,
                fastestTime: fastestTime === Infinity ? 0 : fastestTime,
                totalTime,
                avgMemory: total > 0 ? (totalMemory / total).toFixed(2) : 0,
                peakMemory,
            }
        };
    }

    async getProblemStats(problemId: string, params?: {
        language?: string;
        verdict?: string;
    }) {
        // Get submissions for this problem
        const submissions = await this.submissionService.getSubmissionsByProblem(
            problemId,
            params
        );

        const total = submissions.length;
        const byStatus: Record<string, number> = {};
        const byLanguage: Record<string, number> = {};
        const byVerdict: Record<string, number> = {};
        const userIds = new Set<string>();

        let totalTime = 0;
        let totalMemory = 0;
        let fastestTime = Infinity;

        submissions.forEach((s: Submission) => {
            userIds.add(s.userId);
            byStatus[s.status] = (byStatus[s.status] || 0) + 1;
            byLanguage[s.language] = (byLanguage[s.language] || 0) + 1;

            if (s.status === 'DONE') {
                const verdict = s.result?.status || 'UNKNOWN';
                byVerdict[verdict] = (byVerdict[verdict] || 0) + 1;
            }

            if (s.result?.timeMs) {
                totalTime += s.result.timeMs;
                fastestTime = Math.min(fastestTime, s.result.timeMs);
            }
            if (s.result?.memoryKb) {
                totalMemory += s.result.memoryKb;
            }
        });

        const acceptedCount = byVerdict['AC'] || 0;
        const acceptanceRate = total > 0 ? (acceptedCount / total * 100).toFixed(2) : '0.00';

        return {
            problemId,
            totalSubmissions: total,
            uniqueUsers: userIds.size,
            accepted: acceptedCount,
            rejected: total - acceptedCount,
            acceptanceRate: parseFloat(acceptanceRate),
            byStatus,
            byLanguage,
            byVerdict,
            performance: {
                avgTime: total > 0 ? (totalTime / total).toFixed(2) : 0,
                fastestTime: fastestTime === Infinity ? 0 : fastestTime,
                avgMemory: total > 0 ? (totalMemory / total).toFixed(2) : 0,
            }
        };
    }

    async getLeaderboard(limit: number = 10) {
        // Get top users by accepted submissions
        const stats = await this.submissionService.getUserStats();
        
        return stats
            .sort((a: any, b: any) => b.accepted - a.accepted)
            .slice(0, limit)
            .map((s: any, index: number) => ({
                rank: index + 1,
                userId: s.userId,
                username: s.username,
                accepted: s.accepted,
                submissions: s.total,
                acceptanceRate: s.total > 0 ? (s.accepted / s.total * 100).toFixed(2) : '0.00'
            }));
    }

    async getUserStats(userId: string) {
        return await this.submissionService.getSpecificUserStats(userId);
    }
}
