module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    'client/node_modules/',
    'client/.next/',
    'client/out/',
    'coverage/',
    '*.config.js',
  ],
};