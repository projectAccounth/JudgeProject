"use client";

import { useState, useEffect } from "react";
import { checkBackendStatus, BackendStatus } from "@/app/lib/backend-status";

export function BackendStatusWarning() {
    const [status, setStatus] = useState<BackendStatus | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            setIsChecking(true);
            const result = await checkBackendStatus();
            setStatus(result);
            setIsChecking(false);
        };

        checkStatus();

        // Check every 30 seconds
        const interval = setInterval(checkStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    if (isChecking || !status) return null;

    if (status.available) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-950 border-b-4 border-red-600 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-6 w-6 text-red-400 animate-pulse"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-red-200">
                                ⚠️ BACKEND SERVER UNAVAILABLE
                            </h3>
                            <p className="text-red-300 text-sm">
                                {status.message} • Check <a href="/status" className="underline font-semibold hover:text-red-100">
                                    /status
                                </a> for details
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setStatus(null)}
                        className="text-red-400 hover:text-red-200 transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}
