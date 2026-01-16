import { Queue } from "bullmq";
import { SubmissionJob } from "./jobs";

export const submissionQueue = new Queue<SubmissionJob>(
    "submissions",
    {
        // exampel
        connection: {
            host: "127.0.0.1",
            port: 6379
        }
    }
);
