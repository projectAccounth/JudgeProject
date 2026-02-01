import { FastifyRequest, FastifyReply } from "fastify";
import { ContestService } from "../services/contest.service";
import { AppError } from "../errors/app-error";

export class ContestController {
    private contestService: ContestService;

    constructor() {
        this.contestService = new ContestService();
    }

    async listContests(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { limit = 50, offset = 0, status } = request.query as any;

            let contests;
            if (status && ["upcoming", "ongoing", "finished"].includes(status)) {
                contests = await this.contestService.getContestsByStatus(status, parseInt(limit), parseInt(offset));
            } else {
                contests = await this.contestService.getPublicContests(parseInt(limit), parseInt(offset));
            }

            return contests;
        } catch (error) {
            throw new AppError("INTERNAL_ERROR", "Failed to list contests", 500, (error as any).message);
        }
    }

    async getContest(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as any;
            const contest = await this.contestService.getContestById(id);

            if (!contest) {
                throw new AppError("NOT_FOUND", "Contest not found", 404);
            }

            return contest;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("INTERNAL_ERROR", "Failed to get contest", 500, (error as any).message);
        }
    }

    async createContest(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = (request as any).user;
            if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) {
                throw new AppError("FORBIDDEN", "Unauthorized", 403);
            }

            const { name, description, starts_at, ends_at, is_public } = request.body as any;

            console.log("[createContest] Body:", { name, description, starts_at, ends_at, is_public });

            if (!name || !starts_at || !ends_at) {
                throw new AppError("INVALID_INPUT", "Missing required fields: name, starts_at, ends_at", 400);
            }

            const contest = await this.contestService.createContest(
                name,
                description || null,
                new Date(starts_at),
                new Date(ends_at),
                is_public !== false,
                user.id
            );

            return contest;
        } catch (error) {
            console.error("[createContest] Error:", error);
            if (error instanceof AppError) throw error;
            throw new AppError("INTERNAL_ERROR", "Failed to create contest", 500, (error as any).message);
        }
    }

    async updateContest(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = (request as any).user;
            if (!user) {
                throw new AppError("UNAUTHORIZED", "Unauthorized", 401);
            }

            const { id } = request.params as any;
            const updates = request.body as any;

            const contest = await this.contestService.getContestById(id);
            if (!contest) {
                throw new AppError("NOT_FOUND", "Contest not found", 404);
            }

            // Allow ADMIN or contest creator
            if (user.role !== "ADMIN" && contest.created_by !== user.id) {
                throw new AppError("FORBIDDEN", "Unauthorized", 403);
            }

            const updated = await this.contestService.updateContest(id, updates);
            return updated;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("INTERNAL_ERROR", "Failed to update contest", 500, (error as any).message);
        }
    }

    async deleteContest(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = (request as any).user;
            if (!user) {
                throw new AppError("UNAUTHORIZED", "Unauthorized", 401);
            }

            const { id } = request.params as any;
            
            const contest = await this.contestService.getContestById(id);
            if (!contest) {
                throw new AppError("NOT_FOUND", "Contest not found", 404);
            }

            // Allow ADMIN or contest creator
            if (user.role !== "ADMIN" && contest.created_by !== user.id) {
                throw new AppError("FORBIDDEN", "Unauthorized", 403);
            }

            const deleted = await this.contestService.deleteContest(id);

            if (!deleted) {
                throw new AppError("NOT_FOUND", "Contest not found", 404);
            }

            return { message: "Contest deleted successfully" };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("INTERNAL_ERROR", "Failed to delete contest", 500, (error as any).message);
        }
    }

    async getProblems(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as any;
            const problems = await this.contestService.getProblems(id);
            return problems;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("INTERNAL_ERROR", "Failed to get problems", 500, (error as any).message);
        }
    }

    async addProblem(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = (request as any).user;
            if (!user) {
                throw new AppError("UNAUTHORIZED", "Unauthorized", 401);
            }

            const { id } = request.params as any;
            const { problem_id, position } = request.body as any;

            if (!problem_id || position === undefined) {
                throw new AppError("INVALID_INPUT", "Missing required fields", 400);
            }

            const contest = await this.contestService.getContestById(id);
            if (!contest) {
                throw new AppError("NOT_FOUND", "Contest not found", 404);
            }

            // Allow ADMIN or contest creator
            if (user.role !== "ADMIN" && contest.created_by !== user.id) {
                throw new AppError("FORBIDDEN", "Unauthorized", 403);
            }

            const problem = await this.contestService.addProblem(id, problem_id, position);
            reply.code(201);
            return problem;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("INTERNAL_ERROR", "Failed to add problem", 500, (error as any).message);
        }
    }

    async removeProblem(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = (request as any).user;
            if (!user) {
                throw new AppError("UNAUTHORIZED", "Unauthorized", 401);
            }

            const { id, problemId } = request.params as any;
            
            const contest = await this.contestService.getContestById(id);
            if (!contest) {
                throw new AppError("NOT_FOUND", "Contest not found", 404);
            }

            // Allow ADMIN or contest creator
            if (user.role !== "ADMIN" && contest.created_by !== user.id) {
                throw new AppError("FORBIDDEN", "Unauthorized", 403);
            }

            const deleted = await this.contestService.removeProblem(id, problemId);

            if (!deleted) {
                throw new AppError("NOT_FOUND", "Problem not found in contest", 404);
            }

            return { message: "Problem removed successfully" };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("INTERNAL_ERROR", "Failed to remove problem", 500, (error as any).message);
        }
    }
    async updateProblemPosition(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = (request as any).user;
            if (!user) {
                throw new AppError("UNAUTHORIZED", "Unauthorized", 401);
            }

            const { id, problemId } = request.params as any;
            const { position } = request.body as any;

            if (position === undefined || typeof position !== "number") {
                throw new AppError("INVALID_INPUT", "Invalid position", 400);
            }

            // Get contest to verify it exists
            const contest = await this.contestService.getContestById(id);
            if (!contest) {
                throw new AppError("NOT_FOUND", "Contest not found", 404);
            }

            // Allow ADMIN or contest creator
            if (user.role !== "ADMIN" && contest.created_by !== user.id) {
                throw new AppError("FORBIDDEN", "Unauthorized", 403);
            }

            // Remove and re-add problem with new position
            await this.contestService.removeProblem(id, problemId);
            const problem = await this.contestService.addProblem(id, problemId, position);

            return problem;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("INTERNAL_ERROR", "Failed to update problem position", 500, (error as any).message);
        }
    }

    async getStandings(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as any;
            const standings = await this.contestService.getStandings(id);
            return standings;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("INTERNAL_ERROR", "Failed to get standings", 500, (error as any).message);
        }
    }

    async checkRegistration(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = (request as any).user;
            if (!user) {
                throw new AppError("UNAUTHORIZED", "Unauthorized", 401);
            }

            const { id } = request.params as any;
            const isRegistered = await this.contestService.isUserRegistered(id, user.id);

            if (!isRegistered) {
                throw new AppError("NOT_FOUND", "Not registered", 404);
            }

            return { registered: true };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("INTERNAL_ERROR", "Failed to check registration", 500, (error as any).message);
        }
    }

    async registerForContest(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = (request as any).user;
            if (!user) {
                throw new AppError("UNAUTHORIZED", "Unauthorized", 401);
            }

            const { id } = request.params as any;

            const isRegistered = await this.contestService.isUserRegistered(id, user.id);
            if (isRegistered) {
                throw new AppError("INVALID_INPUT", "Already registered", 400);
            }

            await this.contestService.registerForContest(id, user.id);
            reply.code(201);
            return { message: "Registered successfully" };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("INTERNAL_ERROR", "Failed to register", 500, (error as any).message);
        }
    }

    async createPrivateProblem(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = (request as any).user;
            if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) {
                throw new AppError("FORBIDDEN", "Unauthorized", 403);
            }

            const { id } = request.params as any;
            const problemData = request.body as any;

            if (!problemData.title || !problemData.difficulty || !problemData.timeLimitMs || !problemData.memoryLimitMb) {
                throw new AppError("INVALID_INPUT", "Missing required problem fields", 400);
            }

            const contest = await this.contestService.getContestById(id);
            if (!contest) {
                throw new AppError("NOT_FOUND", "Contest not found", 404);
            }

            // Allow ADMIN or contest creator
            if (user.role !== "ADMIN" && contest.created_by !== user.id) {
                throw new AppError("FORBIDDEN", "Unauthorized", 403);
            }

            const problem = await this.contestService.createPrivateProblem(id, problemData, user.id);
            reply.code(201);
            return problem;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("INTERNAL_ERROR", "Failed to create private problem", 500, (error as any).message);
        }
    }
}
