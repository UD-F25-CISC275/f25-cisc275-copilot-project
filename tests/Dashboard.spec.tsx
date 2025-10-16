import { render, screen, fireEvent } from "@testing-library/react";
import { Dashboard } from "../src/components/Dashboard";
import type { Assignment } from "../src/types/Assignment";

const mockAssignments: Assignment[] = [
    {
        id: 1,
        title: "Test Assignment 1",
        description: "This is a test assignment",
        items: [],
    },
    {
        id: 2,
        title: "Test Assignment 2",
        items: [],
    },
];

describe("Dashboard", () => {
    test("displays all assignments", () => {
        const mockEdit = jest.fn();
        const mockTake = jest.fn();
        const mockCreateAssignment = jest.fn();
        const mockImportAssignment = jest.fn();

        render(
            <Dashboard
                assignments={mockAssignments}
                onEdit={mockEdit}
                onTake={mockTake}
                onCreateAssignment={mockCreateAssignment}
                onImportAssignment={mockImportAssignment}
            />
        );

        expect(screen.getByText("Assignment Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Test Assignment 1")).toBeInTheDocument();
        expect(screen.getByText("Test Assignment 2")).toBeInTheDocument();
        expect(
            screen.getByText("This is a test assignment")
        ).toBeInTheDocument();
    });

    test("displays message when no assignments available", () => {
        const mockEdit = jest.fn();
        const mockTake = jest.fn();
        const mockCreateAssignment = jest.fn();
        const mockImportAssignment = jest.fn();

        render(
            <Dashboard
                assignments={[]}
                onEdit={mockEdit}
                onTake={mockTake}
                onCreateAssignment={mockCreateAssignment}
                onImportAssignment={mockImportAssignment}
            />
        );

        expect(
            screen.getByText("No assignments available.")
        ).toBeInTheDocument();
    });

    test("calls onEdit when Edit button is clicked", () => {
        const mockEdit = jest.fn();
        const mockTake = jest.fn();
        const mockCreateAssignment = jest.fn();
        const mockImportAssignment = jest.fn();

        render(
            <Dashboard
                assignments={mockAssignments}
                onEdit={mockEdit}
                onTake={mockTake}
                onCreateAssignment={mockCreateAssignment}
                onImportAssignment={mockImportAssignment}
            />
        );

        const editButton = screen.getByTestId("edit-1");
        fireEvent.click(editButton);

        expect(mockEdit).toHaveBeenCalledWith(1);
    });

    test("calls onTake when Take button is clicked", () => {
        const mockEdit = jest.fn();
        const mockTake = jest.fn();
        const mockCreateAssignment = jest.fn();
        const mockImportAssignment = jest.fn();

        render(
            <Dashboard
                assignments={mockAssignments}
                onEdit={mockEdit}
                onTake={mockTake}
                onCreateAssignment={mockCreateAssignment}
                onImportAssignment={mockImportAssignment}
            />
        );

        const takeButton = screen.getByTestId("take-2");
        fireEvent.click(takeButton);

        expect(mockTake).toHaveBeenCalledWith(2);
    });

    test("displays Edit and Take buttons for each assignment", () => {
        const mockEdit = jest.fn();
        const mockTake = jest.fn();
        const mockCreateAssignment = jest.fn();
        const mockImportAssignment = jest.fn();

        render(
            <Dashboard
                assignments={mockAssignments}
                onEdit={mockEdit}
                onTake={mockTake}
                onCreateAssignment={mockCreateAssignment}
                onImportAssignment={mockImportAssignment}
            />
        );

        // Check that there are 2 Edit buttons and 2 Take buttons
        const editButtons = screen.getAllByText("Edit");
        const takeButtons = screen.getAllByText("Take");

        expect(editButtons).toHaveLength(2);
        expect(takeButtons).toHaveLength(2);
    });

    test("displays New Assignment button", () => {
        const mockEdit = jest.fn();
        const mockTake = jest.fn();
        const mockCreateAssignment = jest.fn();
        const mockImportAssignment = jest.fn();

        render(
            <Dashboard
                assignments={mockAssignments}
                onEdit={mockEdit}
                onTake={mockTake}
                onCreateAssignment={mockCreateAssignment}
                onImportAssignment={mockImportAssignment}
            />
        );

        const newButton = screen.getByTestId("new-assignment-button");
        expect(newButton).toBeInTheDocument();
        expect(newButton).toHaveTextContent("New Assignment");
    });

    test("calls onCreateAssignment when New Assignment button is clicked", () => {
        const mockEdit = jest.fn();
        const mockTake = jest.fn();
        const mockCreateAssignment = jest.fn();
        const mockImportAssignment = jest.fn();

        render(
            <Dashboard
                assignments={mockAssignments}
                onEdit={mockEdit}
                onTake={mockTake}
                onCreateAssignment={mockCreateAssignment}
                onImportAssignment={mockImportAssignment}
            />
        );

        const newButton = screen.getByTestId("new-assignment-button");
        fireEvent.click(newButton);

        expect(mockCreateAssignment).toHaveBeenCalledTimes(1);
    });

    test("displays Import Assignment button", () => {
        const mockEdit = jest.fn();
        const mockTake = jest.fn();
        const mockCreateAssignment = jest.fn();
        const mockImportAssignment = jest.fn();

        render(
            <Dashboard
                assignments={mockAssignments}
                onEdit={mockEdit}
                onTake={mockTake}
                onCreateAssignment={mockCreateAssignment}
                onImportAssignment={mockImportAssignment}
            />
        );

        const importButton = screen.getByTestId("import-assignment-button");
        expect(importButton).toBeInTheDocument();
        expect(importButton).toHaveTextContent("Import Assignment");
    });

    test("calls onImportAssignment when file is selected", () => {
        const mockEdit = jest.fn();
        const mockTake = jest.fn();
        const mockCreateAssignment = jest.fn();
        const mockImportAssignment = jest.fn();

        render(
            <Dashboard
                assignments={mockAssignments}
                onEdit={mockEdit}
                onTake={mockTake}
                onCreateAssignment={mockCreateAssignment}
                onImportAssignment={mockImportAssignment}
            />
        );

        const fileInput = screen.getByTestId("file-input");
        const file = new File(
            ['{"id": 1, "title": "Test", "items": []}'],
            "test.json",
            { type: "application/json" }
        );

        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(mockImportAssignment).toHaveBeenCalledWith(file);
    });

    test("file input accepts only JSON files", () => {
        const mockEdit = jest.fn();
        const mockTake = jest.fn();
        const mockCreateAssignment = jest.fn();
        const mockImportAssignment = jest.fn();

        render(
            <Dashboard
                assignments={mockAssignments}
                onEdit={mockEdit}
                onTake={mockTake}
                onCreateAssignment={mockCreateAssignment}
                onImportAssignment={mockImportAssignment}
            />
        );

        const fileInput = screen.getByTestId(
            "file-input"
        ) as HTMLInputElement;
        expect(fileInput.accept).toBe(".json,application/json");
    });
});
