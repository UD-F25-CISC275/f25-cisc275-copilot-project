import type { AssignmentItem } from "./AssignmentItem";

export interface Assignment {
    id: number;
    title: string;
    description?: string;
    items: AssignmentItem[];
}
