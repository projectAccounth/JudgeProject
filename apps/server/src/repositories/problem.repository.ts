import { Problem } from "../domain/problem";

export interface ProblemRepository {
    findById(id: string): Promise<Problem | null>;
}