module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint", "react-hooks", "react-refresh"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      {
        allowConstantExport: true
      }
    ]
  },
  overrides: [
    {
      files: ["src/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@google/genai", "@google/genai/*"],
                message:
                  "The Gemini SDK must never be imported from client code."
              },
              {
                group: [
                  "**/netlify/**",
                  "../netlify/*",
                  "../../netlify/*"
                ],
                message:
                  "Netlify functions code must not be imported from client bundle."
              }
            ]
          }
        ]
      }
    }
  ],
  ignorePatterns: ["dist", "coverage", "node_modules"]
};
