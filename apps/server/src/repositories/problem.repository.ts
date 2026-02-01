import { ProblemAuthorInput } from "@judgeapp/shared/api/dto/problem-author.dto";
import { Problem } from "@judgeapp/shared/domain/problem";

export interface ProblemRepository {
    findById(id: string): Promise<Problem | null>;
    add(problem: Problem): Promise<void>;
    removeById(id: string): Promise<void>;
    removeAll(): Promise<void>;
    getAll(): Promise<Problem[]>;
    getPaginated(limit: number, after?: Date, since?: Date): Promise<{ problems: Problem[], nextCursor: Date | null }>;
    modifyProblem(problem: ProblemAuthorInput): Promise<void>;
    
    // Private problem methods for contests
    createPrivateProblem(problem: Problem, contestId: string): Promise<void>;
    getPrivateProblemsForContest(contestId: string): Promise<Problem[]>;
    publishPrivateProblem(problemId: string): Promise<void>;
    getByContestId(contestId: string): Promise<Problem[]>;
}