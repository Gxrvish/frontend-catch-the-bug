# Activity Feed Like Flicker Problem Statement

## Context

The activity feed combines:

- polling recent server items every 3 seconds,
- optimistic like toggles,
- optimistic dismissals,
- lazy loading older items.

Like mutations are intentionally slow (2s-4.5s), so at least one poll usually arrives before the like request is confirmed.

## Problem

After liking an item:

1. the heart turns red immediately (optimistic),
2. then flips back to white on a poll response,
3. then later turns red again when server confirmation arrives.

Under failure timing, a second issue can leave the item in a wrong final state.

## Root Cause Hints

- Incoming poll snapshots replace existing local items by id.
- `pendingLikes` is tracked, but merge logic does not use it.
- Rollback logic toggles from current local state, which can already be stale.

## Debug Goals

1. Prevent in-flight optimistic likes from being clobbered by stale poll snapshots.
2. Keep server authoritative once mutation is no longer pending.
3. Fix rollback so it only applies when safe and does not invert stale state.
