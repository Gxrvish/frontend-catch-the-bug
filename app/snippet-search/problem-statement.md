# Snippet Search Problem Statement

## Context

The help center filters seven article titles as the user types and wraps
the matched text in `<mark>`. Matching is case-insensitive; the highlight
is built by slicing the title (no innerHTML). Three tickets from a
support-scale company — all three are string-matching internals.

## Ticket A — "Typing '(' crashes the page"

Half-way through typing `(v2)` — right at `(v2` — the page white-screens
with `SyntaxError: Invalid regular expression`. Any query containing
`(`, `+`, `[`, `*`, `?` or `\` either crashes or silently matches the
wrong rows: searching `(v2)` also returns titles that merely contain
`v2`, because the parentheses were treated as a regex group.

## Ticket B — "Half my matches are missing"

Searching "beta" shows two or three of the four articles that contain the
word — and *which* rows go missing changes as the list shifts. The rows
that disappear provably match the query.

## Ticket C — "The match isn't highlighted"

Search "beta" and the row "Beta release notes…" is found — but nothing in
it is highlighted. Rows where the letter case matches the query highlight
fine.

## Fast Reproduction Path

1. Open `/snippet-search`, type `(v2` → crash (Ticket A); type `(v2)` →
   two rows instead of the one that literally contains "(v2)" (Ticket A).
2. Type `beta` → fewer than four rows (Ticket B).
3. In the rows that do show, "Beta…" carries no `<mark>` (Ticket C).

## Root Cause Hints

- **A:** the query goes into `new RegExp(query, …)` raw. User input is
  *text*, not a pattern — every regex metacharacter must be escaped before
  it reaches the constructor (there's a well-known one-liner for this).
- **B:** one regex with the `g` flag is reused for every row, with
  `.test()`. A global regex is **stateful**: each successful `.test()`
  advances `lastIndex`, and the next call starts searching from there —
  so consecutive matching rows alternate hit/miss. `.test()` against many
  independent strings must not use a `g` (or `y`) regex.
- **C:** the filter matches case-insensitively, but the highlighter looks
  up the slice with `text.indexOf(query)` — case-sensitive — and gets
  `-1`. Find the position case-insensitively (index into lowercased
  copies), then slice the *original* string.

## Requirements for the Fix

- Metacharacter queries neither crash nor over-match — `(v2` is safe and
  `(v2)` matches exactly the row containing it, highlighted (Red A ×2).
- Every row containing "beta" is listed — all four (Red B).
- A match is highlighted even when its case differs from the query
  (Red C).
- An exact-case, unique query still shows its one row with a highlight
  (guard).
- Research topics: escaping user input for `RegExp` construction, `g`-flag
  `lastIndex` statefulness with `.test()`/`.exec()`, and case-insensitive
  substring location vs case-preserving display.
