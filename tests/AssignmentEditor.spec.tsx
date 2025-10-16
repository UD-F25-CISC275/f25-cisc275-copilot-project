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

    describe("Multiple Choice Question Features", () => {
        test("adds a multiple choice item with default 2 choices", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-multiple-choice"));

            // Should have 2 default choices
            expect(screen.getByTestId("mcq-choice-1-0")).toBeInTheDocument();
            expect(screen.getByTestId("mcq-choice-1-1")).toBeInTheDocument();
        });

        test("adds a new choice when add choice button is clicked", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-multiple-choice"));

            // Initially 2 choices
            expect(screen.getByTestId("mcq-choice-1-0")).toBeInTheDocument();
            expect(screen.getByTestId("mcq-choice-1-1")).toBeInTheDocument();

            // Add a third choice
            const addChoiceButton = screen.getByTestId("mcq-add-choice-1");
            fireEvent.click(addChoiceButton);

            // Should now have 3 choices
            expect(screen.getByTestId("mcq-choice-1-2")).toBeInTheDocument();
        });

        test("removes a choice when remove button is clicked", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-multiple-choice"));

            // Add a third choice first
            fireEvent.click(screen.getByTestId("mcq-add-choice-1"));
            expect(screen.getByTestId("mcq-choice-1-2")).toBeInTheDocument();

            // Remove the third choice
            const removeButton = screen.getByTestId("mcq-remove-choice-1-2");
            fireEvent.click(removeButton);

            // Should no longer have the third choice
            expect(screen.queryByTestId("mcq-choice-1-2")).not.toBeInTheDocument();
        });

        test("disables remove button when only 2 choices remain", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-multiple-choice"));

            // With 2 choices, remove buttons should be disabled
            const removeButton0 = screen.getByTestId("mcq-remove-choice-1-0");
            const removeButton1 = screen.getByTestId("mcq-remove-choice-1-1");

            expect(removeButton0).toBeDisabled();
            expect(removeButton1).toBeDisabled();
        });

        test("enables remove button when more than 2 choices exist", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-multiple-choice"));

            // Add a third choice
            fireEvent.click(screen.getByTestId("mcq-add-choice-1"));

            // Remove buttons should now be enabled
            const removeButton0 = screen.getByTestId("mcq-remove-choice-1-0");
            const removeButton1 = screen.getByTestId("mcq-remove-choice-1-1");
            const removeButton2 = screen.getByTestId("mcq-remove-choice-1-2");

            expect(removeButton0).not.toBeDisabled();
            expect(removeButton1).not.toBeDisabled();
            expect(removeButton2).not.toBeDisabled();
        });

        test("toggles shuffle option", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-multiple-choice"));

            const shuffleCheckbox = screen.getByTestId("mcq-shuffle-1") as HTMLInputElement;
            
            // Initially unchecked
            expect(shuffleCheckbox.checked).toBe(false);

            // Click to enable shuffle
            fireEvent.click(shuffleCheckbox);
            expect(shuffleCheckbox.checked).toBe(true);

            // Click again to disable shuffle
            fireEvent.click(shuffleCheckbox);
            expect(shuffleCheckbox.checked).toBe(false);
        });

        test("adds feedback to choices", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-multiple-choice"));

            const feedbackInput0 = screen.getByTestId("mcq-feedback-1-0") as HTMLInputElement;
            const feedbackInput1 = screen.getByTestId("mcq-feedback-1-1") as HTMLInputElement;

            // Add feedback to first choice
            fireEvent.change(feedbackInput0, { target: { value: "Good answer!" } });
            expect(feedbackInput0.value).toBe("Good answer!");

            // Add feedback to second choice
            fireEvent.change(feedbackInput1, { target: { value: "Try again." } });
            expect(feedbackInput1.value).toBe("Try again.");
        });

        test("updates choice text", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-multiple-choice"));

            const choiceInput = screen.getByTestId("mcq-choice-1-0") as HTMLInputElement;
            fireEvent.change(choiceInput, { target: { value: "Option A" } });

            expect(choiceInput.value).toBe("Option A");
        });

        test("marks a choice as correct", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-multiple-choice"));

            const correctCheckbox = screen.getByTestId("mcq-correct-1-0") as HTMLInputElement;
            
            // Initially unchecked
            expect(correctCheckbox.checked).toBe(false);

            // Mark as correct
            fireEvent.click(correctCheckbox);
            expect(correctCheckbox.checked).toBe(true);
        });

        test("allows multiple correct answers", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-multiple-choice"));

            const correctCheckbox0 = screen.getByTestId("mcq-correct-1-0") as HTMLInputElement;
            const correctCheckbox1 = screen.getByTestId("mcq-correct-1-1") as HTMLInputElement;

            // Mark both as correct
            fireEvent.click(correctCheckbox0);
            fireEvent.click(correctCheckbox1);

            expect(correctCheckbox0.checked).toBe(true);
            expect(correctCheckbox1.checked).toBe(true);
        });

        test("updates correct answer indices when choice is removed", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-multiple-choice"));
            
            // Add a third choice
            fireEvent.click(screen.getByTestId("mcq-add-choice-1"));
            
            // Mark second and third as correct
            fireEvent.click(screen.getByTestId("mcq-correct-1-1"));
            fireEvent.click(screen.getByTestId("mcq-correct-1-2"));

            expect((screen.getByTestId("mcq-correct-1-1") as HTMLInputElement).checked).toBe(true);
            expect((screen.getByTestId("mcq-correct-1-2") as HTMLInputElement).checked).toBe(true);

            // Remove the first choice
            fireEvent.click(screen.getByTestId("mcq-remove-choice-1-0"));

            // The previously second choice (now first) should still be marked correct
            expect((screen.getByTestId("mcq-correct-1-0") as HTMLInputElement).checked).toBe(true);
            // The previously third choice (now second) should still be marked correct
            expect((screen.getByTestId("mcq-correct-1-1") as HTMLInputElement).checked).toBe(true);
        });

        test("maintains feedback when adding new choices", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-multiple-choice"));

            // Add feedback to first choice
            const feedbackInput0 = screen.getByTestId("mcq-feedback-1-0") as HTMLInputElement;
            fireEvent.change(feedbackInput0, { target: { value: "Great!" } });

            // Add a third choice
            fireEvent.click(screen.getByTestId("mcq-add-choice-1"));

            // Original feedback should still be there
            expect((screen.getByTestId("mcq-feedback-1-0") as HTMLInputElement).value).toBe("Great!");
            // New choice should have empty feedback
            expect((screen.getByTestId("mcq-feedback-1-2") as HTMLInputElement).value).toBe("");
        });

        test("saves MCQ with all features", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-multiple-choice"));

            // Set question
            fireEvent.change(screen.getByTestId("mcq-question-1"), { 
                target: { value: "What is 2+2?" } 
            });

            // Set choices
            fireEvent.change(screen.getByTestId("mcq-choice-1-0"), { 
                target: { value: "3" } 
            });
            fireEvent.change(screen.getByTestId("mcq-choice-1-1"), { 
                target: { value: "4" } 
            });

            // Mark correct answer
            fireEvent.click(screen.getByTestId("mcq-correct-1-1"));

            // Add feedback
            fireEvent.change(screen.getByTestId("mcq-feedback-1-0"), { 
                target: { value: "Incorrect" } 
            });
            fireEvent.change(screen.getByTestId("mcq-feedback-1-1"), { 
                target: { value: "Correct!" } 
            });

            // Enable shuffle
            fireEvent.click(screen.getByTestId("mcq-shuffle-1"));

            // Save
            fireEvent.click(screen.getByTestId("save-button"));

            expect(mockSave).toHaveBeenCalledWith({
                ...mockAssignment,
                items: [
                    {
                        id: 1,
                        type: "multiple-choice",
                        question: "What is 2+2?",
                        choices: ["3", "4"],
                        correctAnswers: [1],
                        shuffle: true,
                        choiceFeedback: ["Incorrect", "Correct!"],
                    },
                ],
            });
        });

        test("fill-in-blank item has all required fields", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            // Add fill-in-blank item
            fireEvent.click(screen.getByTestId("add-fill-in-blank"));

            // Verify all fields are present
            expect(
                screen.getByTestId("fill-blank-question-1")
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("fill-blank-answer-1-0")
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("fill-blank-regex-1")
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("fill-blank-case-sensitive-1")
            ).toBeInTheDocument();
            expect(screen.getByTestId("fill-blank-trim-1")).toBeInTheDocument();
        });

        test("can add multiple accepted answers to fill-in-blank", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            // Add fill-in-blank item
            fireEvent.click(screen.getByTestId("add-fill-in-blank"));

            // Add a second answer
            fireEvent.click(screen.getByTestId("fill-blank-add-answer-1"));

            // Verify second answer field exists
            expect(
                screen.getByTestId("fill-blank-answer-1-1")
            ).toBeInTheDocument();
        });

        test("can remove accepted answers from fill-in-blank", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            // Add fill-in-blank item
            fireEvent.click(screen.getByTestId("add-fill-in-blank"));

            // Add a second answer
            fireEvent.click(screen.getByTestId("fill-blank-add-answer-1"));

            // Remove the first answer button should be enabled now
            const removeButton = screen.getByTestId(
                "fill-blank-remove-answer-1-0"
            );
            expect(removeButton).not.toBeDisabled();

            // Remove the first answer
            fireEvent.click(removeButton);

            // First answer should be removed, but at least one should remain
            expect(
                screen.queryByTestId("fill-blank-answer-1-1")
            ).not.toBeInTheDocument();
            expect(
                screen.getByTestId("fill-blank-answer-1-0")
            ).toBeInTheDocument();
        });

        test("cannot remove last accepted answer from fill-in-blank", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            // Add fill-in-blank item
            fireEvent.click(screen.getByTestId("add-fill-in-blank"));

            // Remove button should be disabled when there's only one answer
            const removeButton = screen.getByTestId(
                "fill-blank-remove-answer-1-0"
            );
            expect(removeButton).toBeDisabled();
        });

        test("can set regex pattern for fill-in-blank", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            // Add fill-in-blank item
            fireEvent.click(screen.getByTestId("add-fill-in-blank"));

            // Set regex pattern
            const regexInput = screen.getByTestId("fill-blank-regex-1");
            fireEvent.change(regexInput, {
                target: { value: "^\\d{3}-\\d{4}$" },
            });

            expect(regexInput).toHaveValue("^\\d{3}-\\d{4}$");
        });

        test("can toggle case-sensitive option for fill-in-blank", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            // Add fill-in-blank item
            fireEvent.click(screen.getByTestId("add-fill-in-blank"));

            // Case-sensitive should be unchecked by default
            const caseSensitiveCheckbox = screen.getByTestId(
                "fill-blank-case-sensitive-1"
            ) as HTMLInputElement;
            expect(caseSensitiveCheckbox.checked).toBe(false);

            // Toggle case-sensitive
            fireEvent.click(caseSensitiveCheckbox);
            expect(caseSensitiveCheckbox.checked).toBe(true);
        });

        test("can toggle trim whitespace option for fill-in-blank", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            // Add fill-in-blank item
            fireEvent.click(screen.getByTestId("add-fill-in-blank"));

            // Trim whitespace should be checked by default
            const trimCheckbox = screen.getByTestId(
                "fill-blank-trim-1"
            ) as HTMLInputElement;
            expect(trimCheckbox.checked).toBe(true);

            // Toggle trim whitespace
            fireEvent.click(trimCheckbox);
            expect(trimCheckbox.checked).toBe(false);
        });

        test("saves fill-in-blank item with all options", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            // Add fill-in-blank item
            fireEvent.click(screen.getByTestId("add-fill-in-blank"));

            // Fill in question
            fireEvent.change(screen.getByTestId("fill-blank-question-1"), {
                target: { value: "What is the capital of France?" },
            });

            // Set first answer
            fireEvent.change(screen.getByTestId("fill-blank-answer-1-0"), {
                target: { value: "Paris" },
            });

            // Add second answer
            fireEvent.click(screen.getByTestId("fill-blank-add-answer-1"));
            fireEvent.change(screen.getByTestId("fill-blank-answer-1-1"), {
                target: { value: "paris" },
            });

            // Set regex
            fireEvent.change(screen.getByTestId("fill-blank-regex-1"), {
                target: { value: "^[Pp]aris$" },
            });

            // Toggle case-sensitive
            fireEvent.click(
                screen.getByTestId("fill-blank-case-sensitive-1")
            );

            // Save
            fireEvent.click(screen.getByTestId("save-button"));

            expect(mockSave).toHaveBeenCalledWith({
                ...mockAssignment,
                items: [
                    {
                        id: 1,
                        type: "fill-in-blank",
                        question: "What is the capital of France?",
                        acceptedAnswers: ["Paris", "paris"],
                        regexPattern: "^[Pp]aris$",
                        caseSensitive: true,
                        trimWhitespace: true,
                    },
                ],
            });
        });
    });

    describe("Essay item with word/character counter", () => {
        test("displays essay item with prompt and preview response area", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();
            const assignmentWithEssay: Assignment = {
                ...mockAssignment,
                items: [
                    {
                        id: 1,
                        type: "essay",
                        prompt: "Explain the concept of recursion",
                    },
                ],
            };

            render(
                <AssignmentEditor
                    assignment={assignmentWithEssay}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            expect(screen.getByTestId("essay-prompt-1")).toBeInTheDocument();
            expect(
                screen.getByTestId("essay-response-preview-1")
            ).toBeInTheDocument();
            expect(screen.getByTestId("essay-counter-1")).toBeInTheDocument();
        });

        test("displays correct word and character count for empty response", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();
            const assignmentWithEssay: Assignment = {
                ...mockAssignment,
                items: [
                    {
                        id: 1,
                        type: "essay",
                        prompt: "Explain recursion",
                    },
                ],
            };

            render(
                <AssignmentEditor
                    assignment={assignmentWithEssay}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            expect(screen.getByTestId("essay-word-count-1")).toHaveTextContent(
                "Words: 0"
            );
            expect(screen.getByTestId("essay-char-count-1")).toHaveTextContent(
                "Characters: 0"
            );
        });

        test("updates word and character count when typing in preview response", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();
            const assignmentWithEssay: Assignment = {
                ...mockAssignment,
                items: [
                    {
                        id: 1,
                        type: "essay",
                        prompt: "Explain recursion",
                    },
                ],
            };

            render(
                <AssignmentEditor
                    assignment={assignmentWithEssay}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            const responseArea = screen.getByTestId("essay-response-preview-1");
            fireEvent.change(responseArea, {
                target: { value: "Recursion is a programming technique" },
            });

            expect(screen.getByTestId("essay-word-count-1")).toHaveTextContent(
                "Words: 5"
            );
            expect(screen.getByTestId("essay-char-count-1")).toHaveTextContent(
                "Characters: 36"
            );
        });

        test("counts words correctly with multiple spaces", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();
            const assignmentWithEssay: Assignment = {
                ...mockAssignment,
                items: [
                    {
                        id: 1,
                        type: "essay",
                        prompt: "Explain recursion",
                    },
                ],
            };

            render(
                <AssignmentEditor
                    assignment={assignmentWithEssay}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            const responseArea = screen.getByTestId("essay-response-preview-1");
            fireEvent.change(responseArea, {
                target: { value: "Hello   world   test" },
            });

            expect(screen.getByTestId("essay-word-count-1")).toHaveTextContent(
                "Words: 3"
            );
            expect(screen.getByTestId("essay-char-count-1")).toHaveTextContent(
                "Characters: 20"
            );
        });

        test("handles whitespace-only text correctly", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();
            const assignmentWithEssay: Assignment = {
                ...mockAssignment,
                items: [
                    {
                        id: 1,
                        type: "essay",
                        prompt: "Explain recursion",
                    },
                ],
            };

            render(
                <AssignmentEditor
                    assignment={assignmentWithEssay}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            const responseArea = screen.getByTestId("essay-response-preview-1");
            fireEvent.change(responseArea, {
                target: { value: "   \n\n   " },
            });

            expect(screen.getByTestId("essay-word-count-1")).toHaveTextContent(
                "Words: 0"
            );
            expect(screen.getByTestId("essay-char-count-1")).toHaveTextContent(
                "Characters: 8"
            );
        });
    });

    describe("Multi-file Code Cell Features", () => {
        test("adds a code cell with default file", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-code-cell"));

            // Check prompt textarea exists
            expect(screen.getByTestId("code-prompt-1")).toBeInTheDocument();

            // Check default file tab exists
            expect(screen.getByTestId("file-tab-1-0")).toBeInTheDocument();
            expect(screen.getByTestId("file-tab-1-0")).toHaveTextContent(
                "main.py"
            );

            // Check file editor exists
            expect(screen.getByTestId("file-editor-1")).toBeInTheDocument();

            // Check file controls
            expect(screen.getByTestId("file-name-1-0")).toBeInTheDocument();
            expect(screen.getByTestId("file-language-1-0")).toBeInTheDocument();
            expect(
                screen.getByTestId("file-instructor-1-0")
            ).toBeInTheDocument();
            expect(screen.getByTestId("file-content-1-0")).toBeInTheDocument();
        });

        test("can add additional files", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-code-cell"));

            // Add a second file
            fireEvent.click(screen.getByTestId("add-file-1"));

            // Check both file tabs exist
            expect(screen.getByTestId("file-tab-1-0")).toBeInTheDocument();
            expect(screen.getByTestId("file-tab-1-1")).toBeInTheDocument();
            expect(screen.getByTestId("file-tab-1-1")).toHaveTextContent(
                "file2.py"
            );
        });

        test("can switch between files", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-code-cell"));
            fireEvent.click(screen.getByTestId("add-file-1"));

            // First file should be active
            expect(screen.getByTestId("file-tab-1-0")).toHaveClass("active");

            // Switch to second file
            fireEvent.click(screen.getByTestId("file-tab-1-1"));

            // Second file should now be active
            expect(screen.getByTestId("file-tab-1-1")).toHaveClass("active");
        });

        test("can update file name", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-code-cell"));

            const fileNameInput = screen.getByTestId(
                "file-name-1-0"
            ) as HTMLInputElement;
            fireEvent.change(fileNameInput, {
                target: { value: "solution.py" },
            });

            expect(fileNameInput.value).toBe("solution.py");
        });

        test("can change file language", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-code-cell"));

            const languageSelect = screen.getByTestId(
                "file-language-1-0"
            ) as HTMLSelectElement;
            fireEvent.change(languageSelect, {
                target: { value: "javascript" },
            });

            expect(languageSelect.value).toBe("javascript");
        });

        test("can toggle instructor file checkbox", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-code-cell"));

            const instructorCheckbox = screen.getByTestId(
                "file-instructor-1-0"
            ) as HTMLInputElement;

            // Initially should be unchecked (starter file)
            expect(instructorCheckbox.checked).toBe(false);

            // Toggle to instructor file
            fireEvent.click(instructorCheckbox);

            expect(instructorCheckbox.checked).toBe(true);
        });

        test("can edit file content", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-code-cell"));

            const contentTextarea = screen.getByTestId(
                "file-content-1-0"
            ) as HTMLTextAreaElement;
            fireEvent.change(contentTextarea, {
                target: { value: "def hello():\n    print('Hello, World!')" },
            });

            expect(contentTextarea.value).toBe(
                "def hello():\n    print('Hello, World!')"
            );
        });

        test("can remove files when more than one exists", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-code-cell"));
            fireEvent.click(screen.getByTestId("add-file-1"));

            // Both files should exist
            expect(screen.getByTestId("file-tab-1-0")).toBeInTheDocument();
            expect(screen.getByTestId("file-tab-1-1")).toBeInTheDocument();

            // Remove button should be visible with multiple files
            expect(screen.getByTestId("remove-file-1-0")).toBeInTheDocument();

            // Remove the first file
            fireEvent.click(screen.getByTestId("remove-file-1-0"));

            // First file should be gone
            expect(screen.queryByTestId("file-tab-1-1")).not.toBeInTheDocument();
        });

        test("cannot remove file when only one exists", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-code-cell"));

            // Remove button should not exist with only one file
            expect(
                screen.queryByTestId("remove-file-1-0")
            ).not.toBeInTheDocument();
        });

        test("displays instructor badge for instructor files", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-code-cell"));

            // Toggle to instructor file
            const instructorCheckbox = screen.getByTestId(
                "file-instructor-1-0"
            ) as HTMLInputElement;
            fireEvent.click(instructorCheckbox);

            // Badge should appear in the file tab
            expect(screen.getByTestId("file-tab-1-0")).toHaveTextContent(
                "(Instructor)"
            );
        });

        test("supports multiple language options", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            fireEvent.click(screen.getByTestId("add-code-cell"));

            const languageSelect = screen.getByTestId("file-language-1-0");
            const options = Array.from(languageSelect.querySelectorAll("option")).map(
                (opt) => opt.value
            );

            // Verify all expected languages are present
            expect(options).toContain("python");
            expect(options).toContain("javascript");
            expect(options).toContain("typescript");
            expect(options).toContain("java");
            expect(options).toContain("cpp");
            expect(options).toContain("c");
        });
    });

    describe("Grading Configuration", () => {
        test("displays grading configuration button for items", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            // Add text item
            fireEvent.click(screen.getByTestId("add-text"));

            // Should have grading config button
            expect(screen.getByText(/Configure Grading/i)).toBeInTheDocument();
        });

        test("can configure grading for multiple-choice item", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            // Add multiple-choice item
            fireEvent.click(screen.getByTestId("add-multiple-choice"));

            // Open grading config
            fireEvent.click(screen.getByText(/Configure Grading/i));

            // Should show answer checking option
            expect(
                screen.getByText("Enable Answer Checking")
            ).toBeInTheDocument();
        });

        test("can configure grading for essay item", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            // Add essay item
            fireEvent.click(screen.getByTestId("add-essay"));

            // Open grading config
            fireEvent.click(screen.getByText(/Configure Grading/i));

            // Should show rubric option
            expect(screen.getByText("Rubric")).toBeInTheDocument();
            // Should show AI prompt option
            expect(screen.getByText("AI Grading Prompt")).toBeInTheDocument();
        });

        test("can configure grading for code-cell item", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            // Add code-cell item
            fireEvent.click(screen.getByTestId("add-code-cell"));

            // Open grading config
            fireEvent.click(screen.getByText(/Configure Grading/i));

            // Should show unit test option
            expect(screen.getByText("Unit Test File")).toBeInTheDocument();
            // Should show rubric option
            expect(screen.getByText("Rubric")).toBeInTheDocument();
            // Should show AI prompt option
            expect(screen.getByText("AI Grading Prompt")).toBeInTheDocument();
        });

        test("saves grading configuration with item", () => {
            const mockSave = jest.fn();
            const mockBack = jest.fn();

            render(
                <AssignmentEditor
                    assignment={mockAssignment}
                    onSave={mockSave}
                    onBack={mockBack}
                />
            );

            // Add essay item
            fireEvent.click(screen.getByTestId("add-essay"));

            // Fill in prompt
            fireEvent.change(screen.getByTestId("essay-prompt-1"), {
                target: { value: "Test prompt" },
            });

            // Open grading config
            fireEvent.click(screen.getByText(/Configure Grading/i));

            // Add AI prompt
            const aiPromptTextarea = screen.getByPlaceholderText(
                "Enter AI grading instructions..."
            );
            fireEvent.change(aiPromptTextarea, {
                target: { value: "Grade based on clarity" },
            });

            // Save
            fireEvent.click(screen.getByTestId("save-button"));

            expect(mockSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    items: expect.arrayContaining([
                        expect.objectContaining({
                            type: "essay",
                            prompt: "Test prompt",
                            gradingConfig: expect.objectContaining({
                                aiPrompt: "Grade based on clarity",
                            }),
                        }),
                    ]),
                })
            );
        });
    });

    test("export button is present", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        const exportButton = screen.getByTestId("export-button");
        expect(exportButton).toBeInTheDocument();
        expect(exportButton).toHaveTextContent("Export");
    });

    test("export button triggers download", () => {
        const mockSave = jest.fn();
        const mockBack = jest.fn();

        // Mock URL methods on window.URL
        window.URL.createObjectURL = jest.fn(() => "blob:mock-url");
        window.URL.revokeObjectURL = jest.fn();

        // Mock document.createElement to track link creation
        const originalCreateElement = document.createElement.bind(document);
        const mockLink: Partial<HTMLAnchorElement> = {
            href: "",
            download: "",
            click: jest.fn(),
            remove: jest.fn(),
        };
        jest.spyOn(document, "createElement").mockImplementation((tagName) => {
            if (tagName === "a") {
                return mockLink as HTMLAnchorElement;
            }
            return originalCreateElement(tagName);
        });

        // Mock appendChild and removeChild only for the link
        const originalAppendChild = document.body.appendChild.bind(document.body);
        const originalRemoveChild = document.body.removeChild.bind(document.body);
        
        jest.spyOn(document.body, "appendChild").mockImplementation((node) => {
            if (node === mockLink) {
                return mockLink as Node;
            }
            return originalAppendChild(node);
        });
        
        jest.spyOn(document.body, "removeChild").mockImplementation((node) => {
            if (node === mockLink) {
                return mockLink as Node;
            }
            return originalRemoveChild(node);
        });

        render(
            <AssignmentEditor
                assignment={mockAssignment}
                onSave={mockSave}
                onBack={mockBack}
            />
        );

        const exportButton = screen.getByTestId("export-button");
        fireEvent.click(exportButton);

        expect(mockLink.click).toHaveBeenCalled();
        expect(mockLink.download).toContain("Test_Assignment.json");
    });
});

