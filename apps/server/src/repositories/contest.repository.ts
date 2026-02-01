import { db } from "../database/sql";
import { Contest, ContestProblem, ContestParticipant, ContestStatus } from "@judgeapp/shared/domain/contest";
import { randomUUID } from "crypto";

export class ContestRepository {
    async findAll(isPublic: boolean = true, limit: number = 50, offset: number = 0): Promise<Contest[]> {
        const result = await db.query(
            `SELECT id, name, description, starts_at, ends_at, is_public, created_by, created_at
            FROM contests
            WHERE is_public = $1
            ORDER BY starts_at DESC
            LIMIT $2 OFFSET $3`,
            [isPublic, limit, offset]
        );
        return result.rows as Contest[];
    }

    async findById(id: string): Promise<Contest | null> {
        const result = await db.query(
            `SELECT id, name, description, starts_at, ends_at, is_public, created_by, created_at
            FROM contests
            WHERE id = $1`,
            [id]
        );
        return result.rowCount ? (result.rows[0] as Contest) : null;
    }

    async findByCreator(createdBy: string, limit: number = 50, offset: number = 0): Promise<Contest[]> {
        const result = await db.query(
            `SELECT id, name, description, starts_at, ends_at, is_public, created_by, created_at
            FROM contests
            WHERE created_by = $1
            ORDER BY starts_at DESC
            LIMIT $2 OFFSET $3`,
            [createdBy, limit, offset]
        );
        return result.rows as Contest[];
    }

    async create(contest: Omit<Contest, "id" | "created_at">): Promise<Contest> {
        const id = randomUUID();
        const result = await db.query(
            `INSERT INTO contests (id, name, description, starts_at, ends_at, is_public, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, name, description, starts_at, ends_at, is_public, created_by, created_at`,
            [id, contest.name, contest.description || null, contest.starts_at, contest.ends_at, contest.is_public, contest.created_by]
        );
        return result.rows[0] as Contest;
    }

    async update(id: string, updates: Partial<Omit<Contest, "id" | "created_by" | "created_at">>): Promise<Contest | null> {
        const setClauses = [];
        const values = [];
        let paramIndex = 1;

        if (updates.name !== undefined) {
            setClauses.push(`name = $${paramIndex++}`);
            values.push(updates.name);
        }
        if (updates.description !== undefined) {
            setClauses.push(`description = $${paramIndex++}`);
            values.push(updates.description);
        }
        if (updates.starts_at !== undefined) {
            setClauses.push(`starts_at = $${paramIndex++}`);
            values.push(updates.starts_at);
        }
        if (updates.ends_at !== undefined) {
            setClauses.push(`ends_at = $${paramIndex++}`);
            values.push(updates.ends_at);
        }
        if (updates.is_public !== undefined) {
            setClauses.push(`is_public = $${paramIndex++}`);
            values.push(updates.is_public);
        }

        if (setClauses.length === 0) return this.findById(id);

        values.push(id);
        const setString = setClauses.join(", ");
        const result = await db.query(
            `UPDATE contests SET ${setString} WHERE id = $${paramIndex} RETURNING id, name, description, starts_at, ends_at, is_public, created_by, created_at`,
            values
        );

        return result.rowCount ? (result.rows[0] as Contest) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await db.query(`DELETE FROM contests WHERE id = $1`, [id]);
        return result.rowCount ? result.rowCount > 0 : false;
    }

    async getProblems(contestId: string): Promise<ContestProblem[]> {
        const result = await db.query(
            `SELECT contest_id, problem_id, position
            FROM contest_problems
            WHERE contest_id = $1
            ORDER BY position ASC`,
            [contestId]
        );
        return result.rows as ContestProblem[];
    }

    async addProblem(contestId: string, problemId: string, position: number): Promise<ContestProblem> {
        const result = await db.query(
            `INSERT INTO contest_problems (contest_id, problem_id, position)
            VALUES ($1, $2, $3)
            RETURNING contest_id, problem_id, position`,
            [contestId, problemId, position]
        );
        return result.rows[0] as ContestProblem;
    }

    async removeProblem(contestId: string, problemId: string): Promise<boolean> {
        const result = await db.query(
            `DELETE FROM contest_problems
            WHERE contest_id = $1 AND problem_id = $2`,
            [contestId, problemId]
        );
        return result.rowCount ? result.rowCount > 0 : false;
    }

    async getParticipants(contestId: string): Promise<ContestParticipant[]> {
        const result = await db.query(
            `SELECT contest_id, user_id, joined_at
            FROM contest_participants
            WHERE contest_id = $1
            ORDER BY joined_at DESC`,
            [contestId]
        );
        return result.rows as ContestParticipant[];
    }

    async addParticipant(contestId: string, userId: string): Promise<ContestParticipant> {
        const result = await db.query(
            `INSERT INTO contest_participants (contest_id, user_id)
            VALUES ($1, $2)
            RETURNING contest_id, user_id, joined_at
            ON CONFLICT DO NOTHING`,
            [contestId, userId]
        );
        return result.rows[0] as ContestParticipant;
    }

    async isRegistered(contestId: string, userId: string): Promise<boolean> {
        const result = await db.query(
            `SELECT 1 FROM contest_registrations
            WHERE contest_id = $1 AND user_id = $2
            LIMIT 1`,
            [contestId, userId]
        );
        return result.rowCount ? result.rowCount > 0 : false;
    }

    async registerUser(contestId: string, userId: string): Promise<void> {
        await db.query(
            `INSERT INTO contest_registrations (contest_id, user_id, status)
            VALUES ($1, $2, 'registered')
            ON CONFLICT (contest_id, user_id) DO UPDATE SET status = 'registered'`,
            [contestId, userId]
        );
    }

    async getStandings(contestId: string): Promise<any[]> {
        const result = await db.query(
            `SELECT 
                u.id as user_id,
                u.username,
                COUNT(DISTINCT CASE WHEN s.verdict = 'AC' THEN s.id END) as solved,
                COALESCE(SUM(s.time_ms / 1000.0 / 60.0), 0) as penalty,
                ROW_NUMBER() OVER (ORDER BY 
                    COUNT(DISTINCT CASE WHEN s.verdict = 'AC' THEN s.id END) DESC,
                    COALESCE(SUM(s.time_ms / 1000.0 / 60.0), 0) ASC
                ) as rank
            FROM contest_participants cp
            JOIN users u ON cp.user_id = u.id
            LEFT JOIN submissions s ON s.user_id = u.id 
                AND s.contest_id = cp.contest_id::text 
                AND s.verdict IS NOT NULL
            WHERE cp.contest_id::text = $1
            GROUP BY u.id, u.username
            ORDER BY rank ASC`,
            [contestId]
        );
        return result.rows;
    }
}
