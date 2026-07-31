# Avatar Preview Problem Statement

## Context

The avatar uploader previews the picked file through
`URL.createObjectURL` and attaches it to the profile as a thumbnail. Two
tickets from a social-scale company — both about who owns a **blob URL's
lifetime**. (An object URL is a handle: the browser pins the underlying
`File`/`Blob` in memory until the URL is revoked or the page dies.)

## Ticket A — "The picker leaks a file per pick"

Users trying a few avatars before settling pin every rejected file in
memory for the life of the tab. DevTools memory shows one retained blob
per pick; kiosk machines running the app all day eventually crawl.

## Ticket B — "The attached avatar is a broken image"

Attach the avatar and the thumbnail renders as a broken image — the code
revokes the URL at the moment it stores it, "since the markup has it
now". A revoked blob URL is a dangling pointer: the string survives, the
resource is gone.

## Ticket C — "Attaching a second avatar strands the first"

Every attach overwrites the thumbnail without releasing the handle it
evicts. Users who attach, reconsider, and attach again leave the earlier
avatar pinned with nothing on screen pointing at it. `attach` has no
replacement rule; the picker does.

## Ticket D — "Navigating away keeps the blobs pinned"

The handles outlive the component. Route away from the uploader with a
preview (or an attached avatar) on screen and those blobs stay pinned for
the life of the tab — the leak from Ticket A, moved from per-pick to
per-visit.

## Fast Reproduction Path

1. Open `/avatar-preview`, pick three files → three live object URLs,
   should be one (Ticket A).
2. Pick a file, click **Attach to profile** → the thumbnail's URL is
   already revoked (Ticket B).
3. Pick, attach, pick, attach → the first avatar's URL is still alive
   with nothing displaying it (Ticket C).
4. Pick, attach, pick, then unmount → both handles survive (Ticket D).

## Root Cause Hints

- **A:** every `createObjectURL` allocates a new handle; picking a new
  file just overwrites the _string_ in state and leaks the old handle.
  Revoke the previous URL when replacing it (and don't revoke one that
  something still displays).
- **B:** revocation is not "free the string" — it invalidates the URL for
  any _future_ fetch, including the `<img>` that hasn't loaded it yet.
  Revoke when the URL stops being **displayed** (replacement/unmount),
  not when your code stops holding it.
- **C:** two slots can point at one URL, and either can be the last one
  displaying it. A revoke-on-replace rule belongs in _both_ writers, and
  it has to check the other slot before firing.
- **D:** unmount is a replacement too — everything still held is dropped
  at once. Note that a `[]`-dep effect cleanup closes over mount-time
  state, so it cannot read the latest `preview`/`thumb` from `useState`;
  a dep array that _can_ see them re-runs the cleanup on every change,
  which is a different bug (it re-breaks Ticket B). The list of what you
  created and haven't released wants to live somewhere that is neither.

## Requirements for the Fix

- Re-picking releases the previous preview URL — exactly one alive after
  three picks (Red A).
- The attached thumbnail's URL is still alive while rendered (Red B).
- An attached thumbnail survives later re-picks of the preview (Red B2).
- Attaching a second avatar releases the first (Red C).
- Unmounting releases every URL the component still holds (Red D).
- Picking a file still shows a blob-URL preview (guard).
- Research topics: `URL.createObjectURL`/`revokeObjectURL` semantics and
  blob memory pinning, and object-URL lifecycle patterns in React
  (revoke on replace / on unmount).
