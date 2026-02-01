import { Problem } from "@judgeapp/shared/schemas/problem.schema";
import { ProblemAuthorInput } from "@judgeapp/shared/api/dto/problem-author.dto";
import { ProblemRepository } from "../repositories/problem.repository";
import { UserRole } from "../domain/user";

/**
 * Problem admin service for problem management
 * Handles problem CRUD operations
 */
export class ProblemAdminService {
    constructor(private problemRepo: ProblemRepository) {}

    /**
     * Get all problems (admin view - includes unpublished)
     */
    async getAllProblems(
        limit: number = 20,
        offset: number = 0
    ): Promise<{ problems: Problem[]; total: number }> {
        const problems = await this.problemRepo.getAll();
        const total = problems.length;
        const paginated = problems.slice(offset, offset + limit);
        return { problems: paginated as any, total };
    }

    /**
     * Get problem by ID (admin can see all, including unpublished)
     */
    async getProblemById(problemId: string): Promise<Problem | null> {
        return this.problemRepo.findById(problemId) as Promise<Problem | null>;
    }

    /**
     * Update problem
     */
    async updateProblem(
        problemId: string,
        updates: Partial<Problem>
    ): Promise<Problem | null> {
        const problem = await this.problemRepo.findById(problemId);
        if (!problem) return null;

        // Merge updates
        const updated = { ...problem, ...updates };
        
        // Convert to ProblemAuthorInput format for database update
        // Note: testcases are not included in admin updates via this endpoint
        // Use problem-author service for testcase modifications
        const authorInput: ProblemAuthorInput = {
            id: updated.id,
            title: updated.title,
            description: updated.description,
            statement: updated.statement,
            difficulty: updated.difficulty,
            limits: {
                timeMs: updated.timeLimitMs,
                memoryMb: updated.memoryLimitMb
            },
            testcases: [],
            tags: updated.tags,
            category: updated.category
        };
        
        // Update in database using modifyProblem
        await this.problemRepo.modifyProblem(authorInput);
        
        return updated as Problem;
    }

    /**
     * Delete problem
     */
    async deleteProblem(problemId: string): Promise<boolean> {
        await this.problemRepo.removeById(problemId);
        return true;
    }

    /**
     * Get problems authored by a teacher
     * Note: Problem schema doesn't currently include authorId field
     * This would need to be added to properly track problem authorship
     */
    async getTeacherProblems(teacherId: string): Promise<Problem[]> {
        // TODO: Add authorId field to Problem domain to properly track authorship
        // For now, return empty array as we can't filter without the field
        return [];
    }

    /**
     * Get problem statistics
     */
    async getProblemStats() {
        const all = await this.problemRepo.getAll();
        return {
            totalProblems: all.length,
            byDifficulty: {
                easy: all.filter(p => p.difficulty === "EASY").length,
                medium: all.filter(p => p.difficulty === "MEDIUM").length,
                hard: all.filter(p => p.difficulty === "HARD").length,
            },
        };
    }
}
