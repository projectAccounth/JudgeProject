/**
 * Auth utilities for server-only routes
 * Exchange key verification for internal/sensitive routes
 */

import { FastifyRequest } from "fastify";

export type AuthRequirement =
    | { type: "NONE" }
    | { type: "OPTIONAL" }
    | { type: "REQUIRED" }
    | { type: "ROLE"; role: UserRole }
    | { type: "ROLE_MIN"; role: UserRole }
    | { type: "EXCHANGE_KEY" }; // Server-to-server authentication

export type UserRole = "USER" | "TEACHER" | "ADMIN";

/**
 * Verify exchange key from request headers
 * Headers: X-Exchange-Key: <key>
 */
export function verifyExchangeKey(req: FastifyRequest): boolean {
    const exchangeKey = (req.headers["x-exchange-key"] as string) || "";
    const validKey = process.env.EXCHANGE_KEY;

    if (!validKey) {
        console.warn("[AUTH] EXCHANGE_KEY not configured in environment");
        return false;
    }

    if (exchangeKey !== validKey) {
        console.warn("[AUTH] Invalid exchange key attempt");
        return false;
    }

    console.log("[AUTH] Valid exchange key verified");
    return true;
}

/**
 * Verify if request has valid exchange key or user auth
 */
export function verifyExchangeKeyOrUser(
    req: FastifyRequest,
    userRole?: UserRole
): boolean {
    // Try exchange key first
    if (verifyExchangeKey(req)) {
        return true;
    }

    // Fall back to user authentication
    const user = (req as any).user;
    if (!user) {
        return false;
    }

    if (userRole) {
        const roleHierarchy: Record<string, number> = { USER: 0, TEACHER: 1, ADMIN: 2 };
        const userLevel = roleHierarchy[user.role] ?? 0;
        const requiredLevel = roleHierarchy[userRole] ?? 0;
        return userLevel >= requiredLevel;
    }

    return true;
}
