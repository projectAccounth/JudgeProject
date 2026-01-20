import { User } from "../../domain/user";

export interface AuthenticatedRequest extends Request {
    cookies: any;
    user?: User;
    sessionId?: string;
}
