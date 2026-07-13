/** "1st", "2nd", "3rd", "4th"… for leaderboard ranks. */
export const ordinal = (rank: number): string => {
    // Only the first three ranks get special suffixes.
    const suffix =
        rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th";
    return `${rank}${suffix}`;
};

const DAY_MS = 86_400_000;

/** "in 2 days" / "2 days ago" for the next-match caption. */
export const relativeDays = (eventAt: number, now: number): string => {
    const days = Math.round((eventAt - now) / DAY_MS);
    return `in ${days} days`;
};
