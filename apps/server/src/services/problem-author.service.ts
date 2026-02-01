import crypto from "node:crypto";
import { ProblemRepository } from "../repositories/problem.repository";
import { TestCaseRepository } from "../repositories/testcase.repository";
import { ProblemAuthorInput } from "@judgeapp/shared/api/dto/problem-author.dto";

export type DuplicatePolicy =
    | "FAIL"
    | "REPLACE";

export class ProblemAuthoringService {
    constructor(
        private readonly problemRepo: ProblemRepository,
        private readonly testcaseRepo: TestCaseRepository
    ) {}

    async getProblemRepo(): Promise<ProblemRepository> { return this.problemRepo; }
    async getTestcaseRepo(): Promise<TestCaseRepository> { return this.testcaseRepo; }

    /**
     * Adds a problem to the database if possible.
     * @param input The problem data.
     * @param policy The duplicate policy. FAIL for failure on duplicate, REPLACE otherwise. 
     */
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

        const testcaseSetId = crypto.randomUUID();
        const now = new Date();

        await this.problemRepo.add({
            id: input.id,
            title: input.title,
            statement: input.statement ?? "",
            description: input.description,
            difficulty: input.difficulty,
            timeLimitMs: input.limits.timeMs,
            memoryLimitMb: input.limits.memoryMb,
            tags: input.tags ?? [],
            category: input.category ?? [],
            testcaseSetId,
            createdAt: now,
            updatedAt: now
        });

        if (!this.hasTestCases(input)) return;

        await this.insertTestcases(
            testcaseSetId,
            input.testcases,
            1
        );
    }


    /**
     * Modifies a problem with the specified input.
     * @param input The problem input.
     * @note This does not add test cases.
     */
    async modifyProblem(
        input: ProblemAuthorInput
    ): Promise<void> {
        const existing = await this.problemRepo.findById(input.id);

        if (!existing) {
            throw new Error(
                `Problem with id=${input.id} does not exist`
            );
        }

        await this.problemRepo.modifyProblem(input);
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
        if (!this.hasTestCases(input)) {
            throw new Error(
                "Problem must have at least one testcase"
            );
        }
    }

    private hasTestCases(
        input: { testcases: unknown[] }
    ): boolean {
        return input.testcases.length !== 0;
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
