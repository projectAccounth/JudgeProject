import { Submission, SubmissionRepository } from "@judgeapp/shared/domain/submission";

export class StatsService {
    constructor(private submissionRepository: SubmissionRepository) {}

    async getAllSubmissions(params?: {
        language?: string;
        verdict?: string;
    }): Promise<Submission[]> {
        // Get all submissions
        const submissions = await this.submissionRepository.getAll();

        let filtered = submissions;

        // Filter by language
        if (params?.language) {
            filtered = filtered.filter((s: Submission) =>
                s.language.toLowerCase() === params.language!.toLowerCase()
            );
        }

        // Filter by verdict
        if (params?.verdict) {
            filtered = filtered.filter((s: Submission) => {
                const verdict = s.status === 'DONE' ? s.result?.status : s.status;
                return verdict === params.verdict;
            });
        }

        return filtered;
    }

    async getSubmissionsByProblem(
        problemId: string,
        params?: {
            language?: string;
            verdict?: string;
        }
    ): Promise<Submission[]> {
        // Get all submissions and filter by problem
        const submissions = await this.submissionRepository.getAll();
        let filtered = submissions.filter((s: Submission) => s.problemId === problemId);

        if (params?.language) {
            filtered = filtered.filter((s: Submission) =>
                s.language.toLowerCase() === params.language!.toLowerCase()
            );
        }

        if (params?.verdict) {
            filtered = filtered.filter((s: Submission) => {
                const verdict = s.status === 'DONE' ? s.result?.status : s.status;
                return verdict === params.verdict;
            });
        }

        return filtered;
    }

    async getUserStats() {
        // Get aggregated stats per user
        const submissions = await this.submissionRepository.getAll();
        
        const userStats: Record<string, {
            userId: string;
            total: number;
            accepted: number;
        }> = {};

        submissions.forEach((s: Submission) => {
            if (!userStats[s.userId]) {
                userStats[s.userId] = {
                    userId: s.userId,
                    total: 0,
                    accepted: 0
                };
            }

            userStats[s.userId].total++;

            if (s.status === 'DONE' && s.result?.status === 'AC') {
                userStats[s.userId].accepted++;
            }
        });

        return Object.values(userStats);
    }

    async getSpecificUserStats(userId: string) {
        // Get stats for a specific user
        const submissions = await this.submissionRepository.getAll();
        const userSubmissions = submissions.filter((s: Submission) => s.userId === userId);

        const total = userSubmissions.length;
        const accepted = userSubmissions.filter((s: Submission) => s.status === 'DONE' && s.result?.status === 'AC').length;
        const failed = userSubmissions.filter((s: Submission) => s.status === 'DONE' && s.result?.status !== 'AC').length;
        const pending = userSubmissions.filter((s: Submission) => s.status !== 'DONE').length;

        return {
            userId,
            total,
            accepted,
            failed,
            pending,
            acceptanceRate: total > 0 ? ((accepted / total) * 100).toFixed(2) : '0.00'
        };
    }
}
