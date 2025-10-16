import type { Collaborator } from "../types/Collaborator";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonValue = any;

/**
 * Type guard to check if a value is a plain object (not an array or null)
 */
function isPlainObject(value: JsonValue): value is Record<string, JsonValue> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * StudentAnswer interface matching the one in AssignmentTaker
 */
interface StudentAnswer {
    itemId: number;
    mcqAnswer?: number[];
    fillInBlankAnswer?: string;
    essayAnswer?: string;
    codeFiles?: Array<{
        name: string;
        language: string;
        content: string;
        isInstructorFile: boolean;
    }>;
}

/**
 * Result interfaces matching those in AssignmentTaker
 */
interface MCQGradingResult {
    passed: boolean;
    selectedAnswers: number[];
    correctAnswers: number[];
    feedbackPerChoice: string[];
}

interface FillInBlankGradingResult {
    passed: boolean;
    studentAnswer: string;
    acceptedAnswers: string[];
}

interface SubmittedResult {
    itemId: number;
    mcqResult?: MCQGradingResult;
    fillInBlankResult?: FillInBlankGradingResult;
}

interface AttemptHistory {
    attemptNumber: number;
    timestamp: string | Date;
    results: SubmittedResult[];
}

/**
 * SubmissionBundle interface matching the exported submission structure
 */
export interface SubmissionBundle {
    assignmentId: number;
    assignmentTitle: string;
    assignmentDescription?: string;
    assignmentEstimatedTime?: number;
    timestamp: string;
    currentPage: number;
    totalPages: number;
    collaborators: Collaborator[];
    answers: StudentAnswer[];
    submittedResults: SubmittedResult[];
    attemptHistory: Partial<Record<number, AttemptHistory[]>>;
    pendingGradingItems: number[];
}

/**
 * Validate StudentAnswer structure
 */
function validateStudentAnswer(answer: JsonValue): boolean {
    if (!isPlainObject(answer)) return false;
    if (typeof answer.itemId !== "number") return false;

    // Validate mcqAnswer if present
    if (answer.mcqAnswer !== undefined) {
        if (!Array.isArray(answer.mcqAnswer)) return false;
        if (!answer.mcqAnswer.every((i: JsonValue) => typeof i === "number")) {
            return false;
        }
    }

    // Validate fillInBlankAnswer if present
    if (answer.fillInBlankAnswer !== undefined) {
        if (typeof answer.fillInBlankAnswer !== "string") return false;
    }

    // Validate essayAnswer if present
    if (answer.essayAnswer !== undefined) {
        if (typeof answer.essayAnswer !== "string") return false;
    }

    // Validate codeFiles if present
    if (answer.codeFiles !== undefined) {
        if (!Array.isArray(answer.codeFiles)) return false;
        if (!answer.codeFiles.every((f: JsonValue) => 
            isPlainObject(f) &&
            typeof f.name === "string" &&
            typeof f.language === "string" &&
            typeof f.content === "string" &&
            typeof f.isInstructorFile === "boolean"
        )) {
            return false;
        }
    }

    return true;
}

/**
 * Validate SubmittedResult structure
 */
function validateSubmittedResult(result: JsonValue): boolean {
    if (!isPlainObject(result)) return false;
    if (typeof result.itemId !== "number") return false;

    // Check mcqResult if present
    if (result.mcqResult !== undefined) {
        if (!isPlainObject(result.mcqResult)) return false;
        if (typeof result.mcqResult.passed !== "boolean") return false;
        if (!Array.isArray(result.mcqResult.selectedAnswers)) return false;
        if (!result.mcqResult.selectedAnswers.every((a: JsonValue) => typeof a === "number")) {
            return false;
        }
        if (!Array.isArray(result.mcqResult.correctAnswers)) return false;
        if (!result.mcqResult.correctAnswers.every((a: JsonValue) => typeof a === "number")) {
            return false;
        }
        if (!Array.isArray(result.mcqResult.feedbackPerChoice)) return false;
        if (!result.mcqResult.feedbackPerChoice.every((f: JsonValue) => typeof f === "string")) {
            return false;
        }
    }

    // Check fillInBlankResult if present
    if (result.fillInBlankResult !== undefined) {
        if (!isPlainObject(result.fillInBlankResult)) return false;
        if (typeof result.fillInBlankResult.passed !== "boolean") return false;
        if (typeof result.fillInBlankResult.studentAnswer !== "string") return false;
        if (!Array.isArray(result.fillInBlankResult.acceptedAnswers)) return false;
        if (!result.fillInBlankResult.acceptedAnswers.every((a: JsonValue) => typeof a === "string")) {
            return false;
        }
    }

    return true;
}

/**
 * Validate AttemptHistory structure
 */
function validateAttemptHistory(attempt: JsonValue): boolean {
    if (!isPlainObject(attempt)) return false;
    if (typeof attempt.attemptNumber !== "number") return false;
    if (typeof attempt.timestamp !== "string") return false;
    if (!Array.isArray(attempt.results)) return false;
    return attempt.results.every((r: JsonValue) => validateSubmittedResult(r));
}

/**
 * Validate Collaborator structure
 */
function validateCollaborator(collab: JsonValue): boolean {
    if (!isPlainObject(collab)) return false;
    return typeof collab.name === "string" && typeof collab.email === "string";
}

/**
 * Validate that an object has the required SubmissionBundle schema.
 *
 * @param data - The data to validate
 * @returns true if the data is a valid SubmissionBundle, false otherwise
 */
export function isValidSubmissionSchema(data: JsonValue): data is SubmissionBundle {
    if (!isPlainObject(data)) {
        return false;
    }

    // Check required fields
    if (
        typeof data.assignmentId !== "number" ||
        typeof data.assignmentTitle !== "string" ||
        typeof data.timestamp !== "string" ||
        typeof data.currentPage !== "number" ||
        typeof data.totalPages !== "number" ||
        !Array.isArray(data.collaborators) ||
        !Array.isArray(data.answers) ||
        !Array.isArray(data.submittedResults) ||
        !isPlainObject(data.attemptHistory) ||
        !Array.isArray(data.pendingGradingItems)
    ) {
        return false;
    }

    // Validate optional fields if present
    if (data.assignmentDescription !== undefined && typeof data.assignmentDescription !== "string") {
        return false;
    }

    if (data.assignmentEstimatedTime !== undefined && typeof data.assignmentEstimatedTime !== "number") {
        return false;
    }

    // Validate collaborators array
    for (const collab of data.collaborators) {
        if (!validateCollaborator(collab)) {
            return false;
        }
    }

    // Validate answers array
    for (const answer of data.answers) {
        if (!validateStudentAnswer(answer)) {
            return false;
        }
    }

    // Validate submittedResults array
    for (const result of data.submittedResults) {
        if (!validateSubmittedResult(result)) {
            return false;
        }
    }

    // Validate attemptHistory object
    for (const key of Object.keys(data.attemptHistory)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const pageHistory: JsonValue = data.attemptHistory[key];
        if (!Array.isArray(pageHistory)) return false;
        for (const attempt of pageHistory) {
            if (!validateAttemptHistory(attempt)) {
                return false;
            }
        }
    }

    // Validate pendingGradingItems array
    for (const id of data.pendingGradingItems) {
        if (typeof id !== "number") {
            return false;
        }
    }

    return true;
}

/**
 * Parse and validate a submission from a JSON string.
 * Throws an error if the JSON is invalid or doesn't match the SubmissionBundle schema.
 *
 * @param jsonString - The JSON string to parse
 * @returns The parsed and validated SubmissionBundle object
 * @throws Error if JSON is invalid or schema validation fails
 */
export function parseSubmissionJSON(jsonString: string): SubmissionBundle {
    let parsed: JsonValue;

    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        parsed = JSON.parse(jsonString);
    } catch (error) {
        throw new Error(
            `Invalid JSON: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }

    if (!isValidSubmissionSchema(parsed)) {
        throw new Error(
            "Invalid submission schema: The file does not contain a valid submission bundle structure."
        );
    }

    return parsed;
}

/**
 * Import a submission from a file.
 * This function reads the file, validates its content, and returns the submission bundle.
 *
 * @param file - The file to import
 * @returns A promise that resolves to the imported SubmissionBundle
 * @throws Error if the file cannot be read or contains invalid data
 */
export async function importSubmissionFromFile(
    file: File
): Promise<SubmissionBundle> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const content = event.target?.result;
                if (typeof content !== "string") {
                    reject(new Error("Failed to read file content"));
                    return;
                }

                const submission = parseSubmissionJSON(content);
                resolve(submission);
            } catch (error) {
                if (error instanceof Error) {
                    reject(error);
                } else {
                    reject(new Error("Unknown error occurred"));
                }
            }
        };

        reader.onerror = () => {
            reject(new Error("Failed to read file"));
        };

        reader.readAsText(file);
    });
}
