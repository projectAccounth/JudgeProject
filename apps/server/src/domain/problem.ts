export type ProblemDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface Problem {
    id: string;

    title: string;
    description: string;

    difficulty: ProblemDifficulty;

    timeLimitMs: number;
    memoryLimitMb: number;

    testcaseSetId: string;

    createdAt: Date;
    updatedAt: Date;
}
