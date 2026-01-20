import Fastify, { FastifyInstance } from "fastify";
import { AppError } from "./errors/app-error";
import { registerRoutes } from "./routes/registry";
import { echoRoutes, healthRoutes, problemRoutes } from "./routes/route-defs";
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

export function buildApp() {
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

    app.setErrorHandler((error, _req, reply) => {
        if (error instanceof AppError) {
            reply.status(error.statusCode).send({
                error: {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                },
            });
            return;
        }

        app.log.error(error);
        reply.status(500).send({
            error: {
                code: "INTERNAL_ERROR",
                message: "Internal server error",
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
    app.addHook("preHandler", async (req: any, res: any) => {
        const sid = req.cookies?.sid;
        if (!sid) {
            return;
        }

        const user = await authService.validateSession(sid);
        if (!user) {
            return;
        }

        req.user = user;
        req.sessionId = sid;
    });

    initializeJudge(app, { submissionController });
    const { scheduler, authoringService } = createWorkerContainer(submissionRepo);

    registerRoutes(app, [
        ...echoRoutes(echoController),
        ...healthRoutes(healthController),
        ...problemRoutes(authoringService)
    ]);

    scheduler.start();

    return app;
}

