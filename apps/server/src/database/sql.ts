import { Pool } from "pg";

export const db = new Pool({
    host: "127.0.0.1",
    port: 5432,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDB
});

export const userDb = new Pool({
    host: "127.0.0.1",
    port: 5432,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDB
});