# Mention Watch Problem Statement

## Context

The live transcript counts `@mentions` as they arrive by watching the DOM
with a `MutationObserver` — the transcript is rendered by one team, the
mention badge by another, so the badge observes instead of sharing state.
Two tickets from a chat-scale company, both misreadings of the observer
contract.

## Ticket A — "Mentions in replies never count"

A mention arriving as a **reply** — inserted inside an existing message's
element — never increments the badge. Top-level messages count fine.
The deeper the DOM, the blinder the badge.

## Ticket B — "Bursts count as one"

When three messages arrive in one delivery, the badge goes up by **one**.
Single messages count correctly; anything batched loses all but the
first.

## Fast Reproduction Path

1. Open `/mention-watch`, click **Deliver one** → badge 1. Click **Reply
   to first** → badge stays 1, should be 2 (Ticket A).
2. Reload, click **Deliver three** → badge shows 1, should be 3
   (Ticket B).

## Root Cause Hints

- **A:** `observe(root, { childList: true })` watches additions to
  `root`'s **direct children only**. A reply lands deep inside an existing
  message element — invisible to a non-recursive observation. There's an
  option that extends `childList` to the entire subtree.
- **B:** one observer callback delivers an **array of MutationRecords** —
  the browser coalesces everything since the last microtask into a single
  call. Three sibling insertions are three records in one callback; the
  handler reads `mutations[0]` and drops the rest. Process every record.

## Requirements for the Fix

- A reply mention inside an existing message increments the badge
  (Red A).
- A three-message burst increments the badge by three (Red B).
- A single delivery still counts exactly once — no double-counting
  (guard).
- Research topics: `MutationObserver` init options (`childList` vs
  `subtree`), how mutation records batch into one callback, and
  `addedNodes` per record.
