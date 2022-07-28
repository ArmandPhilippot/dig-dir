module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:ava/recommended'],
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    sourceType: 'module',
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
        project: './tsconfig.eslint.json',
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        warnOnUnsupportedTypeScriptVersion: true,
      },
      plugins: ['@typescript-eslint'],
    },
  ],
};
