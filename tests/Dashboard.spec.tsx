import { render, screen, fireEvent } from "@testing-library/react";
import { Dashboard } from "../src/components/Dashboard";
import type { Assignment } from "../src/types/Assignment";

const mockAssignments: Assignment[] = [
    {
        id: 1,
        title: "Test Assignment 1",
        description: "This is a test assignment",
    },
    {
        id: 2,
        title: "Test Assignment 2",
    },
];

describe("Dashboard", () => {
    test("displays all assignments", () => {
        const mockEdit = jest.fn();
        const mockTake = jest.fn();

        render(
            <Dashboard
                assignments={mockAssignments}
                onEdit={mockEdit}
                onTake={mockTake}
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

        render(
            <Dashboard assignments={[]} onEdit={mockEdit} onTake={mockTake} />
        );

        expect(
            screen.getByText("No assignments available.")
        ).toBeInTheDocument();
    });

    test("calls onEdit when Edit button is clicked", () => {
        const mockEdit = jest.fn();
        const mockTake = jest.fn();

        render(
            <Dashboard
                assignments={mockAssignments}
                onEdit={mockEdit}
                onTake={mockTake}
            />
        );

        const editButton = screen.getByTestId("edit-1");
        fireEvent.click(editButton);

        expect(mockEdit).toHaveBeenCalledWith(1);
    });

    test("calls onTake when Take button is clicked", () => {
        const mockEdit = jest.fn();
        const mockTake = jest.fn();

        render(
            <Dashboard
                assignments={mockAssignments}
                onEdit={mockEdit}
                onTake={mockTake}
            />
        );

        const takeButton = screen.getByTestId("take-2");
        fireEvent.click(takeButton);

        expect(mockTake).toHaveBeenCalledWith(2);
    });

    test("displays Edit and Take buttons for each assignment", () => {
        const mockEdit = jest.fn();
        const mockTake = jest.fn();

        render(
            <Dashboard
                assignments={mockAssignments}
                onEdit={mockEdit}
                onTake={mockTake}
            />
        );

        // Check that there are 2 Edit buttons and 2 Take buttons
        const editButtons = screen.getAllByText("Edit");
        const takeButtons = screen.getAllByText("Take");

        expect(editButtons).toHaveLength(2);
        expect(takeButtons).toHaveLength(2);
    });
});
