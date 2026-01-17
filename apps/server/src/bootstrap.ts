import { buildApp } from "./app";
import { env } from "./config/env";
import { spawn } from "node:child_process";

async function start() {
    const app = buildApp();

    try {
        await app.listen({ port: env.port });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

start();

const submissionWorker = spawn('node', ['dist/worker.js'], {
    detached: true,
    stdio: "pipe"
});

submissionWorker.stdout.on('data', (data) => {
    console.log(`\x1b[32m[SubmissionWorker/INFO]\x1b[0m: ${data}`);
});

submissionWorker.stderr.on('data', (data) => {
    console.error(`\x1b[32m[SubmissionWorker/INFO]\x1b[0m: ${data}`);
});