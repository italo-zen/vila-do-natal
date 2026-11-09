# Build de QA (gancho de teste)

- Comando: `npm run build:qa`
- Saída: `dist-qa/index.html` (um arquivo, como o playtest). Caminho absoluto: `<raiz do repositório>/dist-qa/index.html`.
- Não é playtest nem release. Não publicar nem enviar ao Diretor como playtest.
- O que expõe, só neste build (flag `__QA__ = true`):
  - `window.__estado()` retorna `{ mapa, tileX, tileY, direcao, emFade, travado, fase }`. `tileX`/`tileY` são o tile local da subárea onde estão os pés do Sobrinho; `centroX`/`centroY` são o centro dos pés em px, relativo à caixa da subárea. `emFade` é true durante a troca de subárea. `travado` é true com diálogo, painel ou fade. Retorna `null` antes da casa carregar.
  - `window.__teleportar(mapa, spawnId)` carrega a subárea `mapa` no spawn `spawnId`, sem fade e sem liberar gatilho. Retorna false se a casa não está carregada.
- Garantia: `npm run build:playtest` roda `tools/verificar-sem-gancho.mjs`, que falha se o gancho aparecer no HTML de playtest. O teste `tests/qa-gancho.test.ts` confere a mesma regra.
