import { ProblemAuthorInput } from "@judgeapp/shared/api/dto/problem-author.dto";
import { db } from "../../database/sql";
import { Problem } from "@judgeapp/shared/domain/problem";
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
                created_at, updated_at,
                statement,
                tags,
                category
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
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
                problem.updatedAt,
                problem.statement,
                problem.tags || [],
                problem.category || []
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

    async getAll(): Promise<Problem[]> {
        const res = await db.query(
            `
                SELECT * FROM problems;
            `);

        
        return res.rows.map(mapProblem);
    }
    
    /**
     * Gets a page of problems.
     * @param limit The count of problems in the given page
     * @param after The time to get the page after.
     * @returns An array, with the problem list and the cursor for the next page.
     */
    async getPaginated(limit: number, after?: Date, since?: Date): Promise<{
        problems: Problem[];
        nextCursor: Date | null;
    }> {
        const params: any[] = [limit];
        let query: string;

        if (since) {
            params.push(after || null);
            params.push(since);
            query = `
                (SELECT * FROM problems WHERE created_at > $3 ORDER BY created_at DESC LIMIT $1)
                UNION
                (SELECT * FROM problems WHERE ($2::timestamp IS NULL OR created_at < $2) ORDER BY created_at DESC LIMIT $1)
                ORDER BY created_at DESC
                LIMIT $1
            `;
        } else {
            params.push(after || null); // $2
            query = `
                SELECT * FROM problems
                WHERE ($2::timestamp IS NULL OR created_at < $2)
                ORDER BY created_at DESC
                LIMIT $1
            `;
        }

        const res = await db.query(query, params);
        const problems = res.rows.map(mapProblem);

        // cursor is the createdAt of the last item in this page
        const nextCursor =
            problems.length > 0 ? problems[problems.length - 1].createdAt : null;

        return { problems, nextCursor };
    }

    async modifyProblem(problem: ProblemAuthorInput): Promise<void> {
        await db.query(
            `
                UPDATE problems
                SET id = $1,
                    title = $2, 
                    description = $3,
                    statement = $4,
                    difficulty = $5,
                    time_limit_ms = $6, 
                    memory_limit_mb = $7,
                    tags = $8,
                    category = $9,
                    updated_at = $10
                WHERE id = $1;
            `,
            [
                problem.id,
                problem.title,
                problem.description,
                problem.statement,
                problem.difficulty,
                problem.limits.timeMs,
                problem.limits.memoryMb,
                problem.tags || [],
                problem.category || [],
                new Date()
            ]
        );
    }

    async createPrivateProblem(problem: Problem, contestId: string): Promise<void> {
        if (!problem.id) {
            throw new Error("Problem.id is required");
        }

        await db.query(
            `
            INSERT INTO problems (
                id, title, description,
                difficulty,
                time_limit_ms, memory_limit_mb,
                testcase_set_id,
                created_at, updated_at,
                statement,
                tags,
                category,
                is_private,
                contest_id
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true,$13)
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
                problem.updatedAt,
                problem.statement,
                problem.tags || [],
                problem.category || [],
                contestId
            ]
        );
    }

    async getPrivateProblemsForContest(contestId: string): Promise<Problem[]> {
        const res = await db.query(
            `SELECT * FROM problems WHERE contest_id = $1 AND is_private = true ORDER BY created_at DESC`,
            [contestId]
        );
        return res.rows.map(mapProblem);
    }

    async publishPrivateProblem(problemId: string): Promise<void> {
        await db.query(
            `UPDATE problems SET is_private = false, published_at = $1 WHERE id = $2`,
            [new Date(), problemId]
        );
    }

    async getByContestId(contestId: string): Promise<Problem[]> {
        const res = await db.query(
            `SELECT * FROM problems WHERE contest_id = $1 ORDER BY created_at DESC`,
            [contestId]
        );
        return res.rows.map(mapProblem);
    }
}

function mapProblem(row: any): Problem {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        statement: row.statement,
        difficulty: row.difficulty,
        timeLimitMs: row.time_limit_ms,
        memoryLimitMb: row.memory_limit_mb,
        testcaseSetId: row.testcase_set_id,
        tags: row.tags || [],
        category: row.category || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isPrivate: row.is_private || false,
        contestId: row.contest_id || null,
        publishedAt: row.published_at || null
    };
}
