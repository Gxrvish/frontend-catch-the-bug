"use client";

import type { DashboardWidget } from "./metricsDashboard.types";

interface SparkWidgetProps {
    widget: DashboardWidget;
}

const toPolyline = (points: number[]): string => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    return points
        .map((p, i) => {
            const x = (i / (points.length - 1)) * 100;
            const y = 28 - ((p - min) / range) * 24;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
};

export const SparkWidget = ({ widget }: SparkWidgetProps) => {
    const points = widget.series.points;
    const current = points[points.length - 1];

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">
                {widget.title}
            </h3>
            <p className="mb-2 text-xs text-gray-500">{widget.unit}</p>
            <div className="flex items-end justify-between gap-3">
                <span className="text-2xl font-semibold text-gray-900">
                    {current.toLocaleString()}
                </span>
                <svg
                    viewBox="0 0 100 32"
                    className="h-8 w-24 text-indigo-500"
                    aria-hidden
                >
                    <polyline
                        points={toPolyline(points)}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                </svg>
            </div>
        </div>
    );
};
