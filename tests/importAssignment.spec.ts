import {
    isValidAssignmentSchema,
    parseAssignmentJSON,
    importAssignmentFromFile,
} from "../src/utils/importAssignment";
import type { Assignment } from "../src/types/Assignment";

const validAssignment: Assignment = {
    id: 1,
    title: "Test Assignment",
    description: "Test Description",
    estimatedTime: 60,
    notes: "Private notes",
    items: [
        {
            id: 1,
            type: "text",
            content: "Welcome to the assignment",
        },
        {
            id: 2,
            type: "multiple-choice",
            question: "What is 2 + 2?",
            choices: ["3", "4", "5"],
            correctAnswers: [1],
            shuffle: false,
        },
        {
            id: 3,
            type: "fill-in-blank",
            question: "Fill in the blank",
            acceptedAnswers: ["answer"],
            caseSensitive: false,
            trimWhitespace: true,
        },
        {
            id: 4,
            type: "essay",
            prompt: "Write an essay",
        },
        {
            id: 5,
            type: "code-cell",
            prompt: "Write a function",
            files: [
                {
                    name: "main.py",
                    language: "python",
                    content: "# Write your code here",
                    isInstructorFile: false,
                },
            ],
        },
        {
            id: 6,
            type: "page-break",
            requireAllCorrect: true,
        },
    ],
};

describe("isValidAssignmentSchema", () => {
    test("validates a complete valid assignment", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isValidAssignmentSchema(validAssignment as any)).toBe(true);
    });

    test("validates assignment with minimal required fields", () => {
        const minimal: Assignment = {
            id: 1,
            title: "Minimal",
            items: [],
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isValidAssignmentSchema(minimal as any)).toBe(true);
    });

    test("rejects null", () => {
        expect(isValidAssignmentSchema(null)).toBe(false);
    });

    test("rejects undefined", () => {
        expect(isValidAssignmentSchema(undefined)).toBe(false);
    });

    test("rejects non-object types", () => {
        expect(isValidAssignmentSchema("string")).toBe(false);
        expect(isValidAssignmentSchema(123)).toBe(false);
        expect(isValidAssignmentSchema(true)).toBe(false);
    });

    test("rejects object without id", () => {
        const invalid = { title: "Test", items: [] };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects object without title", () => {
        const invalid = { id: 1, items: [] };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects object without items", () => {
        const invalid = { id: 1, title: "Test" };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects object with non-array items", () => {
        const invalid = { id: 1, title: "Test", items: "not an array" };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects object with invalid id type", () => {
        const invalid = { id: "1", title: "Test", items: [] };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects object with invalid title type", () => {
        const invalid = { id: 1, title: 123, items: [] };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects object with invalid description type", () => {
        const invalid = { id: 1, title: "Test", description: 123, items: [] };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects object with invalid estimatedTime type", () => {
        const invalid = {
            id: 1,
            title: "Test",
            estimatedTime: "60",
            items: [],
        };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects object with invalid notes type", () => {
        const invalid = { id: 1, title: "Test", notes: 123, items: [] };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects item without id", () => {
        const invalid = {
            id: 1,
            title: "Test",
            items: [{ type: "text", content: "Hello" }],
        };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects item without type", () => {
        const invalid = {
            id: 1,
            title: "Test",
            items: [{ id: 1, content: "Hello" }],
        };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects item with invalid type", () => {
        const invalid = {
            id: 1,
            title: "Test",
            items: [{ id: 1, type: "invalid-type", content: "Hello" }],
        };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects text item without content", () => {
        const invalid = {
            id: 1,
            title: "Test",
            items: [{ id: 1, type: "text" }],
        };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects multiple-choice item without question", () => {
        const invalid = {
            id: 1,
            title: "Test",
            items: [
                {
                    id: 1,
                    type: "multiple-choice",
                    choices: ["A", "B"],
                    correctAnswers: [0],
                },
            ],
        };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects multiple-choice item without choices", () => {
        const invalid = {
            id: 1,
            title: "Test",
            items: [
                {
                    id: 1,
                    type: "multiple-choice",
                    question: "Question?",
                    correctAnswers: [0],
                },
            ],
        };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects multiple-choice item without correctAnswers", () => {
        const invalid = {
            id: 1,
            title: "Test",
            items: [
                {
                    id: 1,
                    type: "multiple-choice",
                    question: "Question?",
                    choices: ["A", "B"],
                },
            ],
        };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects fill-in-blank item without question", () => {
        const invalid = {
            id: 1,
            title: "Test",
            items: [
                {
                    id: 1,
                    type: "fill-in-blank",
                    acceptedAnswers: ["answer"],
                },
            ],
        };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects fill-in-blank item without acceptedAnswers", () => {
        const invalid = {
            id: 1,
            title: "Test",
            items: [
                {
                    id: 1,
                    type: "fill-in-blank",
                    question: "Question?",
                },
            ],
        };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects essay item without prompt", () => {
        const invalid = {
            id: 1,
            title: "Test",
            items: [{ id: 1, type: "essay" }],
        };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects code-cell item without prompt", () => {
        const invalid = {
            id: 1,
            title: "Test",
            items: [
                {
                    id: 1,
                    type: "code-cell",
                    files: [
                        {
                            name: "main.py",
                            language: "python",
                            content: "",
                            isInstructorFile: false,
                        },
                    ],
                },
            ],
        };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects code-cell item without files", () => {
        const invalid = {
            id: 1,
            title: "Test",
            items: [
                {
                    id: 1,
                    type: "code-cell",
                    prompt: "Write code",
                },
            ],
        };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("rejects code-cell item with invalid file structure", () => {
        const invalid = {
            id: 1,
            title: "Test",
            items: [
                {
                    id: 1,
                    type: "code-cell",
                    prompt: "Write code",
                    files: [{ name: "main.py" }], // missing required fields
                },
            ],
        };
        expect(isValidAssignmentSchema(invalid)).toBe(false);
    });

    test("validates page-break item with no additional fields", () => {
        const valid = {
            id: 1,
            title: "Test",
            items: [{ id: 1, type: "page-break" }],
        };
        expect(isValidAssignmentSchema(valid)).toBe(true);
    });
});

describe("parseAssignmentJSON", () => {
    test("parses valid JSON string", () => {
        const json = JSON.stringify(validAssignment);
        const parsed = parseAssignmentJSON(json);

        expect(parsed).toEqual(validAssignment);
    });

    test("throws error for invalid JSON syntax", () => {
        const invalidJson = "{ invalid json }";

        expect(() => parseAssignmentJSON(invalidJson)).toThrow("Invalid JSON");
    });

    test("throws error for valid JSON with invalid schema", () => {
        const invalidAssignment = JSON.stringify({ id: 1, title: 123 });

        expect(() => parseAssignmentJSON(invalidAssignment)).toThrow(
            "Invalid assignment schema"
        );
    });

    test("throws error for JSON with missing required fields", () => {
        const missingFields = JSON.stringify({ id: 1 });

        expect(() => parseAssignmentJSON(missingFields)).toThrow(
            "Invalid assignment schema"
        );
    });

    test("parses minimal valid assignment", () => {
        const minimal: Assignment = {
            id: 1,
            title: "Minimal",
            items: [],
        };
        const json = JSON.stringify(minimal);
        const parsed = parseAssignmentJSON(json);

        expect(parsed).toEqual(minimal);
    });
});

describe("importAssignmentFromFile", () => {
    test("imports valid assignment from file", async () => {
        const json = JSON.stringify(validAssignment);
        const file = new File([json], "assignment.json", {
            type: "application/json",
        });

        const result = await importAssignmentFromFile(file);

        expect(result).toEqual(validAssignment);
    });

    test("rejects file with invalid JSON", async () => {
        const file = new File(["{ invalid json }"], "assignment.json", {
            type: "application/json",
        });

        await expect(importAssignmentFromFile(file)).rejects.toThrow(
            "Invalid JSON"
        );
    });

    test("rejects file with invalid schema", async () => {
        const invalid = JSON.stringify({ id: 1, title: 123 });
        const file = new File([invalid], "assignment.json", {
            type: "application/json",
        });

        await expect(importAssignmentFromFile(file)).rejects.toThrow(
            "Invalid assignment schema"
        );
    });

    test("imports assignment with all item types", async () => {
        const json = JSON.stringify(validAssignment);
        const file = new File([json], "assignment.json", {
            type: "application/json",
        });

        const result = await importAssignmentFromFile(file);

        expect(result.items).toHaveLength(6);
        expect(result.items[0].type).toBe("text");
        expect(result.items[1].type).toBe("multiple-choice");
        expect(result.items[2].type).toBe("fill-in-blank");
        expect(result.items[3].type).toBe("essay");
        expect(result.items[4].type).toBe("code-cell");
        expect(result.items[5].type).toBe("page-break");
    });
});
