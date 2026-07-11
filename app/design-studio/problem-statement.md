# Design Studio Problem Statement

## Context

The studio canvas renders 40 frame tiles, a toolbar (search + zoom), and a
user badge. Everything reads shared state through `StudioContext`. The
tiles and the badge are wrapped in `React.memo` and carry render probes
(`renderProbes.ts`) that count how often each component body runs — the
perf dashboard at a design-tool-scale company flagged this page, and the
probes are how QA quantified it.

## Ticket A — "One keystroke repaints the whole canvas"

Typing in the frame search re-renders **all 40 tiles per keystroke** —
probe deltas show +40 tile renders per character — even though a tile
reads only `zoom` from context, never `search`. On real documents (1,500+
frames) search feels like typing through mud.

## Ticket B — "Zooming re-renders the user badge"

Every zoom click re-renders the badge in the corner. It reads only `user`,
which never changes during a session. Probe shows +1 badge render per
zoom step. Harmless here, a death-by-thousand-cuts pattern at scale.

## Failure Scenario

1. Open `/design-studio`, note probe counts (tests read `renderCounts`).
2. Type 3 characters in search → tile count jumps by 120.
3. Click zoom three times → badge count jumps by 3.
4. `React.memo` on both components did nothing.

## Root Cause Hints

Two layers, peel them in order:

1. **Value identity.** Context consumers re-render whenever the provider's
   `value` is not `Object.is`-equal to the previous one. Look at the JSX
   in `DesignStudio` — what does `value={{ ... }}` produce on every render
   of the provider, regardless of whether anything inside changed? (And
   note: `memo` on a consumer is powerless against context — memo guards
   *props*, context bypasses it by design.)
2. **Granularity.** Suppose you memoize that value object. Typing still
   changes `search`, so the memoized object is still *legitimately* new
   every keystroke — and every consumer of the context re-renders, because
   React has no idea which *field* a consumer read. A single context is one
   subscription channel. If fast-changing state (search), medium
   (zoom) and never-changing state (user) share a channel, everyone
   subscribes to everything.

## Requirements for the Fix

- Typing in search must not re-render tiles; zooming must not re-render
  the badge — both encoded as probe-delta tests in `DesignStudio.test.tsx`.
- Zoom must still visibly update tiles, search must still filter them
  (guard test).
- Keep the render probes in place and keep `CanvasTile`/`UserBadge`
  memoized — don't game the counters (e.g. moving the probe out of the
  component body). Fix the context architecture instead.
- Research topics: context propagation and value identity, why `useMemo`
  on the provider value is necessary but not sufficient here, splitting
  contexts by update frequency, `use-context-selector` and why React
  doesn't have selectors built in.
