import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import nodePlugin from "eslint-plugin-node";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    plugins: {
      import: importPlugin,
      node: nodePlugin,
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          modules: true,
        },
      },
    },
    rules: {
      // ESM enforcement rules
      "import/extensions": [
        "error",
        "always",
        {
          ignorePackages: true,
          pattern: {
            js: "always",
            mjs: "always",
          },
        },
      ],
      "import/no-commonjs": "error",
      "import/no-amd": "error",
      "import/prefer-default-export": "off",
      "import/no-default-export": "off",

      // Modern import practices
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
];
