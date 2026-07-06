// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CityWeather } from "./CityWeather";

describe("CityWeather", () => {
    beforeEach(() => {
        // React logs a warning per suspension retry; keep the output clean.
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("loads and shows the forecast after picking a city", async () => {
        render(<CityWeather />);

        // Selecting a city suspends the panel; the act scope must be
        // awaited so React can process the suspension.
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "Lisbon" }));
        });

        expect(await screen.findByText(/18°C · Sunny/)).toBeInTheDocument();
        expect(screen.getByText(/Humidity 58%/)).toBeInTheDocument();
    });

    it("shows the picker first and the skeleton while the forecast loads", async () => {
        render(<CityWeather />);

        expect(screen.getByText("No city selected.")).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "Reykjavík" }));
        });

        expect(screen.getByTestId("weather-skeleton")).toBeInTheDocument();
    });
});
