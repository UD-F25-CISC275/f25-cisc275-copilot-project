# AI Prompt Templates with Placeholders

This document describes how to use the AI prompt template system with placeholder support (User Story 3.5).

## Overview

The AI prompt template system allows instructors to write grading instructions that dynamically include context-specific information like student answers, test results, questions, and prompts. This is implemented through a `{{placeholder}}` syntax.

## Placeholder Syntax

Placeholders use double curly braces: `{{placeholderName}}`

### Supported Placeholders

- `{{studentAnswer}}` - The student's submitted answer
- `{{testResults}}` - Results from running unit tests (for code items)
- `{{question}}` - The question or prompt text from the item
- `{{prompt}}` - An alias for question/prompt text
- Custom placeholders can be added by extending the `PromptContext` interface

## API Reference

### `processPromptTemplate(template, context)`

Processes a template string by replacing all placeholders with their corresponding values from the context object.

**Parameters:**
- `template` (string): The AI prompt template with `{{placeholder}}` syntax
- `context` (PromptContext): Object containing placeholder values

**Returns:** string - The processed template with placeholders replaced

**Example:**
```typescript
import { processPromptTemplate } from '../utils/promptTemplates';

const template = "Grade this answer: {{studentAnswer}}. Tests: {{testResults}}";
const context = {
  studentAnswer: "function add(a, b) { return a + b; }",
  testResults: "5/5 tests passed"
};

const processed = processPromptTemplate(template, context);
// Result: "Grade this answer: function add(a, b) { return a + b; }. Tests: 5/5 tests passed"
```

**Behavior:**
- If a placeholder has no corresponding value in context, it is left unchanged
- Placeholders are case-sensitive
- Multiple occurrences of the same placeholder are all replaced
- Special characters in replacement values are preserved

### `extractPlaceholders(template)`

Extracts all placeholder names from a template string.

**Parameters:**
- `template` (string): The AI prompt template

**Returns:** string[] - Array of placeholder names (without the `{{}}`)

**Example:**
```typescript
import { extractPlaceholders } from '../utils/promptTemplates';

const placeholders = extractPlaceholders(
  "Grade {{studentAnswer}} based on {{testResults}}"
);
// Result: ["studentAnswer", "testResults"]
```

### `validatePromptTemplate(template, context)`

Validates that all placeholders in a template have corresponding values in the context.

**Parameters:**
- `template` (string): The AI prompt template
- `context` (PromptContext): Object containing placeholder values

**Returns:** Object with:
- `isValid` (boolean): true if all placeholders have values
- `missingPlaceholders` (string[]): Array of placeholder names that are missing

**Example:**
```typescript
import { validatePromptTemplate } from '../utils/promptTemplates';

const template = "Grade {{studentAnswer}} and {{testResults}}";
const context = { studentAnswer: "My answer" };

const validation = validatePromptTemplate(template, context);
// Result: { isValid: false, missingPlaceholders: ["testResults"] }
```

## Usage Examples

### Example 1: Essay Grading

```typescript
const aiPrompt = `
Please grade this essay response:

Question: {{question}}
Student's Answer: {{studentAnswer}}

Evaluate based on:
1. Clarity of argument
2. Use of evidence
3. Writing quality
`;

const context = {
  question: "Explain the significance of the Industrial Revolution",
  studentAnswer: "The Industrial Revolution marked a major turning point..."
};

const processedPrompt = processPromptTemplate(aiPrompt, context);
// Send processedPrompt to AI grading service
```

### Example 2: Code Assignment with Test Results

```typescript
const aiPrompt = `
Code Submission Grading:

Student Code:
{{studentAnswer}}

Unit Test Results:
{{testResults}}

Please evaluate:
- Code correctness (based on test results)
- Code style and readability
- Efficiency of the solution
`;

const context = {
  studentAnswer: "function factorial(n) { return n <= 1 ? 1 : n * factorial(n-1); }",
  testResults: "All 10 tests passed\n✓ factorial(0) === 1\n✓ factorial(5) === 120"
};

const processedPrompt = processPromptTemplate(aiPrompt, context);
```

### Example 3: Multiple Choice with Validation

```typescript
import { validatePromptTemplate, processPromptTemplate } from '../utils/promptTemplates';

const template = "Question: {{question}}\nStudent selected: {{studentAnswer}}";
const context = { question: "What is 2+2?" }; // Missing studentAnswer

// First validate
const validation = validatePromptTemplate(template, context);
if (!validation.isValid) {
  console.warn("Missing placeholders:", validation.missingPlaceholders);
  // Handle missing data before processing
}

// Add missing data
context.studentAnswer = "4";

// Now process
const processed = processPromptTemplate(template, context);
```

## Integration in GradingConfig

The AI prompt is stored in the `GradingConfig` interface:

```typescript
interface GradingConfig {
  // ... other fields
  aiPrompt?: string;
}
```

Instructors can enter prompts with placeholders through the `GradingConfigEditor` component. The UI hints at available placeholders in the description text.

## Future Enhancements

Potential improvements to the template system:

1. **Auto-completion**: Suggest available placeholders as instructors type
2. **Placeholder Preview**: Show what values will be used before grading
3. **Additional Placeholders**: Add more context like `{{rubricCriteria}}`, `{{itemType}}`, `{{assignmentTitle}}`
4. **Conditional Logic**: Support `{{#if}}` blocks for conditional content
5. **Formatting Options**: Support `{{studentAnswer:truncate(100)}}` for value transformations
6. **Template Library**: Pre-built templates for common grading scenarios

## TypeScript Type Reference

```typescript
interface PromptContext {
    studentAnswer?: string;
    testResults?: string;
    question?: string;
    prompt?: string;
    [key: string]: string | undefined;
}

function processPromptTemplate(
    template: string,
    context: PromptContext
): string;

function extractPlaceholders(template: string): string[];

function validatePromptTemplate(
    template: string,
    context: PromptContext
): { isValid: boolean; missingPlaceholders: string[] };
```

## Testing

The prompt template utilities are thoroughly tested with 29 test cases covering:
- Basic placeholder replacement
- Multiple placeholders
- Missing placeholders
- Edge cases (empty templates, special characters, multi-line values)
- Placeholder extraction
- Template validation

See `tests/promptTemplates.spec.ts` for the complete test suite.
