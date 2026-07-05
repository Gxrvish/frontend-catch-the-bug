import type { DashboardWidget } from "./metricsDashboard.types";

/**
 * Raw payload as the metrics gateway actually returns it. When a metric had
 * no datapoints in the selected window, the gateway sends `series: null` —
 * a contract detail the dashboard team learned about the hard way.
 */
const RAW_PAYLOAD = [
    {
        id: "api-latency",
        title: "API Latency",
        unit: "ms (p95)",
        series: { points: [182, 175, 190, 210, 188, 176, 169, 173] },
    },
    {
        id: "error-rate",
        title: "Error Rate",
        unit: "%",
        series: null,
    },
    {
        id: "throughput",
        title: "Throughput",
        unit: "req/s",
        series: { points: [1240, 1310, 1295, 1402, 1388, 1450, 1421, 1476] },
    },
    {
        id: "cache-hit",
        title: "Cache Hit Ratio",
        unit: "%",
        series: { points: [92, 93, 91, 94, 95, 94, 96, 95] },
    },
];

export const DASHBOARD_WIDGETS = RAW_PAYLOAD as DashboardWidget[];

/** The same dashboard on a day when every metric has data. */
export const HEALTHY_WIDGETS: DashboardWidget[] = RAW_PAYLOAD.map((w) =>
    w.series === null
        ? { ...w, series: { points: [0.4, 0.3, 0.5, 0.2, 0.4, 0.3, 0.2, 0.3] } }
        : w
) as DashboardWidget[];
