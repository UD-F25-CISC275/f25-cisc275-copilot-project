export type ItemType =
    | "text"
    | "multiple-choice"
    | "fill-in-blank"
    | "essay"
    | "code-cell"
    | "page-break";

export interface BaseItem {
    id: number;
    type: ItemType;
}

export interface TextItem extends BaseItem {
    type: "text";
    content: string;
}

export interface MultipleChoiceItem extends BaseItem {
    type: "multiple-choice";
    question: string;
    choices: string[];
    correctAnswers: number[];
    shuffle?: boolean;
    choiceFeedback?: string[];
}

export interface FillInBlankItem extends BaseItem {
    type: "fill-in-blank";
    question: string;
    acceptedAnswers: string[];
    regexPattern?: string;
    caseSensitive?: boolean;
    trimWhitespace?: boolean;
}

export interface EssayItem extends BaseItem {
    type: "essay";
    prompt: string;
}

export interface CodeFile {
    name: string;
    language: string;
    content: string;
    isInstructorFile: boolean; // If true, hidden from students; if false, shown as starter file
}

export interface CodeCellItem extends BaseItem {
    type: "code-cell";
    prompt: string;
    files: CodeFile[];
    // Legacy fields kept for backward compatibility
    starterCode?: string;
}

export interface PageBreakItem extends BaseItem {
    type: "page-break";
}

export type AssignmentItem =
    | TextItem
    | MultipleChoiceItem
    | FillInBlankItem
    | EssayItem
    | CodeCellItem
    | PageBreakItem;
