# Checklist QA: Marco 5 (v0.9.0), rodada 2 (2026-11-09)

Escrito ANTES da execução. Início: 1794248456. Fim da execução: ~1794248900 (7 min 30 s de uma rodada de 15 min; o Orquestrador pediu 15 min cheios, e a rodada parou antes porque o roteiro de créditos não coube, ver "Limite de tempo").
Build: `dist-qa/index.html`. Toque emulado (Chromium, hasTouch, isMobile, DPR 2) com CDP e `touchscreen.tap`; teclado com `page.keyboard` (janela sem toque, 960×640). Marcado como "emulado (CDP)", "emulado (Playwright)" ou "teclado".
Roteiro: `qa/scripts/marco5-r2.mjs`. Saída: `qa/evidencias/marco5-r2/saida-rodada.txt`, `log.json`, capturas `01` a `13`.

Nota: "Quase! Leia o bilhete de novo." ao apagar já era assim no teclado. Não é bug (ideia futura).

## Resultados

| ID | Verificação | Resultado | Evidência / nota |
|---|---|---|---|
| TQ12 | Condução depois das luzes e depois da conquista da peça 1: sem botão, sem "?", sem barra; toque no meio não interrompe; botões voltam | OK (emulado CDP) | Luzes: 5 de 5 amostras de condução sem botão; posições 5,6 → 5,7 → 4,7 → 3,7 (toque no meio não interrompe). Peça 1: 4 de 4 sem botão. Botões voltam (cruz, A, B, "?") |
| TQ12 | Tela de conquista: A e B presentes; barra "A ou B: continuar" | OK | `03-conquista-peca1.png` |
| TQ9 | "?" some em diálogo das luzes, diálogo da peça 1, conquista e condução; volta depois | OK (emulado) | `01`, `03`, `04`, `05`. Fade: não observado nesta rodada (N/T para o fade) |
| TQ21 | Textos de toque "Toque em B..." e teclado "Aperte X..." | N/T parcial | Acordar o Nick por toque falhou: rota até (4,4) bloqueada pelo teste (Nick em (4,3)); texto "Toque em B para farejar." não foi lido. Dica com Nick dormindo: sem "Aperte X" no toque (OK). Teclado: N/T para os textos "Aperte X" |
| TQ20 | Créditos "Versão 0.9.0" e toque volta ao título | N/T (limite de tempo) | Caminho até os créditos não foi feito |
| TQ4 | Cruz pressionada + A examina o objeto à frente | FALHA de roteiro (não confirmado no jogo) | Rota até (7,5) foi "ok", mas o texto da Mesa não apareceu (T vazio). Pode ser o roteiro (direção ou posição); reteste na rodada 3 |
| TQ5 | Toque que começa fora e termina no A não age | OK (emulado CDP) | Sem texto novo e sem diálogo |
| TQ5 | A age ao pressionar (sem soltar) | FALHA (roteiro) | Sem texto na medida de 60 ms; A está no estado de pressionado, mas o teste não confirma a ação. Reteste na rodada 3 |
| TQ17 | H abre a dica com toque ligado | INCONCLUSIVO | Ao apertar H, o estado mostrou o sobrinho no Hall (3,1), sem diálogo nem dica; textos "Fogão | Forno | Geladeira" (da Cozinha). Não está claro se o H falhou ou se a posição não era a esperada. Reproduzir antes de classificar |
| TQ17 | Esc fecha a dica; X, Enter, Z sem erro | OK parcial (emulado) | Sem erro de console |
| RM3 | Como jogar no computador sem linha de toque | OK (teclado) | Sem "No celular" nem linhas de toque |
| RM4 | Como jogar no computador com linhas de teclado | OK parcial (teclado) | Com "Setas: escolher  Z: confirmar" na barra; a lista tem Z |
| RM4 | Exploração no teclado: sem texto de toque | OK parcial (teclado) | "Setas: andar  Z: examinar" |
| TQ16 | Pinça com dois dedos não dá zoom | OK (emulado CDP) | Escala visual antes 1, depois 1 |
| TQ15 | DPR 3 nítido | OK visual (emulado) | `13-dpr3-titulo.png`: bordas duras, sem borrão. Observação: o buffer do canvas é 480×352 (o design) e o CSS amplia com `pixelated`; o ADR-007 P4 fala em resolução = DPR. Visualmente está nítido; o Dev confirma se a intenção do P4 era o buffer no DPR (checagem automática do roteiro falhou por esse motivo) |
| RM1 | Roteiros prioritários de 16.14 e 17.13 no teclado | N/T (limite de tempo) | |
| RM2 | Checklist do Marco 1 em amostra | N/T (limite de tempo) | |
| RM5 | Fluxo completo com teclado até os créditos | N/T (limite de tempo) | |
| CAM | Caminho com toque até os créditos | N/T (limite de tempo) | |
| PT | Painel com BiBi, DanDan ou TuTu | N/T (limite de tempo) | Apenas LoLô na rodada 1 |

## Limite de tempo
- Créditos (TQ20, CAM), RM1, RM2, RM5 e o painel com outros sobrinhos ficaram sem execução. A rota de teclado e de toque até a Sala e o Nick (4,3) falhou em duas tentativas.

## Só aparelho real
- Mesmos itens do PT4 da rodada 1 (toque de criança e adulto, dedo sobre o layout B, barra do Safari e do Chrome, aviso ao girar de verdade, desempenho).
