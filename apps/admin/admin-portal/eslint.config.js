const nx = require('@nx/eslint-plugin');
const baseConfig = require('../../../eslint.config.js');

module.exports = [
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // Admin portal uses both native confirm() and useConfirm() hook — allow both
      'no-restricted-globals': 'off',
      // Intentional empty arrow function placeholders are acceptable
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      // Empty catch blocks are acceptable for graceful degradation
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    // Service worker uses self as the global scope — this is correct and expected
    files: ['**/public/sw.js', '**/sw.js', '**/service-worker.js'],
    env: { serviceworker: true },
    globals: { self: 'readonly' },
    rules: { 'no-restricted-globals': 'off' },
  },
];

