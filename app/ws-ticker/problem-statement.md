# WS Ticker Problem Statement

## Context

A live price ticker streams over a WebSocket. The component opens a
socket per symbol, appends incoming ticks, and lets you send a ping up
the wire. Tests run against a fake `WebSocket` (manual
`open()`/`message()`/`close()`). Three tickets.

## Ticket A — "The feed doubles after switching symbols"

Switch the watched symbol and every incoming tick starts arriving twice,
then three times after another switch. Old sockets from previous symbols
are still connected and still delivering — they were never closed.

## Ticket B — "Only the latest tick survives"

Ticks that arrive in quick succession overwrite each other — the list
shows just the most recent one instead of the running feed.

## Ticket C — "Pings sent before connect vanish"

Hit Send ping before the socket finishes connecting and the message is
silently dropped — it never reaches the server even after the connection
opens.

## Fast Reproduction Path

1. Open `/ws-ticker`.
2. Let the socket open, switch symbol, then push a tick to the open
   sockets → it's delivered twice (Ticket A).
3. Push two ticks back-to-back → only the second shows (Ticket B).
4. Click Send ping before the socket opens, then open it → the ping was
   never sent (Ticket C).

## Root Cause Hints

- **A:** the connect effect (keyed on the symbol) opens a new socket but
  its cleanup is empty — it never `close()`s the previous socket, so old
  connections leak and keep firing `onmessage`. An effect that opens a
  socket must close it in cleanup (and on unmount).
- **B:** `onmessage` does `setMessages([...messages, data])`, closing over
  the `messages` value captured when the handler was bound — a stale
  snapshot that never updates, so each message replaces the last. Use a
  functional update (`prev => [...prev, data]`) or read the latest via a
  ref.
- **C:** `publish` calls `ws.send(...)` unconditionally, but a socket in
  the `CONNECTING` state can't send — the message is dropped. Buffer
  outgoing messages while connecting and flush the queue in `onopen`.

## Requirements for the Fix

- Reconnecting closes the old socket; a tick is delivered once (Red A).
- Every message is appended, not overwritten (Red B).
- A message sent before open is delivered once the socket opens (Red C).
- A single received message renders once (guard).
- Research topics: WebSocket lifecycle inside effects (open/close/cleanup)
  and connection leaks, stale closures over state in long-lived handlers,
  `readyState` and buffering sends until `OPEN`.
