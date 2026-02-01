import { BeginnerChecklistItem } from "./types";

export function generateJavaScriptChecklist(
    stderr: string,
    passed: number,
    total: number
): BeginnerChecklistItem[] {
    const items: BeginnerChecklistItem[] = [];

    if (stderr.includes("Error")) {
        if (
            stderr.includes("SyntaxError") ||
            stderr.includes("Unexpected token")
        ) {
            items.push({
                category: "Syntax",
                description: "hints.javascript.syntax",
                found: true,
                severity: "error",
            });
        }

        if (stderr.includes("ReferenceError")) {
            items.push({
                category: "Variables",
                description: "hints.javascript.variables",
                found: true,
                severity: "error",
            });
        }

        if (stderr.includes("TypeError")) {
            items.push({
                category: "Types",
                description: "hints.javascript.types",
                found: true,
                severity: "error",
            });

            items.push({
                category: "Type Coercion",
                description: "hints.javascript.type_coercion",
                found: true,
                severity: "error",
            });
        }

        if (stderr.includes("Cannot read")) {
            items.push({
                category: "Null/Undefined",
                description: "hints.javascript.null_undefined",
                found: true,
                severity: "error",
            });
        }

        if (stderr.includes("NaN")) {
            items.push({
                category: "Type Conversion",
                description: "hints.javascript.nan",
                found: true,
                severity: "error",
            });
        }
    } else if (passed < total) {
        // Logic errors
        items.push({
            category: "Logic",
            description: "hints.javascript.logic",
            found: true,
            severity: "warning",
        });

        if (passed === 0) {
            items.push({
                category: "Data Types",
                description: "hints.javascript.data_types",
                found: true,
                severity: "warning",
            });

            items.push({
                category: "Large Numbers",
                description: "hints.javascript.large_numbers",
                found: true,
                severity: "warning",
            });
        }
    } else {
        // All passed
        items.push({
            category: "Code Quality",
            description: "hints.javascript.code_quality",
            found: false,
            severity: "info",
        });
    }

    return items;
}
