# Widget Bridge Problem Statement

## Context

The product page hosts an **embedded rating widget** from another team.
The two sides share no state — the widget announces itself with
`CustomEvent`s and the host listens on `document`. Two tickets from a
marketplace-scale company, both about `EventTarget` semantics.

## Ticket A — "The live rating never updates"

Picking stars updates the widget, but the host's "Live rating" label
stays "—" forever. The widget *is* dispatching `rating:change` on its
root element, and the host *is* listening on `document`. The event just
never makes the trip.

## Ticket B — "Only the first submit counts"

The first **Submit rating** reaches the host; every submit after that is
ignored. Users revise their rating and the page keeps showing the old
one. Remounting the page fixes it — once.

## Fast Reproduction Path

1. Open `/widget-bridge`, click a star → "Live rating: —" (Ticket A).
2. Submit a 3, then submit a 5 → "Last submitted: 3" (Ticket B).

## Root Cause Hints

- **A:** a dispatched event visits **only its target** unless it was
  created with `bubbles: true` — bubbling is opt-in for synthetic events,
  unlike most native ones. Dispatched on the widget's div without it, the
  event starts and ends there; `document` never sees it.
- **B:** the host registered the submit listener with `{ once: true }` —
  the listener unregisters itself after its first call, by design. That
  option is for genuinely one-shot events; a recurring channel needs a
  plain listener (removed in the effect's cleanup, which the code already
  does).

## Requirements for the Fix

- Star picks reach the host through the document listener (Red A).
- Every submit updates the host — the latest value wins (Red B).
- The first submit still arrives exactly once (guard).
- Research topics: `CustomEvent` init (`bubbles`, `composed`, `detail`),
  event dispatch vs propagation on `EventTarget`, and `addEventListener`
  options (`once`, `capture`, `passive`).
