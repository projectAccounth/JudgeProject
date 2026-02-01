import { z } from "zod";
import { Language, LANGUAGES } from "../domain/languages.js";

export const SubmissionCreateSchema = z.object({
    problemId: z.string().describe("The ID of the problem"),
    sourceCode: z.string().describe("The source code to submit"),
    language: z.enum(Object.keys(LANGUAGES) as [Language, ...Language[]]),
    userId: z.string().describe("The ID of the user submitting")
});

export type SubmissionCreateRequest = z.infer<typeof SubmissionCreateSchema>;