"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import styles from "./AdminTeacherGuide.module.css";

interface GuideStep {
    id: string;
    titleKey: string;
    descKey: string;
    detailsKeys: string[];
    type: "admin" | "teacher";
    screenshotCaption?: string;
}

const ScreenshotPlaceholder = ({ caption }: { caption: string }) => (
    <div className={styles.screenshotContainer}>
        <div className={styles.screenshotPlaceholder}>
            <svg
                className={styles.screenshotIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
            </svg>
            <p className={styles.placeholderText}>Screenshot Placeholder</p>
            <p className={styles.placeholderSmallText}>Add your screenshot here</p>
        </div>
        <p className={styles.captionText}>{caption}</p>
    </div>
);

const adminGuides: GuideStep[] = [
    {
        id: "admin-overview",
        titleKey: "adminGuide.section_1_title",
        descKey: "adminGuide.section_1_desc",
        detailsKeys: ["adminGuide.section_1_p1", "adminGuide.section_1_p2", "adminGuide.section_1_p3", "adminGuide.section_1_p4", "adminGuide.section_1_p5", "adminGuide.section_1_p6"],
        type: "admin",
        screenshotCaption: "Admin Dashboard Overview",
    },
    {
        id: "admin-user-management",
        titleKey: "adminGuide.section_2_title",
        descKey: "adminGuide.section_2_desc",
        detailsKeys: ["adminGuide.section_2_p1", "adminGuide.section_2_p2", "adminGuide.section_2_p3", "adminGuide.section_2_p4", "adminGuide.section_2_p5", "adminGuide.section_2_p6", "adminGuide.section_2_p7", "adminGuide.section_2_p8", "adminGuide.section_2_p9"],
        type: "admin",
        screenshotCaption: "User Management Interface",
    },
    {
        id: "admin-problem-management",
        titleKey: "adminGuide.section_3_title",
        descKey: "adminGuide.section_3_desc",
        detailsKeys: ["adminGuide.section_3_p1", "adminGuide.section_3_p2", "adminGuide.section_3_p3", "adminGuide.section_3_p4", "adminGuide.section_3_p5", "adminGuide.section_3_p6", "adminGuide.section_3_p7", "adminGuide.section_3_p8", "adminGuide.section_3_p9", "adminGuide.section_3_p10"],
        type: "admin",
        screenshotCaption: "Problem Management Panel",
    },
    {
        id: "admin-submissions",
        titleKey: "adminGuide.section_4_title",
        descKey: "adminGuide.section_4_desc",
        detailsKeys: ["adminGuide.section_4_p1", "adminGuide.section_4_p2", "adminGuide.section_4_p3", "adminGuide.section_4_p4", "adminGuide.section_4_p5", "adminGuide.section_4_p6", "adminGuide.section_4_p7", "adminGuide.section_4_p8", "adminGuide.section_4_p9"],
        type: "admin",
        screenshotCaption: "Submissions Review Dashboard",
    },
    {
        id: "admin-statistics",
        titleKey: "adminGuide.section_5_title",
        descKey: "adminGuide.section_5_desc",
        detailsKeys: ["adminGuide.section_5_p1", "adminGuide.section_5_p2", "adminGuide.section_5_p3", "adminGuide.section_5_p4", "adminGuide.section_5_p5", "adminGuide.section_5_p6", "adminGuide.section_5_p7", "adminGuide.section_5_p8", "adminGuide.section_5_p9"],
        type: "admin",
        screenshotCaption: "Analytics and Statistics View",
    },
    {
        id: "teacher-getting-started",
        titleKey: "teacherGuide.section_1_title",
        descKey: "teacherGuide.section_1_desc",
        detailsKeys: ["teacherGuide.section_1_p1", "teacherGuide.section_1_p2", "teacherGuide.section_1_p3", "teacherGuide.section_1_p4", "teacherGuide.section_1_p5", "teacherGuide.section_1_p6"],
        type: "teacher",
        screenshotCaption: "Teacher Dashboard",
    },
    {
        id: "teacher-creating-problems",
        titleKey: "teacherGuide.section_2_title",
        descKey: "teacherGuide.section_2_desc",
        detailsKeys: ["teacherGuide.section_2_p1", "teacherGuide.section_2_p2", "teacherGuide.section_2_p3", "teacherGuide.section_2_p4", "teacherGuide.section_2_p5", "teacherGuide.section_2_p6", "teacherGuide.section_2_p7", "teacherGuide.section_2_p8", "teacherGuide.section_2_p9"],
        type: "teacher",
        screenshotCaption: "Problem Creation Interface",
    },
    {
        id: "teacher-analyzing-submissions",
        titleKey: "teacherGuide.section_3_title",
        descKey: "teacherGuide.section_3_desc",
        detailsKeys: ["teacherGuide.section_3_p1", "teacherGuide.section_3_p2", "teacherGuide.section_3_p3", "teacherGuide.section_3_p4", "teacherGuide.section_3_p5", "teacherGuide.section_3_p6", "teacherGuide.section_3_p7", "teacherGuide.section_3_p8", "teacherGuide.section_3_p9"],
        type: "teacher",
        screenshotCaption: "Submission Analysis View",
    },
    {
        id: "teacher-classroom-integration",
        titleKey: "teacherGuide.section_4_title",
        descKey: "teacherGuide.section_4_desc",
        detailsKeys: ["teacherGuide.section_4_p1", "teacherGuide.section_4_p2", "teacherGuide.section_4_p3", "teacherGuide.section_4_p4", "teacherGuide.section_4_p5"],
        type: "teacher",
        screenshotCaption: "Classroom Integration Features",
    },
];

export default function AdminTeacherGuidePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();
    const [expandedStep, setExpandedStep] = useState<string | null>("admin-overview");
    const isTeacher = user?.role === "TEACHER";

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">{t("common.loading")}</div>;
    }

    if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) {
        return null;
    }

    const displayGuides = isTeacher 
        ? adminGuides.filter(g => g.type === "teacher") 
        : adminGuides.filter(g => g.type === "admin");
    const guideTitle = t("guide.adminTeacherGuide");
    const guideDescription = isTeacher
        ? t("guide.teacherGuideDesc")
        : t("guide.adminGuideDesc");

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
            <div className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
                            {guideTitle}
                        </h1>
                        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300">
                            {guideDescription}
                        </p>
                        {isTeacher && (
                            <Link
                                href="/teacher"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 font-semibold text-white transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-500/20"
                            >
                                {t("guide.goToTeacherDashboard")}
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        )}
                        {!isTeacher && (
                            <Link
                                href="/admin/users"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 font-semibold text-white transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-500/20"
                            >
                                {t("guide.goToAdminPanel")}
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        )}
                    </div>

                    {/* Guide Steps */}
                    <div className="space-y-4">
                        {displayGuides.map((step) => (
                            <div
                                key={step.id}
                                className="rounded-lg border border-gray-700 bg-gradient-to-br from-gray-800/50 to-gray-900/50 overflow-hidden transition-all"
                            >
                                <button
                                    onClick={() =>
                                        setExpandedStep(expandedStep === step.id ? null : step.id)
                                    }
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-800/30 transition-colors"
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{t(`guide.${step.titleKey}`)}</h3>
                                        <p className="text-sm text-gray-400 mt-1">{t(`guide.${step.descKey}`)}</p>
                                    </div>
                                    <svg
                                        className={`h-6 w-6 text-gray-400 transition-transform ${
                                            expandedStep === step.id ? "rotate-180" : ""
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                        />
                                    </svg>
                                </button>

                                {expandedStep === step.id && (
                                    <div className="px-6 py-6 border-t border-gray-700 bg-gray-900/50 space-y-8">
                                        {/* Content section */}
                                        <div className="space-y-4">
                                            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/40 rounded-lg p-4">
                                                <p className="text-sm text-gray-200 leading-relaxed">
                                                    {t(`guide.${step.descKey}`)}
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Key Features & Steps</h4>
                                                <ul className="space-y-2.5">
                                                    {step.detailsKeys.map((detailKey, idx) => (
                                                        <li key={idx} className="flex gap-3 text-gray-300">
                                                            <span className="text-blue-400 font-bold mt-0.5 min-w-[20px]">{idx + 1}.</span>
                                                            <span className="text-sm leading-relaxed">{t(`guide.${detailKey}`)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                        
                                        {/* Screenshot section */}
                                        {step.screenshotCaption && (
                                            <div className="pt-6 border-t border-gray-700">
                                                <div className="mb-3">
                                                    <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Visual Reference</h4>
                                                    <p className="text-xs text-gray-400 mt-1">Replace the placeholder below with your actual screenshot</p>
                                                </div>
                                                <ScreenshotPlaceholder caption={step.screenshotCaption} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Quick Links */}
                    <div className="mt-20 rounded-2xl border border-gray-700 bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-pink-900/50 p-12 text-center">
                        <h2 className="mb-4 text-2xl font-bold text-white">{t("guide.needMoreHelp")}</h2>
                        <p className="mb-8 text-gray-300">
                            {t("guide.helpDescription")}
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <Link
                                href="/instructions"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20"
                            >
                                📖 {t("guide.viewMainGuide")}
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-600 px-6 py-3 font-semibold text-gray-200 transition-all hover:border-gray-400 hover:bg-gray-800/50"
                            >
                                {t("guide.backToHome")}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
