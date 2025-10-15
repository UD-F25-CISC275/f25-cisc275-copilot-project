import { useState } from "react";
import type { GradingConfig, RubricCriteria } from "../types/GradingConfig";
import type { ItemType, CodeFile } from "../types/AssignmentItem";
import "../styles/GradingConfigEditor.css";

interface GradingConfigEditorProps {
    itemType: ItemType;
    config: GradingConfig | undefined;
    onChange: (config: GradingConfig | undefined) => void;
    // For code cells, provide available files
    files?: CodeFile[];
}

export function GradingConfigEditor({
    itemType,
    config,
    onChange,
    files,
}: GradingConfigEditorProps) {
    const [showConfig, setShowConfig] = useState(false);

    // Determine which grading modes are available for this item type
    const supportsAnswerCheck =
        itemType === "multiple-choice" || itemType === "fill-in-blank";
    const supportsUnitTests = itemType === "code-cell";
    const supportsRubric =
        itemType === "essay" || itemType === "code-cell" || itemType === "text";

    // Determine if item has auto-grading enabled
    const hasAutoGrading = () => {
        if (supportsAnswerCheck && config?.enableAnswerCheck !== false) {
            return true;
        }
        if (supportsUnitTests && config?.testFileName) {
            return true;
        }
        return false;
    };

    const hasManualGrading = () => {
        return !!config?.rubric || !!config?.aiPrompt;
    };

    const updateConfig = (updates: Partial<GradingConfig>) => {
        const newConfig = { ...config, ...updates };
        // If all fields are empty/undefined, set to undefined
        if (
            !newConfig.enableAnswerCheck &&
            !newConfig.testFileName &&
            !newConfig.rubric &&
            !newConfig.aiPrompt
        ) {
            onChange(undefined);
        } else {
            onChange(newConfig);
        }
    };

    const addCriteria = () => {
        const currentRubric = config?.rubric;
        const newCriteria: RubricCriteria = {
            level: (currentRubric?.criteria.length || 0) + 1,
            name: "",
            description: "",
            points: 0,
        };
        const newRubric = {
            title: currentRubric?.title || "",
            description: currentRubric?.description || "",
            criteria: [...(currentRubric?.criteria || []), newCriteria],
        };
        updateConfig({ rubric: newRubric });
    };

    const updateCriteria = (index: number, updates: Partial<RubricCriteria>) => {
        if (!config?.rubric) return;
        const newCriteria = [...config.rubric.criteria];
        newCriteria[index] = { ...newCriteria[index], ...updates };
        updateConfig({
            rubric: { ...config.rubric, criteria: newCriteria },
        });
    };

    const removeCriteria = (index: number) => {
        if (!config?.rubric) return;
        const newCriteria = config.rubric.criteria.filter(
            (_, i) => i !== index
        );
        if (newCriteria.length === 0 && !config.rubric.title && !config.rubric.description) {
            // Remove entire rubric if no criteria left and no title/description
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { rubric: _rubric, ...rest } = config;
            onChange(Object.keys(rest).length > 0 ? rest as GradingConfig : undefined);
        } else {
            updateConfig({
                rubric: { ...config.rubric, criteria: newCriteria },
            });
        }
    };

    const updateRubricMeta = (updates: { title?: string; description?: string }) => {
        const currentRubric = config?.rubric || { title: "", description: "", criteria: [] };
        updateConfig({
            rubric: { ...currentRubric, ...updates },
        });
    };

    if (!showConfig) {
        return (
            <div className="grading-config-collapsed">
                <button
                    type="button"
                    onClick={() => setShowConfig(true)}
                    className="toggle-grading-config"
                >
                    ⚙️ Configure Grading
                    {(hasAutoGrading() || hasManualGrading()) && (
                        <span className="grading-indicators">
                            {hasAutoGrading() && (
                                <span className="auto-grading-badge">Auto</span>
                            )}
                            {hasManualGrading() && (
                                <span className="manual-grading-badge">Manual</span>
                            )}
                        </span>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className="grading-config-editor">
            <div className="grading-config-header">
                <h4>Grading Configuration</h4>
                <button
                    type="button"
                    onClick={() => setShowConfig(false)}
                    className="collapse-grading-config"
                >
                    ▲ Hide
                </button>
            </div>

            {/* Answer checks for MCQ/Fill-blank */}
            {supportsAnswerCheck && (
                <div className="grading-option">
                    <label>
                        <input
                            type="checkbox"
                            checked={config?.enableAnswerCheck !== false}
                            onChange={(e) =>
                                updateConfig({
                                    enableAnswerCheck: e.target.checked,
                                })
                            }
                        />
                        <strong>Enable Answer Checking</strong>
                        <span className="auto-grading-badge">Auto</span>
                    </label>
                    <p className="grading-option-description">
                        Client-side evaluation of student answers
                    </p>
                </div>
            )}

            {/* Unit tests for code cells */}
            {supportsUnitTests && files && (
                <div className="grading-option">
                    <label>
                        <strong>Unit Test File</strong>
                        <span className="auto-grading-badge">Auto</span>
                    </label>
                    <p className="grading-option-description">
                        Select which file contains unit tests to run
                    </p>
                    <select
                        value={config?.testFileName || ""}
                        onChange={(e) =>
                            updateConfig({
                                testFileName: e.target.value || undefined,
                            })
                        }
                        className="test-file-selector"
                    >
                        <option value="">No unit tests</option>
                        {files
                            .filter((f) => f.isInstructorFile)
                            .map((file, index) => (
                                <option key={index} value={file.name}>
                                    {file.name}
                                </option>
                            ))}
                    </select>
                </div>
            )}

            {/* Rubric for Essay/Code/Text */}
            {supportsRubric && (
                <div className="grading-option rubric-section">
                    <div className="rubric-header">
                        <strong>Rubric</strong>
                        <span className="manual-grading-badge">Manual</span>
                    </div>
                    <p className="grading-option-description">
                        Point-based criteria for manual grading
                    </p>

                    <div className="rubric-meta">
                        <label>
                            Rubric Title:
                            <input
                                type="text"
                                value={config?.rubric?.title || ""}
                                onChange={(e) =>
                                    updateRubricMeta({ title: e.target.value })
                                }
                                placeholder="e.g., Code Quality"
                            />
                        </label>
                        <label>
                            Description:
                            <textarea
                                value={config?.rubric?.description || ""}
                                onChange={(e) =>
                                    updateRubricMeta({
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Overall rubric description..."
                                rows={2}
                            />
                        </label>
                    </div>

                    {config?.rubric?.criteria &&
                        config.rubric.criteria.length > 0 && (
                            <div className="rubric-criteria">
                                <h5>Criteria:</h5>
                                {config.rubric.criteria.map((criteria, index) => (
                                    <div key={index} className="criteria-item">
                                        <div className="criteria-header">
                                            <span className="criteria-level">
                                                Level {criteria.level}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeCriteria(index)
                                                }
                                                className="remove-criteria"
                                                title="Remove criteria"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div className="criteria-fields">
                                            <label>
                                                Name:
                                                <input
                                                    type="text"
                                                    value={criteria.name}
                                                    onChange={(e) =>
                                                        updateCriteria(index, {
                                                            name: e.target.value,
                                                        })
                                                    }
                                                    placeholder="e.g., Excellent"
                                                />
                                            </label>
                                            <label>
                                                Description:
                                                <textarea
                                                    value={criteria.description}
                                                    onChange={(e) =>
                                                        updateCriteria(index, {
                                                            description:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="Criteria description..."
                                                    rows={2}
                                                />
                                            </label>
                                            <label>
                                                Points:
                                                <input
                                                    type="number"
                                                    value={criteria.points}
                                                    onChange={(e) =>
                                                        updateCriteria(index, {
                                                            points: parseInt(
                                                                e.target.value
                                                            ) || 0,
                                                        })
                                                    }
                                                    min="0"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    <button
                        type="button"
                        onClick={addCriteria}
                        className="add-criteria-button"
                    >
                        + Add Criteria
                    </button>
                </div>
            )}

            {/* AI Prompt (available for all items) */}
            <div className="grading-option">
                <label>
                    <strong>AI Grading Prompt</strong>
                    <span className="manual-grading-badge">Manual</span>
                </label>
                <p className="grading-option-description">
                    Additional instructions for AI-assisted grading. Use
                    placeholders like {`{{studentAnswer}}`},{" "}
                    {`{{testResults}}`}
                </p>
                <textarea
                    value={config?.aiPrompt || ""}
                    onChange={(e) =>
                        updateConfig({ aiPrompt: e.target.value || undefined })
                    }
                    placeholder="Enter AI grading instructions..."
                    rows={4}
                    className="ai-prompt-textarea"
                />
            </div>
        </div>
    );
}
