import { useState } from "react";
import type { Assignment } from "../types/Assignment";
import type { AssignmentItem, ItemType } from "../types/AssignmentItem";
import "../styles/AssignmentEditor.css";

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
                choices: ["", "", "", ""],
                correctAnswers: [],
            };
        case "fill-in-blank":
            return { id, type: "fill-in-blank", question: "", answer: "" };
        case "essay":
            return { id, type: "essay", prompt: "" };
        case "code-cell":
            return { id, type: "code-cell", prompt: "", starterCode: "" };
        case "page-break":
            return { id, type: "page-break" };
    }
}

interface ItemEditorProps {
    item: AssignmentItem;
    onUpdate: (updates: Partial<AssignmentItem>) => void;
}

function ItemEditor({ item, onUpdate }: ItemEditorProps) {
    switch (item.type) {
        case "text":
            return (
                <div className="text-item-editor">
                    <label>
                        <strong>Text Block:</strong>
                    </label>
                    <textarea
                        value={item.content}
                        onChange={(e) =>
                            onUpdate({ content: e.target.value })
                        }
                        placeholder="Enter text content..."
                        data-testid={`text-content-${item.id}`}
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
                    <div className="choices">
                        {item.choices.map((choice, index) => (
                            <div key={index} className="choice-item">
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
                            </div>
                        ))}
                    </div>
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
                    <input
                        type="text"
                        value={item.answer}
                        onChange={(e) =>
                            onUpdate({ answer: e.target.value })
                        }
                        placeholder="Expected answer..."
                        data-testid={`fill-blank-answer-${item.id}`}
                    />
                </div>
            );
        case "essay":
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
                </div>
            );
        case "code-cell":
            return (
                <div className="code-cell-item-editor">
                    <label>
                        <strong>Code Cell:</strong>
                    </label>
                    <textarea
                        value={item.prompt}
                        onChange={(e) =>
                            onUpdate({ prompt: e.target.value })
                        }
                        placeholder="Enter coding prompt..."
                        data-testid={`code-prompt-${item.id}`}
                    />
                    <textarea
                        value={item.starterCode}
                        onChange={(e) =>
                            onUpdate({ starterCode: e.target.value })
                        }
                        placeholder="Enter starter code..."
                        data-testid={`code-starter-${item.id}`}
                    />
                </div>
            );
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

    const addItem = (type: ItemType) => {
        const newItem: AssignmentItem = createDefaultItem(type, nextItemId);
        setItems([...items, newItem]);
        setNextItemId(nextItemId + 1);
    };

    const deleteItem = (itemId: number) => {
        setItems(items.filter((item) => item.id !== itemId));
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
                                    estimatedTime: parseInt(e.target.value) || 0,
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
                                        </div>
                                    ) : (
                                        <div className="item-content">
                                            <ItemEditor
                                                item={item}
                                                onUpdate={(updates) =>
                                                    updateItem(item.id, updates)
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
