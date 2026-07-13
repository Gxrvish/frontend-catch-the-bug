# Tag Input Problem Statement

## Context

The topic-tag field adds a tag on Enter and normalizes input into
lowercase slugs. It works perfectly — for English. Two tickets from the
Japan office of a global-scale company, both about **IME composition**:
users of Japanese/Chinese/Korean keyboards build text through an input
method editor, and the DOM tells you when that's happening.

## Ticket A — "Japanese can't be typed at all"

Open a Japanese IME and type — the field eats every character as it's
composed. The `onChange` normalizer strips anything that isn't
`[a-z0-9-]`, so the in-progress composition (and the final 日本) is
destroyed the moment it arrives.

## Ticket B — "Confirming a candidate submits the tag"

Mid-composition, pressing Enter selects the IME's suggested candidate —
that's what Enter *means* during composition. This field treats it as
"add tag" and submits the half-typed romaji.

## Fast Reproduction Path

1. Open `/tag-input` with a Japanese IME, type にほん → the field stays
   empty (Ticket A).
2. Type romaji, press Enter to pick the candidate → a garbage tag is
   added (Ticket B).

## Root Cause Hints

- **A:** normalizing on every `change` event means normalizing *inside*
  an active composition. The DOM brackets a composition with
  `compositionstart` / `compositionend` — while one is open, the text in
  the field is provisional and must not be rewritten. Normalize when the
  tag is *added*, not while the user types.
- **B:** the Enter that confirms an IME candidate still fires `keydown`.
  The event tells you it's part of a composition —
  `event.nativeEvent.isComposing` (spec'd on `KeyboardEvent`) is `true`.
  A submit handler must ignore composing Enters. (Track
  `compositionstart`/`end` too — Safari fires the keydown *after*
  `compositionend`.)

## Requirements for the Fix

- A composed string (日本) survives typing intact (Red A).
- Enter during composition adds no tag (Red B).
- A plain ASCII tag is still added on Enter and clears the field (guard).
- Research topics: IME composition events
  (`compositionstart`/`compositionupdate`/`compositionend`),
  `KeyboardEvent.isComposing`, and why controlled inputs that rewrite
  their value break composition.
