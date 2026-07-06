import type { Board, ColumnId } from "./kanbanBoard.types";

export const COLUMN_ORDER: ColumnId[] = ["todo", "doing", "done"];

export const COLUMN_LABELS: Record<ColumnId, string> = {
    todo: "To do",
    doing: "In progress",
    done: "Done",
};

export const seedBoard = (): Board => ({
    todo: [
        { id: "k-1", title: "Design login screen" },
        { id: "k-2", title: "Write onboarding email" },
    ],
    doing: [{ id: "k-3", title: "Migrate billing webhooks" }],
    done: [{ id: "k-4", title: "Rotate API keys" }],
});
