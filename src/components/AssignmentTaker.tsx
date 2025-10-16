import { useState, useEffect } from "react";
import type { Assignment } from "../types/Assignment";
import type { AssignmentItem, CodeFile, PageBreakItem } from "../types/AssignmentItem";
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
    essayAnswer?: string;
    codeFiles?: CodeFile[];
}

interface SubmittedResult {
    itemId: number;
    mcqResult?: MCQGradingResult;
    fillInBlankResult?: FillInBlankGradingResult;
}

interface AttemptHistory {
    attemptNumber: number;
    timestamp: Date;
    results: SubmittedResult[];
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

interface Page {
    items: AssignmentItem[];
    pageBreak?: PageBreakItem;
}

interface SavedProgress {
    currentPage: number;
    answers: StudentAnswer[];
    submittedResults: SubmittedResult[];
    attemptHistory: Partial<Record<number, AttemptHistory[]>>;
}

export function AssignmentTaker({ assignment, onBack }: AssignmentTakerProps) {
    const [showIntro, setShowIntro] = useState(true);
    const [answers, setAnswers] = useState<StudentAnswer[]>([]);
    const [submittedResults, setSubmittedResults] = useState<SubmittedResult[]>([]);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [codeExecutionStates, setCodeExecutionStates] = useState<CodeExecutionState[]>([]);
    const [testExecutionStates, setTestExecutionStates] = useState<TestExecutionState[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [attemptHistory, setAttemptHistory] = useState<Partial<Record<number, AttemptHistory[]>>>({});
    const [hasStarted, setHasStarted] = useState(false);
    const [isRestarting, setIsRestarting] = useState(false);
    const { pyodide, loading: pyodideLoading, error: pyodideError } = usePyodide();

    // Load saved progress from localStorage on mount
    useEffect(() => {
        const savedProgressKey = `assignment-progress-${assignment.id}`;
        const savedData = localStorage.getItem(savedProgressKey);
        
        if (savedData) {
            try {
                const progress = JSON.parse(savedData) as SavedProgress;
                setCurrentPage(progress.currentPage);
                setAnswers(progress.answers);
                setSubmittedResults(progress.submittedResults);
                setAttemptHistory(progress.attemptHistory);
            } catch (error) {
                console.error("Failed to load saved progress:", error);
            }
        }
    }, [assignment.id]);

    // Save progress to localStorage whenever relevant state changes
    useEffect(() => {
        if (!showIntro && hasStarted && !isRestarting) {
            const savedProgressKey = `assignment-progress-${assignment.id}`;
            const progress: SavedProgress = {
                currentPage,
                answers,
                submittedResults,
                attemptHistory,
            };
            localStorage.setItem(savedProgressKey, JSON.stringify(progress));
        }
    }, [assignment.id, currentPage, answers, submittedResults, attemptHistory, showIntro, hasStarted, isRestarting]);

    // Split items into pages based on page-break items
    const pages: Page[] = [];
    let currentPageItems: AssignmentItem[] = [];
    
    for (const item of assignment.items) {
        if (item.type === "page-break") {
            // Page break ends the current page
            // TypeScript knows item is PageBreakItem here
            pages.push({
                items: currentPageItems,
                pageBreak: item
            });
            currentPageItems = [];
        } else {
            currentPageItems.push(item);
        }
    }
    
    // Add remaining items as the last page (no page break at the end)
    if (currentPageItems.length > 0 || pages.length === 0) {
        pages.push({
            items: currentPageItems,
            pageBreak: undefined
        });
    }
    
    const finalPages = pages;

    // Calculate total items (excluding page breaks)
    const totalItems = assignment.items.filter(item => item.type !== "page-break").length;

    // Check if there's saved progress
    const hasSavedProgress = (): boolean => {
        const savedProgressKey = `assignment-progress-${assignment.id}`;
        return localStorage.getItem(savedProgressKey) !== null;
    };

    const handleStartOrResumeAssignment = () => {
        setShowIntro(false);
        setHasStarted(true);
    };

    const handleRestartAssignment = () => {
        const savedProgressKey = `assignment-progress-${assignment.id}`;
        setIsRestarting(true);
        localStorage.removeItem(savedProgressKey);
        setCurrentPage(0);
        setAnswers([]);
        setSubmittedResults([]);
        setAttemptHistory({});
        setShowIntro(false);
        setHasStarted(true);
        // Clear restart flag after state updates
        setTimeout(() => setIsRestarting(false), 0);
    };

    // If showing intro screen, render that instead
    if (showIntro) {
        const hasProgress = hasSavedProgress();
        
        return (
            <div className="assignment-taker">
                <div className="taker-header">
                    <button onClick={onBack} className="back-button">
                        ← Back to Dashboard
                    </button>
                    <h1>{assignment.title}</h1>
                </div>
                
                <div className="assignment-intro" data-testid="assignment-intro">
                    <div className="intro-section">
                        <h2>Assignment Overview</h2>
                        
                        {assignment.description && (
                            <div className="intro-description">
                                <strong>Description:</strong>
                                <p>{assignment.description}</p>
                            </div>
                        )}
                        
                        {assignment.estimatedTime && (
                            <div className="intro-estimated-time" data-testid="estimated-time">
                                <strong>Estimated Time:</strong> {assignment.estimatedTime} minutes
                            </div>
                        )}
                        
                        <div className="intro-stats">
                            <div className="stat-item" data-testid="total-items">
                                <strong>Total Items:</strong> {totalItems}
                            </div>
                            <div className="stat-item" data-testid="total-pages">
                                <strong>Total Pages:</strong> {finalPages.length}
                            </div>
                        </div>
                    </div>
                    
                    <div className="intro-actions">
                        {hasProgress ? (
                            <>
                                <button
                                    onClick={handleStartOrResumeAssignment}
                                    className="resume-button"
                                    data-testid="resume-button"
                                >
                                    Resume Assignment
                                </button>
                                <button
                                    onClick={handleRestartAssignment}
                                    className="restart-button"
                                    data-testid="restart-button"
                                >
                                    Start Over
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleStartOrResumeAssignment}
                                className="start-button"
                                data-testid="start-button"
                            >
                                Start Assignment
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

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

    const updateEssayAnswer = (itemId: number, answer: string) => {
        setAnswers((prev) => [
            ...prev.filter((a) => a.itemId !== itemId),
            { itemId, essayAnswer: answer },
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

    // Check if current page allows navigation to next page (for gating)
    const canNavigateToNextPage = (): boolean => {
        if (currentPage >= finalPages.length - 1) {
            return false; // Already on last page
        }
        
        // Check if current page has gating enabled (requireAllCorrect on the page-break)
        const currentPageData = finalPages[currentPage];
        const pageBreak = currentPageData.pageBreak;
        
        if (pageBreak?.requireAllCorrect) {
            // Check if all auto-graded items on current page have been submitted and passed
            if (!hasSubmitted) {
                return false; // Must submit first
            }
            
            const currentPageItems = currentPageData.items;
            for (const item of currentPageItems) {
                if (item.type === "multiple-choice") {
                    const result = getSubmittedResult(item.id);
                    if (!result?.mcqResult?.passed) {
                        return false; // MCQ not passed
                    }
                } else if (item.type === "fill-in-blank") {
                    const result = getSubmittedResult(item.id);
                    if (!result?.fillInBlankResult?.passed) {
                        return false; // Fill-in-blank not passed
                    }
                }
                // Essay and code-cell with rubric don't block (manual grading)
                // Code-cell with unit tests could be checked here if we stored test results
            }
        }
        
        return true;
    };

    const handleSubmit = () => {
        const results: SubmittedResult[] = [];
        const currentPageData = finalPages[currentPage];
        const currentPageItems = currentPageData.items;

        currentPageItems.forEach((item) => {
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

        setSubmittedResults((prev) => {
            // Merge with existing results (keep results from other pages)
            const newResults = [...prev.filter(r => !results.find(nr => nr.itemId === r.itemId))];
            return [...newResults, ...results];
        });
        setHasSubmitted(true);
        
        // Add to attempt history for current page
        setAttemptHistory((prev) => {
            const pageHistory = prev[currentPage] ?? [];
            const attemptNumber = pageHistory.length + 1;
            const newAttempt: AttemptHistory = {
                attemptNumber,
                timestamp: new Date(),
                results
            };
            return {
                ...prev,
                [currentPage]: [...pageHistory, newAttempt]
            };
        });
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
                        value={answer?.essayAnswer || ""}
                        onChange={(e) => updateEssayAnswer(item.id, e.target.value)}
                        placeholder="Write your response..."
                        disabled={hasSubmitted}
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
                {finalPages.length > 1 && (
                    <div className="page-indicator" data-testid="page-indicator">
                        Page {currentPage + 1} of {finalPages.length}
                    </div>
                )}
                {(() => {
                    const pageAttempts = attemptHistory[currentPage];
                    return pageAttempts && pageAttempts.length > 0 && (
                        <div className="attempt-counter" data-testid="attempt-counter">
                            Attempt {pageAttempts.length}
                        </div>
                    );
                })()}
            </div>

            <div className="taker-items">
                {finalPages[currentPage]?.items.map((item) => renderItem(item))}
                {finalPages[currentPage]?.pageBreak && (
                    <div className="taker-item page-break">
                        <hr />
                    </div>
                )}
            </div>

            {(() => {
                const pageAttempts = attemptHistory[currentPage];
                return pageAttempts && pageAttempts.length > 1 && (
                    <div className="attempt-history-section" data-testid="attempt-history">
                        <h3>Past Attempts</h3>
                        <div className="attempt-history-list">
                            {pageAttempts.slice(0, -1).reverse().map((attempt) => (
                            <div key={attempt.attemptNumber} className="past-attempt" data-testid={`past-attempt-${attempt.attemptNumber}`}>
                                <div className="attempt-header">
                                    <strong>Attempt {attempt.attemptNumber}</strong>
                                    <span className="attempt-time">{attempt.timestamp.toLocaleTimeString()}</span>
                                </div>
                                <div className="attempt-results">
                                    {attempt.results.map((result) => {
                                        const item = finalPages[currentPage]?.items.find(i => i.id === result.itemId);
                                        if (!item) return null;
                                        
                                        if (result.mcqResult) {
                                            return (
                                                <div key={result.itemId} className="result-item">
                                                    <span className="item-label">MCQ:</span>
                                                    <span className={`result-badge ${result.mcqResult.passed ? "passed" : "failed"}`}>
                                                        {result.mcqResult.passed ? "✓ Correct" : "✗ Incorrect"}
                                                    </span>
                                                </div>
                                            );
                                        }
                                        
                                        if (result.fillInBlankResult) {
                                            return (
                                                <div key={result.itemId} className="result-item">
                                                    <span className="item-label">Fill-in-blank:</span>
                                                    <span className={`result-badge ${result.fillInBlankResult.passed ? "passed" : "failed"}`}>
                                                        {result.fillInBlankResult.passed ? "✓ Correct" : "✗ Incorrect"}
                                                    </span>
                                                </div>
                                            );
                                        }
                                        
                                        return null;
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                );
            })()}

            <div className="taker-footer">
                <div className="navigation-buttons">
                    {currentPage > 0 && (
                        <button
                            onClick={() => {
                                setCurrentPage(currentPage - 1);
                                setHasSubmitted(false); // Reset submit for new page
                            }}
                            className="previous-button"
                            data-testid="previous-button"
                        >
                            ← Previous Page
                        </button>
                    )}
                    
                    <button
                        onClick={handleSubmit}
                        className="submit-button"
                        data-testid="submit-button"
                    >
                        {hasSubmitted ? "Submit Again" : (finalPages.length > 1 ? "Submit Page" : "Submit Assignment")}
                    </button>
                    
                    {currentPage < finalPages.length - 1 && (
                        <button
                            onClick={() => {
                                setCurrentPage(currentPage + 1);
                                setHasSubmitted(false); // Reset submit for new page
                            }}
                            disabled={!canNavigateToNextPage()}
                            className="next-button"
                            data-testid="next-button"
                        >
                            Next Page →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
