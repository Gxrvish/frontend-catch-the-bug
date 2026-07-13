# Draft Vault Problem Statement

## Context

The editor backs drafts up through `draftStore.ts` into `vault.ts`.

`vault.ts` **is the storage — do not change it.** Like every persistence
layer (localStorage, KV stores, files), it stores **strings**: what goes
in comes out byte-for-byte. Everything richer than a string has to survive
`draftStore.ts`'s serialization. Three tickets from a docs-scale company —
all three are things `JSON.stringify`/`JSON.parse` quietly do to data.

## Ticket A — "Restoring a draft crashes the editor"

Restore any backup and the "edited N minutes ago" line throws
`TypeError: draft.updatedAt.getTime is not a function`. The draft saved
fine; it's the restored one that's broken.

## Ticket B — "All the tags are gone"

Back up a draft with tags, restore it — zero tags. Not wrong tags:
*none*, every time. The tag picker shows an empty set.

## Ticket C — "The deleted subtitle keeps coming back"

An author removes a draft's section header (subtitle = removed on
purpose). Restore the backup: "Untitled section" is back. The author's
deliberate deletion is silently replaced with the default.

## Fast Reproduction Path

1. Open `/draft-vault`, **Back up draft**, then **Restore** → error line
   shows the `getTime` TypeError (Ticket A).
2. The restored card shows no tags (Ticket B).
3. The restored card shows "Untitled section" instead of "(no subtitle)"
   (Ticket C).

## Root Cause Hints

JSON has six types — and none of them is `Date`, `Set`, or `undefined`:

- **A:** `JSON.stringify` turns a `Date` into its ISO **string**;
  `JSON.parse` has no idea it was ever a date and leaves it a string.
  Whatever consumes `updatedAt` then calls `.getTime()` on a string. The
  deserializer has to *revive* the date.
- **B:** `JSON.stringify(new Set([...]))` is `{}` — a Set has no
  enumerable properties and no `toJSON`. The set must be serialized as an
  array and rebuilt on the way in.
- **C:** keys whose value is `undefined` are **omitted** from JSON
  entirely. On load, `{ ...DEFAULTS, ...parsed }` sees no `subtitle` key
  and backfills the default — "field was deliberately cleared" and "field
  was never set" have become indistinguishable. Store an explicit `null`
  sentinel and map it back.

## Requirements for the Fix

- A restored draft's `updatedAt` is a real `Date` and
  `minutesSinceEdit` works (Red A).
- Tags come back as a `Set` with the same members (Red B).
- A deliberately removed subtitle stays removed across the round-trip
  (Red C).
- The title still round-trips (guard).
- Do not modify `vault.ts` — fix the serialization in `draftStore.ts`.
- Research topics: what survives `JSON.stringify` (and what silently
  doesn't: `Date`, `Set`/`Map`, `undefined`, functions), `toJSON`/reviver
  patterns, and `null` vs `undefined` as a persistence sentinel.
