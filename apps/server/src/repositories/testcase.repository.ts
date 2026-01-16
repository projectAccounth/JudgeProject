import { TestCase } from "../domain/testcase";

export interface TestCaseRepository {
    findByTestCaseSet(
        testcaseSetId: string
    ): Promise<TestCase[]>;
    add(problem: TestCase): Promise<void>
}
