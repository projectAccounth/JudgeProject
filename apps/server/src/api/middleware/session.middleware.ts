import { AuthService } from "../../services/auth.service";
import { AuthenticatedRequest } from "./types";
import { hasRolePrivilege, UserRole, ROLE_HIERARCHY } from "../../domain/user";

export function requireAuth(
    req: AuthenticatedRequest,
    res: any,
    next: Function
) {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
}

/**
 * Require specific role (exact match)
 */
export function requireRole(role: UserRole) {
    return (req: AuthenticatedRequest, res: any, next: Function) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (req.user.role !== role) {
            return res.status(403).json({ error: "Forbidden - insufficient role" });
        }
        next();
    };
}

/**
 * Require minimum role (privilege level)
 * Teacher or higher (TEACHER, ADMIN)
 */
export function requireMinRole(minRole: UserRole) {
    return (req: AuthenticatedRequest, res: any, next: Function) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!hasRolePrivilege(req.user.role, minRole)) {
            return res.status(403).json({ error: "Forbidden - insufficient privilege level" });
        }
        next();
    };
}

export function sessionMiddleware(auth: AuthService) {
    return async (req: AuthenticatedRequest, res: Response) => {
        const sid = req.cookies?.sid;
        if (!sid) {
            return;
        }

        const user = await auth.validateSession(sid);
        if (!user) {
            return;
        }

        req.user = user;
        req.sessionId = sid;
    };
}
