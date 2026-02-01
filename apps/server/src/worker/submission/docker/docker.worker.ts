import path from "node:path";
import { promises as fs } from "node:fs";
import { exec, execCapture } from "./utils";
import { normalizePath } from "../../../utils/path";
import os from "node:os";

const WORKERS_BASE_DIR = path.join(os.tmpdir(), "judge-workers");

export type RunOutcome = "OK" | "TLE" | "OOM" | "ERROR";

interface WorkerConfig {
    maxFailuresBeforeReset?: number;
    healthCheckIntervalMs?: number;
}

const DEFAULT_CONFIG: Required<WorkerConfig> = {
    maxFailuresBeforeReset: 5,
    healthCheckIntervalMs: 60_000,
};

export class DockerWorker {
    private containerId!: string;
    private running = false;
    private lastHealthCheck: number = 0;

    private lastRunAt: number | null = null;
    private lastOutcome: RunOutcome | null = null;
    private consecutiveFailures = 0;
    private totalFailures = 0;

    private readonly rootDir: string;
    private readonly srcDir: string;
    private readonly testsDir: string;
    private readonly limitsDir: string;
    public readonly outDir: string;
    private readonly config: Required<WorkerConfig>;

    constructor(
        private readonly image: string,
        private readonly memoryMb: number,
        workerId: number,
        config?: WorkerConfig
    ) {
        this.rootDir = path.join(WORKERS_BASE_DIR, `worker-${workerId}`);
        this.srcDir = path.join(this.rootDir, "src");
        this.testsDir = path.join(this.rootDir, "tests");
        this.limitsDir = path.join(this.rootDir, "limits");
        this.outDir = path.join(this.rootDir, "out");
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    async init(): Promise<void> {
        try {
            await fs.mkdir(this.srcDir, { recursive: true });
            await fs.mkdir(this.testsDir, { recursive: true });
            await fs.mkdir(this.limitsDir, { recursive: true });
            await fs.mkdir(this.outDir, { recursive: true });

            await fs.chmod(this.outDir, 0o777).catch(() => {});
        } catch (error) {
            console.error("Failed to initialize worker directories:", error);
            throw new Error(`Worker initialization failed: ${error}`);
        }
    }

    async start(): Promise<void> {
        try {
            this.containerId = await execCapture("docker", [
                "create",
                "--network=none",
                "--pids-limit=64",
                "--cpus=1",
                `--memory=${this.memoryMb}m`,
                "--memory-swap=0",
                "--oom-kill-disable=false",
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
            this.lastHealthCheck = Date.now();
            this.consecutiveFailures = 0;
        } catch (error) {
            this.running = false;
            console.error("Failed to start docker container:", error);
            throw new Error(`Failed to start worker container: ${error}`);
        }
    }

    async stop(): Promise<void> {
        if (!this.running) return;
        
        try {
            await exec("docker", ["stop", this.containerId], { timeout: 5000 });
        } catch (error) {
            // If graceful stop fails, force kill
            try {
                await exec("docker", ["kill", this.containerId]);
            } catch {
                // Container might already be gone
            }
        }

        try {
            await exec("docker", ["rm", "-f", this.containerId]);
        } catch {
            // Container might already be gone
        }
        
        this.running = false;
    }

    async reset(): Promise<void> {
        this.ensureRunning();

        try {
            await fs.rm(this.srcDir, { recursive: true, force: true });
            await fs.rm(this.testsDir, { recursive: true, force: true });
            await fs.rm(this.limitsDir, { recursive: true, force: true });
            await fs.rm(this.outDir, { recursive: true, force: true });

            await fs.mkdir(this.srcDir, { recursive: true });
            await fs.mkdir(this.testsDir, { recursive: true });
            await fs.mkdir(this.limitsDir, { recursive: true });
            await fs.mkdir(this.outDir, { recursive: true });
        } catch (error) {
            console.error("Failed to reset worker directories:", error);
            throw new Error(`Failed to reset worker: ${error}`);
        }
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

        try {
            await fs.cp(src, target, { recursive: true });
        } catch (error) {
            console.error(`Failed to copy files to ${dest}:`, error);
            throw new Error(`Failed to copy files: ${error}`);
        }
    }

    getHealth() {
        return {
            containerId: this.containerId,
            running: this.running,
            lastRunAt: this.lastRunAt,
            lastOutcome: this.lastOutcome,
            consecutiveFailures: this.consecutiveFailures,
            totalFailures: this.totalFailures,
            lastHealthCheck: this.lastHealthCheck,
            needsRestart: this.consecutiveFailures >= this.config.maxFailuresBeforeReset,
        };
    }

    private async isHealthy(): Promise<boolean> {
        if (!this.running) return false;

        try {
            await execCapture("docker", ["inspect", this.containerId]);
            return true;
        } catch {
            return false;
        }
    }

    private async recoverFromFailure(): Promise<void> {
        console.warn(
            `Worker recovering from failure (${this.consecutiveFailures}/${this.config.maxFailuresBeforeReset})`
        );

        if (this.consecutiveFailures >= this.config.maxFailuresBeforeReset) {
            console.warn("Max consecutive failures reached, restarting container...");
            await this.stop();
            await this.start();
        }
    }

    private classifyError(error: any): RunOutcome {
        if (!error) return "ERROR";

        // Exit code 137 indicates OOM (SIGKILL from kernel OOM killer)
        if (error.code === 137 || error.signal === "SIGKILL") {
            return "OOM";
        }

        // Any other error - TLE is handled by the runner itself and returns OK with TLE in output
        return "ERROR";
    }

    async run(): Promise<RunOutcome> {
        // Check if we need to restart due to too many consecutive failures
        if (this.consecutiveFailures >= this.config.maxFailuresBeforeReset) {
            await this.recoverFromFailure();
        }

        this.ensureRunning();

        // Health check
        if (!(await this.isHealthy())) {
            this.running = false;
            console.error("Container health check failed");
            this.consecutiveFailures++;
            this.totalFailures++;
            await this.recoverFromFailure();
            return "ERROR";
        }

        this.lastRunAt = Date.now();

        try {
            // Run without timeout - the runner.py driver handles timeout detection internally
            await exec("docker", [
                "exec",
                this.containerId,
                "python3",
                "/sandbox/runner.py",
            ]);

            this.lastOutcome = "OK";
            this.consecutiveFailures = 0;
            return "OK";
        } catch (error: any) {
            const outcome = this.classifyError(error);
            this.lastOutcome = outcome;
            this.consecutiveFailures++;
            this.totalFailures++;

            console.error(
                `Submission execution failed with outcome: ${outcome}`,
                {
                    consecutiveFailures: this.consecutiveFailures,
                    totalFailures: this.totalFailures,
                    error: error?.message,
                }
            );

            // Attempt recovery if too many failures
            if (this.consecutiveFailures >= this.config.maxFailuresBeforeReset) {
                try {
                    await this.recoverFromFailure();
                } catch (recoveryError) {
                    console.error("Recovery failed:", recoveryError);
                }
            }

            return outcome;
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
                await this.stop();
            }
        } catch (error) {
            console.error("Error during worker disposal:", error);
        }

        try {
            await fs.rm(this.rootDir, { recursive: true, force: true });
        } catch (error) {
            console.error("Failed to clean up worker directory:", error);
        }

        this.running = false;
    }
}
