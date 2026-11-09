# Build de QA (gancho de teste)

- Comando: `npm run build:qa`
- Saída: `dist-qa/index.html` (um arquivo, como o playtest). Caminho absoluto: `<raiz do repositório>/dist-qa/index.html`.
- Não é playtest nem release. Não publicar nem enviar ao Diretor como playtest.
- O que expõe, só neste build (flag `__QA__ = true`):
  - `window.__estado()` retorna `{ mapa, tileX, tileY, direcao, emFade, travado, fase, nick, farejo, dicaAberta }`. `tileX`/`tileY` são o tile local da subárea onde estão os pés do Sobrinho; `centroX`/`centroY` são o centro dos pés em px, relativo à caixa da subárea. `emFade` é true durante a troca de subárea. `travado` é true com diálogo, painel ou fade. Retorna `null` antes da casa carregar.
  - `window.__teleportar(mapa, spawnId)` carrega a subárea `mapa` no spawn `spawnId`, sem fade e sem liberar gatilho. Cancela um fade pendente. Não conclui fases: a subárea precisa estar aberta na missão atual. Retorna false se a casa não está carregada.
  - `window.__irParaFase(fase)` conclui as fases antes de `fase` pelas regras do domínio (como o jogo), e chama DevolverControle depois de cada luzes ou parte (o Nick vai dormir no tile da próxima fase). Não move o sobrinho: depois use `__teleportar`. Ex.: `__irParaFase('parte2'); __teleportar('quarto', 'P2')`. Devolve a fase atual ou `null`.
  - `animacaoDoNick`/`animandoNick` podem ser null/false na troca de cena: o sprite do Nick é destruído pelo Phaser ao encerrar a cena Casa (nunca pelo jogo), e a leitura é tolerante.
  - `window.__analogico()` (ADR-007 12.3; GDD 18.19): `{ dono, direcao, dx, dy, bolinha: { x, y } }` do joystick (dono = há um dedo comandando; direção engajada; deslocamento do dedo em CSS px; centro da bolinha na janela). Null sem toque.
  - Notas: `travado` fica true ao entrar na Sala escura por teleporte, por causa do aviso "Está tudo escuro!" (primeira entrada, GDD 14.1); um Z fecha o diálogo.
  - `window.__alvosDeToque()` (Marco 5, ADR-007 seção 12.3) devolve, em CSS px da janela, cada alvo de toque: `origem: "dom"` para o joystick (`analogico`, a base de 120 CSS px; bolinha e setores não são alvo), `a` e `b` (só os visíveis agora) e `origem: "canvas"` para as zonas do Phaser (menus, cartões, teclas do painel, "?", "Continuar"; o nome é `<cena>:<tipo>`). Serve para medir TQ2, TQ7 e TQ19 sem estimativa. Os controles em DOM são elementos com `data-alvo`.
  - Emular toque no Chromium (ADR-007 seção 13): contexto Playwright com `hasTouch: true, isMobile: true`, `deviceScaleFactor` 2 para a nitidez; um dedo com `page.touchscreen.tap(x, y)`; dedos presos e arrasto com `Input.dispatchTouchEvent` (sessão CDP, `touchStart`, `touchMove`, `touchEnd`, com `id` fixo por dedo); rotação com `page.setViewportSize`, sem recarregar. Tudo isso é "emulado (CDP)" ou "emulado (Playwright)" no relatório.
  - Exemplo de medida dos controles: `const alvos = await page.evaluate(() => window.__alvosDeToque()); alvos.filter((a) => a.origem === 'dom')`.
- Garantia: `npm run build:playtest` roda `tools/verificar-sem-gancho.mjs`, que falha se o gancho aparecer no HTML de playtest. O teste `tests/qa-gancho.test.ts` confere a mesma regra.
