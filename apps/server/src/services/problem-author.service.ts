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
                throw new Error(`Problem with id=${input.id} already exists`);
            }

            await this.testcaseRepo.removeByTestCaseSet(
                existing.testcaseSetId
            );
            await this.problemRepo.removeById(existing.id);
        }

        this.assertHasTestcases(input);

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

        await this.insertTestcases(
            testcaseSetId,
            input.testcases,
            1
        );
    }

    async addTestCase(
        input: Pick<ProblemAuthorInput, "id" | "testcases">
    ): Promise<void> {
        const existing = await this.problemRepo.findById(input.id);

        if (!existing) {
            throw new Error(
                `Problem with id=${input.id} does not exist`
            );
        }

        this.assertHasTestcases(input);

        const startOrder =
            (await this.testcaseRepo.findMaxOrderByTestCaseSet(
                existing.testcaseSetId
            )) ?? 0;

        await this.insertTestcases(
            existing.testcaseSetId,
            input.testcases,
            startOrder + 1
        );
    }

    private assertHasTestcases(
        input: { testcases: unknown[] }
    ): void {
        if (input.testcases.length === 0) {
            throw new Error(
                "Problem must have at least one testcase"
            );
        }
    }

    private async insertTestcases(
        testcaseSetId: string,
        testcases: ProblemAuthorInput["testcases"],
        startingOrder: number
    ): Promise<void> {
        let order = startingOrder;
        const seenSampleInputs = new Set<string>();

        for (const tc of testcases) {
            if (tc.visibility === "SAMPLE") {
                if (seenSampleInputs.has(tc.input)) {
                    throw new Error(
                        "Duplicate SAMPLE testcase input"
                    );
                }
                seenSampleInputs.add(tc.input);
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
