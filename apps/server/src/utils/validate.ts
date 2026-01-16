import { ZodSchema } from "zod";
import { AppError } from "../errors/app-error";

export function validate<T>(schema: ZodSchema<T>, input: unknown): T {
    const result = schema.safeParse(input);

    if (!result.success) {
        throw new AppError(
            "INVALID_INPUT",
            "Validation failed",
            400,
            result.error.format()
        );
    }

    return result.data;
}
