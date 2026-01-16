import { TestCaseSet } from "../domain/testcase-set";

export interface TestCaseSetRepository {
    findById(id: string): Promise<TestCaseSet | null>;
}
