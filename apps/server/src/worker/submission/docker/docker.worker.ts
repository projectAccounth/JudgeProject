import path from "node:path";
import { promises as fs } from "node:fs";
import { exec, execCapture } from "./utils";
import { normalizePath } from "../../../utils/path";
import os from "node:os";

const WORKERS_BASE_DIR = path.join(os.tmpdir(), "judge-workers");
export type RunOutcome = "OK" | "TLE" | "OOM";

export class DockerWorker {
    private containerId!: string;
    private running = false;

    private readonly rootDir: string;
    private readonly srcDir: string;
    private readonly testsDir: string;
    private readonly limitsDir: string;
    public readonly outDir: string;

    constructor(
        private readonly image: string,
        private readonly memoryMb: number,
        workerId: number
    ) {
        this.rootDir = path.join(WORKERS_BASE_DIR, `worker-${workerId}`);
        this.srcDir = path.join(this.rootDir, "src");
        this.testsDir = path.join(this.rootDir, "tests");
        this.limitsDir = path.join(this.rootDir, "limits");
        this.outDir = path.join(this.rootDir, "out");
    }

    async init(): Promise<void> {
        await fs.mkdir(this.srcDir, { recursive: true });
        await fs.mkdir(this.testsDir, { recursive: true });
        await fs.mkdir(this.limitsDir, { recursive: true });
        await fs.mkdir(this.outDir, { recursive: true });

        await fs.chmod(this.outDir, 0o777).catch(() => {});
    }

    async start(): Promise<void> {
        this.containerId = await execCapture("docker", [
            "create",

            "--network=none",
            "--pids-limit=64",
            "--cpus=1",
            `--memory=${this.memoryMb}m`,
            "--read-only",
            "--security-opt=no-new-privileges",
            "--cap-drop=ALL",

            "-v", `${normalizePath(this.srcDir)}:/sandbox/src:ro`,
            "-v", `${normalizePath(this.testsDir)}:/sandbox/tests:ro`,
            "-v", `${normalizePath(this.limitsDir)}:/sandbox/limits:ro`,
            "-v", `${normalizePath(this.outDir)}:/sandbox/out:rw`,

            this.image
        ]);

        await exec("docker", ["start", this.containerId]);
        this.running = true;
    }

    async stop(): Promise<void> {
        if (!this.running) return;
        await exec("docker", ["rm", "-f", this.containerId]);
        this.running = false;
    }

    async reset(): Promise<void> {
        this.ensureRunning();

        await fs.rm(this.srcDir, { recursive: true, force: true });
        await fs.rm(this.testsDir, { recursive: true, force: true });
        await fs.rm(this.limitsDir, { recursive: true, force: true });
        await fs.rm(this.outDir, { recursive: true, force: true });

        await fs.mkdir(this.srcDir, { recursive: true });
        await fs.mkdir(this.testsDir, { recursive: true });
        await fs.mkdir(this.limitsDir, { recursive: true });
        await fs.mkdir(this.outDir, { recursive: true });
    }

    async copyIn(
        src: string,
        dest: "src" | "tests" | "limits" | "out"
    ): Promise<void> {
        this.ensureRunning();

        const target =
            dest === "src" ? this.srcDir :
            dest === "tests" ? this.testsDir :
            dest === "limits" ? this.limitsDir :
            this.outDir;

        await fs.cp(src, target, { recursive: true });
    }

    async run(): Promise<RunOutcome> {
        this.ensureRunning();

        try {
            await exec("docker", [
                "exec",
                this.containerId,
                "python3",
                "/sandbox/runner.py"
            ]);
            return "OK";
        } catch (e: any) {
            if (e.code === 137) return "OOM";
            if (e.killed) return "TLE";
            return "OK";
        }
    }

    private ensureRunning(): void {
        if (!this.running) {
            throw new Error("DockerWorker container is not running");
        }
    }

    async dispose(): Promise<void> {
        try {
            if (this.running) {
                await exec("docker", ["rm", "-f", this.containerId]);
            }
        } catch {
            // ignore: container may already be gone
        } finally {
            this.running = false;
        }

        await fs.rm(this.rootDir, { recursive: true, force: true });
    }
}
