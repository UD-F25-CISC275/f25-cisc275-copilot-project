// Utility for processing AI prompt templates with placeholders for User Story 3.5

/**
 * Context data that can be used to replace placeholders in AI prompt templates
 */
export interface PromptContext {
    studentAnswer?: string;
    testResults?: string;
    question?: string;
    prompt?: string;
    [key: string]: string | undefined;
}

/**
 * Process an AI prompt template by replacing {{placeholder}} syntax with actual values
 * @param template The AI prompt template string with {{placeholder}} syntax
 * @param context The context object containing values to replace placeholders
 * @returns The processed prompt with placeholders replaced
 * 
 * @example
 * processPromptTemplate(
 *   "Grade this answer: {{studentAnswer}}",
 *   { studentAnswer: "Hello World" }
 * )
 * // Returns: "Grade this answer: Hello World"
 */
export function processPromptTemplate(
    template: string,
    context: PromptContext
): string {
    if (!template) {
        return template;
    }

    // Replace all {{placeholder}} patterns with corresponding context values
    return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
        // If the key exists in context, use its value; otherwise keep the placeholder
        const value = context[key as keyof PromptContext];
        return value !== undefined ? value : match;
    });
}

/**
 * Extract all placeholder names from a template string
 * @param template The AI prompt template string
 * @returns Array of placeholder names found in the template
 * 
 * @example
 * extractPlaceholders("Grade {{studentAnswer}} based on {{testResults}}")
 * // Returns: ["studentAnswer", "testResults"]
 */
export function extractPlaceholders(template: string): string[] {
    if (!template) {
        return [];
    }

    const placeholders: string[] = [];
    const regex = /\{\{(\w+)\}\}/g;
    let match;

    while ((match = regex.exec(template)) !== null) {
        placeholders.push(match[1]);
    }

    return placeholders;
}

/**
 * Validate that all placeholders in a template have corresponding values in the context
 * @param template The AI prompt template string
 * @param context The context object containing values
 * @returns Object with isValid flag and array of missing placeholder names
 */
export function validatePromptTemplate(
    template: string,
    context: PromptContext
): { isValid: boolean; missingPlaceholders: string[] } {
    const placeholders = extractPlaceholders(template);
    const missingPlaceholders = placeholders.filter(
        (key) => context[key] === undefined
    );

    return {
        isValid: missingPlaceholders.length === 0,
        missingPlaceholders,
    };
}
