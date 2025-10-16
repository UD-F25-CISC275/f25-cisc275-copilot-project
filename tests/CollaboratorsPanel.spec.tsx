import { render, screen, fireEvent } from "@testing-library/react";
import { CollaboratorsPanel } from "../src/components/CollaboratorsPanel";
import type { Collaborator } from "../src/types/Collaborator";

describe("CollaboratorsPanel", () => {
    const mockOnCollaboratorsChange = jest.fn();

    beforeEach(() => {
        mockOnCollaboratorsChange.mockClear();
    });

    test("renders empty state", () => {
        render(
            <CollaboratorsPanel
                collaborators={[]}
                onCollaboratorsChange={mockOnCollaboratorsChange}
            />
        );

        expect(screen.getByTestId("collaborators-panel")).toBeInTheDocument();
        expect(screen.getByText("Collaborators")).toBeInTheDocument();
        expect(screen.getByText("No collaborators added yet.")).toBeInTheDocument();
    });

    test("renders collaborators list", () => {
        const collaborators: Collaborator[] = [
            { name: "John Doe", email: "john@example.com" },
            { name: "Jane Smith", email: "jane@example.com", role: "Team Lead" },
        ];

        render(
            <CollaboratorsPanel
                collaborators={collaborators}
                onCollaboratorsChange={mockOnCollaboratorsChange}
            />
        );

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("john@example.com")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        expect(screen.getByText("jane@example.com")).toBeInTheDocument();
        expect(screen.getByText("Role: Team Lead")).toBeInTheDocument();
    });

    test("adds a collaborator", () => {
        render(
            <CollaboratorsPanel
                collaborators={[]}
                onCollaboratorsChange={mockOnCollaboratorsChange}
            />
        );

        const nameInput = screen.getByTestId("collaborator-name-input");
        const emailInput = screen.getByTestId("collaborator-email-input");
        const addButton = screen.getByTestId("add-collaborator-button");

        fireEvent.change(nameInput, { target: { value: "Alice Johnson" } });
        fireEvent.change(emailInput, { target: { value: "alice@example.com" } });
        fireEvent.click(addButton);

        expect(mockOnCollaboratorsChange).toHaveBeenCalledWith([
            { name: "Alice Johnson", email: "alice@example.com", role: undefined },
        ]);
    });

    test("adds a collaborator with role", () => {
        render(
            <CollaboratorsPanel
                collaborators={[]}
                onCollaboratorsChange={mockOnCollaboratorsChange}
            />
        );

        const nameInput = screen.getByTestId("collaborator-name-input");
        const emailInput = screen.getByTestId("collaborator-email-input");
        const roleInput = screen.getByTestId("collaborator-role-input");
        const addButton = screen.getByTestId("add-collaborator-button");

        fireEvent.change(nameInput, { target: { value: "Bob Wilson" } });
        fireEvent.change(emailInput, { target: { value: "bob@example.com" } });
        fireEvent.change(roleInput, { target: { value: "Developer" } });
        fireEvent.click(addButton);

        expect(mockOnCollaboratorsChange).toHaveBeenCalledWith([
            { name: "Bob Wilson", email: "bob@example.com", role: "Developer" },
        ]);
    });

    test("clears form after adding collaborator", () => {
        render(
            <CollaboratorsPanel
                collaborators={[]}
                onCollaboratorsChange={mockOnCollaboratorsChange}
            />
        );

        const nameInput = screen.getByTestId("collaborator-name-input") as HTMLInputElement;
        const emailInput = screen.getByTestId("collaborator-email-input") as HTMLInputElement;
        const roleInput = screen.getByTestId("collaborator-role-input") as HTMLInputElement;
        const addButton = screen.getByTestId("add-collaborator-button");

        fireEvent.change(nameInput, { target: { value: "Test User" } });
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(roleInput, { target: { value: "Tester" } });
        fireEvent.click(addButton);

        expect(nameInput.value).toBe("");
        expect(emailInput.value).toBe("");
        expect(roleInput.value).toBe("");
    });

    test("disables add button when name is empty", () => {
        render(
            <CollaboratorsPanel
                collaborators={[]}
                onCollaboratorsChange={mockOnCollaboratorsChange}
            />
        );

        const emailInput = screen.getByTestId("collaborator-email-input");
        const addButton = screen.getByTestId("add-collaborator-button");

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        expect(addButton).toBeDisabled();
    });

    test("disables add button when email is empty", () => {
        render(
            <CollaboratorsPanel
                collaborators={[]}
                onCollaboratorsChange={mockOnCollaboratorsChange}
            />
        );

        const nameInput = screen.getByTestId("collaborator-name-input");
        const addButton = screen.getByTestId("add-collaborator-button");

        fireEvent.change(nameInput, { target: { value: "Test User" } });

        expect(addButton).toBeDisabled();
    });

    test("removes a collaborator", () => {
        const collaborators: Collaborator[] = [
            { name: "John Doe", email: "john@example.com" },
            { name: "Jane Smith", email: "jane@example.com" },
        ];

        render(
            <CollaboratorsPanel
                collaborators={collaborators}
                onCollaboratorsChange={mockOnCollaboratorsChange}
            />
        );

        const removeButton = screen.getByTestId("remove-collaborator-0");
        fireEvent.click(removeButton);

        expect(mockOnCollaboratorsChange).toHaveBeenCalledWith([
            { name: "Jane Smith", email: "jane@example.com" },
        ]);
    });

    test("trims whitespace from inputs", () => {
        render(
            <CollaboratorsPanel
                collaborators={[]}
                onCollaboratorsChange={mockOnCollaboratorsChange}
            />
        );

        const nameInput = screen.getByTestId("collaborator-name-input");
        const emailInput = screen.getByTestId("collaborator-email-input");
        const roleInput = screen.getByTestId("collaborator-role-input");
        const addButton = screen.getByTestId("add-collaborator-button");

        fireEvent.change(nameInput, { target: { value: "  Test User  " } });
        fireEvent.change(emailInput, { target: { value: "  test@example.com  " } });
        fireEvent.change(roleInput, { target: { value: "  Developer  " } });
        fireEvent.click(addButton);

        expect(mockOnCollaboratorsChange).toHaveBeenCalledWith([
            { name: "Test User", email: "test@example.com", role: "Developer" },
        ]);
    });

    test("does not add collaborator with only whitespace", () => {
        render(
            <CollaboratorsPanel
                collaborators={[]}
                onCollaboratorsChange={mockOnCollaboratorsChange}
            />
        );

        const nameInput = screen.getByTestId("collaborator-name-input");
        const emailInput = screen.getByTestId("collaborator-email-input");
        const addButton = screen.getByTestId("add-collaborator-button");

        fireEvent.change(nameInput, { target: { value: "   " } });
        fireEvent.change(emailInput, { target: { value: "   " } });

        expect(addButton).toBeDisabled();
    });
});
