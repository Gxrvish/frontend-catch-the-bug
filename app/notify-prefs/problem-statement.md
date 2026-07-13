# Notify Prefs Problem Statement

## Context

The notification preferences form serializes itself with
`new FormData(form)` and PUTs the result to `prefsApi.ts`.

`prefsApi.ts` **is the server — do not change it.** The endpoint is a
documented full-replace PUT: the arriving payload becomes the record;
missing keys are gone. Three tickets from a SaaS-scale company, all three
caused by what `FormData` does and doesn't put in the bag.

## Ticket A — "Saving preferences wipes the customer's plan"

Save any preference and the account's `plan` disappears from the record.
Support traced it to this form: the payload arrives without a `plan` key
at all — even though the plan input is right there in the form with a
value in it.

## Ticket B — "Email alerts can't be turned off"

Uncheck **Email alerts**, hit save — the record still has no answer about
email alerts (and downstream defaults treat that as "on"). Turning the
box ON saves fine. Turning it OFF sends nothing.

## Ticket C — "The confirmation says the follow-up goes out at 91:00"

Set the digest hour to 9 and the confirmation reads "Follow-up summary at
91:00." The follow-up is supposed to be one hour after the digest — 10:00.

## Fast Reproduction Path

1. Open `/notify-prefs`, click **Save preferences** → `getStored().plan`
   is `undefined` (Ticket A).
2. Uncheck **Email alerts**, save → `emailAlerts` is `undefined`, not
   `false` (Ticket B).
3. Set digest hour to 9, save → confirmation shows `91:00` (Ticket C).

## Root Cause Hints

All three are clauses of the `FormData` serialization contract:

- **A:** a `disabled` control is excluded from form submission — by spec,
  disabled means "not part of this form right now". The plan field only
  needs to be *uneditable*, which is a different attribute with different
  submission behavior.
- **B:** an unchecked checkbox contributes **nothing** to `FormData` — no
  key, no `"false"`. `Object.fromEntries(formData)` therefore can't
  express "off". The handler has to ask the form data whether the key is
  present and send an explicit boolean.
- **C:** every value `FormData` hands back is a string (or a `File`).
  `"9" + 1` is `"91"`. Convert before doing arithmetic.

## Requirements for the Fix

- Saving keeps `plan: "pro"` in the stored record (Red A).
- Unchecking email alerts stores `emailAlerts: false` (Red B).
- Digest hour 9 confirms a follow-up at 10:00 (Red C).
- The webhook URL still round-trips (guard).
- Research topics: which controls participate in form submission
  (`disabled` vs `readonly`), how checkboxes serialize (present-or-absent,
  `FormData.has`), and `FormData` value types.
