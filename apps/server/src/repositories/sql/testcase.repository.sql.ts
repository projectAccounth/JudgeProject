import { db } from "../../database/sql";
import { TestCase } from "../../domain/testcase";
import { TestCaseRepository } from "../testcase.repository";

export class SqlTestCaseRepository
    implements TestCaseRepository
{
    async add(testcase: TestCase): Promise<void> {
        if (!testcase.id) {
            throw new Error("TestCase.id is required");
        }

        if (!testcase.testcaseSetId) {
            throw new Error("TestCase.testcaseSetId is required");
        }

        await this.create(testcase);
    }

    async create(testcase: TestCase): Promise<void> {
        await db.query(
            `
            INSERT INTO testcases (
                id,
                testcase_set_id,
                input,
                expected_output,
                visibility,
                ordering
            )
            VALUES ($1,$2,$3,$4,$5,$6)
            `,
            [
                testcase.id,
                testcase.testcaseSetId,
                testcase.input,
                testcase.expectedOutput,
                testcase.visibility,
                testcase.order
            ]
        );
    }

    async findByTestCaseSet(
        testcaseSetId: string
    ): Promise<TestCase[]> {
        const res = await db.query(
            `
            SELECT *
            FROM testcases
            WHERE testcase_set_id = $1
            ORDER BY ordering ASC
            `,
            [testcaseSetId]
        );

        return res.rows.map(mapTestCase);
    }
    
    async removeById(id: string): Promise<void> {
        await db.query(
            `DELETE FROM testcases WHERE id = $1`,
            [id]
        );
    }

    async removeByTestCaseSet(
        testcaseSetId: string
    ): Promise<void> {
        await db.query(
            `DELETE FROM testcases WHERE testcase_set_id = $1`,
            [testcaseSetId]
        );
    }

    async removeAll(): Promise<void> {
        await db.query(`DELETE FROM testcases`);
    }
}

function mapTestCase(row: any): TestCase {
    return {
        id: row.id,
        testcaseSetId: row.testcase_set_id,
        input: row.input,
        expectedOutput: row.expected_output,
        visibility: row.visibility,
        order: row.ordering
    };
}
