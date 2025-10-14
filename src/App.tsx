import { useState } from "react";
import "./App.css";
import { Dashboard } from "./components/Dashboard";
import type { Assignment } from "./types/Assignment";

const sampleAssignments: Assignment[] = [
    {
        id: 1,
        title: "Introduction to TypeScript",
        description: "Learn the basics of TypeScript and type annotations",
    },
    {
        id: 2,
        title: "React Hooks",
        description: "Master useState, useEffect, and custom hooks",
    },
    {
        id: 3,
        title: "Advanced React Patterns",
    },
];

export function App() {
    const [assignments] = useState<Assignment[]>(sampleAssignments);

    const handleEdit = (assignmentId: number) => {
        console.log(`Edit assignment ${assignmentId}`);
        // TODO: Navigate to editor view
    };

    const handleTake = (assignmentId: number) => {
        console.log(`Take assignment ${assignmentId}`);
        // TODO: Navigate to taker view
    };

    return (
        <Dashboard
            assignments={assignments}
            onEdit={handleEdit}
            onTake={handleTake}
        />
    );
}

export default App;
