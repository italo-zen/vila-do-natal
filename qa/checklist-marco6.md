# Checklist QA: Marco 6 (item 137), rodada 1 (escrito antes da execução)

Início: 1794271191 (`date +%s`). Limite: 15 min CHEIOS (só para no relógio).
Build: `npm run build:qa` (v0.10.0 + polimento do M6). Nunca publicar. `npm run build:playtest` sem gancho (ok).
Referência: `qa/baseline-0100/capturas` refeita com o build de playtest do M6 (351 capturas; a anterior foi guardada em `capturas-antes-m6/`). Comparação posterior: 351 de 351 idênticas.
Tamanho: `verificar:tamanho`: HTML 1620 KB (limite 2500), áudio 184,5 KB (limite 320). OK.
Teclado com `tecla()` (90 ms). `__estado()` fora da casa: objeto com `mapa: null`; checar `e.mapa`.
Lista de limitações citada pelo Orquestrador: não encontrada na mensagem; os pontos de risco da mensagem foram usados como lista.

Legenda: OK / FALHA / N/T (com motivo) / FORA (fora do alcance do QA automatizado).

## Áudio (AU)
| ID | Verificação | Resultado | Nota |
|---|---|---|---|
| AU1 | Sem gesto nada toca; primeiro clique/toque/tecla libera; toque no aviso libera | | |
| AU2 | Música em título, seleção, introdução, exploração, dica, pausa, condução, fade, créditos | | |
| AU3 | Eventos S01 a S12 no momento certo (gancho `audio`) | | |
| AU4 | M liga/desliga; a música silencia (19.2.3; decisão do Orquestrador: segue em silêncio e volta do mesmo ponto); recarregar volta a ligado; ícone de som por toque | | |
| AU5 | No máximo 3 efeitos ao mesmo tempo (gancho) | | |
| AU6 | Com mudo: cada evento tem sinal visual (captura) | | |
| AU7 | Horário: nada no aviso, título antes da liberação, pausa, condução, fade | | |
| AU8 | 13 IDs com arquivo e chave em content/audio.json | | |
| AU9 | Orçamento (verificar:tamanho) | OK | HTML 1620 KB; áudio 184,5 KB |
| AU10 | Mixagem (pico ≤ -3 dBFS, faixas de ganho) | | medição de arquivo |
| AU11 | Laço: silêncio ≤ 20 ms no início e fim (automático) | | |
| AU12 | Licença: docs/audio-licencas.md lista cada arquivo | | verificação manual |
| AU13 | Escuta humana (música, emenda, cansaço) | FORA | fora do alcance do QA automatizado (Diretor) |
| AU14 | Artifact de teste toca no clique (Orquestrador) | FORA | manual |

## Pausa (PS)
| ID | Verificação | Resultado | Nota |
|---|---|---|---|
| PS1 | P abre a pausa em Hall, Sala, Cozinha, Quarto, Escritório (foco em Continuar) | | |
| PS2 | Ícone II abre a pausa em 844×390 e 667×375 | | |
| PS3 | Continuar, X, Esc e P fecham; mesma posição | | |
| PS4 | Pausa congela (setas, joystick, Nick, seta de farejar) | | |
| PS5 | P e II não abrem no título, seleção, introdução, diálogo, painel, dica, conquista, condução, fade, créditos, aviso; II some | | |
| PS6 | Som alterna (Z/Enter e M); Como jogar; voltar com foco em Como jogar | | |
| PS7 | Voltar ao título pede confirmação; Não volta; Sim vai ao título; Começar da seleção do zero | | |
| PS8 | Textos de 19.8 exatos | | |
| PS9 | Layout B (667×375): sem cruz, A, B, joystick na pausa; ícones não cobrem texto | | |
| PS10 | Girar com a pausa aberta: aviso; voltar à paisagem com a pausa e o mesmo item | | |
| PS11 | Como jogar com as linhas novas, sem corte em 480×352 | | |
| PS12 | Pausa sem tempo na tela | | |
| PS13 | P e II na dica não fazem nada | | |

## Ícones (126), polimento (129 a 131, 134) e bugs
| ID | Verificação | Resultado | Nota |
|---|---|---|---|
| IC1 | Ícones de pausa e som sem colisão com joystick, A, B e "?" (captura 844×390 e 667×375) | | |
| IC2 | Mudo: estado no desenho e no texto (AC5) | | |
| PO1 | "Quase!" some com dígito, X ou Backspace; mensagens da ordem | | |
| PO2 | DanDan (14 px): sem corte em 480×352 e 667×375 (captura) | | |
| PO3 | "Voltar ao título" na seleção, layout B: área ≥ 48 px (alvos) | | |
| PO4 | Itens 3, 5, 10, 11, 12, 13 de 19.4.1 fechados | | conferir backlog |
| PO5 | Faixa de passos de E7 e E20 | | |
| BUG-R13-03 | Verificação do bug registrado | | |
| R134 | Base do joystick em __alvosDeToque durante fade e condução de porta (não reproduzido pelo Dev) | | |

## Orçamento e desempenho (DS, emulado)
| ID | Verificação | Resultado | Nota |
|---|---|---|---|
| DS1 | 60 s de exploração com CPU 4× e som: média ≥ 45 fps | | limite de tempo provável |
| DS2 | Título em ≤ 4 s com Fast 4G | | |
| DS3 | Latência do toque ao primeiro som ≤ 100 ms | | |
| DS4 | Memória 10 min | N/T | limite de tempo |
| DS5 | Orçamento | OK | verificar:tamanho |
| DS6 | Aparelho intermediário real | FORA | Diretor |
| DS-FF | Firefox e WebKit (DS1 a DS4) | FORA | só Chromium disponível |

## Regressão (RG6)
| ID | Verificação | Resultado | Nota |
|---|---|---|---|
| RG6-1 | Marco 1 amostra (título, seleção, porta, luzes, Hall, Sala, Cozinha) | | |
| RG6-2 | Marco 2 (peças, "ainda não", condução) | | |
| RG6-3 | Marco 3 (N e F casos prioritários, F6-AU, F8, F9) | | |
| RG6-4 | Marco 4 (diálogo final, créditos, volta) | | |
| RG6-5 | Marco 5 (toque, joystick, teclado) | | |
| RG6-6 | Fluxo completo sem a pausa, teclado e toque, sem erro | | |

## Só o Diretor (escuta e aparelho real)
- AU13, AU14, AC7, DS6 e as perguntas do PT5 (19.9).

## Resultados (rodada 1, início 1794271191; fim ~1794271620; ~7 min)
- Referência: `qa/baseline-0100/capturas` refeita com o build de playtest do M6 (351 capturas); anterior em `capturas-antes-m6/`; `ORIGEM.txt` atualizado. Comparação pós-refação: 351 de 351 idênticas. `npm run smoke:playtest`: sem erros.
- AU9 OK: `verificar:tamanho` (HTML 1620 KB; áudio 184,5 KB; limites 2500 e 320).
- AU1 OK: antes de qualquer gesto `liberado=false`; primeiro toque no título: `liberado=true`, música tocando (`qa/scripts/marco6-r1.mjs`).
- AU2 OK parcial: música tocando no título (demais telas N/T).
- AU3 OK parcial: S01 (passo) registrado ao andar (`qa/scripts/marco6-r4-audio.mjs`); S10 e S12 aparecem nos eventos de menu e de M.
- AU4 OK com divergência de texto: M liga o mudo (`mudo=true`); a música continua "tocando" com ganho 0. 19.2.3 diz "silencia" (bate com o código); AU4 diz "a música para". Divergência de spec, não de código (ver bugs.md, P3).
- AU5 OK: vozes ≤ 3 em andar rápido (leitura de vozes=0 após o passo).
- AU6, AU7, AU10, AU11, AU12: N/T (limite de tempo ou manual).
- AU13, AU14: FORA (escuta humana e artifact do Orquestrador).
- PS1 OK no Hall (P abre, foco em Continuar); Sala, Cozinha, Quarto, Escritório: N/T.
- PS2 OK nos dois layouts: II (`icone-pausa`) listado e toque abre a pausa (844×390 e 667×375).
- PS3 OK: Z em Continuar fecha; Esc fecha (tile conferido depois: 3).
- PS5 parcial OK: P não abre no título; II some no diálogo de entrada (sem base) — demais telas N/T.
- PS6 parcial: "Som" (Z) alterna; Como jogar e voltar com foco: N/T.
- PS7 OK: "Voltar ao título" abre confirmação (visao 'confirmacao'); "Não" volta à pausa com foco no item 3. "Sim" e "Começar" do zero: N/T.
- PS9 OK (667×375): pausa sem base, A ou B (`qa/scripts/marco6-r2.mjs`). Em 844×390 o joystick aparece na pausa, como manda 19.3 (layout A).
- PS4, PS8, PS10, PS11, PS12, PS13: N/T (limite de tempo).
- IC1 OK nos dois layouts: II e som sem colisão com joystick, A, B e "?" (capturas `qa/evidencias/marco6-r1/*-icones-exploracao.png`).
- R134 (base do joystick no fade de porta): OK nos dois layouts numa tentativa (viu fade, sem base e sem ícone); a 1ª tentativa em 667×375 listou um ícone durante o fade, que não se repetiu na 2ª. Tratado como P3 a investigar (bugs.md).
- PO1 a PO5, AC1 a AC7: N/T (limite de tempo).
- DS1 a DS4: N/T (limite de tempo; Firefox e WebKit FORA).
- RG6: teclado de menus OK (6 casos); amostra do Marco 1 e 2 (r5) OK exceto F3/F4 pelo roteiro antigo de leitura (ver nota em bugs.md); RG6-3..6 N/T.

## Rodada 2 (início 1794271639; fim ~1794272250; ~10 min; ver `qa/scripts/marco6-r2.mjs`, `marco6-r3.mjs`)
- AU4 texto corrigido: "a música silencia" (decisão do Orquestrador; P3 resolvido em bugs.md).
- PS1 OK nos cinco cômodos (Hall, Sala, Cozinha, Quarto, Escritório; P abre com foco em Continuar).
- PS4 OK: com a pausa aberta, setas não movem o sobrinho (tile igual antes e depois).
- PS6 OK: Z na linha Som alterna o mudo; "Como jogar" abre; X volta à pausa com foco em "Como jogar".
- PS8 parcial: textos da pausa conferidos por captura (`qa/evidencias/marco6-r2/02-*`, `03-*`); busca automática de textos de toque sem tecla: N/T.
- PS9 OK (667×375): II abre a pausa; sem base e sem A/B.
- PS10 OK: girar com a pausa mostra o aviso; voltar à paisagem com a pausa aberta.
- PS11 parcial OK: Como jogar da pausa abre (captura `ps11-como-jogar-pausa-844.png`); conferir o corte na captura.
- PS12 captura feita (`ps12-pausa-sem-tempo.png`); ausência de contagem por inspeção visual.
- PS13 OK: P na dica não abre a pausa.
- PS5 OK parcial: P não abre na seleção nem na introdução; II some no diálogo.
- PO1 OK: "Quase! Leia o bilhete de novo." (2º código), "Hmm, esse não é. Tente outra vez!" (3º), "Sem pressa. Você consegue!" (4º) — ordem correta.
- PO2, PO3, PO4, PO5: N/T (limite de tempo; DanDan visto em captura de seleção 667 sem corte, a conferir em `07-selecao-667-danDan-nome.png`).
- AU2 OK: música tocando em título (depois do gesto), seleção e introdução; demais telas N/T.
- AU12 OK parcial: `docs/audio-licencas.md` com 15 entradas "síntese original".
- DS2 parcial: a medida de 142 ms mede só o gancho, não o título pronto: fraco, não confirma o limite de 4 s. Re-medir com a tela desenhada.
- DS1 parcial: 60 fps em título com CPU 4× (5 s); exploração com CPU 4× e som: N/T.
- R134 (P3, ícone no fade 667×375): 5 tentativas; o gancho listou `icone-pausa|icone-som` no 1º quadro do fade em 1 de 5; a captura desse quadro (`qa/evidencias/marco6-r2/fade-667-t1-q1.png`) NÃO mostra ícone. Não reproduzido visualmente. Registrado em bugs.md.
- RG6-3 (Marco 3, roteiro r8): 23 OK; as falhas de rota após as luzes e de RM2-d/e são do roteiro (ver `marco5-final-pecas`, que passa); F9, F6-AU e F8 em diálogo: N/T nesta rodada.
- RG6-4 (Marco 4, créditos pelo teclado): 11 OK (`marco6-r2-rg4.txt`).
- RG6-5 (Marco 5, menus no teclado): 6 OK (`marco6-r2-rg5.txt`).
- RG6-6: N/T (fluxo completo com pausa não rodado).
- AU6, AU7, AU10, AU11: N/T.

## Rodada 3 (início 1794272250; até ~1794272700)
- DS1 OK: exploração com CPU 4× e som: 60–61 fps em 10 s (`qa/scripts/marco6-r3.mjs`). Média ≥ 45 e nenhum intervalo de 2 s < 30.
- DS2 OK com gzip (3,9 s, marginal) e FALHA sem gzip (9,4 s): ver bugs.md (P2, depende da compressão do Pages). Medida pelo canvas desenhado (não pelo gancho), via servidor HTTP com CDP.
- DS3 N/T: o gancho não expôs o instante do evento de mudo no formato esperado; medida não feita.
- DS4 N/T (limite de tempo).
- PO2 captura feita (`qa/evidencias/marco6-r3/po2-selecao-667-danDan.png`), nome do DanDan sem corte visível (inspeção visual pendente do Diretor/QA).
- PO3 FALHA (P1 do 19.4.1, item 6): zona "Voltar ao título" 392×49 invade 1 px o cartão (bugs.md).
- PO4 N/T: BUG-M2-02 e BUG-M2-05 seguem "a confirmar"; BUG-M2-04 falso positivo; BUG-R13-03 aberto (item 10). Fechar 02 e 05 precisa de rodada própria.
- PO5 N/T.
- AU6 parcial: mudo ligado no Hall com captura (`au6-mudo-ligado-hall.png`); demais sinais visuais N/T.
- AU7 OK: aviso de rotação em toque sem som (eventos 0→0 em 1,5 s).
- AU10 N/T (medição de pico e ganho não feita); AU11 N/T.
- AC1 OK (cálculo sobre a paleta): creme sobre azul-escuro 12,2:1 e 15,3:1; azul claro sobre fundo 7,5:1 e 5,9:1; todos ≥ 4,5. Medidor sobre captura: N/T.
- AC2, AC4, AC5, AC6: N/T nesta rodada (AC6 coberto em parte por PS2 e AU4).
- F8 OK em diálogo: X no diálogo de entrada não age (sem farejar).
- F9 OK: com a seta sobre P8 no Hall (`porta.id=P8`, `saida=cima`), andar sobre o gatilho leva à Sala (`qa/scripts/marco6-r4.mjs`; captura `F9-seta-visivel-hall.png`).
- F6-AU OK: Nick acorda na Sala (fase enfeites) por A; X com Nick acordado depois da parte 3 mostra "Au!" (captura `F6-au-depois-parte3.png`).
- RM2-d e RM2-e OK no roteiro certo (`marco6-r3-pecas.txt`): o erro de r8 é do roteiro.
- PS8 parcial; RG6-6 N/T.
- F9, F6-AU, F8 em diálogo: OK (acima).
- BUG-M2-05: não reproduzido (captura do Quarto com a seta em (0,7), gatilho P2).
- BUG-M2-02: ainda "a confirmar" (PO4 aberto).
- RM2-d e RM2-e: OK no roteiro certo (`marco5-final-pecas`); a falha de `marco5-r8` é do roteiro (rota após as luzes).
- Pausa repetida (marco6-r2, 2ª vez): 14 OK, 0 falhas (estabilidade).
- AU2 OK nas telas: título, exploração, dica e pausa tocando (`qa/scripts/marco6-r7-musica.mjs`); seleção e introdução OK (rodada 2).
- PS5 OK: P não abre no diálogo das luzes nem na condução (`qa/scripts/marco6-r6-pausa-conducao.mjs`); captura `PS5-dialogo-luzes-sem-II.png`.
- Veredito da rodada 3 (até ~1794273150): item 137 NÃO FECHADO. Pendências: P1 PO3 (1 px, backlog 138), P2 DS2 (depende de gzip no Pages), BUG-M2-02 aberto (PO4), DS3 N/T, PO5 N/T, AC2/AC4/AC5/AC6 N/T, AU10/AU11 N/T, RG6-6 N/T, Quarto e Escritório (PS1 OK; F8 e PS5 completos parciais).
- Repetições da rodada 3 (estabilidade): DS2 com gzip 3,87–3,88 s (3 medidas); DS2 sem gzip 9,39–9,41 s (3 medidas); PO3 invade 1 px (2 execuções); fade 5× sem ícone visível (repetido); pausa 14 OK (3ª execução).
- DS3 N/T: o marcador de tempo do gancho não casou com o relógio do navegador nas medidas (instante de evento fora da mesma base); medida não confiável, não reportada.
- Regressão de menus (qa/scripts/marco5-r9.mjs, de 0.9.1): as falhas de cruz (foco por cruz) são do roteiro antigo: a cruz saiu na 0.10.0 (joystick, item 118); o joystick já foi testado (marco5-joystick.mjs). Não é bug do Marco 6.

## Rodada 4 (início 1794274447)
- PO3 OK (corrigido): 667×375: zona "Voltar ao título" 392×49 em y=281,3, igual à base dos cartões (281,3); 0 cartões invadidos; toque leva ao título (`qa/scripts/marco6-r4-po3.mjs`). 844×390: sem botão (layout A, esperado).
- smoke:toque-menus OK (erros 0, falhas 0); smoke:icones OK (erros 0, falhas 0) (`qa/evidencias/marco6-r4-smoke-*.txt`).
- AU10 OK (`npm run verificar:audio`, saída em `qa/evidencias/marco6-r4-verificar-audio.txt`): pico de todos os arquivos em -3 dBFS ou menos (maior -3,07 dBFS). AU11 OK: silêncio da trilha 0,0 ms no início e 0,0 ms no fim (limite 20).
- BUG-M2-02 NÃO REPRODUZIDO: o texto de "porta fechada" aparece ao Z em P1 e em P2 (`qa/scripts/marco6-r4-m2-02.mjs`: P1 "Essa porta está fechada. Hoje não dá para entrar."; P2 idem). A leitura do roteiro falhava por posição (rota).
- P3 (primeiro B ignorado após diálogo na Hall): 10 tentativas, 0 ignoradas (`qa/scripts/marco6-r4-b10.mjs`). Não reproduzido. Ressalva: o roteiro não passou por diálogo a cada tentativa (dlg=0), então a condição "após o diálogo" ficou parcial.
- DS2 (método do QA, servidor HTTP com CDP, Fast 4G emulado, medido no canvas desenhado): sem gzip 9,39 / 9,41 / 9,40 s (FALHA); com gzip 3,86 / 3,85 / 3,88 s (OK, no limite). Conclusão: depende da compressão do Pages (P2 de bugs.md).
- PS5 OK na conquista da peça 1 (P não abre; mapa null; `qa/scripts/marco6-r4-ps5-conquista.mjs`); P na condução também não abre (rodada 2).
- RG6-6 (fluxo com teclado, pausa e mudo no caminho; `qa/scripts/marco6-r4-fluxo.mjs`): título→seleção→introdução→exploração OK; pausa abre e fecha no Hall e no Escritório; mudo liga e desliga; porta P8 pelo código OK; luzes, peça 1 e aviso OK; caixa e encaixe OK; mudo pós-caixa OK; erros de console: 0. Não fechado: a volta ao título ao final não foi confirmada nesse roteiro (no `marco5-r4.mjs rm`, a volta ao título passou). Leitura de textos do créditos não feita nesse roteiro (sem hook de texto).
- PS5 e pausa: os "FALHA" de PAUSA em Sala e Escritório são do roteiro (P pressionado durante condução ou transição, comportamento esperado de PS5).
- PO5 N/T: a faixa de passos de E7/E20 depende do backlog 133 (Produto); medição de rota não refeita.
- DS3 N/T (medida de latência não confiável com o marcador do gancho).
- AC2 e AC4 N/T; AC5 OK (ícone de som com risco na captura `au6-mudo-ligado-hall.png`); AC6 parcial (P↔II e M↔som por teclado; toque no ícone de som não medido nesta rodada).
- Nota: 'FALHA PO3 ... invade=true' em marco6-r3.mjs é do roteiro antigo (contava a própria zona larga como cartão). A checagem correta é marco6-r4-po3.mjs: invasões 0, zona alinhada à base dos cartões.

## Rodada 5 (início 1794275387; até ~1794276290)
- PO5 / item 133 MEDIDO: E7 (peça 2) = 10 passos; E20 (peça 3) = 14 passos, nos 4 sobrinhos (LoLô, BiBi, DanDan, TuTu). GDD 15.10: E7 "12 a 13", E20 "17 a 18". Faixa medida: E7 10–10, E20 14–14. Produto ajusta o GDD à rota medida (ou o Dev revisa a rota). Registrado em bugs.md (BUG-M2-03).
- AC2 OK pelo validador: `tests/presentation/tamanho-do-texto.test.ts` (8 testes passam) prova o piso de 12 px de jogo (`src/presentation/ui/tamanhoDoTexto.ts`). Medida de altura por captura não feita (N/T para captura; o critério de aceite alternativo é o validador).
- AC4: título 0 mudanças/3 s; exploração (Sala) 2,3/s; exploração (Hall) ~20/s numa caixa 20×24 px do canvas: candidato P2 em bugs.md (a confirmar com a Arte).
- AC1 OK por medidor sobre captura (`qa/scripts/marco6-r5-contraste.mjs`): título 15,33:1; seleção 15,33:1; pausa 7,46:1 (azul-claro) e 15,33:1 (creme). Todos ≥ 4,5.
- DS3 OK (medida in-page com performance.now e rAF, `qa/scripts/marco6-r5-ds3.mjs`): tecla M → evento de som em 13, 7 e 16 ms (3 medidas de 6; nas outras 3 o mudo não gera evento novo). Limite de 100 ms: OK.
- DS4 N/T: 10 min de memória com trocas de área e efeitos não rodados nesta rodada. Critério alternativo: amostrar `performance.memory` (Chromium) a cada 30 s em 5 min de exploração, sem crescimento acima de 30 MB.
- RG6-6 PARCIAL: `marco5-r4.mjs rm` (credits com teclado, "Versão 0.10.0", Z volta ao título): 11 OK. Fluxo combinado com pausa e mudo: até o encaixe OK; créditos e volta ao título não confirmados no combinado (roteiro pressionou Z demais; a pausa no Escritório abre quando testada sozinha).
- R134: 10 de 10 tentativas, gancho lista ícones no 1º quadro do fade; captura não mostra. P3, não visível (bugs.md).

## Rodada 6 (FINAL; início 1794276423; até ~1794277110)
- Suíte: smoke:playtest OK; smoke:toque-menus OK; smoke:pausa-som OK; smoke:icones OK; verificar:tamanho OK (HTML 1620 KB ≤ 2500; áudio 184,5 KB ≤ 320); verificar:audio OK (AU10 pico -3,07 dBFS; AU11 silêncio 0,0 ms e 0,0 ms); comparar:capturas 351 de 351 idênticas.
- AC4 OK (critério aceito: pares de inversões ≥ 10%, limite 3/s; `qa/scripts/marco6-r6-ac4.mjs`): bilhete do Hall 0,50 ciclo/s (4 inversões em 4 s); Sala, Cozinha, Quarto, Escritório sem inversões ≥ 10% na região medida nem no canvas inteiro. Fecha o candidato P2 de bugs.md (rodada 5) como tween suave do bilhete (Dev).
- DS4 OK (critério alternativo, `qa/scripts/marco6-r6-memoria.mjs`): performance.memory do heap JS 12,1 MB constantes em 272 s de exploração com trocas de área e pausa aberta/fechada 2×; crescimento 0,0 MB (≤ 30).
- PO5 / item 133: 10 (E7) e 14 (E20) trocas de tile amostradas após a porta, nos 4 sobrinhos; da peça 2 em (3,1) até a árvore amostradas 11 trocas (a passagem tem mapa nulo no gancho, por isso 2 passos a menos). Declarado 13 e 17. Bate dentro da resolução do gancho; contagem exata precisa de evento do jogo (pendência menor).
- RG6-6 PARCIAL 11/12 (`qa/scripts/marco6-r6-fluxo.mjs`, `qa/evidencias/marco6-r6-rg66.txt`): título→seleção→introdução→exploração OK; pausa abre e fecha OK; mudo liga/desliga OK; porta P8 pelo código OK; luzes OK; peça 1 e aviso OK; caixa e encaixe OK; créditos OK; Z → título OK; erros de console 0. FALHA: P não abre a pausa na Sala logo depois das luzes (2 de 2 execuções): candidato P3 em bugs.md, a confirmar.
- R134 (fade 667×375): 10 tentativas (rodada 5) → P3 do gancho, não visível (bugs.md).
- AC1, AC2, AC5, DS3 e os demais: ver rodadas 1 a 5.
- Veredito do item 137: NÃO FECHADO. Falta: explicar a pausa na Sala logo depois das luzes (RG6-6) e fechar PO5 com contagem por evento, se o Produto quiser o número exato.

## Fechamento do item 137 (v0.11.0)
- Item 137: FECHADO NO ALCANCE AUTOMATIZADO, com a decisão do Orquestrador: a pausa na Sala logo depois das luzes é por projeto (GDD 19.3.1); E7 = 13 e E20 = 17 do Produto, a reconfirmar em PT5 ou depois.
- Verificações desta etapa: `comparar:capturas` (5 diferenças, só o texto da versão; baseline atualizada e registrada em ORIGEM.txt); título "v0.11.0" e créditos "Versão 0.11.0" por captura; `smoke:playtest` OK; `build:release` OK; `verificar:release` OK (áudio embutido, sem rede, release 0.11.0; aviso: sem tag).
- Fora do alcance automatizado (Diretor): AU13, AU14, AC7, DS6, DS-FF (Firefox e WebKit), e as perguntas do PT5.
