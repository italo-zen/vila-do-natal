# Checklist QA: Marco 2 (v0.6.0), itens 048 a 062 e casos E1 a E20 (GDD 15.10)

Build: `npm run build:qa` (dist-qa/index.html). Perfil HD (480x352), navegador Chromium headless (Playwright), teclado. Rodada de até 15 min.
Ferramentas: `qa/scripts/lib-rota.mjs`, `qa/scripts/lib.mjs`, `window.__estado()` (mapa, tile, direção, fade, travado, emConducao, fase). `__estado` NÃO expõe peças: o estado de peça é conferido por captura e por texto.

Legenda de resultado: OK / FALHA / N/T (não testado, com motivo).

## Prioridade 1: fluxo LoLô completo

| ID | Verificação | Resultado | Evidência |
|---|---|---|---|
| P1-01 | Título (versão v0.6.0 visível) | | |
| P1-02 | Senha e luzes; peça 1 aparece na Sala (1,4) (E1 parcial) | | |
| P1-03 | Condução após a luz: até (3,7) da Sala, de frente para a árvore; teclas e Esc sem efeito; barra vazia (E4) | | |
| P1-04 | Diálogo de chegada da árvore (estado 0) | | |
| P1-05 | Peça 1 de frente pega com A (Q1); conquista 1 com "primeira parte da árvore de Natal" (E2, E3) | | |
| P1-06 | Z, X, Enter continuam a conquista (E3) | | |
| P1-07 | Peça encostada, olhando para o lado oposto (Q4) pega; diagonal (Q5) e vazio (Q3) não (E2) | | |
| P1-08 | Condução à árvore após a conquista 1 (E4) | | |
| P1-09 | Encaixe de 0,6 s; árvore passa ao estado 1; diálogo "Agora a árvore tem 1 parte. Faltam 2 partes!" sozinho, entrada 200 ms (E5) | | |
| P1-10 | Z ou X fecham o diálogo; controle volta na hora (E5) | | |
| P1-11 | A na árvore, estado 1: "Ela já tem 1 parte. Faltam 2 partes." sem repetir o diálogo (E6) | | |
| P1-12 | Pisca da árvore visível após a 1ª peça (item 6 do pedido) | | |
| P1-13 | Peça 2 escondida na Cozinha (4,1): tile livre (anda sobre) (E1, E7) | | |
| P1-14 | Aviso "Ainda não!" / "Essa é a parte do meio. Encontre a base antes." com a 1 não encaixada; aparece uma vez ou sempre (E15) | | |
| P1-15 | Após encaixe da 1, peça 2 visível na Cozinha (4,1), bloqueia o tile (E7) | | |
| P1-16 | Condução da peça 2 com 2x e fade 0,5 s na P7; passos medidos (esperado 12 a 13; pedido: 15) (E7) | | |
| P1-17 | Conquista 2 "segunda parte" (E7) | | |
| P1-18 | Encaixe 2; árvore estado 2; diálogo de chegada (E5, E8) | | |
| P1-19 | Peça 3 escondida na Lavanderia (3,5): tile livre; aviso "Ainda não!" com a 2 não encaixada (E16) | | |
| P1-20 | Peça 3 visível após encaixe da 2; bloqueia o tile (E8) | | |
| P1-21 | Condução da peça 3 com 2x e fade na P7; passos (esperado 17 a 18; pedido: 20) (E20) | | |
| P1-22 | Conquista 3 "última parte" (E8) | | |
| P1-23 | Árvore montada, estado 3, "A árvore está montada! Que linda!", sem enfeite (E8, E9) | | |
| P1-24 | Exploração livre depois; nenhuma peça visível; peças pegas não reaparecem (E9, E10) | | |

## Prioridade 2: os outros sobrinhos (BiBi, DanDan, TuTu)

| ID | Verificação | Resultado | Evidência |
|---|---|---|---|
| P2-01 | BiBi até conquista 1 e encaixe 1 (teleporte se necessário) | | |
| P2-02 | DanDan até conquista 1 e encaixe 1 | | |
| P2-03 | TuTu até conquista 1 e encaixe 1 | | |
| P2-04 | Parte 3 nos três, por teleporte se possível (E8) | | |
| P2-05 | Textos das conquistas e chegadas nos 4 nomes, sem nome de família (E12) | | |

## Prioridade 3: áreas e portas (opção B, GDD 15.3)

| ID | Verificação | Resultado | Evidência |
|---|---|---|---|
| P3-01 | P3 da Sala abre ida ao Escritório, com fade 0,5 s (E17) | | |
| P3-02 | Volta pelo mesmo gatilho nasce em (7,2) da Sala (E17) | | |
| P3-03 | Vão de P3 (9,2) não é andável (E18) | | |
| P3-04 | P1, P2 (sem entrar), P4, P6: "Essa porta está fechada." (E19) | | |
| P3-05 | Quarto só pela P2 (E14, E17) | N/T se não alcançado | |
| P3-06 | Vão de P2 (7,0) e tapete do Quarto não andáveis (E18) | | |
| P3-07 | Suíte e banheiros inacessíveis (E14, E19) | | |
| P3-08 | Indicadores de 15.3.3 (seta, tapete) em captura (E13, E17) | | |

## Prioridade 4: condução e barra

| ID | Verificação | Resultado | Evidência |
|---|---|---|---|
| P4-01 | Durante a condução: botões, Esc e setas sem efeito; barra vazia (E4) | | |
| P4-02 | Condução com 2x decidida antes do passo 1 (trajeto com mais de 10 passos) | | |

## Prioridade 5: peça visível bloqueia, escondida não

| ID | Verificação | Resultado | Evidência |
|---|---|---|---|
| P5-01 | Peça visível bloqueia o tile (anda por cima = impossível) | | |
| P5-02 | Peça escondida não bloqueia (anda por cima) | | |
| P5-03 | Aviso do tile escondido: aparece sempre ou só uma vez (descrever) | | |

## Prioridade 6 e 7: pisca da árvore e travamento de 2 px

| ID | Verificação | Resultado | Evidência |
|---|---|---|---|
| P6-01 | Pisca da árvore para na primeira peça encaixada (estado 1 e seguintes) | | |
| P7-01 | Parede contra (4,4) da Cozinha: travamento de 2 px com teclado nas rotas das peças 2 e 3 | | |

## Prioridade 8: capturas

| ID | Verificação | Resultado | Evidência |
|---|---|---|---|
| P8-01 | Capturas inspecionadas de cada etapa (título, luzes, Sala com peça 1, conquista 1, árvore estado 1, Cozinha, conquista 2, Lavanderia, conquista 3, árvore estado 3) | | |

## Casos E1 a E20 (GDD 15.10): resultado

E1 a E20 têm resultado nas tabelas acima ou na linha de E-caso correspondente do relatório. E13 (captura) é para o Diretor, não ao vivo. E11 (nova partida) e E12 (textos completos) podem ficar N/T se o limite de 15 min acabar.

## Resultados da rodada 3 (v0.6.0, 2026-11-08)

Build: dist-qa. Roteiros: `qa/scripts/marco2-v060-r3-quarto.mjs`, `qa/scripts/marco2-v060-r3-sobrinhos.mjs`, `qa/scripts/marco2-r2-completo.mjs`, `qa/scripts/marco2-r2b-detalhes.mjs`. Capturas: `qa/evidencias/marco2-r3/` e `qa/evidencias/marco2/`. Bugs: `qa/bugs.md` (BUG-M2-05 novo; BUG-M2-03 e BUG-M2-04 seguem a confirmar).

| ID | Resultado | Nota |
|---|---|---|
| P1-01 | OK | título "v0.6.0" lido e capturado (`marco2-r3/01-titulo.png`) |
| P1-02 | OK | senha 017, luzes |
| P1-03 | OK | condução até (3,7), 2 a 3 passos |
| P1-04 | OK | chegada estado 0 |
| P1-05 a P1-08 | OK | conquista 1 (`marco2/r2-peca1-conquista.png`) |
| P1-09, P1-10 | OK | encaixe 1 e diálogo "Agora a árvore tem 1 parte. Faltam 2 partes!" |
| P1-11 | a confirmar | exame estado 1: "A na árvore" (sem texto lido) |
| P1-12, P6-01 | N/T | o pisca não foi medido nesta rodada (o script comparou quadros com tamanhos iguais, sem resultado útil) |
| P1-13 a P1-16 | OK | peça 2 visível bloqueia; condução 11 passos, 2×, fade. Passos divergem do esperado (BUG-M2-03) |
| P1-17, P1-18 | OK | conquista 2 e encaixe 2 |
| P1-19 a P1-21 | OK parcial | peça 3 bloqueia; condução 16 passos, 2×, fade. Passos divergem (BUG-M2-03) |
| P1-22, P1-23 | OK parcial | conquista 3; árvore montada: captura `marco2/r2-arvore-estado3.png` mostra "A árvore está montada! Que linda!". Exame por A: a confirmar (BUG-M2-04) |
| P1-24 | N/T | exploração livre depois não repetida nesta rodada |
| P2-01 a P2-03 | OK | BiBi, DanDan e TuTu: senha, luzes, conquista 1 e encaixe 1 |
| P2-04 | N/T | parte 3 nos outros três não testada nesta rodada |
| P2-05 | N/T | textos completos dos 4 nomes: só o encaixe 1 foi lido |
| P3-01, P3-02 | OK | P3 leva ao Escritório (escritorio(1,5)); volta pelo gatilho (captura `marco2-r3/16-escritorio.png`) |
| P3-03 | N/T | vão de P3 (9,2) não testado |
| P3-04 | OK parcial | P1 fechada: "Essa porta está fechada. Hoje não dá para entrar." (script). P4 no Quarto: "Essa porta está fechada." (script; captura sem caixa). P6 não testada com A |
| P3-05 | OK | Quarto só pela P2; ida e volta com fade |
| P3-06 | OK | vão (7,0) não é andável (grade); paredes do Quarto sem saída (E22b) |
| P3-07 | OK parcial | Suíte inacessível (P1 fechada); P4 fechada no Quarto. Banheiros do Escritório (P6) sem teste de A |
| P3-08 | OK | setas e tapete conferidos nas capturas `marco2-r3/11-sala-com-setas.png`, `16-escritorio.png`, `17-cozinha-parede.png`. Seta esquerda do gatilho do Quarto: BUG-M2-05 (a confirmar) |
| P4-01 | OK | botões, Esc e setas sem efeito na condução ("Mesa Rack TV" é rótulo, não diálogo) |
| P4-02 | OK | condução com 2× para trajeto de mais de 10 passos (11 e 16) |
| P5-01 | OK | peças visíveis bloqueiam (ArrowRight e ArrowDown contra peças 2 e 3) |
| P5-02 | N/T | peça escondida não bloqueia: já OK nas rodadas anteriores, não repetido |
| P5-03 | N/T | aviso do tile escondido: conferido nas rodadas anteriores |
| P7-01 | OK | parede (4,4): centro estável em 121,00 com teclado (sem travamento de 2 px) |
| P8-01 | OK parcial | capturas inspecionadas (ver `marco2-r3/` e `marco2/`); conquista 2 e Lavanderia não reinspecionadas nesta rodada |

E1 a E24 (GDD 15.10), resumo:
- E17 (passagens): OK (P2 e P3 levam ao Quarto e ao Escritório, com fade).
- E19 (áreas fechadas): P1 e P4 OK. P6 e Suíte: a Suíte fica inacessível (P1 fechada); P6 sem teste de A.
- E21 (Quarto ida e volta): OK. Ida pela P2 com fade, chegada (0,6) de frente para cima; passeio sem sair do chão; volta a (7,2) de frente para baixo com fade. Antes das luzes a P2 fica fechada (ArrowUp sem efeito e "Essa porta está fechada.", script).
- E22 (caixa 5×8, câmera): OK. A caixa cabe em 480×352 (`marco2-r3/12-quarto-chegada.png`). Porém a seta (BUG-M2-05).
- E24 (nada de peça nos cômodos novos): OK (dados: 0 peças, 0 NPC no Quarto; captura sem peça).
- E14, E13: capturas e áreas conferidas em parte; E23 é N/A (Suíte fechada até a pergunta 30).
- Alcova: P1 fechada bloqueia a saída pela esquerda (E19a); P2 e P3 são gatilhos. Nada prende o sobrinho (E19a, E21).
