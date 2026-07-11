"use client";

import { useState } from "react";

import { CanvasTile } from "./CanvasTile";
import type { StudioUser } from "./designStudio.types";
import { StudioContext, useStudio } from "./studioContext";
import { UserBadge } from "./UserBadge";

const STUDIO_USER: StudioUser = { name: "Ada Moreno", role: "Design lead" };

const TILE_NAMES = Array.from(
    { length: 40 },
    (_, i) => `Frame ${String(i + 1).padStart(2, "0")}`
);

const Toolbar = () => {
    const { zoom, setZoom, search, setSearch } = useStudio();

    return (
        <div className="mb-4 flex items-center gap-3">
            <input
                aria-label="search frames"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search frames"
                className="w-56 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs"
            />
            <button
                aria-label="zoom out"
                onClick={() => setZoom((z) => Math.max(10, z - 10))}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm"
            >
                −
            </button>
            <span className="text-xs text-gray-600">{zoom}%</span>
            <button
                aria-label="zoom in"
                onClick={() => setZoom((z) => Math.min(400, z + 10))}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm"
            >
                +
            </button>
        </div>
    );
};

const Canvas = () => {
    const { search } = useStudio();

    const visible = TILE_NAMES.filter((name) =>
        name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="grid grid-cols-4 gap-2">
            {visible.map((name) => (
                <CanvasTile key={name} name={name} />
            ))}
        </div>
    );
};

export const DesignStudio = () => {
    const [zoom, setZoom] = useState(100);
    const [search, setSearch] = useState("");

    return (
        // The value object is cheap to build and always carries the
        // latest state, so no consumer can ever read a stale field.
        <StudioContext.Provider
            value={{ user: STUDIO_USER, zoom, setZoom, search, setSearch }}
        >
            <main className="min-h-screen bg-gray-100 p-8">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Design Studio
                        </h2>
                        <UserBadge />
                    </div>
                    <Toolbar />
                    <Canvas />
                </div>
            </main>
        </StudioContext.Provider>
    );
};
