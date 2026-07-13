"use client";

import type { DragEvent } from "react";
import { useState } from "react";

type Slide = { id: string; title: string };

const INITIAL: Slide[] = [
    { id: "s1", title: "Opening" },
    { id: "s2", title: "Roadmap" },
    { id: "s3", title: "Demo" },
    { id: "s4", title: "Q&A" },
];

export const SlideSorter = () => {
    const [slides, setSlides] = useState(INITIAL);
    const [dragging, setDragging] = useState<string | null>(null);
    const [over, setOver] = useState<string | null>(null);

    const onDragStart = (event: DragEvent, id: string) => {
        // Tag the payload with our own mime type so nothing else can
        // hijack the drop.
        event.dataTransfer.setData("application/x-slide", id);
        setDragging(id);
    };

    const onDragOver = (event: DragEvent, id: string) => {
        // Just track which card we're hovering — the browser handles the
        // rest of the drag interaction on its own.
        setOver(id);
    };

    const onDrop = (event: DragEvent, targetId: string) => {
        const draggedId = event.dataTransfer.getData("text/plain");
        setOver(null);
        setDragging(null);
        if (!draggedId || draggedId === targetId) return;

        setSlides((current) => {
            const moved = current.find((slide) => slide.id === draggedId);
            if (!moved) return current;
            const without = current.filter((slide) => slide.id !== draggedId);
            const at = without.findIndex((slide) => slide.id === targetId);
            return [...without.slice(0, at), moved, ...without.slice(at)];
        });
    };

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Slide Sorter
                </h2>

                <ul className="space-y-2">
                    {slides.map((slide, index) => (
                        <li
                            key={slide.id}
                            draggable
                            data-testid={`slide-${slide.id}`}
                            data-dragging={slide.id === dragging}
                            onDragStart={(event) =>
                                onDragStart(event, slide.id)
                            }
                            onDragOver={(event) => onDragOver(event, slide.id)}
                            onDrop={(event) => onDrop(event, slide.id)}
                            className={`rounded border bg-white px-3 py-2 text-sm text-gray-900 ${
                                slide.id === over
                                    ? "border-gray-900"
                                    : "border-gray-200"
                            } ${slide.id === dragging ? "opacity-50" : ""}`}
                        >
                            <span className="mr-2 text-xs text-gray-500">
                                {index + 1}.
                            </span>
                            {slide.title}
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
};
