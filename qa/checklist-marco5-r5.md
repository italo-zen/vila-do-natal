# Checklist QA: Marco 5 (v0.9.0), rodada 5 (escrito antes da execução)

Início: 1794251248 (`date +%s`). Limite: 15 min CHEIOS (fim no relógio, 1794252148 ou depois). O que não couber vira "não testado (limite de tempo)".
Objetivo: fechar o item 107 (regressão no teclado) com RM1 (roteiros N1, N2, N4, N9, N10, F1, F4, D1, D3, B1 de GDD 16.14) e RM2 (porta P8 pelo código, Marco 1 em amostra, luzes, peças 1 e 2 com avisos).
Build: `dist-qa/index.html`. Teclado (sem toque, 960×640), com `tecla()` de `qa/scripts/lib.mjs` (down 90 ms, up), `irAteHall`, `irAtePainel`, `digitar` de lib.mjs e `irPara`/`estado` de lib-rota.mjs.
Sobrinhos: LoLô (índice 0, código 017) e BiBi (índice 1, código 020).
Roteiro: `qa/scripts/marco5-r5.mjs`. Capturas: `qa/evidencias/marco5-r5/`.

| ID | Verificação (teclado) | Resultado | Evidência / nota |
|---|---|---|---|
| RM2-a | Título, seleção, introdução e Hall (LoLô e BiBi) | | |
| RM2-b | Porta P8 pelo código (017 LoLô, 020 BiBi): "Clique! A porta abriu." e entrada na Sala | | |
| RM2-c | Luzes: interruptor, "Parabéns, você conseguiu acender as luzes." e condução à árvore | | |
| RM2-d | Peça 1 (Sala): conquista, condução, "Agora a árvore tem 1 parte. Faltam 2 partes!" | | |
| RM2-e | Peça 2 com o aviso de chegada (Cozinha) | | |
| N1 | Nova partida: Nick dormindo na Sala (8,5) antes de abrir a porta | | |
| N2 | A na frente de Nick dormindo: "O Nick acordou! Ele vai seguir você." e "Aperte X para farejar." com barra "Z: avançar  X: fechar" (ou teclado) | | |
| N4 | Nick acordado segue 1 tile atrás em 10 passos | | |
| N9 | Fim do diálogo de chegada: Nick dorme no tile da próxima fase | | |
| N10 | Cômodo do Nick por fase (luzes Sala, parte 1 Cozinha, parte 2 Quarto) | | |
| F1 | Farejar com alvo em outro cômodo: seta sobre o gatilho na direção certa | | |
| F4 | Do Hall com alvo na Sala: seta para cima sobre a P8 | | |
| D1 | H abre a dica; "Voltar" com foco inicial | | |
| D3 | Texto da dica na fase (porta, luzes, parte 1) | | |
| B1 | Barra "Setas: andar  Z: examinar" e "X: farejar  H: dica" em duas linhas | | |

## Resultados (rodada 5, até 1794251820, ~9,5 min) — LoLô e BiBi
- RM2-b OK: porta P8 pelo código (017 e 020) por teclado; entra na Sala (fase luzes).
- N1 OK: Nick dormindo em (8,5) na Sala.
- N2 OK: sobrinho em (9,5) olhando para a esquerda; "Au! O Nick acordou! Ele vai seguir você. Aperte X para farejar." (texto de 16.14 N2).
- N4 OK (8 trechos, Nick a no máximo 1 tile).
- D1 OK: H abre a dica com "Voltar"; D3 OK parcial: texto da fase luzes ("A casa está escura. Procure o interruptor." e "Aperte X e o Nick fareja.").
- B1 OK: "Setas: andar  Z: examinar" e "X: farejar  H: dica" lidos na exploração (espaços normalizados na leitura).
- F1 OK parcial: a seta some depois de ~5 s (mas a seta nunca aparece, ver abaixo).
- FALHA (a confirmar): B (X) não ativa o farejar em fase luzes com Nick acordado, nem na mesma sala (F3, alvo = interruptor na Sala, sobrinho parado em (9,5) com travado=false) nem do Hall (F4, alvo na Sala, seta esperada para cima sobre a P8). Sem texto, sem "farejando", sem seta, `farejo.ativo=false` em LoLô e BiBi. Ler: 16.5.2 (luzes → alvo Sala). Candidato a bug de teclado (B/X) no Marco 5 ou regra de fase. Reproduzir com captura antes de abrir BUG.
- N9, N10: não testados (limite de tempo; exigem a chegada da parte 3 e o Quarto/Cozinha).
- F4 e RM1 F1/F4 ficam pendentes deste achado. Capturas: `qa/evidencias/marco5-r5/`. Saída: `qa/evidencias/marco5-r5-saida.txt`.
