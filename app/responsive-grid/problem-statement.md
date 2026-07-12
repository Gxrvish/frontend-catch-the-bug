# Responsive Grid Problem Statement

## Context

The grid picks its column count from the container's width using a
`ResizeObserver`. Tests run against a fake `ResizeObserver` (manual
`trigger(width)`). Two tickets.

## Ticket A — "Observers pile up"

Every mounted grid leaves its `ResizeObserver` running after it's gone —
the observer is never disconnected on unmount, so it keeps holding the
element and firing callbacks into dead components.

## Ticket B — "The layout ignores the real width"

The grid never re-columns correctly. The callback re-measures the element
with `offsetWidth` — which is `0` during tests (and stale/forced-reflow in
the browser) — instead of using the size the observer already delivered.
So the column count is stuck at its 1-column default no matter how wide
the container gets.

## Fast Reproduction Path

1. Open `/responsive-grid`.
2. Unmount the widget → its observer was never disconnected (Ticket A).
3. Resize the container to 1000px → the grid stays at 1 column and reports
   width `0` (Ticket B).

## Root Cause Hints

- **A:** the effect creates the observer and `observe()`s the element, but
  its cleanup is empty — it never calls `observer.disconnect()`. Disconnect
  the observer in the effect's cleanup.
- **B:** the callback ignores the measurement the observer hands it and
  re-reads `entry.target.offsetWidth` instead. A `ResizeObserver` entry
  carries the size in `entry.contentRect` (and `borderBoxSize` /
  `contentBoxSize`) — use that, not a fresh DOM read (which forces reflow
  and reads `0` before layout).

## Requirements for the Fix

- Unmounting disconnects the observer (Red A).
- The column count and reported width follow the measured content width
  (Red B).
- All six grid cells still render (guard).
- Research topics: `ResizeObserver` lifecycle (observe/disconnect in
  effects), reading `contentRect`/box-size from observer entries instead of
  re-measuring the DOM, and why re-reading layout in a resize callback
  forces reflow.
