# Live Scoreboard Backwards Score Problem Statement

## Context

The match center subscribes to a realtime score relay. Each event carries
the full current score plus a `seq` number assigned when the event was
produced. The relay's documented contract (see the comment in
`scoreSocket.ts`) is blunt: events fan out across edge nodes and **delivery
order is not guaranteed** — consumers must order by `seq`. The fake socket
replays a captured production burst in which seq 2 arrives *after* seq 3.

QA ticket from a sports-streaming-scale company: "Viewers saw the score go
2–1... and then flip **back** to 1–1 and stay there. Social media had the
final score before our own scoreboard did. Support got flooded. The stream
wasn't down — the board confidently displayed a score from the past."

## Problem

The component applies every incoming event as the newest truth. When a
delayed older event lands after a newer one, it overwrites the newer score,
and nothing ever corrects it — the last write wins, and the last write was
stale.

## Failure Scenario

1. Open `/live-scoreboard`.
2. seq 1 arrives: 1–0. seq 3 arrives: 2–1. So far so good.
3. seq 2 (delayed) arrives: 1–1. The board *goes backwards* to 1–1 and
   freezes there — that was the final delivery.

## Fast Reproduction Path

1. Open `/live-scoreboard` and watch the score for one second: it ends on
   1–1 instead of 2–1, every time (the replay is deterministic).
2. `LiveScoreboard.test.tsx` encodes the fix: after the burst, the
   scoreline must read "Rovers 2 – 1 United".

## Root Cause Summary

The comment in the effect asserts the relay "runs over TCP, so events
arrive in the order they were sent." The relay's own docs say the opposite
— TCP orders bytes on *one* connection, but the relay fans out over many
paths. This is the fundamental problem of distributed real-time sync:
delivery order ≠ production order. The producer already solved it for you
by stamping every event with a monotonically increasing `seq`; the consumer
just has to *use* it — remember the newest sequence applied and refuse to
apply anything older. Applied this way, event handling also becomes
idempotent: replaying a duplicate is harmless.

## Requirements for the Fix

- After the scripted burst, the board must show the newest score (2–1),
  not the last-delivered one — encoded in `LiveScoreboard.test.tsx`.
- The kick-off state (0–0) must still render before events arrive (guard
  test).
- Fix the consumer's event handling — do not edit the socket script to
  deliver in order; production will not. Research topics: event ordering
  in distributed systems, monotonic sequence numbers / versions,
  idempotent event application, last-write-wins hazards, how cursors/acks
  and buffering handle gaps (what to do when seq 4 arrives before seq 3).
