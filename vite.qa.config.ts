import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { defineVersao } from './vite.shared.ts';
import { perfilDeArte } from './vite.perfil.ts';

// BUILD DE QA (npm run build:qa -> dist-qa/index.html). Igual ao playtest, mais o gancho de QA
// (window.__estado e window.__teleportar, flag __QA__ = true). NÃO é playtest nem release: não publicar.
// Ver tools/build-qa.md.
export default defineConfig({
  base: './',
  define: { ...defineVersao, __QA__: 'true' },
  plugins: [perfilDeArte(), viteSingleFile()],
  build: {
    outDir: 'dist-qa',
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 100_000,
    cssCodeSplit: false,
  },
});
