import { Problem } from "../domain/problem";

export interface ProblemRepository {
    findById(id: string): Promise<Problem | null>;
    add(problem: Problem): Promise<void>;
}