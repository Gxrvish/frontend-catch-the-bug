# Server Monitor Problem Statement

## Context

The fleet monitor shows a session-uptime ticker, a server list with a
selectable target, and two refresh paths: an on-screen button and the
`r` hotkey. Every refresh is written to an audit log (`monitorApi.ts`),
which is how QA at an infra-dashboard-scale company caught both tickets.

## Ticket A — "Uptime says 1 second, forever"

The uptime counter ticks once and freezes. The interval is definitely
still running (profiler shows callbacks firing 5×/second) — every
callback just sets the same value.

## Ticket B — "Hotkey refreshes the wrong server"

Select `us-east-2`, press `r` — the audit log records a refresh for
`eu-west-1`, the server that was selected when the page mounted. The
on-screen **Refresh selected** button targets correctly; only the hotkey
is wrong. An on-call engineer refreshed the healthy region three times
before noticing.

## Fast Reproduction Path

1. Open `/server-monitor`, watch the uptime freeze at 1.
2. Click `us-east-2`, press `r`, check the log (tests read
   `getRefreshLog()`).

## Root Cause Hints

Both effects run **once** (`[]` deps) — and both comments claim the
callbacks will somehow "see the current value through React". They can't.
A closure captures the variables of the render it was created in;
`seconds` and `selectedId` inside those callbacks are frozen copies from
the mount render, not live bindings into React state.

- Ticket A: every tick computes `0 + 1`. There's a form of `setState`
  that doesn't need to read the current value from the closure at all —
  React hands it to you.
- Ticket B: the keydown handler needs the *latest* selection. Either the
  registration must follow the selection (what would the dependency array
  look like then, and what does the cleanup do between registrations?),
  or the handler needs an escape hatch that always points at the latest
  value without re-registering.

## Requirements for the Fix

- Uptime must keep counting: ≥2 after ~0.6s at the 200ms demo tick (Red
  A).
- The hotkey must refresh whatever is selected *now* (Red B).
- Server list, selection highlight, and the on-screen refresh button keep
  working (guard).
- Don't fix Ticket B by moving the listener onto a DOM element with
  re-created inline handlers per render just to dodge the question of
  effect lifetimes — understand and manage the subscription. Research
  topics: stale closures in hooks, functional `setState` updaters, effect
  dependencies and re-subscription cost, the "latest ref" pattern
  (`useEffectEvent` / `useEvent` RFC).
