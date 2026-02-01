import { Session } from "../domain/session";

export interface SessionRepository {
    create(session: Session): Promise<void>;
    findValid(id: string): Promise<Session | null>;
    delete(id: string): Promise<void>;
    deleteAllForUser(userId: string): Promise<void>;
}
