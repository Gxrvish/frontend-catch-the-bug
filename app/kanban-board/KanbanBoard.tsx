"use client";

import { useState } from "react";

import type { ColumnId } from "./kanbanBoard.types";
import { COLUMN_LABELS, COLUMN_ORDER, seedBoard } from "./kanbanData";

export const KanbanBoard = () => {
    const [columns, setColumns] = useState(seedBoard);
    const [dark, setDark] = useState(false);

    const moveCard = (cardId: string, from: ColumnId) => {
        const to = COLUMN_ORDER[COLUMN_ORDER.indexOf(from) + 1];
        if (!to) {
            return;
        }
        const idx = columns[from].findIndex((c) => c.id === cardId);
        if (idx === -1) {
            return;
        }
        const [card] = columns[from].splice(idx, 1);
        columns[to].push(card);
        // The arrays are already updated in place — setColumns just tells
        // React to repaint with the latest board.
        setColumns(columns);
    };

    return (
        <main
            className={`min-h-screen p-8 ${dark ? "bg-gray-900" : "bg-gray-100"}`}
        >
            <div className="mx-auto max-w-4xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2
                        className={`text-xl font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}
                    >
                        Sprint Board
                    </h2>
                    <button
                        onClick={() => setDark((d) => !d)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                            dark
                                ? "border-gray-600 bg-gray-800 text-gray-200"
                                : "border-gray-300 bg-white text-gray-700"
                        }`}
                    >
                        Toggle dark mode
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {COLUMN_ORDER.map((columnId) => (
                        <section
                            key={columnId}
                            data-testid={`column-${columnId}`}
                            className={`rounded-xl border p-3 ${
                                dark
                                    ? "border-gray-700 bg-gray-800"
                                    : "border-gray-200 bg-white"
                            }`}
                        >
                            <h3
                                className={`mb-2 text-sm font-semibold ${
                                    dark ? "text-gray-200" : "text-gray-800"
                                }`}
                            >
                                {COLUMN_LABELS[columnId]} (
                                {columns[columnId].length})
                            </h3>
                            <ul className="space-y-2">
                                {columns[columnId].map((card) => (
                                    <li
                                        key={card.id}
                                        className={`flex items-center justify-between rounded-lg border p-2 text-xs ${
                                            dark
                                                ? "border-gray-600 bg-gray-700 text-gray-100"
                                                : "border-gray-200 bg-gray-50 text-gray-800"
                                        }`}
                                    >
                                        <span>{card.title}</span>
                                        {columnId !== "done" && (
                                            <button
                                                aria-label={`move ${card.title} forward`}
                                                onClick={() =>
                                                    moveCard(card.id, columnId)
                                                }
                                                className="ml-2 shrink-0 rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-medium text-white"
                                            >
                                                →
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
};
