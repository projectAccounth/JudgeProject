import { FastifyReply, FastifyRequest } from "fastify";
import { AuthUser, UserRole } from "../domain/user";
import { z } from "zod";

export type AuthRequirement =
    | { type: "NONE" }
    | { type: "OPTIONAL" }
    | { type: "REQUIRED" }
    | { type: "ROLE"; role: UserRole }
    | { type: "ROLE_MIN"; role: UserRole } // Minimum privilege level (teacher or higher)
    | { type: "EXCHANGE_KEY" }; // Server-to-server authentication with exchange key

export type HttpMethod = 
    | "GET"
    | "POST"
    | "PUT"
    | "DELETE"
    | "PATCH"
    | "HEAD"
    | "OPTIONS"
    | "TRACE"
    | "CONNECT";
export interface AppRoute<TBody = unknown, TParams = unknown, TQuery = unknown> {
    method: HttpMethod;
    path: string;
    schema?: {
        body?: any;
        params?: any;
        response?: Record<number, any>;
    };
    auth?: AuthRequirement;
        handler: (ctx: {
        body: TBody;
        params: TParams;
        query: TQuery;
        user?: AuthUser;
        req: FastifyRequest;
        reply: FastifyReply;
    }) => Promise<unknown>;
}
