import { FastifyInstance } from "fastify";
import { SubmissionController } from "../controllers/submission.controller";
import { registerRoutes } from "../routes/registry";
import { submissionRoutes } from "../routes/route-defs";

export function initializeJudge(app: FastifyInstance, container: {
    submissionController: SubmissionController;
}) {

    registerRoutes(
        app,
        submissionRoutes(container.submissionController)
    );
}