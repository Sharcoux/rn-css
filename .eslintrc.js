module.exports = {
  env: {
    browser: true,
    es6: true
  },
  ignorePatterns: ['dist', 'demo'],
  extends: [
    'plugin:react/recommended',
    'standard',
    'plugin:jest/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'jest'
  ],
  rules: {
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-use-before-define': 'off',
    'multiline-ternary': 'off',
    'brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
    'linebreak-style': ['error', 'unix']
  }
}
