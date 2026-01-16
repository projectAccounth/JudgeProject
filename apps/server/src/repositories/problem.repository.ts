import { Problem } from "../domain/problem";

export interface ProblemRepository {
    findById(id: string): Promise<Problem | null>;
    add(problem: Problem): Promise<void>;
    findById(id: string): Promise<Problem | null>;
    removeById(id: string): Promise<void>;
    removeAll(): Promise<void>;
}