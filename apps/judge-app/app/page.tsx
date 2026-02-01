"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useTranslation } from "react-i18next";

export default function Home() {
    const { user, loading } = useAuth();
    const { t } = useTranslation();

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
            {/* Auth Prompt for Non-Logged-In Users */}
            {!loading && !user && (
                <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border-b border-gray-700 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <p className="text-sm text-gray-300">
                                <span className="font-semibold text-white">{t("home.notLoggedIn")}</span> {t("home.notLoggedInDesc")}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700"
                            >
                                {t("home.signIn")}
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center rounded-lg border border-blue-400 px-4 py-2 text-sm font-semibold text-blue-300 transition-all hover:bg-blue-400/10"
                            >
                                {t("home.signUp")}
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Hero Section */}
            <div className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    {/* Welcome Header */}
                    <div className="text-center">
                        <h1 className="mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
                            {t("home.welcomeTitle")}
                        </h1>
                        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300">
                            {t("home.welcomeDescription")}
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <Link
                                href="/problems"
                                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 font-semibold text-white transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-500/20"
                            >
                                {t("home.startPracticing")}
                                <svg
                                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <Link
                                href="/instructions"
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-600 px-8 py-4 font-semibold text-gray-200 transition-all hover:border-gray-400 hover:bg-gray-800/50"
                            >
                                {t("home.viewGuide")}
                            </Link>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Feature 1: Problems */}
                        <Link
                            href="/problems"
                            className="group relative overflow-hidden rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 transition-all hover:border-blue-500/50 hover:bg-gray-800/80"
                        >
                            <div className="relative z-10">
                                <div className="mb-4 inline-block rounded-lg bg-blue-500/20 p-3">
                                    <span className="text-2xl">💻</span>
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-white">{t("home.solveProblems")}</h3>
                                <p className="text-sm text-gray-400">
                                    {t("home.solveProblemsDesc")}
                                </p>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>

                        {/* Feature 2: AI Feedback */}
                        <div className="group relative overflow-hidden rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6">
                            <div className="relative z-10">
                                <div className="mb-4 inline-block rounded-lg bg-purple-500/20 p-3">
                                    <span className="text-2xl">🤖</span>
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-white">{t("home.aiFeedback")}</h3>
                                <p className="text-sm text-gray-400">
                                    {t("home.aiFeedbackDesc")}
                                </p>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>

                        {/* Feature 3: Track Progress */}
                        <div className="group relative overflow-hidden rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6">
                            <div className="relative z-10">
                                <div className="mb-4 inline-block rounded-lg bg-green-500/20 p-3">
                                    <span className="text-2xl">🚀</span>
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-white">{t("home.trackProgress")}</h3>
                                <p className="text-sm text-gray-400">
                                    {t("home.trackProgressDesc")}
                                </p>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>

                        {/* Feature 4: Learn */}
                        <Link
                            href="/instructions"
                            className="group relative overflow-hidden rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 transition-all hover:border-orange-500/50 hover:bg-gray-800/80"
                        >
                            <div className="relative z-10">
                                <div className="mb-4 inline-block rounded-lg bg-orange-500/20 p-3">
                                    <span className="text-2xl">📚</span>
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-white">{t("home.gettingStarted")}</h3>
                                <p className="text-sm text-gray-400">
                                    {t("home.gettingStartedDesc")}
                                </p>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                    </div>

                    {/* How It Works */}
                    <div className="mt-20">
                        <h2 className="mb-12 text-center text-3xl font-bold text-white">{t("home.howItWorks")}</h2>
                        <div className="grid gap-8 md:grid-cols-3">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                                    1
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-white">{t("home.chooseProblem")}</h3>
                                <p className="text-center text-gray-400">
                                    {t("problems.search_placeholder")}
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-lg font-bold text-white">
                                    2
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-white">{t("home.writeSolveSubmit")}</h3>
                                <p className="text-center text-gray-400">
                                    {t("submission_form.submit_solution")}
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-600 text-lg font-bold text-white">
                                    3
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-white">{t("home.getAiFeedback")}</h3>
                                <p className="text-center text-gray-400">
                                    {t("results.result")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="mt-20 rounded-2xl border border-gray-700 bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-pink-900/50 p-12 text-center">
                        <h2 className="mb-4 text-2xl font-bold text-white">{t("home.readyToStart")}</h2>
                        <p className="mb-8 text-gray-300">
                            {t("home.readyToStartDesc")}
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <Link
                                href="/problems"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20"
                            >
                                {t("home.browseProblems")}
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <Link
                                href="/instructions"
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-600 px-6 py-3 font-semibold text-gray-200 transition-all hover:border-gray-400 hover:bg-gray-800/50"
                            >
                                📖 {t("home.viewTutorial")}
                            </Link>
                            {user && (user.role === "TEACHER" || user.role === "ADMIN") && (
                                <Link
                                    href="/admin-teacher-guide"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-purple-500/50 bg-purple-600/20 px-6 py-3 font-semibold text-purple-300 transition-all hover:bg-purple-600/30 hover:border-purple-400"
                                >
                                    🎓 {t("home.admin")} / {t("home.teacher")}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
