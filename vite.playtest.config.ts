import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { defineVersao } from './vite.shared.ts';
import { perfilDeArte } from './vite.perfil.ts';
import { audioEmbutido } from './vite.audio.ts';

// Build de playtest: um único index.html com JS, mapas, sprites e fonte embutidos.
export default defineConfig({
  base: './',
  define: { ...defineVersao, __QA__: 'false' },
  plugins: [perfilDeArte(), audioEmbutido(), viteSingleFile()],
  build: {
    outDir: 'dist-playtest',
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 100_000,
    cssCodeSplit: false,
  },
});
