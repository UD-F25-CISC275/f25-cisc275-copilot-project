import { useState } from "react";
import type { Assignment } from "../types/Assignment";
import type { AssignmentItem } from "../types/AssignmentItem";
import { gradeMCQ, gradeFillInBlank, type MCQGradingResult, type FillInBlankGradingResult } from "../utils/grading";
import "../styles/AssignmentTaker.css";

interface AssignmentTakerProps {
    assignment: Assignment;
    onBack: () => void;
}

interface StudentAnswer {
    itemId: number;
    mcqAnswer?: number[];
    fillInBlankAnswer?: string;
}

interface SubmittedResult {
    itemId: number;
    mcqResult?: MCQGradingResult;
    fillInBlankResult?: FillInBlankGradingResult;
}

export function AssignmentTaker({ assignment, onBack }: AssignmentTakerProps) {
    const [answers, setAnswers] = useState<StudentAnswer[]>([]);
    const [submittedResults, setSubmittedResults] = useState<SubmittedResult[]>([]);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const updateMCQAnswer = (itemId: number, choiceIndex: number, checked: boolean) => {
        setAnswers((prev) => {
            const existing = prev.find((a) => a.itemId === itemId);
            const currentAnswers = existing?.mcqAnswer || [];
            
            let newAnswers: number[];
            if (checked) {
                newAnswers = [...currentAnswers, choiceIndex];
            } else {
                newAnswers = currentAnswers.filter((i) => i !== choiceIndex);
            }

            return [
                ...prev.filter((a) => a.itemId !== itemId),
                { itemId, mcqAnswer: newAnswers },
            ];
        });
    };

    const updateFillInBlankAnswer = (itemId: number, answer: string) => {
        setAnswers((prev) => [
            ...prev.filter((a) => a.itemId !== itemId),
            { itemId, fillInBlankAnswer: answer },
        ]);
    };

    const getAnswer = (itemId: number): StudentAnswer | undefined => {
        return answers.find((a) => a.itemId === itemId);
    };

    const getSubmittedResult = (itemId: number): SubmittedResult | undefined => {
        return submittedResults.find((r) => r.itemId === itemId);
    };

    const handleSubmit = () => {
        const results: SubmittedResult[] = [];

        assignment.items.forEach((item) => {
            if (item.type === "multiple-choice") {
                const answer = getAnswer(item.id);
                const mcqResult = gradeMCQ(
                    item,
                    answer?.mcqAnswer || []
                );
                results.push({ itemId: item.id, mcqResult });
            } else if (item.type === "fill-in-blank") {
                const answer = getAnswer(item.id);
                const fillInBlankResult = gradeFillInBlank(
                    item,
                    answer?.fillInBlankAnswer || ""
                );
                results.push({ itemId: item.id, fillInBlankResult });
            }
        });

        setSubmittedResults(results);
        setHasSubmitted(true);
    };

    const renderItem = (item: AssignmentItem) => {
        const answer = getAnswer(item.id);
        const result = getSubmittedResult(item.id);

        if (item.type === "text") {
            const rubric = item.gradingConfig?.rubric;
            return (
                <div key={item.id} className="taker-item text-item">
                    <div className="text-content">{item.content}</div>
                    {rubric && hasSubmitted && (
                        <div className="rubric-feedback" data-testid={`rubric-feedback-${item.id}`}>
                            <div className="feedback-status awaiting">
                                ⏳ Awaiting grading
                            </div>
                            <div className="rubric-info">
                                <strong>{rubric.title || "Rubric"}</strong>
                                {rubric.description && (
                                    <p className="rubric-description">{rubric.description}</p>
                                )}
                                {rubric.criteria.length > 0 && (
                                    <div className="rubric-criteria-display">
                                        <h4>Grading Criteria:</h4>
                                        <ul>
                                            {rubric.criteria.map((criteria, index) => (
                                                <li key={index}>
                                                    <span className="criteria-name">{criteria.name || `Level ${criteria.level}`}</span>
                                                    {criteria.description && (
                                                        <span className="criteria-desc">: {criteria.description}</span>
                                                    )}
                                                    <span className="criteria-points"> ({criteria.points} points)</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="max-points">
                                            Maximum Points: {rubric.criteria.reduce((sum, c) => sum + c.points, 0)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (item.type === "multiple-choice") {
            const mcqResult = result?.mcqResult;
            return (
                <div key={item.id} className="taker-item mcq-item">
                    <div className="question">{item.question}</div>
                    <div className="choices">
                        {item.choices.map((choice, index) => {
                            const isSelected = answer?.mcqAnswer?.includes(index) || false;
                            const isCorrect = item.correctAnswers.includes(index);
                            const feedback = mcqResult?.feedbackPerChoice[index];
                            
                            return (
                                <div key={index} className="choice">
                                    <label className="choice-label">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => updateMCQAnswer(item.id, index, e.target.checked)}
                                            disabled={hasSubmitted}
                                            data-testid={`mcq-choice-${item.id}-${index}`}
                                        />
                                        <span>{choice}</span>
                                        {hasSubmitted && isSelected && isCorrect && (
                                            <span className="choice-indicator correct">✓</span>
                                        )}
                                        {hasSubmitted && isSelected && !isCorrect && (
                                            <span className="choice-indicator incorrect">✗</span>
                                        )}
                                    </label>
                                    {hasSubmitted && isSelected && feedback && (
                                        <div className="choice-feedback">{feedback}</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {hasSubmitted && mcqResult && (
                        <div className={`result ${mcqResult.passed ? "passed" : "failed"}`}>
                            {mcqResult.passed ? "✓ Correct!" : "✗ Incorrect"}
                        </div>
                    )}
                </div>
            );
        }

        if (item.type === "fill-in-blank") {
            const fillResult = result?.fillInBlankResult;
            return (
                <div key={item.id} className="taker-item fill-blank-item">
                    <div className="question">{item.question}</div>
                    <input
                        type="text"
                        value={answer?.fillInBlankAnswer || ""}
                        onChange={(e) => updateFillInBlankAnswer(item.id, e.target.value)}
                        placeholder="Enter your answer..."
                        disabled={hasSubmitted}
                        className="fill-blank-input"
                        data-testid={`fill-blank-input-${item.id}`}
                    />
                    {hasSubmitted && fillResult && (
                        <div className={`result ${fillResult.passed ? "passed" : "failed"}`}>
                            {fillResult.passed ? "✓ Correct!" : "✗ Incorrect"}
                        </div>
                    )}
                </div>
            );
        }

        if (item.type === "essay") {
            const rubric = item.gradingConfig?.rubric;
            return (
                <div key={item.id} className="taker-item essay-item">
                    <div className="prompt">{item.prompt}</div>
                    <textarea
                        placeholder="Write your response..."
                        className="essay-textarea"
                        data-testid={`essay-textarea-${item.id}`}
                    />
                    <div className="essay-note">Essay items require manual grading</div>
                    {rubric && hasSubmitted && (
                        <div className="rubric-feedback" data-testid={`rubric-feedback-${item.id}`}>
                            <div className="feedback-status awaiting">
                                ⏳ Awaiting grading
                            </div>
                            <div className="rubric-info">
                                <strong>{rubric.title || "Rubric"}</strong>
                                {rubric.description && (
                                    <p className="rubric-description">{rubric.description}</p>
                                )}
                                {rubric.criteria.length > 0 && (
                                    <div className="rubric-criteria-display">
                                        <h4>Grading Criteria:</h4>
                                        <ul>
                                            {rubric.criteria.map((criteria, index) => (
                                                <li key={index}>
                                                    <span className="criteria-name">{criteria.name || `Level ${criteria.level}`}</span>
                                                    {criteria.description && (
                                                        <span className="criteria-desc">: {criteria.description}</span>
                                                    )}
                                                    <span className="criteria-points"> ({criteria.points} points)</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="max-points">
                                            Maximum Points: {rubric.criteria.reduce((sum, c) => sum + c.points, 0)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (item.type === "code-cell") {
            const rubric = item.gradingConfig?.rubric;
            return (
                <div key={item.id} className="taker-item code-cell-item">
                    <div className="prompt">{item.prompt}</div>
                    <div className="code-note">Code execution not available in taker view</div>
                    {rubric && hasSubmitted && (
                        <div className="rubric-feedback" data-testid={`rubric-feedback-${item.id}`}>
                            <div className="feedback-status awaiting">
                                ⏳ Awaiting grading
                            </div>
                            <div className="rubric-info">
                                <strong>{rubric.title || "Rubric"}</strong>
                                {rubric.description && (
                                    <p className="rubric-description">{rubric.description}</p>
                                )}
                                {rubric.criteria.length > 0 && (
                                    <div className="rubric-criteria-display">
                                        <h4>Grading Criteria:</h4>
                                        <ul>
                                            {rubric.criteria.map((criteria, index) => (
                                                <li key={index}>
                                                    <span className="criteria-name">{criteria.name || `Level ${criteria.level}`}</span>
                                                    {criteria.description && (
                                                        <span className="criteria-desc">: {criteria.description}</span>
                                                    )}
                                                    <span className="criteria-points"> ({criteria.points} points)</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="max-points">
                                            Maximum Points: {rubric.criteria.reduce((sum, c) => sum + c.points, 0)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // page-break
        return (
            <div key={item.id} className="taker-item page-break">
                <hr />
            </div>
        );
    };

    return (
        <div className="assignment-taker">
            <div className="taker-header">
                <button onClick={onBack} className="back-button">
                    ← Back to Dashboard
                </button>
                <h1>{assignment.title}</h1>
                {assignment.description && (
                    <p className="assignment-description">{assignment.description}</p>
                )}
            </div>

            <div className="taker-items">
                {assignment.items.map((item) => renderItem(item))}
            </div>

            <div className="taker-footer">
                <button
                    onClick={handleSubmit}
                    disabled={hasSubmitted}
                    className="submit-button"
                    data-testid="submit-button"
                >
                    {hasSubmitted ? "Submitted" : "Submit Assignment"}
                </button>
            </div>
        </div>
    );
}
