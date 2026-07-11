# Survey Runner Problem Statement

## Context

The pulse survey renders three questions, tracks answers with a reducer,
resolves answered questions through a precomputed index
(`buildQuestionIndex()` — "far too heavy to run more than once per
session", says the comment), and records each answer to product
analytics. Two tickets from a forms-platform-scale company, both flavors
of "this code runs more often than you think".

## Ticket A — "Every answer is counted twice"

In development (and in the StrictMode-wrapped test), a single answer
click produces **two** analytics events. Product's funnel numbers are
double the real ones on every dev/staging environment.

## Ticket B — "The heavy index rebuilds on every keystroke"

The build counter climbs by one per character typed in the notes box.
The comment above the `useState` call insists the initializer runs once —
the counter says otherwise.

## Fast Reproduction Path

1. Answer any question with StrictMode on → `getAnalyticsLog()` has two
   entries (Ticket A).
2. Type 4 characters in notes → `getBuildCount()` is 5 (Ticket B).

## Root Cause Hints

React reserves the right to call your render-phase code **more than once
per committed update** — that's not a bug, it's the mechanism StrictMode
uses to expose impurity. Two different render-phase rules are violated:

- **A:** reducers must be *pure*. React (especially under StrictMode)
  invokes a reducer twice with the same action to check that it returns
  the same result — safe only if the reducer does nothing but compute.
  `recordAnswer()` inside it is a side effect; it happily fires on both
  invocations. Side effects belong where things *happen once per user
  action*: the event handler (or an effect keyed to committed state).
- **B:** `useState(buildQuestionIndex())` — look at what JavaScript does
  *before* `useState` even runs. The argument is evaluated on **every**
  render; React merely ignores the result after the first. The comment
  is true of the initializer *function* form — which this isn't. One
  character of difference: pass the function, don't call it.

## Requirements for the Fix

- One analytics event per answer, StrictMode included (Red A).
- Index built exactly once regardless of typing (Red B).
- Questions render, answers highlight, the summary resolves prompts
  through the index, notes work (guard).
- Keep the reducer and keep the index in state — fix *where* the side
  effect lives and *how* the initializer is passed. Research topics:
  "Keeping Components Pure" and why StrictMode double-invokes
  renders/reducers/initializers, `useState` lazy initialization,
  where analytics calls belong (handlers vs effects).
