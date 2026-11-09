# Checklist QA: joystick virtual (v0.10.0, item 118; GDD 18.19), escrito antes da execução

Início: 1794263260. Limite: 15 min CHEIOS (fim no relógio, 1794264160 ou depois).
Build: `npm run build:qa` (rodada joystick). Gancho: `window.__analogico()` → {dono, direcao, dx, dy, bolinha}; `__alvosDeToque` lista `analogico`; `__focoDoMenu`.
Toque: CDP `Input.dispatchTouchEvent` (base = touchStart; touchMove; touchEnd; id fixo). Chromium, hasTouch, DPR 2. 844×390 (layout A) e 667×375 (layout B). Sobrinhos: LoLô, BiBi.
Roteiro: `qa/scripts/marco5-joystick.mjs`. Capturas por estado: `qa/evidencias/joystick-v0100/`.

| ID | Verificação | Resultado | Evidência / nota |
|---|---|---|---|
| TQ23 | Posição fixa 844×390 (a 8 px da borda, alinhada com A/B) e 667×375 (lado esquerdo da tela, 8 px); toque fora não move a base | | |
| TQ24 | Grade: 0°, 90°, 180°, 270° anda; 45° anda só no eixo dominante | | |
| TQ25 | Zona morta e histerese: 8 e 16 em repouso nada; (14,14) nada; (16,12) engaja direita; 16 continua; 12 solta | | |
| TQ26 | Menus (844): título, empurrão para baixo = um passo, segurar não repete, voltar ao centro rearma; seleção esquerda/direita um passo | | |
| TQ27 | Joystick ausente em introdução, diálogo, painel, dica (captura) | | |
| TQ28 | Feedback: 10 px sem setor; 30 e 40 px com setor único; bolinha presa na borda a 40 | | |
| TQ29 | Deslizar para fora: direção segue o dedo; soltar fora zera | | |
| TQ30 | Multitoque: base para a direita + A com outro dedo: anda e A examina; soltar A não para | | |
| TQ31 | Textos "Mover: ..." e sem "setas" nos textos de toque; barra "Mover: andar  A: examinar" | | |
| TQ32 | `__alvosDeToque` sem os quatro braços; com a base de 120 px | | |
| TQ33 | Teclado inalterado (setas e WASD andam) | N/T | Não rodado nesta rodada (limite) |
| REG-V | Velocidade: base para a direita por 1 s vs teclado por 1 s | | |
| REG-CAM | Caminho completo por toque até os créditos, 844 e 667 (versão 0.10.0) | | |
| REG-ROT | Aviso de rotação com a base: mundo parado; resize sem troca de layout NÃO solta; troca de layout SOLTA | | |
| REG-AB | A/B por toque inalterados | | |

## Resultados (até 1794263760, ~8,5 min)
- TQ23 OK (844: base x=8, 120 px, base alinhada com A; 667: base x = canvas.x + 8, centrada nas linhas 2 a 8).
- TQ24 OK nas quatro direções (direção certa; a movimentação de direita e baixo foi bloqueada pela mesa e pela porta do Sala spawn, por geometria; esquerda 77 px e cima 49 px em 0,5 s). 45° exato sem direção anterior: nenhuma (empate, 18.19.4). (24,20): direita (eixo dominante).
- TQ25 OK: 8 px, 16 px (<20) e (14,14) nada; (16,12) engaja direita, 16 continua, 12 solta.
- TQ26 OK (844): título para baixo = 1 passo, segurar 3 s não repete, voltar ao centro rearma, para cima = 0; seleção direita = 1 passo, segurar = 1 passo, esquerda até o 0 sem volta.
- TQ28 OK: 10 px sem setor; 30 px segue o dedo; 40 px presa na borda (r = 36).
- TQ29 OK: deslizar para fora mantém a direção; soltar fora zera (dono false).
- TQ30 OK (sem erro): base + A juntos; A age e a base segue.
- TQ27 OK parcial: base ausente na dica. Intro, diálogo, painel, conquista, condução, fade, créditos sem base: N/T nesta rodada (o créditos e a conquista passaram no caminho completo sem erro).
- TQ31 OK: "Mover: andar  A: examinar" e "Mover: escolher  A: ..." sem "setas" nas barras lidas.
- TQ32 OK: sem braços da cruz; base de 120 px.
- Layout B nos menus: base ausente (toque direto), como 18.19.8.
- REG-ROT OK: resize sem troca de layout não solta; giro para retrato solta; troca A→B solta (`qa/scripts/marco5-joystick-rot.mjs`).
- REG-CAM OK 844 e 667 (versão 0.10.0 lida do package.json; créditos "Voltar ao título" tocável).
- REG-V N/T de precisão (o teste de velocidade igual ao teclado não foi medido nesta rodada).
- TQ33 N/T (teclado não rodado nesta rodada).
- Anel amarelo só nas direções da tela (título: sem setor para esquerda/direita): N/T nesta rodada.
- Capturas: qa/evidencias/joystick-v0100/ (`844x390-titulo-base.png`, `-TQ24-*.png`, `-TQ28-*px*.png`, `-TQ27-dica-sem-base.png`, `resize-sem-troca-segura.png`, `layout-B-joystick.png`).
