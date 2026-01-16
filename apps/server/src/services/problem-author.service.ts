import crypto from "node:crypto";
import { ProblemRepository } from "../repositories/problem.repository";
import { TestCaseRepository } from "../repositories/testcase.repository";
import { Problem } from "../domain/problem";
import { TestCase } from "../domain/testcase";
import { ProblemAuthorInput } from "../api/dto/problem-author.dto";

export type DuplicatePolicy =
    | "FAIL"
    | "REPLACE";

export class ProblemAuthoringService {
    constructor(
        private readonly problemRepo: ProblemRepository,
        private readonly testcaseRepo: TestCaseRepository
    ) {}

    async addProblem(
        input: ProblemAuthorInput,
        policy: DuplicatePolicy = "FAIL"
    ): Promise<void> {
        const existing = await this.problemRepo.findById(input.id);

        if (existing) {
            if (policy === "FAIL") {
                throw new Error(
                    `Problem with id=${input.id} already exists`
                );
            }

            if (policy === "REPLACE") {
                await this.testcaseRepo.removeByTestCaseSet(
                    existing.testcaseSetId
                );
                await this.problemRepo.removeById(existing.id);
            }
        }

        if (input.testcases.length === 0) {
            throw new Error("Problem must have at least one testcase");
        }

        const testcaseSetId = crypto.randomUUID();
        const now = new Date();

        await this.problemRepo.add({
            id: input.id,
            title: input.title,
            description: input.description,
            difficulty: input.difficulty,
            timeLimitMs: input.limits.timeMs,
            memoryLimitMb: input.limits.memoryMb,
            testcaseSetId,
            createdAt: now,
            updatedAt: now
        });

        let order = 1;
        const seenSamples = new Set<string>();

        for (const tc of input.testcases) {
            if (tc.visibility === "SAMPLE") {
                if (seenSamples.has(tc.input)) {
                    throw new Error("Duplicate SAMPLE testcase input");
                }
                seenSamples.add(tc.input);
            }

            await this.testcaseRepo.add({
                id: crypto.randomUUID(),
                testcaseSetId,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                visibility: tc.visibility,
                order: order++
            });
        }
    }
}
