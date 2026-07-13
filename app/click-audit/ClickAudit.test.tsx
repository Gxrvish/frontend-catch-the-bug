// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { _resetAuditLog, ClickAudit, getAuditLog } from "./ClickAudit";

describe("ClickAudit", () => {
    beforeEach(() => {
        _resetAuditLog();
    });

    it("audits a CTA whose widget stops propagation", () => {
        render(<ClickAudit />);

        fireEvent.click(screen.getByTestId("promo"));

        // The widget's own behavior still works…
        expect(screen.getByTestId("promo-menu")).toBeInTheDocument();
        // …and the audit must still see the click.
        expect(getAuditLog()).toEqual(["promo"]);
    });

    it("audits a click that lands on a child of the CTA", () => {
        render(<ClickAudit />);

        // Users click the label text inside the button.
        fireEvent.click(screen.getByTestId("upgrade-label"));

        expect(getAuditLog()).toEqual(["upgrade"]);
    });

    it("audits a direct CTA click exactly once", () => {
        render(<ClickAudit />);

        fireEvent.click(screen.getByTestId("upgrade"));

        expect(getAuditLog()).toEqual(["upgrade"]);
    });
});
