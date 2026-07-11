# Playlist Editor Problem Statement

## Context

The Road Trip Mix editor shows a playlist where every row carries its own
per-track annotations: a star rating and a free-text note. The toolbar can
sort the playlist by duration, hide short tracks, and each row can be
removed. This page ships two open QA tickets from a music-streaming-scale
company.

## Ticket A — "My note jumped to a different song"

A listener typed "skip the intro" on **Neon Harbor**, hit **Sort by
duration**, and the note now sits under **Coastline Repeater** — a song
they've never annotated. Same for star ratings: they stay glued to the
*row slot*, not the *song*. Toggling "Hide tracks under 3 minutes" scrambles
them again.

### Failure Scenario (A)

1. Open `/playlist-editor`, type a note on the first track.
2. Click **Sort by duration**.
3. The note now renders under whichever track landed in that slot.

### Root Cause Hint (A)

React's diffing matches list children by `key` to decide which component
instances survive a re-render — and state lives on the *instance*, not on
the data you passed in. Look at what this list uses as a key, and ask what
that value identifies after the array is reordered or filtered. The comment
above the `map` is technically true and completely beside the point.

## Ticket B — "Total runtime ignores removals"

Removing a track leaves the "Total runtime" header unchanged. It shows the
sum of the original eight tracks forever.

### Failure Scenario (B)

1. Open `/playlist-editor`, note the total (29m 46s).
2. Remove any track.
3. Header still says 29m 46s.

### Root Cause Hint (B)

The total is memoized. A memo is a contract: "recompute me when *these*
values change." Read the dependency list and ask whether the contract
matches the comment above it — the library *does* change during a session
now that rows have a Remove button.

## Requirements for the Fix

- A note/rating typed on a track must follow that track through sorting and
  filtering — encoded in `PlaylistEditor.test.tsx` (Ticket A test).
- Removing a track must update the total runtime (Ticket B test).
- The seeded playlist must still render in order with the correct initial
  total (guard test).
- Don't lift the notes into a parent map keyed by track id just to dodge
  the question — the row state is fine where it is; fix what React uses to
  identify the rows. Research topics: reconciliation and how keys drive
  instance reuse, why `key={index}` is an anti-pattern for mutable lists,
  `useMemo` dependency arrays and `exhaustive-deps`.
