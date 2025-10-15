// Grading configuration types for User Story 3.1

export interface RubricCriteria {
    level: number;
    name: string;
    description: string;
    points: number;
}

export interface Rubric {
    title: string;
    description: string;
    criteria: RubricCriteria[];
}

export interface GradingConfig {
    // Answer checks (MCQ/Fill-blank) - client evaluation
    // This is inherently enabled if correctAnswers/acceptedAnswers are provided
    enableAnswerCheck?: boolean;

    // Unit tests metadata (Code) - mark one of the files as tests
    testFileName?: string;

    // Rubric - point-based criteria
    rubric?: Rubric;

    // AI prompt - additional grading instructions
    aiPrompt?: string;
}
