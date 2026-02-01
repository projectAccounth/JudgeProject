import { AuthUser } from "../../domain/user";

export interface AuthenticatedRequest extends Request {
    cookies: any;
    user?: AuthUser;
    sessionId?: string;
}
