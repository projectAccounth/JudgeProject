import "fastify";
import { AuthUser } from "./domain/user";

declare module "fastify" {
    interface FastifyRequest {
        user: AuthUser | null;
    }
}
