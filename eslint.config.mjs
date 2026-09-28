// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config({
  extends: [eslint.configs.recommended, tseslint.configs.recommended],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-use-before-define': [
      'error',
      { variables: false },
    ],
    '@typescript-eslint/promise-function-async': 'off',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-shadow': 'warn',
    'no-use-before-define': 'off',
  },
  files: ['src/**/*.ts[x]'],
  ignores: ['node_modules', '.next'],
})
