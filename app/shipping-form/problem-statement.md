# Shipping Form Problem Statement

## Context

The shipping form loads a saved draft (150ms fake latency) into three
fields: recipient name (text), express shipping (checkbox), quantity
(numeric text). Three tickets from a checkout-scale company — all three
are variations of one contract violated three different ways.

## Ticket A — "Console screams when the draft loads"

Every page load logs React's *"A component is changing an uncontrolled
input to be controlled"* warning, and anything typed before the draft
arrives is silently replaced. CI fails on unexpected console output.

## Ticket B — "Express shipping can't be enabled"

The checkbox doesn't respond to clicks. Ever. React also warns about a
`checked` prop without `onChange`. Support script now literally says
"the express box is decorative".

## Ticket C — "Quantity becomes NaN"

Select-all + delete in the quantity field → the input displays `NaN` and
stays that way; every further keystroke re-parses garbage. Users must
reload to recover.

## Fast Reproduction Path

1. Open `/shipping-form` with the console open → warning on draft load.
2. Click the express checkbox → nothing.
3. Clear the quantity field → `NaN`.

## Root Cause Hints

A controlled input is a contract: **you** render the value, every render,
and **you** apply every change. All three fields break a different clause:

- **A:** `value={draft?.name}` is `undefined` until the load lands. React
  reads `value={undefined}` as "uncontrolled, browser owns it", then the
  draft flips it to controlled mid-life — that's the warning, and the
  takeover discards whatever the browser held. The value must be a
  *string on every render*, including the loading one.
- **B:** `checked` with no `onChange` is a fully controlled checkbox that
  never updates its source of truth — React reverts each click to the
  rendered value. The comment about browsers toggling natively describes
  uncontrolled checkboxes (`defaultChecked`), not this one.
- **C:** `parseInt("")` is `NaN`, which gets stored, stringified to
  `"NaN"`, rendered, and re-parsed. An emptied field is a legitimate
  *transient* state while typing — the state shape has to allow it
  (store the raw string and parse on submit, or guard the parse).

## Requirements for the Fix

- No console warnings across load-then-type (Red A — note the checkbox
  warning also lands here, the tickets interact).
- Clicking express toggles it (Red B).
- Clearing quantity shows an empty field, then typing works (Red C).
- Draft loads into all fields and name stays editable (guard).
- Research topics: controlled vs uncontrolled inputs, the
  `value={undefined}` trap and `?? ""`, `defaultChecked` vs
  `checked`+`onChange`, storing form fields as strings vs parsed values.
