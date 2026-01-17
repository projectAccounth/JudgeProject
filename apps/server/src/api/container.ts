import { SubmissionController } from "../controllers/submission.controller";
import { SqlSubmissionRepository } from "../repositories/sql/submission.repository.sql";
import { SubmissionCommandService } from "../services/submission.command.service";

export function createApiContainer() {
    const submissionRepo = new SqlSubmissionRepository();

    const submissionService =
        new SubmissionCommandService(submissionRepo);

    const submissionController =
        new SubmissionController(submissionService);

    return {
        submissionController,
        submissionRepo
    };
}
