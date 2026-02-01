import { FastifyInstance } from "fastify";
import { SubmissionController } from "../controllers/submission.controller";

export function initializeJudge(app: FastifyInstance, container: {
    submissionController: SubmissionController;
}) {
    // Routes are now registered in app.ts
}