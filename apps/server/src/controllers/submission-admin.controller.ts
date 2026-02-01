import { SubmissionAdminService } from "../services/submission-admin.service";
import { AppError } from "../errors/app-error";

/**
 * Admin controller for submission management endpoints
 */
export class SubmissionAdminController {
    constructor(private submissionAdminService: SubmissionAdminService) {}

    /**
     * Get all submissions with pagination and filtering
     */
    async getAllSubmissions(limit: number = 50, offset: number = 0, verdict?: string) {
        return this.submissionAdminService.getAllSubmissions(limit, offset, verdict);
    }

    /**
     * Get submission by ID
     */
    async getSubmission(submissionId: string) {
        const submission = await this.submissionAdminService.getSubmissionById(submissionId);
        if (!submission) {
            throw new AppError("NOT_FOUND", "Submission not found", 404);
        }
        return submission;
    }

    /**
     * Delete a submission
     */
    async deleteSubmission(submissionId: string) {
        await this.submissionAdminService.deleteSubmission(submissionId);
        return { success: true };
    }

    /**
     * Get user submissions
     */
    async getUserSubmissions(userId: string, limit: number = 20, offset: number = 0) {
        return this.submissionAdminService.getUserSubmissions(userId, limit, offset);
    }

    /**
     * Get problem submissions
     */
    async getProblemSubmissions(problemId: string, limit: number = 20, offset: number = 0) {
        return this.submissionAdminService.getProblemSubmissions(problemId, limit, offset);
    }

    /**
     * Get submission statistics
     */
    async getSubmissionStats() {
        return this.submissionAdminService.getSubmissionStats();
    }
}
