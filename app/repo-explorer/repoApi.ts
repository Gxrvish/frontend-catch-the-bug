import type { Repo, UserProfile } from "./repoExplorer.types";

export const USERS: UserProfile[] = [
    { username: "nova-dev", displayName: "Nova Ito" },
    { username: "pixel-forge", displayName: "Priya Kale" },
    { username: "quantum-cat", displayName: "Quinn Alvarez" },
];

const REPOS: Record<string, Repo[]> = {
    "nova-dev": [
        {
            name: "nova-cli",
            description: "Terminal UI toolkit",
            stars: 4821,
            language: "Rust",
        },
        {
            name: "hyperfetch",
            description: "Streaming HTTP client",
            stars: 2310,
            language: "TypeScript",
        },
        {
            name: "dotfiles",
            description: "Nova's machine setup",
            stars: 87,
            language: "Shell",
        },
    ],
    "pixel-forge": [
        {
            name: "shader-lab",
            description: "WebGPU shader playground",
            stars: 9204,
            language: "TypeScript",
        },
        {
            name: "sprite-packer",
            description: "Texture atlas generator",
            stars: 1533,
            language: "Go",
        },
        {
            name: "palette-kit",
            description: "Color science utilities",
            stars: 640,
            language: "TypeScript",
        },
    ],
    "quantum-cat": [
        {
            name: "qsim",
            description: "Quantum circuit simulator",
            stars: 12750,
            language: "Python",
        },
        {
            name: "entangle",
            description: "Distributed state sync",
            stars: 3980,
            language: "Rust",
        },
        {
            name: "schrodinger-box",
            description: "Property-based testing helpers",
            stars: 512,
            language: "Python",
        },
    ],
};

const LATENCY_MS = 300;

/** Simulated GitHub-ish API: fetch the public repos of one user. */
export const fetchRepos = (username: string): Promise<Repo[]> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve(REPOS[username] ?? []);
        }, LATENCY_MS);
    });
