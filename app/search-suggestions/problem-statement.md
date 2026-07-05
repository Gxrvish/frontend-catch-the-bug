# Search Suggestions Out-of-Order Results Problem Statement

## Context

The search box fetches autocomplete suggestions on every keystroke from a simulated
suggestion backend. Like real autocomplete backends, short prefixes are answered
from colder, larger candidate sets — so short queries routinely respond **slower**
than longer ones.

QA at a search-scale company filed this ticket: "Users type a full query, but the
dropdown shows suggestions for a prefix they typed half a second ago. Sometimes the
right results appear and then get replaced by wrong ones."

## Problem

When the user types quickly, responses can land out of order. A response for an
older, shorter query can arrive **after** the response for the latest query and
overwrite it. The dropdown then answers a question the user is no longer asking.

## Failure Scenario

1. User types `ip`. Request A fires (slow: ~850ms in Easy Repro Mode).
2. User keeps typing until the box reads `iphone`. Request B fires (fast: ~150ms).
3. Request B lands first. Dropdown correctly shows `iphone…` suggestions.
4. Request A lands last. The hook applies whatever response arrives, so the
   dropdown flips back to `ip…` suggestions while the input still says `iphone`.

## Fast Reproduction Path

1. Open `/search-suggestions`. Keep **Easy Repro Mode** on (default).
2. Type `iphone` quickly (or paste `ip`, then quickly append `hone`).
3. Watch the red "Showing results for …" mismatch line and the request log:
   the request for the short prefix lands *after* the one for the full query.

## Root Cause Summary

The fetch effect applies every resolved response unconditionally. Nothing marks a
request as superseded when a newer keystroke fires, so the last response to
*arrive* wins instead of the last request to be *sent*.

## Requirements for the Fix

- The dropdown must always reflect the latest query the user typed —
  regardless of network response ordering.
- Stale in-flight requests must not update state after being superseded
  (ignore them, or cancel them outright).
- `isLoading` must be false once the response for the **latest** query has landed.
- Do not "fix" this by debouncing — debounce narrows the window but the race
  remains. Make a minimal, targeted change in the hook.
