export type TestCaseVisibility =
    | "SAMPLE"   // shown in problem statement
    | "PUBLIC"   // visible after submission
    | "PRIVATE"; // hidden, judge-only

export interface TestCase {
    id: string;

    testcaseSetId: string;

    input: string;
    expectedOutput: string;

    visibility: TestCaseVisibility;

    order: number;
}
