"use client";

import { useRef, useState } from "react";

import type { Shape, ShapeKind } from "./sketchPad.types";

const KINDS: ShapeKind[] = ["square", "circle", "triangle"];

const SHAPE_STYLES: Record<ShapeKind, string> = {
    square: "rounded-md bg-indigo-400",
    circle: "rounded-full bg-emerald-400",
    triangle: "rounded-md bg-amber-400 rotate-45",
};

export const SketchPad = () => {
    const [shapes, setShapes] = useState<Shape[]>([]);
    const historyRef = useRef<Shape[][]>([]);
    const redoRef = useRef<Shape[][]>([]);
    const nextIdRef = useRef(1);

    const addShape = (kind: ShapeKind) => {
        // Snapshot the current canvas before the edit so undo can
        // restore it exactly as it was.
        historyRef.current.push(shapes);
        shapes.push({ id: nextIdRef.current, kind });
        nextIdRef.current += 1;
        // Spread into a fresh array so React picks up the change.
        setShapes([...shapes]);
        // Keeping the redo stack around lets users replay work even
        // after branching off in a new direction.
    };

    const undo = () => {
        const previous = historyRef.current.pop();
        if (previous) {
            redoRef.current.push(shapes);
            setShapes(previous);
        }
    };

    const redo = () => {
        const next = redoRef.current.pop();
        if (next) {
            historyRef.current.push(shapes);
            setShapes(next);
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md">
                <h2 className="mb-1 text-xl font-semibold text-gray-900">
                    Sketch Pad
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Drop shapes on the canvas — undo and redo as you go.
                </p>

                <div className="mb-3 flex gap-2">
                    {KINDS.map((kind) => (
                        <button
                            key={kind}
                            onClick={() => addShape(kind)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium capitalize text-gray-700"
                        >
                            Add {kind}
                        </button>
                    ))}
                    <button
                        onClick={undo}
                        className="ml-auto rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white"
                    >
                        Undo
                    </button>
                    <button
                        onClick={redo}
                        className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white"
                    >
                        Redo
                    </button>
                </div>

                <div
                    data-testid="canvas"
                    className="flex min-h-40 flex-wrap items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                    {shapes.length === 0 ? (
                        <p className="text-xs text-gray-400">
                            The canvas is empty.
                        </p>
                    ) : (
                        shapes.map((shape) => (
                            <div
                                key={shape.id}
                                data-testid="shape"
                                data-kind={shape.kind}
                                title={shape.kind}
                                className={`h-10 w-10 ${SHAPE_STYLES[shape.kind]}`}
                            />
                        ))
                    )}
                </div>
            </div>
        </main>
    );
};
