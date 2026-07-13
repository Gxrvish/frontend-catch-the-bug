# Rank Caption Problem Statement

## Context

The standings page prints each player's rank as an ordinal ("4th place")
and captions matches with relative time ("in 2 days"). Both strings are
hand-rolled in `captions.ts`. Two tickets from a gaming-scale company —
both are the platform already solving a problem the code re-solved badly.

## Ticket A — "21th place"

Every rank past 20 that ends in 1, 2, or 3 is wrong: **21th, 22th,
23th** — while 11, 12, 13 are correctly *11th* (by accident). English
ordinal suffixes follow the last digit, except the teens. The current
code special-cases exactly the numbers 1, 2, and 3 and nothing else.

## Ticket B — "Last match: in -2 days"

Past events render as negative-future: "in -2 days". The caption code
only ever learned to say "in N days".

## Fast Reproduction Path

1. Open `/rank-caption` → Mira is "21th place" (Ticket A).
2. The footer reads "Last match: in -2 days" (Ticket B).

## Root Cause Hints

Both fixes are the same discovery: **the platform ships this logic.**

- **A:** correct English ordinals need "last digit, unless the number is
  in the teens" — and `Intl.PluralRules("en", { type: "ordinal" })`
  encodes exactly that: `.select(21)` → `"one"`, `.select(11)` →
  `"other"`. Map the four categories (`one/two/few/other`) to
  `st/nd/rd/th`. (A hand-rolled `% 10` / `% 100` solution is also
  acceptable if it handles the teens.)
- **B:** `Intl.RelativeTimeFormat` formats signed offsets in both
  directions — `format(-2, "day")` → "2 days ago", `format(2, "day")` →
  "in 2 days". No sign juggling, and it localizes for free.

## Requirements for the Fix

- 21st / 22nd / 23rd, and 11th / 12th / 13th / 111th (Red A).
- A match two days in the past reads "2 days ago" (Red B).
- 1st, 4th, and "in 2 days" still hold (guard).
- Research topics: `Intl.PluralRules` with `type: "ordinal"`,
  `Intl.RelativeTimeFormat`, and why teens break last-digit suffix rules.
