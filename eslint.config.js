const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierConfig = require('eslint-config-prettier');
const importPlugin = require('eslint-plugin-import');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const prettierPlugin = require('eslint-plugin-prettier');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const reactRefreshPlugin = require('eslint-plugin-react-refresh').default;
const globals = require('globals');

// `detect` requires eslint-plugin-react to `require('react')` from the
// process cwd, which fails/warns when linting runs from the repo root since
// react is only installed in packages/frontend's node_modules. Pin the
// version explicitly instead (keep in sync with packages/frontend/package.json).
const reactSettings = {
  react: {
    version: '19.3.0',
  },
};

// Shared with both the TS/TSX and JS/JSX blocks so import resolution/order
// rules understand the '@' path alias (frontend) as well as plain relative
// imports (backend).
const importSettings = {
  ...importPlugin.flatConfigs.typescript.settings,
  'import/resolver': {
    typescript: {
      project: [
        'packages/frontend/tsconfig.json',
        'packages/backend/tsconfig.json',
      ],
    },
  },
};

// Common set of `eslint-plugin-import` rules layered on top of its
// typescript-aware base config. `no-unresolved`/`named`/`namespace`/`default`
// are dropped since TypeScript's own type-checker already catches these,
// more accurately, for typed code.
const importRules = {
  ...importPlugin.flatConfigs.typescript.rules,
  'import/no-unresolved': 'off',
  'import/named': 'off',
  'import/namespace': 'off',
  'import/default': 'off',
  'import/no-duplicates': 'error',
  'import/no-self-import': 'error',
  'import/no-cycle': 'error',
  'import/order': [
    'warn',
    {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'never',
      alphabetize: { order: 'asc', caseInsensitive: true },
    },
  ],
};

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.min.js',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        projectService: true,
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Type-aware rule set (superset of `recommended`) — catches real bugs
      // like floating/misused promises and unsafe `any` usage, not just
      // syntactic issues. Requires `parserOptions.projectService` above.
      ...tsPlugin.configs['recommended-type-checked'].rules,
      // TypeScript's own checker already covers these (and does so more
      // accurately for things like `no-undef`, which doesn't understand
      // ambient/global types such as the `React` namespace).
      ...tsPlugin.configs['eslint-recommended'].overrides[0].rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...jsxA11yPlugin.flatConfigs.recommended.rules,
      ...importRules,
      // Only the two long-standing core rules; the plugin's new "recommended"
      // (v7+) also enables ~14 React Compiler rules, which is a much larger
      // scope change than a routine dependency bump.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
      // Unlike the default `after-used`, this also flags unused parameters
      // that precede a used one (e.g. an unused `req` in an Express handler
      // `(req, res) => ...`), matching what noUnusedParameters already
      // enforces at the TS compiler level.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Express route handlers are legitimately async (returning a Promise)
      // even though Express's own types expect a void-returning callback.
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false, arguments: false } },
      ],
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
    settings: {
      ...reactSettings,
      ...importSettings,
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...jsxA11yPlugin.flatConfigs.recommended.rules,
      ...importRules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
    settings: {
      ...reactSettings,
      ...importSettings,
    },
  },
  {
    files: ['packages/frontend/**/*.ts', 'packages/frontend/**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    plugins: {
      'react-refresh': reactRefreshPlugin,
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];
