# News Feed Duplicate Article Problem Statement

## Context

The city news feed loads five articles, with a **Load more** button that
appends the next five. The newsroom publishes around the clock — including,
deterministically in this repo, one breaking story that lands right after
the first page is served.

QA ticket from a social-feed-scale company: "After tapping Load more the
console logs `Encountered two children with the same key` — the API
returned an article the client already had, and React quietly dropped the
duplicate. Worse: because the page window shifted, the story at the far end
**never loads at all**. Users get nine stories instead of ten and the
missing one is unreachable. It reproduces every time a story is published
between two page loads, which at our volume is *constantly*."

## Problem

Pagination uses `offset: articles.length`. Offsets index into the list *as
it is right now* — but the list moved. When a new article is prepended
between requests, every existing article shifts down one position, so the
next offset window overlaps the previous one and re-serves the last item of
page one.

## Failure Scenario

1. Client fetches `offset=0, limit=5` → articles 1–5.
2. Newsroom prepends a breaking article. Old article 5 is now at index 5.
3. Client fetches `offset=5, limit=5` → starts at index 5 → old article 5
   again, plus 6–9. Duplicate rendered; duplicate React key warned.

## Fast Reproduction Path

1. Open `/news-feed`, click **Load more** once — the console shows the
   duplicate-key warning for "Food market moves to the old depot", and
   "Harbor baths pass water-quality checks" never appears.
2. `NewsFeed.test.tsx` encodes the fix: after Load more, the last story
   must be present and every rendered article id unique.

## Root Cause Summary

The comment in `loadMore` insists offset and list length "can never drift
apart" — true for the *client's* list, but the offset is interpreted
against the *server's* list, and the server's list changes underneath live
readers. Offset pagination is only stable over immutable data. Look at what
else `newsApi.ts` exports: the server already speaks a pagination dialect
that survives insertions, keyed not by position but by *identity* — "give
me what comes after the last article I have."

## Requirements for the Fix

- After Load more, all ten stories must be present with no article id
  appearing twice — encoded in `NewsFeed.test.tsx`.
- The first page must still render the five seeded stories in order (guard
  test).
- Fix the pagination strategy — don't deduplicate the symptom away by
  filtering ids client-side after over-fetching. Research topics: offset vs
  cursor (keyset) pagination, why feeds paginate by cursor, opaque cursor
  tokens, the duplicate-key warning as a data-integrity smell.
