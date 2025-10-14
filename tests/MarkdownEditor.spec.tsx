import { render, screen, fireEvent } from "@testing-library/react";
import { MarkdownEditor } from "../src/components/MarkdownEditor";

describe("MarkdownEditor", () => {
    test("renders with initial value", () => {
        const mockOnChange = jest.fn();

        render(
            <MarkdownEditor
                value="# Hello World"
                onChange={mockOnChange}
                testId="test-markdown"
            />
        );

        const textarea = screen.getByTestId("test-markdown") as HTMLTextAreaElement;
        expect(textarea.value).toBe("# Hello World");
    });

    test("displays preview of markdown content", () => {
        const mockOnChange = jest.fn();

        render(
            <MarkdownEditor
                value="# Hello World"
                onChange={mockOnChange}
                testId="test-markdown"
            />
        );

        const preview = screen.getByTestId("test-markdown-preview");
        expect(preview).toBeInTheDocument();
        expect(preview.innerHTML).toContain("<h1");
        expect(preview.innerHTML).toContain("Hello World");
    });

    test("calls onChange when text is typed", () => {
        const mockOnChange = jest.fn();

        render(
            <MarkdownEditor
                value=""
                onChange={mockOnChange}
                testId="test-markdown"
            />
        );

        const textarea = screen.getByTestId("test-markdown") as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: "New text" } });

        expect(mockOnChange).toHaveBeenCalledWith("New text");
    });

    test("renders all toolbar buttons", () => {
        const mockOnChange = jest.fn();

        render(
            <MarkdownEditor
                value=""
                onChange={mockOnChange}
                testId="test-markdown"
            />
        );

        expect(screen.getByTestId("test-markdown-bold")).toBeInTheDocument();
        expect(screen.getByTestId("test-markdown-italic")).toBeInTheDocument();
        expect(screen.getByTestId("test-markdown-code")).toBeInTheDocument();
        expect(screen.getByTestId("test-markdown-heading")).toBeInTheDocument();
        expect(screen.getByTestId("test-markdown-list")).toBeInTheDocument();
        expect(screen.getByTestId("test-markdown-preview-toggle")).toBeInTheDocument();
    });

    test("toggles preview visibility when toggle button is clicked", () => {
        const mockOnChange = jest.fn();

        render(
            <MarkdownEditor
                value="# Test"
                onChange={mockOnChange}
                testId="test-markdown"
            />
        );

        // Preview should be visible initially
        expect(screen.getByTestId("test-markdown-preview")).toBeInTheDocument();
        const toggleButton = screen.getByTestId("test-markdown-preview-toggle");
        expect(toggleButton.textContent).toContain("Hide Preview");

        // Click toggle button
        fireEvent.click(toggleButton);

        // Preview should be hidden
        expect(screen.queryByTestId("test-markdown-preview")).not.toBeInTheDocument();
        expect(toggleButton.textContent).toContain("Show Preview");

        // Click toggle button again
        fireEvent.click(toggleButton);

        // Preview should be visible again
        expect(screen.getByTestId("test-markdown-preview")).toBeInTheDocument();
        expect(toggleButton.textContent).toContain("Hide Preview");
    });

    test("inserts bold markdown when bold button is clicked", () => {
        const mockOnChange = jest.fn();

        render(
            <MarkdownEditor
                value="text"
                onChange={mockOnChange}
                testId="test-markdown"
            />
        );

        const boldButton = screen.getByTestId("test-markdown-bold");
        fireEvent.click(boldButton);

        // Text is inserted at cursor position (which starts at 0)
        expect(mockOnChange).toHaveBeenCalledWith("****text");
    });

    test("inserts italic markdown when italic button is clicked", () => {
        const mockOnChange = jest.fn();

        render(
            <MarkdownEditor
                value="text"
                onChange={mockOnChange}
                testId="test-markdown"
            />
        );

        const italicButton = screen.getByTestId("test-markdown-italic");
        fireEvent.click(italicButton);

        // Text is inserted at cursor position (which starts at 0)
        expect(mockOnChange).toHaveBeenCalledWith("**text");
    });

    test("inserts code markdown when code button is clicked", () => {
        const mockOnChange = jest.fn();

        render(
            <MarkdownEditor
                value="text"
                onChange={mockOnChange}
                testId="test-markdown"
            />
        );

        const codeButton = screen.getByTestId("test-markdown-code");
        fireEvent.click(codeButton);

        // Text is inserted at cursor position (which starts at 0)
        expect(mockOnChange).toHaveBeenCalledWith("``text");
    });

    test("sanitizes HTML in markdown preview", () => {
        const mockOnChange = jest.fn();

        render(
            <MarkdownEditor
                value="<script>alert('xss')</script>"
                onChange={mockOnChange}
                testId="test-markdown"
            />
        );

        const preview = screen.getByTestId("test-markdown-preview");
        expect(preview.innerHTML).not.toContain("<script>");
    });

    test("renders bold text in preview", () => {
        const mockOnChange = jest.fn();

        render(
            <MarkdownEditor
                value="**bold text**"
                onChange={mockOnChange}
                testId="test-markdown"
            />
        );

        const preview = screen.getByTestId("test-markdown-preview");
        expect(preview.innerHTML).toContain("<strong>");
        expect(preview.innerHTML).toContain("bold text");
    });

    test("renders italic text in preview", () => {
        const mockOnChange = jest.fn();

        render(
            <MarkdownEditor
                value="*italic text*"
                onChange={mockOnChange}
                testId="test-markdown"
            />
        );

        const preview = screen.getByTestId("test-markdown-preview");
        expect(preview.innerHTML).toContain("<em>");
        expect(preview.innerHTML).toContain("italic text");
    });

    test("renders code span in preview", () => {
        const mockOnChange = jest.fn();

        render(
            <MarkdownEditor
                value="`code text`"
                onChange={mockOnChange}
                testId="test-markdown"
            />
        );

        const preview = screen.getByTestId("test-markdown-preview");
        expect(preview.innerHTML).toContain("<code>");
        expect(preview.innerHTML).toContain("code text");
    });

    test("renders list in preview", () => {
        const mockOnChange = jest.fn();

        render(
            <MarkdownEditor
                value="- Item 1\n- Item 2"
                onChange={mockOnChange}
                testId="test-markdown"
            />
        );

        const preview = screen.getByTestId("test-markdown-preview");
        expect(preview.innerHTML).toContain("<ul>");
        expect(preview.innerHTML).toContain("<li>");
        expect(preview.innerHTML).toContain("Item 1");
        expect(preview.innerHTML).toContain("Item 2");
    });

    test("renders heading in preview", () => {
        const mockOnChange = jest.fn();

        render(
            <MarkdownEditor
                value="# Heading 1"
                onChange={mockOnChange}
                testId="test-markdown"
            />
        );

        const preview = screen.getByTestId("test-markdown-preview");
        expect(preview.innerHTML).toContain("<h1");
        expect(preview.innerHTML).toContain("Heading 1");
    });
});
