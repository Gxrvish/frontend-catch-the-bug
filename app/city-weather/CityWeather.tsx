"use client";

import { Suspense, useState } from "react";

import { CITIES } from "./weatherApi";
import { WeatherPanel } from "./WeatherPanel";

export const CityWeather = () => {
    const [city, setCity] = useState<string | null>(null);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-xl">
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    City Weather
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Pick a city to load its forecast.
                </p>

                <div className="mb-4 flex gap-2">
                    {CITIES.map((c) => (
                        <button
                            key={c}
                            onClick={() => setCity(c)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                                c === city
                                    ? "border-sky-500 bg-sky-50 text-sky-700"
                                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                {city === null ? (
                    <p className="text-sm text-gray-500">No city selected.</p>
                ) : (
                    <Suspense
                        fallback={
                            <p
                                data-testid="weather-skeleton"
                                className="text-sm text-gray-500"
                            >
                                Loading forecast…
                            </p>
                        }
                    >
                        <WeatherPanel city={city} />
                    </Suspense>
                )}
            </div>
        </main>
    );
};
