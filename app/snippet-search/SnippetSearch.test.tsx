// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SnippetSearch } from "./SnippetSearch";

const type = (text: string) =>
    fireEvent.change(screen.getByTestId("query"), { target: { value: text } });

describe("SnippetSearch", () => {
    it("treats the query as literal text, not a pattern", () => {
        render(<SnippetSearch />);

        // "(v2" is what a user has typed halfway through "(v2)" — as a
        // pattern it's an unterminated group.
        expect(() => type("(v2")).not.toThrow();

        const rows = screen.getAllByTestId("row");
        expect(rows).toHaveLength(1);
        expect(rows[0]).toHaveTextContent("Exporting slides (v2) to PDF");
    });

    it("matches regex metacharacters literally", () => {
        render(<SnippetSearch />);

        type("(v2)");

        // As a pattern "(v2)" would match a bare "v2" anywhere; as literal
        // text it matches exactly one row.
        const rows = screen.getAllByTestId("row");
        expect(rows).toHaveLength(1);
        expect(rows[0].querySelectorAll('[data-testid="hit"]')).toHaveLength(1);
    });

    it("shows every row that matches the query", () => {
        render(<SnippetSearch />);

        type("beta");

        expect(screen.getAllByTestId("row")).toHaveLength(4);
    });

    it("highlights a match whose case differs from the query", () => {
        render(<SnippetSearch />);

        type("beta");

        // The first row always survives the filter; its "Beta" must carry
        // the highlight even though the query is lowercase.
        const first = screen.getAllByTestId("row")[0];
        const hits = first.querySelectorAll('[data-testid="hit"]');
        expect(hits).toHaveLength(1);
        expect(hits[0]).toHaveTextContent(/beta/i);
    });

    it("finds and highlights an exact-case unique match", () => {
        render(<SnippetSearch />);

        type("Gamma");

        const rows = screen.getAllByTestId("row");
        expect(rows).toHaveLength(1);
        expect(rows[0].querySelectorAll('[data-testid="hit"]')).toHaveLength(1);
    });
});
