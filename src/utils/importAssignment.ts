import type { Assignment } from "../types/Assignment";
import type { ItemType } from "../types/AssignmentItem";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonValue = any;

/**
 * Type guard to check if a value is a plain object (not an array or null)
 */
function isPlainObject(value: JsonValue): value is Record<string, JsonValue> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate type-specific fields for an AssignmentItem.
 *
 * @param item - The item to validate
 * @returns true if the item's type-specific fields are valid
 */
function validateItemType(item: Record<string, JsonValue>): boolean {
    switch (item.type) {
        case "text":
            return typeof item.content === "string";

        case "multiple-choice": {
            if (typeof item.question !== "string") return false;
            if (!Array.isArray(item.choices)) return false;
            if (!item.choices.every((c: JsonValue) => typeof c === "string"))
                return false;
            if (!Array.isArray(item.correctAnswers)) return false;
            return item.correctAnswers.every((a: JsonValue) => typeof a === "number");
        }

        case "fill-in-blank": {
            if (typeof item.question !== "string") return false;
            if (!Array.isArray(item.acceptedAnswers)) return false;
            return item.acceptedAnswers.every((a: JsonValue) => typeof a === "string");
        }

        case "essay":
            return typeof item.prompt === "string";

        case "code-cell": {
            if (typeof item.prompt !== "string") return false;
            if (!Array.isArray(item.files)) return false;
            return item.files.every((f: JsonValue) => {
                if (!isPlainObject(f)) return false;
                return (
                    typeof f.name === "string" &&
                    typeof f.language === "string" &&
                    typeof f.content === "string" &&
                    typeof f.isInstructorFile === "boolean"
                );
            });
        }

        case "page-break":
            // page-break has no required fields beyond id and type
            return true;

        default:
            return false;
    }
}

/**
 * Validate that an array contains valid AssignmentItem objects.
 *
 * @param items - The items array to validate
 * @returns true if all items are valid, false otherwise
 */
function validateItems(items: JsonValue[]): boolean {
    const validTypes: ItemType[] = [
        "text",
        "multiple-choice",
        "fill-in-blank",
        "essay",
        "code-cell",
        "page-break",
    ];

    for (const item of items) {
        if (!isPlainObject(item)) {
            return false;
        }

        // Check required fields for all items
        if (typeof item.id !== "number" || typeof item.type !== "string") {
            return false;
        }

        // Check that type is valid
        if (!validTypes.includes(item.type as ItemType)) {
            return false;
        }

        // Type-specific validation
        if (!validateItemType(item)) {
            return false;
        }
    }

    return true;
}

/**
 * Validate that an object has the required Assignment schema.
 * Checks for required fields and basic type validation.
 *
 * @param data - The data to validate
 * @returns true if the data is a valid Assignment, false otherwise
 */
export function isValidAssignmentSchema(data: JsonValue): data is Assignment {
    if (!isPlainObject(data)) {
        return false;
    }

    // Check required fields
    if (
        typeof data.id !== "number" ||
        typeof data.title !== "string" ||
        !Array.isArray(data.items)
    ) {
        return false;
    }

    // Validate items array
    return validateItems(data.items);
}

/**
 * Parse and validate an assignment from a JSON string.
 * Throws an error if the JSON is invalid or doesn't match the Assignment schema.
 *
 * @param jsonString - The JSON string to parse
 * @returns The parsed and validated Assignment object
 * @throws Error if JSON is invalid or schema validation fails
 */
export function parseAssignmentJSON(jsonString: string): Assignment {
    let parsed: JsonValue;

    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        parsed = JSON.parse(jsonString);
    } catch (error) {
        throw new Error(
            `Invalid JSON: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }

    if (!isValidAssignmentSchema(parsed)) {
        throw new Error(
            "Invalid assignment schema: The file does not contain a valid assignment structure."
        );
    }

    return parsed;
}

/**
 * Import an assignment from a file.
 * This function reads the file, validates its content, and returns the assignment.
 *
 * @param file - The file to import
 * @returns A promise that resolves to the imported Assignment
 * @throws Error if the file cannot be read or contains invalid data
 */
export async function importAssignmentFromFile(
    file: File
): Promise<Assignment> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const content = event.target?.result;
                if (typeof content !== "string") {
                    reject(new Error("Failed to read file content"));
                    return;
                }

                const assignment = parseAssignmentJSON(content);
                resolve(assignment);
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
