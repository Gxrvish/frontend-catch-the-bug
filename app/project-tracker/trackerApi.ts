import type { Task } from "./projectTracker.types";

const SEEDED_TASKS: Task[] = [
    { id: "p-01", title: "Fix login redirect", status: "todo" },
    { id: "p-02", title: "Write release notes", status: "todo" },
    { id: "p-03", title: "Audit bundle size", status: "todo" },
    { id: "p-04", title: "Migrate avatar uploads", status: "doing" },
    { id: "p-05", title: "Polish empty states", status: "doing" },
];

export const fetchMyTasks = async (): Promise<Task[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return SEEDED_TASKS.map((task) => ({ ...task }));
};
