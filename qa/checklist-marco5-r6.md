# Checklist QA: Marco 5 (v0.9.0), rodada 6 (escrito antes da execução)

Início: 1794252212 (`date +%s`). Limite: 15 min CHEIOS (fim no relógio, 1794253112 ou depois). O que não couber vira "não testado (limite de tempo)".
Objetivo: fechar o item 107 (RM1 e RM2) com 2 sobrinhos (LoLô 017, BiBi 020). Teclado sem toque (960×640), `tecla()` de `qa/scripts/lib.mjs` (down 90 ms, up) em todos os passos.
Leitura: `ocupadoNick` (`nickOcupado`) e `farejo.ativo` de `__estado()` a cada 200 ms por 2 s depois do X (B).
Roteiro: `qa/scripts/marco5-r6.mjs`. Capturas: `qa/evidencias/marco5-r6/`.
BUG-M5-02 fechado em `qa/bugs.md` como "não reproduzido, leitura cedo" (Dev, rodada 6).

| ID | Verificação (teclado) | Resultado | Evidência / nota |
|---|---|---|---|
| F5 | Nick dormindo: X mostra "zzz", sem seta e sem texto de farejar | | |
| F3 | Mesmo cômodo (Sala, alvo interruptor), Nick acordado: "farejando" ~1,2 s, "Au!", sem seta | | |
| F4 | Do Hall, alvo na Sala: seta para cima sobre a P8 depois da animação | | |
| F1 | Seta some em ~5 s com fade de 0,5 s | | |
| D2 | Z, X, Esc ou clique em "Voltar" fecham a dica; H não fecha | | |
| F8 | X durante diálogo, painel ou dica não faz nada | | |
| N9 | Chegada da parte 3: Nick dorme no tile da próxima fase | | Só se o caminho couber no tempo |
| N10 | Cômodo do Nick por fase (luzes Sala, parte 1 Cozinha) | | Só se o caminho couber no tempo |
| RM2-c | Luzes: "Parabéns, você conseguiu acender as luzes." | | |
| RM2-d | Peça 1: conquista e aviso "Agora a árvore tem 1 parte. Faltam 2 partes!" | | |
| RM2-e | Peça 2: aviso de chegada (Cozinha) | | |

## Resultados (rodada 6, até 1794252570, ~6 min) — LoLô e BiBi
- RM2-b OK: porta P8 pelo código (017, 020) por teclado.
- N2 OK: Nick acordado, "O Nick acordou! Ele vai seguir você." e "Aperte X para farejar.".
- F4 OK (Hall): X do Hall com alvo na Sala acende a seta sobre a P8 (`saida=cima`, `porta=P8`) logo (0 ms na leitura de 200 ms). Capturas `LoLô-F4-seta.png`, `BiBi-F4-seta.png`.
- F1 OK: a seta some em ~2,5 s depois de aparecer (leitura de 500 ms); o GDD pede ~5 s: ver nota abaixo.
- D2 OK: H abre a dica com "Voltar" ("Z ou X: voltar"); H não fecha; Z fecha (captura `*-D2-fechada.png`).
- F3 INDETERMINADO: no mesmo cômodo, `farejo.ativo` e `nickOcupado` ficam false, e o texto "Au!"/"zzz" não aparece no canvas. Causa provável da leitura: o "Au!" e o "zzz" são balões (sprite, `mostrarBalao`), não texto do canvas, e o ocupado do mesmo cômodo não passa pelo `farejarEDepois` visível em `est`. Não dá para dar veredito pelo texto; capturas `*-F3-400ms.png` e `*-F3-parte1-400ms.png` precisam de olho humano (balão acima do Nick). Pelo código (CasaScene.farejar, case 'mesmoComodo'), o balão "Au!" sai quando o Nick está oculto ou após o farejando.
- F5 INDETERMINADO: mesma razão (zzz é balão). Não há seta no X com Nick dormindo (ativo=false em todas as leituras).
- F4 da Cozinha: não avaliado (depois de `__irParaFase('parte1')` o Nick dorme no tile da fase, F6/F5: sem seta por regra).
- RM2-c/d: `__irParaFase('parte1')` concluiu as luzes (fase parte1, Sala iluminada, travado=false). O aviso "Agora a árvore tem 1 parte" não foi relido (atalho). RM2-e N/T.
- F8, N9, N10: N/T (limite de tempo).
- Nota: F1 pelo GDD é "~5 s"; a leitura viu a seta sumir em 2,5 s depois de aparecer, com fade. Conferir no reteste (pode ser a parada da tremida ou a seta de 0,5 s).

## Correção (1794252715)
- O campo de ocupado em `__estado()` é `ocupadoNick` (não `nickOcupado`): a leitura da rodada 6 foi corrigida. Com a correção, F3 (mesmo cômodo, Sala, LoLô e BiBi) continua com `ocupadoNick=false` e `farejo.ativo=false` a cada 200 ms por 2 s depois do X, nas duas fases (luzes e parte1). Não há texto de "Au!" nem "zzz" no canvas (são balões de sprite). Diagnóstico `qa/scripts/marco5-r6-diag.mjs`: X com Nick dormindo não muda nenhum campo de estado.
- Veredito F3 e F5: INDETERMINADO. O Dev (rodada 6) diz que o farejar com Nick acordado tem 1,2 s de animação com `nickOcupado` (campo que o gancho chama `ocupadoNick`) antes do "Au!" no mesmo cômodo. Esta leitura não viu esse estado na Sala. Precisa de confirmação do Dev (`ocupadoNick` no mesmo cômodo) ou de captura de quadro a quadro.
- F4 (Cozinha, alvo na Sala): não obteve seta. Nick dormindo na Cozinha após `__irParaFase('parte1')` (N10: parte 1 é a Cozinha) — pela regra F5/F6, sem seta com Nick dormindo. Não é reprovação; o caso precisa do Nick acordado na Cozinha.
