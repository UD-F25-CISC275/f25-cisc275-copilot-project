import { render, screen, fireEvent } from "@testing-library/react";
import { AssignmentEditor } from "../src/components/AssignmentEditor";
import type { Assignment } from "../src/types/Assignment";

const mockAssignment: Assignment = {
    id: 1,
    title: "Test Assignment",
    description: "Test Description",
    items: [],
};

describe("AssignmentEditor", () => {
    test("renders editor with assignment title", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        expect(
            screen.getByText(/Edit Assignment: Test Assignment/i)
        ).toBeInTheDocument();
    });

    test("displays all add item buttons", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        expect(screen.getByTestId("add-text")).toBeInTheDocument();
        expect(screen.getByTestId("add-multiple-choice")).toBeInTheDocument();
        expect(screen.getByTestId("add-fill-in-blank")).toBeInTheDocument();
        expect(screen.getByTestId("add-essay")).toBeInTheDocument();
        expect(screen.getByTestId("add-code-cell")).toBeInTheDocument();
        expect(screen.getByTestId("add-page-break")).toBeInTheDocument();
    });

    test("adds a text item when text button is clicked", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        const addTextButton = screen.getByTestId("add-text");
        fireEvent.click(addTextButton);

        expect(screen.getByTestId("item-1")).toBeInTheDocument();
        expect(screen.getByTestId("text-content-1")).toBeInTheDocument();
    });

    test("adds a multiple choice item when MCQ button is clicked", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        const addMCQButton = screen.getByTestId("add-multiple-choice");
        fireEvent.click(addMCQButton);

        expect(screen.getByTestId("item-1")).toBeInTheDocument();
        expect(screen.getByTestId("mcq-question-1")).toBeInTheDocument();
    });

    test("adds a page break when page break button is clicked", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        const addPageBreakButton = screen.getByTestId("add-page-break");
        fireEvent.click(addPageBreakButton);

        expect(screen.getByTestId("item-1")).toBeInTheDocument();
        const pageBreakLabels = screen.getAllByText("Page Break");
        expect(pageBreakLabels.length).toBeGreaterThan(1); // Button + actual page break
    });

    test("deletes an item when delete button is clicked", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        // Add a text item
        const addTextButton = screen.getByTestId("add-text");
        fireEvent.click(addTextButton);

        expect(screen.getByTestId("item-1")).toBeInTheDocument();

        // Delete the item
        const deleteButton = screen.getByTestId("delete-1");
        fireEvent.click(deleteButton);

        expect(screen.queryByTestId("item-1")).not.toBeInTheDocument();
    });

    test("moves item up when up button is clicked", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        // Add two text items
        const addTextButton = screen.getByTestId("add-text");
        fireEvent.click(addTextButton);
        fireEvent.click(addTextButton);

        // Get the items
        const items = screen.getAllByTestId(/^item-/);
        expect(items).toHaveLength(2);

        // Move the second item up
        const moveUpButton = screen.getByTestId("move-up-2");
        fireEvent.click(moveUpButton);

        // After moving up, item-2 should now be first
        const itemsAfter = screen.getAllByTestId(/^item-/);
        expect(itemsAfter[0]).toHaveAttribute("data-testid", "item-2");
        expect(itemsAfter[1]).toHaveAttribute("data-testid", "item-1");
    });

    test("moves item down when down button is clicked", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        // Add two text items
        const addTextButton = screen.getByTestId("add-text");
        fireEvent.click(addTextButton);
        fireEvent.click(addTextButton);

        // Move the first item down
        const moveDownButton = screen.getByTestId("move-down-1");
        fireEvent.click(moveDownButton);

        // After moving down, item-1 should now be second
        const itemsAfter = screen.getAllByTestId(/^item-/);
        expect(itemsAfter[0]).toHaveAttribute("data-testid", "item-2");
        expect(itemsAfter[1]).toHaveAttribute("data-testid", "item-1");
    });

    test("disables up button for first item", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        // Add a text item
        const addTextButton = screen.getByTestId("add-text");
        fireEvent.click(addTextButton);

        const moveUpButton = screen.getByTestId("move-up-1");
        expect(moveUpButton).toBeDisabled();
    });

    test("disables down button for last item", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        // Add a text item
        const addTextButton = screen.getByTestId("add-text");
        fireEvent.click(addTextButton);

        const moveDownButton = screen.getByTestId("move-down-1");
        expect(moveDownButton).toBeDisabled();
    });

    test("calls onSave when save button is clicked", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        const saveButton = screen.getByTestId("save-button");
        fireEvent.click(saveButton);

        expect(mockSave).toHaveBeenCalledTimes(1);
        expect(mockSave).toHaveBeenCalledWith({
            ...mockAssignment,
            items: [],
        });
    });

    test("calls onBack when back button is clicked", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        const backButton = screen.getByTestId("back-button");
        fireEvent.click(backButton);

        expect(mockBack).toHaveBeenCalledTimes(1);
    });

    test("updates text content when typing in text item", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        // Add a text item
        const addTextButton = screen.getByTestId("add-text");
        fireEvent.click(addTextButton);

        const textArea = screen.getByTestId(
            "text-content-1"
        ) as HTMLTextAreaElement;
        fireEvent.change(textArea, { target: { value: "Hello World" } });

        expect(textArea.value).toBe("Hello World");
    });

    test("displays empty editor message when no items", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        expect(
            screen.getByText(/No items yet. Add items using the controls above./i)
        ).toBeInTheDocument();
    });

    test("page break visibly separates content", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        // Add text, page break, text
        fireEvent.click(screen.getByTestId("add-text"));
        fireEvent.click(screen.getByTestId("add-page-break"));
        fireEvent.click(screen.getByTestId("add-text"));

        // Should have page break element with label (multiple "Page Break" text: button + actual break)
        const pageBreakLabels = screen.getAllByText("Page Break");
        expect(pageBreakLabels.length).toBeGreaterThan(1);

        // Should have multiple pages
        const pages = screen.getAllByTestId(/^page-/);
        expect(pages.length).toBeGreaterThan(1);
    });

    test("adds multiple different item types", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        // Add different types
        fireEvent.click(screen.getByTestId("add-text"));
        fireEvent.click(screen.getByTestId("add-multiple-choice"));
        fireEvent.click(screen.getByTestId("add-fill-in-blank"));
        fireEvent.click(screen.getByTestId("add-essay"));
        fireEvent.click(screen.getByTestId("add-code-cell"));

        // Verify all items are present
        expect(screen.getByTestId("text-content-1")).toBeInTheDocument();
        expect(screen.getByTestId("mcq-question-2")).toBeInTheDocument();
        expect(screen.getByTestId("fill-blank-question-3")).toBeInTheDocument();
        expect(screen.getByTestId("essay-prompt-4")).toBeInTheDocument();
        expect(screen.getByTestId("code-prompt-5")).toBeInTheDocument();
    });

    test("displays metadata panel with all fields", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        expect(screen.getByTestId("metadata-panel")).toBeInTheDocument();
        expect(screen.getByTestId("metadata-title")).toBeInTheDocument();
        expect(screen.getByTestId("metadata-description")).toBeInTheDocument();
        expect(screen.getByTestId("metadata-estimated-time")).toBeInTheDocument();
        expect(screen.getByTestId("metadata-notes")).toBeInTheDocument();
    });

    test("updates metadata title when typing", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        const titleInput = screen.getByTestId("metadata-title") as HTMLInputElement;
        fireEvent.change(titleInput, { target: { value: "New Title" } });

        expect(titleInput.value).toBe("New Title");
    });

    test("updates metadata description when typing", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        const descriptionTextarea = screen.getByTestId("metadata-description") as HTMLTextAreaElement;
        fireEvent.change(descriptionTextarea, { target: { value: "New Description" } });

        expect(descriptionTextarea.value).toBe("New Description");
    });

    test("updates estimated time when typing", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        const estimatedTimeInput = screen.getByTestId("metadata-estimated-time") as HTMLInputElement;
        fireEvent.change(estimatedTimeInput, { target: { value: "45" } });

        expect(estimatedTimeInput.value).toBe("45");
    });

    test("updates notes when typing", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        const notesTextarea = screen.getByTestId("metadata-notes") as HTMLTextAreaElement;
        fireEvent.change(notesTextarea, { target: { value: "Private instructor notes" } });

        expect(notesTextarea.value).toBe("Private instructor notes");
    });

    test("saves assignment with updated metadata", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        // Update metadata
        const titleInput = screen.getByTestId("metadata-title") as HTMLInputElement;
        fireEvent.change(titleInput, { target: { value: "Updated Title" } });

        const descriptionTextarea = screen.getByTestId("metadata-description") as HTMLTextAreaElement;
        fireEvent.change(descriptionTextarea, { target: { value: "Updated Description" } });

        const estimatedTimeInput = screen.getByTestId("metadata-estimated-time") as HTMLInputElement;
        fireEvent.change(estimatedTimeInput, { target: { value: "60" } });

        const notesTextarea = screen.getByTestId("metadata-notes") as HTMLTextAreaElement;
        fireEvent.change(notesTextarea, { target: { value: "Updated Notes" } });

        // Save
        const saveButton = screen.getByTestId("save-button");
        fireEvent.click(saveButton);

        expect(mockSave).toHaveBeenCalledWith({
            ...mockAssignment,
            title: "Updated Title",
            description: "Updated Description",
            estimatedTime: 60,
            notes: "Updated Notes",
            items: [],
        });
    });

    test("loads existing metadata values into fields", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();
        const assignmentWithMetadata: Assignment = {
            id: 1,
            title: "Existing Title",
            description: "Existing Description",
            estimatedTime: 30,
            notes: "Existing Notes",
            items: [],
        };

        render(
            <AssignmentEditor
                assignment={assignmentWithMetadata}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        expect((screen.getByTestId("metadata-title") as HTMLInputElement).value).toBe("Existing Title");
        expect((screen.getByTestId("metadata-description") as HTMLTextAreaElement).value).toBe("Existing Description");
        expect((screen.getByTestId("metadata-estimated-time") as HTMLInputElement).value).toBe("30");
        expect((screen.getByTestId("metadata-notes") as HTMLTextAreaElement).value).toBe("Existing Notes");
    });
});
