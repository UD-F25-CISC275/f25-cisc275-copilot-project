import { useState } from "react";
import "./App.css";
import { Dashboard } from "./components/Dashboard";
import { AssignmentEditor } from "./components/AssignmentEditor";
import { AssignmentTaker } from "./components/AssignmentTaker";
import type { Assignment } from "./types/Assignment";
import { importAssignmentFromFile } from "./utils/importAssignment";

const sampleAssignments: Assignment[] = [
    {
        id: 1,
        title: "Introduction to TypeScript",
        description: "Learn the basics of TypeScript and type annotations",
        items: [],
    },
    {
        id: 2,
        title: "React Hooks",
        description: "Master useState, useEffect, and custom hooks",
        items: [],
    },
    {
        id: 3,
        title: "Advanced React Patterns",
        items: [],
    },
];

export function App() {
    const [assignments, setAssignments] =
        useState<Assignment[]>(sampleAssignments);
    const [nextId, setNextId] = useState<number>(
        Math.max(...sampleAssignments.map((a) => a.id)) + 1
    );
    const [currentView, setCurrentView] = useState<"dashboard" | "editor" | "taker">(
        "dashboard"
    );
    const [editingAssignmentId, setEditingAssignmentId] = useState<
        number | null
    >(null);
    const [takingAssignmentId, setTakingAssignmentId] = useState<
        number | null
    >(null);

    const handleEdit = (assignmentId: number) => {
        setEditingAssignmentId(assignmentId);
        setCurrentView("editor");
    };

    const handleTake = (assignmentId: number) => {
        setTakingAssignmentId(assignmentId);
        setCurrentView("taker");
    };

    const handleCreateAssignment = () => {
        const newAssignment: Assignment = {
            id: nextId,
            title: "New Assignment",
            items: [],
        };
        setAssignments([...assignments, newAssignment]);
        setNextId(nextId + 1);
    };

    const handleSaveAssignment = (updatedAssignment: Assignment) => {
        setAssignments(
            assignments.map((a) =>
                a.id === updatedAssignment.id ? updatedAssignment : a
            )
        );
        setCurrentView("dashboard");
        setEditingAssignmentId(null);
    };

    const handleBackToDashboard = () => {
        setCurrentView("dashboard");
        setEditingAssignmentId(null);
        setTakingAssignmentId(null);
    };

    const handleImportAssignment = (file: File) => {
        void (async () => {
            try {
                const importedAssignment =
                    await importAssignmentFromFile(file);

                // Assign a new unique ID to avoid conflicts
                const newAssignment: Assignment = {
                    ...importedAssignment,
                    id: nextId,
                };

                // Add to assignments list
                setAssignments([...assignments, newAssignment]);
                setNextId(nextId + 1);

                // Navigate to editor to edit the imported assignment
                setEditingAssignmentId(newAssignment.id);
                setCurrentView("editor");
            } catch (error) {
                // Show error message to user
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred";
                alert(`Failed to import assignment: ${errorMessage}`);
            }
        })();
    };

    const editingAssignment = assignments.find(
        (a) => a.id === editingAssignmentId
    );

    const takingAssignment = assignments.find(
        (a) => a.id === takingAssignmentId
    );

    return (
        <>
            {currentView === "dashboard" && (
                <Dashboard
                    assignments={assignments}
                    onEdit={handleEdit}
                    onTake={handleTake}
                    onCreateAssignment={handleCreateAssignment}
                    onImportAssignment={handleImportAssignment}
                />
            )}
            {currentView === "editor" && editingAssignment && (
                <AssignmentEditor
                    assignment={editingAssignment}
                    onSave={handleSaveAssignment}
                    onBack={handleBackToDashboard}
                />
            )}
            {currentView === "taker" && takingAssignment && (
                <AssignmentTaker
                    assignment={takingAssignment}
                    onBack={handleBackToDashboard}
                />
            )}
        </>
    );
}

export default App;
