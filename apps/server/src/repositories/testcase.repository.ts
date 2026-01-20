import { TestCase } from "../domain/testcase";

export interface TestCaseRepository {
    findByTestCaseSet(
        testcaseSetId: string
    ): Promise<TestCase[]>;
    add(problem: TestCase): Promise<void>
    removeById(id: string): Promise<void>;
    removeByTestCaseSet(
        testcaseSetId: string
    ): Promise<void>;
    removeAll(): Promise<void>;
    findHighestOrderByTestCaseSet(
        testcaseSetId: string
    ): Promise<TestCase | null>;
    findMaxOrderByTestCaseSet(
        testcaseSetId: string
    ): Promise<number | null>;
}
