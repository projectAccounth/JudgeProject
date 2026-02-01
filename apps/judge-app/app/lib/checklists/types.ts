/**
 * Shared types for checklists
 */

export interface BeginnerChecklistItem {
    category: string;
    description: string;
    found: boolean;
    severity: "error" | "warning" | "info";
}
