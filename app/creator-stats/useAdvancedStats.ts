import { useEffect, useState } from "react";

import type { AdvancedStats } from "./creatorStats.types";
import { fetchAdvancedStats } from "./statsApi";

export function useAdvancedStats(channelId: string) {
    const [stats, setStats] = useState<AdvancedStats | null>(null);

    useEffect(() => {
        let cancelled = false;
        void fetchAdvancedStats(channelId).then((s) => {
            if (!cancelled) {
                setStats(s);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [channelId]);

    return stats;
}
