const { FlatCompat } = require('@eslint/eslintrc');
const typescript = require('typescript-eslint');

const compat = new FlatCompat();

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**', '.eslintrc.js'],
  },
  ...typescript.configs.recommended,
  ...compat.extends('plugin:prettier/recommended'),
  {
    languageOptions: {
      parser: typescript.parser,
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescript.plugin,
      'simple-import-sort': require('eslint-plugin-simple-import-sort'),
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      '@typescript-eslint/no-floating-promises': ['error'],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-return-await': 'off',
      '@typescript-eslint/promise-function-async': 'error',
    },
  },
];
