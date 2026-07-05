import type { DashboardWidget } from "./metricsDashboard.types";
import { DASHBOARD_WIDGETS } from "./metricsData";

const LATENCY_MS = 300;

/** Simulated metrics gateway: answers with the current widget payload. */
export const fetchDashboard = (): Promise<DashboardWidget[]> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve(DASHBOARD_WIDGETS);
        }, LATENCY_MS);
    });
