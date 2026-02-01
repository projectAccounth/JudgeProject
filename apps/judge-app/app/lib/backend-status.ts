/**
 * Backend Status Checker
 * Monitors backend server health
 */

import { backendGet } from "./backendFetch";

export interface BackendStatus {
    available: boolean;
    message: string;
    timestamp: Date;
}

/**
 * Check if backend server is available
 */
export async function checkBackendStatus(): Promise<BackendStatus> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
        const response = await fetch(`${baseUrl}/health`, {
            method: "GET",
            timeout: 5000,
        } as any);
        
        if (response.ok) {
            return {
                available: true,
                message: "Backend server is online",
                timestamp: new Date(),
            };
        }
        
        return {
            available: false,
            message: `Backend returned status ${response.status}`,
            timestamp: new Date(),
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Connection failed";
        return {
            available: false,
            message: `Backend unavailable: ${message}`,
            timestamp: new Date(),
        };
    }
}
