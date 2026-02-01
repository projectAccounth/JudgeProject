import { ContestRepository } from "../repositories/contest.repository";
import { Contest, ContestProblem, ContestStatus, getContestStatus } from "@judgeapp/shared/domain/contest";
import { AppError } from "../errors/app-error";
import { SqlProblemRepository } from "../repositories/sql/problem.repository.sql";
import { v4 as uuidv4 } from "uuid";

export class ContestService {
    private contestRepository: ContestRepository;
    private problemRepository: SqlProblemRepository;

    constructor() {
        this.contestRepository = new ContestRepository();
        this.problemRepository = new SqlProblemRepository();
    }

    async getPublicContests(limit: number = 50, offset: number = 0): Promise<Contest[]> {
        return this.contestRepository.findAll(true, limit, offset);
    }

    async getContestById(id: string): Promise<Contest | null> {
        return this.contestRepository.findById(id);
    }

    async getContestStatus(id: string): Promise<ContestStatus | null> {
        const contest = await this.contestRepository.findById(id);
        if (!contest) return null;
        return getContestStatus(contest);
    }

    async getMyContests(userId: string, limit: number = 50, offset: number = 0): Promise<Contest[]> {
        return this.contestRepository.findByCreator(userId, limit, offset);
    }

    async createContest(
        name: string,
        description: string | null,
        startsAt: Date,
        endsAt: Date,
        isPublic: boolean,
        createdBy: string
    ): Promise<Contest> {
        if (endsAt <= startsAt) {
            throw new AppError("INVALID_INPUT", "Contest end time must be after start time", 400);
        }

        return this.contestRepository.create({
            name,
            description,
            starts_at: startsAt,
            ends_at: endsAt,
            is_public: isPublic,
            created_by: createdBy,
        });
    }

    async updateContest(id: string, updates: any): Promise<Contest | null> {
        if (updates.ends_at && updates.starts_at && updates.ends_at <= updates.starts_at) {
            throw new AppError("INVALID_INPUT", "Contest end time must be after start time", 400);
        }
        return this.contestRepository.update(id, updates);
    }

    async deleteContest(id: string): Promise<boolean> {
        return this.contestRepository.delete(id);
    }

    async getProblems(contestId: string): Promise<ContestProblem[]> {
        return this.contestRepository.getProblems(contestId);
    }

    async addProblem(contestId: string, problemId: string, position: number): Promise<ContestProblem> {
        return this.contestRepository.addProblem(contestId, problemId, position);
    }

    async removeProblem(contestId: string, problemId: string): Promise<boolean> {
        return this.contestRepository.removeProblem(contestId, problemId);
    }

    async registerForContest(contestId: string, userId: string): Promise<void> {
        const contest = await this.contestRepository.findById(contestId);
        if (!contest) {
            throw new AppError("NOT_FOUND", "Contest not found", 404);
        }

        const status = getContestStatus(contest);
        if (status === "finished") {
            throw new AppError("INVALID_INPUT", "Cannot register for a finished contest", 400);
        }

        await this.contestRepository.registerUser(contestId, userId);
        await this.contestRepository.addParticipant(contestId, userId);
    }

    async isUserRegistered(contestId: string, userId: string): Promise<boolean> {
        return this.contestRepository.isRegistered(contestId, userId);
    }

    async getStandings(contestId: string): Promise<any[]> {
        return this.contestRepository.getStandings(contestId);
    }

    async getContestsByStatus(status: ContestStatus, limit: number = 50, offset: number = 0): Promise<Contest[]> {
        const allContests = await this.getPublicContests(1000, 0); // Get all to filter
        const now = new Date();

        const filtered = allContests.filter((c) => getContestStatus(c) === status);
        return filtered.slice(offset, offset + limit);
    }

    async createPrivateProblem(contestId: string, problemData: any, createdBy: string): Promise<any> {
        const problemId = uuidv4();
        const now = new Date();

        const problem = {
            id: problemId,
            title: problemData.title,
            description: problemData.description || "",
            statement: problemData.statement || "",
            difficulty: problemData.difficulty,
            timeLimitMs: problemData.timeLimitMs,
            memoryLimitMb: problemData.memoryLimitMb,
            testcaseSetId: problemData.testcaseSetId || null,
            tags: problemData.tags || [],
            category: problemData.category || [],
            createdAt: now,
            updatedAt: now,
            isPrivate: true,
            contestId: contestId,
            publishedAt: undefined
        };

        await this.problemRepository.createPrivateProblem(problem, contestId);
        return problem;
    }
}
