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

    test("renders code cell items with note", () => {
        const assignment: Assignment = {
            id: 1,
            title: "Test Assignment",
            items: [
                {
                    id: 1,
                    type: "code-cell",
                    prompt: "Write some code",
                    files: [],
                },
            ],
        };

        render(<AssignmentTaker assignment={assignment} onBack={mockBack} />);

        expect(screen.getByText("Write some code")).toBeInTheDocument();
        expect(screen.getByText("Code execution not available in taker view")).toBeInTheDocument();
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
});
