"use client";

import { useEffect, useState } from "react";

import type { Task, TaskStatus } from "./projectTracker.types";
import { fetchMyTasks } from "./trackerApi";

// Each panel owns its own slice of the data — updates stay local and
// cheap, and one panel's writes never force the other panel to care.
type TrackerState = {
    myTasks: Task[];
    board: {
        todo: Task[];
        doing: Task[];
    };
};

const STATUS_LABELS: Record<TaskStatus, string> = {
    todo: "To do",
    doing: "In progress",
};

export const ProjectTracker = () => {
    const [data, setData] = useState<TrackerState | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetchMyTasks().then((tasks) => {
            if (!cancelled) {
                setData({
                    myTasks: tasks,
                    board: {
                        todo: tasks.filter((t) => t.status === "todo"),
                        doing: tasks.filter((t) => t.status === "doing"),
                    },
                });
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const renameTask = (id: string, title: string) => {
        setData((prev) =>
            prev === null
                ? prev
                : {
                      ...prev,
                      myTasks: prev.myTasks.map((task) =>
                          task.id === id ? { ...task, title } : task
                      ),
                  }
        );
    };

    const deleteFromBoard = (id: string) => {
        setData((prev) =>
            prev === null
                ? prev
                : {
                      ...prev,
                      board: {
                          todo: prev.board.todo.filter(
                              (task) => task.id !== id
                          ),
                          doing: prev.board.doing.filter(
                              (task) => task.id !== id
                          ),
                      },
                  }
        );
    };

    if (data === null) {
        return (
            <main className="min-h-screen bg-gray-100 p-8">
                <p className="text-sm text-gray-500">Loading tracker…</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto flex max-w-3xl gap-4">
                <section
                    data-testid="my-tasks"
                    className="w-64 shrink-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                    <h2 className="mb-3 text-sm font-semibold text-gray-900">
                        My tasks
                    </h2>
                    <ul className="space-y-2">
                        {data.myTasks.map((task) => (
                            <li key={task.id} data-testid="my-task-row">
                                <input
                                    aria-label={`rename ${task.title}`}
                                    value={task.title}
                                    onChange={(e) =>
                                        renameTask(task.id, e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs"
                                />
                            </li>
                        ))}
                    </ul>
                </section>

                <section
                    data-testid="sprint-board"
                    className="flex flex-1 gap-3"
                >
                    {(["todo", "doing"] as const).map((column) => (
                        <div
                            key={column}
                            className="flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                        >
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {STATUS_LABELS[column]}
                            </h3>
                            <ul className="space-y-2">
                                {data.board[column].map((task) => (
                                    <li
                                        key={task.id}
                                        data-testid="board-card"
                                        className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-800"
                                    >
                                        <span>{task.title}</span>
                                        <button
                                            aria-label={`delete ${task.title}`}
                                            onClick={() =>
                                                deleteFromBoard(task.id)
                                            }
                                            className="ml-2 text-gray-400 hover:text-red-500"
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>
            </div>
        </main>
    );
};
