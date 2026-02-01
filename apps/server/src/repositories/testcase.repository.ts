import { TestCase } from "@judgeapp/shared/domain/testcase";

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
    getOfVisibility(
        testcaseSetId: string, 
        visibility: string
    ): Promise<TestCase[] | null>;
    getSamples(
        testcaseSetId: string
    ): Promise<TestCase[] | null>;
    getTestcases(
        testcaseSetId: string
    ): Promise<TestCase[] | null>;
    upsertTestCases(
        testCases: TestCase[]
    ): Promise<void>;
    removeList(
        caseIds: string[]
    ): Promise<void>;
    overrideTestCases(
        testcaseSetId: string,
        newTestCases: TestCase[]
    ): Promise<void>;
}
