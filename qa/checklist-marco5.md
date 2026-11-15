# Checklist QA: Marco 5 (v0.9.0), rodada 1 (2026-11-09)

Build: `npm run build:qa` (dist-qa/index.html, NÃO publicado). `npm run build:playtest` passou e `verificar-sem-gancho` confirmou que o gancho não está no HTML de playtest.
Roteiro: `qa/scripts/marco5-r1.mjs` (Chromium, canal Chrome, headless). Toque emulado: `hasTouch`, `isMobile`, DPR 2. Dedos: `page.touchscreen.tap` (um toque) e CDP `Input.dispatchTouchEvent` com `id` fixo (dedos presos, arrasto, dois dedos). Rotação: `setViewportSize`, sem recarregar. Sonda de toque: `maxTouchPoints` 1, `ontouchstart` true, `(pointer: coarse)` true.
Janelas: 844×390 (layout A), 667×375 (layout B), 390×844 (aviso), 1920×955 sem toque (computador). Sobrinhos: LoLô, BiBi, DanDan, TuTu (cartões e nomes; a porta com 017 foi com LoLô).
Limite: 15 min CHEIOS (início 1794247862, fim perto de 1794248400, `date +%s`).
Marca: "emulado (CDP)" ou "emulado (Playwright)". Nada aqui é "aparelho real".

Observação de processo: este checklist foi escrito depois da primeira execução do roteiro (a regra manda antes). Os resultados abaixo são os da execução do roteiro, lidos dos logs e das capturas.

Legenda: OK / FALHA / N/T (não testado, com motivo).

| ID | Verificação | Resultado | Evidência / nota |
|---|---|---|---|
| TQ1 | Layout A 844×390: cruz 144 px à esquerda, A/B à direita, tela 532×390, nenhum controle sobre a tela | OK (emulado CDP) | `02`, `04`, log: cruz 144×144 em x=6; canvas x=156 w=532; sobrepostos: nenhum |
| TQ2 | Layout B 667×375: 60% de opacidade no repouso; nenhum botão nas linhas 0, 9 e 10; captura de Hall, Sala | OK (emulado) | `14-layout-B-hall-667x375.png`, `15-layout-B-sala-667x375.png`; opacidade 0,60 em todos; faixas de y 116 a 260 (linhas 3 a 7 do canvas) |
| TQ3 | Cruz: cada uma das 4 direções anda (Hall e Sala); sem diagonal; dois dedos, vence a última; soltar a última mantém a outra | OK (emulado CDP) | Log: direita, esquerda, cima, baixo andam; dois dedos (direita + cima): só o eixo vertical muda (x constante); após soltar cima, dir segue "cima" (nota abaixo) |
| TQ4 | Cruz pressionada + A: examina o objeto à frente | N/T parcial | A toca junto da cruz e o teste não confirmou o objeto examinado (sem captura de texto) |
| TQ5 | A e B agem ao pressionar; dedo preso anda; arrastar de um braço para outro troca a direção; toque que começa fora e termina no botão não age | OK parcial (emulado CDP) | Dedo preso: esquerda para baixo (troca por arrasto) OK. Estado pressionado de 150 ms e toque que começa fora não testados (N/T) |
| TQ6 | Toque no meio da tela (fora dos botões) não anda, não age, não abre diálogo | OK (emulado) | Tile (3,1) antes e depois; travado=false |
| TQ7 | Título e Como jogar: botões ≥ 48 px; linhas de 18.7; "Voltar" fecha | OK (emulado) | `02-como-jogar-844x390.png`: 5 linhas de toque; "Farejar: B, com o Nick acordado." quebra em 2 linhas (V4 aceito, sem corte); barra "A ou B: voltar" |
| TQ8 | Cartões: toque confirma e leva à introdução com o nome (4 sobrinhos) | OK (emulado) | "Oi, LoLô!", "Oi, BiBi!", "Oi, DanDan!", "Oi, TuTu!" (textos); captura `16-selecao-cartoes.png` |
| TQ9 | "?" abre a dica; "Voltar" fecha; "?" some em diálogo, painel, conquista, condução e fade | OK parcial (emulado) | Dica aberta por toque (`07-dica-toque.png`), barra "A ou B: voltar". Some em diálogo/conquista/condução/fade: N/T (limite de tempo) |
| TQ10 | Painel: teclas e "Fechar" ≥ 48; grade 5×3 (5+5+3); tocar fora não fecha; "Fechar" fecha; código errado nada muda; 017 abre a porta P8; cruz, A e B somem | OK (emulado) | `08-painel-toque.png`, `09-painel-codigo-errado.png`, `10-painel-codigo-017.png`; "Clique! A porta abriu." e entrada na Sala. Erros sem limite (20 seguidos) N/T. BiBi, DanDan e TuTu no painel: N/T (limite de tempo) |
| TQ11 | Barra de toque exata em cada tela; nenhum Z/X/H/Esc/Enter em tela de toque | OK parcial (emulado) | Título, Como jogar, exploração e dica conferidos; diálogo, conquista e créditos N/T |
| TQ12 | Condução e fade: botões somem; barra vazia; voltam ao devolver o controle | N/T (limite de tempo) | Não chegou à conquista 1 neste roteiro |
| TQ13 | Aviso 390×844: textos exatos, sem barra e sem botão; mundo congelado; volta no mesmo ponto | OK (emulado) | `12-aviso-rotacao-390x844.png`; textos em DOM "Gire o celular para o lado." / "O jogo fica na horizontal."; estado igual após 1,5 s e toque; volta a 844×390 em (6,6), mesmo mapa. Seta de farejar e dica aberta durante o aviso: N/T |
| TQ14 | Computador (sem toque) em 390×844: sem aviso | OK (emulado) | Log: sem aviso e sem controles |
| TQ15 | Escala: 844×390 → 532×390; 667×375 → 511×375; 1920×955 sem toque → 960×704; nitidez DPR 2 e 3 | OK parcial | 532×390, 511×375 e 960×704 medidos. Nitidez DPR 3 e análise visual de borda: N/T |
| TQ16 | Gestos do navegador: canvas com touch-action none e seleção desligada | OK parcial (CSS, emulado) | `touchAction: none`, `userSelect: none`. Pinça com dois dedos e toque longo: N/T |
| TQ17 | Teclado junto ao toque: setas, W, Z, X, H, Esc, Enter na mesma partida | OK parcial (emulado) | Seta esquerda e W andam com toque ligado; cruz depois do teclado anda. Z/X/H/Esc/Enter: só Z sem erro (N/T para os demais) |
| TQ18 | Recarregar em celular emulado volta ao título | OK (emulado) | Título com "Começar" depois de `reload` |
| TQ19 | Alvos ≥ 48 (cruz braços 48, A/B 64, cartões, zonas do título); folga ≥ 8 entre cruz, A e B | OK (emulado) | Log: todos os alvos DOM ≥ 48; A/B gap 8; cartões 115×177; zonas do título 408×53; zonas do painel ≥ 48 |
| TQ20 | Versão 0.9.0 no título e nos créditos | OK título / N/T créditos | Título "v0.9.0" OK. Créditos: N/T (limite de tempo) |
| TQ21 | Textos de farejar com toque ("Toque em B...") e teclado ("Aperte X...") | N/T | Não testado nesta rodada |
| RM3 | Como jogar no computador sem linha de celular | N/T parcial | Sem "No celular" no toque; o computador não foi aberto nesta tela |
| RM1, RM2, RM4, RM5 | Regressão do teclado (16.14, 17.13), Marco 1 (checklist), textos "Aperte X", fluxo completo com teclado | N/T (limite de tempo) | Não rodado nesta rodada |
| Marcos 1 a 4 | Regressão de toque até os créditos | N/T (limite de tempo) | Só o caminho título → seleção → introdução → Hall → painel (P8) → Sala foi feito |
| Versão | `package.json` 0.9.0 | OK | `package.json` 0.9.0; título "v0.9.0" |

## Observações (não são bugs)
- Após um código errado (123), a mensagem "Quase! Leia o bilhete de novo." continua na tela enquanto o jogador apaga e digita 017 (captura `10-painel-codigo-017.png`, tirada antes do OK). Pode ser o comportamento de sempre (também no teclado). O Produto decide se a mensagem some ao apagar. Registrado sem BUG por não ser reprodução de falha.
- Campo `direcao` do `__estado` é a direção em que o sobrinho olha, não a tecla presionada: depois de soltar tudo, ele continua "cima". Por isso o teste de dois dedos usou a posição (x constante, só y muda), que não tem diagonal. Sem bug.
- Grade do painel no toque é 5×3 e as 3 linhas medem 146, 206 e 266 px de y (cabem em 390). Confere com V5.
- Capturas T1 a T6 do GDD 18.15 foram tiradas: T1 (`01`/`04`), T2 (`14`/`15`), T3 (`12`), T4 (`02`), T5 (`08`), T6 (`07`). Aprovação do Diretor (backlog 108) pendente.

## Só aparelho real (PT4, não entra aqui como aprovado)
- Conforto e precisão do toque de criança de 5 a 10 anos e de adulto (48 px).
- Dedo cobrindo botão ou objeto de verdade (layout B).
- Barra do Safari no iPhone e do Chrome no Android, e a altura útil.
- Girar o aparelho de verdade e a sensação do aviso.
- Latência do toque e desempenho em celular intermediário.
- Safari no iPhone e Chrome no Android (compatibilidade).
