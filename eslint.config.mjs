import parser from '@typescript-eslint/parser';
import ts from '@typescript-eslint/eslint-plugin';

export default [
  { ignores: ['node_modules/**', '.next/**', 'tools/**', 'source/**', '.data/**', '.abacusai/**', 'db/migrations/**', 'next-env.d.ts', 'playwright-report/**', 'test-results/**'] },
  { files: ['**/*.ts', '**/*.tsx'], languageOptions: { parser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } } }, plugins: { '@typescript-eslint': ts }, rules: { '@typescript-eslint/no-explicit-any': 'error', '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }] } },
];
