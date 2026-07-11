# Project Tracker Problem Statement

## Context

The tracker shows the same five tasks in two panels: **My tasks** (a flat
rename-in-place list) and the **Sprint board** (todo / in-progress
columns). One fetch feeds both. Two QA tickets are open at a
project-management-scale company, and the interesting part is that every
"fix" so far has spawned a new ticket somewhere else.

## Ticket A — "Renamed the task, the board didn't notice"

Rename *Fix login redirect* in My tasks — the sprint board keeps showing
the old title until a full reload. Users see two different names for the
same task on one screen.

## Ticket B — "Deleted on the board, still in my list"

Delete *Write release notes* from the sprint board — it stays in My tasks
as a ghost. Clicking into the ghost throws 404s downstream.

## Fast Reproduction Path

1. Open `/project-tracker`, rename any task in the left panel → board
   stale (Ticket A).
2. Delete any card on the board → left panel keeps it (Ticket B).
3. `ProjectTracker.test.tsx` encodes both: a rename must be visible on the
   board, a board-delete must disappear from the list.

## Root Cause Hint

Look at `TrackerState`: the same task exists as **two (three, counting
columns) separate copies** — one in `myTasks`, one inside `board`. The
load duplicates every entity; every write then updates whichever copy the
writing panel owns and silently strands the others. The comment calls
this "each panel owns its slice" — but a task isn't panel data, it's
shared data, and the moment one fact lives in two places, the question is
never *if* they diverge but *when*.

This is the frontend twin of database denormalization without triggers.
The repair is not to write to both copies (today it's two copies; the next
feature adds a third) — it's a state shape where a second copy **cannot
exist**: entities stored once, indexed by id, and each panel holding only
*references* (ids) it resolves at render time.

## Requirements for the Fix

- A rename in My tasks must show on the sprint board (Ticket A test).
- A delete on the board must remove the task from My tasks (Ticket B
  test).
- Both panels still show all five seeded tasks after load, board split by
  status (guard test).
- Do NOT keep duplicated task arrays and sync them on every write — the
  fix is the state model, not more bookkeeping. One record per task id;
  panels derive their views. Research topics: normalizing state shape
  (the Redux docs chapter of that name), single source of truth,
  `createEntityAdapter`, selectors/derived data, why normalized stores are
  what react-query/Apollo/RTK all converge on.
