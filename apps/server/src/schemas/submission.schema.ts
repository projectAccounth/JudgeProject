import { z } from "zod";

export const SubmissionCreateSchema = {
    type: "object",
    required: ["problemId", "sourceCode", "language", "userId"],
    properties: {
        problemId: { type: "string" },
        sourceCode: { type: "string" },
        language: { type: "string" },
        userId: { type: "string" },
    }
} as const;