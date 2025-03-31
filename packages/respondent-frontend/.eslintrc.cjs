module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended'],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'tsconfig.tsbuildinfo'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'react-hooks/exhaustive-deps': 'off',
    'react-refresh/only-export-components': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
  },
};
