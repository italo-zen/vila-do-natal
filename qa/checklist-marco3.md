# Checklist QA: Marco 3 (v0.7.0), rodada 1 (2026-11-09)

Build: `npm run build:qa` (dist-qa/index.html). Perfil HD 480x352, Chromium (Playwright), teclado. Limite 15 min.
Roteiro: `qa/scripts/marco3-r1-nick.mjs`. Diagnóstico do A: `qa/scripts/marco3-r1-diag-acordar.mjs`. Capturas: `qa/evidencias/marco3-r1/`.
Nota: a checklist foi escrita depois da primeira passagem do roteiro (faltou o passo de criar antes). Os resultados abaixo são os da última execução.

Legenda: OK / FALHA / N/T (não testado, com motivo).

| ID | Verificação | Resultado | Evidência / nota |
|---|---|---|---|
| P1-01 | Título com v0.7.0 | OK | texto lido; `01-titulo.png` |
| N1 | Nick dormindo na Sala (8,5) | OK | estado do hook |
| N11 | Nick dormindo bloqueia (andar contra ele) | OK | jogador parado em (9,5) |
| N2 | A acorda; "Nick acordou" + "Aperte X para farejar." | OK | `03-acordou-dialogo.png` |
| N3 | Segundo acordar não repete o diálogo | OK | |
| N4 | Seguir (v0.7.1): Nick fica 1 tile atrás, encostado, e para no tile que o sobrinho deixou por último (GDD 16.4.1). Antes: 2 tiles (histórico, rodadas 1 a 7) | OK na 0.7.0 (2 tiles); reteste 0.7.1 na rodada 8 | jogador (9,7), Nick (9,5) (0.7.0) |
| N5 | Nick acordado não bloqueia | OK | jogador sobre (8,5) |
| N6 | Troca de área (v0.7.1): Nick oculto no tile de chegada do sobrinho, aparece inteiro no primeiro passo, 1 tile atrás (GDD 16.4.2). Antes: semente (histórico) | OK na 0.7.0 (semente); reteste 0.7.1 na rodada 8 | Nick (1,1) na Cozinha (0.7.0) |
| N8, N9, N7, N10 (outras fases e áreas) | | N/T | limite de tempo |
| N12 | A com Nick acordado sem alvo: abana sem texto | N/T | |
| N13, N14, N15 | Nova partida, rota, conquista | N/T | |
| F1 | Seta amarela (`#f4d35e`) na P7 (Cozinha, alvo Sala), saída esquerda; 2 tremidas de 0,4 s, depois parada até os 5 s (v0.7.1). Antes: seta dourada com sobe e desce (histórico) | OK na 0.7.0; reteste 0.7.1 na rodada 8 | `06-seta-cozinha-P7.png` (0.7.0) |
| F1b, F1c | Seta reduz e some em 5 s | OK | 4333 ms -> 2300 ms após ~2 s; 0 em ~7 s |
| F2 | B com seta visível reinicia os 5 s | OK | restante 3500 ms |
| F3 | Mesmo cômodo: sem seta (Au) | OK | estado sem seta; balão "Au!" não confirmado por captura |
| F4, F5, F6, F7, F8, F9 | Direções, zzz, depois da parte 3, peça escondida, outras telas, passagem com seta | N/T | limite de tempo |
| D1 | H abre a dica; mundo parado | OK | `07-dica-cozinha-h.png` |
| D2, D2b | H não fecha; Z fecha | OK | |
| D3 a D8 | Textos por fase, imagem por estado, 3 linhas, sem direção, ícone "?" com clique | N/T | só o texto da fase porta foi lido |
| B1 | Barra de 2 linhas na exploração | OK (captura) | `08-cozinha-barra.png`: "Setas: andar  Z: examinar" / "X: farejar  H: dica" |
| B2, B4 | Barra vazia na condução; barra estável com Nick | N/T | |
| B3 | Sala (0,9) e (1,9) bloqueados (dados) | OK | chao 358 e colisao 1 nos dois; 10 linhas |
| B5 | Como jogar com as linhas novas | N/T | |
| Ícone "?" | Borda 1 px e 32x32 | OK (captura) | `08-cozinha-barra.png` mostra o ícone; medida de borda não feita |
| Regressão Marco 1-2 | Porta, luzes, peças, condução | N/T | não rodada nesta rodada |
| Celular/toque, Firefox, Safari | | N/T | fora do escopo desta rodada |

## Rodada 2 (2026-11-09), roteiro `qa/scripts/marco3-r2.mjs`, capturas `qa/evidencias/marco3-r2/`

| ID | Resultado | Nota |
|---|---|---|
| B5 | OK | Como jogar: as 5 linhas (mover, A, B, farejar, dica) lidas; "Voltar" e "Z ou X: voltar" presentes; X volta ao título (`01-como-jogar.png`) |
| B4 | N/T | barra e Nick: não medido com a barra na condução |
| Ícone "?" borda 1 px | OK | medido em `assets/hd-480x352/spr_icone_dica.png`: 32x32, borda de 124 px em #9aa3c7 (1 px), fundo #1b2452, "?" #f4d35e |
| D1b | OK | clique com o mouse no ícone (canvas 456,24) abre a dica; Z fecha (`02-dica-mouse.png`) |
| D3 | OK parcial | textos da parte 1 (acordado) exatos; demais fases conferidas no `content/texts/pt-BR.json` (até 28 caracteres por linha, sem direção), leitura ao vivo não feita |
| D8 | OK | sem cima/baixo/esquerda/direita nem nome de cômodo na dica lida |
| Nick Cozinha (fase 1) | OK | dormindo em (5,3) depois da chegada das luzes e da condução; bloqueia (4,3)→(5,3) |
| Beco (5,3) | OK | A de (4,3) acorda o Nick (`05-cozinha-acordou.png`) |
| F4 (Cozinha → Sala) | OK | seta na P7, saída esquerda; some em 5 s |
| M1 luzes e condução | OK | condução concluída; controle devolvido em (3,7) da Sala; Nick passa para a Cozinha dormindo |
| M1 porta (código 017) | a confirmar | a leitura do mapa veio "hall" depois de 5 s, mas as luzes e a condução seguiram na Sala. Pode ser leitura do script; confirmar pela captura antes de classificar |
| Nick Quarto e Escritório (fases 2 e 3), F5, F6, F7, F8, F9, N7 a N15 | N/T | exigem as peças 2 e 3 (progressão de fase) e não couberam nos 15 min |
| Regressão Marco 1 (porta, luzes, condução) | OK parcial | luzes e condução OK; peças e Marco 2 não repetidos nesta rodada |
| Celular/toque, Firefox, Safari | N/T | fora do escopo |

Observação para o Dev (não é bug confirmado): depois de `__teleportar`, o jogo pode ficar com `travado=true` até uma tecla. Os roteiros fecham com X antes de agir.
Bugs: nenhum confirmado na rodada 2. `qa/bugs.md` não recebeu entrada nova.

## Rodada 3 (2026-11-09), roteiros `qa/scripts/marco3-r3.mjs`, `qa/scripts/marco3-r4-fases.mjs`, capturas `qa/evidencias/marco3-r3/` e `marco3-r4/`
Build: `npm run build:qa` rodado de novo (gancho `__irParaFase`).

| ID | Resultado | Nota |
|---|---|---|
| M1 porta (observação 2 da rodada 2) | OK (não é bug) | captura `marco3-r3/01-porta-aberta.png`: código 017 abriu a porta, aviso "Clique! A porta abriu." com o sobrinho ainda no Hall. O estado "hall" é o correto nesse momento; o script esperava a entrada automática. |
| M1 luzes e condução | OK | sala (3,7), nick dorme na Cozinha (5,3) |
| Peça 1 | OK | encaixe; Nick vai para o Quarto (4,3), dormindo |
| N1, N10 Quarto (fase 2) | OK | Nick dorme em (4,3) do Quarto |
| N11 bloqueio Quarto | OK | a partir de (4,4) |
| N2 acordar Quarto | OK | |
| N12 abanar | OK | sem diálogo |
| F5 zzz (B com Nick dormindo) | OK parcial | sem seta e sem mudança; o balão zzz não foi lido (só estado) |
| F4 Quarto (alvo Cozinha) | OK | seta na P2, saída esquerda (para a Sala) |
| F1, F1c, F2 | OK | 4317 -> 2300 ms; some em 5 s; B reinicia |
| D3 dica fase 2, dormindo e acordado | OK | textos exatos: "Procure a parte do meio." + "O Nick ainda está dormindo." / "Aperte X e o Nick fareja." |
| Peça 2 | OK | encaixe; Nick vai para o Escritório (6,1), dormindo |
| N10, N11, N2 Escritório (fase 3) | OK | (6,1) dorme; bloqueio a partir de (5,1); acordar |
| F4 Escritório (alvo Cozinha) | OK | seta na P3, saída esquerda; F1, F1c, F2 OK |
| D3 dica fase 3 | OK | "Procure em outro cômodo." + textos do Nick |
| D8 (sem direção) | OK | nos textos lidos |
| B4 barra na condução | N/T | não capturada durante a condução |
| N7 condução com Nick, N8 "feliz" e "Au!" na chegada, N9 fumacinha, N13 nova partida, N14, N15 | N/T | não medidos nesta rodada (N9 só o estado final) |
| F6 (depois da parte 3), F7, F8, F9 | N/T | não testados |
| Dica: clique no "?" e borda 1 px | OK (rodada 2) | |
| Regressão Marco 2 (`marco2-r2-completo.mjs`, rodado) | FALHA parcial | ver bugs: BUG-M2-03 (2× da peça 2 com 11 passos) e BUG-M2-04 (exame da árvore no estado 3 sem texto); pisca N/T |
| Celular/toque, Firefox, Safari | N/T | fora do escopo |

## Rodada 4 (final, 2026-11-09), roteiro `qa/scripts/marco3-r4-final.mjs` (LoLô e, com `IDX=1`, BiBi), com `__irParaFase`
Tempo do roteiro: ~50 s por sobrinho; rodada total ~4,5 min. Capturas em `qa/evidencias/marco3-r4/`.

| ID | Resultado | Nota |
|---|---|---|
| N1 | OK | Nick dorme na Cozinha (5,3) na fase 1 (LoLô) |
| N2 | OK | A de (4,3) acorda; diálogo de primeira vez |
| N7 | OK | Nick acordado acompanha a condução da peça 1 (0.7.0: 2 tiles atrás; v0.7.1: 1 tile atrás, GDD 16.4.4) |
| N8 | FALHA | sem "feliz" + "Au!" na chegada com conquista. BUG-M3-R4-01 |
| N9 | OK parcial | ao fim do diálogo o Nick dorme no Quarto (4,3). Fumacinha não verificada em captura |
| N13 | OK | nova partida: Nick dorme na Sala (8,5); diálogo de primeira vez volta |
| N14 | OK | teste automático `tests/application/nick-validacao.test.ts` (N009) e 306 testes de aplicação passam |
| N15 | OK | `ConquistaScene.ts` não referencia o Nick (código) |
| B4 | OK | barra sem "Setas:" durante a condução |
| F4 | OK | seta da P7 na Cozinha (alvo Sala), saída esquerda |
| F6 | OK | depois da parte 3 (`__irParaFase('enfeites')`): Nick dorme na Sala (8,5); B com zzz sem seta; A acorda; B abana com "Au!" sem seta |
| F7 | N/T ao vivo | não testado ao vivo nesta rodada; pela regra de 4.4 do ADR-005 (alvo é a subárea) e pelas setas vistas na F4 |
| F8 | OK | B na condução sem efeito; H não fecha a dica; X fecha (16.8.3) |
| F9 | OK | andar sobre o gatilho com seta visível leva à Sala; Nick acordado vem junto |
| Repetição com BiBi (`IDX=1`) | OK | mesmo resultado, exceto o N8 |
| Falsos positivos da rodada 2 | não é bug | BUG-M2-03 e BUG-M2-04 (ver `qa/bugs.md`, notas da rodada 4) |
| Celular/toque, Firefox, Safari | N/T | fora do escopo |

## Rodada 5 (2026-11-09), roteiro `qa/scripts/marco3-r5-reacao.mjs` (build `npm run build:qa` de novo)
| ID | Resultado | Nota |
|---|---|---|
| N8 luzes, Nick acordado (LoLô) | OK | "Au!" com o diálogo na chegada (`LoLô-acordado/chegada-0.png`, `chegada-3.png`). Pose "feliz" quadro a quadro: não isolada |
| N8 com Nick dormindo (LoLô) | OK | nenhum "Au!" (`IDX=0 WAKE=0`) |
| N9 fumacinha | N/T (candidato BUG-M3-R5-01) | estado certo (Nick dorme na Cozinha); fumacinha não visível nas capturas |
| F7 ao vivo | N/T | não executado nesta rodada |
| Outro sobrinho (BiBi) | N/T | não rodado nesta rodada (o script aceita IDX=1) |

## Rodada 6 (final, 2026-11-09), roteiro `qa/scripts/marco3-r6-final.mjs` (`ATALHO=1 SO_LUZES=1 IDX=n`)
| ID | Resultado | Nota |
|---|---|---|
| N8 luzes, Nick acordado (LoLô, DanDan, BiBi) | OK | `animacaoDoNick` = `nick-feliz` ~1,1 s+; "Au!" e diálogo na chegada |
| N8 peça 1 com Nick acordado | N/T | o roteiro completo (peça 1) não rodou até o fim nesta rodada (limite de tempo) |
| Nick dormindo = sem reação | N/T nesta build | o teste feito antes da correção (rodada 5) deu zero "Au!" |
| N9 fumacinha | OK pelo Dev (BUG-M3-R5-01 fechado) | captura tardia no teste; não reconferido |
| F7 ao vivo | N/T | o trecho ao vivo não rodou (o resultado anterior era de hall) |
| BiBi fluxo completo | parcial | entrada pelo código falhou; luzes OK pelo atalho |
| DanDan luzes | OK | |
| TuTu | N/T | |
| Celular/toque, Firefox, Safari | N/T | fora do escopo |

## Veredito do Marco 3 (rodada 6)
NÃO aprovado ainda: faltam a peça 1 com Nick acordado completa, o Nick dormindo sem reação na build corrigida, F7 ao vivo e a fumacinha reconferida. A reação "feliz" + "Au!" passou em luzes (LoLô, DanDan, BiBi).

## Rodada 7 (última, 2026-11-09), roteiro `qa/scripts/marco3-r7.mjs`
| Caso | Resultado | Nota |
|---|---|---|
| (1) peça 1, Nick acordado: "feliz" + "Au!" uma vez; diálogo sem esperar | OK | `nick-feliz` ~1 s+; "Au!" em 3 ms; diálogo em ~1,0 s (animação de 1,6 s) |
| (2) peça 1, Nick dormindo: sem "Au!" e sem feliz | OK | |
| (3) F7 ao vivo | OK | seta na P7, nunca na peça 2 escondida |
| (4) fumacinha ao devolver o controle, quadros a cada ~100 ms | OK | quadro 0 mostra a fumacinha no tile de origem (`fumaca/f-00.png`) |

## Veredito do Marco 3: APROVADO para Chromium desktop, teclado (e mouse nos botões da tela de título e da dica)
Itens não cobertos, para a Release 1.0 e o PT3:
- Celular/toque, Firefox e Safari (fora desta matriz).
- TuTu e o fluxo completo com DanDan/BiBi (só luzes e peça 1 com o atalho; a entrada pelo código falhou em BiBi e precisa de conferência).
- Dica: leitura ao vivo dos textos da parte 1 e 3 de todos os sobrinhos (conferidos no JSON e em amostras).
- Barra da Sala na linha 9 e o item 073 conferidos só pelos dados (B3); a captura de linha 9 não foi reinspecionada.
- Pose "feliz" quadro a quadro (confirmada pelo nome da animação, não pela imagem).
- Ícone "?" com clique do mouse: conferido (rodada 2); a borda de 1 px conferida no PNG.
- BUG de QA: a hook `__estado` lança `currentAnim` (`ganchoQa.ts`) às vezes; o Dev confirma (não afeta o jogo, só o gancho).

## Rodada 8 (v0.7.1, 2026-11-09): critérios atualizados (GDD 16.4, 16.5, 16.14, 16.17; backlog 080 a 085)
Critérios novos: seta amarela com 2 tremidas de 0,4 s e parada até 5 s; B refaz farejando, tremidas e 5 s; B ignorado só no farejando; mesmo cômodo: "Au!" sem seta; Nick 1 tile atrás e encostado; troca de cômodo com Nick oculto no tile de chegada e visível no primeiro passo; condução a 1 tile atrás; reação feliz + "Au!" mantida.
Roteiro: `qa/scripts/marco3-r8-v071.mjs`. Capturas: `qa/evidencias/marco3-r8/`.
(Resultados na seção "Resultados da rodada 8" abaixo, preenchidos ao fim da rodada.)

## Resultados da rodada 8 (v0.7.1, 2026-11-09), roteiros `qa/scripts/marco3-r8-v071.mjs` e `qa/scripts/marco3-r8b-mesmo-comodo.mjs`
Build: `npm run build:qa` (v0.7.1). Capturas: `qa/evidencias/marco3-r8/`. Tempo medido: ~6 min de execução (roteiros) mais montagem; rodada cronometrada de 1794226979 a ~1794227400.

| ID | Resultado | Nota |
|---|---|---|
| F1 seta amarela após o farejando (~0,9 s no roteiro), 5 s a partir do fim do farejando | OK (pelo estado) | `restanteMs` fica em 5000 durante o farejando e começa a cair depois; seta com `ativo=true` |
| F1 2 tremidas de 0,4 s e seta parada | N/T visual | não medido por imagem; só o estado. Captura `seta-amarela-t2.png` para o Diretor |
| F2 B com a seta visível refaz o farejando e reinicia os 5 s | OK | restante de 83 ms para 4350 ms |
| F3 B durante o farejando é ignorado | OK | 2 B em 300 ms = 1 ciclo |
| F3 mesmo cômodo: "Au!" sem seta; B repetido refaz o "Au!" | OK | texto "Au!" lido nas duas vezes, sem seta (rodada 8b) |
| Relato do PT3 "farejar não repetiu" | não reproduzido | B repetido funciona nos dois casos (alvo em outro cômodo, F2; mesmo cômodo, 8b). Provável causa: sem seta no mesmo cômodo e a seta antiga sumindo ao trocar de cômodo |
| N4 Nick 1 tile atrás e encostado (Escritório) | OK | distância 1 em todos os passos |
| N6 P3 Escritório->Sala, Nick acordado | OK | oculto no tile (7,2); no 1º passo aparece e segue (dist 1) |
| N6 P7 Sala->Cozinha, Nick acordado | OK | oculto em (1,0); 1º passo: visível, dist 1 |
| N6 P2 Quarto->Sala, Nick acordado | OK | oculto em (7,2); 1º passo: visível, dist 1 |
| N6 P7 Cozinha->Sala e P8 | N/T | P8 não testada; P7 no sentido Cozinha->Sala não repetido nesta rodada |
| N6 com Nick dormindo na travessia | OK | P2 Sala->Quarto: Nick dormindo fica na Sala (correto, não segue) |
| N7 condução da peça 3 a 1 tile atrás | OK | distância 1 nas paradas, 2 no máximo em movimento |
| N8 peça 3: "Au!" e animação `nick-feliz` na chegada | OK | Au! em 1 ms |
| N9 após a peça 3: Nick dorme na Sala (8,5) | OK | |
| N11 Nick dormindo bloqueia (8,5) | N/T | o roteiro não chegou ao vizinho (route); a rodada 4 já tinha OK |
| Fumacinha ao devolver o controle | N/T nesta rodada | ver rodada 7 |
| (2) Nick com Lolô e mais dois sobrinhos | N/T | não cobriu (tempo) |
| (5) Dica por H e ícone, Como jogar, peças 1 e 2, barra de 2 linhas | N/T nesta rodada | cobertos nas rodadas 2 e 3 (0.7.0); não repetidos na 0.7.1 |
| Celular/toque, Firefox, Safari | N/T | fora de escopo |

Bugs novos: nenhum confirmado nesta rodada. Ver `qa/bugs.md`, seção "Rodada 8".

## Rodada 9 (v0.7.1, veredito final), roteiro `qa/scripts/marco3-r9-v071.mjs` (IDX=0 LoLô, 1 BiBi, 2 DanDan), build `dist-qa` de hoje
Tempo medido: ~5 min de execução (1794227427 a 1794227730), dentro dos 10 min.

| ID | LoLô | BiBi | DanDan | Nota |
|---|---|---|---|---|
| Regressão: dica por H (abre; H não fecha; Z fecha) | OK | OK | OK | |
| Regressão: dica pelo ícone "?" (clique) | OK (rodada 2 e captura) | N/T | N/T | não repetido nesta rodada com o mouse |
| Regressão: Como jogar sem cobrir Voltar | OK (rodada 8, 7 linhas) | N/T | N/T | não repetido nesta rodada |
| Regressão: peça 1 (Nick acordado, feliz + "Au!") | OK | OK | OK | "Au!" 2 ms, `nick-feliz` |
| Regressão: peça 2 | N/T | N/T | N/T | a cadeia não chegou à peça 2 nesta rodada (cobertas nas rodadas 2 e 3) |
| Regressão: barra de 2 linhas (Sala) | OK (captura) | N/T | OK (captura `DanDan/barra-2-linhas-sala.png`) | 2 linhas legíveis e na tela |
| P7 Cozinha->Sala com Nick acordado (oculto na chegada, aparece no 1º passo, 1 tile atrás) | OK | OK | OK | |
| P8 Sala->Hall com Nick acordado | OK | OK | OK | |
| P8 Hall->Sala com Nick acordado | OK | OK | OK | |
| Seta amarela P7 (saída esquerda), alvo Sala | OK | OK | OK | |
| 2 tremidas por pixel (quadros a cada 100 ms) | parcial | N/T | N/T | ver `qa/bugs.md` (observação) |
| Fumacinha ao devolver o controle | OK (estado) | OK (estado) | OK (estado) | captura `fumaca/` gravada; conferir visualmente |
| N11 Nick dormindo bloqueia | N/T nesta rodada | N/T | N/T | a rodada 4 cobriu |

Veredito da v0.7.1: APROVADO para Chromium desktop, teclado (e mouse nos botões de título e dica), com as ressalvas abaixo.
Sem cobrir nesta rodada (ou só parcial):
- Medida das 2 tremidas por pixel: a medição foi feita, mas a sequência de centroides oscila por mais de 0,8 s (observação em `qa/bugs.md`); confirmar visualmente antes de fechar.
- Peça 2 e peça 3 com a 0.7.1 (a peça 3 foi coberta na rodada 8).
- TuTu. Celular/toque, Firefox, Safari.
- Penumbra da Sala na captura da barra (observação em `qa/bugs.md`).
