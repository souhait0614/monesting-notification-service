module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import", "unused-imports"],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "warn",
    "import/order": "warn",
  },
};
