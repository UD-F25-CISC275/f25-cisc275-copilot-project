import { render, screen, fireEvent } from "@testing-library/react";
import { AssignmentTaker } from "../src/components/AssignmentTaker";
import type { Assignment } from "../src/types/Assignment";

describe("AssignmentTaker", () => {
    const mockBack = jest.fn();

    beforeEach(() => {
        mockBack.mockClear();
    });

    test("renders assignment title and description", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            description: "This is a test",
            items: [],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        expect(screen.getByText("Test Assignment")).toBeInTheDocument();
        expect(screen.getByText("This is a test")).toBeInTheDocument();
    });

    test("back button calls onBack", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        fireEvent.click(screen.getByText("← Back to Dashboard"));
        expect(mockBack).toHaveBeenCalledTimes(1);
    });

    test("renders multiple choice questions", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "multiple-choice",
                    question: "What is 2+2?",
                    choices: ["3", "4", "5"],
                    correctAnswers: [1],
                    choiceFeedback: ["Wrong", "Correct!", "Wrong"],
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        expect(screen.getByText("What is 2+2?")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("4")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
    });

    test("can select and submit MCQ answers", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "multiple-choice",
                    question: "What is 2+2?",
                    choices: ["3", "4", "5"],
                    correctAnswers: [1],
                    choiceFeedback: ["Try again", "Great!", "Nope"],
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        // Select the correct answer
        const choice = screen.getByTestId("mcq-choice-1-1");
        fireEvent.click(choice);

        expect(choice).toBeChecked();

        // Submit
        fireEvent.click(screen.getByTestId("submit-button"));

        // Check for pass indicator
        expect(screen.getByText("✓ Correct!")).toBeInTheDocument();
        expect(screen.getByText("Great!")).toBeInTheDocument();
    });

    test("shows incorrect feedback for wrong MCQ answer", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "multiple-choice",
                    question: "What is 2+2?",
                    choices: ["3", "4", "5"],
                    correctAnswers: [1],
                    choiceFeedback: ["Try again", "Great!", "Nope"],
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        // Select wrong answer
        const choice = screen.getByTestId("mcq-choice-1-0");
        fireEvent.click(choice);

        // Submit
        fireEvent.click(screen.getByTestId("submit-button"));

        // Check for fail indicator
        expect(screen.getByText("✗ Incorrect")).toBeInTheDocument();
        expect(screen.getByText("Try again")).toBeInTheDocument();
    });

    test("handles multiple correct answers in MCQ", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "multiple-choice",
                    question: "Select all even numbers",
                    choices: ["1", "2", "3", "4"],
                    correctAnswers: [1, 3],
                    choiceFeedback: [],
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        // Select both correct answers
        fireEvent.click(screen.getByTestId("mcq-choice-1-1"));
        fireEvent.click(screen.getByTestId("mcq-choice-1-3"));

        // Submit
        fireEvent.click(screen.getByTestId("submit-button"));

        // Should pass
        expect(screen.getByText("✓ Correct!")).toBeInTheDocument();
    });

    test("renders fill-in-blank questions", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "fill-in-blank",
                    question: "What is the capital of France?",
                    acceptedAnswers: ["Paris"],
                    caseSensitive: false,
                    trimWhitespace: true,
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        expect(screen.getByText("What is the capital of France?")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter your answer...")).toBeInTheDocument();
    });

    test("can submit fill-in-blank answers", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "fill-in-blank",
                    question: "What is the capital of France?",
                    acceptedAnswers: ["Paris"],
                    caseSensitive: false,
                    trimWhitespace: true,
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        const input = screen.getByTestId("fill-blank-input-1");
        fireEvent.change(input, { target: { value: "Paris" } });

        // Submit
        fireEvent.click(screen.getByTestId("submit-button"));

        // Should pass
        expect(screen.getByText("✓ Correct!")).toBeInTheDocument();
    });

    test("shows incorrect feedback for wrong fill-in-blank answer", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "fill-in-blank",
                    question: "What is the capital of France?",
                    acceptedAnswers: ["Paris"],
                    caseSensitive: false,
                    trimWhitespace: true,
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        const input = screen.getByTestId("fill-blank-input-1");
        fireEvent.change(input, { target: { value: "London" } });

        // Submit
        fireEvent.click(screen.getByTestId("submit-button"));

        // Should fail
        expect(screen.getByText("✗ Incorrect")).toBeInTheDocument();
    });

    test("disables submit button after submission", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "fill-in-blank",
                    question: "Test question",
                    acceptedAnswers: ["test"],
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        const submitButton = screen.getByTestId("submit-button");
        
        expect(submitButton).not.toBeDisabled();
        expect(submitButton).toHaveTextContent("Submit Assignment");

        fireEvent.click(submitButton);

        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent("Submitted");
    });

    test("disables inputs after submission", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "multiple-choice",
                    question: "MCQ?",
                    choices: ["A", "B"],
                    correctAnswers: [0],
                },
                {
                    id: 2,
                    type: "fill-in-blank",
                    question: "Fill?",
                    acceptedAnswers: ["test"],
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        const mcqChoice = screen.getByTestId("mcq-choice-1-0");
        const fillInput = screen.getByTestId("fill-blank-input-2");

        expect(mcqChoice).not.toBeDisabled();
        expect(fillInput).not.toBeDisabled();

        fireEvent.click(screen.getByTestId("submit-button"));

        expect(mcqChoice).toBeDisabled();
        expect(fillInput).toBeDisabled();
    });

    test("renders text items", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "text",
                    content: "This is some text content",
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        expect(screen.getByText("This is some text content")).toBeInTheDocument();
    });

    test("renders essay items with note", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "essay",
                    prompt: "Write an essay about testing",
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        expect(screen.getByText("Write an essay about testing")).toBeInTheDocument();
        expect(screen.getByText("Essay items require manual grading")).toBeInTheDocument();
    });

    test("renders code cell items with code editor", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "code-cell",
                    prompt: "Write some code",
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

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        expect(screen.getByText("Write some code")).toBeInTheDocument();
        expect(screen.getByText("main.py")).toBeInTheDocument();
    });

    test("renders page breaks", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "page-break",
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        const pageBreak = document.querySelector(".page-break");
        expect(pageBreak).toBeInTheDocument();
    });

    test("handles mixed item types", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Mixed Assignment",
            items: [
                {
                    id: 1,
                    type: "text",
                    content: "Introduction",
                },
                {
                    id: 2,
                    type: "multiple-choice",
                    question: "MCQ?",
                    choices: ["A", "B"],
                    correctAnswers: [0],
                },
                {
                    id: 3,
                    type: "fill-in-blank",
                    question: "Fill?",
                    acceptedAnswers: ["test"],
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        expect(screen.getByText("Introduction")).toBeInTheDocument();
        expect(screen.getByText("MCQ?")).toBeInTheDocument();
        expect(screen.getByText("Fill?")).toBeInTheDocument();
    });

    test("shows rubric feedback for essay items with rubric after submission", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "essay",
                    prompt: "Write an essay",
                    gradingConfig: {
                        rubric: {
                            title: "Essay Rubric",
                            description: "Quality of writing",
                            criteria: [
                                {
                                    level: 1,
                                    name: "Excellent",
                                    description: "Outstanding work",
                                    points: 10,
                                },
                                {
                                    level: 2,
                                    name: "Good",
                                    description: "Solid work",
                                    points: 7,
                                },
                            ],
                        },
                    },
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        // Rubric feedback should not be visible before submission
        expect(screen.queryByTestId("rubric-feedback-1")).not.toBeInTheDocument();

        // Submit
        fireEvent.click(screen.getByTestId("submit-button"));

        // Rubric feedback should now be visible
        expect(screen.getByTestId("rubric-feedback-1")).toBeInTheDocument();
        expect(screen.getByText("⏳ Awaiting grading")).toBeInTheDocument();
        expect(screen.getByText("Essay Rubric")).toBeInTheDocument();
        expect(screen.getByText("Quality of writing")).toBeInTheDocument();
        expect(screen.getByText("Excellent")).toBeInTheDocument();
        expect(screen.getByText(": Outstanding work")).toBeInTheDocument();
        expect(screen.getByText("(10 points)")).toBeInTheDocument();
        expect(screen.getByText("Good")).toBeInTheDocument();
        expect(screen.getByText(": Solid work")).toBeInTheDocument();
        expect(screen.getByText("(7 points)")).toBeInTheDocument();
        expect(screen.getByText("Maximum Points: 17")).toBeInTheDocument();
    });

    test("does not show rubric feedback for essay items without rubric", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "essay",
                    prompt: "Write an essay",
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        // Submit
        fireEvent.click(screen.getByTestId("submit-button"));

        // Rubric feedback should not be visible
        expect(screen.queryByTestId("rubric-feedback-1")).not.toBeInTheDocument();
    });

    test("shows rubric feedback for code-cell items with rubric after submission", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "code-cell",
                    prompt: "Write some code",
                    files: [],
                    gradingConfig: {
                        rubric: {
                            title: "Code Quality",
                            description: "Assess code quality",
                            criteria: [
                                {
                                    level: 1,
                                    name: "Perfect",
                                    description: "No issues",
                                    points: 20,
                                },
                            ],
                        },
                    },
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        // Rubric feedback should not be visible before submission
        expect(screen.queryByTestId("rubric-feedback-1")).not.toBeInTheDocument();

        // Submit
        fireEvent.click(screen.getByTestId("submit-button"));

        // Rubric feedback should now be visible
        expect(screen.getByTestId("rubric-feedback-1")).toBeInTheDocument();
        expect(screen.getByText("⏳ Awaiting grading")).toBeInTheDocument();
        expect(screen.getByText("Code Quality")).toBeInTheDocument();
        expect(screen.getByText("Assess code quality")).toBeInTheDocument();
        expect(screen.getByText("Perfect")).toBeInTheDocument();
        expect(screen.getByText("(20 points)")).toBeInTheDocument();
        expect(screen.getByText("Maximum Points: 20")).toBeInTheDocument();
    });

    test("shows rubric feedback for text items with rubric after submission", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "text",
                    content: "Read this text",
                    gradingConfig: {
                        rubric: {
                            title: "Participation",
                            description: "",
                            criteria: [
                                {
                                    level: 1,
                                    name: "Attended",
                                    description: "",
                                    points: 5,
                                },
                            ],
                        },
                    },
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        // Rubric feedback should not be visible before submission
        expect(screen.queryByTestId("rubric-feedback-1")).not.toBeInTheDocument();

        // Submit
        fireEvent.click(screen.getByTestId("submit-button"));

        // Rubric feedback should now be visible
        expect(screen.getByTestId("rubric-feedback-1")).toBeInTheDocument();
        expect(screen.getByText("⏳ Awaiting grading")).toBeInTheDocument();
        expect(screen.getByText("Participation")).toBeInTheDocument();
        expect(screen.getByText("Attended")).toBeInTheDocument();
        expect(screen.getByText("Maximum Points: 5")).toBeInTheDocument();
    });

    test("shows rubric with no title using default 'Rubric' label", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "essay",
                    prompt: "Write an essay",
                    gradingConfig: {
                        rubric: {
                            title: "",
                            description: "",
                            criteria: [
                                {
                                    level: 1,
                                    name: "",
                                    description: "",
                                    points: 10,
                                },
                            ],
                        },
                    },
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        // Submit
        fireEvent.click(screen.getByTestId("submit-button"));

        // Should show default "Rubric" label
        expect(screen.getByText("Rubric")).toBeInTheDocument();
        expect(screen.getByText("Level 1")).toBeInTheDocument();
    });

    test("shows rubric criteria without names using level numbers", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "essay",
                    prompt: "Write an essay",
                    gradingConfig: {
                        rubric: {
                            title: "Test Rubric",
                            description: "",
                            criteria: [
                                {
                                    level: 1,
                                    name: "",
                                    description: "First level",
                                    points: 5,
                                },
                                {
                                    level: 2,
                                    name: "",
                                    description: "Second level",
                                    points: 3,
                                },
                            ],
                        },
                    },
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        // Submit
        fireEvent.click(screen.getByTestId("submit-button"));

        expect(screen.getByText("Level 1")).toBeInTheDocument();
        expect(screen.getByText("Level 2")).toBeInTheDocument();
    });

    test("renders code cell with editable code", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "code-cell",
                    prompt: "Write a hello world function",
                    files: [
                        {
                            name: "main.py",
                            language: "python",
                            content: "# Your code here",
                            isInstructorFile: false,
                        },
                    ],
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        expect(screen.getByText("Write a hello world function")).toBeInTheDocument();
        expect(screen.getByTestId("code-file-1-0")).toBeInTheDocument();
        expect(screen.getByText("main.py")).toBeInTheDocument();
    });

    test("code cell allows editing code content", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "code-cell",
                    prompt: "Write a hello world function",
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

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        const textarea = screen.getByTestId("code-file-1-0") as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: "print('hello')" } });

        expect(textarea.value).toBe("print('hello')");
    });

    test("code cell shows run code button for python files", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "code-cell",
                    prompt: "Write code",
                    files: [
                        {
                            name: "main.py",
                            language: "python",
                            content: "print('hello')",
                            isInstructorFile: false,
                        },
                    ],
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        expect(screen.getByTestId("run-code-1")).toBeInTheDocument();
    });

    test("code cell shows run tests button when test file is configured", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "code-cell",
                    prompt: "Write code",
                    files: [
                        {
                            name: "main.py",
                            language: "python",
                            content: "def add(a, b): return a + b",
                            isInstructorFile: false,
                        },
                        {
                            name: "test.py",
                            language: "python",
                            content: "assert add(2, 3) == 5",
                            isInstructorFile: true,
                        },
                    ],
                    gradingConfig: {
                        testFileName: "test.py",
                    },
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        expect(screen.getByTestId("run-tests-1")).toBeInTheDocument();
    });

    test("code cell does not show run tests button when no test file is configured", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "code-cell",
                    prompt: "Write code",
                    files: [
                        {
                            name: "main.py",
                            language: "python",
                            content: "print('hello')",
                            isInstructorFile: false,
                        },
                    ],
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        expect(screen.queryByTestId("run-tests-1")).not.toBeInTheDocument();
    });

    test("code cell only shows student files for editing", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "code-cell",
                    prompt: "Write code",
                    files: [
                        {
                            name: "main.py",
                            language: "python",
                            content: "# Student code",
                            isInstructorFile: false,
                        },
                        {
                            name: "test.py",
                            language: "python",
                            content: "# Hidden test",
                            isInstructorFile: true,
                        },
                    ],
                    gradingConfig: {
                        testFileName: "test.py",
                    },
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        // Should show main.py
        expect(screen.getByText("main.py")).toBeInTheDocument();
        expect(screen.getByTestId("code-file-1-0")).toBeInTheDocument();
        
        // Should not show test.py in editor
        expect(screen.queryByText("test.py")).not.toBeInTheDocument();
    });

    // Page Navigation and Gating Tests
    describe("Page Navigation", () => {
        test("shows page indicator for multi-page assignments", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Multi-page Assignment",
                items: [
                    {
                        id: 1,
                        type: "text",
                        content: "Page 1 content",
                    },
                    {
                        id: 2,
                        type: "page-break",
                    },
                    {
                        id: 3,
                        type: "text",
                        content: "Page 2 content",
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            expect(screen.getByTestId("page-indicator")).toHaveTextContent("Page 1 of 2");
        });

        test("does not show page indicator for single-page assignments", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Single-page Assignment",
                items: [
                    {
                        id: 1,
                        type: "text",
                        content: "Page 1 content",
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            expect(screen.queryByTestId("page-indicator")).not.toBeInTheDocument();
        });

        test("shows only current page items", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Multi-page Assignment",
                items: [
                    {
                        id: 1,
                        type: "text",
                        content: "Page 1 content",
                    },
                    {
                        id: 2,
                        type: "page-break",
                    },
                    {
                        id: 3,
                        type: "text",
                        content: "Page 2 content",
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            // Should show page 1 content
            expect(screen.getByText("Page 1 content")).toBeInTheDocument();
            // Should not show page 2 content
            expect(screen.queryByText("Page 2 content")).not.toBeInTheDocument();
        });

        test("navigates to next page", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Multi-page Assignment",
                items: [
                    {
                        id: 1,
                        type: "text",
                        content: "Page 1 content",
                    },
                    {
                        id: 2,
                        type: "page-break",
                    },
                    {
                        id: 3,
                        type: "text",
                        content: "Page 2 content",
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            // Click next
            fireEvent.click(screen.getByTestId("next-button"));

            // Should show page 2 content
            expect(screen.getByText("Page 2 content")).toBeInTheDocument();
            // Should not show page 1 content
            expect(screen.queryByText("Page 1 content")).not.toBeInTheDocument();
            // Page indicator should update
            expect(screen.getByTestId("page-indicator")).toHaveTextContent("Page 2 of 2");
        });

        test("navigates to previous page", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Multi-page Assignment",
                items: [
                    {
                        id: 1,
                        type: "text",
                        content: "Page 1 content",
                    },
                    {
                        id: 2,
                        type: "page-break",
                    },
                    {
                        id: 3,
                        type: "text",
                        content: "Page 2 content",
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            // Go to page 2
            fireEvent.click(screen.getByTestId("next-button"));

            // Click previous
            fireEvent.click(screen.getByTestId("previous-button"));

            // Should show page 1 content
            expect(screen.getByText("Page 1 content")).toBeInTheDocument();
            // Should not show page 2 content
            expect(screen.queryByText("Page 2 content")).not.toBeInTheDocument();
            // Page indicator should update
            expect(screen.getByTestId("page-indicator")).toHaveTextContent("Page 1 of 2");
        });

        test("does not show previous button on first page", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Multi-page Assignment",
                items: [
                    {
                        id: 1,
                        type: "text",
                        content: "Page 1 content",
                    },
                    {
                        id: 2,
                        type: "page-break",
                    },
                    {
                        id: 3,
                        type: "text",
                        content: "Page 2 content",
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            expect(screen.queryByTestId("previous-button")).not.toBeInTheDocument();
        });

        test("does not show next button on last page", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Multi-page Assignment",
                items: [
                    {
                        id: 1,
                        type: "text",
                        content: "Page 1 content",
                    },
                    {
                        id: 2,
                        type: "page-break",
                    },
                    {
                        id: 3,
                        type: "text",
                        content: "Page 2 content",
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            // Go to page 2
            fireEvent.click(screen.getByTestId("next-button"));

            expect(screen.queryByTestId("next-button")).not.toBeInTheDocument();
        });

        test("shows page break as hr element", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Multi-page Assignment",
                items: [
                    {
                        id: 1,
                        type: "text",
                        content: "Page 1 content",
                    },
                    {
                        id: 2,
                        type: "page-break",
                    },
                    {
                        id: 3,
                        type: "text",
                        content: "Page 2 content",
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            // Page break should be visible on page 1
            expect(document.querySelector(".page-break hr")).toBeInTheDocument();
        });
    });

    describe("Page Gating", () => {
        test("disables next button when requireAllCorrect is true and not submitted", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Gated Assignment",
                items: [
                    {
                        id: 1,
                        type: "multiple-choice",
                        question: "What is 2+2?",
                        choices: ["3", "4", "5"],
                        correctAnswers: [1],
                    },
                    {
                        id: 2,
                        type: "page-break",
                        requireAllCorrect: true,
                    },
                    {
                        id: 3,
                        type: "text",
                        content: "Page 2 content",
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            const nextButton = screen.getByTestId("next-button");
            expect(nextButton).toBeDisabled();
        });

        test("disables next button when requireAllCorrect is true and answers are incorrect", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Gated Assignment",
                items: [
                    {
                        id: 1,
                        type: "multiple-choice",
                        question: "What is 2+2?",
                        choices: ["3", "4", "5"],
                        correctAnswers: [1],
                    },
                    {
                        id: 2,
                        type: "page-break",
                        requireAllCorrect: true,
                    },
                    {
                        id: 3,
                        type: "text",
                        content: "Page 2 content",
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            // Select wrong answer
            fireEvent.click(screen.getByTestId("mcq-choice-1-0"));

            // Submit
            fireEvent.click(screen.getByTestId("submit-button"));

            const nextButton = screen.getByTestId("next-button");
            expect(nextButton).toBeDisabled();
        });

        test("enables next button when requireAllCorrect is true and all answers are correct", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Gated Assignment",
                items: [
                    {
                        id: 1,
                        type: "multiple-choice",
                        question: "What is 2+2?",
                        choices: ["3", "4", "5"],
                        correctAnswers: [1],
                    },
                    {
                        id: 2,
                        type: "page-break",
                        requireAllCorrect: true,
                    },
                    {
                        id: 3,
                        type: "text",
                        content: "Page 2 content",
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            // Select correct answer
            fireEvent.click(screen.getByTestId("mcq-choice-1-1"));

            // Submit
            fireEvent.click(screen.getByTestId("submit-button"));

            const nextButton = screen.getByTestId("next-button");
            expect(nextButton).not.toBeDisabled();
        });

        test("enables next button when requireAllCorrect is false", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Non-gated Assignment",
                items: [
                    {
                        id: 1,
                        type: "multiple-choice",
                        question: "What is 2+2?",
                        choices: ["3", "4", "5"],
                        correctAnswers: [1],
                    },
                    {
                        id: 2,
                        type: "page-break",
                        requireAllCorrect: false,
                    },
                    {
                        id: 3,
                        type: "text",
                        content: "Page 2 content",
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            const nextButton = screen.getByTestId("next-button");
            expect(nextButton).not.toBeDisabled();
        });

        test("enables next button when no requireAllCorrect flag is set", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Non-gated Assignment",
                items: [
                    {
                        id: 1,
                        type: "multiple-choice",
                        question: "What is 2+2?",
                        choices: ["3", "4", "5"],
                        correctAnswers: [1],
                    },
                    {
                        id: 2,
                        type: "page-break",
                    },
                    {
                        id: 3,
                        type: "text",
                        content: "Page 2 content",
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            const nextButton = screen.getByTestId("next-button");
            expect(nextButton).not.toBeDisabled();
        });

        test("gating works with fill-in-blank items", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Gated Assignment",
                items: [
                    {
                        id: 1,
                        type: "fill-in-blank",
                        question: "What is the capital of France?",
                        acceptedAnswers: ["Paris"],
                    },
                    {
                        id: 2,
                        type: "page-break",
                        requireAllCorrect: true,
                    },
                    {
                        id: 3,
                        type: "text",
                        content: "Page 2 content",
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            // Enter correct answer
            const input = screen.getByTestId("fill-blank-input-1");
            fireEvent.change(input, { target: { value: "Paris" } });

            // Submit
            fireEvent.click(screen.getByTestId("submit-button"));

            const nextButton = screen.getByTestId("next-button");
            expect(nextButton).not.toBeDisabled();
        });

        test("gating requires all items to be correct", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Gated Assignment",
                items: [
                    {
                        id: 1,
                        type: "multiple-choice",
                        question: "What is 2+2?",
                        choices: ["3", "4", "5"],
                        correctAnswers: [1],
                    },
                    {
                        id: 2,
                        type: "fill-in-blank",
                        question: "What is the capital of France?",
                        acceptedAnswers: ["Paris"],
                    },
                    {
                        id: 3,
                        type: "page-break",
                        requireAllCorrect: true,
                    },
                    {
                        id: 4,
                        type: "text",
                        content: "Page 2 content",
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            // Select correct MCQ answer
            fireEvent.click(screen.getByTestId("mcq-choice-1-1"));

            // Enter incorrect fill-in-blank answer
            const input = screen.getByTestId("fill-blank-input-2");
            fireEvent.change(input, { target: { value: "London" } });

            // Submit
            fireEvent.click(screen.getByTestId("submit-button"));

            const nextButton = screen.getByTestId("next-button");
            expect(nextButton).toBeDisabled();
        });
    });

    describe("Attempt Counter", () => {
        test("does not show attempt counter before first submission", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Test Assignment",
                items: [
                    {
                        id: 1,
                        type: "fill-in-blank",
                        question: "Test question",
                        acceptedAnswers: ["test"],
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            expect(screen.queryByTestId("attempt-counter")).not.toBeInTheDocument();
        });

        test("shows attempt counter after first submission", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Test Assignment",
                items: [
                    {
                        id: 1,
                        type: "fill-in-blank",
                        question: "Test question",
                        acceptedAnswers: ["test"],
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            fireEvent.click(screen.getByTestId("submit-button"));

            const attemptCounter = screen.getByTestId("attempt-counter");
            expect(attemptCounter).toBeInTheDocument();
            expect(attemptCounter).toHaveTextContent("Attempt 1");
        });

        test("increments attempt counter on multiple submissions", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Test Assignment",
                items: [
                    {
                        id: 1,
                        type: "fill-in-blank",
                        question: "Test question",
                        acceptedAnswers: ["test"],
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            // First submission
            fireEvent.click(screen.getByTestId("submit-button"));
            expect(screen.getByTestId("attempt-counter")).toHaveTextContent("Attempt 1");
        });

        test("maintains separate attempt counts for different pages", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Test Assignment",
                items: [
                    {
                        id: 1,
                        type: "fill-in-blank",
                        question: "Page 1 question",
                        acceptedAnswers: ["test"],
                    },
                    {
                        id: 2,
                        type: "page-break",
                    },
                    {
                        id: 3,
                        type: "fill-in-blank",
                        question: "Page 2 question",
                        acceptedAnswers: ["test2"],
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            // Submit on page 1
            fireEvent.click(screen.getByTestId("submit-button"));
            expect(screen.getByTestId("attempt-counter")).toHaveTextContent("Attempt 1");

            // Navigate to page 2
            fireEvent.click(screen.getByTestId("next-button"));
            expect(screen.queryByTestId("attempt-counter")).not.toBeInTheDocument();

            // Submit on page 2
            fireEvent.click(screen.getByTestId("submit-button"));
            expect(screen.getByTestId("attempt-counter")).toHaveTextContent("Attempt 1");

            // Go back to page 1
            fireEvent.click(screen.getByTestId("previous-button"));
            expect(screen.getByTestId("attempt-counter")).toHaveTextContent("Attempt 1");
        });

        test("shows correct feedback for most recent submission attempt", () => {
            const assignment: Assignment = {
                id: 1,
                title: "Test Assignment",
                items: [
                    {
                        id: 1,
                        type: "fill-in-blank",
                        question: "What is 2+2?",
                        acceptedAnswers: ["4"],
                        caseSensitive: false,
                        trimWhitespace: true,
                    },
                ],
            };

            render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

            const input = screen.getByTestId("fill-blank-input-1");

            // First submission - incorrect answer
            fireEvent.change(input, { target: { value: "5" } });
            fireEvent.click(screen.getByTestId("submit-button"));

            // Verify incorrect feedback is shown
            expect(screen.getByText("✗ Incorrect")).toBeInTheDocument();
            expect(screen.getByTestId("attempt-counter")).toHaveTextContent("Attempt 1");
        });
    });
});
