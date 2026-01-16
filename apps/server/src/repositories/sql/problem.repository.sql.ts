import { db } from "../../database/sql";
import { Problem } from "../../domain/problem";
import { ProblemRepository } from "../problem.repository";

export class SqlProblemRepository
    implements ProblemRepository
{
    async add(problem: Problem): Promise<void> {
        if (!problem.id) {
            throw new Error("Problem.id is required");
        }

        if (!problem.title) {
            throw new Error("Problem.title is required");
        }

        const exists = await this.findById(problem.id);
        if (exists) {
            throw new Error(
                `Problem with id=${problem.id} already exists`
            );
        }

        await this.create(problem);
    }

    async create(problem: Problem): Promise<void> {
        await db.query(
            `
            INSERT INTO problems (
                id, title, description,
                difficulty,
                time_limit_ms, memory_limit_mb,
                testcase_set_id,
                created_at, updated_at
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            `,
            [
                problem.id,
                problem.title,
                problem.description,
                problem.difficulty,
                problem.timeLimitMs,
                problem.memoryLimitMb,
                problem.testcaseSetId,
                problem.createdAt,
                problem.updatedAt
            ]
        );
    }

    async findById(id: string): Promise<Problem | null> {
        const res = await db.query(
            `SELECT * FROM problems WHERE id = $1`,
            [id]
        );

        if (res.rowCount === 0) {
            return null;
        }

        return mapProblem(res.rows[0]);
    }

    async removeById(id: string): Promise<void> {
        await db.query(
            `DELETE FROM problems WHERE id = $1`,
            [id]
        );
    }

    async removeAll(): Promise<void> {
        await db.query(`DELETE FROM problems`);
    }
}

function mapProblem(row: any): Problem {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        difficulty: row.difficulty,
        timeLimitMs: row.time_limit_ms,
        memoryLimitMb: row.memory_limit_mb,
        testcaseSetId: row.testcase_set_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}
