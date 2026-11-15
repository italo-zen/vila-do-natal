import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { defineVersao } from './vite.shared.ts';
import { perfilDeArte } from './vite.perfil.ts';
import { audioEmbutido } from './vite.audio.ts';
import { recursosExternos } from './vite.recursos.ts';

// Build de RELEASE (ADR-009; npm run build:release -> dist-release/). index.html com código, sprites e textos; o áudio e as
// imagens de tela saem do HTML: audio/ e imagens/ com nome por hash, e recursos.json. Base relativa para o subcaminho do Pages.
export default defineConfig({
  base: './',
  define: { ...defineVersao, __QA__: 'false' },
  plugins: [perfilDeArte(), audioEmbutido('externo'), recursosExternos(), viteSingleFile()],
  build: {
    outDir: 'dist-release',
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 100_000,
    cssCodeSplit: false,
  },
});
