import { userDb } from "../../database/sql";
import { User } from "../../domain/user";
import { UserRepository } from "../user.repository";

export class SqlUserRepository implements UserRepository {
    async getAll(): Promise<User[]> {
        const res = await userDb.query(
            `SELECT * FROM users`
        );

        return res.rows.map(mapUser);
    }

    async create(u: User): Promise<void> {
        await userDb.query(
            `
            INSERT INTO users (id, username, password_hash, role, created_at)
            VALUES ($1,$2,$3,$4,$5)
            `,
            [u.id, u.username, u.passwordHash, u.role, u.createdAt]
        );
    }

    async findById(id: string): Promise<User | null> {
        const r = await userDb.query(
            `SELECT * FROM users WHERE id = $1`,
            [id]
        );
        return r.rowCount ? mapUser(r.rows[0]) : null;
    }

    async findByUsername(username: string): Promise<User | null> {
        const r = await userDb.query(
            `SELECT * FROM users WHERE username = $1`,
            [username]
        );
        return r.rowCount ? mapUser(r.rows[0]) : null;
    }

    async update(user: User): Promise<void> {
        await userDb.query(
            `
            UPDATE users 
            SET username = $2, password_hash = $3, role = $4, created_at = $5
            WHERE id = $1
            `,
            [user.id, user.username, user.passwordHash, user.role, user.createdAt]
        );
    }
}

function mapUser(row: any): User {
    return {
        id: row.id,
        username: row.username,
        passwordHash: row.password_hash,
        role: row.role,
        createdAt: row.created_at
    };
}
