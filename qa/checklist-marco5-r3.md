# Checklist QA: Marco 5 (v0.9.0), rodada 3 (2026-11-09)

Escrito ANTES da execução. Início: 1794248925 (`date +%s`). Limite: 15 min CHEIOS, só para no relógio.
Build: `dist-qa/index.html`. Toque emulado (Chromium, hasTouch, isMobile, DPR 2; CDP e `touchscreen.tap`). Teclado com `page.keyboard` (janela 960×640 sem toque). Marcado "emulado (CDP)", "emulado (Playwright)" ou "teclado".
Nitidez do canvas: buffer 480×352 ampliado com pixelated é o esperado (desvio b, ADR-007). Não é falha.

## Ordem (pedido do Orquestrador)
1. Caminho completo até os créditos com TOQUE: `__irParaFase('parte3')` para pular as partes 1 e 2; jogar a peça 3 (Cozinha), a chegada, a caixa (Escritório), o encaixe, o diálogo final e os créditos. TQ20 (créditos mostram "Versão 0.9.0" e toque em "Voltar ao título" volta ao título). TQ9 no fade (sem "?").
2. RM1, RM2, RM5 e RM4 completo no teclado.
3. Reteste: TQ4 (cruz + A examina a Mesa), TQ5 (A ao pressionar, medido por polling de `__estado`/textos), TQ17 (H com o sobrinho na Sala), TQ21 (acordar o Nick com `__teleportar` ao lado dele; texto "Toque em B para farejar.").
4. Painel de código com BiBi (020), DanDan (023) e TuTu (024), por toque.

| ID | Verificação | Resultado | Evidência / nota |
|---|---|---|---|
| CAM-1 | Peça 3 com toque: conquista, condução, chegada "A árvore está montada! Que linda!" | | |
| CAM-2 | Caixa: "Parabéns, você conseguiu encontrar a caixa de enfeites de Natal!"; encaixe; diálogo final "Agora a árvore está toda enfeitada!" | | |
| CAM-3 | Fade e créditos com "Versão 0.9.0" | | |
| TQ20 | Créditos com toque: "Voltar ao título" e toque volta ao título | | |
| TQ9 | "?" some no fade | | |
| RM1 | Roteiros prioritários 16.14 (N1, N2, N4, N9, N10, F1, F4, D1, D3, B1) no teclado | | |
| RM2 | Checklist do Marco 1 em amostra | | |
| RM5 | Fluxo completo com teclado até os créditos, sem erro no console | | |
| RM4 | Textos "Aperte X" iguais no computador | | |
| TQ4 | Cruz pressionada + A examina a Mesa à frente | | |
| TQ5 | A age ao pressionar (medido por polling) | | |
| TQ17 | H abre a dica na Sala com toque ligado | | |
| TQ21 | Acordar o Nick por toque: "Toque em B para farejar." | | |
| PT-BiBi | Painel por toque com BiBi (020): porta abre | | |
| PT-DanDan | Painel por toque com DanDan (023) | | |
| PT-TuTu | Painel por toque com TuTu (024) | | |

## Resultados (rodada 3, execução até ~1794249420)
- CAM-1 OK parcial (emulado CDP): peça 3 por toque (Cozinha): conquista; condução com 13 amostras sem botão e sem "?"; chegada "A árvore está montada! Que linda!". Saída: `qa/evidencias/marco5-r3-saida.txt`.
- CAM-2 FALHA parcial: caixa por toque OK ("Parabéns, você conseguiu encontrar a caixa de enfeites de Natal!"). O encaixe e o diálogo final NÃO foram alcançados (após o Continuar, o sobrinho não chegou à árvore; `qa/evidencias/marco5-r3/03-diálogo-final.png` mostra a caixa ainda no Escritório). Não confirmado se é do jogo ou do roteiro; reproduzir.
- CAM-3 / TQ20 N/T: créditos não alcançados.
- TQ9 no fade: N/T.
- RM1, RM2 (amostra de título e introdução), RM4 (textos da introdução e da exploração): OK parcial pelo teclado; RM5 N/T.
- PT BiBi (020), DanDan (023), TuTu (024): OK, porta aberta por toque e entrada na Sala.
- TQ21, TQ4, TQ5, TQ17: NÃO CONFIRMADOS. Setup: o sobrinho nasce no spawn P8 da Sala com a Mesa ao lado, então A de frente não tem objeto (TQ4/TQ5 precisam de objeto à frente). H não abriu dica na Sala em duas tentativas, com travado=false (`qa/scripts/marco5-r3-diag.mjs`). Acordar o Nick: o diálogo "Toque em B para farejar." não apareceu no roteiro.
