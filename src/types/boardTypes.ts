import type { Task } from "./task";

export interface ColumnState {
    tasks: Task[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface Columns {
    [key: string]: ColumnState;
}