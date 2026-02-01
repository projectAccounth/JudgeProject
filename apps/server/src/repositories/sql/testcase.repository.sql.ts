import { format } from "node-pg-format";
import { db } from "../../database/sql";
import { TestCase } from "@judgeapp/shared/domain/testcase";
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
        if (!testcase) return;
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

    async findHighestOrderByTestCaseSet(
        testcaseSetId: string
    ): Promise<TestCase | null> {
        const res = await db.query(
            `
            SELECT *
            FROM testcases
            WHERE testcase_set_id = $1
            ORDER BY ordering DESC
            LIMIT 1
            `,
            [testcaseSetId]
        );

        if (res.rows.length === 0) {
            return null;
        }

        return mapTestCase(res.rows[0]);
    }

    async findMaxOrderByTestCaseSet(
        testcaseSetId: string
    ): Promise<number | null> {
        const res = await db.query(
            `
            SELECT MAX(ordering) AS max_order
            FROM testcases
            WHERE testcase_set_id = $1
            `,
            [testcaseSetId]
        );

        return res.rows[0].max_order ?? null;
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

    async getOfVisibility(testcaseSetId: string, visibility: string): Promise<TestCase[] | null> {
        const res = await db.query(`
            SELECT * FROM testcases
            WHERE testcase_set_id = $1 AND visibility = $2
        `,
        [testcaseSetId, visibility]);

        return res.rows.map(mapTestCase);
    }

    async getSamples(testcaseSetId: string): Promise<TestCase[] | null> {
        return this.getOfVisibility(testcaseSetId, "SAMPLE");
    }

    async getTestcases(testcaseSetId: string): Promise<TestCase[] | null> {
        const res = await db.query(
            `
                SELECT * FROM testcases
                WHERE testcase_set_id = $1;
            `,
            [testcaseSetId]
        );

        return res.rows.map(mapTestCase);
    }

    async upsertTestCases(testCases: TestCase[]): Promise<void> {
        if (!testCases || testCases.length === 0) return;
        const values = testCases.map(tc => [
            tc.id, 
            tc.testcaseSetId, 
            tc.input, 
            tc.expectedOutput, 
            tc.visibility, 
            tc.order
        ]);
        
        const query = format(
            `INSERT INTO testcases (id, testcase_set_id, input, expected_output, visibility, ordering)
            VALUES %L
            ON CONFLICT (id) DO UPDATE SET 
                testcase_set_id = EXCLUDED.testcase_set_id,
                input           = EXCLUDED.input,
                expected_output = EXCLUDED.expected_output,
                visibility      = EXCLUDED.visibility,
                ordering        = EXCLUDED.ordering;`,
            values
        );

        try {
            const res = await db.query(query);
            console.log(`Processed ${res.rowCount} rows.`);
        } catch (err: any) {
            console.error('Error executing bulk upsert', err.stack);
        }
    }

    async overrideTestCases(
        testcaseSetId: string,
        newTestCases: TestCase[]
    ): Promise<void> {
        if (!newTestCases || newTestCases.length === 0) return;
        // Get existing test cases
        const existingTestCases = await this.getTestcases(testcaseSetId);
        
        // Get IDs of new test cases
        const newTestCaseIds = new Set(newTestCases.map(tc => tc.id));
        
        // Find test cases to remove (exist in database but not in new data)
        if (existingTestCases) {
            const testCasesToRemove = existingTestCases.filter(
                tc => !newTestCaseIds.has(tc.id)
            );
            
            // Remove test cases that are not in the new set
            for (const tc of testCasesToRemove) {
                await this.removeById(tc.id);
            }
        }
        
        // Upsert all new test cases (insert or update)
        if (newTestCases.length > 0) {
            await this.upsertTestCases(newTestCases);
        }
    }

    async removeList(caseIds: string[]): Promise<void> {
        if (!caseIds || caseIds.length === 0) return;

        const query = 'DELETE FROM testcases WHERE id = ANY($1) RETURNING id;';
        
        try {
            const res = await db.query(query, [caseIds]);
            console.log(`Deleted ${res.rowCount} test cases.`);
        } catch (err) {
            console.error('Error in editor deletion:', err);
            throw err;
        }
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
