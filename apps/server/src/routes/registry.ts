import { FastifyInstance } from "fastify";
import { buildJsonSchemas } from "fastify-zod";
import { AppRoute } from "./types";
import { AuthUser, hasRolePrivilege } from "../domain/user";
import { AppError } from "../errors/app-error";
import { verifyExchangeKey } from "./auth-utils";

export async function registerRoutes(
    fastify: FastifyInstance,
    routes: AppRoute[]
) {
    for (const route of routes) {
        fastify.route({
            method: route.method,
            url: route.path,
            schema: route.schema
                ? buildJsonSchemas(route.schema as any) as any
                : undefined,

            preHandler: async (req, res) => {
                const auth = route.auth ?? { type: "NONE" };
                const user = (req as any).user as AuthUser | null;

                if (auth.type === "REQUIRED" && !user) {
                    throw new AppError("UNAUTHORIZED", "Unauthorized", 401);
                }

                if (auth.type === "ROLE") {
                    if (!user || user.role !== auth.role) {
                        throw new AppError("FORBIDDEN", "Forbidden", 403);
                    }
                }

                if (auth.type === "ROLE_MIN") {
                    if (!user || !hasRolePrivilege(user.role, auth.role)) {
                        throw new AppError("FORBIDDEN", "Forbidden - insufficient privilege level", 403);
                    }
                }

                if (auth.type === "EXCHANGE_KEY") {
                    if (!verifyExchangeKey(req)) {
                        throw new AppError("UNAUTHORIZED", "Invalid or missing exchange key", 401);
                    }
                }
            },

            handler: async (req, reply) => {
                return route.handler({
                    body: req.body,
                    params: req.params,
                    query: req.query,
                    user: (req as any).user ?? undefined,
                    req,
                    reply
                });
            }
        });
    }
}

