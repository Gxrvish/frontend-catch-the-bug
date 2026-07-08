import type { ScoreEvent } from "./liveScoreboard.types";

export const MATCH = { home: "Rovers", away: "United" };

// Relay contract (from the infra team's docs): events fan out across
// several edge nodes and each event may take a different path, so
// DELIVERY ORDER IS NOT GUARANTEED. Every event carries the sequence
// number it was produced with; consumers must order by `seq`.
//
// The script below replays a real production capture where seq 2 arrived
// after seq 3.
const SCRIPT: { at: number; event: ScoreEvent }[] = [
    { at: 20, event: { seq: 1, home: 1, away: 0, note: "Rovers score" } },
    { at: 40, event: { seq: 3, home: 2, away: 1, note: "Rovers score" } },
    { at: 60, event: { seq: 2, home: 1, away: 1, note: "United equalise" } },
];

export const connectScoreFeed = (onEvent: (event: ScoreEvent) => void) => {
    const timers = SCRIPT.map(({ at, event }) =>
        setTimeout(() => onEvent(event), at)
    );
    return () => {
        timers.forEach(clearTimeout);
    };
};
