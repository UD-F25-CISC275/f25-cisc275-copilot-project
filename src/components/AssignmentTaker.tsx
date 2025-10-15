import { useState } from "react";
import type { Assignment } from "../types/Assignment";
import type { AssignmentItem, CodeFile } from "../types/AssignmentItem";
import { gradeMCQ, gradeFillInBlank, type MCQGradingResult, type FillInBlankGradingResult } from "../utils/grading";
import { usePyodide } from "../hooks/usePyodide";
import "../styles/AssignmentTaker.css";

// Python code to redirect stdout for capturing print statements
const PYTHON_STDOUT_REDIRECT = `
import sys
from io import StringIO
sys.stdout = StringIO()
`;

interface AssignmentTakerProps {
    assignment: Assignment;
    onBack: () => void;
}

interface StudentAnswer {
    itemId: number;
    mcqAnswer?: number[];
    fillInBlankAnswer?: string;
    codeFiles?: CodeFile[];
}

interface SubmittedResult {
    itemId: number;
    mcqResult?: MCQGradingResult;
    fillInBlankResult?: FillInBlankGradingResult;
}

interface CodeExecutionState {
    itemId: number;
    isExecuting: boolean;
    result: string;
}

interface TestExecutionState {
    itemId: number;
    isExecuting: boolean;
    result: string;
}

export function AssignmentTaker({ assignment, onBack }: AssignmentTakerProps) {
    const [answers, setAnswers] = useState<StudentAnswer[]>([]);
    const [submittedResults, setSubmittedResults] = useState<SubmittedResult[]>([]);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [codeExecutionStates, setCodeExecutionStates] = useState<CodeExecutionState[]>([]);
    const [testExecutionStates, setTestExecutionStates] = useState<TestExecutionState[]>([]);
    const { pyodide, loading: pyodideLoading, error: pyodideError } = usePyodide();

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

    const updateCodeFiles = (itemId: number, files: CodeFile[]) => {
        setAnswers((prev) => [
            ...prev.filter((a) => a.itemId !== itemId),
            { itemId, codeFiles: files },
        ]);
    };

    const getAnswer = (itemId: number): StudentAnswer | undefined => {
        return answers.find((a) => a.itemId === itemId);
    };

    const getCodeExecutionState = (itemId: number): CodeExecutionState | undefined => {
        return codeExecutionStates.find((s) => s.itemId === itemId);
    };

    const getTestExecutionState = (itemId: number): TestExecutionState | undefined => {
        return testExecutionStates.find((s) => s.itemId === itemId);
    };

    const executeCode = (itemId: number, files: CodeFile[]) => {
        if (!pyodide) {
            setCodeExecutionStates((prev) => [
                ...prev.filter((s) => s.itemId !== itemId),
                { itemId, isExecuting: false, result: "Error: Python runtime not loaded yet. Please wait..." }
            ]);
            return;
        }

        setCodeExecutionStates((prev) => [
            ...prev.filter((s) => s.itemId !== itemId),
            { itemId, isExecuting: true, result: "" }
        ]);

        try {
            // Redirect stdout to capture print statements
            pyodide.runPython(PYTHON_STDOUT_REDIRECT);

            // Execute all non-instructor files
            const studentFiles = files.filter(f => !f.isInstructorFile);
            for (const file of studentFiles) {
                if (file.language === "python" && file.content.trim()) {
                    pyodide.runPython(file.content);
                }
            }

            // Get the output
            const output = String(pyodide.runPython("sys.stdout.getvalue()"));
            setCodeExecutionStates((prev) => [
                ...prev.filter((s) => s.itemId !== itemId),
                { itemId, isExecuting: false, result: output || "Code executed successfully (no output)" }
            ]);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            setCodeExecutionStates((prev) => [
                ...prev.filter((s) => s.itemId !== itemId),
                { itemId, isExecuting: false, result: `Error: ${errorMsg}` }
            ]);
        }
    };

    const executeTests = (itemId: number, files: CodeFile[], testFileName: string) => {
        if (!pyodide) {
            setTestExecutionStates((prev) => [
                ...prev.filter((s) => s.itemId !== itemId),
                { itemId, isExecuting: false, result: "Error: Python runtime not loaded yet. Please wait..." }
            ]);
            return;
        }

        setTestExecutionStates((prev) => [
            ...prev.filter((s) => s.itemId !== itemId),
            { itemId, isExecuting: true, result: "" }
        ]);

        try {
            // Redirect stdout to capture print statements
            pyodide.runPython(PYTHON_STDOUT_REDIRECT);

            // Execute all non-instructor files first (student code)
            const studentFiles = files.filter(f => !f.isInstructorFile);
            for (const file of studentFiles) {
                if (file.language === "python" && file.content.trim()) {
                    pyodide.runPython(file.content);
                }
            }

            // Execute the test file
            const testFile = files.find(f => f.name === testFileName && f.isInstructorFile);
            if (!testFile) {
                setTestExecutionStates((prev) => [
                    ...prev.filter((s) => s.itemId !== itemId),
                    { itemId, isExecuting: false, result: `Error: Test file '${testFileName}' not found` }
                ]);
                return;
            }

            if (testFile.language === "python" && testFile.content.trim()) {
                pyodide.runPython(testFile.content);
            }

            // Get the output
            const output = String(pyodide.runPython("sys.stdout.getvalue()"));
            setTestExecutionStates((prev) => [
                ...prev.filter((s) => s.itemId !== itemId),
                { itemId, isExecuting: false, result: output || "Tests executed (no output)" }
            ]);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            setTestExecutionStates((prev) => [
                ...prev.filter((s) => s.itemId !== itemId),
                { itemId, isExecuting: false, result: `Error: ${errorMsg}` }
            ]);
        }
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
            const testFileName = item.gradingConfig?.testFileName;
            
            // Initialize student files from item or answer
            // Always filter out instructor files for security (even from saved answers)
            const answer = getAnswer(item.id);
            const allFiles = answer?.codeFiles || item.files;
            const studentFiles = allFiles.filter(f => !f.isInstructorFile);
            
            // Get execution states
            const codeExecState = getCodeExecutionState(item.id);
            const testExecState = getTestExecutionState(item.id);
            
            // Determine if Python execution is available
            const hasPythonFiles = studentFiles.some(f => f.language === "python");
            
            return (
                <div key={item.id} className="taker-item code-cell-item">
                    <div className="prompt">{item.prompt}</div>
                    
                    {/* File editor */}
                    <div className="code-files-section">
                        {studentFiles.map((file, index) => (
                            <div key={index} className="file-editor">
                                <div className="file-header">
                                    <strong>{file.name}</strong>
                                    <span className="file-language">({file.language})</span>
                                </div>
                                <textarea
                                    value={file.content}
                                    onChange={(e) => {
                                        const updatedFiles = studentFiles.map((f, i) => 
                                            i === index ? { ...f, content: e.target.value } : f
                                        );
                                        updateCodeFiles(item.id, [
                                            ...updatedFiles,
                                            ...item.files.filter(f => f.isInstructorFile)
                                        ]);
                                    }}
                                    placeholder="Enter your code..."
                                    className="code-editor-textarea"
                                    data-testid={`code-file-${item.id}-${index}`}
                                />
                            </div>
                        ))}
                    </div>
                    
                    {/* Execution buttons */}
                    {hasPythonFiles && (
                        <div className="code-execution-section">
                            <button
                                type="button"
                                onClick={() => executeCode(item.id, answer?.codeFiles || item.files)}
                                disabled={codeExecState?.isExecuting || pyodideLoading}
                                className="run-code-button"
                                data-testid={`run-code-${item.id}`}
                            >
                                {codeExecState?.isExecuting
                                    ? "Running..."
                                    : pyodideLoading
                                      ? "Loading Python..."
                                      : "▶ Run Code"}
                            </button>
                            
                            {testFileName && (
                                <button
                                    type="button"
                                    onClick={() => executeTests(item.id, answer?.codeFiles || item.files, testFileName)}
                                    disabled={testExecState?.isExecuting || pyodideLoading}
                                    className="run-tests-button"
                                    data-testid={`run-tests-${item.id}`}
                                >
                                    {testExecState?.isExecuting
                                        ? "Running Tests..."
                                        : pyodideLoading
                                          ? "Loading Python..."
                                          : "🧪 Run Tests"}
                                </button>
                            )}
                            
                            {pyodideError && (
                                <div className="execution-error" data-testid={`pyodide-error-${item.id}`}>
                                    Failed to load Python runtime: {pyodideError}
                                </div>
                            )}
                            
                            {codeExecState?.result && (
                                <div className="execution-result" data-testid={`execution-result-${item.id}`}>
                                    <strong>Output:</strong>
                                    <pre>{codeExecState.result}</pre>
                                </div>
                            )}
                            
                            {testExecState?.result && (
                                <div className="test-result" data-testid={`test-result-${item.id}`}>
                                    <strong>Test Results:</strong>
                                    <pre>{testExecState.result}</pre>
                                </div>
                            )}
                        </div>
                    )}
                    
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
