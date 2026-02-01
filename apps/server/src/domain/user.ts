export type UserRole =
    | "USER"
    | "STUDENT"
    | "TEACHER"
    | "ADMIN";

export interface User {
    id: string;
    username: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
}

export interface AuthUser {
    id: string;
    username: string;
    role: UserRole;
}

/**
 * Role hierarchy for permission checks
 * Higher index = more privileges
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
    "USER": 0,
    "STUDENT": 0,
    "TEACHER": 1,
    "ADMIN": 2,
};

/**
 * Check if a role has sufficient privilege level
 */
export function hasRolePrivilege(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}