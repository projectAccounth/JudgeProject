import { FastifyInstance } from "fastify";
import { AppRoute } from "./types";

export function registerRoutes(
    fastify: FastifyInstance,
    routes: AppRoute[]
) {
    for (const route of routes) {
        fastify.route({
            method: route.method,
            url: route.path,
            schema: route.schema,
            handler: async (req, res) => {
                const user = (req as any).user;
                const sessionId = (req as any).sessionId;

                if (route.auth === "REQUIRED" && !user) {
                    return res
                        .status(401)
                        .send({ error: "Unauthorized" });
                }

                return route.handler({
                    body: req.body,
                    params: req.params,
                    user,
                    sessionId
                });
            }
        });
    }
}
