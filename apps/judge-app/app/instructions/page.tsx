"use client"

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface InstructionStep {
    id: string;
    titleKey: string;
    descKey: string;
    detailsKeys: string[];
    imagePlaceholder: string;
}

export default function InstructionsPage() {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const { t } = useTranslation();

    const instructions: InstructionStep[] = [
        {
            id: "getting-started",
            titleKey: "guide.section_1_title",
            descKey: "guide.section_1_desc",
            imagePlaceholder: "guide.section_1_img",
            detailsKeys: ["guide.section_1_p1", "guide.section_1_p2", "guide.section_1_p3", "guide.section_1_p4", "guide.section_1_p5"],
        },
        {
            id: "understanding-problems",
            titleKey: "guide.section_2_title",
            descKey: "guide.section_2_desc",
            imagePlaceholder: "guide.section_2_img",
            detailsKeys: ["guide.section_2_p1", "guide.section_2_p2", "guide.section_2_p3", "guide.section_2_p4", "guide.section_2_p5", "guide.section_2_p6"],
        },
        {
            id: "writing-solution",
            titleKey: "guide.section_3_title",
            descKey: "guide.section_3_desc",
            imagePlaceholder: "guide.section_3_img",
            detailsKeys: ["guide.section_3_p1", "guide.section_3_p2", "guide.section_3_p3", "guide.section_3_p4", "guide.section_3_p5", "guide.section_3_p6"],
        },
        {
            id: "submitting-code",
            titleKey: "guide.section_4_title",
            descKey: "guide.section_4_desc",
            imagePlaceholder: "guide.section_4_img",
            detailsKeys: ["guide.section_4_p1", "guide.section_4_p2", "guide.section_4_p3", "guide.section_4_p4", "guide.section_4_p5", "guide.section_4_p6"],
        },
        {
            id: "ai-feedback",
            titleKey: "guide.section_5_title",
            descKey: "guide.section_5_desc",
            imagePlaceholder: "guide.section_5_img",
            detailsKeys: ["guide.section_5_p1", "guide.section_5_p2", "guide.section_5_p3", "guide.section_5_p4", "guide.section_5_p5", "guide.section_5_p6", "guide.section_5_p7"],
        },
        {
            id: "debugging-tips",
            titleKey: "guide.section_6_title",
            descKey: "guide.section_6_desc",
            imagePlaceholder: "guide.section_6_img",
            detailsKeys: ["guide.section_6_p1", "guide.section_6_p2", "guide.section_6_p3", "guide.section_6_p4", "guide.section_6_p5", "guide.section_6_p6", "guide.section_6_p7"],
        },
        {
            id: "optimization",
            titleKey: "guide.section_7_title",
            descKey: "guide.section_7_desc",
            imagePlaceholder: "guide.section_7_img",
            detailsKeys: ["guide.section_7_p1", "guide.section_7_p2", "guide.section_7_p3", "guide.section_7_p4", "guide.section_7_p5", "guide.section_7_p6", "guide.section_7_p7"],
        },
        {
            id: "common-mistakes",
            titleKey: "guide.section_8_title",
            descKey: "guide.section_8_desc",
            imagePlaceholder: "guide.section_8_img",
            detailsKeys: ["guide.section_8_p1", "guide.section_8_p2", "guide.section_8_p3", "guide.section_8_p4", "guide.section_8_p5", "guide.section_8_p6", "guide.section_8_p7", "guide.section_8_p8"],
        },
        {
            id: "best-practices",
            titleKey: "guide.section_9_title",
            descKey: "guide.section_9_desc",
            imagePlaceholder: "guide.section_9_img",
            detailsKeys: ["guide.section_9_p1", "guide.section_9_p2", "guide.section_9_p3", "guide.section_9_p4", "guide.section_9_p5", "guide.section_9_p6", "guide.section_9_p7", "guide.section_9_p8"],
        },
        {
            id: "language-specific",
            titleKey: "guide.section_10_title",
            descKey: "guide.section_10_desc",
            imagePlaceholder: "guide.section_10_img",
            detailsKeys: ["guide.section_10_p1", "guide.section_10_p2", "guide.section_10_p3", "guide.section_10_p4", "guide.section_10_p5", "guide.section_10_p6"],
        },
    ];

    const toggleExpanded = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getProTip = (index: number): string => {
        const tipKeys = [
            "guide.proTip_1",
            "guide.proTip_2",
            "guide.proTip_3",
            "guide.proTip_4",
            "guide.proTip_5",
        ];
        return tipKeys[index] || tipKeys[0];
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="mb-4 bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
                        {t("guide.title")}
                    </h1>
                    <p className="text-lg text-gray-300">
                        {t("guide.subtitle")}
                    </p>
                </div>

                {/* Quick Navigation */}
                <div className="mb-12 rounded-xl border border-gray-700 bg-gray-800/50 p-6">
                    <h2 className="mb-4 text-lg font-semibold text-white">{t("guide.quickNavigation")}</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {instructions.map((step) => (
                            <button
                                key={step.id}
                                onClick={() => toggleExpanded(step.id)}
                                className="text-left text-sm text-blue-400 transition-colors hover:text-blue-300"
                            >
                                → {t(step.titleKey)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Instructions Sections */}
                <div className="space-y-4">
                    {instructions.map((step) => (
                        <div
                            key={step.id}
                            className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800/50 transition-all"
                        >
                            {/* Header Button */}
                            <button
                                onClick={() => toggleExpanded(step.id)}
                                className="w-full px-6 py-4 text-left transition-all hover:bg-gray-700/50"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">{t(step.titleKey)}</h2>
                                        <p className="mt-1 text-sm text-gray-400">{t(step.descKey)}</p>
                                    </div>
                                    <svg
                                        className={`flex-shrink-0 h-6 w-6 text-gray-400 transition-transform ${
                                            expandedId === step.id ? "rotate-180" : ""
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {expandedId === step.id && (
                                <div className="border-t border-gray-700 px-6 py-6">
                                    {/* Image Placeholder */}
                                    <div className="mb-6 rounded-lg border-2 border-dashed border-gray-600 bg-gray-900/50 py-12 text-center">
                                        <div className="text-gray-400">
                                            <svg
                                                className="mx-auto mb-3 h-12 w-12"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <p className="text-sm">{t(step.imagePlaceholder)}</p>
                                            <p className="mt-2 text-xs text-gray-500">
                                                {t("guide.screenshotPlaceholder")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-base font-semibold text-white">{t("guide.keyPoints")}</h3>
                                        <ul className="space-y-3">
                                            {step.detailsKeys.map((key) => (
                                                <li key={key} className="flex gap-3 text-gray-300">
                                                    <span className="flex-shrink-0 rounded-full bg-blue-600/30 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                                                        •
                                                    </span>
                                                    <span>{t(key)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Pro Tip */}
                                    {instructions.findIndex(i => i.id === step.id) < 5 && (
                                        <div className="mt-6 rounded-lg border-l-4 border-yellow-500 bg-yellow-900/20 px-4 py-3">
                                            <p className="text-sm text-yellow-200">
                                                <span className="font-semibold">💡 {t("guide.proTip")}:</span> {t(getProTip(instructions.findIndex(i => i.id === step.id)))}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-16 rounded-xl border border-gray-700 bg-gray-800/50 p-8">
                    <h2 className="mb-8 text-2xl font-bold text-white">{t("guide.faqTitle")}</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="mb-2 font-semibold text-blue-300">
                                {t("guide.faq_1_question")}
                            </h3>
                            <p className="text-gray-300">
                                {t("guide.faq_1_answer")}
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-2 font-semibold text-blue-300">
                                {t("guide.faq_2_question")}
                            </h3>
                            <p className="text-gray-300">
                                {t("guide.faq_2_answer")}
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-2 font-semibold text-blue-300">
                                {t("guide.faq_3_question")}
                            </h3>
                            <p className="text-gray-300">
                                {t("guide.faq_3_answer")}
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-2 font-semibold text-blue-300">
                                {t("guide.faq_4_question")}
                            </h3>
                            <p className="text-gray-300">
                                {t("guide.faq_4_answer")}
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-2 font-semibold text-blue-300">
                                {t("guide.faq_5_question")}
                            </h3>
                            <p className="text-gray-300">
                                {t("guide.faq_5_answer")}
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-2 font-semibold text-blue-300">
                                {t("guide.faq_6_question")}
                            </h3>
                            <p className="text-gray-300">
                                {t("guide.faq_6_answer")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="mt-12 rounded-xl border border-gray-700 bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-pink-900/50 p-8 text-center">
                    <h2 className="mb-4 text-2xl font-bold text-white">{t("home.readyToStart")}</h2>
                    <p className="mb-6 text-gray-300">
                        {t("home.readyToStartDesc")}
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <Link
                            href="/problems"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20"
                        >
                            {t("home.browseProblems")}
                        </Link>
                        <Link
                            href="/admin-teacher-guide"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-600 px-6 py-3 font-semibold text-gray-200 transition-all hover:border-gray-400 hover:bg-gray-800/50"
                        >
                            {t("nav.profile")} ({t("home.teacher")}/{t("home.admin")})
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
