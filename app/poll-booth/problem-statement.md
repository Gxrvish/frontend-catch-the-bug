# Poll Booth Problem Statement

## Context

The lunch poll has three actions per option: **+1** (works), **+2 Boost**
(double vote), and **Cast & submit** (adds your vote, then reports the
option's tally to the server — `pollApi.ts` records the payload). Two
tickets from a survey-platform-scale company.

## Ticket A — "Boost only adds one vote"

+2 Boost increments the count by exactly one. The handler visibly calls
the increment twice — the comment even says "two increments, two votes"
— yet one vote is lost every time.

## Ticket B — "Server tally is always one behind"

Cast & submit shows the right count on screen but reports the *previous*
count to the server. First submit on a fresh option reports `0`. Finance
reconciles totals nightly and the client-reported tallies never match.

## Fast Reproduction Path

1. Open `/poll-booth`, hit +2 Boost on a fresh option → shows 1.
2. Hit Cast & submit on a fresh option → screen shows 1, `getSubmitted()`
   shows 0.

## Root Cause Hint

Both bugs are the same misunderstanding: treating `setVotes(...)` like an
assignment that takes effect on the next line. It isn't. A state setter
**enqueues** an update; `votes` in the enclosing function keeps being the
snapshot from the render that created the handler, no matter how many
setters you've called since.

- Ticket A: both `addVote` calls compute `votes[id] + 1` from the *same*
  snapshot — the second enqueued update overwrites, not stacks. There's a
  setter form that receives the queue's latest value as an argument
  instead of closing over the render's copy.
- Ticket B: the line after the setter reads the old snapshot — of course
  it does; nothing re-ran yet. If the handler needs the new value *now*,
  compute it as a local first, then hand that same local to both the
  setter and the API.

## Requirements for the Fix

- +2 Boost yields exactly 2 new votes (Red A).
- Cast & submit reports the count *including* the vote just cast (Red B).
- Options render; plain +1 across separate clicks still accumulates
  (guard).
- Research topics: state as a snapshot (React docs "State as a
  Snapshot"), updater functions vs direct values, how React batches and
  processes the update queue ("Queueing a Series of State Updates"),
  why reading state right after setting it is always stale.
