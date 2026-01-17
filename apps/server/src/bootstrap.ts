import { buildApp } from "./app";
import { env } from "./config/env";

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