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

    it("audits every CTA click in order, once each", () => {
        render(<ClickAudit />);

        fireEvent.click(screen.getByTestId("upgrade-label"));
        fireEvent.click(screen.getByTestId("promo"));
        fireEvent.click(screen.getByTestId("upgrade"));

        // Both repairs have to hold at the same time, and neither may
        // double-count by listening in two phases.
        expect(getAuditLog()).toEqual(["upgrade", "promo", "upgrade"]);
    });

    it("keeps the on-screen count in step with the log", () => {
        render(<ClickAudit />);

        fireEvent.click(screen.getByTestId("promo"));
        fireEvent.click(screen.getByTestId("upgrade-label"));

        expect(screen.getByTestId("audit-count")).toHaveTextContent("2");
    });

    it("ignores clicks that land outside any CTA", () => {
        render(<ClickAudit />);

        fireEvent.click(screen.getByText(/Third-party promo widget/));
        fireEvent.click(screen.getByText("CTA Click Audit"));
        expect(getAuditLog()).toEqual([]);

        // Walking up from the target must stop at the nearest opt-in
        // ancestor, not audit everything on the way to <html>.
        fireEvent.click(screen.getByTestId("promo"));
        expect(getAuditLog()).toEqual(["promo"]);
    });

    it("stops auditing once it unmounts", () => {
        const { unmount } = render(<ClickAudit />);
        fireEvent.click(screen.getByTestId("upgrade-label"));
        expect(getAuditLog()).toEqual(["upgrade"]);

        unmount();

        const stray = document.createElement("button");
        stray.setAttribute("data-cta", "stray");
        document.body.appendChild(stray);
        fireEvent.click(stray);
        stray.remove();

        // A listener that outlives the page keeps auditing forever.
        expect(getAuditLog()).toEqual(["upgrade"]);
    });

    it("audits a direct CTA click exactly once", () => {
        render(<ClickAudit />);

        fireEvent.click(screen.getByTestId("upgrade"));

        expect(getAuditLog()).toEqual(["upgrade"]);
    });
});
