import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['.next/*', 'node_modules/*', 'dist/*', 'supabase/**/*.sql', 'next-env.d.ts'],
  }
);
