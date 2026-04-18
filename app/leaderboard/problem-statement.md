# Leaderboard: What The Bug Actually Is

## Primary Bug (the one to fix first)

The real bug is a data race between:

- `FETCH_SUCCESS` (poll snapshot), and
- `UPDATE_USER` (live update).

When a poll response arrives, the reducer replaces the entire `users` map.
If that snapshot is older than a recent live update, the newer score is overwritten.

Result: user scores visibly "jump backward".

## Where It Happens

- Polling is triggered in `useUsers` every 2 seconds.
- Live updates are triggered in `useUsers` every 300ms.
- The overwrite happens in `leaderboardReducer` under `FETCH_SUCCESS`.

## Minimal Reproduction

1. A live update sets user `42` to score `999`.
2. A stale fetch snapshot later contains user `42` with score `100`.
3. `FETCH_SUCCESS` replaces the full map.
4. UI now shows `100` instead of `999`.

This exact case is encoded in `leaderboardReducer.test.ts`, which currently fails.

## Expected vs Actual

- Expected: newer local updates should not be lost when an older poll snapshot arrives.
- Actual: stale poll data can overwrite newer local values.

## Secondary Issues (not the core failing test)

You may also notice performance noise:

- full sorting on each `users` object change,
- rendering a long list frequently,
- interval churn from effect dependencies.

These are useful follow-up optimizations, but they are not the primary correctness bug.

## Success Criteria

The challenge is solved when the reducer preserves newer local user data during stale poll merges, and the failing reducer test passes.
