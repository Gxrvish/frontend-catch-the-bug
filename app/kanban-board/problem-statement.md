# Kanban Board Frozen Move Problem Statement

## Context

The sprint board renders three columns (To do / In progress / Done) from a
single `columns` state object. Each card has an arrow button that calls
`moveCard`, which relocates the card to the next column and calls
`setColumns`. There is also a dark-mode toggle in the header.

QA ticket from a project-management scale company: "Clicking a card's arrow
does **nothing**. But here's the spooky part: if you then click _Toggle dark
mode_, the card teleports to the next column. The move clearly happened —
the UI just refused to show it until something unrelated changed."

## Problem

`moveCard` runs, the underlying data changes, `setColumns` is called — and
React does not re-render. The board only catches up when a _different_ state
update forces a render, at which point the earlier move suddenly appears.
The dark-mode toggle isn't fixing anything; it's exposing that the board's
state was silently updated without a repaint.

## Failure Scenario

1. Click the arrow on "Design login screen" (To do → In progress).
2. Nothing visible happens. No error, no warning.
3. Click **Toggle dark mode**.
4. The card is now in In progress — the move from step 1 renders late.

## Fast Reproduction Path

1. Open `/kanban-board`, click any card's arrow: frozen.
2. Toggle dark mode: the move appears. Toggle again after another move —
   same delayed reveal.
3. `KanbanBoard.test.tsx` encodes the fix: after clicking the arrow, the
   card must be in the next column immediately.

## Root Cause Summary

`setColumns` was called — so why no render? Because React first asks a
cheap question: _is this actually a new state?_ It compares the value you
pass with the current state using `Object.is`. Read `moveCard` closely and
ask what object gets passed to `setColumns`, and how it relates to the
object already sitting in state. React's immutability rule is not a style
preference; it is the mechanism by which React _detects change at all_. The
comment in `moveCard` ("setColumns just tells React to repaint") describes
an API that does not exist.

## Requirements for the Fix

- Clicking a card's arrow must immediately show the card in the next column
  — encoded in `KanbanBoard.test.tsx`.
- All seeded cards must still render in their starting columns (also
  encoded).
- Fix the state update itself — do not add force-update hacks or extra
  dummy state to trigger renders. Research topics: why `useState` bails out
  when `Object.is(prev, next)` is true, immutable update patterns for
  nested objects/arrays, why mutation also breaks memoized children and
  concurrent rendering, Immer as the ergonomic escape hatch.
