import type { AssignmentItem } from "./AssignmentItem";

export interface Assignment {
    id: number;
    title: string;
    description?: string;
    estimatedTime?: number; // in minutes
    notes?: string; // instructor's private notes
    items: AssignmentItem[];
}
