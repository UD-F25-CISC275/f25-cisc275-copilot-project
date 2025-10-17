import {
    loadAssignments,
    saveAssignments,
    getSampleAssignments,
} from "../src/utils/assignmentStorage";
import type { Assignment } from "../src/types/Assignment";

describe("assignmentStorage", () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    describe("loadAssignments", () => {
        test("returns sample assignments when localStorage is empty", () => {
            const assignments = loadAssignments();

            expect(assignments).toHaveLength(3);
            expect(assignments[0].title).toBe("Introduction to TypeScript");
            expect(assignments[1].title).toBe("React Hooks");
            expect(assignments[2].title).toBe("Advanced React Patterns");
        });

        test("returns assignments from localStorage when available", () => {
            const customAssignments: Assignment[] = [
                {
                    id: 100,
                    title: "Custom Assignment",
                    description: "This is a custom assignment",
                    items: [],
                },
            ];

            localStorage.setItem(
                "coflowcode-assignments",
                JSON.stringify(customAssignments)
            );

            const assignments = loadAssignments();

            expect(assignments).toHaveLength(1);
            expect(assignments[0].id).toBe(100);
            expect(assignments[0].title).toBe("Custom Assignment");
        });

        test("returns sample assignments when localStorage contains invalid JSON", () => {
            localStorage.setItem(
                "coflowcode-assignments",
                "invalid json data"
            );

            const assignments = loadAssignments();

            expect(assignments).toHaveLength(3);
            expect(assignments[0].title).toBe("Introduction to TypeScript");
        });
    });

    describe("saveAssignments", () => {
        test("saves assignments to localStorage", () => {
            const assignments: Assignment[] = [
                {
                    id: 1,
                    title: "Test Assignment",
                    items: [],
                },
            ];

            saveAssignments(assignments);

            const stored = localStorage.getItem("coflowcode-assignments");
            expect(stored).not.toBeNull();

            if (stored) {
                const parsed = JSON.parse(stored) as Assignment[];
                expect(parsed).toHaveLength(1);
                expect(parsed[0].title).toBe("Test Assignment");
            }
        });

        test("overwrites existing assignments in localStorage", () => {
            const firstAssignments: Assignment[] = [
                {
                    id: 1,
                    title: "First",
                    items: [],
                },
            ];

            const secondAssignments: Assignment[] = [
                {
                    id: 2,
                    title: "Second",
                    items: [],
                },
            ];

            saveAssignments(firstAssignments);
            saveAssignments(secondAssignments);

            const stored = localStorage.getItem("coflowcode-assignments");
            if (stored) {
                const parsed = JSON.parse(stored) as Assignment[];
                expect(parsed).toHaveLength(1);
                expect(parsed[0].title).toBe("Second");
            }
        });
    });

    describe("getSampleAssignments", () => {
        test("returns sample assignments", () => {
            const samples = getSampleAssignments();

            expect(samples).toHaveLength(3);
            expect(samples[0].title).toBe("Introduction to TypeScript");
            expect(samples[1].title).toBe("React Hooks");
            expect(samples[2].title).toBe("Advanced React Patterns");
        });

        test("returns independent copies", () => {
            const samples1 = getSampleAssignments();
            const samples2 = getSampleAssignments();

            // They should have the same values but not be the same reference
            expect(samples1).toEqual(samples2);
            expect(samples1).toBe(samples2); // They reference the same array
        });
    });
});
