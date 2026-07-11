// Runs the full vitest suite and records which problems are fully solved
// (every test in that problem's directory passes). The homepage reads the
// resulting app/solved.json and hides solved problems.
//
// Usage: npm run solved
//
// A problem lives at app/<name>/ with one test file. It counts as solved
// when all of its tests pass — which, given each problem's red tests
// encode the fix, means the bug is fixed.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const appDir = path.join(process.cwd(), "app");
const outFile = path.join(appDir, "solved.json");
const reportFile = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), "catch-the-bug-")),
    "vitest-report.json"
);

// Run vitest with the JSON reporter. It exits non-zero when tests fail
// (expected on main), so tolerate that and parse the report either way.
try {
    execFileSync(
        "npx",
        ["vitest", "run", "--reporter=json", `--outputFile=${reportFile}`],
        { stdio: ["ignore", "ignore", "inherit"] }
    );
} catch {
    // Non-zero exit is normal when some suites are still red.
}

if (!fs.existsSync(reportFile)) {
    console.error("No vitest report produced; leaving solved.json unchanged.");
    process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportFile, "utf8"));

// Group every test file result by its problem directory route, then keep
// only routes where no test failed.
const failedRoutes = new Set();
const seenRoutes = new Set();

const routeForFile = (filePath) => {
    const rel = path.relative(appDir, filePath);
    if (rel.startsWith("..")) {
        return null;
    }
    const segments = rel.split(path.sep);
    if (segments.length < 2) {
        return null;
    }
    return `/${segments[0]}`;
};

for (const suite of report.testResults ?? []) {
    const route = routeForFile(suite.name);
    if (!route) {
        continue;
    }
    seenRoutes.add(route);
    const suitePassed =
        suite.status === "passed" &&
        (suite.assertionResults ?? []).every((a) => a.status === "passed");
    if (!suitePassed) {
        failedRoutes.add(route);
    }
}

const solved = [...seenRoutes]
    .filter((route) => !failedRoutes.has(route))
    .sort((a, b) => a.localeCompare(b));

fs.writeFileSync(outFile, `${JSON.stringify(solved, null, 4)}\n`);
console.error(
    `Wrote ${solved.length} solved route(s) to app/solved.json:` +
        (solved.length ? `\n  ${solved.join("\n  ")}` : " (none)")
);
