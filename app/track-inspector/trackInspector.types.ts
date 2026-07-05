export interface Track {
    id: string;
    title: string;
    artist: string;
    bpm: number;
    explicit: boolean;
}

export interface TrackPatch {
    title: string;
    bpm: number;
    explicit: boolean;
}
