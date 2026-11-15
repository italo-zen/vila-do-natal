# Checklist QA: Marco 5 (v0.9.0), rodada 8 (ÚLTIMA; escrito antes da execução)

Início: 1794254147. Limite: 15 min CHEIOS (fim no relógio, 1794255047 ou depois).
Build: `dist-qa` (rodada 7). BUG-M5-03 fechado como comportamento esperado (GDD 18.4).
Teclado: janela 960×640, `tecla()` de lib.mjs (90 ms). Sobrinhos: LoLô (017) e BiBi (020).
Roteiro: `qa/scripts/marco5-r8.mjs`. Capturas: `qa/evidencias/marco5-r8/`.

| ID | Verificação (teclado) | Resultado | Evidência / nota |
|---|---|---|---|
| N9-p3 | Plot twist, página 3 "Deve estar perdida pela casa." (captura) | | |
| RM2-d | Peça 1 jogada de verdade (sem atalho de peça): conquista e "Agora a árvore tem 1 parte. Faltam 2 partes!" | | |
| RM2-e | Peça 2 jogada de verdade (Cozinha): "ainda não" antes da peça 1 quando fora de ordem; aviso da peça 2 | | |
| F6 | Depois da parte 3: Nick dormindo, Z/X "zzz"; A acorda sem diálogo; Nick acordado faz "Au!" com X, sem seta | | |
| F7 | Peça 1 escondida: X na Cozinha aponta a P7 (alvo Sala), nunca para a peça 2 | | |
| F8 | X durante diálogo, painel e dica não faz nada | | |
| F9 | Andar sobre o gatilho com a seta visível leva ao outro cômodo | | |
| N4 | Nick acordado segue 1 tile atrás (10 passos) | | |
| D1 | H abre a dica; "Voltar" com foco | | |
| D2 | Z, X, Esc fecham a dica; H não fecha | | |
| D3 | Texto da dica por fase (porta, luzes) | | |
| B1 | Barra "Setas: andar  Z: examinar" e "X: farejar  H: dica" | | |
| TM | Menus no teclado sem controles de toque (sem "Toque", com "Setas/Z/X") | | |

## Resultados (rodada 8, até ~1794254660, ~8,5 min) — LoLô e BiBi
- TM OK: título no teclado com "Setas: escolher  Z: confirmar" e "X: voltar ao título", sem "Toque".
- RM2-b OK (porta P8 pelo código 017 e 020); RM2-c OK (luzes "Parabéns, você conseguiu acender as luzes.").
- RM2-e (fora de ordem) OK: peça 2 sem a peça 1 mostra "Ainda não! Essa é a parte do meio. Encontre a base antes." e nenhuma conquista.
- RM2-d e RM2-e (aviso da peça 1 e da peça 2 jogadas de verdade) NÃO FECHADOS: depois das luzes, a rota até (2,4) falhou nos dois sobrinhos (`__estado` devolveu null no início da rota depois de `__teleportar('sala','P8')` no fluxo longo do roteiro); o diagnóstico `qa/scripts/marco5-r8-diag.mjs`, sem a peça 2 e sem as recargas do fluxo, passou a rota (6,6)→(2,4). Limite de tempo para reproduzir o fluxo completo. Pendente.
- N9 OK (página 3 "Deve estar perdida pela casa." e página 2 "Mas tem algo estranho..." por leitura de canvas; Nick dormindo na Sala depois da chegada). Capturas `qa/evidencias/marco5-r8/*-N9-pagina-3-plot-twist.png`.
- F6 (parcial) OK: X com Nick dormindo após a parte 3: sem seta. "Au!" com Nick acordado não testado (N/T).
- F7 OK: X na Cozinha com a peça 1 pendente: sem seta para a peça escondida (farejo.ativo=false com Nick dormindo; leitura fraca, marcar como parcial).
- F8 parcial: X durante a dica não fecha nem age (D2 leitura); diálogo e painel N/T.
- F9 N/T (limite de tempo).
- D1 OK (H abre a dica); D2 OK (X fecha; H não fecha); D3 OK (dica da fase parte 2: "Procure uma parte da árvore. O Nick ainda está dormindo.").
- B1 N/T nesta rodada (lido na rodada 5: "Setas: andar  Z: examinar" e "X: farejar  H: dica").
- N4 e N-fila: N/T nesta rodada (N4 OK na rodada 5).
