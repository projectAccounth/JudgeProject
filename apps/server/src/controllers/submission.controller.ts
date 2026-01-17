import { SubmissionCommandService } from "../services/submission.command.service";
import { Submission } from "../domain/submission";
import { Language } from "../utils/types";

export class SubmissionController {
    constructor(
        private readonly service: SubmissionCommandService
    ) {}

    async create(problemId: string, sourceCode: string, userId: string, pLanguage: Language) {
        const submission =
            await this.service.create(
                problemId,
                userId,
                sourceCode,
                pLanguage
            );

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
