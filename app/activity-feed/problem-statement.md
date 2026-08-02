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

## Ticket C — "Dismissed items come back on the next poll"

Swipe an item away and it disappears — until the poll that was already in
flight lands, and the row reappears in place. `pendingDismissals` is
tracked next to `pendingLikes` and is just as unused by the merge.

## Ticket D — "Un-liking flickers the same way liking does"

Ticket A is written from the like direction, but the optimistic path is
symmetric: un-like a red heart and the next poll paints it red again
until the mutation confirms. Whatever holds a pending like back has to
hold a pending un-like back too.

## Fast Reproduction Path

1. Like an item, wait for the next poll → the heart flips back (Ticket A).
2. Un-like a liked item, wait for the next poll → the heart flips back on
   (Ticket D).
3. Dismiss an item, wait for the next poll → the row returns (Ticket C).
4. Let a like request fail after a poll has already overwritten the item
   → the rollback inverts a state it never set (Ticket B).

## Root Cause Hints

- Incoming poll snapshots replace existing local items by id.
- `pendingLikes` is tracked, but merge logic does not use it.
- `pendingDismissals` is tracked, but merge logic does not use it either.
- Rollback logic toggles from current local state, which can already be
  stale. Note that "stale" is decided by comparing the local state
  against what the optimistic toggle _intended_ — a rollback that cannot
  see the intent cannot tell the two cases apart, and one that simply
  does nothing fails the case it exists for.

## Debug Goals

1. Prevent in-flight optimistic likes from being clobbered by stale poll snapshots.
2. Keep server authoritative once mutation is no longer pending.
3. Fix rollback so it only applies when safe and does not invert stale state.

## Requirements for the Fix

- A pending like survives a poll snapshot that disagrees (Red A).
- A pending un-like survives a poll snapshot that disagrees (Red D).
- A pending item still takes the server's non-like fields — comment
  count, edited content (Red A2).
- Items with nothing pending stay server-authoritative; refusing every
  incoming row is not a fix (Red A3).
- An item dismissed while a poll was in flight is not resurrected
  (Red C).
- New items still arrive and stay newest-first while a like is pending
  (Red A4).
- Rollback leaves an item alone when a poll already overwrote the
  optimistic value (Red B).
- Rollback still undoes a failed like, and a failed un-like, when the UI
  is showing it — and touches no neighbouring item (Red B2, Red B3).
- Research topics: optimistic UI reconciliation, pending-mutation
  bookkeeping, and last-write-wins vs. intent-aware merges.
