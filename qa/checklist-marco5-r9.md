# Checklist QA: Marco 5 (v0.9.1), reteste do BUG-M5-04 (escrito antes da execução)

Início: 1794257032. Limite: 15 min CHEIOS (fim no relógio, 1794257932 ou depois).
Build: `npm run build:qa` (rodada 9). Toque emulado (Chromium, hasTouch, DPR 2; `touchscreen.tap` = um toque; CDP `Input.dispatchTouchEvent` = segurar). Foco lido por `window.__focoDoMenu()` (só build:qa).
Sobrinhos: LoLô (cartão 0) e BiBi (cartão 1).
Roteiro: `qa/scripts/marco5-r9.mjs`. Capturas: `qa/evidencias/marco5-r9/`.

| ID | Verificação (toque) | 844×390 | 667×375 | Nota |
|---|---|---|---|---|
| M-TIT | Título: cruz baixo muda foco 0→1; cruz cima volta 1→0; segurar não repete | | (cruz some) | |
| M-TIT-A | Título: A no foco 1 abre Como jogar | | | |
| M-SEL | Seleção: cruz direita/esquerda muda cartão; segurar anda 1 cartão por toque | | | |
| M-SEL-LIM | Seleção: último cartão não dá a volta (ou o GDD diz o contrário) | | | |
| M-TQ | Toque direto nos itens (título, seleção) continua funcionando | | | |
| M-EXP | Exploração: cruz segurada continua andando (velocidade ~4 tiles/s) | | | |
| M-AB | Cruz + A juntos (examina); cruz + B (farejar) | | | |
| M-ROT | Cruz com o aviso de rotação: nada se move | | | |
| M-CAM | Caminho completo por toque até os créditos (regressão) | | | |
| M-TEC | Teclado nos menus (setas e Z) | | | |

## Resultados (rodada 9, até 1794257520)
- M-TIT 844 OK: cruz baixo 0→1, cruz cima 1→0, segurar não repete, A no foco 1 abre Como jogar, toque em Voltar volta.
- M-TIT 667 OK: cruz some nos menus; toque direto em Como jogar e em Voltar funciona.
- M-SEL 844 OK: cruz direita/esquerda 0→1→2→3→2; segurar 1,2 s anda um cartão; sem volta no último.
- M-SEL 667 OK: toque direto no cartão confirma (GDD 18.5, regra 6); cruz some.
- M-EXP OK: cruz segurada 0,5 s = 68 px (~64 esperado).
- M-AB OK (sem erro): cruz + A e B.
- M-ROT OK: cruz com o aviso não move o mundo (844 e 667).
- M-CAM 667 OK até os créditos (créditos "Versão 0.9.1"; "Toque em Voltar ao título" tocável). M-CAM 844 FALHA em 2 execuções: ver BUG-M5-05.
- M-TEC OK: setas e Z/X nos menus (teclado).
- Capturas: qa/evidencias/marco5-r9/ e qa/evidencias/marco5-r7/667x375-06-creditos.png (versão 0.9.1).
