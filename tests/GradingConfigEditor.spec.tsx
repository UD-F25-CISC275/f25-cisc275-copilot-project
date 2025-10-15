import { render, screen, fireEvent } from "@testing-library/react";
import { GradingConfigEditor } from "../src/components/GradingConfigEditor";
import type { GradingConfig } from "../src/types/GradingConfig";
import type { CodeFile } from "../src/types/AssignmentItem";

describe("GradingConfigEditor", () => {
    test("renders collapsed by default", () => {
        const mockOnChange = jest.fn();

        render(
            <GradingConfigEditor
                itemType="text"
                config={undefined}
                onChange={mockOnChange}
            />
        );

        expect(
            screen.getByText(/Configure Grading/i)
        ).toBeInTheDocument();
    });

    test("expands when configure button is clicked", () => {
        const mockOnChange = jest.fn();

        render(
            <GradingConfigEditor
                itemType="text"
                config={undefined}
                onChange={mockOnChange}
            />
        );

        const configButton = screen.getByText(/Configure Grading/i);
        fireEvent.click(configButton);

        expect(screen.getByText("Grading Configuration")).toBeInTheDocument();
        expect(screen.getByText(/Hide/i)).toBeInTheDocument();
    });

    test("collapses when hide button is clicked", () => {
        const mockOnChange = jest.fn();

        render(
            <GradingConfigEditor
                itemType="text"
                config={undefined}
                onChange={mockOnChange}
            />
        );

        // Expand
        const configButton = screen.getByText(/Configure Grading/i);
        fireEvent.click(configButton);

        // Collapse
        const hideButton = screen.getByText(/Hide/i);
        fireEvent.click(hideButton);

        expect(screen.queryByText("Grading Configuration")).not.toBeInTheDocument();
    });

    test("shows answer check option for multiple-choice items", () => {
        const mockOnChange = jest.fn();

        render(
            <GradingConfigEditor
                itemType="multiple-choice"
                config={undefined}
                onChange={mockOnChange}
            />
        );

        // Expand
        fireEvent.click(screen.getByText(/Configure Grading/i));

        expect(screen.getByText("Enable Answer Checking")).toBeInTheDocument();
    });

    test("shows answer check option for fill-in-blank items", () => {
        const mockOnChange = jest.fn();

        render(
            <GradingConfigEditor
                itemType="fill-in-blank"
                config={undefined}
                onChange={mockOnChange}
            />
        );

        // Expand
        fireEvent.click(screen.getByText(/Configure Grading/i));

        expect(screen.getByText("Enable Answer Checking")).toBeInTheDocument();
    });

    test("does not show answer check option for essay items", () => {
        const mockOnChange = jest.fn();

        render(
            <GradingConfigEditor
                itemType="essay"
                config={undefined}
                onChange={mockOnChange}
            />
        );

        // Expand
        fireEvent.click(screen.getByText(/Configure Grading/i));

        expect(
            screen.queryByText("Enable Answer Checking")
        ).not.toBeInTheDocument();
    });

    test("shows unit test file selector for code-cell items", () => {
        const mockOnChange = jest.fn();
        const mockFiles: CodeFile[] = [
            {
                name: "main.py",
                language: "python",
                content: "",
                isInstructorFile: false,
            },
            {
                name: "test.py",
                language: "python",
                content: "",
                isInstructorFile: true,
            },
        ];

        render(
            <GradingConfigEditor
                itemType="code-cell"
                config={undefined}
                onChange={mockOnChange}
                files={mockFiles}
            />
        );

        // Expand
        fireEvent.click(screen.getByText(/Configure Grading/i));

        expect(screen.getByText("Unit Test File")).toBeInTheDocument();
        const select = screen.getByRole("combobox") as HTMLSelectElement;
        expect(select).toBeInTheDocument();
        // Should only show instructor files
        expect(select.options.length).toBe(2); // "No unit tests" + 1 instructor file
    });

    test("does not show unit test file selector for non-code items", () => {
        const mockOnChange = jest.fn();

        render(
            <GradingConfigEditor
                itemType="essay"
                config={undefined}
                onChange={mockOnChange}
            />
        );

        // Expand
        fireEvent.click(screen.getByText(/Configure Grading/i));

        expect(screen.queryByText("Unit Test File")).not.toBeInTheDocument();
    });

    test("shows rubric section for essay items", () => {
        const mockOnChange = jest.fn();

        render(
            <GradingConfigEditor
                itemType="essay"
                config={undefined}
                onChange={mockOnChange}
            />
        );

        // Expand
        fireEvent.click(screen.getByText(/Configure Grading/i));

        expect(screen.getByText("Rubric")).toBeInTheDocument();
    });

    test("shows rubric section for code-cell items", () => {
        const mockOnChange = jest.fn();

        render(
            <GradingConfigEditor
                itemType="code-cell"
                config={undefined}
                onChange={mockOnChange}
            />
        );

        // Expand
        fireEvent.click(screen.getByText(/Configure Grading/i));

        expect(screen.getByText("Rubric")).toBeInTheDocument();
    });

    test("shows rubric section for text items", () => {
        const mockOnChange = jest.fn();

        render(
            <GradingConfigEditor
                itemType="text"
                config={undefined}
                onChange={mockOnChange}
            />
        );

        // Expand
        fireEvent.click(screen.getByText(/Configure Grading/i));

        expect(screen.getByText("Rubric")).toBeInTheDocument();
    });

    test("does not show rubric section for multiple-choice items", () => {
        const mockOnChange = jest.fn();

        render(
            <GradingConfigEditor
                itemType="multiple-choice"
                config={undefined}
                onChange={mockOnChange}
            />
        );

        // Expand
        fireEvent.click(screen.getByText(/Configure Grading/i));

        expect(screen.queryByText("Rubric")).not.toBeInTheDocument();
    });

    test("shows AI prompt section for all items", () => {
        const itemTypes: Array<"text" | "essay" | "multiple-choice" | "fill-in-blank" | "code-cell"> = [
            "text",
            "essay",
            "multiple-choice",
            "fill-in-blank",
            "code-cell",
        ];

        itemTypes.forEach((itemType) => {
            const mockOnChange = jest.fn();
            const { unmount } = render(
                <GradingConfigEditor
                    itemType={itemType}
                    config={undefined}
                    onChange={mockOnChange}
                />
            );

            // Expand
            fireEvent.click(screen.getByText(/Configure Grading/i));

            expect(screen.getByText("AI Grading Prompt")).toBeInTheDocument();

            unmount();
        });
    });

    test("can add criteria to rubric", () => {
        const mockOnChange = jest.fn();

        render(
            <GradingConfigEditor
                itemType="essay"
                config={undefined}
                onChange={mockOnChange}
            />
        );

        // Expand
        fireEvent.click(screen.getByText(/Configure Grading/i));

        // Add criteria
        const addButton = screen.getByText("+ Add Criteria");
        fireEvent.click(addButton);

        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({
                rubric: expect.objectContaining({
                    criteria: expect.arrayContaining([
                        expect.objectContaining({
                            level: 1,
                            name: "",
                            description: "",
                            points: 0,
                        }),
                    ]),
                }),
            })
        );
    });

    test("can update rubric title and description", () => {
        const mockOnChange = jest.fn();

        render(
            <GradingConfigEditor
                itemType="essay"
                config={undefined}
                onChange={mockOnChange}
            />
        );

        // Expand
        fireEvent.click(screen.getByText(/Configure Grading/i));

        // Update title
        const titleInput = screen.getByPlaceholderText("e.g., Code Quality");
        fireEvent.change(titleInput, { target: { value: "Test Rubric" } });

        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({
                rubric: expect.objectContaining({
                    title: "Test Rubric",
                }),
            })
        );
    });

    test("can update AI prompt", () => {
        const mockOnChange = jest.fn();

        render(
            <GradingConfigEditor
                itemType="essay"
                config={undefined}
                onChange={mockOnChange}
            />
        );

        // Expand
        fireEvent.click(screen.getByText(/Configure Grading/i));

        // Update AI prompt
        const promptTextarea = screen.getByPlaceholderText(
            "Enter AI grading instructions..."
        );
        fireEvent.change(promptTextarea, {
            target: { value: "Grade based on {{studentAnswer}}" },
        });

        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({
                aiPrompt: "Grade based on {{studentAnswer}}",
            })
        );
    });

    test("displays Auto badge when answer checking is enabled", () => {
        const mockOnChange = jest.fn();
        const config: GradingConfig = {
            enableAnswerCheck: true,
        };

        render(
            <GradingConfigEditor
                itemType="multiple-choice"
                config={config}
                onChange={mockOnChange}
            />
        );

        expect(screen.getByText("Auto")).toBeInTheDocument();
    });

    test("displays Manual badge when rubric is configured", () => {
        const mockOnChange = jest.fn();
        const config: GradingConfig = {
            rubric: {
                title: "Test Rubric",
                description: "",
                criteria: [],
            },
        };

        render(
            <GradingConfigEditor
                itemType="essay"
                config={config}
                onChange={mockOnChange}
            />
        );

        expect(screen.getByText("Manual")).toBeInTheDocument();
    });

    test("displays Manual badge when AI prompt is configured", () => {
        const mockOnChange = jest.fn();
        const config: GradingConfig = {
            aiPrompt: "Grade this",
        };

        render(
            <GradingConfigEditor
                itemType="essay"
                config={config}
                onChange={mockOnChange}
            />
        );

        expect(screen.getByText("Manual")).toBeInTheDocument();
    });

    test("can select test file for code cell", () => {
        const mockOnChange = jest.fn();
        const mockFiles: CodeFile[] = [
            {
                name: "main.py",
                language: "python",
                content: "",
                isInstructorFile: false,
            },
            {
                name: "test.py",
                language: "python",
                content: "",
                isInstructorFile: true,
            },
        ];

        render(
            <GradingConfigEditor
                itemType="code-cell"
                config={undefined}
                onChange={mockOnChange}
                files={mockFiles}
            />
        );

        // Expand
        fireEvent.click(screen.getByText(/Configure Grading/i));

        // Select test file
        const select = screen.getByRole("combobox");
        fireEvent.change(select, { target: { value: "test.py" } });

        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({
                testFileName: "test.py",
            })
        );
    });

    test("can remove criteria from rubric", () => {
        const mockOnChange = jest.fn();
        const config: GradingConfig = {
            rubric: {
                title: "Test Rubric",
                description: "",
                criteria: [
                    {
                        level: 1,
                        name: "Excellent",
                        description: "Great work",
                        points: 10,
                    },
                ],
            },
        };

        render(
            <GradingConfigEditor
                itemType="essay"
                config={config}
                onChange={mockOnChange}
            />
        );

        // Expand
        fireEvent.click(screen.getByText(/Configure Grading/i));

        // Remove criteria
        const removeButton = screen.getByTitle("Remove criteria");
        fireEvent.click(removeButton);

        expect(mockOnChange).toHaveBeenCalled();
    });
});
