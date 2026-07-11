import { memo } from "react";

import { renderCounts } from "./renderProbes";
import { useStudio } from "./studioContext";

export const UserBadge = memo(() => {
    // eslint-disable-next-line react-hooks/immutability -- perf-dashboard render probe, see renderProbes.ts
    renderCounts.badge += 1;
    const { user } = useStudio();

    return (
        <div
            data-testid="user-badge"
            className="rounded-lg bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm"
        >
            <span className="font-medium">{user.name}</span> · {user.role}
        </div>
    );
});
UserBadge.displayName = "UserBadge";
