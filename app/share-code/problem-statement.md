# Share Code Problem Statement

## Context

Team invites travel as compact codes: `shareCode.ts` packs the invite
state into base64 (`btoa(JSON.stringify(...))`) and ships it in a link's
query string. Two tickets from a collaboration-scale company — both are
encoding-contract violations, not logic bugs.

## Ticket A — "Creating an invite for some teams just crashes"

Any team name outside Latin-1 — an emoji, 日本語, even some accented
scripts — makes **Create link** throw
`InvalidCharacterError: Invalid character`. The feature is unusable for a
large share of the user base.

## Ticket B — "Some invite links say 'Broken link'"

Certain teams' links fail on arrival with a JSON parse error — reliably,
for the same teams, every time. The code generated fine; it's the *link*
that delivers a corrupted code.

## Fast Reproduction Path

1. Open `/share-code`, set the team to `Launch 🚀 crew`, create the link
   → `InvalidCharacterError` (Ticket A).
2. Set the team to `qa~lab`, create and open the link → "Broken link:
   SyntaxError…" (Ticket B).

## Root Cause Hints

- **A:** `btoa` encodes a **binary string** — every char must be a single
  byte (0–255). A JS string is UTF-16; anything beyond Latin-1 throws.
  Real text must first become bytes (`TextEncoder`), and the bytes get
  base64'd (and `TextDecoder` on the way back).
- **B:** standard base64 uses `+`, `/` and `=` — all three mean something
  in a URL. In a query string a `+` *is a space*: `URLSearchParams` hands
  the join page a code with a space where the `+` was, and `atob` /
  `JSON.parse` chokes. Codes that travel in URLs use the **base64url**
  alphabet (`-`, `_`, padding stripped) — or get percent-encoded.
  (`qa~lab`'s JSON lands on a 6-bit boundary that emits `+`.)

## Requirements for the Fix

- Unicode team names encode, and round-trip back intact (Red A).
- Every code survives the URL trip — encode → link → parse → decode
  (Red B).
- A plain ASCII invite still round-trips (guard).
- Research topics: `btoa`/`atob` binary-string semantics,
  `TextEncoder`/`TextDecoder`, base64 vs base64url alphabets, and what
  `+` means inside a query string.
