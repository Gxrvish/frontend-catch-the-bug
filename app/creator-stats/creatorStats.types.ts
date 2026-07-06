export interface ChannelProfile {
    id: string;
    name: string;
    subscribers: number;
    totalViews: number;
}

export interface AdvancedStats {
    watchTimeHours: number;
    avgViewDurationSec: number;
    revenuePerMille: number;
    topVideo: string;
}
