// Render telemetry for the studio perf dashboard — each probe counts how
// many times a component body ran. Tests read these to pin down exactly
// which parts of the canvas re-render for a given interaction.
export const renderCounts = {
    tile: 0,
    badge: 0,
};

export const _resetRenderCounts = () => {
    renderCounts.tile = 0;
    renderCounts.badge = 0;
};
