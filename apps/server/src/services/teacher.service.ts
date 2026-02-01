import { ProblemRepository } from "../repositories/problem.repository";
import { SubmissionRepository } from "@judgeapp/shared/domain/submission";
import { AppError } from "../errors/app-error";

/**
 * Service for teacher-specific operations
 * Teachers can manage their own problems and view student submissions
 */
export class TeacherService {
    constructor(
        private problemRepo: ProblemRepository,
        private submissionRepo: SubmissionRepository
    ) {}

    /**
     * Get problems created by a teacher
     */
    async getTeacherProblems(teacherId: string) {
        const allProblems = await this.problemRepo.getAll();
        
        // Filter problems created by this teacher
        // We'll assume problems have an authorId or createdBy field
        const teacherProblems = allProblems.filter((p: any) => {
            return p.authorId === teacherId || p.createdBy === teacherId;
        });

        // Enrich with submission stats
        const enriched = await Promise.all(
            teacherProblems.map(async (p: any) => {
                const allSubmissions = await this.submissionRepo.getAll();
                const problemSubmissions = allSubmissions.filter(s => s.problemId === p.id);
                const accepted = problemSubmissions.filter(s => s.result?.status === 'AC').length;

                return {
                    id: p.id,
                    title: p.title,
                    difficulty: p.difficulty,
                    createdAt: p.createdAt,
                    submissionCount: problemSubmissions.length,
                    acceptedCount: accepted
                };
            })
        );

        return { problems: enriched };
    }

    /**
     * Get submissions for problems created by a teacher
     */
    async getTeacherSubmissions(teacherId: string, limit: number = 50, offset: number = 0) {
        const allProblems = await this.problemRepo.getAll();
        const teacherProblems = allProblems.filter((p: any) => {
            return p.authorId === teacherId || p.createdBy === teacherId;
        });

        const allSubmissions = await this.submissionRepo.getAll();
        
        // Filter submissions for teacher's problems
        const teacherSubmissions = allSubmissions.filter(s =>
            teacherProblems.some((p: any) => p.id === s.problemId)
        );

        const total = teacherSubmissions.length;
        const paginated = teacherSubmissions
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(offset, offset + limit);

        return {
            submissions: paginated.map(s => ({
                id: s.id,
                userId: s.userId,
                problemId: s.problemId,
                language: s.language,
                verdict: s.result?.status || 'PENDING',
                createdAt: s.createdAt
            })),
            total
        };
    }

    /**
     * Get analytics for a teacher's problems
     */
    async getTeacherAnalytics(teacherId: string) {
        const allProblems = await this.problemRepo.getAll();
        const teacherProblems = allProblems.filter((p: any) => {
            return p.authorId === teacherId || p.createdBy === teacherId;
        });

        const allSubmissions = await this.submissionRepo.getAll();
        const teacherSubmissions = allSubmissions.filter(s =>
            teacherProblems.some((p: any) => p.id === s.problemId)
        );

        return {
            totalProblems: teacherProblems.length,
            totalSubmissions: teacherSubmissions.length,
            accepted: teacherSubmissions.filter(s => s.result?.status === 'AC').length,
            rejected: teacherSubmissions.filter(s => s.result?.status === 'WA').length,
            pending: teacherSubmissions.filter(s => !s.result).length,
            avgAcceptanceRate: teacherSubmissions.length > 0
                ? (teacherSubmissions.filter(s => s.result?.status === 'AC').length / teacherSubmissions.length * 100).toFixed(1)
                : 0
        };
    }

    /**
     * Get submissions for a specific problem
     */
    async getProblemSubmissions(problemId: string, teacherId: string, limit: number = 50, offset: number = 0) {
        // Verify teacher owns the problem
        const problem = await this.problemRepo.findById(problemId);
        if (!problem || ((problem as any).authorId !== teacherId && (problem as any).createdBy !== teacherId)) {
            throw new AppError("FORBIDDEN", "Unauthorized: You don't own this problem", 403);
        }

        const allSubmissions = await this.submissionRepo.getAll();
        const problemSubmissions = allSubmissions.filter(s => s.problemId === problemId);

        const total = problemSubmissions.length;
        const paginated = problemSubmissions
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(offset, offset + limit);

        return {
            submissions: paginated.map(s => ({
                id: s.id,
                userId: s.userId,
                language: s.language,
                verdict: s.result?.status || 'PENDING',
                timeMs: s.result?.timeMs,
                memoryMb: s.result?.memoryKb || 0,
                createdAt: s.createdAt
            })),
            total
        };
    }
}
