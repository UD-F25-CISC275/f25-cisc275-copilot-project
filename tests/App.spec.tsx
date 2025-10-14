import { render, screen, fireEvent } from "@testing-library/react";

import { App } from "../src/App";

test("App component displays dashboard", () => {
    render(<App />);

    const heading = screen.getByText(/Assignment Dashboard/i);

    expect(heading).toBeInTheDocument();
});

test("App component displays sample assignments", () => {
    render(<App />);

    expect(screen.getByText("Introduction to TypeScript")).toBeInTheDocument();
    expect(screen.getByText("React Hooks")).toBeInTheDocument();
    expect(screen.getByText("Advanced React Patterns")).toBeInTheDocument();
});

test("App component creates new assignment when button is clicked", () => {
    render(<App />);

    // Initially there should be 3 assignments
    expect(screen.getByText("Introduction to TypeScript")).toBeInTheDocument();
    expect(screen.getByText("React Hooks")).toBeInTheDocument();
    expect(screen.getByText("Advanced React Patterns")).toBeInTheDocument();

    // Click the New Assignment button
    const newButton = screen.getByTestId("new-assignment-button");
    fireEvent.click(newButton);

    // Now there should be 4 assignments, including the new one
    expect(screen.getByTestId("assignment-4")).toBeInTheDocument();

    // Verify we have 4 assignment items (not counting the button)
    const assignmentItems = screen.getAllByRole("button", {
        name: /Edit|Take/i,
    });
    expect(assignmentItems).toHaveLength(8); // 4 assignments * 2 buttons each
});

test("App component creates multiple new assignments with unique IDs", () => {
    render(<App />);

    const newButton = screen.getByTestId("new-assignment-button");

    // Click twice to create two new assignments
    fireEvent.click(newButton);
    fireEvent.click(newButton);

    // Verify the new assignments have unique IDs
    expect(screen.getByTestId("assignment-4")).toBeInTheDocument();
    expect(screen.getByTestId("assignment-5")).toBeInTheDocument();

    // Should have 5 assignments total (3 original + 2 new)
    const assignmentItems = screen.getAllByRole("button", {
        name: /Edit|Take/i,
    });
    expect(assignmentItems).toHaveLength(10); // 5 assignments * 2 buttons each
});
