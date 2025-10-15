// Grading utilities for User Story 3.2: Local auto-grading for simple items

import type { MultipleChoiceItem, FillInBlankItem } from "../types/AssignmentItem";

export interface MCQGradingResult {
    passed: boolean;
    selectedAnswers: number[];
    correctAnswers: number[];
    feedbackPerChoice: string[];
}

export interface FillInBlankGradingResult {
    passed: boolean;
    studentAnswer: string;
    acceptedAnswers: string[];
}

/**
 * Grade a Multiple Choice Question based on student's selected answers
 * @param item The MCQ item with correct answers and feedback
 * @param selectedAnswers Array of indices the student selected
 * @returns Grading result with pass/fail and feedback
 */
export function gradeMCQ(
    item: MultipleChoiceItem,
    selectedAnswers: number[]
): MCQGradingResult {
    // Check if answer checking is enabled (default is true)
    const answerCheckEnabled = item.gradingConfig?.enableAnswerCheck !== false;
    
    if (!answerCheckEnabled) {
        // If answer checking is disabled, just return the selections without grading
        return {
            passed: false,
            selectedAnswers,
            correctAnswers: item.correctAnswers,
            feedbackPerChoice: item.choiceFeedback || [],
        };
    }

    // Sort both arrays for comparison
    const sortedSelected = [...selectedAnswers].sort((a, b) => a - b);
    const sortedCorrect = [...item.correctAnswers].sort((a, b) => a - b);

    // Check if arrays are equal
    const passed =
        sortedSelected.length === sortedCorrect.length &&
        sortedSelected.every((val, idx) => val === sortedCorrect[idx]);

    return {
        passed,
        selectedAnswers,
        correctAnswers: item.correctAnswers,
        feedbackPerChoice: item.choiceFeedback || [],
    };
}

/**
 * Grade a Fill-in-Blank question based on student's answer
 * @param item The Fill-in-Blank item with accepted answers and options
 * @param studentAnswer The student's answer string
 * @returns Grading result with pass/fail
 */
export function gradeFillInBlank(
    item: FillInBlankItem,
    studentAnswer: string
): FillInBlankGradingResult {
    // Check if answer checking is enabled (default is true)
    const answerCheckEnabled = item.gradingConfig?.enableAnswerCheck !== false;
    
    if (!answerCheckEnabled) {
        return {
            passed: false,
            studentAnswer,
            acceptedAnswers: item.acceptedAnswers,
        };
    }

    let processedAnswer = studentAnswer;
    
    // Apply trim if enabled (default is true)
    if (item.trimWhitespace !== false) {
        processedAnswer = processedAnswer.trim();
    }

    // Use regex pattern if provided
    if (item.regexPattern && item.regexPattern.trim() !== "") {
        try {
            const flags = item.caseSensitive ? "" : "i";
            const regex = new RegExp(item.regexPattern, flags);
            return {
                passed: regex.test(processedAnswer),
                studentAnswer,
                acceptedAnswers: item.acceptedAnswers,
            };
        } catch (error) {
            // If regex is invalid, fall back to string comparison
            console.warn("Invalid regex pattern:", item.regexPattern, error);
        }
    }

    // Check against accepted answers
    const passed = item.acceptedAnswers.some((acceptedAnswer) => {
        let processedAccepted = acceptedAnswer;
        
        // Apply trim to accepted answer as well
        if (item.trimWhitespace !== false) {
            processedAccepted = processedAccepted.trim();
        }

        // String comparison with optional case sensitivity
        if (item.caseSensitive) {
            return processedAnswer === processedAccepted;
        } else {
            return processedAnswer.toLowerCase() === processedAccepted.toLowerCase();
        }
    });

    return {
        passed,
        studentAnswer,
        acceptedAnswers: item.acceptedAnswers,
    };
}
