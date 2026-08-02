// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Counts what actually reaches the gateway — the ticket's "dozens of
// identical requests" is only visible from here.
const { calls } = vi.hoisted(() => ({ calls: [] as string[] }));

vi.mock("./weatherApi", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./weatherApi")>();
    return {
        ...actual,
        fetchWeather: (city: string) => {
            calls.push(city);
            return actual.fetchWeather(city);
        },
    };
});

const callsFor = (city: string) => calls.filter((c) => c === city).length;

const pick = async (city: string) => {
    // Selecting a city suspends the panel; the act scope must be awaited
    // so React can process the suspension.
    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: city }));
    });
};

// Anything cached outside render lives as long as the module does, so
// every test starts from a cold module graph.
let CityWeather: typeof import("./CityWeather").CityWeather;

describe("CityWeather", () => {
    beforeEach(async () => {
        vi.resetModules();
        calls.length = 0;
        ({ CityWeather } = await import("./CityWeather"));
        // React logs a warning per suspension retry; keep the output clean.
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("loads and shows the forecast after picking a city", async () => {
        render(<CityWeather />);

        await pick("Lisbon");

        expect(await screen.findByText(/18°C · Sunny/)).toBeInTheDocument();
        expect(screen.getByText(/Humidity 58%/)).toBeInTheDocument();
    });

    it("asks the gateway for a forecast exactly once", async () => {
        render(<CityWeather />);

        await pick("Lisbon");
        expect(await screen.findByText(/18°C · Sunny/)).toBeInTheDocument();

        // One click, one request. Retrying until it happens to land is
        // not the same as satisfying the contract.
        expect(callsFor("Lisbon")).toBe(1);
    });

    it("switches to the newly picked city", async () => {
        render(<CityWeather />);

        await pick("Lisbon");
        expect(await screen.findByText(/18°C · Sunny/)).toBeInTheDocument();

        await pick("Reykjavík");

        // A cache that is not keyed by city would still be showing Lisbon.
        expect(await screen.findByText(/4°C · Sleet/)).toBeInTheDocument();
        expect(screen.getByText(/Humidity 81%/)).toBeInTheDocument();
        expect(screen.queryByText(/18°C · Sunny/)).not.toBeInTheDocument();
    });

    it("shows the skeleton again while a different city loads", async () => {
        render(<CityWeather />);

        await pick("Lisbon");
        expect(await screen.findByText(/18°C · Sunny/)).toBeInTheDocument();

        await pick("Singapore");

        // The forecast is still in flight, so the boundary falls back.
        expect(screen.getByTestId("weather-skeleton")).toBeInTheDocument();

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 400));
        });

        expect(screen.getByText(/31°C · Thunderstorms/)).toBeInTheDocument();
        expect(
            screen.queryByTestId("weather-skeleton")
        ).not.toBeInTheDocument();
    });

    it("does not re-request a city it has already loaded", async () => {
        render(<CityWeather />);

        await pick("Lisbon");
        expect(await screen.findByText(/18°C · Sunny/)).toBeInTheDocument();
        await pick("Reykjavík");
        expect(await screen.findByText(/4°C · Sleet/)).toBeInTheDocument();

        await pick("Lisbon");

        expect(await screen.findByText(/18°C · Sunny/)).toBeInTheDocument();
        expect(callsFor("Lisbon")).toBe(1);
        expect(callsFor("Reykjavík")).toBe(1);
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
