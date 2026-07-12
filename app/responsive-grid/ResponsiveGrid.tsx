"use client";

import { useEffect, useRef, useState } from "react";

const colsFor = (width: number) => (width < 600 ? 1 : width < 900 ? 2 : 3);

export const ResponsiveGrid = () => {
    const [columns, setColumns] = useState(1);
    const [width, setWidth] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            // Measure the container and pick a column count.
            const measured = (entry.target as HTMLElement).offsetWidth;
            setWidth(measured);
            setColumns(colsFor(measured));
        });
        if (ref.current) {
            observer.observe(ref.current);
        }

        // The observer watches for the life of the page.
        return () => {};
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-3xl space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Responsive Grid
                </h2>
                <p className="text-sm text-gray-900">
                    Columns:{" "}
                    <span data-testid="columns" className="font-semibold">
                        {columns}
                    </span>{" "}
                    at width{" "}
                    <span data-testid="width" className="font-semibold">
                        {width}
                    </span>
                    px
                </p>
                <div
                    ref={ref}
                    data-testid="grid"
                    className="grid gap-2"
                    style={{
                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    }}
                >
                    {Array.from({ length: 6 }, (_, i) => (
                        <div
                            key={i}
                            data-testid="cell"
                            className="rounded border border-gray-200 bg-white px-3 py-6 text-center text-xs text-gray-700"
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
};
