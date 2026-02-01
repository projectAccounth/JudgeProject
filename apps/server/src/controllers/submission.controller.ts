import { SubmissionCommandService } from "../services/submission.command.service";
import { Submission } from "@judgeapp/shared/domain/submission"
import { Language } from "@judgeapp/shared/domain/languages"

export class SubmissionController {
    constructor(
        private readonly service: SubmissionCommandService
    ) {}

    private async getRepo() { return this.service.getRepo(); }

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

    async getPaginated(limit: number, after?: Date): Promise<{
        submissions: Submission[],
        nextCursor: Date | null
    }> {
        return (await this.service.getRepo()).getPaginated(limit, after);
    }
}
