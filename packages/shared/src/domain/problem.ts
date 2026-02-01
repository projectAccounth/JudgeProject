export type ProblemDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface Problem {
    id: string;

    title: string;
    description: string;
    statement: string;

    difficulty: ProblemDifficulty;

    timeLimitMs: number;
    memoryLimitMb: number;

    testcaseSetId: string;

    createdAt: Date;
    updatedAt: Date;

    tags?: string[],
    category?: string[];
    
    // Private problems for contests
    isPrivate?: boolean;
    contestId?: string;
    publishedAt?: Date;
}
