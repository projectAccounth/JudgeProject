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
            handler: async (req) => {
                return route.handler({
                    body: req.body,
                    params: req.params,
                    user: (req as any).user
                });
            }
        });
    }
}
