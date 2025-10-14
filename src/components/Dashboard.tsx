import type { Assignment } from "../types/Assignment";

interface DashboardProps {
    assignments: Assignment[];
    onEdit: (assignmentId: number) => void;
    onTake: (assignmentId: number) => void;
}

export function Dashboard({ assignments, onEdit, onTake }: DashboardProps) {
    return (
        <div className="dashboard">
            <h1>Assignment Dashboard</h1>
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
