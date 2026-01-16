import { z } from "zod";

export const SubmissionCreateSchema = {
    type: "object",
    required: ["problemId", "sourceCode"],
    properties: {
        problemId: { type: "string" },
        sourceCode: { type: "string" }
    }
} as const;