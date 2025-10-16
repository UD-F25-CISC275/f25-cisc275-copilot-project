import type { Assignment } from "../types/Assignment";

/**
 * Export an assignment as a JSON bundle.
 * The bundle contains all metadata, items, pages (derived from page-break items),
 * grading logic (rubrics, AI prompts, unit test files), and all content.
 *
 * @param assignment - The assignment to export
 * @returns A JSON string representation of the assignment bundle
 */
export function exportAssignmentAsJSON(assignment: Assignment): string {
    return JSON.stringify(assignment, null, 2);
}

/**
 * Download an assignment as a JSON file.
 * This function creates a blob from the JSON string and triggers a browser download.
 *
 * @param assignment - The assignment to download
 * @param filename - Optional custom filename (defaults to assignment title)
 */
export function downloadAssignmentJSON(
    assignment: Assignment,
    filename?: string
): void {
    const json = exportAssignmentAsJSON(assignment);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download =
        filename ||
        `${assignment.title.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "")}.json`;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
