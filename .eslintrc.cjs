module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  env: {
    es6: true,
    node: true,
  },
  overrides: [
    {
      files: ['**/*.ts'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2018,
        project: './tsconfig.json',
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        warnOnUnsupportedTypeScriptVersion: true,
      },
      plugins: ['@typescript-eslint'],
    },
  ],
};
