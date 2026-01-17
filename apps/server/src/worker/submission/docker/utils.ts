import { execFile } from "node:child_process";

export function execCapture(
    cmd: string,
    args: string[],
    timeoutMs?: number
): Promise<string> {
    return new Promise((resolve, reject) => {
        execFile(
            cmd,
            args,
            { timeout: timeoutMs },
            (err, stdout, stderr) => {
                if (err) {
                    const e = new Error(
                        `Command failed: ${cmd} ${args.join(" ")}\n${stderr}`
                    );
                    (e as any).cause = err;
                    reject(e);
                    return;
                }

                resolve(stdout.trim());
            }
        );
    });
}

export function exec(
    cmd: string,
    args: string[],
    opts: { timeout?: number } = {}
): Promise<void> {
    return new Promise((resolve, reject) => {
        execFile(cmd, args, opts, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function execWithTimeout(
    cmd: string,
    args: string[],
    timeoutMs: number
): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = execFile(cmd, args, (err) => {
            if (err) reject(err);
            else resolve();
        });

        const timer = setTimeout(() => {
            child.kill("SIGKILL");
            reject(Object.assign(new Error("TLE"), { killed: true }));
        }, timeoutMs);

        child.on("exit", () => clearTimeout(timer));
    });
}
