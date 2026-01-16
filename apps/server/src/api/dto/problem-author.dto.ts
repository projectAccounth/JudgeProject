export type ProblemAuthorInput = {
    id: string;
    title: string;
    description: string;
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
};
