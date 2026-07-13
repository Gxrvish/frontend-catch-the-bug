# Click Audit Problem Statement

## Context

Growth runs one **delegated listener on `document`** that audits every
CTA click on the page — buttons opt in with a `data-cta` attribute, no
per-button wiring. Two tickets from a marketing-scale company, both about
how DOM events actually travel.

## Ticket A — "The promo widget's clicks never show up"

The third-party promo widget works fine — but its CTA clicks never reach
the audit. The widget calls `stopPropagation()` on its own clicks (its
right to do so; it's isolating its menu logic), and the audit goes blind.
We can't change the widget.

## Ticket B — "Clicks on the button's label don't count"

Users who click the **text inside** the Upgrade button aren't audited;
clicks on the button's padding are. Analytics undercounts by whatever
fraction of users hit the label — which is most of them.

## Fast Reproduction Path

1. Open `/click-audit`, click **Claim promo** → menu opens, audit count
   stays 0 (Ticket A).
2. Click the "Upgrade now" text → count stays 0. Click the button's edge
   → count increments (Ticket B).

## Root Cause Hints

- **A:** an event travels **down** (capture phase) from `document` to the
  target, then **back up** (bubble phase). `stopPropagation()` in the
  widget's bubble-phase handler kills the trip *up* — but the trip *down*
  already happened. A `document` listener registered for the **capture
  phase** runs before any target handler can silence anything.
- **B:** `event.target` is the innermost element hit — the `<span>` label,
  not the button. `target.matches("[data-cta]")` is false for the span.
  Delegation must walk up from the target to the nearest opt-in ancestor —
  that's exactly what `Element.closest()` is for.

## Requirements for the Fix

- A CTA inside a propagation-stopping widget is audited, and the widget
  still works (Red A).
- A click on a child element of a CTA is attributed to the CTA (Red B).
- A direct CTA click is audited exactly once — no double counting from
  listening in two phases (guard).
- Research topics: DOM event phases (capture → target → bubble),
  `addEventListener`'s `capture` option, `stopPropagation` semantics, and
  `event.target` vs `Element.closest()` in delegation.
