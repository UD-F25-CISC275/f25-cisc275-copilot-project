import {
    isValidSubmissionSchema,
    parseSubmissionJSON,
    importSubmissionFromFile,
    type SubmissionBundle,
} from "../src/utils/importSubmission";

const validSubmission: SubmissionBundle = {
    assignmentId: 1,
    assignmentTitle: "Test Assignment",
    assignmentDescription: "Test Description",
    assignmentEstimatedTime: 60,
    timestamp: "2024-01-01T00:00:00.000Z",
    currentPage: 0,
    totalPages: 1,
    collaborators: [
        { name: "John Doe", email: "john@example.com" },
        { name: "Jane Smith", email: "jane@example.com" }
    ],
    answers: [
        { itemId: 1, mcqAnswer: [0, 1] },
        { itemId: 2, fillInBlankAnswer: "test answer" },
        { itemId: 3, essayAnswer: "This is my essay response." },
        { 
            itemId: 4, 
            codeFiles: [
                { 
                    name: "main.py", 
                    language: "python", 
                    content: "print('hello')", 
                    isInstructorFile: false 
                }
            ]
        },
    ],
    submittedResults: [
        { 
            itemId: 1, 
            mcqResult: { 
                passed: true, 
                selectedAnswers: [0, 1],
                correctAnswers: [0, 1],
                feedbackPerChoice: ["Correct!", "Also correct!"] 
            } 
        },
        { 
            itemId: 2, 
            fillInBlankResult: { 
                passed: false,
                studentAnswer: "test answer",
                acceptedAnswers: ["correct answer"]
            } 
        },
    ],
    attemptHistory: {
        0: [
            {
                attemptNumber: 1,
                timestamp: "2024-01-01T00:00:00.000Z",
                results: [
                    { 
                        itemId: 1, 
                        mcqResult: { 
                            passed: false, 
                            selectedAnswers: [1],
                            correctAnswers: [0],
                            feedbackPerChoice: ["Try again"] 
                        } 
                    },
                ],
            },
        ],
    },
    pendingGradingItems: [3, 4],
};

describe("isValidSubmissionSchema", () => {
    test("validates a complete valid submission", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isValidSubmissionSchema(validSubmission as any)).toBe(true);
    });

    test("validates submission with minimal required fields", () => {
        const minimal: SubmissionBundle = {
            assignmentId: 1,
            assignmentTitle: "Minimal",
            timestamp: "2024-01-01T00:00:00.000Z",
            currentPage: 0,
            totalPages: 1,
            collaborators: [],
            answers: [],
            submittedResults: [],
            attemptHistory: {},
            pendingGradingItems: [],
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isValidSubmissionSchema(minimal as any)).toBe(true);
    });

    test("rejects null", () => {
        expect(isValidSubmissionSchema(null)).toBe(false);
    });

    test("rejects undefined", () => {
        expect(isValidSubmissionSchema(undefined)).toBe(false);
    });

    test("rejects non-object types", () => {
        expect(isValidSubmissionSchema("string")).toBe(false);
        expect(isValidSubmissionSchema(123)).toBe(false);
        expect(isValidSubmissionSchema(true)).toBe(false);
    });

    test("rejects submission without assignmentId", () => {
        const invalid = { ...validSubmission };
        delete (invalid as Record<string, unknown>).assignmentId;
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission without assignmentTitle", () => {
        const invalid = { ...validSubmission };
        delete (invalid as Record<string, unknown>).assignmentTitle;
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission without timestamp", () => {
        const invalid = { ...validSubmission };
        delete (invalid as Record<string, unknown>).timestamp;
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission without currentPage", () => {
        const invalid = { ...validSubmission };
        delete (invalid as Record<string, unknown>).currentPage;
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission without totalPages", () => {
        const invalid = { ...validSubmission };
        delete (invalid as Record<string, unknown>).totalPages;
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission without collaborators array", () => {
        const invalid = { ...validSubmission };
        delete (invalid as Record<string, unknown>).collaborators;
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission without answers array", () => {
        const invalid = { ...validSubmission };
        delete (invalid as Record<string, unknown>).answers;
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission without submittedResults array", () => {
        const invalid = { ...validSubmission };
        delete (invalid as Record<string, unknown>).submittedResults;
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission without attemptHistory", () => {
        const invalid = { ...validSubmission };
        delete (invalid as Record<string, unknown>).attemptHistory;
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission without pendingGradingItems", () => {
        const invalid = { ...validSubmission };
        delete (invalid as Record<string, unknown>).pendingGradingItems;
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission with invalid assignmentId type", () => {
        const invalid = { ...validSubmission, assignmentId: "1" };
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission with invalid assignmentTitle type", () => {
        const invalid = { ...validSubmission, assignmentTitle: 123 };
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission with invalid timestamp type", () => {
        const invalid = { ...validSubmission, timestamp: 123 };
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission with invalid currentPage type", () => {
        const invalid = { ...validSubmission, currentPage: "0" };
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission with invalid totalPages type", () => {
        const invalid = { ...validSubmission, totalPages: "1" };
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission with invalid collaborators type", () => {
        const invalid = { ...validSubmission, collaborators: "not an array" };
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission with invalid collaborator structure", () => {
        const invalid = { 
            ...validSubmission, 
            collaborators: [{ name: "John" }] // missing email
        };
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission with invalid answers type", () => {
        const invalid = { ...validSubmission, answers: "not an array" };
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission with invalid answer structure", () => {
        const invalid = { 
            ...validSubmission, 
            answers: [{ mcqAnswer: [0] }] // missing itemId
        };
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission with invalid submittedResults type", () => {
        const invalid = { ...validSubmission, submittedResults: "not an array" };
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission with invalid submittedResult structure", () => {
        const invalid = { 
            ...validSubmission, 
            submittedResults: [{ mcqResult: { passed: true } }] // missing itemId and required mcqResult fields
        };
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission with invalid attemptHistory type", () => {
        const invalid = { ...validSubmission, attemptHistory: [] };
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission with invalid attemptHistory structure", () => {
        const invalid = { 
            ...validSubmission, 
            attemptHistory: {
                0: [{ attemptNumber: 1 }] // missing timestamp and results
            }
        };
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission with invalid pendingGradingItems type", () => {
        const invalid = { ...validSubmission, pendingGradingItems: "not an array" };
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission with invalid pendingGradingItems element", () => {
        const invalid = { ...validSubmission, pendingGradingItems: [1, "2", 3] };
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission with invalid assignmentDescription type", () => {
        const invalid = { ...validSubmission, assignmentDescription: 123 };
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("rejects submission with invalid assignmentEstimatedTime type", () => {
        const invalid = { ...validSubmission, assignmentEstimatedTime: "60" };
        expect(isValidSubmissionSchema(invalid)).toBe(false);
    });

    test("validates submission with all answer types", () => {
        const complete = {
            ...validSubmission,
            answers: [
                { itemId: 1, mcqAnswer: [0, 1] },
                { itemId: 2, fillInBlankAnswer: "answer" },
                { itemId: 3, essayAnswer: "essay response" },
                { 
                    itemId: 4, 
                    codeFiles: [
                        { 
                            name: "main.py", 
                            language: "python", 
                            content: "print('test')", 
                            isInstructorFile: false 
                        }
                    ]
                },
            ],
        };
        expect(isValidSubmissionSchema(complete)).toBe(true);
    });
});

describe("parseSubmissionJSON", () => {
    test("parses valid JSON string", () => {
        const json = JSON.stringify(validSubmission);
        const parsed = parseSubmissionJSON(json);

        expect(parsed).toEqual(validSubmission);
    });

    test("throws error for invalid JSON syntax", () => {
        const invalidJson = "{ invalid json }";

        expect(() => parseSubmissionJSON(invalidJson)).toThrow("Invalid JSON");
    });

    test("throws error for valid JSON with invalid schema", () => {
        const invalidSubmission = JSON.stringify({ assignmentId: 1 });

        expect(() => parseSubmissionJSON(invalidSubmission)).toThrow(
            "Invalid submission schema"
        );
    });

    test("throws error for JSON with missing required fields", () => {
        const missingFields = JSON.stringify({ assignmentId: 1, assignmentTitle: "Test" });

        expect(() => parseSubmissionJSON(missingFields)).toThrow(
            "Invalid submission schema"
        );
    });

    test("parses minimal valid submission", () => {
        const minimal: SubmissionBundle = {
            assignmentId: 1,
            assignmentTitle: "Minimal",
            timestamp: "2024-01-01T00:00:00.000Z",
            currentPage: 0,
            totalPages: 1,
            collaborators: [],
            answers: [],
            submittedResults: [],
            attemptHistory: {},
            pendingGradingItems: [],
        };
        const json = JSON.stringify(minimal);
        const parsed = parseSubmissionJSON(json);

        expect(parsed).toEqual(minimal);
    });
});

describe("importSubmissionFromFile", () => {
    test("imports valid submission from file", async () => {
        const json = JSON.stringify(validSubmission);
        const file = new File([json], "submission-1-2024-01-01.json", {
            type: "application/json",
        });

        const result = await importSubmissionFromFile(file);

        expect(result).toEqual(validSubmission);
    });

    test("rejects file with invalid JSON", async () => {
        const file = new File(["{ invalid json }"], "submission.json", {
            type: "application/json",
        });

        await expect(importSubmissionFromFile(file)).rejects.toThrow(
            "Invalid JSON"
        );
    });

    test("rejects file with invalid schema", async () => {
        const invalid = JSON.stringify({ assignmentId: 1 });
        const file = new File([invalid], "submission.json", {
            type: "application/json",
        });

        await expect(importSubmissionFromFile(file)).rejects.toThrow(
            "Invalid submission schema"
        );
    });

    test("imports submission with all data types", async () => {
        const json = JSON.stringify(validSubmission);
        const file = new File([json], "submission.json", {
            type: "application/json",
        });

        const result = await importSubmissionFromFile(file);

        expect(result.assignmentId).toBe(1);
        expect(result.answers).toHaveLength(4);
        expect(result.collaborators).toHaveLength(2);
        expect(result.submittedResults).toHaveLength(2);
        expect(result.pendingGradingItems).toHaveLength(2);
    });
});
