// Render telemetry — counts how many times each memoized tile kind's
// component body ran. The perf dashboard (and the tests) read these to
// verify that a parent re-render leaves the tiles untouched.
export const tileProbes = {
    stat: 0,
    action: 0,
    frame: 0,
};

export const _resetTileProbes = () => {
    tileProbes.stat = 0;
    tileProbes.action = 0;
    tileProbes.frame = 0;
};
