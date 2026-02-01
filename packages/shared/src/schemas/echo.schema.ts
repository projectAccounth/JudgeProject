import { z } from "zod";

export const EchoSchema = z.object({
    message: z.string().describe("The message to echo")
});

export type EchoRequest = z.infer<typeof EchoSchema>;
export type EchoResponse = z.infer<typeof EchoSchema>;