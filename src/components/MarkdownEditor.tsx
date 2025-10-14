import { useState, useRef, useMemo, useCallback } from "react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import "../styles/MarkdownEditor.css";

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    testId?: string;
}

export function MarkdownEditor({
    value,
    onChange,
    placeholder = "Enter markdown content...",
    testId,
}: MarkdownEditorProps) {
    const [showPreview, setShowPreview] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Configure marked once
    useMemo(() => {
        marked.setOptions({
            breaks: true,
            gfm: true,
        });
    }, []);

    const getTextarea = useCallback((): HTMLTextAreaElement | null => {
        return textareaRef.current;
    }, []);

    const insertMarkdown = (before: string, after: string = "") => {
        const textarea = getTextarea();
        if (textarea === null) {
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        const newText =
            value.substring(0, start) +
            before +
            selectedText +
            after +
            value.substring(end);

        onChange(newText);

        // Set cursor position after insertion
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length + selectedText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const insertAtLineStart = (prefix: string) => {
        const textarea = getTextarea();
        if (textarea === null) {
            return;
        }
        const start = textarea.selectionStart;
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const newText =
            value.substring(0, lineStart) + prefix + value.substring(lineStart);
        onChange(newText);
    };

    const renderMarkdown = (markdown: string): string => {
        try {
            const html = marked.parse(markdown) as string;
            return DOMPurify.sanitize(html);
        } catch (error) {
            console.error("Markdown parsing error:", error);
            return "";
        }
    };

    return (
        <div className="markdown-editor">
            <div className="markdown-toolbar">
                <button
                    type="button"
                    onClick={() => insertMarkdown("**", "**")}
                    title="Bold"
                    data-testid={`${testId}-bold`}
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    onClick={() => insertMarkdown("*", "*")}
                    title="Italic"
                    data-testid={`${testId}-italic`}
                >
                    <em>I</em>
                </button>
                <button
                    type="button"
                    onClick={() => insertMarkdown("`", "`")}
                    title="Code"
                    data-testid={`${testId}-code`}
                >
                    &lt;/&gt;
                </button>
                <button
                    type="button"
                    onClick={() => insertAtLineStart("# ")}
                    title="Heading"
                    data-testid={`${testId}-heading`}
                >
                    H
                </button>
                <button
                    type="button"
                    onClick={() => insertAtLineStart("- ")}
                    title="List"
                    data-testid={`${testId}-list`}
                >
                    • List
                </button>
                <div className="toolbar-spacer"></div>
                <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={showPreview ? "active" : ""}
                    title="Toggle Preview"
                    data-testid={`${testId}-preview-toggle`}
                >
                    {showPreview ? "👁️ Hide Preview" : "👁️ Show Preview"}
                </button>
            </div>

            <div
                className={`markdown-content ${showPreview ? "" : "preview-off"}`}
            >
                <div className="markdown-input">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        data-testid={testId}
                    />
                </div>

                {showPreview && (
                    <div
                        className="markdown-preview"
                        data-testid={`${testId}-preview`}
                        dangerouslySetInnerHTML={{
                            __html: renderMarkdown(value),
                        }}
                    />
                )}
            </div>
        </div>
    );
}
