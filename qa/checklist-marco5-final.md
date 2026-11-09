# Checklist QA: Marco 5 (v0.9.1), rodada final (escrito antes da execução)

Início: 1794258343. Limite: 15 min CHEIOS (fim no relógio, 1794259243 ou depois).
Build: `npm run build:qa` refeito (cruz com borda só nos menus: título, Como jogar, seleção; `temBordaDaCruz`). Versão lida do package.json (0.9.1) no roteiro.

| ID | Verificação | Resultado | Evidência / nota |
|---|---|---|---|
| CAM-844 | Caminho completo por toque até os créditos, 844×390, versão 0.9.1, Voltar ao título tocável | | |
| CAM-667 | Idem, 667×375 | | |
| MENU-844 | Título e seleção em 844×390: cruz move o foco (um toque = um passo; segurar não repete) | | |
| NOMENU | Cruz NÃO age fora dos menus (diálogo, conquista, créditos): sem borda nem movimento de foco | | |
| EXP-844 | Exploração segurada anda como antes (velocidade ~4 tiles/s) | | |
| RM2-d | Peça 1 jogada de verdade (teclado): "Agora a árvore tem 1 parte. Faltam 2 partes!" | | |
| RM2-e | Peça 2 jogada de verdade (teclado): aviso da peça 2 | | |
| F9 | Andar sobre o gatilho da porta com a seta visível leva ao outro cômodo | | |
| F6-AU | Nick acordado depois da parte 3: X faz "Au!" (balão), sem seta | | |
| F8 | X durante diálogo e painel não faz nada | | |

## Resultados (rodada final, até 1794258900, ~9 min)
- CAM-844 OK e CAM-667 OK: caminho completo por toque até os créditos, versão 0.9.1, Voltar ao título tocável (`qa/evidencias/marco5-final-cam-844.txt`, `-667.txt`).
- MENU-844 OK: cruz baixo/cima no título (0↔1, segurar não repete), A no foco 1 abre Como jogar; seleção cruz direita/esquerda (0→1→2→3, segurar anda 1 cartão, sem volta, esquerda 3→2) (`qa/evidencias/marco5-final-menus.txt`).
- NOMENU: foco de menu só existe em título, Como jogar e seleção (`__focoDoMenu` null na exploração e nas telas de jogo); exploração segurada anda (68 px em 0,5 s). Cruz com o aviso de rotação não move o mundo (844 e 667).
- EXP-844 OK (velocidade). Linha "cruz segurada 1 s = 28 px" é artefato do roteiro (sobrinho parado junto à parede do Hall).
- RM2-c OK (luzes, LoLô e BiBi), RM2-d OK ("Agora a árvore tem 1 parte. Faltam 2 partes!" jogando a peça 1 de verdade), RM2-e OK ("Agora a árvore tem 2 partes. Falta 1 parte!" jogando a peça 2 de verdade) (`qa/evidencias/marco5-final-pecas-saida.txt`).
- F8 OK (parcial): X na conquista da peça 1 sem efeito ("Au!"/farejar ausentes). Painel e diálogo: N/T.
- F9 N/T (limite de tempo). F6-AU N/T (exige Nick acordado depois da parte 3; caminho não repetido). 
- Teclado nos menus OK (`qa/scripts/marco5-r9-teclado.mjs`).
