# Mail Composer Problem Statement

## Context

The inbox pane lists four conversations; the composer pane writes a reply
or a forward for whichever conversation is selected. A forward should start
pre-filled with the quoted original message; a reply starts blank. Two QA
tickets are open from a mail-provider-scale company, and support suspects
they're related.

## Ticket A — "Ghost draft from the last conversation"

A user half-typed a reply to *Quarterly roadmap review*, clicked *Design
tokens migration* in the list — and the composer still contained the
roadmap draft, now addressed to the wrong thread. One near-miss already
escalated: a draft meant for a manager almost went to an external vendor.

### Failure Scenario (A)

1. Open `/mail-composer`, type anything into the body.
2. Click a different conversation.
3. Header updates to the new subject — the body keeps the old draft.

## Ticket B — "Forward doesn't quote the original"

Switching the composer from **Reply** to **Forward** should swap the body
to the quoted original message. Instead it keeps whatever was typed in
reply mode; the quoted block never appears unless you reload the page
directly into forward mode.

### Failure Scenario (B)

1. Type a reply draft.
2. Click the **Forward** tab.
3. Body still shows the reply text; no quoted message.

## Root Cause Hints

Notice what *does* update in both tickets: the subject line. It's computed
from props on every render. The body is different — it's `useState`, and
its initializer runs exactly once *per component instance*. So the real
question is: when you switch conversation or mode, does React create a new
`Composer` instance, or quietly hand the old instance new props?

React preserves an instance (and all its state) as long as the same
component *type* renders at the same *position* in the tree. Look at the
JSX around the composer: two branches of a ternary, same type, same slot —
and the comment above it describes behavior React never promised. Reread
what identity means to the reconciler, then find the one attribute that
lets you *tell* React "this is a different composer now."

## Requirements for the Fix

- Switching conversation starts a fresh (empty) reply draft — encoded in
  `MailComposer.test.tsx` (Ticket A test).
- Switching to Forward shows the quoted original of the selected
  conversation (Ticket B test).
- The conversation list and props-driven subject line keep working (guard
  test).
- Don't rewrite the composer to sync state from props inside an effect —
  the initializer-based design is fine; fix the *identity* of the
  component instance. Research topics: how reconciliation decides to mount
  vs update, state preservation by (type, position), `key` as an identity
  override outside of lists, "resetting state with a key" in the React
  docs.
