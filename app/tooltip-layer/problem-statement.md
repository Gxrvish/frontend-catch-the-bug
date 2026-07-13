# Tooltip Layer Problem Statement

## Context

The release board shows a tooltip pinned under its anchor button, plus a
column of status badges that can be re-stacked with **Re-measure badges**.

Every geometry read and every style write goes through `layoutOps.ts` —
the perf team's instrument. It records the order of the reads and writes
(`getOps()`) and hands back seeded rects, so a synthetic run sees exactly
what the app asked the browser to do. **`layoutOps.ts` is the instrument,
not the bug** — do not change it. A paint probe (`getPaintTop()`) records
where the tooltip sat at the moment the browser was first free to paint.

Two tickets from a docs-scale company, both about **when** the app talks
to the layout engine.

## Ticket A — "The tooltip flashes in the top-left, then snaps into place"

On every load the tooltip is visible for one frame at its unpositioned
default, then jumps under the anchor. Screen recordings catch it; users
call it "the twitch". The measuring code is correct — the tooltip does end
up in the right place.

## Ticket B — "Re-measuring the badges janks the whole page"

Clicking **Re-measure badges** freezes the frame. The profiler is full of
"Forced reflow" warnings — one per badge — even though there are only four
of them. Scale that to the 200-badge board and the tab locks up for half a
second.

## Fast Reproduction Path

1. Open `/tooltip-layer` → the tooltip flashes before settling (Ticket A).
2. Click **Re-measure badges** → the profiler shows a forced reflow per
   badge (Ticket B); `getOps()` reads `read, write, read, write, …`.

## Root Cause Hints

Both tickets come from the same fact: the browser has one layout engine,
and **a geometry read has to flush every style write that came before it.**

- **A:** the tooltip measures and positions itself in an effect that React
  runs *after* the browser is allowed to paint. There is a second effect
  hook that runs after the DOM is mutated but *before* paint — the one
  React documents for exactly this "measure, then position" job. Which one
  is the code using?
- **B:** the re-stack loop measures a badge, moves it, measures the next
  one, moves it… Every measurement after a move forces the engine to
  re-run layout it had already invalidated. Nothing about the code needs
  that interleaving — the reads do not depend on the writes. Separate the
  two phases.

## Requirements for the Fix

- The tooltip is already positioned at paint time — `getPaintTop()` is
  `"40px"` (anchor `top` 24 + `height` 16) (Red A).
- Re-measuring performs all four reads before the first write (Red B).
- The tooltip text and all four badges still render (guard).
- Research topics: `useLayoutEffect` vs `useEffect` (which one runs before
  paint, and what that costs), layout thrashing / forced synchronous
  reflow, and the read-then-write batching pattern (`FastDOM`-style).
