export type TaskStatus = "todo" | "doing";

export type Task = {
    id: string;
    title: string;
    status: TaskStatus;
};
