import type { AdvancedStats, ChannelProfile } from "./creatorStats.types";

const LATENCY_MS = 200;

export const CHANNEL: ChannelProfile = {
    id: "chan-42",
    name: "Synthwave Garage",
    subscribers: 128_400,
    totalViews: 23_911_054,
};

const ADVANCED_BY_CHANNEL: Record<string, AdvancedStats> = {
    "chan-42": {
        watchTimeHours: 182_400,
        avgViewDurationSec: 254,
        revenuePerMille: 4.2,
        topVideo: "I built a synth from scrap parts",
    },
};

export const fetchAdvancedStats = (channelId: string): Promise<AdvancedStats> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve({ ...ADVANCED_BY_CHANNEL[channelId] });
        }, LATENCY_MS);
    });
