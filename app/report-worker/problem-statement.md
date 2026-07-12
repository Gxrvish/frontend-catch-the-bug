# Report Worker Problem Statement

## Context

A heavy aggregation is offloaded to a Web Worker so the UI stays
responsive. The component posts a request per range and renders the
total the worker sends back. Tests run against a fake `Worker` (manual
`reply()`, `terminate()`). Three tickets.

## Ticket A — "The total is for the wrong request"

Click two ranges quickly and the number that lands is whichever worker
message arrives *last* — often the answer to the earlier, superseded
request. Responses aren't matched to the request that asked for them.

## Ticket B — "Workers pile up"

Every mounted report spawns a worker that's never shut down — navigate
around and the tab accumulates live workers, each holding memory and a
thread.

## Ticket C — "The UI still janks"

Even though there's a worker, the main thread still runs the full
aggregation on every click, so offloading buys nothing — the page hitches
exactly as before.

## Fast Reproduction Path

1. Open `/report-worker`.
2. Click Sum 10 then Sum 30; let the 30 answer come back first, then the
   stale 10 answer → the total shows the 10 result (Ticket A).
3. Unmount the widget → the worker was never terminated (Ticket B).
4. Click any Sum → the aggregation ran on the main thread
   (`getMainThreadRuns()` > 0) (Ticket C).

## Root Cause Hints

- **A:** `onmessage` calls `setTotal(event.data.total)` for *any* reply,
  ignoring which request it answers. Tag each request with an id, remember
  the latest one (a ref), and drop replies whose id isn't current.
- **B:** the effect creates the worker but its cleanup is empty — it never
  `terminate()`s it. Terminate the worker in the effect's cleanup.
- **C:** `run` calls `computeTotal(n)` on the main thread "to sanity-check"
  before posting — which is the whole expensive computation, defeating the
  offload. Let the worker do the work; don't run it on the main thread.

## Requirements for the Fix

- The total reflects the latest request, not a late stale reply (Red A).
- Unmounting terminates the worker (Red B).
- The aggregation does not run on the main thread (Red C).
- A single request still renders the worker's total (guard).
- Research topics: correlating Web Worker requests/responses with ids,
  worker lifecycle and `terminate()`, keeping heavy work off the main
  thread (the point of a worker).
