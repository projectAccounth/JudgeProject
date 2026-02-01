export class WorkerPool<T> {
    private readonly idle: T[] = [];
    private readonly busy = new Set<T>();
    private readonly waiters: ((w: T) => void)[] = [];

    constructor(workers: T[]) {
        this.idle = workers;
    }

    workers(): T[] {
        return [...this.idle, ...Array.from(this.busy)];
    }

    getStats() {
        return {
            idle: this.idle.length,
            busy: this.busy.size,
            waiting: this.waiters.length,
            total: this.idle.length + this.busy.size,
        };
    }

    async acquire(): Promise<T> {
        const w = this.idle.pop();
        if (w) {
            this.busy.add(w);
            return w;
        }
        return new Promise(res => this.waiters.push(res));
    }

    release(w: T): void {
        this.busy.delete(w);
        const next = this.waiters.shift();
        if (next) {
            next(w);
        } else {
            this.idle.push(w);
        }
    }
}
