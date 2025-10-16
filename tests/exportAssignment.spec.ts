import {
    exportAssignmentAsJSON,
    downloadAssignmentJSON,
} from "../src/utils/exportAssignment";
import type { Assignment } from "../src/types/Assignment";

const mockAssignment: Assignment = {
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
            type: "code-cell",
            prompt: "Write a function",
            files: [
                {
                    name: "main.py",
                    language: "python",
                    content: "# Write your code here",
                    isInstructorFile: false,
                },
                {
                    name: "test_main.py",
                    language: "python",
                    content: "# Unit tests",
                    isInstructorFile: true,
                },
            ],
            gradingConfig: {
                testFileName: "test_main.py",
                rubric: {
                    title: "Code Quality",
                    description: "Evaluate code quality",
                    criteria: [
                        {
                            level: 1,
                            name: "Excellent",
                            description: "Perfect code",
                            points: 10,
                        },
                    ],
                },
                aiPrompt: "Check for code quality",
            },
        },
        {
            id: 4,
            type: "page-break",
            requireAllCorrect: true,
        },
        {
            id: 5,
            type: "essay",
            prompt: "Explain your solution",
            gradingConfig: {
                rubric: {
                    title: "Essay Rubric",
                    description: "Evaluate essay",
                    criteria: [
                        {
                            level: 1,
                            name: "Good",
                            description: "Well written",
                            points: 5,
                        },
                    ],
                },
            },
        },
    ],
};

describe("exportAssignmentAsJSON", () => {
    test("exports assignment as JSON string", () => {
        const json = exportAssignmentAsJSON(mockAssignment);
        expect(json).toBeTruthy();
        expect(typeof json).toBe("string");

        const parsed = JSON.parse(json);
        expect(parsed.id).toBe(1);
        expect(parsed.title).toBe("Test Assignment");
    });

    test("includes all metadata fields", () => {
        const json = exportAssignmentAsJSON(mockAssignment);
        const parsed = JSON.parse(json);

        expect(parsed.title).toBe("Test Assignment");
        expect(parsed.description).toBe("Test Description");
        expect(parsed.estimatedTime).toBe(60);
        expect(parsed.notes).toBe("Private notes");
    });

    test("includes all items", () => {
        const json = exportAssignmentAsJSON(mockAssignment);
        const parsed = JSON.parse(json);

        expect(parsed.items).toHaveLength(5);
        expect(parsed.items[0].type).toBe("text");
        expect(parsed.items[1].type).toBe("multiple-choice");
        expect(parsed.items[2].type).toBe("code-cell");
        expect(parsed.items[3].type).toBe("page-break");
        expect(parsed.items[4].type).toBe("essay");
    });

    test("includes grading configuration", () => {
        const json = exportAssignmentAsJSON(mockAssignment);
        const parsed = JSON.parse(json);

        const codeCellItem = parsed.items[2];
        expect(codeCellItem.gradingConfig).toBeDefined();
        expect(codeCellItem.gradingConfig.testFileName).toBe("test_main.py");
        expect(codeCellItem.gradingConfig.rubric).toBeDefined();
        expect(codeCellItem.gradingConfig.aiPrompt).toBe(
            "Check for code quality"
        );
    });

    test("includes unit test files", () => {
        const json = exportAssignmentAsJSON(mockAssignment);
        const parsed = JSON.parse(json);

        const codeCellItem = parsed.items[2];
        expect(codeCellItem.files).toHaveLength(2);
        expect(codeCellItem.files[0].name).toBe("main.py");
        expect(codeCellItem.files[0].isInstructorFile).toBe(false);
        expect(codeCellItem.files[1].name).toBe("test_main.py");
        expect(codeCellItem.files[1].isInstructorFile).toBe(true);
    });

    test("includes page break configuration", () => {
        const json = exportAssignmentAsJSON(mockAssignment);
        const parsed = JSON.parse(json);

        const pageBreakItem = parsed.items[3];
        expect(pageBreakItem.type).toBe("page-break");
        expect(pageBreakItem.requireAllCorrect).toBe(true);
    });

    test("includes essay rubrics", () => {
        const json = exportAssignmentAsJSON(mockAssignment);
        const parsed = JSON.parse(json);

        const essayItem = parsed.items[4];
        expect(essayItem.gradingConfig).toBeDefined();
        expect(essayItem.gradingConfig.rubric).toBeDefined();
        expect(essayItem.gradingConfig.rubric.title).toBe("Essay Rubric");
    });
});

describe("downloadAssignmentJSON", () => {
    let createElementSpy: jest.SpyInstance;
    let mockLink: Partial<HTMLAnchorElement>;

    beforeEach(() => {
        // Mock document.createElement
        mockLink = {
            href: "",
            download: "",
            click: jest.fn(),
        };
        createElementSpy = jest
            .spyOn(document, "createElement")
            .mockReturnValue(mockLink as HTMLAnchorElement);

        // Mock document.body methods
        jest.spyOn(document.body, "appendChild").mockImplementation(
            () => mockLink as HTMLAnchorElement
        );
        jest.spyOn(document.body, "removeChild").mockImplementation(
            () => mockLink as HTMLAnchorElement
        );

        // Mock URL methods on window.URL
        window.URL.createObjectURL = jest.fn(() => "blob:mock-url");
        window.URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("creates a download link and triggers download", () => {
        downloadAssignmentJSON(mockAssignment);

        expect(createElementSpy).toHaveBeenCalledWith("a");
        expect(document.body.appendChild).toHaveBeenCalled();
        expect(mockLink.click).toHaveBeenCalled();
        expect(document.body.removeChild).toHaveBeenCalled();
    });

    test("uses assignment title as filename", () => {
        downloadAssignmentJSON(mockAssignment);

        expect(mockLink.download).toBe("Test_Assignment.json");
    });

    test("uses custom filename if provided", () => {
        downloadAssignmentJSON(mockAssignment, "custom-name.json");

        expect(mockLink.download).toBe("custom-name.json");
    });

    test("sanitizes assignment title for filename", () => {
        const assignmentWithSpecialChars: Assignment = {
            ...mockAssignment,
            title: "Test / Assignment: With * Special ? Chars!",
        };
        downloadAssignmentJSON(assignmentWithSpecialChars);

        expect(mockLink.download).toBe(
            "Test___Assignment__With___Special___Chars_.json"
        );
    });

    test("creates blob with correct MIME type", () => {
        downloadAssignmentJSON(mockAssignment);

        expect(window.URL.createObjectURL).toHaveBeenCalled();
    });

    test("revokes object URL after download", () => {
        downloadAssignmentJSON(mockAssignment);

        expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(
            "blob:mock-url"
        );
    });
});
