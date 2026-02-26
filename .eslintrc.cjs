/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    extends: ["@react-native", "prettier"],
    env: {
        es2021: true,
        node: true,
    },
    globals: {
        __DEV__: "readonly",
    },
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ["react-hooks", "import", "unused-imports"],
    ignorePatterns: [
        "node_modules/",
        "android/",
        "ios/",
        "vendor/",
        "patches/",
        "docs/",
        "coverage/",
        "dist/",
        "build/",
    ],
    settings: {
        "import/resolver": {
            node: {
                extensions: [".js", ".jsx", ".ts", ".tsx"],
            },
        },
    },
    rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        "import/order": [
            "warn",
            {
                groups: [
                    "builtin",
                    "external",
                    "internal",
                    "parent",
                    "sibling",
                    "index",
                    "object",
                    "type",
                ],
                "newlines-between": "always",
                alphabetize: {
                    order: "asc",
                    caseInsensitive: true,
                },
            },
        ],
        "import/no-unresolved": "off",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "unused-imports/no-unused-imports": "warn",
        "unused-imports/no-unused-vars": [
            "warn",
            {
                vars: "all",
                varsIgnorePattern: "^_",
                args: "after-used",
                argsIgnorePattern: "^_",
            },
        ],
        eqeqeq: ["error", "always", { null: "ignore" }],
        "react-native/no-inline-styles": "off",
        "no-void": ["warn", { allowAsStatement: true }],
        "no-console":
            process.env.NODE_ENV === "production"
                ? ["error", { allow: ["warn", "error"] }]
                : ["warn", { allow: ["warn", "error"] }],
    },
    overrides: [
        {
            files: [
                "**/*.test.{js,jsx,ts,tsx}",
                "**/*.spec.{js,jsx,ts,tsx}",
                "jest.setup.js",
            ],
            env: {
                jest: true,
            },
        },
        {
            files: [
                "*.config.js",
                "*.config.cjs",
                "babel.config.js",
                "metro.config.js",
                "jest.config.js",
            ],
            env: {
                node: true,
            },
        },
        {
            files: ["src/utils/logger.ts"],
            rules: {
                "no-console": "off",
            },
        },
        {
            files: ["src/services/otaService.ts"],
            rules: {
                "no-bitwise": "off",
            },
        },
    ],
};
