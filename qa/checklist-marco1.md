# Checklist de QA: Marco 1 (fatia vertical)

> Dono: QA. Criado ANTES de testar. Fonte: GDD seções 4, 5, 6, 9, 14, 14.7 e 14.8; backlog itens 002 a 013; ADR-001; ADR-002. Se item e GDD divergirem, vale o GDD.
> Revisão 2 (2026-11-07, pedido do Orquestrador): barra de controles por tela (seção K2); regras do painel da porta (X apaga, só Esc fecha, X nunca fecha, foco inicial em OK, digitar não move o foco: F-13, F-14, F-66, F-80 a F-91); introdução com X (D-07, D-15 a D-18); acerto da porta (F-27 a F-29); conquista com X e Esc (G-15); J-05 e E-10 corrigidos.
> Revisão de 2026-11-07 (decisão do Diretor): NÃO há save nem checkpoint; o jogo sempre começa do zero. O título tem "Começar" e "Como jogar" (sem "Continuar"). Tela "Como jogar" incluída (seção B2). Item 009 cancelado. Fim do Marco 1 = exploração livre (seção G2).
> Status de cada caso: vazio até o teste. Valores: `OK` / `FALHOU (BUG-xxx)` / `BLOQUEADO (motivo)` / `N/T (não testado, motivo)`.
> Veredito por item (002 a 013) ao final do arquivo.

## 0. Ambiente e matriz

Build normal (`npm run dev` ou `npm run build` + preview) para tudo, exceto onde o caso disser "playtest".

| Eixo | Obrigatório | Observação |
|------|-------------|------------|
| Teclado, desktop | Chrome, Firefox, Safari (se disponível) | Marco 1 é só teclado |
| Celular paisagem (toque) | Fora do escopo do Marco 1 (toque entra no Marco 5). Só verificar que o jogo abre e não quebra; registrar como informativo | Informar o que não foi testado |
| Build playtest | Chrome e Firefox, por duplo clique (`file://`) | Safari se possível |

Registrar em cada rodada: data, commit/versão (lida do título), navegador+versão, SO, resolução da janela.

Pré-condições comuns:
- **PRE-1** Nada é gravado pelo jogo (GDD 9 e 14.6). Antes de cada rodada, limpar o `localStorage` da origem (DevTools > Application > Clear). Ao fim de cada fluxo completo, conferir que nenhuma chave foi criada (ver seção H).
- **PRE-2** Console do navegador aberto: qualquer erro não capturado (vermelho) durante um caso é falha, mesmo que a tela pareça correta.
- **PRE-3** Janela redimensionada para 3 tamanhos (ex.: 960x640, 1280x720, 1920x1080): a imagem escala em número inteiro, sem borrar nem distorcer.

Texto exato: comparar caractere a caractere, incluindo acentos, pontuação e maiúsculas.

---

## A. Setup e build (itens 002, 011)

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| A-01 | `npm install` em clone limpo, depois `npm run dev`; abrir a URL | Abre uma cena Phaser, resolução base 240x160, escalada em fator inteiro, sem erro no console | N/T (clone limpo e npm install não feitos; build normal testado com dist/ servido localmente) |
| A-02 | `npm test` | Termina com código 0; ao menos 1 teste de domínio executado; nenhum teste ignorado sem justificativa | OK |
| A-03 | `npm run build` | Termina com código 0, sem erro de TypeScript | OK |
| A-04 | Conferir a versão no título contra `package.json` (`version`) | Os dois são iguais; alterar `version` e rebuildar muda o título (versão não digitada à mão) | OK |
| A-05 | Revisão estática: buscar `phaser`, `window`, `document`, `localStorage`, `fetch`, `Math.random`, `Date.now` em `src/domain` e `src/application` | Nenhuma ocorrência (ADR-001); existe lint ou teste de arquitetura que falha se houver | OK |
| A-06 | `npm run build:playtest` | Gera `dist-playtest/index.html`; código 0 | OK |
| A-07 | Verificar o HTML de playtest: abrir o arquivo e buscar `src=`/`href=`/`url(`/`fetch(` com `http`, `./` ou caminhos relativos externos | Nenhuma dependência externa: JS, mapas, sprites e fonte embutidos (inline ou data URI) | OK |
| A-08 | Copiar só o `index.html` para uma pasta vazia; desligar a rede (modo avião/cabo); abrir por duplo clique (`file://`) em Chrome | Jogo carrega e chega ao título sem erro de rede/CORS no console; fonte correta visível | OK |
| A-09 | Repetir A-08 em Firefox (e Safari se possível) | Mesmo resultado de A-08 | N/T (Firefox não instalado; Safari não automatizável neste ambiente) |
| A-10 | Na build de playtest, jogar do título até a conquista 1 sem rede | Fluxo completo funciona; nenhuma requisição na aba Network (exceto o próprio arquivo) | OK |
| A-11 | Build de playtest com `localStorage` bloqueado: simular (Chrome: Configurações > Privacidade > bloquear dados do site; ou DevTools: sobrescrever `Storage.prototype.setItem`/`getItem` para lançar) e abrir | Jogo abre e roda normalmente até a conquista 1 (o jogo não depende de armazenamento); nenhuma exceção chega ao console como erro não capturado | OK |
| A-12 | Versão visível no título da build de playtest | Texto de versão no canto do título, legível, igual ao `package.json` | OK |

---

## B1. Título (item 003; GDD 14.1 "Título")

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| B-01 | Com `localStorage` limpo (PRE-1), abrir o jogo | Aparece "Natal na Casa do Tio Ítalo e da Tia Nath" e os botões "Começar" e "Como jogar", com foco inicial em "Começar". Botão "Continuar" NÃO aparece | OK |
| B-02 | Olhar o canto da tela | Versão visível no formato `vX.Y.Z` (ex.: `v0.1.0`); legível, não sobreposta a outros elementos | OK |
| B-03 | Fonte e tamanho | Fonte grande e legível, bom contraste, sem texto cortado na tela 240x160 escalada | OK |
| B-04 | Com foco em "Começar", pressionar Z (ou Enter) | Vai direto para a seleção de personagem, sem pergunta de confirmação | OK |
| B-05 | Recarregar a página (F5) em cada etapa: no título, na seleção, na introdução (página 2), no painel da porta com dígitos digitados, depois de abrir a porta, depois da conquista 1 e na exploração | Sempre volta ao título, com "Começar" e "Como jogar" e sem "Continuar". Nenhum progresso é retomado (sem sobrinho escolhido, porta trancada, casa escura, árvore desmontada ao recomeçar) | OK (parcial: título após intro e após seleção; porta aberta via F-71) |
| B-06 | Jogar até a conquista 1, fechar a aba e abrir o jogo de novo na mesma URL (nova aba) | Título sem progresso; "Continuar" não aparece. Ao escolher "Começar": seleção com foco em LoLô, introdução desde a página 1, hall com porta trancada | OK (rodada 2: nova aba na mesma URL volta ao título sem Continuar) |
| B-07 | No título, pressionar cima/baixo e W/S várias vezes | O foco alterna entre "Começar" e "Como jogar"; foco sempre visível e inequívoco; Z ou Enter ativa a opção em foco | OK |
| B-08 | No título, pressionar X e Esc | Nada acontece: o título continua igual, com o mesmo foco; sem erro no console | OK |
| B-09 | Não existe nenhum contador de tempo, pontuação ou outro HUD na tela de título | Confirmado (a barra de controles, K2-01, não conta como HUD) | OK |

---

## B2. Tela "Como jogar" (item 003; GDD 14.1 "Tela Como jogar")

Textos exatos (GDD 14.1): título "Como jogar"; botão "Voltar"; linhas:
1. "Mover: setas ou WASD"
2. "Botão A: Z ou Enter. Conversar, examinar e avançar textos."
3. "Botão B: X ou Esc. Voltar e fechar textos e painéis."
4. "No celular, em breve: botões na tela."

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| B-10 | No título, mover o foco para "Como jogar" (cima/baixo ou W/S) e pressionar Z (ou Enter) | Abre a tela "Como jogar"; sem erro no console | OK |
| B-11 | Comparar o texto da tela com as 4 linhas acima, caractere a caractere | Título "Como jogar" e as 4 linhas idênticas às do GDD 14.1 (acentos, pontuação e maiúsculas). Nenhuma linha extra (sem Nick, dica, toque ou rotação no Marco 1) | OK |
| B-12 | Entrar na tela "Como jogar" 3 vezes seguidas, sem mexer em nada | Foco inicial em "Voltar" em todas as vezes, visível. "Voltar" é o único botão da tela | OK |
| B-13 | Com foco em "Voltar", pressionar Z (ou Enter) | Volta ao título com o foco em "Começar" | OK |
| B-14 | Entrar em "Como jogar" e pressionar X com foco em "Voltar" | Volta ao título (botão B) | OK |
| B-15 | Entrar em "Como jogar" e pressionar Esc | Volta ao título (botão B) | OK |
| B-16 | Na tela "Como jogar", pressionar setas e W/A/S/D várias vezes | Foco continua em "Voltar"; nada se move por trás da tela; sem erro no console | OK |
| B-17 | Verificar as 4 linhas em 240x160 escalado e nos 3 tamanhos de janela (PRE-3) | Texto inteiro visível em todas as linhas, sem corte (a linha mais longa é a do botão A); fonte legível e com bom contraste. Se a linha quebrar, o texto deve continuar inteiro; registrar a quebra | OK |
| B-18 | Alternar 10 vezes: "Como jogar" > Voltar (Z) > "Como jogar" > Voltar (X) | Sem erro; a tela não empilha nem duplica; cada volta leva ao título | OK |
| B-19 | Depois de voltar de "Como jogar", escolher "Começar" | Vai à seleção de personagem normalmente (sem regressão de B-04) | OK |
| B-20 | Build de playtest (Chrome e Firefox, `file://`): abrir "Como jogar", conferir o texto e voltar | Mesmo texto e mesmo comportamento da build normal (B-10 a B-15) | OK |

---

## C. Seleção de personagem (item 004; GDD 14.1 "Seleção")

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| C-01 | Do título, ir a "Começar" | Título da tela: "Quem vai jogar?" | OK |
| C-02 | Observar os cartões | 4 cartões em fila, nesta ordem: LoLô, BiBi, DanDan, TuTu; cada um com sprite provisório e nome (grafia exata, com acento no "ô") | OK |
| C-03 | Sem tocar em nada, ver o foco | Foco inicial em LoLô; nenhum sobrinho pré-confirmado | OK |
| C-04 | Seta direita 3 vezes, depois seta esquerda 3 vezes | Foco passa LoLô, BiBi, DanDan, TuTu e volta; mudança visível a cada toque | OK |
| C-05 | Repetir C-04 com A e D | Mesmo comportamento das setas | OK |
| C-06 | No último cartão, pressionar direita; no primeiro, esquerda | Comportamento definido e sem erro (para no limite ou dá a volta); registrar qual. Nunca fica sem foco | OK |
| C-07 | Pressionar X (ou Esc) na seleção | Volta ao título; nada foi gravado (PRE-1) | OK |
| C-08 | Para cada sobrinho (LoLô, BiBi, DanDan, TuTu): focar e confirmar com Z | Vai para a introdução com o sobrinho escolhido (sprite e nome corretos); nenhuma chave gravada no `localStorage` (seção H) | OK |
| C-09 | Conferir DevTools > Local Storage depois de C-08 | Nenhuma chave criada pelo jogo | OK |
| C-10 | Confirmar rapidamente (Z repetido) | Não abre duas introduções | OK |
| C-11 | Os 4 sobrinhos têm a mesma velocidade: cronometrar a travessia do mesmo trecho do hall (ex.: 5 tiles) com cada um | Tempo igual nos 4 (diferença dentro de erro de medição, <= 1 frame) | N/T (cronometragem não feita; igualdade de velocidade coberta por teste de domínio, C-13) |
| C-12 | Os 4 sobrinhos têm as mesmas interações: repetir o fluxo de bilhete, porta e interruptor com cada um | Todas funcionam igual; nenhum tem habilidade extra | OK |
| C-13 | Teste automatizado (revisão): existe teste de domínio garantindo que os 4 têm mesma velocidade e interações | Teste presente e passando | OK |

---

## D. Introdução (item 005; GDD 14.1 "Introdução")

Executar D-01 a D-08 para cada um dos 4 sobrinhos. Substituir `{nome}` pelo nome escolhido.

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| D-01 | Escolher LoLô e confirmar | Cenário: hall do elevador. Página 1: "Oi, LoLô!" | OK |
| D-02 | Repetir D-01 com BiBi | "Oi, BiBi!" | OK |
| D-03 | Repetir D-01 com DanDan | "Oi, DanDan!" | OK |
| D-04 | Repetir D-01 com TuTu | "Oi, TuTu!" | OK |
| D-05 | Avançar com Z/Enter, uma página por vez (qualquer sobrinho) | Ordem exata: 1 "Oi, {nome}!" / 2 "O tio Ítalo e a tia Nath não estão em casa." / 3 "Eles precisam de ajuda para montar a árvore de Natal." / 4 "A casa está bagunçada. Vamos entrar?" | OK |
| D-06 | Em cada página, esperar 30 segundos sem apertar nada | Nenhuma página avança sozinha (sem tempo automático) | OK |
| D-07 | Em cada página (1 a 4), pressionar X uma vez | Página 1: volta à seleção (D-15). Páginas 2 a 4: volta à página anterior (D-16). X nunca pula a introdução nem leva direto ao hall | OK |
| D-08 | Em cada página, pressionar setas, W/A/S/D e outras teclas (exceto X e Esc, ver D-07 e D-17) | Nada avança nem quebra; só A (Z/Enter) avança | OK |
| D-09 | Depois da página 4, pressionar Z | Diálogo fecha; jogador controla o personagem no hall | OK |
| D-10 | Posição inicial no hall (após a introdução) | Personagem de frente para a porta, a 3 tiles dela | OK (BUG-001 corrigido; parado olha para a direção, captura lolo-parado-direita-3x) |
| D-11 | Terminar a introdução e conferir DevTools > Local Storage | Nenhuma chave criada pelo jogo (seção H); a introdução não gera gravação | OK |
| D-12 | Gênero e concordância: ler todos os textos da introdução e do bilhete com LoLô/BiBi e com DanDan/TuTu | Nenhuma frase concorda errado em gênero (os textos do Marco 1 são neutros) | OK |
| D-13 | Recarregar a página no meio da introdução (página 2) | Volta ao título sem progresso (B-05). Ao escolher "Começar" de novo, a seleção aparece e a introdução recomeça da página 1 | OK |
| D-14 | Caixa de texto | Fica embaixo da tela; fonte grande; texto cabe na caixa sem cortar em qualquer das 4 páginas e com o nome mais longo | N/T (captura feita; inspeção visual não concluída) |
| D-15 | Escolher DanDan (ou outro sobrinho), ir à página 1 da introdução e pressionar X | Volta à seleção, com o cartão DanDan em foco (não LoLô); título "Quem vai jogar?" e barra da seleção (K2-04) | OK |
| D-16 | Ir à página 4 e pressionar X; repetir até voltar | Página 4 > página 3 > página 2 > página 1: cada X mostra exatamente a página anterior, com o texto certo; nada é pulado | OK |
| D-17 | Repetir D-07 e D-16 com Esc no lugar de X | Mesmo resultado de X (Esc é o botão B; GDD 14.8) | OK |
| D-18 | Ir à página 4 e pressionar X 4 vezes seguidas | Página 4 > 3 > 2 > 1 > seleção, sem erro e sem pular. Confirmar de novo com Z: a introdução recomeça na página 1 | OK |

---

## E. Hall, movimento, interação e câmera (item 006; GDD 4.1, 5, 14.2)

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| E-01 | No hall, pressionar cada seta | Move em cima, baixo, esquerda, direita | OK |
| E-02 | Repetir com W, A, S, D | Mesmo resultado das setas | OK (WASD movem nas 4 direções) |
| E-03 | Segurar duas direções ao mesmo tempo (ex.: cima + direita) | Sem movimento diagonal; anda em uma direção só | OK |
| E-04 | Soltar a tecla | Para no tile (ou imediatamente) sem escorregar nem atravessar parede | OK |
| E-05 | Andar contra cada parede, o elevador e a decoração do hall | Colisão: o personagem não atravessa nada | OK |
| E-06 | Tentar prender o personagem: andar em cantos, junto ao bilhete, junto à porta, rapidamente alternando direções | Nunca fica preso; sempre há como sair | OK |
| E-07 | Virar para o bilhete (de frente) e pressionar Z; repetir com Enter | Interage com o objeto em frente; ambos funcionam | OK (Enter de frente para o bilhete abre o diálogo) |
| E-08 | Pressionar Z sem nada em frente | Nada acontece, sem erro | OK |
| E-09 | Pressionar Z de costas/de lado para o bilhete | Não interage (só o objeto em frente) | OK (Z de lado para o bilhete não interage) |
| E-10 | Abrir um diálogo (bilhete, "Está tudo escuro!", "Clique!", árvore) e pressionar X; repetir com Esc. A introdução e o painel têm regras próprias (D-07 a D-18; F-80 a F-91) | Diálogo fecha | OK |
| E-11 | Com diálogo aberto, tentar andar | Personagem não se move enquanto o diálogo está aberto | OK |
| E-12 | Diálogo de várias páginas (bilhete): avançar com Z | Avança uma página por vez; sem avanço automático; última página fecha | OK |
| E-13 | Segurar Z pressionado ao abrir e fechar diálogo | Não reabre em loop nem pula páginas por repetição de tecla | N/T (limite de tempo) |
| E-14 | Troca de cômodo: andar da sala à cozinha pela passagem | A câmera pula direto para a cozinha (sem rolagem); o jogador aparece junto à passagem do outro lado | OK |
| E-15 | Voltar da cozinha à sala | Mesmo comportamento, sem rolagem; sem ficar preso na passagem | OK |
| E-16 | Atravessar a passagem 20 vezes seguidas, em direções variadas | Sem travar, sem teleporte para posição errada, sem erro no console | OK (rodada 2 reduzida: 10 travessias ida/volta em vez de 20, todas com troca nos dois sentidos) |
| E-17 | Em cada cômodo (hall, sala, cozinha): tamanho da tela | Câmera fixa de 15x10 tiles (240x160); nada fora do quadro é visível | OK |
| E-18 | Nenhuma tela mostra relógio, contador de tempo ou limite | Confirmado | OK |
| E-19 | HUD no Marco 1 | Vazio (sem Nick, sem ícone de dica, sem pausa). A barra de controles (K2) é a única linha fixa no rodapé e não conta como HUD | OK |

---

## F. Bilhete e painel da porta (item 007; GDD 4.2, 14.1 "Bilhete" e "Porta", 14.4)

### F1. Bilhete

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| F-01 | Olhar o hall ao ganhar o controle | Bilhete de papel amarelo, na parede à direita da porta, visível sem procurar, com brilho que pisca suave | OK |
| F-02 | Com LoLô, examinar o bilhete (A) | Diálogo 1: "Um bilhete para você." Diálogo 2: "Dica: os 3 últimos dígitos do ano em que LoLô nasceu." | OK |
| F-03 | Idem com BiBi | "Dica: os 3 últimos dígitos do ano em que BiBi nasceu." | OK |
| F-04 | Idem com DanDan | "Dica: os 3 últimos dígitos do ano em que DanDan nasceu." | OK |
| F-05 | Idem com TuTu | "Dica: os 3 últimos dígitos do ano em que TuTu nasceu." | OK |
| F-06 | Examinar o bilhete 5 vezes seguidas | Sempre o mesmo texto; sem mudar nem sumir | OK |
| F-07 | Fechar o bilhete com X na primeira e na segunda página | Fecha sem erro; pode examinar de novo | OK |

### F2. Painel de código (layout e abertura)

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| F-10 | Ficar de frente para a porta trancada e pressionar Z | Abre o painel com a pergunta exata "Senha" | OK |
| F-11 | Observar o painel | Pergunta "Senha"; 3 campos de dígito vazios; teclado numérico na tela com 0 a 9, "Apagar" e "OK"; foco visível começando em "OK" (ver F-83) | OK |
| F-12 | Com o painel aberto, tentar andar com as setas | Setas movem o foco entre as teclas do painel, não o personagem | OK |
| F-13 | Pressionar X com o painel aberto e vazio | Nada acontece: o painel NÃO fecha (X apaga, e não há o que apagar); personagem não se move; sem erro. Quem fecha o painel é só Esc (F-80) | OK |
| F-14 | Digitar 2 dígitos e pressionar X 3 vezes | 1º X: apaga o 2º dígito (fica 1). 2º X: apaga o 1º (campos vazios). 3º X: nada acontece e o painel continua aberto (X nunca fecha). Esc fecha (F-80) | OK |
| F-15 | Fechar com Esc com dígitos digitados e reabrir o painel | Painel reabre sem lixo de tentativas anteriores (campos vazios ou comportamento consistente) | OK |

### F3. Códigos corretos por sobrinho

Para cada linha, escolher o sobrinho em novo jogo, ir até a porta e digitar o código por teclado (dígitos) e confirmar com Enter.

| ID | Sobrinho | Código digitado | Resultado esperado | Status |
|----|----------|-----------------|--------------------|--------|
| F-20 | LoLô | 017 | Painel fecha; aparece o diálogo "Clique! A porta abriu." (F-27); ao fechar o diálogo (F-28), o jogador entra na casa | OK |
| F-21 | BiBi | 020 | Idem F-20 | OK |
| F-22 | DanDan | 023 | Idem F-20 | OK |
| F-23 | TuTu | 024 | Idem F-20 | OK |
| F-24 | Qualquer | Código certo confirmado com Z, com o foco em OK (inicial) | Mesmo resultado de F-20 | OK |
| F-25 | Qualquer | Código certo, confirmado movendo o foco até "OK" e pressionando Z | Mesmo resultado de F-20 | OK |
| F-26 | Qualquer | Código certo digitado clicando as teclas na tela por setas + Z | Os 3 campos preenchem na ordem; confirma com OK | OK |
| F-27 | Qualquer | Código certo confirmado (F-20) | Acerto acontece na ordem certa: o painel fecha; só então aparece o diálogo "Clique! A porta abriu." com barra "Z: avançar   X: fechar" (K2-08). O painel não fica aberto por trás do diálogo, e o diálogo aparece uma vez | OK |
| F-28 | Qualquer | Com o diálogo "Clique! A porta abriu." aberto, pressionar Z | Diálogo fecha e o jogador entra na casa: sala, 1 tile à frente da porta, de frente para dentro (14.3) | OK |
| F-29 | Qualquer | Repetir F-28 com X; em outra rodada, com Esc | X e Esc fecham o diálogo e o jogador entra na casa, igual a F-28 | OK |

Ao abrir a porta (F-20 a F-23): conferir também (a) efeito sonoro de porta, se houver áudio (Marco 1 pode não ter; registrar N/T), (b) nenhuma chave gravada no `localStorage` (seção H), (c) jogador na sala, 1 tile à frente da porta de entrada, de frente para dentro.

### F4. Código de outro sobrinho deve falhar

Matriz: cada sobrinho escolhido rejeita os 3 códigos dos outros. Resultado esperado em todas as células: porta NÃO abre; aparece uma mensagem de erro do ciclo (ver F5); campos são limpos.

| ID | Sobrinho jogando | Códigos que devem ser rejeitados | Status |
|----|------------------|----------------------------------|--------|
| F-30 | LoLô | 020, 023, 024 | OK |
| F-31 | BiBi | 017, 023, 024 | OK |
| F-32 | DanDan | 017, 020, 024 | OK |
| F-33 | TuTu | 017, 020, 023 | OK |

### F5. Erros, mensagens e tentativas ilimitadas

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| F-40 | Digitar 0 dígitos e confirmar (OK) | "Faltam números." (porta não abre) | OK |
| F-41 | Digitar 1 dígito e confirmar | "Faltam números."; os dígitos digitados permanecem ou são limpos de forma consistente (registrar qual) | OK |
| F-42 | Digitar 2 dígitos e confirmar | "Faltam números." | OK |
| F-43 | Tentar digitar um 4o dígito | Ignorado ou bloqueado; nunca aparecem mais de 3 campos preenchidos | OK |
| F-44 | Teclas não numéricas (letras, símbolos, espaço) no painel | Ignoradas, sem erro | OK |
| F-45 | Com LoLô, digitar 111 e confirmar | Primeira mensagem de erro: "Quase! Leia o bilhete de novo."; campos limpos | OK |
| F-46 | Segundo erro seguido | "Hmm, esse não é. Tente outra vez!"; campos limpos | OK |
| F-47 | Terceiro erro seguido | "Sem pressa. Você consegue!"; campos limpos | OK |
| F-48 | Quarto erro seguido | A mensagem volta à primeira ("Quase! Leia o bilhete de novo."), mantendo a ordem cíclica | OK |
| F-49 | Nenhuma contagem de erros na tela | Nenhum número de tentativas, vidas ou "tentativas restantes" visível | OK |
| F-50 | Sem limite: errar 20 vezes seguidas | Painel continua funcionando; nada muda (sem bloqueio, sem atraso crescente, sem mensagem nova); mensagens seguem o ciclo; erro 20 cai na 2a mensagem (20 mod 3 = 2) | OK |
| F-51 | Após os 20 erros, digitar o código certo | Porta abre normalmente (F-20) | OK |
| F-52 | Errar, fechar o painel com Esc, reabrir e errar de novo | Sem penalidade; o ciclo de mensagens pode continuar ou reiniciar (registrar); nunca bloqueia | OK |
| F-53 | Repetir confirmação muito rápido (apertar Enter 10 vezes seguidas com código certo) | Porta abre uma vez só; o diálogo "Clique! A porta abriu." aparece uma vez e não reabre o painel; sem erro no console; a transição para a sala acontece uma vez | OK |
| F-54 | Durante os erros, conferir DevTools > Local Storage | Nenhuma chave criada ou alterada pelo jogo (seção H); erros não gravam nada | OK |

### F6. Teclado do painel

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| F-60 | Digitar 0 a 9 na fileira superior | Cada dígito preenche o próximo campo, em ordem | OK |
| F-61 | Digitar 0 a 9 no teclado numérico (numpad), se existir | Mesmo resultado (se não suportado, registrar como observação, não como falha) | OK |
| F-62 | Digitar 2 dígitos e pressionar Backspace | Apaga o último dígito | OK |
| F-63 | Digitar 2 dígitos e pressionar X | Apaga o último dígito (GDD 14.1) | OK |
| F-64 | Backspace com campos vazios | Nada acontece, sem erro | OK |
| F-65 | Apagar todos os dígitos, digitar o código certo (sem mover o foco, que continua em OK), pressionar Enter | Confirma e acerta | OK |
| F-66 | Digitar o código sem mover o foco (continua em OK) e pressionar Z | Confirma, igual a OK. Com o foco em uma tecla de dígito, Z só aperta essa tecla (F-82) | OK |
| F-67 | Mover o foco com as 4 setas pelas teclas na tela e confirmar uma tecla com Z | Dígito da tecla em foco entra no campo; foco sempre visível; sem tecla inalcançável | OK |
| F-68 | Foco em "Apagar" e Z | Apaga o último dígito | OK |
| F-69 | Foco em "OK" e Z | Confirma | OK |

### F7. Porta aberta

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| F-70 | Depois de abrir, voltar da sala ao hall (se a passagem existir) e examinar a porta | Não pede código de novo; só atravessa | OK |
| F-71 | Com a porta já aberta, recarregar a página e escolher "Começar" de novo | Porta trancada outra vez e pede código (o jogo não guarda progresso; ver B-05) | OK |

### F8. Regras de tecla do painel (GDD 14.1 e 14.8: X apaga, só Esc fecha)

Regras fixas: X e Backspace apagam o último dígito. X NUNCA fecha o painel. Só Esc fecha. Ao abrir, o foco começa em OK. Digitar 0 a 9 não move o foco. Z ou Enter apertam a tecla em foco; em OK, confirmam.

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| F-80 | Painel aberto e vazio: pressionar Esc | Fecha o painel; personagem volta a controlar; sem erro | OK |
| F-81 | Com 2 dígitos digitados, pressionar Esc | Fecha o painel, sem mensagem e sem penalidade; ao reabrir, ver F-15 e F-83 | OK |
| F-82 | Mover o foco para a tecla "5" (setas) e pressionar Z | "5" entra no próximo campo; o painel NÃO fecha; o foco continua em "5" | OK |
| F-83 | Abrir o painel (3 vezes, com Esc entre elas) | Em todas as aberturas o foco começa em "OK", visível, sem dígitos do uso anterior | N/T (limite de tempo) |
| F-84 | Foco em OK (sem mover) e digitar 0 a 9 (ex.: 1, 2, 3) | Os dígitos entram nos campos e o foco continua em OK após cada dígito | OK |
| F-85 | Mover o foco para "7" e digitar 0 a 9 pelo teclado | Os dígitos entram nos campos e o foco continua em "7" após cada dígito | OK |
| F-86 | Foco em OK, campos vazios: pressionar X 10 vezes | Nada acontece; o painel continua aberto; sem erro | OK |
| F-87 | Digitar 2 dígitos e pressionar X 3 vezes | 1º X apaga o 2º dígito, 2º X apaga o 1º, 3º X não faz nada; o painel continua aberto | OK |
| F-88 | Com campos vazios e código incompleto, pressionar cada uma das teclas: letras, espaço, setas, W/A/S/D, Backspace, Tab (registrar se o navegador tirar o foco do jogo), Enter e Z com o foco em tecla de dígito | Nenhuma fecha o painel. Letras, espaço e símbolos são ignorados (F-44). Enter e Z com foco em tecla de dígito apenas apertam a tecla | OK |
| F-89 | Com foco em OK, digitar 111 e pressionar Z; repetir com Enter | Mostra a mensagem de erro (F-45); o painel NÃO fecha; campos limpos; registrar onde o foco fica depois do erro | OK |
| F-90 | Ver a mensagem de erro e a barra juntas | A mensagem aparece acima da barra "X: apagar   Esc: fechar", e a barra continua inteira (K2-09, K2-18) | N/T (limite de tempo) |
| F-91 | Abrir e fechar o painel com Esc 10 vezes seguidas, sem digitar | Nada quebra; cada abertura começa com foco em OK; sem erro no console | N/T (limite de tempo) |

---

## G. Penumbra, interruptor e conquista 1 (item 008; GDD 4.3, 14.1, 14.3, 14.5)

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| G-01 | Entrar na sala após abrir a porta | Diálogo automático: "Está tudo escuro! Procure o interruptor." | OK |
| G-02 | Fechar o diálogo, sair e voltar à sala sem acender | O diálogo NÃO reaparece (uma vez só) | OK |
| G-03 | Observar a sala escura | Camada azul-noite sobre a sala, opacidade alta mas nunca preto total (móveis ainda se adivinham); nada assustador | OK |
| G-04 | Observar ao redor do jogador | Círculo de luz de cerca de 3 tiles de raio; borda em degraus de pixel (sem desfoque) | OK |
| G-05 | Andar pela sala em 4 direções | O círculo acompanha o jogador sem atraso perceptível | OK |
| G-06 | Ir à cozinha (ainda escura) | Mesma penumbra e círculo; troca de câmera funciona (E-14) | OK |
| G-07 | Voltar ao hall (se possível) | O hall nunca fica escuro | OK |
| G-08 | Medir a distância entre o ponto de entrada na sala e o interruptor | 8 tiles ou mais; interruptor na parede do fundo, oposta à entrada | OK |
| G-09 | Procurar o interruptor na penumbra | Tem brilho fraco e constante, achável sem tela cheia de luz | N/T (brilho do interruptor não medido por pixel) |
| G-10 | Examinar o interruptor (A) | Aparece "Clique!" | OK |
| G-11 | Observar logo após o clique | As luzes acendem com fade curto (cerca de 0,5 s; aceitável de 0,3 a 0,8 s); a camada escura some em sala e cozinha | OK (rodada 2: brilho 111 -> 189 em 200 ms após o Z; fade ~0,5 s) |
| G-12 | Após o fade | Aparece a tela de conquista 1 | OK |
| G-13 | Ler a tela de conquista 1 | Texto exato "Parabéns, você conseguiu acender as luzes."; ilustração (provisória); botão "Continuar" | OK |
| G-14 | Esperar 30 s na tela de conquista | Não avança sozinha | OK |
| G-15 | Pressionar X na conquista 1 (em outra rodada, Esc) | Continua, igual a Z: o jogador nasce como em G-16. A conquista não tem voltar (GDD 14.1 e 14.8), então X não é ignorado. Não repete a conquista nem abre outra tela (ver G-22). Barra "Z ou X: continuar" (K2-10) | OK |
| G-16 | Pressionar Z em "Continuar" | Jogador nasce na sala 1 tile à esquerda da árvore, de frente para ela; luzes acesas | OK (BUG-001 corrigido na visão parada) |
| G-17 | Posição da árvore | Centro-direita da sala; desmontada | OK |
| G-18 | Examinar a árvore (A) | "A árvore ainda está desmontada. Vamos procurar as partes!" | OK |
| G-19 | Após acender, examinar o interruptor de novo | Não repete a conquista nem abre nova tela; comportamento definido e sem erro (registrar) | OK |
| G-20 | Após as luzes, ir à cozinha | Cozinha clara, sem camada escura | OK |
| G-21 | Executar G-01 a G-18 com os 4 sobrinhos | Idêntico para todos; sprite correto de cada um | OK |
| G-22 | Pressionar Z várias vezes durante o fade | Não duplica a conquista nem abre duas telas de conquista | OK |

### G2. Fim do Marco 1: exploração livre (item 008; GDD 14.7)

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| G-23 | Logo após "Continuar" na conquista 1 | Controle volta na hora, no ponto de nascimento (G-16); o diálogo "Está tudo escuro!" não reaparece; nenhuma tela nova | OK |
| G-24 | Explorar hall, sala e cozinha livremente por 5 minutos, em todas as direções, atravessando a passagem várias vezes | Nada trava; a câmera troca sem rolagem; nenhum erro no console | OK (parcial: 60 s de exploração livre em vez de 5 min; sem erro de console) |
| G-25 | Procurar qualquer objetivo novo: marcador, seta, texto de missão, item ou tarefa nova | Nenhum aparece: "não há objetivos novos no Marco 1" (GDD 14.7) | OK (exploração: nenhum texto de objetivo, marcador ou missão) |
| G-26 | Trocar de cômodo várias vezes durante a exploração | Sala e cozinha permanecem acesas; sem camada escura; hall sempre iluminado | OK |
| G-27 | Examinar a árvore 3 vezes seguidas | Sempre "A árvore ainda está desmontada. Vamos procurar as partes!", igual; a árvore não muda de estado | OK |
| G-28 | Interagir em sequência com bilhete, porta (já aberta), interruptor e árvore, em ordem livre | Todos respondem sem erro; nenhum dispara conquista nova nem tela nova | N/T (bilhete não confirmado pelo caminho de teste a partir da sala; reteste pendente, não é falha confirmada) |
| G-29 | Procurar tela de fim, créditos, placar ou "fim de jogo" | Nenhum aparece (créditos são do Marco 4) | OK (nenhuma tela de fim, créditos ou placar) |
| G-30 | Deixar o jogo parado na sala por 2 minutos, sem apertar nada | Nada acontece: sem game over, sem timer visível, sem mudança de estado | N/T (indeterminado: 110 px mudaram em 30 s parado, sem texto novo; provável pisca do bilhete (GDD 14.4); confirmar com captura) |
| G-31 | Repetir G-23 a G-29 com cada um dos 4 sobrinhos | Funciona igual nos 4; sprite correto em todos | N/T (LoLô: 10 s de exploração, OK; BiBi, DanDan e TuTu não concluídos no prazo) |
| G-32 | Fechar a aba e reabrir o jogo após a exploração | Volta ao título sem progresso (GDD 14.7; ver B-06) | N/T (limite de tempo; B-06 cobre a nova aba) |
| G-33 | Console durante toda a exploração (G-23 a G-31) | Sem erros nem warnings relevantes (PRE-2) | OK (console sem erros em todas as rodadas de exploração: 0) |

---

## H. Sem salvamento (decisão do Diretor, 2026-11-07; GDD 6, 9, 14.6; item 009 cancelado)

O jogo não grava nada no navegador. Estes casos confirmam a ausência de gravação e de código de save.

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| H-01 | Com DevTools > Application aberto, fazer um fluxo completo: título, seleção, introdução, porta, luzes, conquista 1 e exploração | Nenhuma chave criada pelo jogo em Local Storage, Session Storage ou Cookies | OK |
| H-02 | Repetir H-01 com erros na porta (F-45 a F-47) e com trocas de cômodo | Mesmo resultado: nada gravado | OK |
| H-03 | Recarregar no meio de um diálogo aberto e no painel da porta com dígitos digitados | Volta ao título sem estado híbrido (sem porta aberta, sem diálogo, sem sobrinho escolhido); "Continuar" não aparece | OK (rodada 2: recarga com diálogo/casa aberta volta ao título) |
| H-04 | Abrir duas abas na mesma origem. Na aba A, jogar até a porta aberta. Olhar a aba B | A aba B começa no título; o progresso da aba A não aparece nela; nenhum erro em nenhuma das abas | OK (rodada 2: segunda aba começa no título, sem progresso da primeira) |
| H-05 | Escolher TuTu, recarregar a página e escolher "Começar" | A seleção começa com foco em LoLô e nenhum sobrinho pré-confirmado (sem memória do último escolhido) | OK |
| H-06 | Revisão de código: buscar em `src/` e `content/` por `localStorage`, `sessionStorage`, `indexedDB` e `document.cookie` | Nenhuma ocorrência (GDD 9 e 14.6; complementa A-05) | OK |
| H-07 | Revisão de código, testes e docs: buscar em `src/`, `tests/` e `docs/` por `saveVersion`, `checkpoint`, `migrar`, `migração` e `vila-do-natal:save`; executar `npm test` | Nenhuma ocorrência de save ou migração no código e no ADR-002 (backlog 012); testes passam | OK |

---

## I. Conteúdo e manifesto (itens 012, 013; ADR-002)

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| I-01 | Listar `content/` | Existem `manifest.json`, `maps/`, `missions/`, `texts/pt-BR.json` | OK |
| I-02 | Abrir `manifest.json` | Contém `schemaVersion`, `contentVersion`, `locale`, `startMap`, `maps`, `missions`, `texts` no formato do ADR-002 | OK |
| I-03 | Os 3 cômodos (hall, sala, cozinha) vêm de `content/` | Mapa(s) dos 3 cômodos referenciados pelo manifesto; nenhum cômodo definido em código | OK |
| I-04 | Buscar nos arquivos de `src/` os textos exatos das telas (ex.: "Quem vai jogar?", "Faltam números.", "Clique!", "Parabéns, você conseguiu acender as luzes.") | Nenhum texto de tela fixo no código; todos vêm de `content/texts/pt-BR.json` | OK |
| I-05 | Buscar os códigos 017, 020, 023, 024 | Vêm de `content/` ou de tabela única do domínio (`sobrinhos.ts`); não duplicados em cena | OK |
| I-06 | Alterar um texto em `content/texts/pt-BR.json` (ex.: página 3 da introdução) e rodar o jogo | A mudança aparece na tela sem alterar `src/` | N/T (alteração de content/ e rebuild não feitos) |
| I-07 | Interpolação | `{nome}` é substituído nos 4 casos (D-01 a D-04, F-02 a F-05); nenhuma chave `{nome}` literal ou `undefined` aparece em qualquer tela | OK |
| I-08 | Teste automatizado "novo mapa via manifesto": executar `npm test` e localizar o teste | Existe teste que adiciona um mapa de teste a um manifesto de fixture e verifica que carrega sem alterar o motor; passa | OK |
| I-09 | Prova manual: copiar o mapa de teste para `content/maps/`, adicionar uma linha em `manifest.json` (e missão, se exigida), sem tocar em `src/`; rodar o jogo/testes | O mapa é reconhecido/carregado; `git diff --stat src/` vazio | N/T (alteração de content/ e rebuild não feitos) |
| I-10 | Manifesto inválido: id duplicado | `validarManifesto()` rejeita com mensagem clara (teste ou execução) | OK |
| I-11 | Manifesto inválido: `missions[].map` inexistente | Rejeitado com mensagem clara | OK |
| I-12 | Manifesto com `schemaVersion` maior que o suportado | Motor recusa com mensagem clara; não quebra silenciosamente | OK |
| I-13 | Teste Vitest que valida o `content/` real | Existe e passa | OK |
| I-14 | Build de playtest inclui o conteúdo | Mudança em `content/` + `npm run build:playtest` reflete no HTML único (mapas e textos embutidos) | N/T (alteração de content/ e rebuild não feitos) |
| I-15 | Arquitetura (revisão rápida) | Cenas sem `if` de regra do jogo (código da porta validado no domínio/aplicação, não na cena) | OK |

---

## J. Controles de teclado (GDD seção 5; itens 006, 007)

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| J-01 | Setas movem o personagem no hall, na sala e na cozinha | Funciona nos 3 cômodos | OK |
| J-02 | WASD movem o personagem nos 3 cômodos | Funciona; maiúsculas/Caps Lock ligado não quebram | OK (D/A maiúsculas movem os cartões) |
| J-03 | Z interage (bilhete, porta, interruptor, árvore, avançar diálogo, "Continuar" da conquista) | Funciona em todos | OK |
| J-04 | Enter interage nos mesmos pontos de J-03 | Funciona em todos | OK |
| J-05 | X fecha diálogo; volta no título, na seleção, em "Como jogar" e na introdução (página 1 volta à seleção), conforme K2. No painel, X apaga e NÃO fecha (F-13, F-86) | Funciona como descrito | OK |
| J-06 | Esc fecha diálogo e painel | Funciona | OK |
| J-07 | Layout de teclado: testar com layout ABNT2 | Setas, WASD, Z, X, Enter e Esc funcionam (usar `event.code` ou equivalente) | N/T (limite de tempo / sem ambiente) |
| J-08 | Foco da página: clicar fora do canvas e voltar | Jogo continua recebendo teclado (ou volta ao clicar no canvas); setas não rolam a página | OK (clique fora do canvas; seta continua funcionando; página não rola) |
| J-09 | Tecla H, P, M e outras do futuro | Nada acontece no Marco 1 (dica e pausa fora do escopo), sem erro | OK (H, P, M não fazem nada no Marco 1) |
| J-10 | Mantendo tecla pressionada ao trocar de cena (ex.: seta ao sair da seleção) | Sem movimento fantasma ou tecla "presa" na cena seguinte | N/T (limite de tempo / sem ambiente) |
| J-11 | Perder o foco da janela com tecla pressionada (Alt+Tab) e voltar | Personagem não continua andando sozinho | N/T (limite de tempo / sem ambiente) |
| J-12 | Safari: Esc e setas | Funcionam; se tela cheia não aplicável, registrar | N/T (limite de tempo / sem ambiente) |

---

## K. Geral, regressão e conteúdo (GDD 1.1, 6, 10)

| ID | Passo a passo | Resultado esperado | Status |
|----|---------------|--------------------|--------|
| K-01 | Jogar do título à conquista 1 sem pressa, sem nenhuma pressão de tempo | Nada conta tempo; não há game over | N/T (indeterminado junto com G-30) |
| K-02 | Textos | Frases curtas, sem erro de português, acentos corretos em todas as telas | OK |
| K-03 | Tom | Nada assustador ou sombrio na penumbra | OK |
| K-04 | Console durante todo o fluxo K-01 | Sem erros nem warnings relevantes (404 de assets, rejeições de Promise) | OK |
| K-05 | Fluxo completo com cada um dos 4 sobrinhos sem recarregar | Funciona de ponta a ponta nos 4 | OK |
| K-06 | Fluxo completo com recarga em cada etapa | Cada recarga volta ao título sem progresso (B-05) e o fluxo recomeça do zero, sem erro | OK |
| K-07 | Performance básica | Sem engasgos perceptíveis; 60 fps estáveis em notebook comum; carregamento rápido | OK (60 fps no hall, headless) |
| K-08 | Celular em paisagem (informativo, toque fora do Marco 1) | Jogo abre e exibe o título; registrar o que acontece sem controles de toque; sem expectativa de jogabilidade | N/T (fps e celular não medidos neste rodada) |
| K-09 | Privacidade | Nenhuma requisição de rede para terceiros (aba Network em build normal); nenhum cookie; nenhum dado gravado no navegador (seção H) | OK |

---

## K2. Barra de controles (GDD 14.8; decisão do Diretor, 2026-11-07)

Toda tela mostra, o tempo todo, uma linha fixa de teclas no rodapé. Os textos abaixo são exatos (vêm de `content/`), com 2 espaços entre as ações (decisão do Diretor, 2026-11-07). Comparar caractere a caractere. A barra não muda com o estado do jogo. Se a tela não tem "voltar", a barra não mostra "voltar".

| ID | Tela | Passo a passo | Resultado esperado | Status |
|----|------|---------------|--------------------|--------|
| K2-01 | Título | Abrir o jogo; mover o foco entre "Começar" e "Como jogar" | Barra, 1 linha: "Setas: escolher  Z: confirmar". Sem "voltar" e sem "X" (o título é o início). Igual nos dois focos | OK |
| K2-02 | Título | Pressionar X e Esc várias vezes | Barra e tela não mudam; nada acontece (B-08) | OK |
| K2-03 | Como jogar | Entrar em "Como jogar"; mover o foco; pressionar Z e X | Barra, 1 linha: "Z ou X: voltar". Igual com foco em "Voltar" | OK |
| K2-04 | Seleção | Ir a "Começar" e observar a tela | Barra, 2 linhas, rodapé: "Setas: escolher  Z: confirmar" / "X: voltar ao título" | OK |
| K2-05 | Introdução, páginas 1 a 4 | Avançar com Z em cada página | Barra "Z: avançar  X: voltar", na última linha da caixa de texto, idêntica nas 4 páginas | OK |
| K2-06 | Diálogo do bilhete | Examinar o bilhete (página 1 e última página) | Barra "Z: avançar  X: fechar" em todas as páginas, inclusive na última, que fecha | N/T (limite de tempo: não executado) |
| K2-07 | Diálogos "Está tudo escuro! Procure o interruptor.", "Clique!" (interruptor) e "A árvore ainda está desmontada..." | Disparar cada um | Barra "Z: avançar  X: fechar" | N/T (limite de tempo: não executado) |
| K2-08 | Diálogo "Clique! A porta abriu." | Acertar o código (F-20) | Barra "Z: avançar  X: fechar" | OK |
| K2-09 | Painel da porta | Abrir o painel (F-10) | Barra, 2 linhas, abaixo do teclado: "Setas: escolher  Z: apertar" / "X: apagar  Esc: fechar" | OK |
| K2-10 | Conquista 1 | Chegar à conquista (G-12) | Barra, 1 linha: "Z ou X: continuar". Sem "voltar". Botão "Continuar" acima dela | OK |
| K2-11 | Exploração (hall, sala, cozinha) | Após "Continuar" (G-16), ir aos 3 cômodos | Barra, 1 linha: "Setas: andar  Z: examinar". Sem X | OK |
| K2-12 | Exploração | Conferir os 3 cômodos (grade de 16 px) | Faixa y 144 a 160 livre de objeto, porta e passagem (Arte e Level Design; GDD 14.8) | OK |
| K2-13 | Todas as telas acima | Capturar a tela em 240x160 escalada (960x640) | Texto na base do rodapé, alinhado à esquerda, com margem lateral de 8 px e 4 px da borda inferior (32 px e 16 px na tela a 4x) | OK |
| K2-14 | Todas as telas acima | Contar as linhas e os caracteres de cada barra | Até 2 linhas e até 32 caracteres por linha; altura de letra de pelo menos 8 px na base (32 px a 4x); fonte pixel | OK |
| K2-15 | Todas as telas acima | Medir o contraste texto/fundo sobre a captura (ferramenta de contraste) | Mínimo 4,5:1 | OK (contraste 7,46:1 pelas cores do código: #9aa3c7 sobre #0b1030) |
| K2-16 | Seleção, painel, conquista, introdução | Deixar a tela aberta por 30 s, sem apertar nada | Barra fixa: não pisca, não anima, não some | OK |
| K2-17 | Introdução (página 1 e 4); painel (0 e 3 dígitos); diálogo (1ª e última página) | Comparar as barras nos dois estados | Texto idêntico em cada par; a barra não muda com o estado | OK |
| K2-18 | Painel, com erro | Confirmar código errado (F-45) | "Quase! Leia o bilhete de novo." aparece acima da barra; a barra não é substituída nem cortada | OK |
| K2-19 | Janelas (PRE-3), e janela pequena que o navegador permitir | Redimensionar a janela com a barra visível | Barra e texto nunca cortados. Se faltar espaço, reduz-se o espaçamento do conteúdo (registrar o que foi reduzido) | OK (escala inteira em 960x640, 1280x720, 1920x1080 e 500x320) |
| K2-20 | Revisão de código | Buscar em `src/` as strings "Setas:", "Z: avançar", "Z ou X", "X: voltar", "X: fechar", "Z: examinar" | Nenhuma ocorrência: todas as barras vêm de `content/` (GDD 14.8; item 013) | OK |
| K2-21 | Build de playtest (Chrome e Firefox, `file://`) | Abrir título, seleção, introdução, painel e conquista | As mesmas barras, com a mesma posição e os mesmos textos da build normal | OK (parcial: título, Como jogar e barras no playtest; painel e conquista no playtest não rodados) |

---

## L. Fluxo de bugs e vereditos

### L1. Regras

- Todo bug vai em `qa/bugs.md` com ID sequencial `BUG-001`, `BUG-002`...
- Cada falha neste checklist referencia o bug na coluna Status (`FALHOU (BUG-012)`).
- Item de backlog com qualquer caso `FALHOU` de severidade Crítica ou Alta fica `reprovado`; volta ao backlog com link para o bug. Severidade Média ou Baixa pode ser aprovada com ressalva, a critério do Orquestrador/Diretor.
- QA não corrige código; só reporta.

### L2. Formato de registro em `qa/bugs.md`

```
## BUG-NNN: título curto
- Item de backlog: 0NN
- Caso do checklist: X-NN
- Severidade: Crítica | Alta | Média | Baixa
- Estado: aberto | corrigido, aguardando reteste | fechado
- Ambiente: build (normal/playtest), versão do jogo, commit, navegador+versão, SO, resolução
- Passos para reproduzir:
  1. ...
  2. ...
- Esperado: ...
- Obtido: ...
- Frequência: sempre | às vezes (n de m tentativas)
- Evidência: captura de tela / trecho do console / conteúdo do Local Storage
- Observações:
```

Severidade:
- **Crítica:** jogo trava, não dá para concluir o fluxo, ou gravação indevida no navegador (contra GDD 14.6).
- **Alta:** regra errada (código, ordem de fases, sobrinho errado), texto exato errado em tela principal ou na tela "Como jogar", "Continuar" aparecendo no título, recarga que retoma progresso.
- **Média:** comportamento inconsistente que não impede o avanço, problema em um navegador específico.
- **Baixa:** estético, ajuste fino, sugestão.

### L3. Casos do próprio fluxo (verificação do processo)

| ID | Verificação | Resultado esperado | Status |
|----|-------------|--------------------|--------|
| L-01 | Todo caso `FALHOU` tem um BUG-NNN existente em `qa/bugs.md` | Verdadeiro | OK |
| L-02 | Cada bug tem todos os campos do formato L2 | Verdadeiro | OK |
| L-03 | Cada bug é reproduzível por outra pessoa seguindo só os passos | Confirmado em segunda tentativa | N/T (sem reteste nem segunda pessoa nesta rodada; sem item reprovado) |
| L-04 | Item reprovado voltou ao backlog com link para o bug | Verdadeiro | N/T (sem reteste nem segunda pessoa nesta rodada; sem item reprovado) |
| L-05 | Todo caso deste checklist tem resultado registrado antes do veredito | Nenhuma linha de Status vazia | OK |
| L-06 | Reteste de bug corrigido | Caso original refeito, mais um caso vizinho de regressão; resultado registrado | N/T (sem reteste nem segunda pessoa nesta rodada; sem item reprovado) |

### L4. Veredito por item de backlog (preencher no fim)

| Item | Descrição | Casos que o cobrem | Veredito (aprovado / reprovado) | Bugs |
|------|-----------|--------------------|---------------------------------|------|
| 002 | Setup (Phaser, TS, Vite, Vitest) | A-01 a A-05, E-17 | aprovado (A-01 não rodado em clone limpo) | nenhum |
| 003 | Tela de título e tela Como jogar | B-01 a B-20, K2-01 a K2-03, A-04, A-12 | aprovado | nenhum |
| 004 | Seleção de personagem | C-01 a C-13, K2-04 | aprovado (C-11 cronometragem não feita) | nenhum |
| 005 | Introdução | D-01 a D-18, K2-05 | aprovado com ressalva (D-10: BUG-001, Média) | BUG-001 |
| 006 | Movimento, A/B, diálogo, câmera | E-01 a E-19, J-01 a J-12, K2-06, K2-07, K2-11, K2-12 | aprovado com pendências (E-02, E-07, E-09, E-13, E-16 e J-02/J-07 a J-12 N/T) | nenhum |
| 007 | Enigma da porta e painel | F-01 a F-91, K2-08, K2-09 | aprovado (F-83, F-90, F-91 N/T) | nenhum |
| 008 | Luzes, conquista 1 e fim do Marco 1 | G-01 a G-33, K2-10 | aprovado com ressalvas (rodada 2): luzes, fade, conquista e árvore aprovados; exploração parcial (G-24 com 60 s, G-28 e G-30 pendentes, G-31 só LoLô) | nenhum |

Transversais (K2-13 a K2-21: posição, tamanho, contraste, barra fixa, janelas, origem em `content/`, playtest) valem para os itens 003 a 008 e são registrados em cada item afetado.
| 009 | Checkpoint em localStorage | Cancelado (sem save). Casos de ausência de gravação: H-01 a H-07 | n/a (cancelado) | |
| 010 | Este checklist | Revisão pelo Orquestrador | pendente (revisão do Orquestrador) | nenhum |
| 011 | Build de playtest | A-06 a A-12, I-14, B-20 | aprovado (I-14 N/T; A-09 N/T) | nenhum |
| 012 | ADR-002 | H-07 (sem save no ADR), I-02, I-10 a I-12 (conformidade com o ADR) | aprovado | nenhum |
| 013 | Conteúdo e manifesto | I-01 a I-15 | aprovado (I-06, I-09, I-14 N/T) | nenhum |

### L5. Registro de execução

| Rodada | Data | Versão/commit | Navegador e SO | Casos executados | Casos não testados e motivo |
|--------|------|---------------|----------------|------------------|-----------------------------|
| 1 | 2026-11-07 | v0.1.0 (commit 4435f3a + trabalho do Marco 1) | Google Chrome headless (playwright-core), macOS Darwin 25.6; Firefox e Safari não disponíveis | Automáticos em qa/scripts (titulo-selecao, introducao, porta, porta-extra, casa, build-offline); extras parcial | Exploração longa (G-24..G-33), H-03/H-04, E-02/E-07/E-09/E-16, K2-15, K2-19, K-07, mouse, J-07..J-12, A-01, A-09, I-06/I-09/I-14 |

---

## Marco 1.1 (itens 016 a 019; GDD 14.9.1 a 14.9.4)

Rodada 1.1 de QA, 2026-11-07. Build: `dist-playtest/index.html` (v0.1.0, `npm run build:playtest`), `npm test` 62/62, `npm run smoke:playtest` sem erros. Navegador: Google Chrome headless (playwright-core), macOS Darwin 25.6; 960x640. Firefox e Safari não testados. Teclado apenas; mouse e celular em paisagem não testados (limite de 15 min). Scripts: `qa/scripts/marco11-016.mjs`. Capturas: `qa/evidencias/marco11/`, `dist-playtest/capturas/`.

Legenda do Status: **OK** (passou), **FALHA** (reprovado; bug em `qa/bugs.md`), **N/T** (não testado, motivo na linha), **OK (código)** (verificado por leitura de código ou teste unitário, sem execução no navegador).

### M1. Item 016: diálogo de orientação no hall (GDD 14.9.1)

| ID | Caso | Esperado | Status |
|----|------|----------|--------|
| 016-01 | Página 1 com LoLô: texto exato | "Vamos montar a árvore de Natal, LoLô!" | OK (script, `p1_texto_exato`; captura `dist-playtest/capturas/hall-orientacao.png`) |
| 016-02 | Página 1 com BiBi: texto exato com o nome | "Vamos montar a árvore de Natal, BiBi!" | OK (script, `bibi_p1_texto_exato`) |
| 016-03 | Página 1 com DanDan e TuTu: texto exato com o nome | "Vamos montar a árvore de Natal, DanDan!" / "...TuTu!" | OK (rodada 2, `qa/scripts/marco11-r2.mjs`). Página 2 desses dois: N/T (o script releu o texto sem avançar; não é falha do jogo) |
| 016-04 | Página 2: texto exato | "Abra a porta. Há um bilhete perto dela, com a dica." | OK (script, `p2_texto_exato`; captura `qa/evidencias/marco11/016-orientacao-p2.png`) |
| 016-05 | Barra "Z: avançar  X: fechar" nas 2 páginas | Barra presente | OK (captura visual nas duas páginas). Nota: a leitura de texto do DOM não trouxe a barra da página 2; a captura confirma. |
| 016-06 | Cada página em até 2 linhas da caixa | 2 linhas no máximo | OK (captura, páginas 1 e 2) |
| 016-07 | A avança; na página 2, A fecha e dá o controle | Diálogo fecha, controle no hall | OK (script, `apos_z_fecha`) |
| 016-08 | X na página 1 fecha o diálogo inteiro e dá o controle | Fecha tudo | OK (script, `x_fecha_p1`, com BiBi) |
| 016-09 | Aparece uma vez por partida (voltar ao hall não repete) | Não reaparece | OK (código: `CasaScene.ts` linha 319, `primeiraVez('orientacao')`); N/T no navegador (rodada 2 não conseguiu sair e voltar ao hall dentro do prazo) |
| 016-10 | Nova partida (título, "Começar") mostra de novo | Reaparece | N/T (rodada 2: a partida nova exige sair do jogo; não testado) |
| 016-11 | Sem tempo automático | Espera sem avançar | N/T (não medido; só se espera de 400 ms sem fechar, em `marco11-016.mjs`, que não prova ausência de tempo) |

**Veredito 016: aprovado com pendências** (rodada 2: texto exato com os 4 nomes; pendentes no navegador: 016-09 uma vez por partida, 016-10 nova partida, 016-11 tempo automático).

### M2. Item 017: interação tolerante (GDD 14.9.2)

| ID | Caso | Esperado | Status |
|----|------|----------|--------|
| 017-01 | Q1 a Q7 (regra pura: frente, desalinhamento, tile vazio, encostado de lado, diagonal, desempate, spawn ao lado da árvore) | Conforme 14.9.2 | OK (teste unitário `tests/application/movimento.test.ts`, 62/62) |
| 017-02 | Varredura de geometria (script ad hoc em scratchpad, sobre `alvoDaInteracao`) com objeto 16×16: frente com desalinhamento de -15 a +15 px nos 4 sentidos; tile vazio (gap 1) nunca aciona | Simétrico nos 4 sentidos | OK (código) |
| 017-03 | Encostado a 0 e 4 px, nos 4 lados, olhando para qualquer direção; a 5 px não aciona (fora da frente) | Conforme 14.9.2 | OK (código) |
| 017-04 | Q8: diálogo ou painel aberto; A não aciona | Nada acontece | OK (código: `CasaScene.ts` `update`, `interagir` só em `estado === 'livre'`); N/T no navegador |
| 017-05 | Q9: porta já aberta; A não abre o painel | Nada acontece | N/T (limite de tempo) |
| 017-06 | Q1 a Q9 com os 4 sobrinhos, no teclado, no navegador | Conforme 14.9.2 | N/T (limite de tempo; só a regra pura foi verificada) |
| 017-07 | Assimetria vertical relatada pelo Dev | Segue o GDD 14.9.2 (observação, não falha) | RESSALVA (rodada 2, resposta do Dev): objeto de 1 tile; o quadrado de interação avança 4 px na linha de baixo e 0 na de cima, porque o centro dos pés fica em linha·16+12 (`tests/application/movimento.test.ts:59`; `src/application/mundo/movimento.ts:84–88`). Não é falha pelo GDD. Registrada como observação. Análise anterior (rodada 1): Relato do Dev não estava nos insumos desta rodada. Na regra pura, cima e baixo dão o mesmo intervalo para objeto 16×16 (-15 a +15). Para objetos maiores que um tile (porta 16×32, árvore 32×48), o intervalo parece deslocado em uma direção só porque se mede a partir do canto superior esquerdo do objeto. A condição é simétrica em relação ao centro do objeto (|Ox−Cx| < 8 + w/2). Ver PERGUNTA ao Orquestrador. |

**Veredito 017: aprovado com ressalvas** (regra pura e Q1 a Q8 por código e testes; Q1 a Q9 no navegador N/T; assimetria relatada pelo Dev sem reprodução).

### M3. Item 018: árvore chama o jogador (GDD 14.9.3)

| ID | Caso | Esperado | Status |
|----|------|----------|--------|
| 018-01 | Curva do pisca: 0 ms, 400, 800, 1200, 1600, 2000 | 0, 0,175, 0,35, 0,175, 0, 0 (ciclo 2 s) | OK (código: `src/presentation/ui/pisca.ts` avaliado por script: 0,000 / 0,175 / 0,350 / 0,175 / 0,000 / 0,000) |
| 018-02 | Halo dourado `#f4d35e`, margem 4 px em volta da árvore | Halo visível atrás da árvore | OK (código `CasaScene.ts` linha 330; captura `dist-playtest/capturas/arvore-quadro-1.png` mostra o halo claro atrás da árvore) |
| 018-03 | Diálogo único ao nascer ao lado da árvore, depois da conquista 1, antes do controle | "A árvore ainda está desmontada." / "Ela precisa de 3 partes. Examine a árvore!" | OK (código: `CasaScene.ts` linhas 98 a 100, texto em `content/texts/pt-BR.json`); N/T no navegador |
| 018-04 | Exame (A na frente da árvore): texto novo, sem "Vamos procurar as partes!" | "A árvore ainda está desmontada. Ela precisa de 3 partes." | OK (código: `CasaScene.ts` linha 262, chave `arvore.desmontada`; texto em `content/texts/pt-BR.json` linha 29); N/T no navegador |
| 018-05 | Pisca para no primeiro exame e não volta na partida | Halo some | OK (código: `atualizarHalo` e `primeiraVez('arvore.examinada')`); N/T no navegador |
| 018-06 | Pisca não para por troca de cômodo nem por diálogo | Continua | N/T (limite de tempo; o halo é criado em `criarHaloDaArvore` e não foi acompanhado entre cômodos) |
| 018-07 | Nova partida reativa pisca e diálogo | Volta | N/T (limite de tempo) |

**Veredito 018: aprovado com pendências** (código e curva do pisca verificados; rodada 2: `casa.mjs` no playtest falhou em G-18 e G-27 com o texto antigo "Vamos procurar as partes!" como referência, o que é esperado após o item 018, mas não confirmei o texto exibido. Parada no exame e diálogo único continuam N/T no navegador.)

### M4. Item 019: botões com caixa e borda (GDD 14.9.4)

| ID | Caso | Esperado | Status |
|----|------|----------|--------|
| 019-01 | Título: "Começar" e "Como jogar" com caixa `#1b2452` e borda; foco com borda `#f4d35e` 2 px e ">" | Conforme tabela 14.9.4 | OK (captura `dist-playtest/capturas/titulo.png`; amostragem de pixel: fundo do botão `#1b2452`, borda/texto de foco `#f4d35e`) |
| 019-02 | Seleção: 4 cartões com caixa; foco em amarelo | Conforme 14.9.4 | OK (captura `dist-playtest/capturas/selecao.png`; cartões `#1b2452`, LoLô em foco com borda e nome `#f4d35e`) |
| 019-03 | Painel: teclas 0 a 9, "Apagar", "OK" com caixa `#1b2452` e borda `#9aa3c7`; foco em OK | Teclas visíveis, foco visível | OK (rodada 2, BUG-003 corrigido). Capturas `dist-playtest/capturas/painel-teclas-foco-ok.png` (teclas `#1b2452`, texto `#f4e9c8`, borda `#9aa3c7`, OK com borda e texto `#f4d35e`) e `painel-tecla-pressionada.png` (tecla 9 em `#f4d35e` com número escuro). Rodada 1 (`lolo-08`, antes da correção): FALHA |
| 019-04 | "Como jogar": "Voltar" com caixa e foco | Conforme 14.9.4 | OK (rodada 2: "Como jogar" por teclado abre a tela com "Voltar"; captura `qa/evidencias/marco11/019-como-jogar.png`). Pixel do estado de foco: N/T |
| 019-05 | Estado pressionado por 150 ms (fundo e borda `#f4d35e`, texto `#0b1030`) | Conforme tabela | OK (código: `PRESSIONADO_MS = 150` em `Botao.ts`); N/T visual |
| 019-06 | Texto informativo sem caixa: título do jogo, barra de controles, textos de diálogo | Nenhuma caixa | OK (captura `titulo.png`: barra `#9aa3c7` sobre `#0b1030`, sem caixa; título sem caixa) |
| 019-07 | Contraste dos 5 pares da tabela 14.9.4 (fórmula WCAG) | Texto ≥ 4,5:1; borda ≥ 3:1 | OK. Calculado: texto normal 12,20:1; foco 10,08:1; pressionado 12,67:1; borda 5,94:1; informativo 15,33:1. Cores de fundo e de texto confirmadas por amostragem de pixel nas capturas (`titulo.png`, `selecao.png`). A medição sobre o botão do painel (`lolo-08`) não vale, por causa de BUG-003. |
| 019-08 | Regressão: teclado (título, seleção, introdução, painel) | Sem quebra | OK (`npm test` 62/62; `npm run smoke:playtest` sem erros; script `marco11-016.mjs`) |
| 019-09 | Regressão: mouse | Clique funciona | OK (rodada 2: clique em "Começar" no canvas leva à seleção, "Quem vai jogar?"). Clique em "Voltar" e em "Como jogar": N/T |

**Veredito 019: aprovado com pendências** (rodada 2: BUG-003 corrigido e reconferido por captura e pixel; Como jogar por teclado e mouse em "Começar" OK). Pendentes: estado pressionado de "Voltar" e mouse em "Como jogar"/"Voltar".

### M5. Regressão geral desta rodada

| ID | Caso | Esperado | Status |
|----|------|----------|--------|
| R-01 | `npm test` | Sem falha | OK (5 arquivos, 62 testes) |
| R-02 | `npm run build:playtest` | Build sem erro | OK (`dist-playtest/index.html`, 1.365 kB) |
| R-03 | `npm run smoke:playtest` | Sem erros de console | OK (`erros: []`; 4 partidas concluídas) |
| R-04 | Scripts de Marco 1 (`qa/scripts/*.mjs`) | Não reexecutados nesta rodada | N/T (limite de tempo) |

### M6. Rodada 2 do Marco 1.1 (registro)

| ID | Caso | Esperado | Status |
|----|------|----------|--------|
| R2-01 | BUG-003 reteste: teclas e foco em OK visíveis, contraste | Conforme 14.9.4 | OK (capturas `painel-teclas-foco-ok.png` e `painel-tecla-pressionada.png`; pixel e contraste em `qa/bugs.md`) |
| R2-02 | `npm test`, `npm run build:playtest`, `npm run smoke:playtest` | Sem falha | OK (62/62; build OK; smoke `erros: []`, 4 partidas concluídas) |
| R2-03 | Q8 e Q9 de 14.9.2 no navegador | A não aciona com diálogo aberto; porta aberta não reabre painel | N/T (limite de tempo). Q8 por código |
| R2-04 | `qa/scripts/casa.mjs` no playtest (roteiro de Marco 1, anterior à 1.1) | Passa nos casos de sala escura, interruptor, conquista e árvore | INCONCLUSIVO. Falhas em G-01, G-03, G-04, G-10, G-11, G-12, G-13, G-16, E-14, G-20, G-26 e G-22, que este script não confirma. Um dos motivos é que o roteiro espera o texto antigo da árvore ("Vamos procurar as partes!"), que a 1.1 trocou; a falha de G-18 e G-27 é esperada por isso. Para as demais, o `smoke:playtest` completou uma partida inteira para os 4 sobrinhos (com luzes e conquista), o que sugere roteiro desatualizado e não regressão, mas não está confirmado. Ver `qa/evidencias/marco1/resultados-casa-playtest.json` |
| R2-05 | Texto da árvore no build | Sem "Vamos procurar as partes!"; com "Ela precisa de 3 partes." | OK (bundle `dist-playtest/index.html`: 0 ocorrências de "Vamos procurar", 1 de "Ela precisa de 3 partes. Examine a árvore!"; exibição na tela não capturada) |
| R2-06 | 016-03 DanDan e TuTu, 016-09 uma vez por partida, 016-10 nova partida | Conforme 14.9.1 | Ver M1 (016-03 OK; 016-09 e 016-10 N/T) |

## 014. Refator do perfil de arte (ADR-003; rodada QA 2026-11-07, limite de 15 min)

Checklist criado no meio da rodada: os comandos de build, teste e smoke rodaram antes deste registro. Os resultados abaixo são os da rodada.

| ID | Verificação | Como | Resultado |
|----|-------------|------|-----------|
| 014-01 | Testes unitários | `npm test` | Aprovado: 7 arquivos, 103 testes |
| 014-02 | Build normal | `npm run build` | Aprovado (exit 0, sem aviso de config) |
| 014-03 | Build de playtest | `npm run build:playtest` | Aprovado: `dist-playtest/index.html` 1.379,24 kB (gzip 430,86 kB) |
| 014-04 | Smoke com 4 sobrinhos, console | `npm run smoke:playtest` | Aprovado: lolo, bibi, dandan, tutu concluem; `erros: []` (console.error, console.warning, pageerror e requestfailed) |
| 014-05 | Capturas do smoke idênticas às de antes do refator (critério 2) | comparação pixel a pixel | Não testado: sem linha de base pré-refator no repositório (captura anterior sobrescrita). Ver BUG-014-01 |
| 014-06 | `validar:perfil -- gba-240x160` | exit 0 | Aprovado: "Perfil válido", 34 imagens, 133 cores, mapa com tile 16 conferido |
| 014-07 | Perfil quebrado em cópia fora do repo | esperado exit 1 | Ver resultado abaixo |
| 014-08 | Perfil de teste 2× (critério 4) | `tests/application/perfil2x.test.ts` (inclui percurso hall, sala e cozinha) | Aprovado no nível de teste automatizado. Não testado no navegador (sem build com perfil 2×) |
| 014-09 | Números fixos de arte em `src/presentation` e `src/application` (critério 1) | grep de 240, 160, 16, 24, 32, 8, 4 e cores hex | Aprovado com observação (ver resultado abaixo) |
| 014-10 | HTML do playtest sem PNG de outra pasta de perfil (critério 5) | busca de caminhos `assets/` no HTML | Ver resultado abaixo |
| 014-11 | Fluxo título -> Como jogar -> seleção -> introdução -> porta -> luzes -> exploração, no playtest | scripts `qa/scripts/*.mjs playtest` | Ver resultado abaixo |
| 014-12 | Nenhuma mudança visual no v1 | comparação de capturas | Não testado, depende de 014-05 |

### Resultado da rodada (014)

- 014-01 a 014-04: aprovados (ver tabela). Smoke: 4 partidas concluídas, 0 erros, 0 avisos de console, 0 pageerror, 0 requestfailed.
- 014-05 e 014-12: não aprovados por falta de prova. A comparação pixel a pixel (RGBA decodificado) das capturas atuais com a pasta de linha de base do Dev (`scratchpad/base/capturas-run1`) dá 71 de 89 diferentes, mas duas rodadas da própria linha de base também diferem entre si (65 de 89). A comparação não é conclusiva: o smoke não é reproduzível byte a byte, ou a linha de base foi gerada com outro roteiro. Falta uma linha de base do commit pré-refator, gerada com o mesmo script. Ver BUG-014-03.
- 014-06: aprovado.
- 014-07: reprovado. Tile 32 com perfil de tile 16 retorna exit 1 com mensagem clara. JSON malformado retorna exit 1 com mensagem ruim (BUG-014-02). Corpo com `quadro.w` 99 e sprite de 16 passa com exit 0 (BUG-014-01).
- 014-08: aprovado no teste automatizado (`tests/application/perfil2x.test.ts`, 103 testes passam). Não testado no navegador.
- 014-09: aprovado com observação. Nos arquivos de `src/presentation` e `src/application` não há números de arte fora de comentários, testes e do leitor de perfil. Restam `ENCOSTADO_EM_TILES = 1 / 4` (`movimento.ts:39`, regra de jogo em fração de tile) e o texto "4 px" em comentário.
- 014-10: aprovado com ressalva. O HTML tem um único caminho de perfil (`assets/gba-240x160`) e 37 ocorrências de `data:image/png` para 34 imagens do perfil. As 3 extras não foram identificadas.
- 014-11: não conclusivo. O smoke percorre o fluxo inteiro com os 4 sobrinhos (título, seleção, introdução, hall, porta, luzes, conquista, cozinha) e termina sem erro. Os scripts `qa/scripts/*.mjs playtest` (titulo-selecao, introducao, porta) registraram muitos FALHOU de texto e de painel (ex.: F-02, F-10, D-01, C-03), mas a captura `dist-playtest/capturas/bibi-05-bilhete.png` mostra o bilhete com o texto certo e a barra "Z: avançar X: fechar". Conclusão: falha de detecção dos scripts nesta build, não regressão confirmada. Falta corrigir os scripts (ferramenta do QA) e refazer a rodada. Exploração não concluída (limite de tempo).

### Rodada 3 do 014 (2026-11-07, limite de 15 min)

- 014-01 `npm test`: aprovado, 104 testes (o Dev acrescentou um).
- 014-03 `npm run build:playtest`: aprovado.
- 014-04 `npm run smoke:playtest`: aprovado, `erros: []`.
- 014-05 e 014-12 `npm run comparar:capturas`: aprovado, 89 de 89 idênticas pixel a pixel contra `qa/baseline-014/capturas`.
- 014-07 reteste de BUG-014-01 (quadro 99 agora dá exit 1 com 16 erros) e BUG-014-02 (JSON malformado com mensagem clara, exit 1): aprovado. Perfil original em cópia: exit 0.
- 014-11 scripts `qa/scripts` corrigidos em `lib.mjs`: `irAteHall` fecha o diálogo de orientação do hall (item 016) e `irAteBilhete` não aperta Z. Resultado do `porta.mjs dist` (LoLô): 45 OK e 14 FALHOU, dos quais o script de LoLô passa e BiBi, DanDan e TuTu ainda não. Não confirmado se é script ou jogo. Os FALHOU de texto de `titulo-selecao` e `introducao` não foram reexecutados nesta rodada (limite de tempo).
- Exploração curta: não testada (limite de tempo).

## Marco 1.2 (casa real, perfil HD; GDD 14.10, ADR-004; rodada 2026-11-08)

Checklist criado antes dos testes de navegador. Os comandos automáticos rodaram antes deste registro, como na rodada anterior.

| ID | Verificação | Resultado |
|----|-------------|-----------|
| M12-01 | `npm test` | Aprovado: 104 testes |
| M12-02 | `npm run build` e `npm run build:playtest` | Aprovado (exit 0) |
| M12-03 | `npm run smoke:playtest` (4 sobrinhos) | Aprovado: `erros: []`. Ressalva: o smoke teleporta para os spawns (`posicionarNoSpawn`), então não prova o caminho andando |
| M12-04 | Capturas do smoke vistas (6+) | Aprovado com observações: `lolo-02-hall`, `lolo-06-sala-escura`, `lolo-10-cozinha`, `lolo-11-pia`, `lolo-04-painel-erro`, e `m12-nascer-elevador` (rodada própria). Ver BUG-M12-01 e BUG-M12-02 |
| M12-05 | `validar:perfil -- gba-240x160` e `-- hd-480x352` | Aprovado: os dois "Perfil válido"; subáreas do casa-real conferidas (tile 32, caixas) |
| M12-06 | `npm run verificar:conteudo` | Aprovado: subáreas hall, sala, cozinha, escritorio, banheiro_escritorio, quarto, banheiro_casal, suite_casal, todas OK |
| M12-07 | Nomes de familiares em `content/` (item 034) | Aprovado: nenhum "Olivia" em `content/`; `quarto.json` tem nome genérico. Observação: `content/texts/pt-BR.json` tem "Tio Ítalo e Tia Nath" (título e intro.2). Não é rótulo do TMX; é o nome do jogo. Confirmar com o Diretor |
| M12-08 | C1: nasce no Elevador olhando para o Hall; bilhete visível sem andar | Aprovado (probe e captura `qa/evidencias/marco1/m12-nascer-elevador.png`) |
| M12-09 | Escala híbrida em janelas (canvas 480×352 em todas) | Aprovado: 960×640 → 873×640 (1,82x); 1280×720 → 960×704 (2x); 1920×1080 → 1440×1056 (3x); 844×390 → 532×390 (1,11x). Sem erro de console |
| M12-10 | C2 a C15 (passagem P7, fade, P8 trancada, painel, interruptor, árvore, cozinha, C15 sala 11 linhas) | Não testado: os scripts `qa/scripts` são do layout antigo e o smoke teleporta. Ver pendências |
| M12-11 | Painel da P8 com as 12 teclas inteiras (C3) | Reprovado: BUG-M12-01 |
| M12-12 | Última linha da Sala sem chão andável (regra 14.8, ADR-004 item 6) | Reprovado (candidato): BUG-M12-02, a confirmar |

**Não testado (limite de tempo):** caminhada real (bilhete e P8 andando, painel digitado, Sala escura e interruptor, P1 a P3, passagem P7 e fade, Cozinha com Pia, Fogão e Geladeira, volta pela P8 e P7), A bloqueado no fade, vão não andável, e o nascimento depois da passagem. Os scripts `qa/scripts` de Marco 1 não foram corrigidos para o layout novo.

**Veredito da rodada:** reprovado para fechar o Marco 1.2, por BUG-M12-01 (Alta). O resto dos automáticos passa.

### Rodada 5 do Marco 1.2 (2026-11-08, limite de 15 min)

- M12-R5-01 `npm test`: aprovado, 120 testes.
- M12-R5-02 `npm run build:playtest`: aprovado.
- M12-R5-03 `npm run smoke:playtest`: aprovado, 4 sobrinhos concluem, `erros: []`. Smoke agora anda com as setas.
- M12-R5-04 reteste BUG-M12-01 (painel da P8): aprovado, grade 3×4 inteira (1 a 9, Apagar, 0, OK com foco), captura `dist-playtest/capturas/lolo-04-painel-erro.png`. Bug corrigido em BUG-M12-01.
- M12-R5-05 capturas da caminhada (lolo-06 sala escura, lolo-07 porta fechada, lolo-11 pia, lolo-12 sala voltou): aprovadas com observações. A sala tem 11 linhas e cabe inteira (canvas 480×352, ver M12-09). A caixa da fala de P1 a P3 aparece com o texto certo ("Essa porta está fechada." / "Hoje não dá para entrar.", barra "Z: avançar  X: fechar"). Na captura lolo-07 o sprite aparece entre sprites de porta fechada: a verificar ao vivo se o jogador encosta na porta ou se é só a posição da captura.
- M12-R5-06 BUG-M12-02 (última linha da Sala): aguarda o Diretor, não é critério desta rodada. Continua aberto.
- Não testado nesta rodada (limite de tempo): teste ao vivo de colisão, vão da P8 e da P7 como não andável, A bloqueado no fade, passagem da Cozinha, e C2 a C15 com caminhada própria. Os scripts `qa/scripts` não foram corrigidos para o layout novo.

### Rodada 6 do Marco 1.2 (ao vivo, 2026-11-08, limite de 10 min)

- Script novo: `qa/scripts/casa12-vivo.mjs` (curto; um por vez). Estado: rota de porta incompleta. Não concluiu a P8.
- Achados ao vivo: a rota de hall usada pelo `irAtePainel` antigo não serve à casa real. No hall, o bilhete fica abaixo da P8 e a P8 só é alcançada de um tile à direita da porta. Ao testar, o `z` abriu o bilhete, não o painel. Capturas: `qa/evidencias/marco1/m12-vivo-codigo-017.png`.
- C2 (bilhete ao vivo): texto "Um bilhete para você." aparece (captura acima), sem andar até o bilhete.
- C3 (código 017 abre a P8): NÃO TESTADO nesta rodada (rota da P8 não calibrada).
- C4 (fade e nascer na Sala): NÃO TESTADO.
- C6a/C6b (P1): NÃO TESTADO. O script não chegou à Sala. O teste de "andar contra P1 não mostra texto" passou só porque nenhum texto apareceu (sem Sala, sem efeito).
- Suspeita da captura lolo-07 (sprite entre P2 e P3): NÃO RESOLVIDA ao vivo. Pelo mapa `content/maps/casa-real/sala.json` (lido nesta rodada), P1 (2,4) é alcançável por (2,5); P2 (1,3) e P3 (2,2) são alcançáveis por (2,3), que é piso. Então a suspeita de porta fechada invadida não é explicada pelo mapa. A captura lolo-07 continua sem prova ao vivo.
- Gancho pedido ao Orquestrador: para testar de verdade, falta expor a posição do personagem (`window.__estado()` com `{mapa, tileX, tileY, direcao, emFade, travado}`) e um comando de teleporte para teste (`window.__teleportar(mapa, spawn)`), só em build de teste. Hoje o smoke tem o espelho `jog`, mas o jogo não expõe a posição.
- Não testados nesta rodada: C5, C7 a C15, Cozinha (Pia, Fogão, Geladeira), P7 e vão, fade, volta pela P7/P8.

### Rodada 7 do Marco 1.2 (ao vivo com gancho, dist-qa, 2026-11-08, limite de 15 min)

- Build: `npm run build:qa` ok (`dist-qa/index.html`, gancho presente). Não publicado. Gancho `__estado`/`__teleportar` lido e usado: `__teleportar(sala, P8)` retorna true e `__estado` acompanha o tile.
- Script: `qa/scripts/casa12-vivo.mjs` (asserções de posição; movimento por tecla até um tile alvo).
- Resultados:
  - K1 colisão com parede (andar à esquerda de (6,4) para em (4,4), (3,4) é parede): APROVADO.
  - K2 colisão com a árvore (de (7,7), andar à direita, árvore em (8,7)): APROVADO (fica em (7,7)).
  - C9b P7 leva à Sala e nasce em (5,1): APROVADO.
  - C6a/C6b (P1), C6d/C6e/C6f (P2 e P3), C11 (volta pela P8), C4b (fade observado), C10a/b/c (Pia, Fogão, Geladeira): NÃO CONCLUSIVO. A rota de teste não andou como esperado em vários trechos (movimento vertical para baixo e para cima às vezes não sai do tile). Não é bug de jogo confirmado: é o movimento do script. Os textos de C6 e C10 não foram lidos porque a posição não foi a esperada.
  - Suspeita lolo-07 (sprite entre P2 e P3): continua sem prova ao vivo. O mapa mostra P2 (1,3) e P3 (2,2) alcançáveis pelo piso (2,3), então a suspeita não se confirma pelo mapa.
- Não testados: vão da P8 e da P7 não andável (pela posição), A bloqueado no fade (A durante emFade), Sala de 11 linhas visível (já coberto por canvas, M12-09), C5 (interruptor e luz), C7 e C8 (árvore), C12 (Elevador não escurece), C13 (nomes, já verificado em content/), C14 (áreas fechadas).
- Próximo passo: corrigir a rota do script (movimento que não respeita o alvo vertical em P1 e na Cozinha), um trecho por vez, e rodar de novo.

### Rodada final do Marco 1.2 (2026-11-08, ao vivo, dist-qa, asserções de posição)

- Builds e automáticos: `npm run build:qa` ok; `npm run build:playtest` ok; `npm test` 127 testes ok; `npm run smoke:playtest` 4 sobrinhos concluem, `erros: []`.
- Script final: `qa/scripts/casa12-vivo.mjs` (usa `qa/scripts/lib-rota.mjs` e `lib.mjs`). Resultado: 0 falhas.
- Resultados com asserção de posição (`__estado`):
  - G0/C1: nasce no Elevador (1,3), hall. APROVADO.
  - C2: A no bilhete mostra "Um bilhete para você.". APROVADO.
  - C3a: código errado (999) não abre a P8. APROVADO.
  - C3b: código 017 abre a P8 e nasce na Sala (6,4). APROVADO.
  - C5a/C5b: interruptor a 5 tiles da entrada (fora do círculo de 3); A nele muda a fase (luzes -> parte1). APROVADO.
  - C7: A na árvore depois das luzes mostra "A árvore ainda está desmontada. Ela precisa de 3 partes." APROVADO. C8 (pisca e diálogo pós conquista) não verificado.
  - C6-P1, P2, P3: A abre o diálogo da porta (texto "Essa porta está fechada.", ou diálogo aberto quando o texto já foi desenhado antes no canvas) e andar contra a porta fica no tile (2,3) ou (2,5). APROVADO. Suspeita lolo-07 (sprite entre P2 e P3): NÃO reproduzida; personagem não entra no tile da porta.
  - C4: A durante o fade (emFade=true) não gera texto. APROVADO.
  - C9: P7 leva à Cozinha. APROVADO.
  - C10: Pia, Fogão e Geladeira com textos exatos de content/texts/pt-BR.json. APROVADO.
  - C11a/C11b: volta pela P7 nasce em (5,1); volta pela P8 nasce em (1,0). APROVADO.
  - C12: Hall sem texto de escuro. APROVADO (verificação fraca: sem luz).
  - M12-03x30: 30 de 30 repetições de chegar a (4,3) e andar à esquerda param em (2,3). APROVADO. BUG-M12-03 reteste OK.
  - ERROS: 0 erros de página ou console.
- Limites do teste (honestos):
  - Texto repetido não é redesenhado pelo Phaser (mesma string); por isso o C6 também aceita "diálogo aberto" (travado=true).
  - Vão da P8 e da P7 não andável: não testado por posição (o vão é tile entre subáreas, fora da grade local). Coberto por `verificar:conteudo` (E008) e pela regra do conversor, sem prova ao vivo.
  - C8: não verificado (pisca e diálogo pós-conquista).
  - C13: nomes de familiares: verificado antes (`content/`, rodada 4); sem nova busca nesta rodada.
  - C14: áreas fechadas inacessíveis: não testado ao vivo.
  - BUG-M12-02 (última linha da Sala, chão andável sob a barra): fora dos critérios, continua aberto (aguarda o Diretor).

### Marco 1.3 (condução automática, 036; 2026-11-08)

- Automáticos: `npm test` 142 ok; `npm run build` ok; `npm run build:playtest` ok; `npm run build:qa` ok; `npm run smoke:playtest` 4 sobrinhos, `erros: []`; `validar:perfil` gba-240x160 ok; `validar:perfil` hd-480x352 ok; `verificar:conteudo` ok.
- Arte (pedido do Orquestrador): PNG de sprite em `assets/hd-480x352` com 23–24 cores (Sobrinhos), 3–5 cores (árvore, objetos), 13 cores (tiles). Não achatados em 4 cores. Preview (`tools-arte/preview_sobrinhos_hd-480x352.png`) mostra parado, interagir, comemorar, andar nos 4 lados com sombreado. Capturas do smoke (`dist-playtest/capturas/lolo-hall-3x.png`) coerentes com o preview. HTML do playtest: 43 PNG embutidos, sprites de 23 a 24 cores; o mínimo de 1 cor é a textura padrão do Phaser (não é arte).
- Ao vivo (`qa/scripts/casa13-vivo.mjs`, dist-qa, lib-rota):
  - C3 (código 017 abre a P8 e leva à Sala): OK.
  - D0: "Continuar" na conquista 1 dispara a condução (emConducao=true), fase parte1. OK.
  - D1 (teclas não interrompem): chega a (7,7) mesmo com setas, Z, X, Enter e Esc durante o trajeto. OK (teste indireto).
  - D4a: chega em (7,7), de frente para a árvore (direção direita), em ~3 s. OK.
  - D4c: controle volta depois do diálogo. OK.
  - L10: andar para baixo na Sala para em y=9 (linha 10 bloqueada). OK.
  - GEL: andar contra a Geladeira (2,3) não entra no tile. OK.
  - ERROS: 0 erros de página ou console.
  - D5 (barra vazia durante a condução): REPROVADO. Ver BUG-M13-01.
  - D4b (diálogo só depois de chegar): não conclusivo pelo texto (texto repetido não é redesenhado). Pela leitura de estado, o diálogo começa na chegada (emConducao=false e travado=true).
  - BUG-M13-02 (retângulo amarelo durante a condução): a verificar.
- Não testados: D2 (velocidade 2× em trajeto de mais de 10 tiles, medição com destino de teste); D3 (rota por passagem aberta e vão, em outra subárea); D6 (porta no trajeto com fade, com destino de teste em outra subárea); D7 (destino no arquivo da missão); D8 (validador recusando destino sem rota: teste automatizado, não ao vivo); D9 (uma vez por partida); D10 (regressão das luzes, fade e conquista, sem releitura de texto); C5 e C14 (áreas fechadas); Forno (não existe em `content/` ainda; a Geladeira tem 1 tile no JSON, o item pede 2 tiles).
- Sobre a Geladeira: o JSON de `cozinha` ainda tem a Geladeira com um tile (2,3). A separação Geladeira e Forno (2 tiles) não aparece nos dados desta rodada. Não consegui confirmar.

### Rodada 12 do Marco 1.3 (reverificação da condução, 2026-11-08)

- Build: `npm run build:qa` ok (rebuild desta rodada). Testes automatizados da rodada 11 (142) e build, build:playtest, smoke, validar:perfil e verificar:conteudo ok. Esta rodada não repetiu os automáticos; o Dev informou 149 testes depois do último commit.
- `qa/scripts/casa13-vivo.mjs` (reescrito; teclas só com emConducao=true; temporização por estado):
  - C3 (código 017 leva à Sala): OK.
  - D0 (Continuar dispara a condução): OK.
  - D5a/D5b: captura com emConducao=true e sem teclas (`m13b-conducao-sem-teclas.png`): barra vazia, nenhum texto de barra durante a condução. OK. BUG-M13-01 e BUG-M13-02 não reproduzidos.
  - D1: 13 a 14 toques de teclas (setas, Z, X, Enter, Esc) enquanto emConducao=true não param o trajeto; chegou em (7,7). OK.
  - D4b: o texto da árvore não aparece durante a condução e aparece depois da chegada (emConducao=false). OK.
  - D4c: controle volta depois do diálogo. OK.
  - D2: rota de 4 passos medida (0,24 a 0,26 s/tile, velocidade normal). A rota de mais de 10 passos não foi reproduzida: a condução só começa após as luzes, no interruptor. O gancho não permite iniciar a condução a partir do hall. 2× não confirmado. Não testado.
  - D9: A no interruptor de novo não inicia outra condução. OK.
  - ERROS: 0.
- Arte (`qa/scripts/arte-caminhada-vivo.mjs`): capturas de parado e andando nos 4 lados para LoLô, BiBi, DanDan e TuTu no hall (`qa/evidencias/marco1/arte-<nome>-*.png`). Abertas: `arte-tutu-andar-baixo.png` e `arte-bibi-andar-esquerda.png`: sprites com detalhe e sombreado, não achatados. Demais frames não abertos individualmente (limite de tempo); o preview de tools-arte confirma os 4 sobrinhos nos 4 lados.
- Não testado nesta rodada: L10 e Geladeira (passaram na rodada 11; script de rodada 11 substituído), D2 com rota > 10 passos, D3, D6, D7, D8, D10, C5, C14, Forno (não existe em content/).
