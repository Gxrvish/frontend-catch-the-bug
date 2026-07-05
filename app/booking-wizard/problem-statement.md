# Booking Wizard Focus Loss Problem Statement

## Context

The booking flow is a three-step wizard (guest info → stay dates → review).
All entered details live in the wizard so the review step can show everything
before submission. Each step is a small form section rendered inside the
wizard's card.

Support at a home-rental-marketplace scale company keeps getting this
complaint: "I cannot type my name. The cursor kicks me out of the field after
every single letter. On my phone the keyboard closes after each character."

## Problem

Every keystroke in any wizard field throws the field away and builds a brand
new one. Focus is lost after each character, so typing a full name requires
clicking back into the input eight times. Anything a step keeps to itself —
scroll position, text selection, transient validation state — is wiped at the
same rhythm.

## Failure Scenario

1. User opens the wizard and clicks into **Full name**.
2. User types "J" — the field re-appears empty of focus; the keyboard target
   is now `<body>`.
3. User types "ane Doe" — none of it lands anywhere.
4. User files a support ticket instead of a booking.

## Fast Reproduction Path

1. Open `/booking-wizard` (deterministic — no timing involved).
2. Click into **Full name** and type several characters quickly.
3. Watch the focus ring disappear after the first character.
4. `BookingWizard.test.tsx` encodes this: typing "Jane Doe" must produce
   "Jane Doe" in a field that still has focus.

## Root Cause Summary

React decides whether to keep or destroy a subtree by comparing the element
*type* at each position between renders. If the type it sees on this render is
not (`===`) the type from the last render, React unmounts the old subtree —
DOM nodes, focus, state, everything — and mounts a fresh one. Ask yourself
what value the wizard passes as the element type for the current step, and
whether that value survives a re-render of the wizard.

## Requirements for the Fix

- Typing a full name in one go must work; the field keeps focus the whole
  time (encoded in `BookingWizard.test.tsx`).
- Entered details must still reach the review step (also encoded).
- Do not switch inputs to uncontrolled or move wizard state into a store —
  the fix is structural and small. Research topics: React element type
  identity and reconciliation, why components must not be defined inside
  other components, how this differs from remounting via a changed `key`.
