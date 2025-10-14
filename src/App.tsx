import { useState } from "react";
import "./App.css";
import { Dashboard } from "./components/Dashboard";
import { AssignmentEditor } from "./components/AssignmentEditor";
import type { Assignment } from "./types/Assignment";

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
    const [currentView, setCurrentView] = useState<"dashboard" | "editor">(
        "dashboard"
    );
    const [editingAssignmentId, setEditingAssignmentId] = useState<
        number | null
    >(null);

    const handleEdit = (assignmentId: number) => {
        setEditingAssignmentId(assignmentId);
        setCurrentView("editor");
    };

    const handleTake = (assignmentId: number) => {
        console.log(`Take assignment ${assignmentId}`);
        // TODO: Navigate to taker view
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
    };

    const editingAssignment = assignments.find(
        (a) => a.id === editingAssignmentId
    );

    return (
        <>
            {currentView === "dashboard" && (
                <Dashboard
                    assignments={assignments}
                    onEdit={handleEdit}
                    onTake={handleTake}
                    onCreateAssignment={handleCreateAssignment}
                />
            )}
            {currentView === "editor" && editingAssignment && (
                <AssignmentEditor
                    assignment={editingAssignment}
                    onSave={handleSaveAssignment}
                    onBack={handleBackToDashboard}
                />
            )}
        </>
    );
}

export default App;
