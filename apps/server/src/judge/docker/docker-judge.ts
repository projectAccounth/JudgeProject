import { execFile, spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { Judge, JudgeRequest, JudgeResult } from "../../domain/judge";

type RunOutcome = "OK" | "TLE" | "OOM";

export class DockerJudge implements Judge {
    async run(req: JudgeRequest): Promise<JudgeResult> {
        if (req.language !== "python") {
            throw new Error("Unsupported language");
        }

        const dir = await fs.mkdtemp(path.join(os.tmpdir(), "judge-"));

        try {
            await this.prepareFiles(dir, req);

            const outcome = await this.runContainer(dir, req.limits);

            if (outcome === "TLE") {
                return this.makeSyntheticResult("TLE", req);
            }

            if (outcome === "OOM") {
                return this.makeSyntheticResult("MLE", req);
            }

            const resultPath = path.join(dir, "out", "result.json");

            if (!(await exists(resultPath))) {
                throw new Error("Sandbox exited without producing result.json");
            }

            return JSON.parse(await fs.readFile(resultPath, "utf-8"));
        } finally {
            await fs.rm(dir, { recursive: true, force: true });
        }
    }

    private async prepareFiles(dir: string, req: JudgeRequest): Promise<void> {
        await fs.mkdir(path.join(dir, "src"));
        await fs.mkdir(path.join(dir, "tests"));
        await fs.mkdir(path.join(dir, "limits"));
        await fs.mkdir(path.join(dir, "out"));

        await fs.writeFile(
            path.join(dir, "src", "Main.py"),
            req.sourceCode,
            "utf-8"
        );

        await fs.writeFile(
            path.join(dir, "tests", "testcases.json"),
            JSON.stringify(req.testCases),
            "utf-8"
        );

        await fs.writeFile(
            path.join(dir, "limits", "limits.json"),
            JSON.stringify(req.limits),
            "utf-8"
        );
    }

    private runContainer(
        dir: string,
        limits: { timeMs: number; memoryMb: number }
    ): Promise<RunOutcome> {
        const args = this.buildDockerArgs(dir, limits);

        return new Promise((resolve) => {
            execFile(
                "docker",
                args,
                { timeout: limits.timeMs },
                (err) => {
                    if (!err) {
                        resolve("OK");
                        return;
                    }

                    // node timeout
                    if ((err as any).killed) {
                        resolve("TLE");
                        return;
                    }

                    // oom sigkill
                    if ((err as any).code === 137) {
                        resolve("OOM");
                        return;
                    }

                    resolve("OK");
                }
            );
        });
    }

    private buildDockerArgs(
        dir: string,
        limits: { timeMs: number; memoryMb: number }
    ): string[] {
        return [
            "run",
            "--rm",

            "--network=none",
            "--pids-limit=64",
            "--cpus=1",
            `--memory=${limits.memoryMb}m`,
            "--read-only",

            "-v", `${this.normalizePath(path.join(dir, "src"))}:/sandbox/src:ro`,
            "-v", `${this.normalizePath(path.join(dir, "tests"))}:/sandbox/tests:ro`,
            "-v", `${this.normalizePath(path.join(dir, "limits"))}:/sandbox/limits:ro`,
            "-v", `${this.normalizePath(path.join(dir, "out"))}:/sandbox/out:rw`,

            "judge-python"
        ];
    }

    private normalizePath(p: string): string {
        return os.platform() === "win32"
            ? p.replaceAll(/\\/g, "/")
            : p;
    }

    private makeSyntheticResult(
        status: JudgeResult["status"],
        req: JudgeRequest
    ): JudgeResult {
        return {
            status,
            stdout: "",
            stderr: "",
            timeMs: req.limits.timeMs,
            memoryKb: 0,
            passed: 0,
            total: req.testCases.length
        };
    }
}

function exec(cmd: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        execFile(cmd, args, err => (err ? reject(err) : resolve()));
    });
}

async function exists(p: string): Promise<boolean> {
    try {
        await fs.stat(p);
        return true;
    } catch {
        return false;
    }
}
