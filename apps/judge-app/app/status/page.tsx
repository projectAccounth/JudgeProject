"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { checkBackendStatus } from "@/app/lib/backend-status";
import { checkOllamaHealth } from "@/app/lib/backendServer";

interface ServiceStatus {
    name: string;
    status: "online" | "offline" | "checking";
    message: string;
    timestamp?: Date;
}

export default function StatusPage() {
    const { t } = useTranslation();
    const [services, setServices] = useState<ServiceStatus[]>([
        { name: t("status.backendServer"), status: "checking", message: t("status.checking") },
        { name: t("status.ollamaAiServer"), status: "checking", message: t("status.checking") },
    ]);
    const [lastCheck, setLastCheck] = useState<Date>(new Date());

    const checkAllServices = async () => {
        const newServices: ServiceStatus[] = [];

        // Check backend
        const backendStatus = await checkBackendStatus();
        newServices.push({
            name: t("status.backendServer"),
            status: backendStatus.available ? "online" : "offline",
            message: backendStatus.message,
            timestamp: backendStatus.timestamp,
        });

        // Check Ollama
        const ollamaResponse = await checkOllamaHealth();
        newServices.push({
            name: t("status.ollamaAiServer"),
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
    const getStatusLabel = (status: string) => {
        switch(status) {
            case "online": return t("status.online");
            case "offline": return t("status.offline");
            case "checking": return t("status.checking");
            default: return status;
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        
        if (diffSecs < 5) return t("status.just_now");
        if (diffSecs < 60) return `${diffSecs}s ago`;
        if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
        return date.toLocaleTimeString();
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-flex items-center gap-2">
                        ← {t("common.back")}
                    </Link>
                    <h1 className="text-4xl font-bold text-white mb-2">{t("status.title")}</h1>
                    <p className="text-gray-400">{t("status.subtitle")}</p>
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
                            {allOnline ? "✓ " + t("status.serviceHealth") : "⚠ " + t("status.serviceHealth")}
                        </h2>
                    </div>
                    <p className="text-gray-400 text-sm">
                        {t("status.lastChecked")}: {lastCheck.toLocaleTimeString()}
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
                                        {getStatusLabel(service.status)}
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-300">{service.message}</p>
                            {service.timestamp && (
                                <p className="text-gray-500 text-xs mt-2">
                                    {t("status.lastChecked")}: {formatTime(service.timestamp)}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Troubleshooting Guide */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">{t("status.troubleshooting")}</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-red-300 mb-2">{t("status.backendsOffline")}</h4>
                            <ul className="text-gray-300 text-sm space-y-1 ml-4">
                                <li>✓ {t("status.backendOfflineStep1")}</li>
                                <li>✓ {t("status.backendOfflineStep2")}</li>
                                <li>✓ {t("status.backendOfflineStep3")}</li>
                                <li>✓ {t("status.backendOfflineStep4")}</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-red-300 mb-2">{t("status.ollamaOffline")}</h4>
                            <ul className="text-gray-300 text-sm space-y-1 ml-4">
                                <li>✓ {t("status.ollamaOfflineStep1")}</li>
                                <li>✓ {t("status.ollamaOfflineStep2")}</li>
                                <li>✓ {t("status.ollamaOfflineStep3")}</li>
                                <li>✓ {t("status.ollamaOfflineStep4")}</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-red-300 mb-2">{t("status.generalTroubleshooting")}</h4>
                            <ul className="text-gray-300 text-sm space-y-1 ml-4">
                                <li>✓ {t("status.generalTroubleshootingStep1")}</li>
                                <li>✓ {t("status.generalTroubleshootingStep2")}</li>
                                <li>✓ {t("status.generalTroubleshootingStep3")}</li>
                                <li>✓ {t("status.generalTroubleshootingStep4")}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Auto-Refresh Info */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>{t("status.autoRefresh")}</p>
                </div>
            </div>
        </main>
    );
}
