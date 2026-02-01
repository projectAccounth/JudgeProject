"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { checkBackendStatus } from "@/app/lib/backend-status";
import { checkOllamaHealth } from "@/app/lib/backendServer";

interface ServiceStatus {
    name: string;
    status: "online" | "offline" | "checking";
    message: string;
    timestamp?: Date;
}

export default function StatusPage() {
    const [services, setServices] = useState<ServiceStatus[]>([
        { name: "Backend Server", status: "checking", message: "Checking..." },
        { name: "Ollama AI Server", status: "checking", message: "Checking..." },
    ]);
    const [lastCheck, setLastCheck] = useState<Date>(new Date());

    const checkAllServices = async () => {
        const newServices: ServiceStatus[] = [];

        // Check backend
        const backendStatus = await checkBackendStatus();
        newServices.push({
            name: "Backend Server",
            status: backendStatus.available ? "online" : "offline",
            message: backendStatus.message,
            timestamp: backendStatus.timestamp,
        });

        // Check Ollama
        const ollamaResponse = await checkOllamaHealth();
        newServices.push({
            name: "Ollama AI Server",
            status: ollamaResponse.data?.available ? "online" : "offline",
            message: ollamaResponse.data ? 
                `${ollamaResponse.data.model} ready` : 
                ollamaResponse.error || "Connection failed",
            timestamp: new Date(),
        });

        setServices(newServices);
        setLastCheck(new Date());
    };

    useEffect(() => {
        checkAllServices();
        const interval = setInterval(checkAllServices, 10000);
        return () => clearInterval(interval);
    }, []);

    const allOnline = services.every(s => s.status === "online");

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-flex items-center gap-2">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold text-white mb-2">System Status</h1>
                    <p className="text-gray-400">Real-time health monitoring of all services</p>
                </div>

                {/* Overall Status Banner */}
                <div className={`rounded-lg border-2 p-6 mb-8 ${
                    allOnline
                        ? "bg-green-950/30 border-green-600"
                        : "bg-red-950/30 border-red-600"
                }`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-4 h-4 rounded-full ${
                            allOnline ? "bg-green-400 animate-pulse" : "bg-red-400 animate-pulse"
                        }`} />
                        <h2 className={`text-2xl font-bold ${
                            allOnline ? "text-green-300" : "text-red-300"
                        }`}>
                            {allOnline ? "✓ All Systems Operational" : "⚠ Some Services Offline"}
                        </h2>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Last checked: {lastCheck.toLocaleTimeString()}
                    </p>
                </div>

                {/* Service Cards */}
                <div className="grid gap-4 mb-8">
                    {services.map((service) => (
                        <div
                            key={service.name}
                            className={`rounded-lg border-2 p-6 ${
                                service.status === "online"
                                    ? "bg-green-950/20 border-green-600"
                                    : service.status === "offline"
                                    ? "bg-red-950/20 border-red-600"
                                    : "bg-yellow-950/20 border-yellow-600"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${
                                        service.status === "online"
                                            ? "bg-green-400"
                                            : service.status === "offline"
                                            ? "bg-red-400"
                                            : "bg-yellow-400"
                                    } ${service.status === "checking" ? "animate-pulse" : ""}`} />
                                    <span className={`font-semibold uppercase text-sm ${
                                        service.status === "online"
                                            ? "text-green-300"
                                            : service.status === "offline"
                                            ? "text-red-300"
                                            : "text-yellow-300"
                                    }`}>
                                        {service.status}
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-300">{service.message}</p>
                            {service.timestamp && (
                                <p className="text-gray-500 text-xs mt-2">
                                    Checked at: {service.timestamp.toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Troubleshooting Guide */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Troubleshooting</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-red-300 mb-2">Backend Server Offline?</h4>
                            <ul className="text-gray-300 text-sm space-y-1 ml-4">
                                <li>✓ Make sure the backend server is running on port 3001</li>
                                <li>✓ Check that DATABASE_URL is configured correctly</li>
                                <li>✓ Ensure all environment variables are set in .env</li>
                                <li>✓ Check backend logs for errors</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-red-300 mb-2">Ollama Offline?</h4>
                            <ul className="text-gray-300 text-sm space-y-1 ml-4">
                                <li>✓ Start Ollama: <code className="bg-black px-2 py-1 rounded">ollama serve</code></li>
                                <li>✓ Verify Ollama is running on <code className="bg-black px-2 py-1 rounded">http://localhost:11434</code></li>
                                <li>✓ Pull the model: <code className="bg-black px-2 py-1 rounded">ollama pull qwen2.5-coder:3b</code></li>
                                <li>✓ Check OLLAMA_URL in backend .env</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Auto-Refresh Info */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>This page automatically refreshes every 10 seconds</p>
                </div>
            </div>
        </main>
    );
}
