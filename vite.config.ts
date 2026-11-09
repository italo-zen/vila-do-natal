import { defineConfig } from 'vite';
import { defineVersao } from './vite.shared.ts';
import { perfilDeArte } from './vite.perfil.ts';

export default defineConfig({
  base: './',
  define: { ...defineVersao, __QA__: 'false' },
  plugins: [perfilDeArte()],
  build: { outDir: 'dist', chunkSizeWarningLimit: 2000 },
});
