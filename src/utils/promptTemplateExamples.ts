// Example usage of AI prompt template processing for User Story 3.5
// This file demonstrates how to use the prompt template utilities in practice

import { processPromptTemplate, type PromptContext } from "./promptTemplates";
import type { AssignmentItem, EssayItem, CodeCellItem } from "../types/AssignmentItem";

/**
 * Example: Process AI prompt for an essay item
 * 
 * This shows how an instructor's AI grading prompt can be processed
 * with actual student response data
 */
export function processEssayGradingPrompt(
    item: EssayItem,
    studentAnswer: string
): string | undefined {
    const aiPrompt = item.gradingConfig?.aiPrompt;
    
    if (!aiPrompt) {
        return undefined;
    }

    const context: PromptContext = {
        prompt: item.prompt,
        question: item.prompt,
        studentAnswer: studentAnswer,
    };

    return processPromptTemplate(aiPrompt, context);
}

/**
 * Example: Process AI prompt for a code-cell item with test results
 * 
 * This shows how to include both student code and test execution results
 * in the AI grading prompt
 */
export function processCodeGradingPrompt(
    item: CodeCellItem,
    studentCode: string,
    testResults: string
): string | undefined {
    const aiPrompt = item.gradingConfig?.aiPrompt;
    
    if (!aiPrompt) {
        return undefined;
    }

    const context: PromptContext = {
        prompt: item.prompt,
        question: item.prompt,
        studentAnswer: studentCode,
        testResults: testResults,
    };

    return processPromptTemplate(aiPrompt, context);
}

/**
 * Generic example: Process AI prompt for any assignment item
 * 
 * This is a more general approach that can work with any item type
 */
export function processItemGradingPrompt(
    item: AssignmentItem,
    studentAnswer: string,
    testResults?: string
): string | undefined {
    const aiPrompt = item.gradingConfig?.aiPrompt;
    
    if (!aiPrompt) {
        return undefined;
    }

    // Build context based on item type
    const context: PromptContext = {
        studentAnswer: studentAnswer,
    };

    // Add prompt/question if available
    if (item.type === "essay") {
        context.prompt = item.prompt;
        context.question = item.prompt;
    } else if (item.type === "code-cell") {
        context.prompt = item.prompt;
        context.question = item.prompt;
    } else if (item.type === "multiple-choice") {
        context.question = item.question;
    } else if (item.type === "fill-in-blank") {
        context.question = item.question;
    }

    // Add test results if provided
    if (testResults) {
        context.testResults = testResults;
    }

    return processPromptTemplate(aiPrompt, context);
}

/**
 * Example instructor AI prompt templates
 * 
 * These are example prompts that instructors might use
 */
export const examplePrompts = {
    essay: `
Please grade this essay response:

Question: {{question}}
Student's Answer: {{studentAnswer}}

Evaluate based on:
1. Clarity and coherence of argument
2. Use of relevant evidence and examples
3. Writing quality and grammar
4. Depth of analysis

Provide a score out of 10 and detailed feedback.
`,

    codeWithTests: `
Code Assignment Grading:

Student's Code:
{{studentAnswer}}

Unit Test Results:
{{testResults}}

Please evaluate:
- Correctness (based on test results)
- Code style and readability
- Efficiency
- Best practices

Provide a score and specific suggestions for improvement.
`,

    codeWithoutTests: `
Code Review:

Prompt: {{prompt}}

Student's Code:
{{studentAnswer}}

Please review the code for:
- Correctness and logic
- Code organization
- Naming conventions
- Comments and documentation

Provide constructive feedback.
`,

    multipleChoice: `
Question: {{question}}
Student's answer: {{studentAnswer}}

This is an auto-graded multiple choice question.
Please provide additional qualitative feedback on common misconceptions
if the student got it wrong.
`,
};
