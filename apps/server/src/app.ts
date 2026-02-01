import Fastify, { FastifyInstance } from "fastify";
import { AppError } from "./errors/app-error";
import { registerRoutes } from "./routes/registry";
import { AppRoute } from "./routes/types";
import { analysisRoutes, authRoutes, echoRoutes, healthRoutes, problemRoutes, statsRoutes, submissionRoutes, userAdminRoutes, problemAdminRoutes, publicProfileRoutes, submissionAdminRoutes, teacherRoutes, contestRoutes, ollamaRoutes } from "./routes/route-defs";
import { EchoService } from "./services/echo.service";
import { EchoController } from "./controllers/echo.controller";
import { InMemoryEchoRepository } from "./repositories/in-memory/echo.repository.memory";
import { HealthController } from "./controllers/health.controller";
import { HealthService } from "./services/health.service";
import { initializeJudge } from "./init/initJudge";
import { createApiContainer } from "./api/container";
import { createWorkerContainer } from "./worker/submission/container";
import { AuthService } from "./services/auth.service";
import { SqlUserRepository } from "./repositories/sql/user.repository.sql";
import { SqlSessionRepository } from "./repositories/sql/session.repository.sql";
import { StatsService } from "./services/stats.service";
import { StatsController } from "./controllers/stats.controller";
import { UserAdminService } from "./services/user-admin.service";
import { UserAdminController } from "./controllers/user-admin.controller";
import { ProblemAdminService } from "./services/problem-admin.service";
import { ProblemAdminController } from "./controllers/problem-admin.controller";
import { SubmissionAdminService } from "./services/submission-admin.service";
import { SubmissionAdminController } from "./controllers/submission-admin.controller";
import { TeacherService } from "./services/teacher.service";
import { TeacherController } from "./controllers/teacher.controller";
import { ContestController } from "./controllers/contest.controller";
import { analysisCacheService } from "./services/analysis-cache.service";
import cors from "@fastify/cors"
import { fastifyJwt } from "@fastify/jwt";

export async function buildApp() {
    const app: FastifyInstance = Fastify({ 
        loggerInstance: {
            info: (msg: any, ...args: any) => {
                const logMsg = typeof msg === 'object' ? (msg.msg || '') : msg;
                console.log(`\x1b[32m[INFO]\x1b[0m`, logMsg, ...args);
            },
            error: (msg: unknown) => console.error(`[ERROR] ${msg}`),
            debug: (msg: unknown) => console.debug(`[DEBUG] ${msg}`),
            fatal: (msg: unknown) => console.error(`[FATAL] ${msg}`),
            warn:  (msg: unknown) => console.warn(`[WARN] ${msg}`),
            trace: (msg: unknown) => console.trace(`[TRACE] ${msg}`),
            child: function() { return this },
            silent: (msg: unknown) => console.info(msg),
            level: 'info'
        }
    }) as any;

    app.register((cors as any), {
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "x-exchange-key"],
    });

    app.setErrorHandler((error, _req, reply) => {
        console.error("[ERROR HANDLER]", error);
        
        if (error instanceof AppError) {
            console.log("[AppError]", { code: error.code, statusCode: error.statusCode, message: error.message });
            reply.status(error.statusCode).send({
                error: {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                },
            });
            return;
        }

        console.error("[Unknown Error]", {
            name: (error as any)?.name,
            message: (error as any)?.message,
            stack: (error as any)?.stack,
        });
        
        reply.status(500).send({
            error: {
                code: "INTERNAL_ERROR",
                message: "Internal server error",
                details: process.env.NODE_ENV === 'development' ? (error as any)?.message : undefined,
            },
        });
    });

    const echoService: EchoService = new EchoService(new InMemoryEchoRepository());
    const echoController: EchoController = new EchoController(echoService);
    
    const healthService = new HealthService();
    const healthController = new HealthController(healthService);
    const { submissionController, submissionRepo } = createApiContainer();

    const userRepository = new SqlUserRepository();
    const sessionRepository = new SqlSessionRepository();
    const authService = new AuthService(userRepository, sessionRepository);

    app.register(require("@fastify/cookie"));
    
    // Decorate request with user property BEFORE the hook
    app.decorateRequest("user", null);

    app.addHook("preHandler", async (req) => {
        const sessionId = (req as any).cookies?.session_id;

        if (!sessionId) {
            (req as any).user = null;
            return;
        }

        (req as any).user = await authService.validateSession(sessionId);
    });

    initializeJudge(app, { submissionController });
    const { scheduler, authoringService } = createWorkerContainer(submissionRepo);

    const statsService = new StatsService(submissionRepo);
    const statsController = new StatsController(statsService);

    // Initialize admin services
    const userAdminService = new UserAdminService(userRepository);
    const userAdminController = new UserAdminController(userAdminService);
    const problemAdminService = new ProblemAdminService(await authoringService.getProblemRepo());
    const problemAdminController = new ProblemAdminController(problemAdminService);
    const submissionAdminService = new SubmissionAdminService(submissionRepo, userRepository, await authoringService.getProblemRepo());
    const submissionAdminController = new SubmissionAdminController(submissionAdminService);
    const teacherService = new TeacherService(await authoringService.getProblemRepo(), submissionRepo);
    const teacherController = new TeacherController(teacherService);
    const contestController = new ContestController();

    registerRoutes(app, [
        ...echoRoutes(echoController),
        ...healthRoutes(healthController),
        ...problemRoutes(authoringService),
        ...submissionRoutes(submissionController),
        ...statsRoutes(statsController),
        ...analysisRoutes(),
        ...authRoutes(authService),
        ...userAdminRoutes(userAdminController),
        ...problemAdminRoutes(problemAdminController),
        ...submissionAdminRoutes(submissionAdminController),
        ...teacherRoutes(teacherController),
        ...contestRoutes(contestController),
        ...publicProfileRoutes(userAdminController),
        ...ollamaRoutes()
    ] as AppRoute[]);

    scheduler.start();

    // Set up analysis cache cleanup (every 24 hours)
    const cleanupInterval = setInterval(async () => {
        try {
            const deleted = await analysisCacheService.cleanup();
            app.log.info(`Cache cleanup: removed ${deleted} expired entries`);
        } catch (error) {
            app.log.error(`Cache cleanup error: ${error}`);
        }
    }, 24 * 60 * 60 * 1000);

    // Clean up interval on graceful shutdown
    app.addHook("onClose", async () => {
        clearInterval(cleanupInterval);
    });

    return app;
}

