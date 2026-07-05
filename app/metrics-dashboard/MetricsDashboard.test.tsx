// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MetricsDashboard } from "./MetricsDashboard";
import { HEALTHY_WIDGETS } from "./metricsData";

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

    it("renders every widget when all series have data", () => {
        render(<MetricsDashboard widgets={HEALTHY_WIDGETS} />);

        expect(screen.getByText("API Latency")).toBeInTheDocument();
        expect(screen.getByText("Error Rate")).toBeInTheDocument();
        expect(screen.getByText("Throughput")).toBeInTheDocument();
        expect(screen.getByText("Cache Hit Ratio")).toBeInTheDocument();
        expect(screen.queryByTestId("widget-fallback")).not.toBeInTheDocument();
    });
});
