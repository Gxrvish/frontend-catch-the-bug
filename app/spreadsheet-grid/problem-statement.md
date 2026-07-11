# Spreadsheet Grid Problem Statement

## Context

A 3×3 sheet where cells hold literals or `=A1+B2`-style formulas,
evaluated by `formulaEngine.ts` with a memo cache. Two tickets from a
docs-suite-scale company — and they're entangled: the second only shows
its true colors once the first is fixed.

## Ticket A — "Formulas show yesterday's number"

Cell C1 is `=A1+B2`. Change A1 from 2 to 10 and C1 stays 5. The formula
is right, the dependency is right, the displayed sum is stale. Editing
the *formula text* updates a cell; editing a cell it *depends on* does
not.

## Ticket B — "Circular references should say so, not silently lie / crash"

Point A3 at B3 and B3 back at A3. A correct sheet flags `#CYCLE!`. This
one currently shows a stale leftover number — and if you "fix the
caching" naively, it stops lying and instead **infinite-loops and takes
the tab down**. Both failure modes are unacceptable.

## Fast Reproduction Path

1. `/spreadsheet-grid`: edit A1 to 10 → C1 still 5 (Ticket A).
2. A3 = `=B3`, B3 = `=A3` → no `#CYCLE!` (Ticket B).

## Root Cause Hints

- **A (cache-key completeness):** `evaluate` memoizes on the **formula
  string alone** — `cache.set(formula, total)`. But a formula's result
  depends on the *values of the cells it references*, which the key
  ignores. `=A1+B2` maps to one cache slot forever, so once computed it
  never reflects a changed A1. A memo key must include everything the
  result depends on; here that's the referenced cells' current values
  (or bust the cache whenever the grid changes / key by a grid
  generation counter). This is textbook cache poisoning.
- **B (cycle detection — the escalation):** there is no cycle guard;
  `evaluate` recurses into references trusting the comment that they
  "always bottom out at a literal." Right now the *broken* cache
  accidentally hides the infinite recursion (a half-populated entry
  short-circuits it) — which is why you see a stale number, not a crash.
  The moment you fix the cache in Ticket A, the recursion is unmasked and
  overflows the stack. So the real fix is both: correct the cache **and**
  add cycle detection — track the set of cells currently being evaluated,
  and when you re-enter one, resolve it to `#CYCLE!` instead of
  recursing.

## Requirements for the Fix

- Changing a referenced cell updates dependent formulas (Red A).
- A circular reference renders `#CYCLE!` in the involved cells, no crash,
  no hang (Red B).
- Literals and a one-level formula still evaluate on load (guard).
- Keep the memo cache (don't just delete it and re-evaluate everything
  blindly if you can key it correctly) and keep evaluation happening in
  render. Research topics: memoization cache-key completeness, cache
  invalidation, dependency-graph evaluation, cycle detection with a
  visiting set (DFS colors), why spreadsheets topologically order recalc.
