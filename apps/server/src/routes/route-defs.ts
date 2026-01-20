import { ProblemAuthorInput } from "../api/dto/problem-author.dto";
import { EchoController } from "../controllers/echo.controller";
import { HealthController } from "../controllers/health.controller";
import { SubmissionController } from "../controllers/submission.controller";
import { EchoSchema } from "../schemas/echo.schema";
import { ProblemCreateSchema, ProblemTestcaseCreateSchema } from "../schemas/problem-create.schema";
import { SubmissionCreateSchema } from "../schemas/submission.schema";
import { ProblemAuthoringService } from "../services/problem-author.service";
import { AppRoute } from "./types";

export const echoRoutes = (controller: EchoController): AppRoute[] => [
    {
        method: "POST",
        path: "/echo",
        schema: {
            body: EchoSchema
        },
        handler: async ({ body }) => controller.create(body as any)
    },
    {
        method: "GET",
        path: "/echo",
        handler: async () => controller.list()
    }
];

export const healthRoutes = (controller: HealthController): AppRoute[] => [
    {
        method: "POST",
        path: "/health",
        handler: async () => controller.create()
    },
    {
        method: "GET",
        path: "/health",
        handler: async () => controller.create()
    }
];

export const problemRoutes = (problemService: ProblemAuthoringService): AppRoute[] => [
    {
        method: "POST",
        path: "/addCase",
        schema: {
            body: ProblemTestcaseCreateSchema
        },
        handler: async ({ body, user }) => {
            return await problemService.addTestCase(body as any);
        }
    },
    {
        method: "POST",
        path: "/addProblem",
        schema: {
            body: ProblemCreateSchema
        },
        handler: async ({
            body, user
        }) => {
            return await problemService.addProblem(body as any);
        }
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
        handler: async ({ body, user }) => {
            return controller.create(
                (body as any).problemId,
                (body as any).sourceCode, 
                (body as any).userId,
                (body as any).language)
        }
    },
    {
        method: "GET",
        path: "/submissions",
        handler: async ({ params }) =>
            controller.getAll()
    },
    {
        method: "GET",
        path: "/submissions/:id",
        handler: async ({ params }) =>
            controller.get((params as any).id)
    }
];
