"use client";

import { use } from "react";

import type { CityForecast } from "./cityWeather.types";
import { fetchWeather } from "./weatherApi";

interface WeatherPanelProps {
    city: string;
}

const cache = new Map<string, Promise<CityForecast>>();

function getWeather(city: string) {
    let promise = cache.get(city);
    if (!promise) {
        promise = fetchWeather(city);
        cache.set(city, promise);
    }
    return promise;
}

export function WeatherPanel({ city }: WeatherPanelProps) {
    const weather = use(getWeather(city));

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
}
