import { useState, useMemo } from "react";
import type { Assignment } from "../types/Assignment";
import type { AssignmentItem, ItemType, CodeFile } from "../types/AssignmentItem";
import { MarkdownEditor } from "./MarkdownEditor";
import { GradingConfigEditor } from "./GradingConfigEditor";
import { usePyodide } from "../hooks/usePyodide";
import "../styles/AssignmentEditor.css";

// Python code to redirect stdout for capturing print statements
const PYTHON_STDOUT_REDIRECT = `
import sys
from io import StringIO
sys.stdout = StringIO()
`;

interface AssignmentEditorProps {
    assignment: Assignment;
    onSave: (assignment: Assignment) => void;
    onBack: () => void;
}

function createDefaultItem(type: ItemType, id: number): AssignmentItem {
    switch (type) {
        case "text":
            return { id, type: "text", content: "" };
        case "multiple-choice":
            return {
                id,
                type: "multiple-choice",
                question: "",
                choices: ["", ""],
                correctAnswers: [],
                shuffle: false,
                choiceFeedback: ["", ""],
            };
        case "fill-in-blank":
            return {
                id,
                type: "fill-in-blank",
                question: "",
                acceptedAnswers: [""],
                regexPattern: "",
                caseSensitive: false,
                trimWhitespace: true,
            };
        case "essay":
            return { id, type: "essay", prompt: "" };
        case "code-cell":
            return {
                id,
                type: "code-cell",
                prompt: "",
                files: [
                    {
                        name: "main.py",
                        language: "python",
                        content: "",
                        isInstructorFile: false,
                    },
                ],
            };
        case "page-break":
            return { id, type: "page-break" };
    }
}

interface ItemEditorProps {
    item: AssignmentItem;
    onUpdate: (updates: Partial<AssignmentItem>) => void;
    essayPreviewResponse?: string;
    onEssayPreviewChange?: (value: string) => void;
}

interface CodeCellEditorProps {
    item: AssignmentItem & { type: "code-cell" };
    onUpdate: (updates: Partial<AssignmentItem>) => void;
}

function CodeCellEditor({ item, onUpdate }: CodeCellEditorProps) {
    // Initialize files array if it doesn't exist (backward compatibility)
    const files = useMemo(
        () =>
            item.files.length > 0
                ? item.files
                : [
                      {
                          name: "main.py",
                          language: "python",
                          content: item.starterCode || "",
                          isInstructorFile: false,
                      },
                  ],
        [item.files, item.starterCode]
    );

    const [selectedFileIndex, setSelectedFileIndex] = useState(0);
    const [executionResult, setExecutionResult] = useState<string>("");
    const [isExecuting, setIsExecuting] = useState(false);
    const { pyodide, loading: pyodideLoading, error: pyodideError } = usePyodide();

    // Memoize student files to avoid recalculating on every render
    const studentFiles = useMemo(
        () => files.filter(f => !f.isInstructorFile),
        [files]
    );

    const addFile = () => {
        const newFiles = [
            ...files,
            {
                name: `file${files.length + 1}.py`,
                language: "python",
                content: "",
                isInstructorFile: false,
            },
        ];
        onUpdate({ files: newFiles });
    };

    const removeFile = (index: number) => {
        if (files.length > 1) {
            const newFiles = files.filter((_, i) => i !== index);
            onUpdate({ files: newFiles });
            if (selectedFileIndex >= newFiles.length) {
                setSelectedFileIndex(newFiles.length - 1);
            }
        }
    };

    const updateFile = (index: number, updates: Partial<CodeFile>) => {
        const newFiles = files.map((file, i) =>
            i === index ? { ...file, ...updates } : file
        );
        onUpdate({ files: newFiles });
    };

    const executeCode = () => {
        if (!pyodide) {
            setExecutionResult("Error: Python runtime not loaded yet. Please wait...");
            return;
        }

        setIsExecuting(true);
        setExecutionResult("");

        try {
            // Redirect stdout to capture print statements
            pyodide.runPython(PYTHON_STDOUT_REDIRECT);

            // Execute all non-instructor files
            for (const file of studentFiles) {
                if (file.language === "python" && file.content.trim()) {
                    pyodide.runPython(file.content);
                }
            }

            // Get the output
            const output = String(pyodide.runPython("sys.stdout.getvalue()"));
            setExecutionResult(output || "Code executed successfully (no output)");
        } catch (error) {
            if (error instanceof Error) {
                setExecutionResult(`Error: ${error.message}`);
            } else {
                setExecutionResult(`Error: ${String(error)}`);
            }
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="code-cell-item-editor">
            <label>
                <strong>Code Cell:</strong>
            </label>
            <textarea
                value={item.prompt}
                onChange={(e) => onUpdate({ prompt: e.target.value })}
                placeholder="Enter coding prompt..."
                data-testid={`code-prompt-${item.id}`}
            />

            <div className="code-files-section">
                <div className="code-files-header">
                    <strong>Files:</strong>
                    <button
                        type="button"
                        onClick={addFile}
                        className="add-file-button"
                        data-testid={`add-file-${item.id}`}
                    >
                        + Add File
                    </button>
                </div>

                <div className="file-tabs">
                    {files.map((file, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`file-tab ${selectedFileIndex === index ? "active" : ""}`}
                            onClick={() => setSelectedFileIndex(index)}
                            data-testid={`file-tab-${item.id}-${index}`}
                        >
                            {file.name}
                            {file.isInstructorFile && (
                                <span className="instructor-badge">
                                    {" "}
                                    (Instructor)
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {files.length > 0 && (
                    <div
                        className="file-editor"
                        data-testid={`file-editor-${item.id}`}
                    >
                        <div className="file-controls">
                            <div className="file-control-row">
                                <label>
                                    File Name:
                                    <input
                                        type="text"
                                        value={files[selectedFileIndex].name}
                                        onChange={(e) =>
                                            updateFile(selectedFileIndex, {
                                                name: e.target.value,
                                            })
                                        }
                                        data-testid={`file-name-${item.id}-${selectedFileIndex}`}
                                    />
                                </label>
                                <label>
                                    Language:
                                    <select
                                        value={
                                            files[selectedFileIndex].language
                                        }
                                        onChange={(e) =>
                                            updateFile(selectedFileIndex, {
                                                language: e.target.value,
                                            })
                                        }
                                        data-testid={`file-language-${item.id}-${selectedFileIndex}`}
                                    >
                                        <option value="python">Python</option>
                                        <option value="javascript">
                                            JavaScript
                                        </option>
                                        <option value="typescript">
                                            TypeScript
                                        </option>
                                        <option value="java">Java</option>
                                        <option value="cpp">C++</option>
                                        <option value="c">C</option>
                                    </select>
                                </label>
                            </div>
                            <div className="file-control-row">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={
                                            files[selectedFileIndex]
                                                .isInstructorFile
                                        }
                                        onChange={(e) =>
                                            updateFile(selectedFileIndex, {
                                                isInstructorFile:
                                                    e.target.checked,
                                            })
                                        }
                                        data-testid={`file-instructor-${item.id}-${selectedFileIndex}`}
                                    />
                                    Instructor File (hidden from students)
                                </label>
                                {files.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeFile(selectedFileIndex)
                                        }
                                        className="remove-file-button"
                                        data-testid={`remove-file-${item.id}-${selectedFileIndex}`}
                                    >
                                        Remove File
                                    </button>
                                )}
                            </div>
                        </div>
                        <textarea
                            value={files[selectedFileIndex].content}
                            onChange={(e) =>
                                updateFile(selectedFileIndex, {
                                    content: e.target.value,
                                })
                            }
                            placeholder="Enter code..."
                            className="code-editor-textarea"
                            data-testid={`file-content-${item.id}-${selectedFileIndex}`}
                        />
                    </div>
                )}

                {/* Execution section for Python files */}
                {files.some(f => f.language === "python" && !f.isInstructorFile) && (
                    <div className="code-execution-section">
                        <button
                            type="button"
                            onClick={executeCode}
                            disabled={isExecuting || pyodideLoading}
                            className="run-code-button"
                            data-testid={`run-code-${item.id}`}
                        >
                            {isExecuting
                                ? "Running..."
                                : pyodideLoading
                                  ? "Loading Python..."
                                  : "▶ Run Code"}
                        </button>
                        {pyodideError && (
                            <div className="execution-error" data-testid={`pyodide-error-${item.id}`}>
                                Failed to load Python runtime: {pyodideError}
                            </div>
                        )}
                        {executionResult && (
                            <div className="execution-result" data-testid={`execution-result-${item.id}`}>
                                <strong>Output:</strong>
                                <pre>{executionResult}</pre>
                            </div>
                        )}
                    </div>
                )}

                <GradingConfigEditor
                    itemType={item.type}
                    config={item.gradingConfig}
                    onChange={(config) => onUpdate({ gradingConfig: config })}
                    files={files}
                />
            </div>
        </div>
    );
}

function ItemEditor({ item, onUpdate, essayPreviewResponse = "", onEssayPreviewChange }: ItemEditorProps) {
    switch (item.type) {
        case "text":
            return (
                <div className="text-item-editor">
                    <label>
                        <strong>Text Block:</strong>
                    </label>
                    <MarkdownEditor
                        value={item.content}
                        onChange={(value) => onUpdate({ content: value })}
                        placeholder="Enter text content using markdown..."
                        testId={`text-content-${item.id}`}
                    />
                    <GradingConfigEditor
                        itemType={item.type}
                        config={item.gradingConfig}
                        onChange={(config) => onUpdate({ gradingConfig: config })}
                    />
                </div>
            );
        case "multiple-choice":
            return (
                <div className="mcq-item-editor">
                    <label>
                        <strong>Multiple Choice Question:</strong>
                    </label>
                    <input
                        type="text"
                        value={item.question}
                        onChange={(e) =>
                            onUpdate({ question: e.target.value })
                        }
                        placeholder="Enter question..."
                        data-testid={`mcq-question-${item.id}`}
                    />
                    <div className="mcq-options">
                        <label>
                            <input
                                type="checkbox"
                                checked={item.shuffle || false}
                                onChange={(e) =>
                                    onUpdate({ shuffle: e.target.checked })
                                }
                                data-testid={`mcq-shuffle-${item.id}`}
                            />
                            Shuffle choices for students
                        </label>
                    </div>
                    <div className="choices">
                        {item.choices.map((choice, index) => (
                            <div key={index} className="choice-item">
                                <div className="choice-input-row">
                                    <input
                                        type="text"
                                        value={choice}
                                        onChange={(e) => {
                                            const newChoices = [...item.choices];
                                            newChoices[index] = e.target.value;
                                            onUpdate({ choices: newChoices });
                                        }}
                                        placeholder={`Choice ${index + 1}`}
                                        data-testid={`mcq-choice-${item.id}-${index}`}
                                    />
                                    <input
                                        type="checkbox"
                                        checked={item.correctAnswers.includes(
                                            index
                                        )}
                                        onChange={(e) => {
                                            const newCorrect = e.target.checked
                                                ? [...item.correctAnswers, index]
                                                : item.correctAnswers.filter(
                                                      (i) => i !== index
                                                  );
                                            onUpdate({
                                                correctAnswers: newCorrect,
                                            });
                                        }}
                                        data-testid={`mcq-correct-${item.id}-${index}`}
                                    />
                                    <label>Correct</label>
                                    <button
                                        onClick={() => {
                                            if (item.choices.length > 2) {
                                                const newChoices = item.choices.filter(
                                                    (_, i) => i !== index
                                                );
                                                const newCorrect = item.correctAnswers
                                                    .filter((i) => i !== index)
                                                    .map((i) => (i > index ? i - 1 : i));
                                                const newFeedback = item.choiceFeedback
                                                    ? item.choiceFeedback.filter(
                                                          (_, i) => i !== index
                                                      )
                                                    : [];
                                                onUpdate({
                                                    choices: newChoices,
                                                    correctAnswers: newCorrect,
                                                    choiceFeedback: newFeedback,
                                                });
                                            }
                                        }}
                                        disabled={item.choices.length <= 2}
                                        className="remove-choice-button"
                                        data-testid={`mcq-remove-choice-${item.id}-${index}`}
                                        title="Remove choice"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={
                                        item.choiceFeedback
                                            ? item.choiceFeedback[index] || ""
                                            : ""
                                    }
                                    onChange={(e) => {
                                        const newFeedback = item.choiceFeedback
                                            ? [...item.choiceFeedback]
                                            : Array(item.choices.length).fill("");
                                        newFeedback[index] = e.target.value;
                                        onUpdate({ choiceFeedback: newFeedback });
                                    }}
                                    placeholder="Optional feedback for this choice..."
                                    className="choice-feedback"
                                    data-testid={`mcq-feedback-${item.id}-${index}`}
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            const newChoices = [...item.choices, ""];
                            const newFeedback = item.choiceFeedback
                                ? [...item.choiceFeedback, ""]
                                : Array(newChoices.length).fill("");
                            onUpdate({
                                choices: newChoices,
                                choiceFeedback: newFeedback,
                            });
                        }}
                        className="add-choice-button"
                        data-testid={`mcq-add-choice-${item.id}`}
                    >
                        + Add Choice
                    </button>
                    <GradingConfigEditor
                        itemType={item.type}
                        config={item.gradingConfig}
                        onChange={(config) => onUpdate({ gradingConfig: config })}
                    />
                </div>
            );
        case "fill-in-blank":
            return (
                <div className="fill-blank-item-editor">
                    <label>
                        <strong>Fill-in-the-Blank:</strong>
                    </label>
                    <input
                        type="text"
                        value={item.question}
                        onChange={(e) =>
                            onUpdate({ question: e.target.value })
                        }
                        placeholder="Enter question..."
                        data-testid={`fill-blank-question-${item.id}`}
                    />
                    <div className="fill-blank-options">
                        <label>
                            <strong>Accepted Answers:</strong>
                        </label>
                        {item.acceptedAnswers.map((answer, index) => (
                            <div
                                key={index}
                                className="fill-blank-answer-row"
                            >
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(e) => {
                                        const newAnswers = [
                                            ...item.acceptedAnswers,
                                        ];
                                        newAnswers[index] = e.target.value;
                                        onUpdate({ acceptedAnswers: newAnswers });
                                    }}
                                    placeholder={`Accepted answer ${index + 1}...`}
                                    data-testid={`fill-blank-answer-${item.id}-${index}`}
                                />
                                <button
                                    onClick={() => {
                                        if (item.acceptedAnswers.length > 1) {
                                            const newAnswers =
                                                item.acceptedAnswers.filter(
                                                    (_, i) => i !== index
                                                );
                                            onUpdate({
                                                acceptedAnswers: newAnswers,
                                            });
                                        }
                                    }}
                                    disabled={item.acceptedAnswers.length <= 1}
                                    className="remove-answer-button"
                                    data-testid={`fill-blank-remove-answer-${item.id}-${index}`}
                                    title="Remove answer"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                const newAnswers = [
                                    ...item.acceptedAnswers,
                                    "",
                                ];
                                onUpdate({ acceptedAnswers: newAnswers });
                            }}
                            className="add-answer-button"
                            data-testid={`fill-blank-add-answer-${item.id}`}
                        >
                            + Add Answer
                        </button>
                    </div>
                    <div className="fill-blank-regex">
                        <label>
                            <strong>Regex Pattern (optional):</strong>
                        </label>
                        <input
                            type="text"
                            value={item.regexPattern || ""}
                            onChange={(e) =>
                                onUpdate({ regexPattern: e.target.value })
                            }
                            placeholder="Enter regex pattern (e.g., ^\d{3}-\d{4}$)..."
                            data-testid={`fill-blank-regex-${item.id}`}
                        />
                    </div>
                    <div className="fill-blank-checkboxes">
                        <label>
                            <input
                                type="checkbox"
                                checked={item.caseSensitive || false}
                                onChange={(e) =>
                                    onUpdate({
                                        caseSensitive: e.target.checked,
                                    })
                                }
                                data-testid={`fill-blank-case-sensitive-${item.id}`}
                            />
                            Case-sensitive
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={
                                    item.trimWhitespace !== undefined
                                        ? item.trimWhitespace
                                        : true
                                }
                                onChange={(e) =>
                                    onUpdate({
                                        trimWhitespace: e.target.checked,
                                    })
                                }
                                data-testid={`fill-blank-trim-${item.id}`}
                            />
                            Trim whitespace
                        </label>
                    </div>
                    <GradingConfigEditor
                        itemType={item.type}
                        config={item.gradingConfig}
                        onChange={(config) => onUpdate({ gradingConfig: config })}
                    />
                </div>
            );
        case "essay": {
            const trimmed = essayPreviewResponse.trim();
            const wordCount = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
            const charCount = essayPreviewResponse.length;

            return (
                <div className="essay-item-editor">
                    <label>
                        <strong>Essay Question:</strong>
                    </label>
                    <textarea
                        value={item.prompt}
                        onChange={(e) =>
                            onUpdate({ prompt: e.target.value })
                        }
                        placeholder="Enter essay prompt..."
                        data-testid={`essay-prompt-${item.id}`}
                    />
                    <div className="essay-preview-section">
                        <label>
                            <strong>Sample Student Response (Preview):</strong>
                        </label>
                        <textarea
                            value={essayPreviewResponse}
                            onChange={(e) => onEssayPreviewChange?.(e.target.value)}
                            placeholder="Type here to preview the student response area with word/character counter..."
                            data-testid={`essay-response-preview-${item.id}`}
                            className="essay-response-area"
                        />
                        <div className="essay-counter" data-testid={`essay-counter-${item.id}`}>
                            <span data-testid={`essay-word-count-${item.id}`}>
                                Words: {wordCount}
                            </span>
                            {" | "}
                            <span data-testid={`essay-char-count-${item.id}`}>
                                Characters: {charCount}
                            </span>
                        </div>
                    </div>
                    <GradingConfigEditor
                        itemType={item.type}
                        config={item.gradingConfig}
                        onChange={(config) => onUpdate({ gradingConfig: config })}
                    />
                </div>
            );
        }
        case "code-cell":
            return <CodeCellEditor item={item} onUpdate={onUpdate} />;
        default:
            return null;
    }
}

export function AssignmentEditor({
    assignment,
    onSave,
    onBack,
}: AssignmentEditorProps) {
    const [items, setItems] = useState<AssignmentItem[]>(assignment.items);
    const [nextItemId, setNextItemId] = useState<number>(
        items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1
    );
    const [metadata, setMetadata] = useState({
        title: assignment.title,
        description: assignment.description || "",
        estimatedTime: assignment.estimatedTime || 0,
        notes: assignment.notes || "",
    });
    const [essayPreviewResponses, setEssayPreviewResponses] = useState<Map<number, string>>(new Map());

    const addItem = (type: ItemType) => {
        const newItem: AssignmentItem = createDefaultItem(type, nextItemId);
        setItems([...items, newItem]);
        setNextItemId(nextItemId + 1);
    };

    const deleteItem = (itemId: number) => {
        setItems(items.filter((item) => item.id !== itemId));
        // Clean up essay preview response for deleted item
        setEssayPreviewResponses((prev) => {
            const next = new Map(prev);
            next.delete(itemId);
            return next;
        });
    };

    const moveItemUp = (index: number) => {
        if (index === 0) return;
        const newItems = [...items];
        [newItems[index - 1], newItems[index]] = [
            newItems[index],
            newItems[index - 1],
        ];
        setItems(newItems);
    };

    const moveItemDown = (index: number) => {
        if (index === items.length - 1) return;
        const newItems = [...items];
        [newItems[index], newItems[index + 1]] = [
            newItems[index + 1],
            newItems[index],
        ];
        setItems(newItems);
    };

    const updateItem = (itemId: number, updates: Partial<AssignmentItem>) => {
        setItems((prevItems) =>
            prevItems.map((item) => {
                if (item.id !== itemId) {
                    return item;
                }
                // Merge updates while ensuring id and type remain immutable
                // We use 'as AssignmentItem' because TypeScript cannot infer that
                // preserving the type discriminator maintains the union type correctly
                return {
                    ...item,
                    ...updates,
                    id: item.id,
                    type: item.type,
                } as AssignmentItem;
            })
        );
    };

    const handleSave = () => {
        onSave({
            ...assignment,
            title: metadata.title,
            description: metadata.description || undefined,
            estimatedTime: metadata.estimatedTime || undefined,
            notes: metadata.notes || undefined,
            items,
        });
    };

    const handleEssayPreviewChange = (itemId: number, value: string) => {
        setEssayPreviewResponses((prev) => {
            const next = new Map(prev);
            next.set(itemId, value);
            return next;
        });
    };

    const getPages = (): AssignmentItem[][] => {
        const pages: AssignmentItem[][] = [];
        let currentPage: AssignmentItem[] = [];

        items.forEach((item) => {
            if (item.type === "page-break") {
                if (currentPage.length > 0 || pages.length === 0) {
                    pages.push(currentPage);
                    currentPage = [];
                }
                pages.push([item]);
            } else {
                currentPage.push(item);
            }
        });

        if (currentPage.length > 0) {
            pages.push(currentPage);
        }

        return pages.length > 0 ? pages : [[]];
    };

    const pages = getPages();

    return (
        <div className="assignment-editor">
            <div className="editor-header">
                <button
                    onClick={onBack}
                    className="back-button"
                    data-testid="back-button"
                >
                    ← Back to Dashboard
                </button>
                <h1>Edit Assignment: {metadata.title}</h1>
                <button
                    onClick={handleSave}
                    className="save-button"
                    data-testid="save-button"
                >
                    Save
                </button>
            </div>

            <div className="metadata-panel" data-testid="metadata-panel">
                <h2>Assignment Metadata</h2>
                <div className="metadata-fields">
                    <div className="metadata-field">
                        <label htmlFor="metadata-title">
                            <strong>Title:</strong>
                        </label>
                        <input
                            id="metadata-title"
                            type="text"
                            value={metadata.title}
                            onChange={(e) =>
                                setMetadata({
                                    ...metadata,
                                    title: e.target.value,
                                })
                            }
                            placeholder="Assignment title"
                            data-testid="metadata-title"
                        />
                    </div>
                    <div className="metadata-field">
                        <label htmlFor="metadata-description">
                            <strong>Description:</strong>
                        </label>
                        <textarea
                            id="metadata-description"
                            value={metadata.description}
                            onChange={(e) =>
                                setMetadata({
                                    ...metadata,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Assignment description"
                            data-testid="metadata-description"
                        />
                    </div>
                    <div className="metadata-field">
                        <label htmlFor="metadata-estimated-time">
                            <strong>Estimated Time (minutes):</strong>
                        </label>
                        <input
                            id="metadata-estimated-time"
                            type="number"
                            min="0"
                            value={metadata.estimatedTime}
                            onChange={(e) =>
                                setMetadata({
                                    ...metadata,
                                    estimatedTime: parseInt(e.target.value, 10) || 0,
                                })
                            }
                            placeholder="Estimated time in minutes"
                            data-testid="metadata-estimated-time"
                        />
                    </div>
                    <div className="metadata-field">
                        <label htmlFor="metadata-notes">
                            <strong>Notes (private):</strong>
                        </label>
                        <textarea
                            id="metadata-notes"
                            value={metadata.notes}
                            onChange={(e) =>
                                setMetadata({
                                    ...metadata,
                                    notes: e.target.value,
                                })
                            }
                            placeholder="Private notes for instructor"
                            data-testid="metadata-notes"
                        />
                    </div>
                </div>
            </div>

            <div className="add-item-controls" data-testid="add-item-controls">
                <h3>Add Item:</h3>
                <div className="add-item-buttons">
                    <button
                        onClick={() => addItem("text")}
                        data-testid="add-text"
                    >
                        Text Block
                    </button>
                    <button
                        onClick={() => addItem("multiple-choice")}
                        data-testid="add-multiple-choice"
                    >
                        Multiple Choice
                    </button>
                    <button
                        onClick={() => addItem("fill-in-blank")}
                        data-testid="add-fill-in-blank"
                    >
                        Fill-in-the-Blank
                    </button>
                    <button
                        onClick={() => addItem("essay")}
                        data-testid="add-essay"
                    >
                        Essay
                    </button>
                    <button
                        onClick={() => addItem("code-cell")}
                        data-testid="add-code-cell"
                    >
                        Code Cell
                    </button>
                    <button
                        onClick={() => addItem("page-break")}
                        data-testid="add-page-break"
                    >
                        Page Break
                    </button>
                </div>
            </div>

            <div className="editor-content">
                {pages.map((page, pageIndex) => (
                    <div
                        key={pageIndex}
                        className="page-container"
                        data-testid={`page-${pageIndex}`}
                    >
                        {page.map((item) => {
                            const globalIndex = items.indexOf(item);
                            return (
                                <div
                                    key={item.id}
                                    className={`item-container ${item.type === "page-break" ? "page-break-item" : ""}`}
                                    data-testid={`item-${item.id}`}
                                >
                                    {item.type === "page-break" ? (
                                        <div className="page-break">
                                            <div className="page-break-line"></div>
                                            <span className="page-break-label">
                                                Page Break
                                            </span>
                                            <div className="page-break-line"></div>
                                            <div className="page-break-options">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={item.requireAllCorrect || false}
                                                        onChange={(e) =>
                                                            updateItem(item.id, {
                                                                requireAllCorrect: e.target.checked,
                                                            })
                                                        }
                                                        data-testid={`page-break-require-all-correct-${item.id}`}
                                                    />
                                                    <span>Require all correct before next page</span>
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="item-content">
                                            <ItemEditor
                                                item={item}
                                                onUpdate={(updates) =>
                                                    updateItem(item.id, updates)
                                                }
                                                essayPreviewResponse={essayPreviewResponses.get(item.id) || ""}
                                                onEssayPreviewChange={(value) =>
                                                    handleEssayPreviewChange(item.id, value)
                                                }
                                            />
                                        </div>
                                    )}
                                    <div className="item-controls">
                                        <button
                                            onClick={() => moveItemUp(globalIndex)}
                                            disabled={globalIndex === 0}
                                            data-testid={`move-up-${item.id}`}
                                            title="Move up"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() =>
                                                moveItemDown(globalIndex)
                                            }
                                            disabled={
                                                globalIndex === items.length - 1
                                            }
                                            data-testid={`move-down-${item.id}`}
                                            title="Move down"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            onClick={() => deleteItem(item.id)}
                                            data-testid={`delete-${item.id}`}
                                            className="delete-button"
                                            title="Delete"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="empty-editor">
                        <p>No items yet. Add items using the controls above.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
