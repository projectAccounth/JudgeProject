import { z } from "zod";

export const TestcaseSchema = z.object({
    input: z.string().describe("Test case input"),
    expectedOutput: z.string().describe("Expected output"),
    visibility: z.enum(["PRIVATE", "SAMPLE"]).default("PRIVATE")
});

export const FullTestcaseSchema = z.object({
    id: z.string().describe("Test case ID"),
    testcaseSetId: z.string().describe("Test case set ID"),
    input: z.string().describe("Test case input"),
    expectedOutput: z.string().describe("Expected output"),
    visibility: z.enum(["PRIVATE", "SAMPLE"]).default("PRIVATE"),
    order: z.number().int().describe("Order in test set")
});

export const TestcaseDataSchema = z.object({
    set_id: z.string().describe("Test case set ID"),
    upserts: z.array(FullTestcaseSchema).default([]).describe("Test cases to upsert"),
    remove: z.array(z.string()).default([]).describe("Test case IDs to remove")
});

export const TestcaseOverrideSchema = z.object({
    set_id: z.string().describe("Test case set ID"),
    testcases: z.array(FullTestcaseSchema).describe("Test cases to set")
});

export const ProblemSchema = z.object({
    id: z.string().describe("Problem ID"),
    title: z.string().describe("Problem title"),
    description: z.string().describe("Problem description"),
    statement: z.string().describe("Problem statement"),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    tags: z.array(z.string()).default([]).describe("Problem tags"),
    category: z.array(z.string()).default([]).describe("Problem categories"),
    limits: z.object({
        timeMs: z.number().int().positive().describe("Time limit in milliseconds"),
        memoryMb: z.number().int().positive().describe("Memory limit in megabytes")
    }).describe("Problem execution limits"),
    testcases: z.array(TestcaseSchema).default([]).describe("Problem test cases")
});

export const ProblemGetSchema = z.object({
    id: z.string().describe("Problem ID"),
    contest: z.string().optional().describe("Contest ID")
});

export const ProblemTestcaseCreateSchema = z.object({
    id: z.string().describe("Problem ID"),
    testcases: z.array(TestcaseSchema).min(1).describe("Test cases to add")
});

export const PaginatedGetSchema = z.object({
    limit: z.number().min(1),
    after: z.coerce.date().optional()
});

export type PaginatedData = z.infer<typeof PaginatedGetSchema>;
export type Testcase = z.infer<typeof TestcaseSchema>;
export type FullTestcase = z.infer<typeof FullTestcaseSchema>;
export type Problem = z.infer<typeof ProblemSchema>;
export type ProblemGet = z.infer<typeof ProblemGetSchema>;
export type ProblemTestcaseCreate = z.infer<typeof ProblemTestcaseCreateSchema>;
