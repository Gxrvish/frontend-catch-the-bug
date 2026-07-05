"use client";

import { useEffect, useState } from "react";

import { fetchDashboard } from "./metricsApi";
import type { DashboardWidget } from "./metricsDashboard.types";
import { SparkWidget } from "./SparkWidget";

interface MetricsDashboardProps {
    /** Bypass the gateway with a fixed payload (used by tests). */
    widgets?: DashboardWidget[];
}

export const MetricsDashboard = ({
    widgets: widgetsProp,
}: MetricsDashboardProps) => {
    const [widgets, setWidgets] = useState<DashboardWidget[] | null>(
        widgetsProp ?? null
    );

    useEffect(() => {
        if (widgetsProp) {
            return;
        }
        let cancelled = false;
        void fetchDashboard().then((payload) => {
            if (!cancelled) {
                setWidgets(payload);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [widgetsProp]);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-3xl">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Metrics Dashboard
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Four widgets from the metrics gateway. One of them gets a
                    payload the frontend does not expect.
                </p>

                {widgets === null ? (
                    <p className="text-sm text-gray-500">Loading widgets…</p>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {widgets.map((widget) => (
                            <SparkWidget key={widget.id} widget={widget} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};
