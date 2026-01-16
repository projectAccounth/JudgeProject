import { SubmissionCommandService } from "../services/submission.command.service";
import { submissionQueue } from "../queue/submission.queue";
import { Submission } from "../domain/submission";

export class SubmissionController {
    constructor(
        private readonly service: SubmissionCommandService
    ) {}

    async create(problemId: string, sourceCode: string, userId: string) {
        const submission =
            await this.service.create(
                problemId,
                userId,
                sourceCode
            );

        await submissionQueue.add("run", {
            submissionId: submission.id
        });

        return {
            id: submission.id,
            status: submission.status
        };
    }

    async get(id: string) {
        const submission = await this.service.getById(id);
        if (!submission) {
            throw new Error("Submission not found");
        }
        return submission;
    }

    async getAll(): Promise<Submission[]> {
        return [...await this.service.getAll()];
    }
}
