const js = require("@eslint/js");
const globals = require("globals");
const reactHooks = require("eslint-plugin-react-hooks");
const reactRefresh = require("eslint-plugin-react-refresh");
const tseslint = require("typescript-eslint");
const nextPlugin = require("@next/eslint-plugin-next");

module.exports = tseslint.config(
  { ignores: ["dist", ".next", "next-env.d.ts"] },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@next/next": nextPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",
      "no-console": "warn",
      "eqeqeq": "error",
      "curly": "error",
      "prefer-const": "error",
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ]
  },
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/ui/sidebar.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  }
);
