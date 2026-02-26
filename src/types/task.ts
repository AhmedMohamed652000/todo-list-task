export type Priority = "high" | "medium" | "low";

export interface Task {
    column: string;
    _id: string;
    id: string;
    title: string;
    description: string;
    priority: Priority;
}