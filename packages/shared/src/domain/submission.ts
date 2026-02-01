import { Language } from "./languages.js";
import { JudgeResult, JudgeStatus } from "./judge.js";

export type SubmissionStatus =
    | "PENDING"
    | "RUNNING"
    | "DONE"
    | "FAILED";

export type RunOutcome = "OK" | "TLE" | "OOM";

export interface Submission {
    id: string;

    problemId: string;
    userId: string;

    language: Language;

    sourceCode: string;

    status: SubmissionStatus;
    result?: JudgeResult;

    createdAt: Date;
    startedAt?: Date;
    finishedAt?: Date;
}

export interface SubmissionStats {
    problemId?: string;
    passing: number;
    failing: number;
    pending: number;
};

export interface SubmissionRepository {
    add(submission: Submission): Promise<void>;
    findById(id: string): Promise<Submission | null>;
    getAll(): Promise<Submission[]>;
    getPaginated(
        limit: number, 
        after?: Date
    ): Promise<{ submissions: Submission[], nextCursor: Date | null }>;
    // Count recent submissions from a user within a time window (ms)
    countRecentByUser(userId: string, windowMs: number): Promise<number>;
    update(submission: Submission): Promise<void>;

    claimPendingBatch(limit: number, workerId: string): Promise<Submission[]>;
    findStuckRunning(timeoutMs: number): Promise<Submission[]>;
    findFailed(): Promise<Submission[]>;
    recoverInvalid(timeoutMs: number): Promise<Submission[]>;
    resetToPending(id: string): Promise<void>;

    delete(id: string): Promise<void>;
    deleteByProblem(problemId: string): Promise<number>;
}