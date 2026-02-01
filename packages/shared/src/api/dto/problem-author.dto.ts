export type ProblemAuthorInput = {
    id: string;
    title: string;
    description: string;
    statement: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    limits: {
        timeMs: number;
        memoryMb: number;
    };
    testcases: Array<{
        input: string;
        expectedOutput: string;
        visibility: "SAMPLE" | "PRIVATE";
    }>;
    tags?: string[],
    category?: string[],
};
