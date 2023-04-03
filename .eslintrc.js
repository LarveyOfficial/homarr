module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'mantine',
    'plugin:@next/next/recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['@typescript-eslint', 'react-hooks', 'react', 'unused-imports', 'jsx-a11y'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'import/no-cycle': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-children-prop': 'off',
    'unused-imports/no-unused-imports': 'warn',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-imports': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react/prop-types': 'off',
    'no-continue': 'off',
    'linebreak-style': 0,
  },
  root: true,
};
