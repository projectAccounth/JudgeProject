import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository";
import { SessionRepository } from "../repositories/session.repository";
import { AuthUser, User } from "../domain/user";
import { Session } from "../domain/session";
import { AppError } from "../errors/app-error";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export class AuthService {
    constructor(
        private readonly users: UserRepository,
        private readonly sessions: SessionRepository
    ) {}

    async register(username: string, password: string) {
        username = username.trim().toLowerCase();

        const existing = await this.users.findByUsername(username);
        if (existing) {
            throw new AppError("INVALID_INPUT", "Username already exists", 400);
        }

        const hash = await bcrypt.hash(password, 12);

        const user: User = {
            id: crypto.randomUUID(),
            username,
            passwordHash: hash,
            role: "USER",
            createdAt: new Date()
        };

        await this.users.create(user);

        return {
            id: user.id,
            username: user.username
        };
    }

    async login(
        username: string,
        password: string,
        meta: { userAgent?: string; ip?: string }
    ) {
        username = username.trim().toLowerCase();

        const user = await this.users.findByUsername(username);
        if (!user) {
            throw new AppError("UNAUTHORIZED", "Invalid credentials", 401);
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            throw new AppError("UNAUTHORIZED", "Invalid credentials", 401);
        }

        const now = Date.now();

        const session: Session = {
            id: crypto.randomUUID(),
            userId: user.id,
            createdAt: new Date(now),
            expiresAt: new Date(now + 1000 * 60 * 60 * 24), // 24h rolling
            maxExpiresAt: new Date(now + 1000 * 60 * 60 * 24 * 14), // 14d absolute
            userAgent: meta.userAgent,
            ipAddress: meta.ip
        };

        await this.sessions.create(session);

        return {
            sessionId: session.id,
            expiresAt: session.expiresAt
        };
    }

    async logout(sessionId: string): Promise<void> {
        await this.sessions.delete(sessionId);
    }

    async validateSession(sessionId: string): Promise<AuthUser | null> {
        const session = await this.sessions.findValid(sessionId);
        if (!session) {
            return null;
        }

        const user = await this.users.findById(session.userId);
        if (!user) {
            return null;
        }

        return {
            id: user.id,
            username: user.username,
            role: user.role
        };
    }
}
