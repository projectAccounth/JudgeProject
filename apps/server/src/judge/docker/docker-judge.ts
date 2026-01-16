import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { Judge, JudgeRequest, JudgeResult } from "../../domain/judge";

export class DockerJudge implements Judge {
    async run(req: JudgeRequest): Promise<JudgeResult> {
        console.log("Running.");
        if (req.language !== "python") {
            throw new Error("Unsupported language");
        }

        const dir = await fs.mkdtemp(path.join(os.tmpdir(), "judge-"));

        try {
            console.log("Executing tests.");
            await fs.writeFile(path.join(dir, "Main.py"), req.sourceCode, "utf-8");
            await fs.writeFile(path.join(dir, "testcases.json"), JSON.stringify(req.testCases), "utf-8");
            await fs.writeFile(path.join(dir, "limits.json"), JSON.stringify(req.limits), "utf-8");

            await this.runContainer(dir, req.limits);

            const raw = await fs.readFile(path.join(dir, "result.json"), "utf-8");
            return JSON.parse(raw);
        } finally {
            // await fs.rm(dir, { recursive: true, force: true });
            console.log("Finished execution.");
        }
    }
    
    private runContainer(dir: string, limits: { timeMs: number; memoryMb: number }): Promise<void> {
        return new Promise((resolve, reject) => {
            const args = [
                "run",
                "--rm",
                "--network=none",
                "--cpus=1",
                `--memory=${limits.memoryMb}m`,
                "--pids-limit=64",
                "-v",
                `${dir}:/workspace`,
                "judge-python",
            ];

            execFile("docker", args, { timeout: limits.timeMs + 500 }, (err) => {
                if (err) {
                    reject(err);
                    console.error(err);
                } else {
                    resolve();
                }
            });
        });
    }
}
