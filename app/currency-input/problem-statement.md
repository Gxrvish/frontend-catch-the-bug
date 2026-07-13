# Currency Input Problem Statement

## Context

The payout field is a controlled input that re-formats on every keystroke:
state holds the amount as a **number**, and the field renders
`formatAmount(amount)` — `1234567` → `"1,234,567"`. Two tickets from a
payments-scale company.

## Ticket A — "The caret jumps to the end when I fix a typo"

Type `1234567`, click back into the middle to correct a digit, and the
caret teleports to the end of the field after the very next keystroke.
Every correction has to be done by clearing the whole field. Support calls
it "the cursor bug"; it is the top complaint on the payout screen.

## Ticket B — "You can't type a decimal"

Typing `12.` shows `12` — the dot is eaten the instant it is typed, so a
decimal amount is literally untypeable. `12.50` becomes `12.5`: the
trailing zero disappears while the user is still typing it.

## Fast Reproduction Path

1. Open `/currency-input`, type `1234567` → field shows `1,234,567`.
2. Put the caret after `1,2` and type `9` → the value re-formats to
   `12,934,567` but the caret is at the end (Ticket A).
3. Clear it and type `12.` → the dot never appears (Ticket B).

## Root Cause Hints

- **A:** a controlled input re-renders by React **assigning `.value`** on
  the DOM node — and assigning `value` moves the text-entry cursor to the
  end of the new string. That happens on *every* keystroke; you only
  notice when the re-formatted text is a different length from what the
  user typed. React will not restore the caret for you: the handler must
  remember where the user was (not as a character offset — the separators
  move! — but relative to the *digits*), and put it back after the DOM has
  been updated, before the browser paints.
- **B:** the state is a `number`, so the state can only ever hold what a
  number can hold. `"12."` and `"12.50"` are not numbers — they are
  *in-progress text*. Round-tripping the user's text through
  `parseAmount → format` destroys anything a number can't represent. What
  the user is typing has to be the state; the number is derived from it.

## Requirements for the Fix

- Editing mid-number leaves the caret next to the digit that was typed
  (Red A).
- `12.` stays `12.`, and `12.50` keeps its trailing zero while typing
  (Red B).
- The charged amount still tracks what was typed (guard).
- Research topics: controlled inputs and the DOM `value` setter's effect
  on the text-entry cursor, `selectionStart` / `setSelectionRange`,
  restoring the caret in `useLayoutEffect` (before paint), and keeping
  display state separate from the parsed value.
