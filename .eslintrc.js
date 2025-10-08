
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "@angular-eslint/template"],
  extends: [],
  overrides: [
    // TypeScript files
    {
      files: ["**/*.ts"],
      parserOptions: {
        project: "tsconfig.json",
        sourceType: "module",
      },
      rules: {
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      },
    },

    // JavaScript files
    {
      files: ["**/*.{js,mjs,cjs}"],
      rules: {
        "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      },
    },

    // Angular HTML templates
    {
      files: ["**/*.html"],
      parser: "@angular-eslint/template-parser",
      rules: {},
    },
  ],
};
