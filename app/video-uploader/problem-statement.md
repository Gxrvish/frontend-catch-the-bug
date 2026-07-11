# Video Uploader Problem Statement

## Context

The clip uploader drives a transcoder pipeline. The staging transcoder is
deterministic for QA: the **first** upload attempt of a session always
fails with a 503, every later attempt succeeds (`uploadApi.ts`). The
component tracks progress with four flags: `isUploading`, `isError`,
`isDone`, `isCancelled`. Two tickets from a video-platform-scale company.

## Ticket A — "Failed and Complete at the same time"

Upload fails (expected), user hits **Retry**, retry succeeds — and the UI
now shows **both** "Upload failed" and "Upload complete", stacked. Support
gets screenshots of the contradiction daily.

## Ticket B — "Cancel bricks the uploader"

Hit **Cancel** during an upload: the spinner never goes away, "Upload
cancelled" appears *under* "Uploading…", and the Upload button stays
disabled forever. Only a reload recovers.

## Fast Reproduction Path

1. Open `/video-uploader`: Select clip → Upload → wait for the failure →
   Retry → both banners (Ticket A).
2. Reload: Select clip → Upload → Cancel immediately → spinner + disabled
   Upload button, permanently (Ticket B).
3. `VideoUploader.test.tsx` encodes both.

## Root Cause Hint

Each ticket has a one-line explanation — retry never resets `isError`,
cancel never resets `isUploading` — and each has a one-line "fix" that
adds one more `setX(false)`. Don't take that bait; ask the structural
question instead.

Four independent booleans describe 2⁴ = 16 representable states. How many
are *meaningful*? Idle, uploading, failed, done, cancelled — five. The
other eleven are nonsense like `isError && isDone`, and nothing in the
type system or the component prevents entering them; both tickets are just
two of the eleven, discovered in the wild. Every new flag doubles the
nonsense space, and every handler must remember to reset every other flag.

The upload is a **state machine**: it is always in exactly *one* state,
and events (start, fail, succeed, cancel, retry) are *transitions*. Model
it as one value with five possible states and both tickets become
unrepresentable rather than unhandled — a transition *replaces* the
state, so there is nothing stale left to forget.

## Requirements for the Fix

- A successful retry shows "complete" and no failure banner (Ticket A
  test).
- Cancel returns the panel to an actionable state: no spinner, Upload
  re-enabled (Ticket B test).
- The happy path still works: idle → failing first upload → error banner
  → retry → complete (guard test).
- Replace the boolean flags with a single status value — don't just
  sprinkle more `setX(false)` calls into the handlers. Research topics:
  finite state machines in UI, discriminated unions in TypeScript,
  "make impossible states impossible" (Richard Feldman), `useReducer` for
  transition logic, what XState formalizes.
