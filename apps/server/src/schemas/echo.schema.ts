import { z } from "zod";

export const EchoSchema = {
    type: "object",
    required: ["message"],
    properties: {
        message: { type: "string" }
    }
} as const;