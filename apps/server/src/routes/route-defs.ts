import { EchoController } from "../controllers/echo.controller";
import { HealthController } from "../controllers/health.controller";
import { SubmissionController } from "../controllers/submission.controller";
import { StatsController } from "../controllers/stats.controller";
import { UserAdminController } from "../controllers/user-admin.controller";
import { ProblemAdminController } from "../controllers/problem-admin.controller";
import { SubmissionAdminController } from "../controllers/submission-admin.controller";
import { TeacherController } from "../controllers/teacher.controller";
import { OllamaService } from "../services/ollama.service";
import { 
    SubmissionCreateSchema,
    type SubmissionCreateRequest
} from "@judgeapp/shared/schemas/submission.schema"
import { 
    EchoSchema,
    type EchoRequest
} from "@judgeapp/shared/schemas/echo.schema";
import { 
    ProblemSchema, 
    ProblemTestcaseCreateSchema, 
    TestcaseDataSchema, 
    TestcaseOverrideSchema,
    type Problem,
    type ProblemTestcaseCreate,
    type FullTestcase,
    PaginatedGetSchema,
    PaginatedData
} from "@judgeapp/shared/schemas/problem.schema";
import { analysisCacheService } from "../services/analysis-cache.service";
import { ProblemAuthoringService } from "../services/problem-author.service";
import { UserAdminService } from "../services/user-admin.service";
import { ProblemAdminService } from "../services/problem-admin.service";
import { AppRoute } from "./types";
import crypto from "node:crypto";
import { AuthService } from "../services/auth.service";

// test
export const echoRoutes = (controller: EchoController): AppRoute<EchoRequest>[] => [
    {
        method: "POST",
        path: "/echo",
        schema: {
            body: EchoSchema
        },
        handler: async ({ body }) => controller.create(body)
    },
    {
        method: "GET",
        path: "/echo",
        handler: async () => controller.list()
    }
];

export const healthRoutes = (controller: HealthController): AppRoute[] => [
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
        handler: async ({ body }) => {
            return await problemService.addTestCase(body as ProblemTestcaseCreate);
        }
    },
    {
        method: "POST",
        path: "/addProblem",
        schema: {
            body: ProblemSchema
        },
        handler: async ({ body }) => {
            await problemService.addProblem(body as Problem);
            return {
                status: "Successfully added problem"
            };
        }
    },
    {
        method: "GET",
        path: "/getProblemData",
        handler: async ({ query }) => {
            const limit = Number((query as any).limit ?? 20);
            const after = (query as any).after
                ? new Date((query as any).after)
                : undefined;

            const q = (query as any).q?.toLowerCase();
            const difficulty = (query as any).difficulty;
            // tags and category may be passed as comma-separated values
            const tagsParam = (query as any).tags as string | undefined;
            const categoryParam = (query as any).category as string | undefined;
            const tags = tagsParam ? tagsParam.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];
            const categories = categoryParam ? categoryParam.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];

            console.log(`Tried to get problem data with queries ${JSON.stringify(query)}`);

            const repo = await problemService.getProblemRepo();
            // Allow an optional `since` query param so the client can request newer items as well
            const since = (query as any).since ? new Date((query as any).since) : undefined;
            const page = await repo.getPaginated(limit, after, since);

            let problems = page.problems;

            if (difficulty) {
                problems = problems.filter(p => p.difficulty === difficulty);
            }

            if (q) {
                problems = problems.filter(p =>
                    p.title.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q)
                );
            }

            if (tags.length > 0) {
                problems = problems.filter(p => {
                    const pTags = (p as any).tags || [];
                    const lower = pTags.map((t: string) => String(t).toLowerCase());
                    // require all provided tags to be present
                    return tags.every(t => lower.includes(t));
                });
            }

            if (categories.length > 0) {
                problems = problems.filter(p => {
                    const pCats = (p as any).category || [];
                    const lower = pCats.map((c: string) => String(c).toLowerCase());
                    return categories.every(c => lower.includes(c));
                });
            }

            return {
                problems,
                nextCursor: page.nextCursor,
            };
        },
        
    },
    {
        method: "GET",
        path: "/problems/:id",
        handler: async ({
            params
        }) => {
            const repo = await problemService.getProblemRepo();
            return await repo.findById((params as any).id);
        }
    },
    {
        method: "GET",
        path: "/getProblemSamples/:id",
        handler: async ({ params }) => {
            const testcaseRepo = await problemService.getTestcaseRepo();
            const problemRepo = await problemService.getProblemRepo();
            const problem = await problemRepo.findById((params as any).id);
            return problem ? await testcaseRepo.getSamples(problem.testcaseSetId) : null;
        }
    },
    {
        method: "POST",
        path: "/updateProblem",
        schema: {  
            body: ProblemSchema
        },
        handler: async ({ body, user }) => {
            await problemService.modifyProblem(body as any);
            return {
                status: "Successfully modified problem"
            };
        },
    },
    {
        method: "GET",
        path: "/getProblemTestcases/:id",
        handler: async ({ params }) => {
            const testcaseRepo = await problemService.getTestcaseRepo();
            const problemRepo = await problemService.getProblemRepo();
            const problem = await problemRepo.findById((params as any).id);
            return problem ? await testcaseRepo.getTestcases(problem.testcaseSetId) : null;
        }
    },
    {
        method: "POST",
        path: "/updateTestcases",
        schema: {  
            body: TestcaseDataSchema
        },
        handler: async ({ body, user }) => {
            const caseRepo = (await problemService.getTestcaseRepo());
            await caseRepo.upsertTestCases((body as any).upserts);
            await caseRepo.removeList((body as any).remove);
            return {
                status: "Successfully updated cases"
            };
        },
    },
];

export const submissionRoutes = (
    controller: SubmissionController
): AppRoute<SubmissionCreateRequest>[] => [
    {
        method: "POST",
        path: "/submissions",
        schema: {
            body: SubmissionCreateSchema
        },
        handler: async ({ body }) => {
            try {
                return await controller.create(
                    body.problemId,
                    body.sourceCode,
                    body.userId,
                    body.language
                );
            } catch (error: any) {
                if (String(error?.message || "").toLowerCase().includes("rate limit")) {
                    return { code: 429, message: error.message };
                }
                throw error;
            }
        }
    },
    {
        method: "GET",
        path: "/submissions",
        schema: {
            params: PaginatedGetSchema
        },
        handler: async ({ query }) =>
            controller.getPaginated((query as PaginatedData).limit ?? 8, (query as PaginatedData).after),
    },
    {
        method: "GET",
        path: "/submissions/:id",
        handler: async ({ params }) =>
            controller.get((params as any).id)
    }
];

export const statsRoutes = (
    controller: StatsController
): AppRoute[] => [
    {
        method: "GET",
        path: "/stats/global",
        handler: async ({ query }) => {
            const params: any = query || {};
            return await controller.getGlobalStats({
                language: params.language,
                verdict: params.verdict
            });
        }
    },
    {
        method: "GET",
        path: "/stats/problem/:id",
        handler: async ({ params, query }) => {
            const q: any = query || {};
            return await controller.getProblemStats((params as any).id, {
                language: q.language,
                verdict: q.verdict
            });
        }
    },
    {
        method: "GET",
        path: "/stats/user/:userId",
        auth: { type: "OPTIONAL" },
        handler: async ({ params, user }) => {
            // Allow users to view their own stats or if requested userId matches authenticated user
            const targetUserId = (params as any).userId;
            if (!user && !targetUserId) {
                return { code: 401, message: "Unauthorized" };
            }
            return await controller.getUserStats(targetUserId);
        }
    },
    {
        method: "GET",
        path: "/stats/leaderboard",
        handler: async ({ query }) => {
            const limit = Math.min(Number((query as any)?.limit) || 10, 100);
            return await controller.getLeaderboard(limit);
        }
    }
];

export const analysisRoutes = (
): AppRoute[] => [
    {
        method: "POST", 
        path: "/analysis-cache/generate-key",
        auth: { type: "EXCHANGE_KEY" },
        handler: async ({ body, user }) => {
            try {
                const { sourceCode, language, testResults } = (body as any);
        
                if (!sourceCode || !language) {
                    return {
                        code: 500,
                        message: "Missing sourceCode or language" 
                    };
                }
        
                const key = `${sourceCode}|${language}|${testResults?.passed}/${testResults?.total}`;
                const cacheKey = crypto.createHash("sha256").update(key).digest("hex");
        
                return {
                    code: 200,
                    cacheKey: cacheKey
                };
            } catch (error) {
                console.error("Key generation error:", error);
                return {
                    code: 500,
                    message: "Failed to generate key"
                };
            }
        }
    },
    {
        method: "GET",
        path: "/analysis-cache/stats",
        auth: { type: "EXCHANGE_KEY" },
        handler: async ({ body, user }) => {
            try {
                const stats = await analysisCacheService.getStats();
                return stats;
            } catch (error) {
                console.error("Stats error:", error);
                return {
                    code: 500,
                    message: "Failed to get stats"
                };
            }
        }
    },
    {
        method: "GET",
        path: "/analysis-cache/:cacheKey",
        auth: { type: "EXCHANGE_KEY" },
        handler: async ({ params, user }) => {
            try {
                const { cacheKey } = (params as any);
        
                if (cacheKey?.length !== 64) {
                    return {
                        code: 400,
                        message: "Invalid cache key"
                    }
                }
        
                const cached = await analysisCacheService.get(cacheKey);
        
                if (!cached) {
                    return {
                        code: 404,
                        message: "Cache miss"
                    }
                }
        
                return {
                    data: cached,
                    cached: true,
                }
            } catch (error) {
                console.error("Cache GET error:", error);
                return {
                    code: 500,
                    message: "Failed to retrieve cache"
                };
            }
        }
    },
    {
        method: "POST", 
        path: "/analysis-cache",
        auth: { type: "EXCHANGE_KEY" },
        handler: async ({ body, user }) => {
            try {
                const { cacheKey, data } = (body as any);
        
                if (cacheKey?.length !== 64 || !data) {
                    return {
                        code: 400,
                        message: "Invalid request"
                    }
                }
        
                const success = await analysisCacheService.set(cacheKey, data);
        
                if (!success) {
                    return {
                        code: 500,
                        message: "Failed to cache result"
                    }
                }
        
                return {
                    success: true,
                    cacheKey: cacheKey
                }
            } catch (error) {
                console.error("Cache POST error:", error);
                return {
                    code: 500,
                    message: "Failed to store cache"
                }
            }
        }
    }
];

export const authRoutes = (
    authService: AuthService
): AppRoute[] => [
    {
        method: "POST",
        path: "/auth/register",
        handler: async ({ body }) => {
            const { username, password } = body as any;
            return authService.register(username, password);
        }
    },
    {
        method: "POST",
        path: "/auth/login",
        handler: async ({ body, req, reply }) => {
            const { username, password } = body as any;

            const session = await authService.login(username, password, {
                userAgent: req.headers["user-agent"],
                ip: req.ip
            });

            // Get user to set role cookie
            const loginResult = await (authService as any).validateSession(session.sessionId);

            (reply as any).setCookie("session_id", session.sessionId, {
                httpOnly: true,
                sameSite: "lax",
                path: "/"
            });

            // Set role cookie for middleware
            if (loginResult?.role) {
                (reply as any).setCookie("user_role", loginResult.role, {
                    httpOnly: false,
                    sameSite: "lax",
                    path: "/"
                });
            }

            return { ok: true };
        }
    },
    {
        method: "POST",
        path: "/auth/logout",
        auth: { type: "OPTIONAL" },
        handler: async ({ req, reply }) => {
            const sessionId = (req as any).cookies?.session_id;
            if (sessionId) {
                await authService.logout(sessionId);
            }

            (reply as any).clearCookie("session_id", { path: "/" });
            return { ok: true };
        }
    },
    {
        method: "GET",
        path: "/auth/me",
        auth: { type: "OPTIONAL" },
        handler: async ({ user }) => {
            return user ?? null;
        }
    }
];

/**
 * User admin routes - user management for admins
 */
export const userAdminRoutes = (
    userAdminController: UserAdminController
): AppRoute[] => [
    {
        method: "GET",
        path: "/admin/users",
        auth: { type: "ROLE", role: "ADMIN" },
        handler: async ({ query }) => {
            const limit = Number((query as any).limit ?? 20);
            const offset = Number((query as any).offset ?? 0);
            return userAdminController.getAllUsers(limit, offset);
        }
    },
    {
        method: "GET",
        path: "/admin/users/:userId",
        auth: { type: "ROLE", role: "ADMIN" },
        handler: async ({ params }) => {
            return userAdminController.getUser((params as any).userId);
        }
    },
    {
        method: "PUT",
        path: "/admin/users/:userId/role",
        auth: { type: "ROLE", role: "ADMIN" },
        handler: async ({ params, body, user }) => {
            const { role } = body as any;
            return userAdminController.changeUserRole(
                (params as any).userId,
                role,
                user!.role
            );
        }
    },
    {
        method: "GET",
        path: "/admin/users/search",
        auth: { type: "ROLE", role: "ADMIN" },
        handler: async ({ query }) => {
            const q = (query as any).q ?? "";
            return userAdminController.searchUsers(q);
        }
    },
    {
        method: "GET",
        path: "/admin/stats/users",
        auth: { type: "ROLE", role: "ADMIN" },
        handler: async () => {
            return userAdminController.getRoleDistribution();
        }
    },
    {
        method: "PUT",
        path: "/admin/users/:userId",
        auth: { type: "ROLE", role: "ADMIN" },
        handler: async ({ params, body, user }) => {
            const updates = body as any;
            return userAdminController.updateUser(
                (params as any).userId,
                updates,
                user!.role
            );
        }
    }
];

/**
 * Problem admin routes - problem management for admins
 */
export const problemAdminRoutes = (
    problemAdminController: ProblemAdminController
): AppRoute[] => [
    {
        method: "GET",
        path: "/admin/problems",
        auth: { type: "ROLE", role: "ADMIN" },
        handler: async ({ query }) => {
            const limit = Number((query as any).limit ?? 20);
            const offset = Number((query as any).offset ?? 0);
            return problemAdminController.getAllProblems(limit, offset);
        }
    },
    {
        method: "GET",
        path: "/admin/problems/:problemId",
        auth: { type: "ROLE", role: "ADMIN" },
        handler: async ({ params }) => {
            return problemAdminController.getProblem((params as any).problemId);
        }
    },
    {
        method: "PUT",
        path: "/admin/problems/:problemId",
        auth: { type: "ROLE", role: "ADMIN" },
        handler: async ({ params, body }) => {
            return problemAdminController.updateProblem(
                (params as any).problemId,
                body as Partial<Problem>
            );
        }
    },
    {
        method: "DELETE",
        path: "/admin/problems/:problemId",
        auth: { type: "ROLE", role: "ADMIN" },
        handler: async ({ params }) => {
            return problemAdminController.deleteProblem((params as any).problemId);
        }
    },
    {
        method: "GET",
        path: "/admin/stats/problems",
        auth: { type: "ROLE", role: "ADMIN" },
        handler: async () => {
            return problemAdminController.getProblemStats();
        }
    }
];

/**
 * Public profile routes - anyone can view public profiles
 */
export const publicProfileRoutes = (
    userAdminController: UserAdminController
): AppRoute[] => [
    {
        method: "GET",
        path: "/users/:userId/profile",
        auth: { type: "OPTIONAL" },
        handler: async ({ params }) => {
            return userAdminController.getPublicProfile((params as any).userId);
        }
    }
];

/**
 * Submission admin routes - submission management for admins
 */
export const submissionAdminRoutes = (
    submissionAdminController: SubmissionAdminController
): AppRoute[] => [
    {
        method: "GET",
        path: "/admin/submissions",
        auth: { type: "ROLE", role: "ADMIN" },
        handler: async ({ query }) => {
            const limit = Number((query as any).limit ?? 50);
            const offset = Number((query as any).offset ?? 0);
            const verdict = (query as any).verdict;
            return submissionAdminController.getAllSubmissions(limit, offset, verdict);
        }
    },
    {
        method: "GET",
        path: "/admin/submissions/:submissionId",
        auth: { type: "ROLE", role: "ADMIN" },
        handler: async ({ params }) => {
            return submissionAdminController.getSubmission((params as any).submissionId);
        }
    },
    {
        method: "DELETE",
        path: "/admin/submissions/:submissionId",
        auth: { type: "ROLE", role: "ADMIN" },
        handler: async ({ params }) => {
            return submissionAdminController.deleteSubmission((params as any).submissionId);
        }
    },
    {
        method: "GET",
        path: "/admin/stats/submissions",
        auth: { type: "ROLE", role: "ADMIN" },
        handler: async () => {
            return submissionAdminController.getSubmissionStats();
        }
    }
];

/**
 * Teacher routes - problem and submission management for teachers
 */
export const teacherRoutes = (
    teacherController: TeacherController
): AppRoute[] => [
    {
        method: "GET",
        path: "/teacher/problems",
        auth: { type: "ROLE_MIN", role: "TEACHER" },
        handler: async ({ user }) => {
            return teacherController.getTeacherProblems(user!.id);
        }
    },
    {
        method: "GET",
        path: "/teacher/submissions",
        auth: { type: "ROLE_MIN", role: "TEACHER" },
        handler: async ({ user, query }) => {
            const limit = Number((query as any).limit ?? 50);
            const offset = Number((query as any).offset ?? 0);
            return teacherController.getTeacherSubmissions(user!.id, limit, offset);
        }
    },
    {
        method: "GET",
        path: "/teacher/analytics",
        auth: { type: "ROLE_MIN", role: "TEACHER" },
        handler: async ({ user }) => {
            return teacherController.getTeacherAnalytics(user!.id);
        }
    },
    {
        method: "GET",
        path: "/teacher/problems/:problemId/submissions",
        auth: { type: "ROLE_MIN", role: "TEACHER" },
        handler: async ({ user, params, query }) => {
            const limit = Number((query as any).limit ?? 50);
            const offset = Number((query as any).offset ?? 0);
            return teacherController.getProblemSubmissions(
                (params as any).problemId,
                user!.id,
                limit,
                offset
            );
        }
    }
];

/**
 * Contest routes - public contests and registration
 */
import { ContestController } from "../controllers/contest.controller";

export const contestRoutes = (
    contestController: ContestController
): AppRoute[] => [
    {
        method: "GET",
        path: "/contests",
        handler: async ({ query }) => {
            const limit = Number((query as any).limit ?? 50);
            const offset = Number((query as any).offset ?? 0);
            const status = (query as any).status;
            return contestController.listContests({ query: { limit, offset, status } } as any, {} as any);
        }
    },
    {
        method: "GET",
        path: "/contests/:id",
        handler: async ({ params }) => {
            return contestController.getContest({ params } as any, {} as any);
        }
    },
    {
        method: "POST",
        path: "/contests",
        auth: { type: "ROLE_MIN", role: "TEACHER" },
        handler: async ({ body, user }) => {
            return contestController.createContest({ body, user } as any, {} as any);
        }
    },
    {
        method: "PUT",
        path: "/contests/:id",
        auth: { type: "REQUIRED" },
        handler: async ({ params, body, user }) => {
            return contestController.updateContest({ params, body, user } as any, {} as any);
        }
    },
    {
        method: "DELETE",
        path: "/contests/:id",
        auth: { type: "REQUIRED" },
        handler: async ({ params, user }) => {
            return contestController.deleteContest({ params, user } as any, {} as any);
        }
    },
    {
        method: "GET",
        path: "/contests/:id/problems",
        handler: async ({ params }) => {
            return contestController.getProblems({ params } as any, {} as any);
        }
    },
    {
        method: "POST",
        path: "/contests/:id/problems",
        auth: { type: "REQUIRED" },
        handler: async ({ params, body, user }) => {
            return contestController.addProblem({ params, body, user } as any, {} as any);
        }
    },
    {
        method: "DELETE",
        path: "/contests/:id/problems/:problemId",
        auth: { type: "REQUIRED" },
        handler: async ({ params, user }) => {
            return contestController.removeProblem({ params, user } as any, {} as any);
        }
    },
    {
        method: "PATCH",
        path: "/contests/:id/problems/:problemId",
        auth: { type: "REQUIRED" },
        handler: async ({ params, body, user }) => {
            return contestController.updateProblemPosition({ params, body, user } as any, {} as any);
        }
    },
    {
        method: "GET",
        path: "/contests/:id/standings",
        handler: async ({ params }) => {
            return contestController.getStandings({ params } as any, {} as any);
        }
    },
    {
        method: "GET",
        path: "/contests/:id/registration",
        auth: { type: "REQUIRED" },
        handler: async ({ params, user }) => {
            return contestController.checkRegistration({ params, user } as any, {} as any);
        }
    },
    {
        method: "POST",
        path: "/contests/:id/register",
        auth: { type: "REQUIRED" },
        handler: async ({ params, user }) => {
            return contestController.registerForContest({ params, user } as any, {} as any);
        }
    }
];

/**
 * Ollama Routes
 * Server-to-server routes for AI analysis, protected by exchange key
 */
export const ollamaRoutes = (): AppRoute[] => {
    const ollamaService = new OllamaService();

    return [
        {
            method: "GET",
            path: "/ollama/health",
            auth: { type: "EXCHANGE_KEY" },
            handler: async () => {
                const available = await ollamaService.isAvailable();
                return {
                    available,
                    status: available ? "ready" : "unavailable",
                    model: process.env.OLLAMA_MODEL || "qwen2.5-coder:3b"
                };
            }
        },
        {
            method: "POST",
            path: "/ollama/generate",
            auth: { type: "EXCHANGE_KEY" },
            handler: async ({ body }) => {
                try {
                    const { prompt, options } = (body as any);
                    if (!prompt) {
                        return {
                            code: 400,
                            error: "Missing prompt"
                        };
                    }
                    const response = await ollamaService.generate(prompt, options);
                    return { response };
                } catch (error) {
                    return {
                        code: 500,
                        error: (error as Error).message
                    };
                }
            }
        },
        {
            method: "POST",
            path: "/ollama/translate",
            auth: { type: "EXCHANGE_KEY" },
            handler: async ({ body }) => {
                try {
                    const { text, targetLanguage, sourceLanguage = "en" } = (body as any);
                    if (!text || !targetLanguage) {
                        return {
                            code: 400,
                            error: "Missing text or targetLanguage"
                        };
                    }
                    const translated = await ollamaService.translate(text, targetLanguage, sourceLanguage);
                    return { translated };
                } catch (error) {
                    return {
                        code: 500,
                        error: (error as Error).message
                    };
                }
            }
        },
        {
            method: "POST",
            path: "/ollama/analyze-code",
            auth: { type: "EXCHANGE_KEY" },
            handler: async ({ body }) => {
                try {
                    const { sourceCode, language, testResults, targetLanguage = "en" } = (body as any);
                    if (!sourceCode || !language) {
                        return {
                            code: 400,
                            error: "Missing sourceCode or language"
                        };
                    }
                    const result = await ollamaService.analyzeCodeLogic(sourceCode, language, testResults, targetLanguage);
                    return result;
                } catch (error) {
                    return {
                        code: 500,
                        error: (error as Error).message
                    };
                }
            }
        }
    ];
}
