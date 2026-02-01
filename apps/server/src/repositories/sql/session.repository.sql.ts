import { userDb } from "../../database/sql";
import { Session } from "../../domain/session";
import { SessionRepository } from "../session.repository";

export class SqlSessionRepository implements SessionRepository {

    async create(s: Session): Promise<void> {
        await userDb.query(
            `
            INSERT INTO sessions (
                id, user_id, created_at, expires_at, max_expires_at,
                user_agent, ip_address
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            `,
            [
                s.id,
                s.userId,
                s.createdAt,
                s.expiresAt,
                s.maxExpiresAt,
                s.userAgent ?? null,
                s.ipAddress ?? null
            ]
        );
    }

    async findValid(id: string): Promise<Session | null> {
        const r = await userDb.query(
            `
            SELECT *
            FROM sessions
            WHERE id = $1
              AND expires_at > NOW()
              AND max_expires_at > NOW()
            `,
            [id]
        );
        return r.rowCount ? mapSession(r.rows[0]) : null;
    }

    async delete(id: string): Promise<void> {
        await userDb.query(`DELETE FROM sessions WHERE id = $1`, [id]);
    }

    async deleteAllForUser(userId: string): Promise<void> {
        await userDb.query(
            `DELETE FROM sessions WHERE user_id = $1`,
            [userId]
        );
    }
}


function mapSession(row: any): Session {
    return {
        id: row.id,
        userId: row.user_id,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        maxExpiresAt: row.max_expires_at,
        userAgent: row.user_agent ?? undefined,
        ipAddress: row.ip_address ?? undefined
    };
}
