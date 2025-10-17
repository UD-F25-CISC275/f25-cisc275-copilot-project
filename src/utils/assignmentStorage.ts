import type { Assignment } from "../types/Assignment";

const STORAGE_KEY = "coflowcode-assignments";

const sampleAssignments: Assignment[] = [
    {
        id: 1,
        title: "Introduction to TypeScript",
        description: "Learn the basics of TypeScript and type annotations",
        items: [],
    },
    {
        id: 2,
        title: "React Hooks",
        description: "Master useState, useEffect, and custom hooks",
        items: [],
    },
    {
        id: 3,
        title: "Advanced React Patterns",
        items: [],
    },
];

/**
 * Load assignments from localStorage, or return sample assignments if none exist
 */
export function loadAssignments(): Assignment[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as Assignment[];
        }
    } catch (error) {
        console.error("Error loading assignments from localStorage:", error);
    }
    return sampleAssignments;
}

/**
 * Save assignments to localStorage
 */
export function saveAssignments(assignments: Assignment[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch (error) {
        console.error("Error saving assignments to localStorage:", error);
    }
}

/**
 * Get sample assignments (used for reset functionality)
 */
export function getSampleAssignments(): Assignment[] {
    return sampleAssignments;
}
