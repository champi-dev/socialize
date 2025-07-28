module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'next/core-web-vitals',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
  },
  overrides: [
    {
      files: ['cypress/**/*.{js,ts}'],
      env: {
        'cypress/globals': true,
      },
      extends: ['plugin:cypress/recommended'],
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'client/node_modules/',
    'client/.next/',
    'client/out/',
    '.next/',
    'out/',
    'coverage/',
    '*.config.js',
    '*.config.ts',
  ],
};