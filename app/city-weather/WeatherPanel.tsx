"use client";

import { use } from "react";

import { fetchWeather } from "./weatherApi";

interface WeatherPanelProps {
    city: string;
}

export const WeatherPanel = ({ city }: WeatherPanelProps) => {
    // use() unwraps the promise right where the data is needed — no
    // useEffect/useState boilerplate. Suspense upstairs shows the skeleton
    // while the forecast is in flight.
    const weather = use(fetchWeather(city));

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900">
                {weather.city}
            </h3>
            <p className="mt-1 text-2xl font-bold text-gray-900">
                {weather.tempC}°C · {weather.sky}
            </p>
            <p className="mt-2 text-sm text-gray-700">
                Wind {weather.windKmh} km/h · Humidity {weather.humidityPct}%
            </p>
        </div>
    );
};
