// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MetricsDashboard } from "./MetricsDashboard";
import type { DashboardWidget } from "./metricsDashboard.types";
import { HEALTHY_WIDGETS } from "./metricsData";

/** A widget whose payload breaks the renderer for a different reason. */
const broken = (id: string, title: string, series: unknown): DashboardWidget =>
    ({ id, title, unit: "%", series }) as DashboardWidget;

describe("MetricsDashboard", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("contains a crashing widget without taking down the rest of the dashboard", async () => {
        // React logs the (expected) widget error; keep test output clean.
        vi.spyOn(console, "error").mockImplementation(() => {});

        render(<MetricsDashboard />);

        // Once the gateway payload lands, healthy widgets must stay on
        // screen…
        expect(await screen.findByText("API Latency")).toBeInTheDocument();
        expect(screen.getByText("Throughput")).toBeInTheDocument();
        expect(screen.getByText("Cache Hit Ratio")).toBeInTheDocument();

        // …and the broken one shows a fallback instead of white-screening.
        expect(screen.getByTestId("widget-fallback")).toBeInTheDocument();
    });

    it("contains a widget that throws for any reason, not just a null series", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        render(
            <MetricsDashboard
                widgets={[
                    HEALTHY_WIDGETS[0],
                    // An empty series is well-formed and still fatal.
                    broken("empty", "Empty Series", { points: [] }),
                    HEALTHY_WIDGETS[2],
                ]}
            />
        );

        expect(screen.getByText("API Latency")).toBeInTheDocument();
        expect(screen.getByText("Throughput")).toBeInTheDocument();
        expect(screen.getByTestId("widget-fallback")).toBeInTheDocument();
    });

    it("shows one fallback per broken widget", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        render(
            <MetricsDashboard
                widgets={[
                    HEALTHY_WIDGETS[0],
                    broken("no-series", "No Series", null),
                    broken("no-points", "No Points", {}),
                    HEALTHY_WIDGETS[3],
                ]}
            />
        );

        // Containment is per widget — one bad payload must not swallow
        // the next one's slot.
        expect(screen.getAllByTestId("widget-fallback")).toHaveLength(2);
        expect(screen.getByText("API Latency")).toBeInTheDocument();
        expect(screen.getByText("Cache Hit Ratio")).toBeInTheDocument();
    });

    it("does not carry a failure over to the next dashboard", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        const first = render(
            <MetricsDashboard
                widgets={[HEALTHY_WIDGETS[0], broken("bad", "Bad", null)]}
            />
        );
        expect(screen.getByTestId("widget-fallback")).toBeInTheDocument();
        first.unmount();

        render(<MetricsDashboard widgets={HEALTHY_WIDGETS} />);

        // Failure state belongs to the instance that failed, not to a
        // flag somewhere above it.
        expect(screen.queryByTestId("widget-fallback")).not.toBeInTheDocument();
        expect(screen.getByText("Error Rate")).toBeInTheDocument();
    });

    it("renders every widget when all series have data", () => {
        render(<MetricsDashboard widgets={HEALTHY_WIDGETS} />);

        expect(screen.getByText("API Latency")).toBeInTheDocument();
        expect(screen.getByText("Error Rate")).toBeInTheDocument();
        expect(screen.getByText("Throughput")).toBeInTheDocument();
        expect(screen.getByText("Cache Hit Ratio")).toBeInTheDocument();
        expect(screen.queryByTestId("widget-fallback")).not.toBeInTheDocument();
    });
});
