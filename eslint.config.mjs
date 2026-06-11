import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "supabase/functions/**",
      "tsconfig.tsbuildinfo",
      "pnpm-lock 2.yaml",
      "pnpm-workspace 2.yaml"
    ]
  },
  {
    files: ["src/**/*.{ts,tsx}", "next.config.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },
    rules: {
      "no-constant-condition": "error",
      "no-dupe-else-if": "error",
      "no-duplicate-case": "error",
      "no-unreachable": "error"
    }
  },
  {
    files: ["eslint.config.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    }
  }
];
