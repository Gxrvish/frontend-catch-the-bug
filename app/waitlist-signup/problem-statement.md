# Waitlist Double Signup Problem Statement

## Context

The beta waitlist form uses a React 19 form action: the `<form action={…}>`
prop takes an async function, React handles the submit event, and the action
awaits the API (~150ms). The backing table has no unique constraint on email
yet (ticket BE-201), so whatever the frontend submits, the backend inserts.

QA ticket from a product-launch scale company: "Users who double-click
**Join waitlist** get signed up twice. They see the happy confirmation for a
split second, then a scary banner: _'You were signed up more than once —
support has been notified.'_ Support is, in fact, being notified. A lot."

## Problem

While the first submit's request is in flight, the form is still fully
interactive — nothing communicates "we're working on it", and nothing stops
a second submit. Each click dispatches the action again, and every action
faithfully inserts another row.

## Failure Scenario

1. Type an email, double-click **Join waitlist**.
2. Two actions run; the API records two entries for the same email.
3. First response: success, spot confirmed. Second response: the duplicate
   warning. The user sees both, trusts neither.

## Fast Reproduction Path

1. Open `/waitlist-signup`, type an email, click the button twice quickly.
2. Both the green confirmation and the red error banner appear.
3. `WaitlistSignup.test.tsx` encodes the fix: a double-click must leave
   exactly one entry in the waitlist.

## Root Cause Summary

Form actions give you an async lifecycle — but this component threw away the
half of the API that _reports_ on that lifecycle. A raw async function passed
to `action` runs eagerly on every submit; React will happily queue a second
invocation while the first is pending. React 19 ships a hook whose entire
job is to wrap an action and hand back its pending status (and last result)
as renderable state. This form isn't using it.

## Requirements for the Fix

- A double-click on submit must record exactly one waitlist entry — encoded
  in `WaitlistSignup.test.tsx`.
- A normal single submit must still confirm the spot with no error banner
  (also encoded).
- Stay on the form-action model (no `onSubmit`/`preventDefault` retreat).
  The submit button should be genuinely inert while a signup is pending.
  Research topics: React 19 `useActionState` (its `isPending` return),
  `useFormStatus` for child components, why actions queue rather than
  dedupe, idempotency keys as the server-side belt-and-braces.
