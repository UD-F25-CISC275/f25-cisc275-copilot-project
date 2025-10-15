// Tests for AI prompt template processing utility (User Story 3.5)

import {
    processPromptTemplate,
    extractPlaceholders,
    validatePromptTemplate,
    type PromptContext,
} from "../src/utils/promptTemplates";

describe("processPromptTemplate", () => {
    test("replaces single placeholder with context value", () => {
        const template = "Grade this answer: {{studentAnswer}}";
        const context: PromptContext = { studentAnswer: "Hello World" };
        
        expect(processPromptTemplate(template, context)).toBe(
            "Grade this answer: Hello World"
        );
    });

    test("replaces multiple placeholders with context values", () => {
        const template = "Grade {{studentAnswer}} based on {{testResults}}";
        const context: PromptContext = {
            studentAnswer: "My solution",
            testResults: "5/5 tests passed",
        };
        
        expect(processPromptTemplate(template, context)).toBe(
            "Grade My solution based on 5/5 tests passed"
        );
    });

    test("keeps placeholder unchanged if no context value provided", () => {
        const template = "Grade {{studentAnswer}} and {{testResults}}";
        const context: PromptContext = { studentAnswer: "My answer" };
        
        expect(processPromptTemplate(template, context)).toBe(
            "Grade My answer and {{testResults}}"
        );
    });

    test("handles template with no placeholders", () => {
        const template = "Grade based on clarity and correctness";
        const context: PromptContext = { studentAnswer: "Test" };
        
        expect(processPromptTemplate(template, context)).toBe(
            "Grade based on clarity and correctness"
        );
    });

    test("handles empty template", () => {
        const template = "";
        const context: PromptContext = { studentAnswer: "Test" };
        
        expect(processPromptTemplate(template, context)).toBe("");
    });

    test("handles empty context", () => {
        const template = "Grade {{studentAnswer}}";
        const context: PromptContext = {};
        
        expect(processPromptTemplate(template, context)).toBe(
            "Grade {{studentAnswer}}"
        );
    });

    test("replaces same placeholder multiple times", () => {
        const template = "{{studentAnswer}} is good. Review {{studentAnswer}} again.";
        const context: PromptContext = { studentAnswer: "The code" };
        
        expect(processPromptTemplate(template, context)).toBe(
            "The code is good. Review The code again."
        );
    });

    test("handles complex prompt with multiple different placeholders", () => {
        const template = 
            "Question: {{question}}\nStudent's answer: {{studentAnswer}}\n" +
            "Test results: {{testResults}}\nPlease grade accordingly.";
        const context: PromptContext = {
            question: "What is 2+2?",
            studentAnswer: "4",
            testResults: "All tests passed",
        };
        
        expect(processPromptTemplate(template, context)).toBe(
            "Question: What is 2+2?\nStudent's answer: 4\n" +
            "Test results: All tests passed\nPlease grade accordingly."
        );
    });

    test("handles context with additional unused properties", () => {
        const template = "Grade {{studentAnswer}}";
        const context: PromptContext = {
            studentAnswer: "My answer",
            extraProp: "unused value",
        };
        
        expect(processPromptTemplate(template, context)).toBe(
            "Grade My answer"
        );
    });

    test("preserves whitespace and formatting", () => {
        const template = "  Grade  {{studentAnswer}}  carefully  ";
        const context: PromptContext = { studentAnswer: "this" };
        
        expect(processPromptTemplate(template, context)).toBe(
            "  Grade  this  carefully  "
        );
    });

    test("handles placeholder at start of template", () => {
        const template = "{{studentAnswer}} should be graded";
        const context: PromptContext = { studentAnswer: "This answer" };
        
        expect(processPromptTemplate(template, context)).toBe(
            "This answer should be graded"
        );
    });

    test("handles placeholder at end of template", () => {
        const template = "Please grade: {{studentAnswer}}";
        const context: PromptContext = { studentAnswer: "My solution" };
        
        expect(processPromptTemplate(template, context)).toBe(
            "Please grade: My solution"
        );
    });

    test("handles special characters in replacement value", () => {
        const template = "Grade {{studentAnswer}}";
        const context: PromptContext = {
            studentAnswer: "Answer with $pecial ch@rs & symbols!",
        };
        
        expect(processPromptTemplate(template, context)).toBe(
            "Grade Answer with $pecial ch@rs & symbols!"
        );
    });

    test("handles multi-line replacement values", () => {
        const template = "Student code:\n{{studentAnswer}}\nEnd of code.";
        const context: PromptContext = {
            studentAnswer: "function test() {\n  return 42;\n}",
        };
        
        expect(processPromptTemplate(template, context)).toBe(
            "Student code:\nfunction test() {\n  return 42;\n}\nEnd of code."
        );
    });
});

describe("extractPlaceholders", () => {
    test("extracts single placeholder", () => {
        const template = "Grade {{studentAnswer}}";
        
        expect(extractPlaceholders(template)).toEqual(["studentAnswer"]);
    });

    test("extracts multiple placeholders", () => {
        const template = "Grade {{studentAnswer}} with {{testResults}}";
        
        expect(extractPlaceholders(template)).toEqual([
            "studentAnswer",
            "testResults",
        ]);
    });

    test("extracts duplicate placeholders", () => {
        const template = "{{studentAnswer}} and {{studentAnswer}} again";
        
        expect(extractPlaceholders(template)).toEqual([
            "studentAnswer",
            "studentAnswer",
        ]);
    });

    test("returns empty array for template with no placeholders", () => {
        const template = "Grade based on clarity";
        
        expect(extractPlaceholders(template)).toEqual([]);
    });

    test("returns empty array for empty template", () => {
        const template = "";
        
        expect(extractPlaceholders(template)).toEqual([]);
    });

    test("extracts all standard placeholders", () => {
        const template = 
            "Q: {{question}}\nP: {{prompt}}\nA: {{studentAnswer}}\nT: {{testResults}}";
        
        expect(extractPlaceholders(template)).toEqual([
            "question",
            "prompt",
            "studentAnswer",
            "testResults",
        ]);
    });

    test("handles placeholders with numbers", () => {
        const template = "Grade {{answer1}} and {{answer2}}";
        
        expect(extractPlaceholders(template)).toEqual(["answer1", "answer2"]);
    });

    test("handles placeholders with underscores", () => {
        const template = "Grade {{student_answer}}";
        
        expect(extractPlaceholders(template)).toEqual(["student_answer"]);
    });
});

describe("validatePromptTemplate", () => {
    test("returns valid for template with all placeholders provided", () => {
        const template = "Grade {{studentAnswer}}";
        const context: PromptContext = { studentAnswer: "Test answer" };
        
        const result = validatePromptTemplate(template, context);
        
        expect(result.isValid).toBe(true);
        expect(result.missingPlaceholders).toEqual([]);
    });

    test("returns invalid with missing placeholder names", () => {
        const template = "Grade {{studentAnswer}} and {{testResults}}";
        const context: PromptContext = { studentAnswer: "Test answer" };
        
        const result = validatePromptTemplate(template, context);
        
        expect(result.isValid).toBe(false);
        expect(result.missingPlaceholders).toEqual(["testResults"]);
    });

    test("returns valid for template with no placeholders", () => {
        const template = "Grade based on clarity";
        const context: PromptContext = {};
        
        const result = validatePromptTemplate(template, context);
        
        expect(result.isValid).toBe(true);
        expect(result.missingPlaceholders).toEqual([]);
    });

    test("identifies all missing placeholders", () => {
        const template = "{{question}} - {{studentAnswer}} - {{testResults}}";
        const context: PromptContext = { studentAnswer: "Answer" };
        
        const result = validatePromptTemplate(template, context);
        
        expect(result.isValid).toBe(false);
        expect(result.missingPlaceholders).toEqual(["question", "testResults"]);
    });

    test("returns valid when extra context properties provided", () => {
        const template = "Grade {{studentAnswer}}";
        const context: PromptContext = {
            studentAnswer: "Test",
            extraProp: "unused",
        };
        
        const result = validatePromptTemplate(template, context);
        
        expect(result.isValid).toBe(true);
        expect(result.missingPlaceholders).toEqual([]);
    });

    test("handles empty template", () => {
        const template = "";
        const context: PromptContext = { studentAnswer: "Test" };
        
        const result = validatePromptTemplate(template, context);
        
        expect(result.isValid).toBe(true);
        expect(result.missingPlaceholders).toEqual([]);
    });

    test("treats duplicate placeholders correctly", () => {
        const template = "{{studentAnswer}} and {{studentAnswer}}";
        const context: PromptContext = {};
        
        const result = validatePromptTemplate(template, context);
        
        expect(result.isValid).toBe(false);
        expect(result.missingPlaceholders).toEqual([
            "studentAnswer",
            "studentAnswer",
        ]);
    });
});
