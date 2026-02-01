import { ProblemAdminService } from "../services/problem-admin.service";
import { Problem } from "@judgeapp/shared/schemas/problem.schema";
import { AppError } from "../errors/app-error";

/**
 * Admin controller for problem management endpoints
 */
export class ProblemAdminController {
    constructor(private problemAdminService: ProblemAdminService) {}

    /**
     * Get all problems with pagination
     */
    async getAllProblems(limit: number = 20, offset: number = 0) {
        return this.problemAdminService.getAllProblems(limit, offset);
    }

    /**
     * Get problem by ID
     */
    async getProblem(problemId: string) {
        const problem = await this.problemAdminService.getProblemById(problemId);
        if (!problem) {
            throw new AppError("NOT_FOUND", "Problem not found", 404);
        }
        return problem;
    }

    /**
     * Update problem
     */
    async updateProblem(problemId: string, updates: Partial<Problem>) {
        const updated = await this.problemAdminService.updateProblem(
            problemId,
            updates
        );
        if (!updated) {
            throw new AppError("NOT_FOUND", "Problem not found", 404);
        }
        return {
            ...updated,
            message: "Problem updated successfully",
        };
    }

    /**
     * Delete problem
     */
    async deleteProblem(problemId: string) {
        const success = await this.problemAdminService.deleteProblem(problemId);
        if (!success) {
            throw new AppError("NOT_FOUND", "Problem not found", 404);
        }
        return {
            id: problemId,
            message: "Problem deleted successfully",
        };
    }

    /**
     * Get problems by teacher
     */
    async getTeacherProblems(teacherId: string) {
        return this.problemAdminService.getTeacherProblems(teacherId);
    }

    /**
     * Get problem statistics
     */
    async getProblemStats() {
        return this.problemAdminService.getProblemStats();
    }
}
