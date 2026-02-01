import { db } from "../../database/sql";
import { Submission, SubmissionRepository, SubmissionStats } from "@judgeapp/shared/domain/submission";

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

    /**
     * Finds submissions stuck running.
     * @returns A list of invalid submissions.
     */
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

    /**
     * Finds failed submissions.
     * @returns A list of failed submissions.
     */
    async findFailed(): Promise<Submission[]> {
        const res = await db.query(
            `
            SELECT *
            FROM submissions
            WHERE status = 'FAILED'
            `,
        );

        return res.rows.map(mapSubmission);
    }

    /**
     * Recovers a batch of invalid submissions (either failed or stuck at RUNNING)
     * @param timeoutMs The requirement (submission must exists longer than this)
     * @returns A list of recovered submissions.
     */
    async recoverInvalid(timeoutMs: number): Promise<Submission[]> {
        const res = await db.query(
            `
            UPDATE submissions
            SET status = 'PENDING',
                started_at = NULL,
                worker_id = NULL
            WHERE
                (
                    status = 'RUNNING'
                    AND started_at < NOW() - ($1 * INTERVAL '1 millisecond')
                )
                OR status = 'FAILED'
            RETURNING *
            `,
            [timeoutMs]
        );

        return res.rows.map(mapSubmission);
    }


    /**
     * Resets a submission back to PENDING (mostly for rerunning)
     * @param id The submission ID.
     */
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
     * Deletes a submission from the database.
     * @param id The submission ID to delete.
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
     * @param problemId The problem ID.
     * @returns number of deleted rows.
     */
    async deleteByProblem(problemId: string): Promise<number> {
        const res = await db.query(
            `DELETE FROM submissions WHERE problem_id = $1`,
            [problemId]
        );

        return res.rowCount ?? 0;
    }

    async getSubmissionStats(problemId?: string): Promise<SubmissionStats> {
        let query;

        if (problemId) {
            query = 
            `
                
            `
        }
        else {
            query =
            `
                
            `
        }

        return null as any;
    }

    async countRecentByUser(userId: string, windowMs: number): Promise<number> {
        const res = await db.query(
            `
            SELECT COUNT(*) as cnt
            FROM submissions
            WHERE user_id = $1
            AND created_at > NOW() - ($2 * INTERVAL '1 millisecond')
            `,
            [userId, windowMs]
        );

        return Number(res.rows[0]?.cnt ?? 0);
    }

    async getQueueStats() {
        const res = await db.query(`
            SELECT
                COUNT(*) FILTER (WHERE status = 'PENDING') AS pending,
                COUNT(*) FILTER (WHERE status = 'RUNNING') AS running,
                COUNT(*) FILTER (WHERE status = 'FAILED') AS failed
            FROM submissions
        `);

        return res.rows[0];
    }

    async getOldestPending(): Promise<number | null> {
        const res = await db.query(`
            SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) * 1000 AS age
            FROM submissions
            WHERE status = 'PENDING'
            ORDER BY created_at ASC
            LIMIT 1
        `);

        return res.rowCount ? Number(res.rows[0].age) : null;
    }

    async getAvgRuntime(): Promise<number | null> {
        const res = await db.query(`
            SELECT AVG(EXTRACT(EPOCH FROM (finished_at - started_at)) * 1000) AS avg
            FROM submissions
            WHERE status = 'DONE'
            AND finished_at > NOW() - INTERVAL '1 hour'
        `);

        return res.rows[0].avg ?? null;
    }

    /**
     * Gets a page of submissions.
     * @param limit The count of submissions in the given page
     * @param after The time to get the page after.
     * @returns An array, with the submissions list and the cursor for the next page.
     */
    async getPaginated(limit: number, after?: Date): Promise<{
        submissions: Submission[];
        nextCursor: Date | null;
    }> {
        const params: any[] = [limit];
        let query = `
              SELECT * FROM submissions
            WHERE ($2::timestamp IS NULL OR created_at < $2)
            ORDER BY created_at DESC
            LIMIT $1
        `;

        if (after) {
            params.push(after);
        } else {
            params.push(null);
        }

        const res = await db.query(query, params);
        const submissions = res.rows.map(mapSubmission);

        // cursor is the createdAt of the last item in this page
        const nextCursor =
            submissions.length > 0 ? submissions[submissions.length - 1].createdAt : null;

        return { submissions, nextCursor };
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
