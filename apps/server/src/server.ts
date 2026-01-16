import { Worker } from "node:worker_threads";
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
const child = spawn('node', ['dist/worker.js'], {
    detached: true,
    stdio: "pipe"
});

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});