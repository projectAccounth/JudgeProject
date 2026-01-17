import { JudgeResult } from "./judge";

export type SubmissionStatus =
    | "PENDING"
    | "RUNNING"
    | "DONE"
    | "FAILED";

export interface Submission {
    id: string;

    problemId: string;
    userId: string;

    language: string;

    sourceCode: string;

    status: SubmissionStatus;
    result?: JudgeResult;

    createdAt: Date;
    startedAt?: Date;
    finishedAt?: Date;
}

export interface SubmissionRepository {
    add(submission: Submission): Promise<void>;
    findById(id: string): Promise<Submission | null>;
    getAll(): Promise<Submission[]>;
    update(submission: Submission): Promise<void>;

    claimPendingBatch(limit: number, workerId: string): Promise<Submission[]>;
    findStuckRunning(timeoutMs: number): Promise<Submission[]>;
    resetToPending(id: string): Promise<void>;

    delete(id: string): Promise<void>;
    deleteByProblem(problemId: string): Promise<number>;
}