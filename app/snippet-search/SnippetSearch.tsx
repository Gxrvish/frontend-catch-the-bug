"use client";

import { useState } from "react";

const ARTICLES = [
    "Beta release notes for the new editor",
    "How to join the beta program",
    "Known beta limitations and workarounds",
    "Leaving the beta and going back to stable",
    "Exporting slides (v2) to PDF",
    "Upgrading from editor v2 to v3",
    "Gamma correction settings for displays",
];

type Part = { text: string; hit: boolean };

/** Split `text` so the matched slice can be wrapped in <mark>. */
const toParts = (text: string, query: string): Part[] => {
    const at = text.indexOf(query);
    if (at === -1) return [{ text, hit: false }];
    return [
        { text: text.slice(0, at), hit: false },
        { text: text.slice(at, at + query.length), hit: true },
        { text: text.slice(at + query.length), hit: false },
    ];
};

export const SnippetSearch = () => {
    const [query, setQuery] = useState("");

    // One matcher for the whole pass; global so it can find matches
    // anywhere in the row.
    const matcher = new RegExp(query, "gi");
    const visible = query
        ? ARTICLES.filter((article) => matcher.test(article))
        : ARTICLES;

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-md space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                    Help Center
                </h2>

                <input
                    data-testid="query"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search articles"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900"
                />

                <ul className="space-y-1">
                    {visible.map((article) => (
                        <li
                            key={article}
                            data-testid="row"
                            className="rounded border border-gray-200 bg-white px-3 py-1 text-sm text-gray-900"
                        >
                            {query
                                ? toParts(article, query).map((part, index) =>
                                      part.hit ? (
                                          <mark
                                              key={index}
                                              data-testid="hit"
                                              className="bg-yellow-200"
                                          >
                                              {part.text}
                                          </mark>
                                      ) : (
                                          <span key={index}>{part.text}</span>
                                      )
                                  )
                                : article}
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
};
