# Inline Editor Problem Statement

## Context

The document-title card flips between a display row and an inline edit
row. The card's root element registers with layout telemetry
(`elementTracker.ts` — each registration costs an observer slot, so the
module counts them). Two tickets from a docs-product-scale company, both
about **when refs actually do things**.

## Ticket A — "Edit never focuses the input"

Clicking **Edit** shows the input but focus stays wherever it was; users
must click again into the field. The handler calls
`inputRef.current?.focus()` immediately after `setEditing(true)` — and
the optional chain means nobody ever sees an error.

## Ticket B — "Telemetry registrations explode"

The registration counter climbs by one on **every keystroke** while
editing. One card, dozens of registrations, none ever untracked. The
telemetry dashboard thinks the page has 40 panels.

## Fast Reproduction Path

1. Open `/inline-editor`, click Edit → input not focused (Ticket A).
2. Type a few characters → `getRegistrationCount()` climbs per character
   (Ticket B).

## Root Cause Hints

Refs are populated during React's **commit** phase — after render output
is applied to the DOM. Neither bug makes sense until that sentence does.

- **A:** inside the click handler, `setEditing(true)` only *schedules* a
  re-render. The input doesn't exist yet; `inputRef.current` is still
  `null`, the `?.` swallows it, and by the time the input mounts nobody
  calls focus. The focus call needs to run *after* the commit that
  creates the input — where does React let you run code after commit,
  keyed to a state change? (There's also a one-attribute declarative
  answer.)
- **B:** the ref is an **inline function**, so every render produces a
  *new* ref callback. React sees a different callback and re-runs the
  attach cycle each render — that's one `trackElement` per keystroke.
  And the comment's claim that "React detaches refs automatically" is
  only half-true: React calls your callback again, but *this* callback
  ignores the detach signal and never untracks. React 19 lets a ref
  callback **return a cleanup function** — pair every track with an
  untrack, and give the callback a stable identity so the pair runs once.

## Requirements for the Fix

- Edit focuses the input (Red A).
- Exactly one telemetry registration no matter how much is typed (Red
  B) — and the element should be untracked when it unmounts.
- Edit → type → Save round trip still works (guard).
- Research topics: render vs commit phases and when refs attach, effects
  as the post-commit hook (`useEffect` + `[editing]`), `autoFocus`,
  React 19 ref callback cleanup functions, stable ref callbacks via
  `useCallback`.
