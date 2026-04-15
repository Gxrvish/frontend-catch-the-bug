import fs from "fs";
import path from "path";

const PAGE_FILES = new Set(["page.tsx", "page.ts", "page.jsx", "page.js"]);

function isRouteGroup(segment: string): boolean {
    return segment.startsWith("(") && segment.endsWith(")");
}

function isDynamicSegment(segment: string): boolean {
    return segment.includes("[") && segment.includes("]");
}

function shouldSkipFolder(segment: string): boolean {
    return (
        segment.startsWith(".") ||
        segment.startsWith("_") ||
        segment.startsWith("@") ||
        segment === "api"
    );
}

export function getProblemRoutes(): string[] {
    const appDir = path.join(process.cwd(), "app");
    const routes = new Set<string>();

    const walk = (dirPath: string, segments: string[]) => {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        const hasPageFile = entries.some(
            (entry) => entry.isFile() && PAGE_FILES.has(entry.name)
        );

        if (hasPageFile) {
            const urlSegments = segments.filter(
                (segment) => !isRouteGroup(segment)
            );
            const routePath = `/${urlSegments.join("/")}`;
            if (
                routePath !== "/" &&
                !urlSegments.some((segment) => isDynamicSegment(segment))
            ) {
                routes.add(routePath);
            }
        }
        for (const entry of entries) {
            if (!entry.isDirectory() || shouldSkipFolder(entry.name)) {
                continue;
            }
            walk(path.join(dirPath, entry.name), [...segments, entry.name]);
        }
    };
    walk(appDir, []);
    return Array.from(routes).sort((a, b) => a.localeCompare(b));
}
