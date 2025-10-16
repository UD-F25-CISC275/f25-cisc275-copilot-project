import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { App } from "../src/App";

// Mock the importAssignmentFromFile function
jest.mock("../src/utils/importAssignment", () => ({
    importAssignmentFromFile: jest.fn(),
}));

import { importAssignmentFromFile } from "../src/utils/importAssignment";

const mockedImportAssignmentFromFile =
    importAssignmentFromFile as jest.MockedFunction<
        typeof importAssignmentFromFile
    >;

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

describe("App import functionality", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock window.alert
        jest.spyOn(window, "alert").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("imports assignment and navigates to editor", async () => {
        const mockImportedAssignment = {
            id: 999,
            title: "Imported Assignment",
            description: "This was imported",
            items: [
                {
                    id: 1,
                    type: "text" as const,
                    content: "Imported content",
                },
            ],
        };

        mockedImportAssignmentFromFile.mockResolvedValue(
            mockImportedAssignment
        );

        render(<App />);

        const fileInput = screen.getByTestId("file-input");
        const file = new File(
            [JSON.stringify(mockImportedAssignment)],
            "test.json",
            { type: "application/json" }
        );

        fireEvent.change(fileInput, { target: { files: [file] } });

        // Wait for the async import to complete and editor to appear
        await waitFor(() => {
            expect(screen.getByText(/Edit Assignment:/i)).toBeInTheDocument();
        });

        // Verify we're in the editor view
        expect(screen.getByTestId("back-button")).toBeInTheDocument();
        expect(screen.getByTestId("save-button")).toBeInTheDocument();
    });

    test("assigns unique ID to imported assignment", async () => {
        const mockImportedAssignment = {
            id: 1, // Original ID from the export
            title: "Imported Assignment",
            items: [],
        };

        mockedImportAssignmentFromFile.mockResolvedValue(
            mockImportedAssignment
        );

        render(<App />);

        const fileInput = screen.getByTestId("file-input");
        const file = new File(
            [JSON.stringify(mockImportedAssignment)],
            "test.json",
            { type: "application/json" }
        );

        fireEvent.change(fileInput, { target: { files: [file] } });

        // Wait for editor to appear
        await waitFor(() => {
            expect(screen.getByText(/Edit Assignment:/i)).toBeInTheDocument();
        });

        // Go back to dashboard
        const backButton = screen.getByTestId("back-button");
        fireEvent.click(backButton);

        // The imported assignment should have a new ID (4, since there are 3 initial assignments)
        await waitFor(() => {
            expect(screen.getByTestId("assignment-4")).toBeInTheDocument();
        });
    });

    test("shows alert when import fails", async () => {
        mockedImportAssignmentFromFile.mockRejectedValue(
            new Error("Invalid JSON")
        );

        render(<App />);

        const fileInput = screen.getByTestId("file-input");
        const file = new File(["invalid json"], "test.json", {
            type: "application/json",
        });

        fireEvent.change(fileInput, { target: { files: [file] } });

        // Wait for the error alert
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
                "Failed to import assignment: Invalid JSON"
            );
        });

        // Verify we're still on the dashboard
        expect(screen.getByText("Assignment Dashboard")).toBeInTheDocument();
    });

    test("can import assignment after going back to dashboard", async () => {
        const mockAssignment1 = {
            id: 100,
            title: "Import 1",
            items: [],
        };

        mockedImportAssignmentFromFile.mockResolvedValueOnce(
            mockAssignment1
        );

        render(<App />);

        const fileInput = screen.getByTestId("file-input");

        // Import assignment
        const file1 = new File([JSON.stringify(mockAssignment1)], "test1.json", {
            type: "application/json",
        });

        fireEvent.change(fileInput, { target: { files: [file1] } });

        // Wait for it to be imported and navigate to editor
        await waitFor(() => {
            expect(screen.getByText(/Edit Assignment:/i)).toBeInTheDocument();
        });

        // Go back to dashboard
        fireEvent.click(screen.getByTestId("back-button"));

        // Wait for dashboard to appear
        await waitFor(() => {
            expect(screen.getByText("Assignment Dashboard")).toBeInTheDocument();
        });

        // Verify imported assignment is in the list
        expect(screen.getByText("Import 1")).toBeInTheDocument();
    });
});
