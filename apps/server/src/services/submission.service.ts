import { Judge, JudgeTestCase } from "../domain/judge";
import { SubmissionRepository } from "../domain/submission";
import { TestCase } from "../domain/testcase";
import { ProblemRepository } from "../repositories/problem.repository";
import { TestCaseRepository } from "../repositories/testcase.repository";

export class SubmissionExecutionService {
    constructor(
        private readonly submissionRepo: SubmissionRepository,
        private readonly problemRepo: ProblemRepository,
        private readonly testcaseRepo: TestCaseRepository,
        private readonly judge: Judge
    ) {}

    async execute(submissionId: string): Promise<void> {
        const submission =
            await this.submissionRepo.findById(submissionId);

        if (!submission) {
            throw new Error(
                `Submission ${submissionId} not found`
            );
        }

        try {
            const problem =
                await this.problemRepo.findById(
                    submission.problemId
                );

            if (!problem) {
                throw new Error(
                    `Problem ${submission.problemId} not found`
                );
            }

            console.log(
                "Executing submission",
                submission.id
            );

            const testcases =
                await this.testcaseRepo.findByTestCaseSet(
                    problem.testcaseSetId
                );

            const result = await this.judge.run({
                language: submission.language,
                sourceCode: submission.sourceCode,
                limits: {
                    timeMs: problem.timeLimitMs,
                    memoryMb: problem.memoryLimitMb
                },
                testCases: toJudgeTestCases(testcases)
            });

            submission.status = "DONE";
            submission.result = result;
        } catch (err) {
            submission.status = "FAILED";
            console.error(
                "Execution failed for",
                submissionId,
                err
            );

            throw err;
        } finally {
            submission.finishedAt = new Date();
            await this.submissionRepo.update(submission);
        }
    }
}

export function toJudgeTestCases(
    testcases: TestCase[]
): JudgeTestCase[] {
    return testcases
        .filter(tc => tc.visibility !== "SAMPLE")
        .sort((a, b) => a.order - b.order)
        .map(tc => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput
        }));
}
