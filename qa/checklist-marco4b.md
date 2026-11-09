# Checklist QA: Marco 4b (v0.8.1, plot twist da parte 3), rodada 4 (2026-11-09, 15 min, Chromium, teclado)

Build: `npm run build:qa` (dist-qa, não publicado). Roteiro: `qa/scripts/marco4-r4.mjs` (`IDX=0 NOME=LoLô MODO=Z` e `IDX=1 NOME=BiBi MODO=X`). Capturas: `qa/evidencias/marco4-r4/<sobrinho>/`. Partida real até a parte 3: `__irParaFase('parte2')` (conclui a peça 1), peça 2 e peça 3 jogadas, `__teleportar` só para trocar de cômodo.

Legenda: OK / FALHA / N/T (com motivo).

| ID | Verificação | LoLô | BiBi | Nota |
|---|---|---|---|---|
| CASO1a | 3 páginas, textos exatos, Z avança | OK | OK (p1 e p2) | p3 só no LoLô |
| CASO1b | Cada página cabe na caixa | N/T | N/T | Ver captura `CASO1-p1/p2/p3-*.png`; não conferido visualmente nesta rodada |
| CASO1c | X fecha o diálogo inteiro | OK (na p3) | OK (na p2, sem p3) | Ver obs. 1 |
| CASO2a | Durante as páginas: controle travado | OK | OK | `travado=true` nas leituras |
| CASO2b | Durante as páginas: Nick não dorme | N/T parcial | N/T parcial | Nick já estava "dormindo" (no escritorio (6,1) no LoLô). Ver BUG-M4-01 |
| CASO2c | Depois da última: controle volta, Nick dorme na Sala (8,5) | OK | OK | nick `sala:8,5 dormindo`, `travado=false` |
| CASO2d | Caixa aparece no Escritório | OK | OK | conquista A em (5,3) |
| CASO3a | H durante o diálogo: sem efeito | OK | OK | não abriu "Dica" |
| CASO3b | Backspace (B) durante o diálogo: sem efeito | OK | OK | |
| CASO3c | X durante o diálogo | Ver obs. 1 | Ver obs. 1 | X fecha (como no CASO1c), não "não faz nada" |
| CASO4a | Caixa, encaixe, diálogo final | OK | OK | "Agora a árvore está toda enfeitada!" |
| CASO4b | Diálogo final página 2 com Z | FALHA (ver BUG-M4-02) | FALHA (BUG-M4-02) | |
| CASO4c | Créditos com "Versão 0.8.1" | OK | OK | nome do sobrinho |
| CASO4d | "Voltar ao título" leva ao título | N/T (ver BUG-M4-02) | N/T | Z no créditos não confirmou o título nesta rodada |
| CASO5 | Exame da árvore no estado 3 | OK (p1), p2 N/T | OK (p1), p2 N/T | p1 "A árvore está montada!"; p2 "Falta a caixa de enfeites." não confirmado |
| CASO6 | Regressão partes 1 e 2 e Nick (seguir, farejar) | N/T | N/T | Limite de tempo; peças 1 e 2 jogadas na rodada, sem medir seguir/farejar |

Observações:
1. X no diálogo da chegada: a regra do caso 1 ("X fecha tudo") e a do caso 3 ("X não faz nada") se contradizem. O jogo fecha com X (como os demais diálogos). Pergunta ao Diretor no relatório.
2. Caixa escondida antes da chegada e mapa em cada página: sem falhas de texto nas leituras.

## Rodada 5 (2026-11-09, 15 min, Chromium, teclado; `qa/scripts/marco4-r4.mjs`; capturas `qa/evidencias/marco4-r4/LoLô/` e `BiBi/`)
Veredito: APROVADO com ressalvas (sem bug confirmado nesta rodada).

| ID | Resultado | Nota |
|---|---|---|
| CASO1 (3 páginas, textos, Z avança, X fecha) | OK | LoLô p1, p2, p3 (`CASO1-p1-Z`, `-p2-Z`, `-p3-Z`); BiBi p2 com X (`CASO1-p2-X`) fecha tudo, sem p3 |
| CASO1 "cabe na caixa" | OK | Visto nas 3 páginas do LoLô: 2 linhas, dentro da caixa, sem corte |
| CASO2 (controle travado nas páginas, caixa, Nick) | OK | Controle travado nas páginas; Nick não vai à Sala (8,5) durante o diálogo (fica no tile da fase, Escritório (6,1), GDD 16.2.2); depois: controle volta, Nick dorme em (8,5), caixa no Escritório |
| BUG-M4-01 | FECHADO (não é bug) | GDD 16.2.2: na parte 3 Nick dorme no Escritório (tile da fase); 17.6 só manda para a Sala (8,5) depois do diálogo |
| CASO3 (H e B nas páginas) | OK | H sem "Dica"; Backspace (B) sem efeito. X: fecha o diálogo inteiro (ver CASO1), como os demais diálogos (padrão 17.18 e resposta do Diretor) |
| CASO4 (caixa, encaixe, final, créditos 0.8.1, título) | OK | Página 2 do diálogo final "Feliz Natal para a família!" com Z, após 1,5 s (`CASO4-final-p2.png`); créditos "Versão 0.8.1" e nome; Z leva ao título com "Começar" |
| BUG-M4-02 | FECHADO (não reproduzido) | Com espera de 1,5 s após o texto surgir, a página 2 e o título aparecem nos dois sobrinhos. A falha da rodada 4 foi com Z cerca de 0,3 s após abrir o diálogo, dentro da janela de 200 ms bloqueados (15.6.5); não testado com Z dirigido àquela janela |
| CASO5 (exame do estado 3) | OK | p1 "A árvore está montada!" e p2 "Falta a caixa de enfeites." (ambos sobrinhos) |
| CASO6 (regressão: Nick acorda, segue, farejar) | OK parcial | Nick acorda com A e "O Nick acordou! Ele vai seguir você." (1ª vez); segue (fila 2); X aponta P3 para a direita na Sala (`CASO6-farejar-P3.png`). Peças 1 e 2 reais: peça 1 concluída pelo gancho `__irParaFase('parte2')`, peça 2 jogada de verdade. Seta da cozinha/quarto não testada |
