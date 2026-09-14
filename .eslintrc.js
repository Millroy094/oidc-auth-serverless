module.exports = {
  root: true,
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'react', 'react-hooks'],
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
      rules: {},
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
    {
      files: ['*.js', '*.jsx'],
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:prettier/recommended',
      ],
      rules: {},
    },
    {
      files: ['*.ts', '*.js'],
      env: {
        node: true,
        es6: true,
      },
      rules: {},
    },
  ],
};
