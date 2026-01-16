export class HealthService {
    async getHealth() {
        return {
            status: "ok",
            uptime: process.uptime(),
        };
    }
}

