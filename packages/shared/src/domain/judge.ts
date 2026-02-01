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
    total: number;
    passed: number;
    status: JudgeStatus;
    timeMs: number;
    memoryKb: number;
    case_results: Array<{
        index: number;
        input: string;
        status: JudgeStatus;
        stderr: string;
        stdout: string;
        timeMs: number;
        expected: string;
        memoryKb: number
    }>;
};

export interface Judge {
    run(input: JudgeRequest): Promise<JudgeResult>;
}
