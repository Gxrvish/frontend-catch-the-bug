# Upload Queue Problem Statement

## Context

The asset uploader takes five files and pushes them through
`uploadQueue.ts` (the app layer) onto `uploadApi.ts` (the transport).

`uploadApi.ts` **is the network — do not change it.** Requests never
settle on their own; a test drives them (`_complete` / `_fail`), and the
transport records what the app did to it: `getMaxInFlight()`,
`getAborted()`, `getInFlight()`. It honours an `AbortSignal` like `fetch`
does.

Product's rule: **at most two uploads on the wire at a time.** Three
tickets from an asset-pipeline-scale company.

## Ticket A — "Uploading five files saturates the connection"

Start an upload and all five requests go out at once. On a phone the
video upload in tab 1 starves everything else on the connection, and the
CDN starts 429-ing. The `CONCURRENCY` constant is right there in the file
and nothing reads it.

## Ticket B — "Cancel doesn't cancel"

Hit **Cancel** on a file: the row goes grey, and the bytes keep flowing —
the request was never actually aborted. Worse, when it eventually
finishes, the row flips back to **done**. Users cancel a 2 GB upload and
still pay for it.

## Ticket C — "One bad file freezes the whole queue"

If a single file fails, the other four never leave "uploading" and the
queue never reports that it finished. The failed file never gets marked
as failed either — the UI just sits there forever.

## Fast Reproduction Path

1. Open `/upload-queue`, click **Start upload** → "Open requests" reads
   5, not 2 (Ticket A).
2. Cancel a file, then answer the open requests → the row comes back as
   **done**, and `getAborted()` is empty (Ticket B).
3. Fail one file → the queue never settles and the rest stay
   "uploading" (Ticket C).

## Root Cause Hints

- **A:** `Promise.all(files.map(...))` starts every promise the moment it
  is created — `Promise.all` waits for work, it does not schedule it.
  Getting a cap means only ever having N uploads in flight: N workers
  pulling from a shared list of pending files.
- **B:** `cancel()` only writes to the status map. The transport takes an
  `AbortSignal` — nothing is passing one. Each in-flight upload needs its
  own `AbortController`, `cancel()` has to `abort()` it, and the rejection
  that comes back (`AbortError`) must not be treated like a failure — nor
  should a cancelled row be overwritten by a late answer.
- **C:** every upload runs unguarded, so the first rejection rejects the
  whole `Promise.all` and every other in-flight upload's bookkeeping is
  abandoned. A queue's contract is: **one item's failure is that item's
  status, not the queue's.**

## Requirements for the Fix

- Never more than `CONCURRENCY` (2) uploads in flight (Red A).
- Cancelling aborts the request, and the row stays `cancelled` even after
  the transport answers late (Red B).
- One failing file: it ends `failed`, the other four end `done`, and the
  queue's `done` promise resolves (Red C).
- The happy path still uploads all five files (guard).
- Research topics: promise pools / concurrency limiting, `AbortController`
  + `AbortSignal` (and the `AbortError` rejection), `Promise.all` vs
  `Promise.allSettled`, and per-task error isolation.
