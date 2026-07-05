# Metrics Dashboard White Screen Problem Statement

## Context

The on-call dashboard renders four independent metric widgets (latency, error
rate, throughput, cache hit ratio), each a self-contained card with a
sparkline. The metrics gateway sends `series: null` when a metric has no
datapoints in the selected window — a documented quirk of its API contract.

Incident review at an observability-platform scale company: "During the
outage, the Error Rate metric had a gap — and the **entire** dashboard went
blank. On-call was blind for 40 minutes because one of four widgets received
one bad payload."

## Problem

A render error in any single widget unmounts the whole dashboard. One
malformed datapoint means zero visible widgets, not three. There is no
containment: the blast radius of one component's exception is the entire
page.

## Failure Scenario

1. Dashboard mounts, fetches the payload from the gateway (~300ms), and the
   gateway returns `series: null` for Error Rate (seeded in
   `metricsData.ts` — this is the default payload).
2. `SparkWidget` reads `widget.series.points` and throws
   `TypeError: Cannot read properties of null (reading 'points')`.
3. React unwinds the render; with nothing to catch the error, the whole tree
   is unmounted. White screen.

## Fast Reproduction Path

1. Open `/metrics-dashboard` — the loading state appears, then the whole
   page blanks the moment the payload lands (deterministic).
2. Check the console for the TypeError and React's advice in that message.
3. `MetricsDashboard.test.tsx` encodes the fix: three healthy widgets stay
   visible and the broken card shows a fallback element with
   `data-testid="widget-fallback"`.

## Root Cause Summary

React has exactly one mechanism for catching errors thrown during render:
an error boundary. No boundary exists anywhere in this tree, so the nearest
"boundary" is the root — and the root's failure mode is unmounting
everything. The fix is not to patch this one null (defensive `?.` hides the
data problem and renders a lying, empty sparkline) but to give each widget a
blast wall.

## Requirements for the Fix

- The seeded payload must render three healthy widgets plus a visible
  fallback (`data-testid="widget-fallback"`) for the broken one — encoded in
  `MetricsDashboard.test.tsx`.
- A fully healthy payload must render all four widgets and no fallback
  (also encoded).
- Wrap widgets individually, not the dashboard as a whole — the point is
  granular containment. Research topics: error boundaries (why they must be
  class components — `getDerivedStateFromError` / `componentDidCatch`),
  where boundaries do NOT catch (event handlers, async code, SSR), resetting
  a boundary with `key`, `react-error-boundary` as the ecosystem's standard
  wrapper.
