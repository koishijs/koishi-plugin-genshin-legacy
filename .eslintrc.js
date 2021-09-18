/* eslint-disable no-undef */
module.exports = {
  env: {
    browser: false,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  // parser: '',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [],
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    'linebreak-style': ['warn', 'windows'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
  },
}
