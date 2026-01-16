import { TestCase } from "../domain/testcase";

export interface TestCaseRepository {
    findByTestCaseSet(
        testcaseSetId: string
    ): Promise<TestCase[]>;
}
