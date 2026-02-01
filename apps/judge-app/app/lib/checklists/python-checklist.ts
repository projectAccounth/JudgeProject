import { BeginnerChecklistItem } from "./types";

export function generatePythonChecklist(
    stderr: string,
    passed: number,
    total: number
): BeginnerChecklistItem[] {
    const items: BeginnerChecklistItem[] = [];

    if (stderr.includes("Error")) {
        if (stderr.includes("IndentationError")) {
            items.push({
                category: "Indentation",
                description: "hints.python.indentation",
                found: true,
                severity: "error",
            });
        }

        if (stderr.includes("SyntaxError")) {
            items.push({
                category: "Syntax",
                description: "hints.python.syntax",
                found: true,
                severity: "error",
            });
        }

        if (stderr.includes("NameError")) {
            items.push({
                category: "Variables",
                description: "hints.python.variables",
                found: true,
                severity: "error",
            });
        }

        if (stderr.includes("TypeError")) {
            items.push({
                category: "Types",
                description: "hints.python.types",
                found: true,
                severity: "error",
            });

            items.push({
                category: "Type Hints",
                description: "hints.python.type_hints",
                found: true,
                severity: "error",
            });
        }

        if (stderr.includes("IndexError")) {
            items.push({
                category: "Arrays",
                description: "hints.python.index_error",
                found: true,
                severity: "error",
            });
        }

        if (stderr.includes("AttributeError")) {
            items.push({
                category: "Methods",
                description: "hints.python.methods",
                found: true,
                severity: "error",
            });
        }

        if (stderr.includes("ValueError")) {
            items.push({
                category: "Type Conversion",
                description: "hints.python.type_conversion",
                found: true,
                severity: "error",
            });
        }
    } else if (passed < total) {
        // Logic errors
        items.push({
            category: "Logic",
            description: "hints.python.logic",
            found: true,
            severity: "warning",
        });

        if (passed === 0) {
            items.push({
                category: "Data Types",
                description: "hints.python.data_types",
                found: true,
                severity: "warning",
            });

            items.push({
                category: "Large Numbers",
                description: "hints.python.large_numbers",
                found: true,
                severity: "warning",
            });
        }
    } else {
        // All passed
        items.push({
            category: "Code Quality",
            description: "hints.python.code_quality",
            found: false,
            severity: "info",
        });
    }

    return items;
}
