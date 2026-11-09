import { defineConfig } from 'vitest/config';
import { defineVersao } from './vite.shared.ts';

export default defineConfig({
  define: defineVersao,
  test: { include: ['tests/**/*.test.ts'] },
});
