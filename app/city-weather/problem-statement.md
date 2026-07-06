# City Weather Eternal Skeleton Problem Statement

## Context

The weather page shows a row of city buttons. Picking one mounts a
`WeatherPanel` inside a `<Suspense>` boundary; the panel reads its forecast
with React 19's `use()` hook, and the boundary shows a skeleton while the
request is in flight. The fake gateway (`weatherApi.ts`) answers in ~200ms.

QA ticket from a consumer-weather scale company: "Pick any city and the
skeleton never goes away. Network tab shows the forecast request completing
over and over — dozens of times for a single click — but the panel never
renders. Dev console prints a warning about _an uncached promise_."

## Problem

The forecast request succeeds every time, yet the panel stays suspended
forever. The component re-requests the same forecast in a loop: resolve,
retry, re-request, suspend, resolve, retry…

## Failure Scenario

1. Click **Lisbon**.
2. Skeleton appears (correct).
3. ~200ms later the forecast resolves — and instead of the panel, the
   skeleton stays. Another identical request fires. Repeat forever.

## Fast Reproduction Path

1. Open `/city-weather`, click any city, watch the skeleton never resolve.
2. Open the console: React 19 logs a precise warning about what
   `WeatherPanel` handed to `use()`. Read it word for word.
3. `CityWeather.test.tsx` encodes the fix: after picking Lisbon, the
   forecast must actually appear.

## Root Cause Summary

When a component suspends, React throws the render away. When the awaited
promise settles, React **re-runs the component from scratch** and expects to
find the _same_ promise, now resolved. Look at where `WeatherPanel` obtains
the promise it passes to `use()`, and ask what happens to that expectation
on the retry render. The `use()` API is deliberately strict here — the
promise's identity must survive re-renders, which means it cannot be born
inside the render itself.

## Requirements for the Fix

- Picking a city must show its forecast once the request lands — encoded in
  `CityWeather.test.tsx`.
- The picker and the skeleton-while-loading behavior must keep working
  (also encoded).
- Keep `use()` + Suspense — the fix is to satisfy their contract, not to
  retreat to `useEffect`/`useState`. Research topics: React 19 `use()`,
  how Suspense retries work (render, discard, retry), caching promises
  outside render (module-level cache keyed by input), why frameworks and
  libraries (React Query, Next.js RSC) hand you _stable_ promises.
