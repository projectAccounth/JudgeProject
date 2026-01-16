import { HealthService } from "../services/health.service";


export class HealthController {
    constructor(private readonly service: HealthService) {}

    async create() {
        return this.service.getHealth();
    }
}