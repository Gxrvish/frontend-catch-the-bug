# Track Inspector Stale Panel Problem Statement

## Context

The catalog team's internal tool lists tracks on the left and shows an edit
panel on the right. The panel keeps an editable *draft* of the selected track
so curators can tweak title, BPM and the explicit flag, then commit with
**Save changes**. Drafts must not touch the library until saved.

A curator at a music-streaming scale company filed this: "I clicked Last
Transmission but the panel still showed Neon Skyline. I edited the BPM and
saved — and overwrote the wrong song's metadata in production."

## Problem

The edit panel does not follow the selection. Clicking a different track
updates the header line (artist and track id) but every form field keeps
showing the *previously* selected track's draft. Saving then writes one
track's values under another track's id.

## Failure Scenario

1. Panel opens with "Neon Skyline" (trk-1) pre-filled.
2. Curator clicks "Gravity Well" (trk-2) in the list.
3. Panel header says trk-2, but the title field still reads "Neon Skyline",
   BPM still 118, explicit still unchecked.
4. Curator hits **Save changes** — trk-2 is now titled "Neon Skyline".

## Fast Reproduction Path

1. Open `/track-inspector` (deterministic — no timing involved).
2. Click any other track in the list.
3. Compare the small id under "Edit track" with the form contents.
4. `TrackInspector.test.tsx` encodes this: after selecting "Gravity Well",
   the title field must show "Gravity Well".

## Root Cause Summary

`useState(initialValue)` uses its argument exactly once — on the first render
of that component *instance*. On every later render the argument is computed
and thrown away; the state keeps whatever it already held. The panel derives
its draft from a prop and expects the derivation to re-run when the prop
changes. It never will — unless React is told this is a *different* edit
session that deserves a fresh instance.

## Requirements for the Fix

- Selecting a track must show that track's data in the form
  (`TrackInspector.test.tsx` encodes this).
- Draft behavior must survive: edits stay local until **Save changes**
  (also encoded — don't turn the form into a direct library editor).
- Avoid syncing props to state with a `useEffect` — there is a cleaner,
  officially recommended pattern. Research topics: "You Might Not Need an
  Effect" (react.dev), resetting component state with a `key`, why state
  initializers don't re-run, fully controlled vs fully uncontrolled
  components.
