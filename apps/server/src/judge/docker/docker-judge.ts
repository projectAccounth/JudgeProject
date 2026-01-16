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
        const containerName =
            `judge-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const args = this.buildDockerArgs(dir, limits, containerName);

        return new Promise((resolve, reject) => {
            const proc = spawn("docker", args, { stdio: "ignore" });

            let finished = false;

            const killHard = async () => {
                await exec("docker", ["kill", containerName]);
            };

            const killSoft = async () => {
                await exec("docker", ["stop", "-t", "1", containerName]);
            };

            const timer = setTimeout(async () => {
                if (finished) return;
                finished = true;

                await killSoft();
                setTimeout(killHard, 500);

                resolve("TLE");
            }, limits.timeMs);

            proc.on("exit", async () => {
                if (finished) return;
                finished = true;

                clearTimeout(timer);

                try {
                    const info = await this.inspectContainer(containerName);

                    if (info.oomKilled) {
                        resolve("OOM");
                        return;
                    }

                    resolve("OK");
                } catch (err) {
                    reject(err);
                }
            });

            proc.on("error", err => {
                if (finished) return;
                finished = true;

                clearTimeout(timer);
                reject(err);
            });
        });
    }

    private buildDockerArgs(
        dir: string,
        limits: { timeMs: number; memoryMb: number },
        name: string
    ): string[] {
        const isLinux = os.platform() === "linux";

        const mounts = [
            ["src", "ro"],
            ["tests", "ro"],
            ["limits", "ro"],
            ["out", "rw"]
        ].flatMap(([name, mode]) => [
            "-v",
            `${this.normalizePath(path.join(dir, name))}:/sandbox/${name}:${mode}`
        ]);

        const args: string[] = [
            "run",
            "--rm",
            "--name", name,

            "--network=none",
            "--pids-limit=64",
            "--cpus=1",
            `--memory=${limits.memoryMb}m`,
            "--read-only",

            ...mounts,

            "judge-python"
        ];

        if (isLinux) {
            args.splice(
                6,
                0,
                "--cap-drop=ALL",
                "--security-opt=no-new-privileges",
                "--security-opt=seccomp=default",
                "--ulimit", `cpu=${Math.ceil(limits.timeMs / 1000)}`
            );
        }

        return args;
    }

    private normalizePath(p: string): string {
        return os.platform() === "win32"
            ? p.replaceAll(/\\/g, "/")
            : p;
    }

    private async inspectContainer(id: string): Promise<{
        exitCode: number;
        oomKilled: boolean;
    }> {
        return new Promise((resolve, reject) => {
            execFile(
                "docker",
                ["inspect", id, "--format", "{{.State.ExitCode}} {{.State.OOMKilled}}"],
                (err, stdout) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    const [code, oom] = stdout.trim().split(" ");
                    resolve({
                        exitCode: Number(code),
                        oomKilled: oom === "true"
                    });
                }
            );
        });
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
