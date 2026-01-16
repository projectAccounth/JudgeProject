import { Submission, SubmissionRepository } from "../domain/submission";

export class SubmissionCommandService {
    constructor(
        private readonly submissionRepo: SubmissionRepository
    ) {}

    async create(
        problemId: string,
        userId: string,
        sourceCode: string
    ): Promise<Submission> {
        const submission: Submission = {
            id: crypto.randomUUID(),
            problemId,
            userId,
            language: "python",
            sourceCode,
            status: "PENDING",
            createdAt: new Date()
        };

        await this.submissionRepo.add(submission);
        return submission;
    }

    async getById(id: string): Promise<Submission | null> {
        return this.submissionRepo.findById(id);
    }

    async getAll() {
        return this.submissionRepo.getAll();
    }
}
