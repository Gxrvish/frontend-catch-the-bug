# Offline Notes Problem Statement

## Context

Notes are stored locally in IndexedDB through an app data layer
(`notesDb.ts`) built on a small IDB wrapper (`idb.ts` — this is the
"database"; don't change it). The real IndexedDB request/transaction
lifecycle is modeled faithfully, so real footguns reproduce. Three
tickets.

## Ticket A — "Saving a note throws"

Hitting Save blows up with `TransactionInactiveError` and the note is
lost. The write clearly opens a transaction, but by the time it actually
`put`s the row the transaction has already finished.

## Ticket B — "Pinned filter crashes"

Opening the pinned view throws `NotFoundError: No index named
'byPinned'`. The query targets an index that was never created when the
database was set up.

## Ticket C — "Notes never show up"

The list comes back empty even when there are rows in the store. The read
opens a transaction and calls `getAll()`, but returns before the read has
actually produced any data.

## Fast Reproduction Path

1. Open `/offline-notes`, type a note, click Save → `TransactionInactive`
   error (Ticket A).
2. Query pinned notes → `NotFoundError` for the `byPinned` index
   (Ticket B).
3. Seed rows and read them back → empty array (Ticket C).

## Root Cause Hints

- **A:** `saveNote` opens the `readwrite` transaction and _then_ `await`s
  `normalize(...)` before calling `store.put`. An IDB transaction is only
  active for the current task turn — the moment you `await` and control
  returns to the event loop, it deactivates. Do any async work _before_
  opening the transaction, then keep all store operations synchronous
  within it.
- **B:** the `onupgradeneeded` handler creates the `notes` object store
  but never calls `createIndex("byPinned")`, so the index query has
  nothing to hit. Indexes must be created during the version upgrade.
- **C:** `getAllNotes` returns `request.result` immediately, but an
  `IDBRequest`'s `result` is only populated once its `onsuccess` fires —
  one turn later. Wrap the request in a promise that resolves on
  `onsuccess` (there's a `requestToPromise` helper) and await it.

## Requirements for the Fix

- A saved note persists — no `TransactionInactiveError` (Red A) — and it
  is still **normalised** on the way in. Dropping the trim to dodge the
  await is not a fix (Red A2).
- Pinned notes can be queried through the index (Red B), and the index
  stays correct once new notes are saved alongside the pinned ones
  (Red B2).
- A read returns the rows it fetched (Red C), including an empty store,
  and each saved note gets its own key (Red C2).
- Two saved notes round-trip in insertion order (guard).
- Don't edit `idb.ts`; fix the usage in `notesDb.ts`. Research topics:
  IndexedDB transaction auto-close / active window, `onupgradeneeded` and
  index creation, the `IDBRequest` `onsuccess`/`result` lifecycle and
  promisifying it.
