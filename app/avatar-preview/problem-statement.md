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

## Fast Reproduction Path

1. Open `/avatar-preview`, pick three files → three live object URLs,
   should be one (Ticket A).
2. Pick a file, click **Attach to profile** → the thumbnail's URL is
   already revoked (Ticket B).

## Root Cause Hints

- **A:** every `createObjectURL` allocates a new handle; picking a new
  file just overwrites the *string* in state and leaks the old handle.
  Revoke the previous URL when replacing it (and don't revoke one that
  something still displays).
- **B:** revocation is not "free the string" — it invalidates the URL for
  any *future* fetch, including the `<img>` that hasn't loaded it yet.
  Revoke when the URL stops being **displayed** (replacement/unmount),
  not when your code stops holding it.

## Requirements for the Fix

- Re-picking releases the previous preview URL — exactly one alive after
  three picks (Red A).
- The attached thumbnail's URL is still alive while rendered (Red B).
- Picking a file still shows a blob-URL preview (guard).
- Research topics: `URL.createObjectURL`/`revokeObjectURL` semantics and
  blob memory pinning, and object-URL lifecycle patterns in React
  (revoke on replace / on unmount).
