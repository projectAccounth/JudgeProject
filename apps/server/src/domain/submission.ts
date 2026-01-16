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
    create(submission: Submission): Promise<void>; 
    findById(id: string): Promise<Submission | null>; 
    update(submission: Submission): Promise<void>; 
    // findNextPending(): Promise<Submission | null>; 
    getAll(): Promise<Submission[]>;
    findStuckRunning(timeoutMs: number): Promise<Submission[]>;
    claimPendingBatch(
        limit: number,
        workerId: string
    ): Promise<Submission[]>;
}

export interface SubmissionQueue {
    enqueue(submissionId: string): Promise<void>;
}
