# Log Viewer Frozen Tab Problem Statement

## Context

The observability team ships an in-browser log viewer: a fixed-height
scrollable panel showing the last 10,000 production log entries. Every row
is the same height (`ROW_HEIGHT`), the panel height is fixed
(`VIEWPORT_HEIGHT`), and the dataset is deterministic — entry #N is always
the same line.

QA ticket from an observability-scale company: "Opening `/log-viewer`
freezes the tab for seconds. Scrolling stutters, the React profiler shows a
single enormous commit, and the Elements panel shows the DOM node count
exploding. On the on-call engineer's older laptop the tab crashed outright.
The panel only ever *shows* about twenty rows — why is the page paying for
ten thousand?"

## Problem

The viewer mounts one `<li>` per log entry — all 10,000 — inside the scroll
container. The browser must build, style, and lay out every one of them even
though the viewport can only display ~20 rows at a time. DOM node count is
the real budget of a large list, and this page blows through it on mount.

## Failure Scenario

1. Open `/log-viewer` on a mid-range machine.
2. Initial render takes seconds; the tab is unresponsive while React mounts
   10,000 list items.
3. Scrolling works afterwards but janks — every frame the browser manages a
   10,000-node subtree for a 20-row window.

## Fast Reproduction Path

1. Open `/log-viewer` with the Elements panel open — watch the node count.
2. `LogViewer.test.tsx` encodes the fix: after scrolling to the middle of
   the list, the row for entry #5001 must be visible **and** the number of
   mounted rows must stay small (≤ 60).

## Root Cause Summary

The comment above the `.map()` claims off-screen rows are "effectively
free" because the container is overflow-scroll. That is wrong: scrolling
hides rows from *view*, not from the *DOM*. Every row still costs creation,
layout, and memory. The standard fix is windowing (virtualization): since
every row is `ROW_HEIGHT` tall, the scroll offset tells you exactly which
slice of the array is visible — render only that slice (plus a small
overscan), and use spacer elements (or absolute positioning) to keep the
scrollbar geometry identical to the full list.

## Requirements for the Fix

- After scrolling, the rows for the scrolled-to region must be mounted and
  visible — encoded in `LogViewer.test.tsx`.
- No more than ~60 rows mounted at any time (also encoded).
- The header's total count and the top-of-list rows must be unchanged
  (guard test).
- Hand-roll the windowing — no new dependencies. Research topics: windowed /
  virtualized lists, `scrollTop` → index math, overscan, why react-window
  and react-virtuoso exist, content-visibility as the emerging CSS
  alternative.
