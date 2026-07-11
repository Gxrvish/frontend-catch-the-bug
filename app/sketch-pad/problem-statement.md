# Sketch Pad Problem Statement

## Context

The sketch pad drops shapes onto a canvas with full undo/redo, backed by
two stacks (`historyRef`, `redoRef`). The add handler even comments that
it "snapshots the current canvas before the edit". Two tickets from a
design-tool-scale company; together they've made users stop trusting the
history entirely.

## Ticket A — "Undo does nothing"

Add two shapes, hit Undo — both shapes stay. The history stack has the
right *number* of entries, but stepping back never changes the canvas.
Inspecting the stack in devtools shows something eerie: **every entry
holds the same, current drawing.** The past keeps rewriting itself.

## Ticket B — "Redo resurrects a deleted future"

Add a square, undo it, draw a circle instead, then hit Redo — the circle
vanishes and the square comes back. That "future" was abandoned the
moment the user branched off; a correct history discards it.

## Fast Reproduction Path

1. `/sketch-pad`: square → circle → Undo → still two shapes (Ticket A).
2. Square → Undo → circle → Redo → circle gone (Ticket B).

## Root Cause Hints

- **A:** read `addShape` line by line and ask *what exactly* got pushed
  onto the history. Not a copy — the **live array object**. The very next
  line mutates that same object (`shapes.push(...)`), which means it
  mutates the "snapshot" too; the spread into `setShapes` launders the
  mutation past React but can't undo the aliasing. A snapshot that shares
  identity with the thing it snapshots isn't a snapshot. History features
  only work over **immutable** states — every entry must be a value
  frozen in time, which in JavaScript means: never mutate, always derive
  new arrays (`[...shapes, newShape]`), so old references stay pristine.
- **B:** the comment celebrates keeping the redo stack "after branching"
  — that's precisely the bug. Undo/redo is a *linear* timeline: the redo
  stack is only valid while you walk straight back and forth. The moment
  a **new edit** happens after an undo, the old future describes a
  drawing that no longer follows from the present. Standard discipline:
  every fresh edit clears the redo stack.

## Requirements for the Fix

- Undo restores the exact prior canvas (Red A).
- A new edit after undo invalidates redo (Red B).
- Adding shapes still renders them in order (guard).
- Keep the two-stack design — fix what gets *stored* (immutable
  snapshots) and *when redo is cleared*. Research topics: immutability
  and reference aliasing, why React state must never be mutated even
  when you `setState` a copy afterwards, undo/redo stack discipline, the
  command pattern, structural sharing / Immer.
