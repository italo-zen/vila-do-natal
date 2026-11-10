# Checklist QA: Marco 5 (v0.9.0), rodada 4 (escrito antes da execução)

Início: 1794250645 (`date +%s`). Limite: 15 min CHEIOS (fim no relógio, 1794251545 ou depois).
Build: `dist-qa/index.html`. Toque emulado (Chromium, hasTouch, isMobile, DPR 2, CDP e `touchscreen.tap`) em 844×390 e 667×375. Teclado: função `tecla()` de `qa/scripts/lib.mjs` (down, 90 ms, up) em todos os passos, janela 960×640 sem toque.
Roteiro: `qa/scripts/marco5-r4.mjs`. Capturas: `qa/evidencias/marco5-r4/`.
Correções do Dev aplicadas: H com `tecla()` (não `keyboard.press`); caixa por toque com cruz presa (CDP) até (5,3), A na caixa, Continuar; `__estado` devolve null durante a conquista (checar o início da condução).

| ID | Verificação | Resultado | Evidência / nota |
|---|---|---|---|
| CAM-1 | Toque: peça 3 (Cozinha), conquista, condução (início confirmado), chegada | | |
| CAM-2 | Toque: caixa (Escritório), conquista, condução iniciada, encaixe, "Agora a árvore está toda enfeitada!" | | |
| CAM-3 | Toque: fade e créditos com "Versão 0.9.0" | | |
| TQ20 | Toque: "Voltar ao título" nos créditos volta ao título | | |
| TQ9 | "?" some durante o fade (amostra de `emFade`) | | |
| TQ4 | Cruz presa + A examina o fogão (Cozinha, (3,0)) a partir de (3,1) olhando para cima | | |
| TQ5 | A age ao pressionar (polling de textos, 400 ms, dedo preso), objeto à frente | | |
| TQ17 | H abre a dica na Sala/Cozinha com toque ligado (via `tecla()`) | | |
| TQ21 | Acordar o Nick por toque ("Toque em B para farejar.") | | |
| RM1 | Amostra dos roteiros prioritários (teclado): N1, N2, N4 | | |
| RM2 | Marco 1 em amostra (título, seleção, introdução, porta P8 com código 017 no teclado) | | |
| RM4 | Textos de teclado: "Z"/"X", sem texto de toque (exploração, dica, diálogos) | | |
| RM5 | Fluxo com teclado: parte 3 até os créditos, sem erro no console | | |

## Resultados (rodada 4, até 1794251199, ~9 min)
- CAM-1, CAM-2, CAM-3, TQ20, TQ9 (fade): OK em 844×390 e 667×375 (emulado CDP). Logs: `qa/evidencias/marco5-r4-cam-844.txt`, `marco5-r4-cam-667.txt`. Capturas `qa/evidencias/marco5-r4/844x390-*.png` e `667x375-*.png`.
- TQ4 OK (fogão examinado com cruz presa). TQ5 OK (ação em 26 ms com o dedo preso). TQ17 OK (H com tecla()). TQ21 OK ("Toque em B para farejar." depois de acordar o Nick). Logs: `qa/evidencias/marco5-r4-tq-844.txt`.
- RM2 OK parcial (título e intro por teclado; exploração), RM4 OK parcial, RM5 OK (parte 3 até os créditos por teclado, com `__irParaFase('parte3')`, Z para voltar ao título). RM1 N/T (roteiros de 16.14 não rodados). Log: `qa/evidencias/marco5-r4-rm-960.txt`.
- Não rodado: porta P8 por teclado (RM2, Marco 1 em amostra), roteiros N1 a B1 (RM1).
