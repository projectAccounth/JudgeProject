import { EchoController } from "../controllers/echo.controller";
import { HealthController } from "../controllers/health.controller";
import { SubmissionController } from "../controllers/submission.controller";
import { EchoSchema } from "../schemas/echo.schema";
import { SubmissionCreateSchema } from "../schemas/submission.schema";
import { AppRoute } from "./types";

export const echoRoutes = (controller: EchoController): AppRoute[] => [
    {
        method: "POST",
        path: "/echo",
        schema: {
            body: EchoSchema
        },
        handler: ({ body }) => controller.create(body as any)
    },
    {
        method: "GET",
        path: "/echo",
        handler: () => controller.list()
    }
];

export const healthRoutes = (controller: HealthController): AppRoute[] => [
    {
        method: "POST",
        path: "/health",
        handler: () => controller.create()
    },
    {
        method: "GET",
        path: "/health",
        handler: () => controller.create()
    }
];

export const submissionRoutes = (
    controller: SubmissionController
): AppRoute[] => [
    {
        method: "POST",
        path: "/submissions",
        schema: {
            body: SubmissionCreateSchema
        },
        handler: ({ body, user }) =>
            controller.create(
                (body as any).problemId,
                (body as any).sourceCode
            , "")
    },
    {
        method: "GET",
        path: "/submissions",
        handler: ({ params }) =>
            controller.getAll()
    },
    {
        method: "GET",
        path: "/submissions/:id",
        handler: ({ params }) =>
            controller.get((params as any).id)
    }
];
