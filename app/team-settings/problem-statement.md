# Team Settings Lost Update Problem Statement

## Context

The team settings form edits two fields — team name and incident webhook
URL — and saves the whole document. The server versions the document and
runs compare-and-set writes: a save must present the version it was based
on (`baseVersion`), and the write is rejected with a 409 `ConflictError`
if that version is no longer current. A "Simulate teammate edit (other
tab)" button stands in for a colleague saving concurrently.

QA ticket from a collaboration-suite-scale company: "On-call was paged
because incident webhooks silently stopped firing. Audit log: an engineer
updated the webhook URL at 14:02; at 14:07 a teammate renamed the team and
the webhook URL **reverted** to the old value. The teammate swears they
never touched the webhook field. No error, no conflict warning, nothing —
the first engineer's change just vanished."

## Problem

A classic lost update. The form loads the document once, the user edits one
field, and Save writes the **entire stale document** back. Anything a
teammate changed after the form loaded is overwritten with old values. The
server's version check exists precisely to catch this — but read the `save`
handler closely to see why the check never gets the chance to fire.

## Failure Scenario

1. Open `/team-settings`; the form loads version 1.
2. Click **Simulate teammate edit (other tab)** — the server's webhook URL
   changes; the document is now version 2.
3. Change the team name and click **Save settings**.
4. The save succeeds. The server's webhook URL is back to the value from
   step 1 — the teammate's change is gone, and nobody was told.

## Fast Reproduction Path

1. Follow the four steps above; compare the webhook field against what the
   teammate set.
2. `TeamSettingsForm.test.tsx` encodes the fix: after that flow, the
   teammate's webhook URL must still be on the server.

## Root Cause Summary

The comment in `save` says it fetches "the freshest version number right
before writing, so the save can never be rejected." That is exactly
backwards. The version parameter is not a formality to satisfy the server —
it is the client's *claim about what it saw*. By refetching the current
version and presenting it, the client forges that claim, turning
compare-and-set into last-write-wins. The `baseVersion` must be the version
of the document **the form was actually edited against** — the one from the
original load. Then a concurrent edit makes the save fail loudly with a
409, which the UI must surface instead of silently clobbering.

## Requirements for the Fix

- After a teammate edit, saving must not wipe the teammate's webhook URL —
  encoded in `TeamSettingsForm.test.tsx`. Surfacing a conflict message (and
  letting the user reload/re-apply) is the expected UX; silently merging is
  acceptable only if nothing the teammate wrote is lost.
- A plain save with no concurrent edit must still succeed (guard test).
- Research topics: the lost-update problem, optimistic concurrency control,
  HTTP ETag / If-Match preconditions, compare-and-set, why "refetch before
  write" defeats the version check, three-way merge as the deluxe fix.
