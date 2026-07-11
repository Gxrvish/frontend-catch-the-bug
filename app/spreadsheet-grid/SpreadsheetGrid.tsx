"use client";

import { useState } from "react";

import { type CellId, evaluate, type Grid } from "./formulaEngine";

const INITIAL_GRID: Grid = {
    A1: { raw: "2" },
    B1: { raw: "0" },
    C1: { raw: "=A1+B2" },
    A2: { raw: "0" },
    B2: { raw: "3" },
    C2: { raw: "0" },
    A3: { raw: "0" },
    B3: { raw: "0" },
    C3: { raw: "0" },
};

const ROWS = [1, 2, 3];
const COLS = ["A", "B", "C"];

export const SpreadsheetGrid = () => {
    const [grid, setGrid] = useState<Grid>(INITIAL_GRID);
    const [selected, setSelected] = useState<CellId>("C1");

    const setRaw = (cellId: CellId, raw: string) => {
        setGrid((prev) => ({ ...prev, [cellId]: { raw } }));
    };

    const display = (cellId: CellId): string => {
        try {
            return String(evaluate(cellId, grid));
        } catch {
            // A formula blew the stack — keep the sheet alive instead of
            // white-screening the whole tab.
            return "#ERR!";
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-lg">
                <h2 className="mb-1 text-xl font-semibold text-gray-900">
                    Mini Sheet
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Type <code>=A1+B2</code> style formulas. Editing{" "}
                    <span className="font-medium">{selected}</span>.
                </p>

                <input
                    aria-label={`formula for ${selected}`}
                    value={grid[selected].raw}
                    onChange={(e) => setRaw(selected, e.target.value)}
                    className="mb-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm"
                />

                <table className="w-full border-collapse text-sm">
                    <tbody>
                        {ROWS.map((row) => (
                            <tr key={row}>
                                {COLS.map((col) => {
                                    const cellId = `${col}${row}`;
                                    return (
                                        <td
                                            key={cellId}
                                            data-testid={`cell-${cellId}`}
                                            onClick={() => setSelected(cellId)}
                                            className={`cursor-pointer border border-gray-300 bg-white px-3 py-2 text-center ${
                                                cellId === selected
                                                    ? "ring-2 ring-indigo-400"
                                                    : ""
                                            }`}
                                        >
                                            {display(cellId)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
};
