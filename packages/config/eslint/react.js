import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import base from './base.js';

/** Config ESLint para paquetes con React (apps/web, packages/ui). */
export default [
  ...base,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
];
