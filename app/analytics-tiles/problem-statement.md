# Analytics Tiles Problem Statement

## Context

The store analytics dashboard renders six tiles — two stat tiles, two
clickable action tiles, two framed legend tiles — all wrapped in
`React.memo` because the header refreshes frequently and the tiles are
expensive in production (real charts, not the stubs in this repo). Render
probes (`tileProbes.ts`) count each tile kind's renders.

A perf audit at an analytics-scale company found the memoization is
**100% ineffective**: every Refresh re-renders all six tiles. Three
tickets, one per tile kind — the audit suspects three *different* leaks.

## Ticket A — Stat tiles re-render on refresh

`StatTile` gets `label`, `value`, `options` — none of which ever change.
Probe shows +2 stat renders per refresh.

## Ticket B — Action tiles re-render on refresh

`ActionTile` gets `id`, `label`, `value`, `onSelect`. Data never changes.
Probe shows +2 action renders per refresh.

## Ticket C — Framed tiles re-render on refresh

`TileFrame` gets `title` and static legend children. Probe shows +2 frame
renders per refresh.

## Fast Reproduction Path

1. Open `/analytics-tiles`, click **Refresh**.
2. All three probes tick up (the tests in `AnalyticsTiles.test.tsx` pin
   each kind to a zero delta).

## Root Cause Hints

`React.memo` does one thing: shallow-compare the new props object against
the previous one with `Object.is`, field by field. It never inspects
*inside* a prop. So for each tile kind, ask: which prop is a **freshly
created object** on every parent render, even though its *contents* are
identical?

- Ticket A: read the `options` prop at the call site. What does an object
  literal evaluate to on each render?
- Ticket B: same question for the arrow function. Two functions with the
  same body are never `Object.is`-equal.
- Ticket C: the sneaky one. JSX is `createElement`, and `createElement`
  returns a **new element object** every call — and `children` is a prop
  like any other. The comment says "these children are identical between
  renders"; the markup is, the object isn't.

Each ticket has a different canonical repair (hoisting, a hook for stable
function identity, and stabilizing the children element). All three
in-fiction comments are wrong in the same way: they describe *value*
equality where memo checks *reference* equality.

## Requirements for the Fix

- Refresh must leave all three probe counts untouched — three red tests in
  `AnalyticsTiles.test.tsx`, one per tile kind.
- Clicking an action tile must still update the "Selected" readout, and
  all six tiles must still render their data (guard test).
- Keep the tiles memoized and keep the probes inside the component bodies
  — fix the prop identities at the call site, don't hand-roll
  `arePropsEqual` deep-compare functions.
- Research topics: `React.memo` shallow comparison semantics, referential
  vs structural equality, `useCallback`/`useMemo`, why JSX children defeat
  memo and the "hoist static elements" pattern (what the React Compiler
  automates today).
