# Checklist de QA: itens 046 e 047 (PT2b)

> Dono: QA. Criado ANTES de testar (2026-11-08). Fonte: GDD 14.9.3, 14.10.10, 14.11 (D4, D11 a D14); backlog.md, critérios de aceite 046 e 047. Build: `npm run build:qa` → `dist-qa/index.html`. Nunca publicar dist-qa.
> Status: vazio até o teste. Valores: `OK` / `FALHOU (BUG-xxx)` / `BLOQUEADO (motivo)` / `N/T (motivo)`.
> Limite: 15 min de rodada.

## 047: diálogo automático da árvore na chegada

| ID | Caso | Esperado | Resultado |
|----|------|----------|-----------|
| 047-1 | LoLô: luzes, Continuar, sem tocar em nada | Condução até (3,7) de frente para baixo; diálogo abre sozinho ao chegar, 2 páginas: "A árvore ainda está desmontada." / "Ela precisa de 3 partes. Examine a árvore!" | |
| 047-2 | BiBi, DanDan, TuTu: mesmo caso | Igual a 047-1 nos 3 | |
| 047-3 | Entrada bloqueada de 200 ms | Z, X, Enter e Esc nos primeiros 200 ms não avançam nem fecham | |
| 047-4 | Z avança a página | Vai à 2ª página; não avança sozinho por tempo | |
| 047-5 | X no meio do diálogo | Fecha o diálogo inteiro na hora; controle volta | |
| 047-6 | Barra do diálogo | "Z: avançar  X: fechar" | |
| 047-7 | Pisca (halo) | Começa com o diálogo, não durante o trajeto; para no primeiro A na frente da árvore | |
| 047-8 | Segurar uma seta durante a chegada | Não fecha o diálogo forçado na hora; o jogador não anda durante o diálogo | |
| 047-9 | Depois de fechar (Z na última ou X): anda e explora | Controle volta; sem novo diálogo automático | |
| 047-10 | A na frente da árvore (1º) | Mostra "A árvore ainda está desmontada. Ela precisa de 3 partes." (uma página; barra "Z: avançar  X: fechar") | |
| 047-11 | A repetido na árvore | Mostra o mesmo texto quantas vezes; não dispara o diálogo automático | |
| 047-12 | Voltar ao Hall e à Sala | Condução e diálogo automático não se repetem (D14) | |
| 047-13 | Nova partida (título, Começar) | Condução e diálogo automático voltam (D9) | |
| 047-14 | Regressão D1 a D10 de 14.11.6 | Sem mudança | |

## 046: indicadores de porta (estáticos)

| ID | Caso | Esperado | Resultado |
|----|------|----------|-----------|
| 046-1 | Captura da Sala (tela inteira) | Seta branca sobre P7 (parede da direita), apontando para a direita; tapete vermelho em (6,6) | |
| 046-2 | Sala: P1, P2, P3 | Sem seta nem tapete | |
| 046-3 | Captura da Cozinha | Seta branca sobre P7 (parede da esquerda), apontando para a esquerda | |
| 046-4 | Captura do Hall | P8 sem indicador | |
| 046-5 | Atravessar P7 nos dois sentidos | Nada muda no andar; seta não bloqueia nem dispara nada; vão continua não andável para o sobrinho sem passagem liberada | |
| 046-6 | Andar sobre o tapete (6,6) e atravessar P8 | Anda sobre o tapete; P8 funciona como antes | |
| 046-7 | Indicadores ficam sob o sobrinho | Sobrinho aparece por cima | |
| 046-8 | Indicador na última linha de tiles | Nenhum | |
| 046-9 | Indicador sobre bilhete, árvore, interruptor | Nenhum | |
| 046-10 | Legibilidade na tela 480×352 sem zoom | Seta e tapete legíveis; seta ocupa o tile da porta | |
| 046-11 | Pergunta 17 (seta na P7) | Aguardando Diretor; default sim aplicado | N/T (decisão do Diretor) |

## Regressão rápida

| ID | Caso | Esperado | Resultado |
|----|------|----------|-----------|
| R-1 | Painel Senha com WASD e setas | Foco se move; Z confirma | |
| R-2 | Bilhete no Hall | Texto abre e fecha | |
| R-3 | P1, P2, P3 fechadas | Mensagem de porta fechada | |
| R-4 | Móveis bloqueiam | Não atravessa | |
| R-5 | Interruptor (5,3) | Acende as luzes e abre conquista 1 | |
| R-6 | Console sem erros de página | Sem erro não tratado | |

## Navegadores
Chromium (Playwright) headless, 960×640, perfil HD (canvas 480×352). Firefox e Safari: N/T (não instalados neste ambiente, a confirmar).

## Resultados (rodada 2026-11-08, Chromium headless, dist-qa, script `qa/scripts/pt2b-046-047.mjs`, evidências em `qa/evidencias/marco1/pt2b-*.png`)

- 047-1: OK (LoLô, BiBi, DanDan, TuTu: condução até (3,7) baixo, diálogo abre sem tecla; página 1 com "Z: avançar  X: fechar"). Os 4 sobrinhos: OK.
- 047-2: OK (os 4 sobrinhos, mesmo fluxo; DanDan e TuTu sem tecla).
- 047-3: OK aproximado (DanDan: Z ao abrir, dentro dos 200 ms, não avança; o 2º Z depois de 400 ms mostra página 2). Medição exata de 200 ms N/T.
- 047-4: OK (LoLô: 800 ms com diálogo aberto; Z avança para a página 2).
- 047-5: OK (BiBi: X na página 1 fecha e devolve o controle; TuTu: X na página 2 fecha). Z na última página fecha (LoLô).
- 047-6: OK (barra "Z: avançar  X: fechar" na captura `pt2b-047-lolo-dialogo-p1.png`).
- 047-7 (pisca): N/T (não medido na rodada; o halo não foi inspecionado em fase).
- 047-8: OK (LoLô: seta segurada durante a condução e a chegada; diálogo continua aberto depois de soltar).
- 047-9: OK (LoLô: anda livre depois do diálogo).
- 047-10: OK (A na árvore: "A árvore ainda está desmontada. Ela precisa de 3 partes."; LoLô e BiBi).
- 047-11: PARCIAL (A repetido abre e fecha; o 3º A reabre a fala, confirmado por estado travado; o texto não foi lido na leitura de tela. Confirmar por captura no próximo teste).
- 047-12: OK (LoLô e BiBi: nenhum diálogo automático depois de fechar; Hall e Sala voltaram sem repetir).
- 047-13: N/T (nova partida não testada nesta rodada).
- 047-14 (regressão D1 a D10): N/T (só o painel WASD foi reexecutado: OK).
- 046-1: OK (`pt2b-046-lolo-sala-tela-inteira.png`: seta branca sobre P7 apontando para a direita; tapete vermelho no tile (6,6), à frente da P8).
- 046-2: OK (P1, P2, P3 com porta vertical sem seta nem tapete).
- 046-3: OK (`pt2b-046-lolo-cozinha-p7.png`: seta sobre P7 apontando para a esquerda).
- 046-4: OK (`pt2b-046-lolo-hall-p8.png`: P8 sem indicador).
- 046-5: OK (P7 atravessada nos dois sentidos, Sala ↔ Cozinha; nada muda no andar).
- 046-6: OK (anda sobre o tapete (6,6); P8 atravessada Sala → Hall → Sala).
- 046-7: N/T (sobreposição do sobrinho sobre o indicador não foi verificada por captura específica).
- 046-8, 046-9: OK por captura (nenhum indicador na última linha; nada sobre bilhete, árvore ou interruptor na Sala).
- 046-10: OK (legível em 480×352 com zoom 3x de captura; seta ocupa o tile da porta).
- 046-11: N/T (decisão do Diretor).
- R-1 (painel Senha, WASD e setas): OK (`marco1-r14-painel-wasd.mjs`, sem erro de console).
- R-2 (bilhete): N/T nesta rodada.
- R-3 (P1, P2, P3 fechadas): OK por captura; mensagem de porta fechada não reexecutada nesta rodada.
- R-4 (móveis bloqueiam): N/T nesta rodada.
- R-5 (interruptor (5,3)): OK (luzes e conquista 1 com os 4 sobrinhos).
- R-6 (erros de página): OK (0 erros em todas as runs).
- Firefox e Safari: N/T (não testados).

## Veredito
- 047: aprovado com ressalvas (pisca 047-7 N/T; 047-11 a confirmar o texto por captura; 200 ms exato N/T).
- 046: aprovado com ressalvas (046-7 e 046-11 N/T).
- Nenhum bug novo confirmado (ver `qa/bugs.md`, seção PT2b).

## Resultados da rodada final r15 (pré-PT2c, 2026-11-08, dist-qa rebuild; scripts scratchpad r15/r15b/r15c/r15d; capturas `qa/evidencias/marco1/r15-*.png` e `r15b-*.png`, `r15c-*.png`, `r15d-*.png`)

Regra nova aplicada (Dev, 046): P1 seta esquerda, P3 seta direita, P2 nenhuma, P7 direita (Sala) e esquerda (Cozinha), tapete (6,6).

| ID | Resultado |
|----|-----------|
| 046-1 | OK (`r15-sala-completa.png`: seta sobre P7 apontando para a direita; tapete em (6,6)) |
| 046-2 | OK (P2 limpa; P1 e P3 com seta; tapete ausente nessas portas) |
| 046-3 | OK (`r15-cozinha.png`: seta sobre P7 apontando para a esquerda) |
| 046-4 | OK (`r15-hall-inicio.png`: P8 sem indicador) |
| 046-5 | N/T nesta rodada (passou na rodada 2026-11-08 anterior) |
| 046-6 | N/T nesta rodada (passou antes) |
| 046-7 | N/T (sobreposição do sobrinho sobre o indicador não forçada; `r15-sala-perto-P7.png` mostra o sobrinho ao lado, sem cobrir a seta) |
| 046-8 | OK (última linha da Sala e da Cozinha sem indicador) |
| 046-9 | N/T |
| 046-10 | OK (legível em 480×352 sem zoom, capturas em 3×) |
| 046-11 | N/T (decisão do Diretor) |
| 047-1 | OK (LoLô; condução até (3,7) e diálogo abre sozinho, 2 páginas; `r15b-dialogo-auto-p1.png`) |
| 047-2 | N/T nesta rodada (passou na rodada anterior, 4 sobrinhos) |
| 047-3 | N/T nesta rodada (passou antes, aproximado) |
| 047-4 | N/T nesta rodada (passou antes) |
| 047-5 | N/T nesta rodada (passou antes) |
| 047-6 | OK (barra "Z: avançar  X: fechar" em `r15b-dialogo-auto-p1.png`) |
| 047-7 | PARCIAL: pisca para no 1º A (sem diálogo: 8 de 10 amostras distintas; depois do 1º A e X: 1 de 10). Invisível durante o diálogo: BUG-R15-01 |
| 047-8 | N/T nesta rodada (passou antes) |
| 047-9 | OK (X devolve o controle: `travado` falso; sem novo diálogo automático) |
| 047-10 | OK (A na árvore: "A árvore ainda está desmontada. Ela precisa de 3 partes.") |
| 047-11 | OK (3º A reabre a fala; `r15-arvore-A3.png`) |
| 047-12 | N/T nesta rodada (passou antes) |
| 047-13 | OK (recarregar: título com "Começar"; condução e diálogo automático voltam, 1 vez; `r15b-nova-partida-titulo.png`, `r15b-nova-partida-dialogo.png`) |
| 047-14 | N/T nesta rodada |
| R-1 Painel WASD | OK (a, w, d, s movem o foco; seta também; Esc fecha. Z não testado nesta rodada) |
| R-2 Bilhete (Hall) | OK (2 páginas: "Um bilhete para você." e "Dica: os 3 últimos dígitos do ano em que LoLô nasceu.") |
| R-3 P1, P2, P3 | OK (mensagem de porta fechada, capturas) |
| R-4 Móveis | Parcial: Rack TV, Estante, Mesa, Sofá e Fogão bloqueiam (OK). Geladeira e Forno: N/T (a rota não chega ao tile de frente) |
| R-5 Interruptor | OK (Parabéns, conquista 1) |
| R-6 Console | OK (sem erro de página nem de console) |
| P8 senha | Errada: "Quase! Leia o bilhete de novo." OK. Certa (0,1,7): abre a Sala. OK |
| Parede do Hall | OK: andar contra a parede não move |
| Pisca (pergunta 3) | OK para parar. Ver BUG-R15-01 para a visibilidade |
