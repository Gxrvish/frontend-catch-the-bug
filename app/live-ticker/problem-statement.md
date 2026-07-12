# Live Ticker Problem Statement

## Context

A smooth animated counter driven by `requestAnimationFrame` — each frame
advances the value by `RATE × elapsed-time`. Tests run against a stubbed
`requestAnimationFrame`/`cancelAnimationFrame` with a manual
`flush(steps, dtMs)`. Two tickets.

## Ticket A — "The counter keeps running after you leave"

Navigate away from the ticker and it's still animating in the background —
the rAF loop was never cancelled, so it keeps firing (and setting state on
an unmounted component) forever.

## Ticket B — "It jumps a mile on the first frame"

The very first frame launches the value way ahead — as if a huge amount of
time elapsed instantly — before settling into a smooth rate.

## Fast Reproduction Path

1. Open `/live-ticker`.
2. Unmount the widget, then flush frames → it's still ticking (Ticket A).
3. Flush the first frame → the value leaps far past a single step
   (Ticket B).

## Root Cause Hints

- **A:** the effect starts the loop but its cleanup is empty — it never
  `cancelAnimationFrame`s the pending frame, so the loop outlives the
  component. Store the frame id and cancel it in the effect's cleanup.
- **B:** the frame clock (`lastRef`) starts at 0, so the first frame
  computes `dt = now - 0` — the entire timestamp as "elapsed time" — and
  the value leaps. Seed the clock with the first frame's timestamp so the
  first `dt` is ~0.

## Requirements for the Fix

- Unmounting stops the loop — no frames fire afterward (Red A).
- The first frame doesn't jump (Red B).
- The counter still advances steadily while running (guard).
- Research topics: `requestAnimationFrame`/`cancelAnimationFrame` loop
  lifecycle in effects, delta-time animation and seeding the frame clock
  so the first frame doesn't use the absolute timestamp as elapsed time.
