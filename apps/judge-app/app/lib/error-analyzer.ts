/**
 * Error Analyzer - Parses compiler and runtime errors into beginner-friendly messages
 */

import { generateCppChecklist } from "./checklists/cpp-checklist";
import { generatePythonChecklist } from "./checklists/python-checklist";
import { generateJavaScriptChecklist } from "./checklists/javascript-checklist";

export interface BeginnerChecklistItem {
    category: string;
    description: string;
    found: boolean;
    severity: "error" | "warning" | "info";
}

export interface AnalysisResult {
    feedback: string;
    checklist: BeginnerChecklistItem[];
}

function parseStderr(stderr: string): string[] {
    if (!stderr) return [];
    return stderr.split("\n").filter((line) => line.trim());
}

export function analyzeCompilerErrors(
    language: string,
    stderr: string,
    passed: number,
    total: number
): BeginnerChecklistItem[] {
    if (language === "cpp" || language === "c") {
        return generateCppChecklist(stderr, passed, total);
    } else if (language === "python") {
        return generatePythonChecklist(stderr, passed, total);
    } else if (language === "js") {
        return generateJavaScriptChecklist(stderr, passed, total);
    }

    return [];
}

export function generateFeedback(
    status: string,
    passed: number,
    total: number,
    timeMs: number,
    hasCompilerErrors: boolean
): string[] {
    const messages: string[] = [];

    if (hasCompilerErrors) {
        messages.push("feedback.compilation_error");
    } else if (passed === total) {
        messages.push("feedback.all_passed");
    } else if (passed === total - 1) {
        messages.push("feedback.almost_there");
    } else if (passed > 0) {
        messages.push(`feedback.some_failed`);
    } else {
        messages.push("feedback.none_passed");
    }

    if (status === "RUNTIME_ERROR") {
        messages.push("feedback.runtime_error");
    }

    if (timeMs > 2000) {
        messages.push("feedback.slow_solution");
    }

    return messages;
}
