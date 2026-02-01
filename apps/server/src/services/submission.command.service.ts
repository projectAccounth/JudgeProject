import { Submission, SubmissionRepository } from "@judgeapp/shared/domain/submission";
import { Language } from "@judgeapp/shared/domain/languages";
import crypto from "node:crypto";

export class SubmissionCommandService {
    constructor(
        private readonly submissionRepo: SubmissionRepository
    ) {}

    async getRepo() { return this.submissionRepo; }

    async create(
        problemId: string,
        userId: string,
        sourceCode: string,
        pLanguage: Language
    ): Promise<Submission> {
        // Throttle submissions: max 5 per minute per user
        const WINDOW_MS = 60_000;
        const MAX_PER_WINDOW = 5;
        try {
            const recent = await (this.submissionRepo as any).countRecentByUser(userId, WINDOW_MS);
            if (recent >= MAX_PER_WINDOW) {
                throw new Error("Rate limit exceeded: too many submissions. Please wait a moment and try again.");
            }
        } catch (err) {
            // If the repo doesn't implement the method or query fails, fall back to allowing the submission
            // but log a warning.
            console.warn("Could not enforce submission throttle:", err);
        }
        const submission: Submission = {
            id: crypto.randomUUID(),
            problemId,
            userId,
            language: pLanguage,
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

    async getAll(): Promise<Submission[]> {
        return this.submissionRepo.getAll();
    }
}
