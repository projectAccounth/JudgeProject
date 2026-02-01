import { SubmissionRepository } from "@judgeapp/shared/domain/submission";
import { Submission } from "@judgeapp/shared/domain/submission";
import { UserRepository } from "../repositories/user.repository";
import { ProblemRepository } from "../repositories/problem.repository";

/**
 * Admin service for submission management
 * Handles submission operations that only admins can perform
 */
export class SubmissionAdminService {
    constructor(
        private submissionRepo: SubmissionRepository,
        private userRepo: UserRepository,
        private problemRepo: ProblemRepository
    ) {}

    /**
     * Get all submissions (paginated)
     * @param limit The number of submissions to get in 1 page
     * @param offset Offset from origin
     * @param verdict Verdict of the run
     */
    async getAllSubmissions(
        limit: number = 50,
        offset: number = 0,
        verdict?: string
    ): Promise<{
        submissions: Array<{
            id: string;
            userId: string;
            username: string;
            problemId: string;
            problemTitle: string;
            language: string;
            verdict: string;
            createdAt: string;
            timeMs?: number;
            memoryMb?: number;
        }>;
        total: number;
    }> {
        const allSubmissions = await this.submissionRepo.getAll();
        
        let filtered = allSubmissions;
        if (verdict) {
            filtered = filtered.filter(s => {
                const submissionVerdict = s.result?.status || 'PENDING';
                return submissionVerdict === verdict;
            });
        }

        const total = filtered.length;
        const paginated = filtered
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(offset, offset + limit);

        // Enrich with user and problem data
        const enriched = await Promise.all(paginated.map(async (s) => {
            const user = await this.userRepo.findById(s.userId);
            const problem = await this.problemRepo.findById(s.problemId);
            const verdict = s.result?.status || 'PENDING';
            
            return {
                id: s.id,
                userId: s.userId,
                username: user?.username || 'Unknown',
                problemId: s.problemId,
                problemTitle: problem?.title || 'Unknown',
                language: s.language,
                verdict,
                createdAt: s.createdAt.toISOString(),
                timeMs: s.result?.timeMs,
                memoryMb: s.result?.memoryKb ?? 0 / 1024
            };
        }));

        return { submissions: enriched, total };
    }

    /**
     * Get submission by ID with full details
     * @param submissionId The submission ID (UUID)
     */
    async getSubmissionById(submissionId: string) {
        const submission = await this.submissionRepo.findById(submissionId);
        if (!submission) {
            return null;
        }

        const user = await this.userRepo.findById(submission.userId);
        const problem = await this.problemRepo.findById(submission.problemId);

        return {
            ...submission,
            username: user?.username || 'Unknown',
            problemTitle: problem?.title || 'Unknown'
        };
    }

    /**
     * Delete a submission
     * @param submissionId The submission ID.
     */
    async deleteSubmission(submissionId: string): Promise<void> {
        await this.submissionRepo.delete(submissionId);
    }

    /**
     * Get submissions by user
     */
    async getUserSubmissions(userId: string, limit: number = 20, offset: number = 0) {
        const allSubmissions = await this.submissionRepo.getAll();
        const userSubmissions = allSubmissions.filter(s => s.userId === userId);
        
        return {
            submissions: userSubmissions.slice(offset, offset + limit),
            total: userSubmissions.length
        };
    }

    /**
     * Get submissions by problem
     */
    async getProblemSubmissions(problemId: string, limit: number = 20, offset: number = 0) {
        const allSubmissions = await this.submissionRepo.getAll();
        const problemSubmissions = allSubmissions.filter(s => s.problemId === problemId);
        
        return {
            submissions: problemSubmissions.slice(offset, offset + limit),
            total: problemSubmissions.length
        };
    }

    /**
     * Get submission statistics
     */
    async getSubmissionStats() {
        const submissions = await this.submissionRepo.getAll();
        
        const stats = {
            total: submissions.length,
            accepted: submissions.filter(s => s.result?.status === 'AC').length,
            rejected: submissions.filter(s => s.result?.status === 'WA').length,
            pending: submissions.filter(s => !s.result).length,
            timedOut: submissions.filter(s => s.result?.status === 'TLE').length,
            memoryLimitExceeded: submissions.filter(s => s.result?.status === 'MLE').length,
            compilationError: submissions.filter(s => s.result?.status === 'CE').length,
            runtimeError: submissions.filter(s => s.result?.status === 'RE').length
        };

        return stats;
    }
}
