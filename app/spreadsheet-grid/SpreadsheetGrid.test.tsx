// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { _resetEngine } from "./formulaEngine";
import { SpreadsheetGrid } from "./SpreadsheetGrid";

const editCell = (cellId: string, raw: string) => {
    fireEvent.click(screen.getByTestId(`cell-${cellId}`));
    fireEvent.change(screen.getByLabelText(`formula for ${cellId}`), {
        target: { value: raw },
    });
};

describe("SpreadsheetGrid", () => {
    beforeEach(() => {
        _resetEngine();
    });

    it("recomputes a formula when a referenced cell changes", () => {
        render(<SpreadsheetGrid />);

        // C1 = A1 + B2 = 2 + 3 = 5 initially.
        expect(screen.getByTestId("cell-C1")).toHaveTextContent("5");

        editCell("A1", "10");

        expect(screen.getByTestId("cell-C1")).toHaveTextContent("13");
    });

    it("shows a cycle marker instead of crashing on circular references", () => {
        render(<SpreadsheetGrid />);

        editCell("A3", "=B3");
        editCell("B3", "=A3");

        expect(screen.getByTestId("cell-A3")).toHaveTextContent("#CYCLE!");
        expect(screen.getByTestId("cell-B3")).toHaveTextContent("#CYCLE!");
    });

    it("evaluates literals and a one-level formula on load", () => {
        render(<SpreadsheetGrid />);

        expect(screen.getByTestId("cell-A1")).toHaveTextContent("2");
        expect(screen.getByTestId("cell-B2")).toHaveTextContent("3");
        expect(screen.getByTestId("cell-C1")).toHaveTextContent("5");
    });
});
