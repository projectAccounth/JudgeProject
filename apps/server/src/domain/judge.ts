export type JudgeStatus = "AC" | "WA" | "TLE" | "MLE" | "RE" | "CE";

export type JudgeLimits = {
    timeMs: number;
    memoryMb: number;
};

export type JudgeTestCase = {
    input: string;
    expectedOutput: string;
};

export type JudgeRequest = {
    sourceCode: string;
    language: string;
    limits: JudgeLimits;
    testCases: JudgeTestCase[];
};

export type JudgeResult = {
    status: JudgeStatus;
    stdout: string;
    stderr: string;
    timeMs: number;
    memoryKb: number;
    passed: number;
    total: number;
};

export interface Judge {
    run(input: JudgeRequest): Promise<JudgeResult>;
}
