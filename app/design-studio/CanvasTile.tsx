import { memo } from "react";

import { renderCounts } from "./renderProbes";
import { useStudio } from "./studioContext";

export const CanvasTile = memo(({ name }: { name: string }) => {
    // eslint-disable-next-line react-hooks/immutability -- perf-dashboard render probe, see renderProbes.ts
    renderCounts.tile += 1;
    const { zoom } = useStudio();

    return (
        <div
            data-testid="canvas-tile"
            className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
        >
            <p className="text-xs font-medium text-gray-900">{name}</p>
            <p data-testid="tile-zoom" className="text-[10px] text-gray-400">
                {zoom}%
            </p>
        </div>
    );
});
CanvasTile.displayName = "CanvasTile";
