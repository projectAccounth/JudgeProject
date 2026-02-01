import { User } from "../domain/user";

export interface UserRepository {
    create(user: User): Promise<void>;
    findById(id: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    getAll(): Promise<User[]>;
    update(user: User): Promise<void>;
}
