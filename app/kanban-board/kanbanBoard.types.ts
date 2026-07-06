export type ColumnId = "todo" | "doing" | "done";

export interface KanbanCard {
    id: string;
    title: string;
}

export type Board = Record<ColumnId, KanbanCard[]>;
