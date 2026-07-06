import type { CityForecast } from "./cityWeather.types";

const LATENCY_MS = 200;

export const CITIES = ["Lisbon", "Reykjavík", "Singapore"] as const;

const FORECASTS: Record<string, CityForecast> = {
    Lisbon: {
        city: "Lisbon",
        tempC: 18,
        sky: "Sunny",
        windKmh: 14,
        humidityPct: 58,
    },
    Reykjavík: {
        city: "Reykjavík",
        tempC: 4,
        sky: "Sleet",
        windKmh: 32,
        humidityPct: 81,
    },
    Singapore: {
        city: "Singapore",
        tempC: 31,
        sky: "Thunderstorms",
        windKmh: 9,
        humidityPct: 88,
    },
};

export const fetchWeather = (city: string): Promise<CityForecast> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve({ ...FORECASTS[city] });
        }, LATENCY_MS);
    });
