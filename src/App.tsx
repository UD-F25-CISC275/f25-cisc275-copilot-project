import { useState, useEffect } from "react";
import "./App.css";
import { Dashboard } from "./components/Dashboard";
import { AssignmentEditor } from "./components/AssignmentEditor";
import { AssignmentTaker } from "./components/AssignmentTaker";
import type { Assignment } from "./types/Assignment";
import { importAssignmentFromFile } from "./utils/importAssignment";
import {
    loadAssignments,
    saveAssignments,
    getSampleAssignments,
} from "./utils/assignmentStorage";

export function App() {
    const [assignments, setAssignments] = useState<Assignment[]>(() =>
        loadAssignments()
    );
    const [nextId, setNextId] = useState<number>(() =>
        Math.max(...loadAssignments().map((a) => a.id)) + 1
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

    // Save assignments to localStorage whenever they change
    useEffect(() => {
        saveAssignments(assignments);
    }, [assignments]);

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

                // Use functional updates to get the latest state values
                setNextId((prevNextId) => {
                    // Create new assignment with unique ID
                    const newAssignment: Assignment = {
                        ...importedAssignment,
                        id: prevNextId,
                    };

                    // Add to assignments list using the captured newAssignment
                    setAssignments((prevAssignments) => [
                        ...prevAssignments,
                        newAssignment,
                    ]);

                    // Navigate to editor with the new assignment
                    setEditingAssignmentId(prevNextId);
                    setCurrentView("editor");

                    return prevNextId + 1;
                });
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

    const handleResetToExamples = () => {
        const examples = getSampleAssignments();
        setAssignments(examples);
        setNextId(Math.max(...examples.map((a) => a.id)) + 1);
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
                    onResetToExamples={handleResetToExamples}
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
