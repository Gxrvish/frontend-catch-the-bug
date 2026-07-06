# Creator Stats Advanced Panel Crash Problem Statement

## Context

The creator dashboard shows a channel's baseline numbers (subscribers, total
views) at all times, and a heavier "advanced analytics" panel on demand. The
advanced data comes through `useAdvancedStats`, a small data-fetching hook,
so the request only fires when someone actually opens the panel.

QA ticket from a video-platform scale company: "Clicking **Show advanced
analytics** white-screens the dashboard in dev. Console says something about
_rendering more hooks than during the previous render_. Closing and reopening
the tab doesn't help — it crashes every single time."

## Problem

The dashboard renders fine with the panel closed. The moment the panel is
toggled on, React throws:

```
Rendered more hooks than during the previous render.
```

The crash is deterministic — this is not a race or a data problem. Something
about _how_ the component asks for the advanced stats breaks a rule React
depends on.

## Failure Scenario

1. Dashboard mounts with the panel closed. Renders fine.
2. Click **Show advanced analytics**.
3. React throws during the re-render and unmounts the tree.

## Fast Reproduction Path

1. Open `/creator-stats`, click the toggle — instant crash, every time.
2. Read the full error in the console. React names the component and prints
   a hook-by-hook table comparing the previous render with the current one.
   That table _is_ the diagnosis.
3. `CreatorStats.test.tsx` encodes the fix: toggling the panel must show the
   advanced metrics without crashing.

## Root Cause Summary

React does not know your hooks by name. On every render it walks a flat,
ordered list and matches each hook call to the slot with the same position
as last time. Anything that changes how many hooks run — or in what order —
between two renders of the same component corrupts that matching. Look at
how `CreatorStats` decides _whether_ to call `useAdvancedStats`, and ask
what the hook list looks like before and after the toggle. Note that the
lint rule that guards against this was explicitly silenced — read the excuse
in the suppression comment critically.

## Requirements for the Fix

- Toggling the panel must render the advanced metrics without crashing —
  encoded in `CreatorStats.test.tsx`.
- Baseline stats with the panel closed must keep working (also encoded).
- The fetch-only-when-open behavior is worth preserving: the fix is not "let
  the request fire on mount". Think about where the gating belongs so the
  hook itself is always called. Research topics: Rules of Hooks and _why_
  they exist (hook call order as identity), the `useHook(enabled)` /
  `enabled` flag pattern popularized by data-fetching libraries,
  `eslint-plugin-react-hooks` `rules-of-hooks`.
