import { db } from "../../database/sql";
import { Submission, SubmissionRepository } from "../../domain/submission";

export class SqlSubmissionRepository
    implements SubmissionRepository
{
    async add(submission: Submission): Promise<void> {
        if (!submission.id) {
            throw new Error("Submission.id is required");
        }

        if (!submission.problemId) {
            throw new Error("Submission.problemId is required");
        }

        if (!submission.userId) {
            throw new Error("Submission.userId is required");
        }

        if (!submission.sourceCode) {
            throw new Error("Submission.sourceCode is required");
        }

        if (submission.status !== "PENDING") {
            throw new Error(
                "New submissions must start with status=PENDING"
            );
        }

        await this.create(submission);
    }

    async create(s: Submission): Promise<void> {
        await db.query(
            `
            INSERT INTO submissions (
                id,
                problem_id,
                user_id,
                language,
                source_code,
                status,
                created_at
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            `,
            [
                s.id,
                s.problemId,
                s.userId,
                s.language,
                s.sourceCode,
                s.status,
                s.createdAt
            ]
        );
    }

    async findById(id: string): Promise<Submission | null> {
        const res = await db.query(
            `SELECT * FROM submissions WHERE id = $1`,
            [id]
        );

        if (res.rowCount === 0) {
            return null;
        }

        return mapSubmission(res.rows[0]);
    }

    async getAll(): Promise<Submission[]> {
        const res = await db.query(
            `SELECT * FROM submissions ORDER BY created_at DESC`
        );

        return res.rows.map(mapSubmission);
    }

    async claimPendingBatch(
        limit: number,
        workerId: string
    ): Promise<Submission[]> {
        const res = await db.query(
            `
            UPDATE submissions
            SET status = 'RUNNING',
                started_at = NOW(),
                worker_id = $2
            WHERE id IN (
                SELECT id
                FROM submissions
                WHERE status = 'PENDING'
                ORDER BY created_at ASC
                LIMIT $1
                FOR UPDATE SKIP LOCKED
            )
            RETURNING *
            `,
            [limit, workerId]
        );

        return res.rows.map(mapSubmission);
    }

    async update(s: Submission): Promise<void> {
        await db.query(
            `
            UPDATE submissions
            SET status = $2,
                result = $3,
                started_at = $4,
                finished_at = $5
            WHERE id = $1
            `,
            [
                s.id,
                s.status,
                s.result ?? null,
                s.startedAt ?? null,
                s.finishedAt ?? null
            ]
        );
    }

    async findStuckRunning(timeoutMs: number): Promise<Submission[]> {
        const res = await db.query(
            `
            SELECT *
            FROM submissions
            WHERE status = 'RUNNING'
            AND started_at < NOW() - ($1 * INTERVAL '1 millisecond')
            `,
            [timeoutMs]
        );

        return res.rows.map(mapSubmission);
    }

    async resetToPending(id: string): Promise<void> {
        await db.query(
            `
            UPDATE submissions
            SET status = 'PENDING',
                started_at = NULL,
                worker_id = NULL
            WHERE id = $1
            `,
            [id]
        );
    }

    /**
     * Deletes a single submission.
     * Does not affect others.
     */
    async delete(id: string): Promise<void> {
        const res = await db.query(
            `DELETE FROM submissions WHERE id = $1`,
            [id]
        );

        if (res.rowCount === 0) {
            throw new Error(`Submission ${id} not found`);
        }
    }

    /**
     * Deletes all submissions for a problem.
     * Returns number of deleted rows.
     */
    async deleteByProblem(problemId: string): Promise<number> {
        const res = await db.query(
            `DELETE FROM submissions WHERE problem_id = $1`,
            [problemId]
        );

        return res.rowCount ?? 0;
    }
}

function mapSubmission(row: any): Submission {
    return {
        id: row.id,
        problemId: row.problem_id,
        userId: row.user_id,
        language: row.language,
        sourceCode: row.source_code,
        status: row.status,
        result: row.result ?? undefined,
        createdAt: row.created_at,
        startedAt: row.started_at ?? undefined,
        finishedAt: row.finished_at ?? undefined
    };
}
