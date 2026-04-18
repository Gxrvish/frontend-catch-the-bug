import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";

export default [
    ...nextVitals,
    {
        plugins: {
            prettier: pluginPrettier,
            "unused-imports": unusedImports,
            "simple-import-sort": simpleImportSort,
        },

        rules: {
            // Formatting
            quotes: ["error", "double"],
            indent: ["error", 4],
            "no-trailing-spaces": "error",

            // Unused
            "no-unused-vars": "off",
            "unused-imports/no-unused-vars": [
                "error",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],
            "unused-imports/no-unused-imports": "error",

            // Imports
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",

            // Prettier
            "prettier/prettier": [
                "error",
                {
                    tabWidth: 4,
                    singleQuote: false,
                    semi: true,
                    trailingComma: "es5",
                },
            ],

            // Best practices
            eqeqeq: ["error", "always"],
            curly: "error",
            "nonblock-statement-body-position": ["error", "below"],
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "no-debugger": "error",
            "prefer-const": "error",
            "no-var": "error",
        },
    },

    prettier,
];
