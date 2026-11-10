import { defineConfig } from 'vite';
import { defineVersao } from './vite.shared.ts';
import { perfilDeArte } from './vite.perfil.ts';
import { audioEmbutido } from './vite.audio.ts';

export default defineConfig({
  base: './',
  define: { ...defineVersao, __QA__: 'false' },
  plugins: [perfilDeArte(), audioEmbutido()],
  build: { outDir: 'dist', chunkSizeWarningLimit: 2000 },
});
