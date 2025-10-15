import { gradeMCQ, gradeFillInBlank } from "../src/utils/grading";
import type { MultipleChoiceItem, FillInBlankItem } from "../src/types/AssignmentItem";

describe("gradeMCQ", () => {
    test("returns passed=true when all correct answers are selected", () => {
        const item: MultipleChoiceItem = {
            id: 1,
            type: "multiple-choice",
            question: "What is 2+2?",
            choices: ["3", "4", "5"],
            correctAnswers: [1],
            choiceFeedback: ["Wrong", "Correct!", "Wrong"],
        };

        const result = gradeMCQ(item, [1]);
        expect(result.passed).toBe(true);
        expect(result.selectedAnswers).toEqual([1]);
    });

    test("returns passed=false when wrong answer is selected", () => {
        const item: MultipleChoiceItem = {
            id: 1,
            type: "multiple-choice",
            question: "What is 2+2?",
            choices: ["3", "4", "5"],
            correctAnswers: [1],
            choiceFeedback: ["Wrong", "Correct!", "Wrong"],
        };

        const result = gradeMCQ(item, [0]);
        expect(result.passed).toBe(false);
    });

    test("handles multiple correct answers", () => {
        const item: MultipleChoiceItem = {
            id: 1,
            type: "multiple-choice",
            question: "Select all even numbers",
            choices: ["1", "2", "3", "4"],
            correctAnswers: [1, 3],
            choiceFeedback: [],
        };

        const result = gradeMCQ(item, [1, 3]);
        expect(result.passed).toBe(true);
    });

    test("passes even if answers are in different order", () => {
        const item: MultipleChoiceItem = {
            id: 1,
            type: "multiple-choice",
            question: "Select all even numbers",
            choices: ["1", "2", "3", "4"],
            correctAnswers: [1, 3],
            choiceFeedback: [],
        };

        const result = gradeMCQ(item, [3, 1]);
        expect(result.passed).toBe(true);
    });

    test("returns passed=false when partially correct", () => {
        const item: MultipleChoiceItem = {
            id: 1,
            type: "multiple-choice",
            question: "Select all even numbers",
            choices: ["1", "2", "3", "4"],
            correctAnswers: [1, 3],
            choiceFeedback: [],
        };

        const result = gradeMCQ(item, [1]);
        expect(result.passed).toBe(false);
    });

    test("includes feedback per choice", () => {
        const item: MultipleChoiceItem = {
            id: 1,
            type: "multiple-choice",
            question: "What is 2+2?",
            choices: ["3", "4", "5"],
            correctAnswers: [1],
            choiceFeedback: ["Try again", "Great job!", "Not quite"],
        };

        const result = gradeMCQ(item, [1]);
        expect(result.feedbackPerChoice).toEqual(["Try again", "Great job!", "Not quite"]);
    });

    test("respects enableAnswerCheck=false setting", () => {
        const item: MultipleChoiceItem = {
            id: 1,
            type: "multiple-choice",
            question: "What is 2+2?",
            choices: ["3", "4", "5"],
            correctAnswers: [1],
            gradingConfig: {
                enableAnswerCheck: false,
            },
        };

        const result = gradeMCQ(item, [1]);
        expect(result.passed).toBe(false);
    });
});

describe("gradeFillInBlank", () => {
    test("returns passed=true for exact match", () => {
        const item: FillInBlankItem = {
            id: 1,
            type: "fill-in-blank",
            question: "What is the capital of France?",
            acceptedAnswers: ["Paris"],
            caseSensitive: false,
            trimWhitespace: true,
        };

        const result = gradeFillInBlank(item, "Paris");
        expect(result.passed).toBe(true);
    });

    test("returns passed=false for wrong answer", () => {
        const item: FillInBlankItem = {
            id: 1,
            type: "fill-in-blank",
            question: "What is the capital of France?",
            acceptedAnswers: ["Paris"],
            caseSensitive: false,
            trimWhitespace: true,
        };

        const result = gradeFillInBlank(item, "London");
        expect(result.passed).toBe(false);
    });

    test("handles case-insensitive matching by default", () => {
        const item: FillInBlankItem = {
            id: 1,
            type: "fill-in-blank",
            question: "What is the capital of France?",
            acceptedAnswers: ["Paris"],
            caseSensitive: false,
            trimWhitespace: true,
        };

        const result = gradeFillInBlank(item, "paris");
        expect(result.passed).toBe(true);
    });

    test("handles case-sensitive matching when enabled", () => {
        const item: FillInBlankItem = {
            id: 1,
            type: "fill-in-blank",
            question: "What is the capital of France?",
            acceptedAnswers: ["Paris"],
            caseSensitive: true,
            trimWhitespace: true,
        };

        const result = gradeFillInBlank(item, "paris");
        expect(result.passed).toBe(false);

        const result2 = gradeFillInBlank(item, "Paris");
        expect(result2.passed).toBe(true);
    });

    test("trims whitespace by default", () => {
        const item: FillInBlankItem = {
            id: 1,
            type: "fill-in-blank",
            question: "What is the capital of France?",
            acceptedAnswers: ["Paris"],
            caseSensitive: false,
            trimWhitespace: true,
        };

        const result = gradeFillInBlank(item, "  Paris  ");
        expect(result.passed).toBe(true);
    });

    test("respects trimWhitespace=false setting", () => {
        const item: FillInBlankItem = {
            id: 1,
            type: "fill-in-blank",
            question: "Enter the exact format",
            acceptedAnswers: ["Paris"],
            caseSensitive: false,
            trimWhitespace: false,
        };

        const result = gradeFillInBlank(item, "  Paris  ");
        expect(result.passed).toBe(false);

        const result2 = gradeFillInBlank(item, "Paris");
        expect(result2.passed).toBe(true);
    });

    test("handles multiple accepted answers", () => {
        const item: FillInBlankItem = {
            id: 1,
            type: "fill-in-blank",
            question: "Name a primary color",
            acceptedAnswers: ["red", "blue", "yellow"],
            caseSensitive: false,
            trimWhitespace: true,
        };

        expect(gradeFillInBlank(item, "red").passed).toBe(true);
        expect(gradeFillInBlank(item, "blue").passed).toBe(true);
        expect(gradeFillInBlank(item, "yellow").passed).toBe(true);
        expect(gradeFillInBlank(item, "green").passed).toBe(false);
    });

    test("uses regex pattern when provided", () => {
        const item: FillInBlankItem = {
            id: 1,
            type: "fill-in-blank",
            question: "Enter a number",
            acceptedAnswers: [],
            regexPattern: "^\\d+$",
            caseSensitive: false,
            trimWhitespace: true,
        };

        expect(gradeFillInBlank(item, "123").passed).toBe(true);
        expect(gradeFillInBlank(item, "abc").passed).toBe(false);
    });

    test("regex pattern is case-insensitive by default", () => {
        const item: FillInBlankItem = {
            id: 1,
            type: "fill-in-blank",
            question: "Enter a word starting with A",
            acceptedAnswers: [],
            regexPattern: "^a",
            caseSensitive: false,
            trimWhitespace: true,
        };

        expect(gradeFillInBlank(item, "Apple").passed).toBe(true);
        expect(gradeFillInBlank(item, "apple").passed).toBe(true);
    });

    test("regex pattern respects case-sensitive setting", () => {
        const item: FillInBlankItem = {
            id: 1,
            type: "fill-in-blank",
            question: "Enter a word starting with lowercase a",
            acceptedAnswers: [],
            regexPattern: "^a",
            caseSensitive: true,
            trimWhitespace: true,
        };

        expect(gradeFillInBlank(item, "Apple").passed).toBe(false);
        expect(gradeFillInBlank(item, "apple").passed).toBe(true);
    });

    test("falls back to string comparison on invalid regex", () => {
        const item: FillInBlankItem = {
            id: 1,
            type: "fill-in-blank",
            question: "Answer",
            acceptedAnswers: ["test"],
            regexPattern: "[invalid(",
            caseSensitive: false,
            trimWhitespace: true,
        };

        // Should fall back to comparing against acceptedAnswers
        expect(gradeFillInBlank(item, "test").passed).toBe(true);
        expect(gradeFillInBlank(item, "other").passed).toBe(false);
    });

    test("respects enableAnswerCheck=false setting", () => {
        const item: FillInBlankItem = {
            id: 1,
            type: "fill-in-blank",
            question: "What is the capital of France?",
            acceptedAnswers: ["Paris"],
            gradingConfig: {
                enableAnswerCheck: false,
            },
        };

        const result = gradeFillInBlank(item, "Paris");
        expect(result.passed).toBe(false);
    });
});
