import { BeginnerChecklistItem } from "./types";

export function generateCppChecklist(
    stderr: string,
    passed: number,
    total: number
): BeginnerChecklistItem[] {
    const items: BeginnerChecklistItem[] = [];

    // Only add checks if there are actual issues
    if (stderr.includes("error:")) {
        if (
            stderr.includes("expected") ||
            stderr.includes("';' expected")
        ) {
            items.push({
                category: "Syntax",
                description: "hints.cpp.syntax",
                found: true,
                severity: "error",
            });
        }

        if (stderr.includes("was not declared")) {
            items.push({
                category: "Variables",
                description: "hints.cpp.variables",
                found: true,
                severity: "error",
            });
        }

        if (
            stderr.includes("undefined reference") ||
            stderr.includes("linker error")
        ) {
            items.push({
                category: "Linking",
                description: "hints.cpp.linking",
                found: true,
                severity: "error",
            });
        }

        if (stderr.includes("invalid type")) {
            items.push({
                category: "Types",
                description: "hints.cpp.type_mismatch",
                found: true,
                severity: "error",
            });
        }

        if (
            stderr.includes("conversion") ||
            stderr.includes("cannot convert")
        ) {
            items.push({
                category: "Type Conversion",
                description: "hints.cpp.type_conversion",
                found: true,
                severity: "error",
            });
        }
    } else if (passed < total) {
        // Logic errors - no compilation errors
        items.push({
            category: "Logic",
            description: "hints.cpp.logic",
            found: true,
            severity: "warning",
        });

        if (passed === 0) {
            items.push({
                category: "Input/Output",
                description: "hints.cpp.input_output",
                found: true,
                severity: "warning",
            });

            items.push({
                category: "Data Types",
                description: "hints.cpp.data_types",
                found: true,
                severity: "warning",
            });

            items.push({
                category: "Integer Overflow",
                description: "hints.cpp.integer_overflow",
                found: true,
                severity: "warning",
            });
        }
    } else {
        // All passed - minimal checks
        items.push({
            category: "Code Quality",
            description: "hints.cpp.code_quality",
            found: false,
            severity: "info",
        });
    }

    return items;
}
