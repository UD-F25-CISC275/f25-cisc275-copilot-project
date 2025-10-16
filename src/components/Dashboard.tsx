import { useRef } from "react";
import type { Assignment } from "../types/Assignment";

interface DashboardProps {
    assignments: Assignment[];
    onEdit: (assignmentId: number) => void;
    onTake: (assignmentId: number) => void;
    onCreateAssignment: () => void;
    onImportAssignment: (file: File) => void;
}

export function Dashboard({
    assignments,
    onEdit,
    onTake,
    onCreateAssignment,
    onImportAssignment,
}: DashboardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImportAssignment(file);
            // Reset the input so the same file can be selected again
            event.target.value = "";
        }
    };

    return (
        <div className="dashboard">
            <h1>Assignment Dashboard</h1>
            <div className="dashboard-actions">
                <button
                    onClick={onCreateAssignment}
                    className="new-assignment-button"
                    data-testid="new-assignment-button"
                >
                    New Assignment
                </button>
                <button
                    onClick={handleImportClick}
                    className="import-assignment-button"
                    data-testid="import-assignment-button"
                >
                    Import Assignment
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    data-testid="file-input"
                />
            </div>
            <div className="assignment-list">
                {assignments.length === 0 ? (
                    <p>No assignments available.</p>
                ) : (
                    assignments.map((assignment) => (
                        <div
                            key={assignment.id}
                            className="assignment-item"
                            data-testid={`assignment-${assignment.id}`}
                        >
                            <div className="assignment-info">
                                <h3>{assignment.title}</h3>
                                {assignment.description && (
                                    <p>{assignment.description}</p>
                                )}
                            </div>
                            <div className="assignment-actions">
                                <button
                                    onClick={() => onEdit(assignment.id)}
                                    data-testid={`edit-${assignment.id}`}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onTake(assignment.id)}
                                    data-testid={`take-${assignment.id}`}
                                >
                                    Take
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
