import { z } from "zod";

const TestcaseSchema = {
    type: "object",
    required: ["input", "expectedOutput"],
    properties: {
        input: { type: "string" },
        expectedOutput: { type: "string" },
        visibility: {
            type: "string",
            enum: ["PRIVATE", "SAMPLE"],
            default: "PRIVATE"
        }
    }
} as const;

export const ProblemCreateSchema = {
    type: "object",
    required: ["id", "title", "description", "difficulty", "limits", "testcases"],
    properties: {
        id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        difficulty: {
            type: "string",
            enum: ["EASY", "MEDIUM", "HARD"]
        },
        limits: {
            type: "object",
            required: ["timeMs", "memoryMb"],
            properties: {
                timeMs: { type: "integer", minimum: 1 },
                memoryMb: { type: "integer", minimum: 1 }
            }
        },
        testcases: {
            type: "array",
            minItems: 1,
            items: TestcaseSchema
        }
    }
} as const;

export const ProblemTestcaseCreateSchema = {
    type: "object",
    required: ["id", "testcases"],
    properties: {
        id: { type: "string" },
        testcases: {
            type: "array",
            minItems: 1,
            items: TestcaseSchema
        }
    }
} as const;
