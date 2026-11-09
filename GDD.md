# GDD: Natal na Casa do Tio Ítalo e da Tia Nath

**Versão:** 1.0 (rascunho; revisão de 2026-11-08 (P2 horizontal Sala ↔ Quarto com chegada declarada nos dois lados, Quarto 5×8 e 5 tiles novos; pergunta 30 = A, Suíte fechada no Marco 2; passos da condução do 15.3.5 medidos; 12, 13, 14.10.1, 14.10.3, 14.10.5, 14.10.10, 14.12.2, 15.1, 15.3 e 15.10 atualizados); revisão de 2026-11-08 (Suíte e Quarto com chegada explícita, decisão do Diretor: 1 tile no início de cada cômodo; 12, 13, 15.1, 15.3, 15.6, 15.8 e 15.10 atualizados; pergunta 26 respondida em parte; pergunta 30 aberta); revisão de 2026-11-08 (pendências 26 a 29): Lavanderia como cômodo próprio para a regra 4.4 (27), aviso com gatilho no tile escondido (28), Cama no Escritório (29), Suíte com abertura pela P1 decidida mas geometria pendente (26, 15.3.4 item 8), regra de arestas das portas (14.10.9); 15.2.2, 15.3.1, 15.3.4, 15.3.5, 15.8, 15.10 atualizados; revisão de 2026-11-07: sem save, tela Como jogar, P6b fechada, barra de controles em toda tela (14.8), painel da porta com X apaga e Esc fecha, personalidade dos sobrinhos em 4.8, barras com 2 espaços entre ações; ajustes do PT1 em 14.9; casa real no Marco 1 em 14.10; perfil HD 15×11, regra do interruptor e vão da P8 decididos em 2026-11-07; revisão de 2026-11-08: ajustes do PT2 em 14.1, 14.3, 14.4, 14.10 e 14.10.9; rotação da planta em 14.12 (sentido horário, só o conversor gira, print do interruptor recebido), com 14.1, 14.3, 14.7, 14.10.8, 14.11.3 e 14.12.5 atualizados para a planta girada; revisão de 2026-11-08 (PT2b): indicadores de porta em 14.10.10 (item 046) e diálogo da árvore automático na condução em 14.9.3, 14.11 e 14.10.8 (item 047); reescrita da planta girada em 14.9.2 (Q7), 14.9.3, 14.10.1, 14.10.2, 14.10.3, 14.10.5, 14.10.8 (C1, C5), 14.10.10 (P1 e P3 com seta; pergunta 17 decidida em 2026-11-08) e 14.12.3 e 14.12.4 conforme o conteúdo atual); revisão de 2026-11-08 (Marco 2): seção 15 nova (peças da árvore, versão 0.6.0), respostas do Diretor às pendências 18 a 25 incorporadas em 12 e 15 (opção B de áreas, aviso "ainda não", textos da conquista 1; pendências 26 a 29 abertas) e item 2 da seção 13 apontando para a 15
**Status:** Aprovado para desenvolvimento da primeira fatia vertical, com pendências marcadas como **[TBD]**

---

## 1. Visão geral

Um jogo de aventura 2D em pixel art, inspirado na mecânica de RPGs clássicos de Game Boy Advance. O jogador entra na casa do tio Ítalo e da tia Nath, que pediram ajuda para montar a árvore de Natal. A casa está bagunçada, as luzes estão apagadas e as partes da árvore estão espalhadas pelos cômodos.

**Objetivo:** encontrar as três partes da árvore e a caixa de enfeite, e montar a árvore completa.

**Plataforma:** web (navegador), publicada no GitHub Pages.
**Controles:** teclado no computador e toque no celular, em modo paisagem.
**Público:** crianças de 5 a 10 anos, com adultos jogando junto.
**Modelo:** gratuito, sem monetização, sem anúncios, sem coleta de dados pessoais.
**Idioma:** português brasileiro.

### 1.1 Pilares de design

1. **Exploração sem pressa.** Não há tempo limite nem limite de tentativas. O jogador explora no próprio ritmo.
2. **Ajuda sem frustração.** Quando o jogador trava, o jogo oferece uma pista genérica e opcional, e nunca bloqueia o progresso.
3. **Natal como afeto.** O tom é caloroso e divertido, com a família como centro. Não há vilões nem perigo.
4. **Feito para ser jogado junto.** Crianças e adultos devem conseguir jogar lado a lado, com textos curtos e desafios que valem para os dois.

---

## 2. História

O jogo começa no hall do elevador do prédio. Um texto introdutório explica que o tio Ítalo e a tia Nath não estão em casa, mas precisam de ajuda para montar a árvore de Natal antes da chegada da família. O jogador entra na casa.

O jogador assume o papel de um dos **Sobrinhos** (LoLô, BiBi, DanDan ou TuTu), escolhido no início do jogo (ver 4.8).

A casa está bagunçada: as luzes estão apagadas, as peças da árvore estão espalhadas e o cachorro **Nick** está dormindo em algum lugar.

---

## 3. Fluxo do jogo

| # | Fase | Objetivo | Condição de conclusão | Tela de conquista | Ponto de nascimento após a conclusão |
|---|---|---|---|---|---|
| 0 | **Introdução** | Escolher o sobrinho e ler a história | Escolha confirmada e texto lido | — | Elevador |
| 1 | **Porta** | Descobrir o código da porta | Código correto digitado | — | Dentro da casa, na entrada |
| 2 | **Luzes** | Acender as luzes da casa | Interagir com o interruptor principal | "Parabéns, você conseguiu acender as luzes." | Ao lado da árvore, ainda desmontada |
| 3 | **Parte 1** | Encontrar a primeira parte da árvore | Interagir com a peça em qualquer cômodo | "Parabéns, você conseguiu encontrar a primeira parte da árvore de Natal." (texto decidido pelo Diretor em 2026-11-08, pergunta 23; ver 15.5) | Ao lado da árvore, com a parte 1 montada |
| 4 | **Parte 2** | Encontrar a segunda parte da árvore | Interagir com a peça | Tela de conquista própria | Ao lado da árvore, com 2 partes montadas |
| 5 | **Parte 3** | Encontrar a terceira parte da árvore | Interagir com a peça | Tela de conquista própria | Ao lado da árvore, com 3 partes montadas |
| 6 | **Enfeites** | Encontrar e posicionar a caixa de enfeite | Caixa posicionada na árvore | Tela de conquista própria | Ao lado da árvore completa |
| 7 | **Créditos** | Ver o final | Automático | — | — |

**Regra de ordem:** a parte 2 só pode ser encontrada depois da parte 1, e assim por diante. Os enfeites só aparecem depois da parte 3.

**Terminologia:** o que antes era chamado de "tela de carregamento" passa a ser **tela de conquista**. É um momento narrativo com texto e um botão para continuar, não uma tela de loading.

---

## 4. Mecânicas

### 4.1 Movimento e interação

- O personagem se move em 4 direções (cima, baixo, esquerda, direita), ou com analógico no celular.
- **Botão A:** interagir (abrir portas, falar com personagens, examinar objetos, acender interruptores, pegar peças).
- **Botão B:** ação secundária. Cancela, fecha textos e diálogos e, com o Nick acordado, ativa o farejar (ver 4.6). Por isso, a corrida não entra na v1, já que o B está reservado para o farejar.

### 4.2 Enigma da porta

- O código tem **3 números**.
- O jogador digita o código em um painel na porta.
- Não há limite de tentativas. A cada erro aparece uma mensagem simples de incentivo, sem penalidade.
- O enigma é apresentado como uma pergunta simples. A pista para resolvê-lo deve estar no próprio ambiente (por exemplo, em um bilhete ou decoração no hall).
- **Pergunta:** "Senha" (o código são os 3 últimos dígitos do ano de nascimento do sobrinho escolhido).
- **Código por personagem:**

| Personagem | Gênero | Código |
|---|---|---|
| LoLô | menina | 017 |
| BiBi | menina | 020 |
| DanDan | menino | 023 |
| TuTu | menino | 024 |

- **Pista:** o código depende do sobrinho escolhido, então o jogo valida o código do personagem atual (não um código único). **Pista no hall (definida pelo Diretor):** o texto "os 3 últimos dígitos do ano em que {nome_do_personagem} nasceu", com o nome do sobrinho escolhido. **Suporte visual (decidido pelo Produto, ver 14.4):** um bilhete de papel colado na parede ao lado da porta, no hall do elevador. Examinar o bilhete (A) abre um diálogo com o texto da pista.

### 4.3 Luzes

- A casa começa escura. Os cômodos são visíveis apenas parcialmente. **Visual decidido (ver 14.5):** penumbra suave com um círculo de luz ao redor do jogador, em tons de azul-noite (nunca preto total, nada assustador).
- O interruptor principal fica em um ponto fixo (na Sala, tile (5, 3), na diagonal da P1, ver 14.10).
- Ao acioná-lo, a casa acende e a tela de conquista aparece.

### 4.4 Peças da árvore

- Há **3 peças** da árvore, distribuídas em cômodos diferentes da casa.
- **Na v1, as posições são fixas.** O sorteio a cada partida fica planejado para versões futuras.
- Cada peça está visível no cômodo, com um brilho ou animação suave que chame atenção, sem indicar a posição exata.
- Ao interagir, a peça é encontrada e a tela de conquista aparece.
- Ao nascer de novo, o personagem aparece ao lado da árvore, que mostra as peças já montadas.

### 4.5 Caixas de enfeite

- É a mesma coisa que uma peça da árvore, com uma **animação diferente** ao ser posicionada (por exemplo, a caixa abre, o enfeite flutua e se encaixa).
- **Quantidade:** **1 caixa de enfeite.**
- **Localização (v1):** em um cômodo onde nenhuma peça da árvore foi colocada, para que o jogador não encontre tudo no mesmo lugar. Posição exata fixa.
- **Localização (futuro):** sorteada a cada partida, em qualquer cômodo, incluindo cômodos já usados pelas peças. Essa mudança deve ser feita junto com o sorteio das peças, sem alterar a lógica de farejar do Nick.

### 4.6 Nick, o cachorro

Nick é um personagem central e aparece em duas funções:

1. **Como personagem da casa:** ele dorme em algum cômodo, com animação de respiração (zzz). Ele não reage até ser acordado.
2. **Como mecânica de pista:** depois de acordado, ele segue o personagem do jogador, como o Pikachu segue o Ash em Pokémon Yellow, e pode farejar a localização do item procurado.

**Fluxo de Nick:**
- **Acordar:** o jogador interage com Nick (botão A). Ele levanta, abana o rabo e passa a seguir o jogador.
- **Seguir:** enquanto estiver acordado, Nick anda atrás do jogador pelos cômodos.
- **Farejar:** com Nick acordado, o jogador pressiona **B**. Aparece uma **seta** apontando para o cômodo onde está o item procurado (peça da árvore, caixa de enfeite, etc.). A seta indica o cômodo, não a posição exata.
- **Encontrar o item:** ao interagir com o item, a tela de conquista aparece e o jogador nasce ao lado da árvore.
- **Voltar a dormir:** após cada item encontrado, Nick volta a dormir em um cômodo da casa. Na próxima fase, ele precisa ser acordado de novo.

**Papel narrativo:** Nick reage a cada conquista (por exemplo, late ou abana o rabo ao encontrar uma peça). Isso dá identidade ao personagem e reforça o tom afetuoso.

### 4.7 Sistema de dicas

O sistema de dicas é **genérico, opcional e não bloqueia o progresso**.

- O jogador acessa a dica por um item de menu (ou um botão de ajuda) a qualquer momento.
- A dica mostra **a imagem da árvore** e um texto explicativo sobre a fase atual. Exemplos:
  - *"Procure em todos os cômodos por uma parte da árvore."*
  - *"O Nick está dormindo pela casa. Se você acordá-lo, ele pode ajudar a farejar onde está a parte da árvore."*
- A dica não entrega a posição exata. Ela orienta o que fazer.
- **Nick e dicas são coisas separadas.** A dica é um recurso de texto e imagem. Nick é uma mecânica de jogo que o jogador usa para descobrir a localização.

### 4.8 Seleção de personagem: Os Sobrinhos

Antes de começar, o jogador escolhe quem vai jogar entre **4 personagens**, chamados de **Os Sobrinhos**:

| Personagem | Observação |
|---|---|
| **LoLô** | Menina. Código da porta: 017. Personalidade: curiosa, animada, adora aventuras; sempre pronta para ajudar na missão de Natal. Aparência: `assets/referencia/ref_lolo_folha.webp`. |
| **BiBi** | Menina. Código da porta: 020. Personalidade: alegre, esperta, cheia de energia; adora brincar, explorar e viver aventuras com os primos. Aparência: `assets/referencia/ref_bibi_folha.webp`. |
| **DanDan** | Menino. Código da porta: 023. Personalidade: esperto, curioso, muito animado; adora descobrir coisas novas e ajudar nas missões da família. Aparência: `assets/referencia/ref_dandan_folha.webp`. |
| **TuTu** | Menino. Código da porta: 024. Personalidade: esperto, divertido, cheio de imaginação; adora brincar, explorar e viver aventuras com os primos. Aparência: `assets/referencia/ref_tutu_folha.webp`. |

**Regras (v1):**
- A escolha é **cosmética**: os 4 têm as mesmas habilidades, velocidade e interações. Isso mantém o jogo justo e a QA simples.
- A escolha é feita toda vez que o jogo começa: na tela de seleção, que aparece depois de **Começar** no título e antes da introdução.
- Cada sobrinho precisa de seus próprios sprites (ver 7.2). O código usa um identificador de personagem para escolher o sprite, sem duplicar a lógica do jogo.
- **Decidido:** os diálogos usam o nome do sobrinho escolhido. O texto precisa de uma variável de nome (e de gênero, se algum texto concordar em feminino/masculino).

---

## 5. Controles

| Ação | Teclado | Toque (celular) |
|---|---|---|
| Mover | Setas ou WASD | Direcional virtual (ou analógico) |
| Interagir (A) | Z ou Enter | Botão A |
| Cancelar (B) / Farejar com Nick (B) | X ou Esc | Botão B |
| Abrir dica | H | Ícone de ajuda |

**Exceção no painel da porta (Marco 1):** X apaga o último número, e só Esc fecha o painel. O foco começa em OK, e digitar números não move o foco (14.1).

**Menus e escolhas:** setas (ou WASD) trocam o item em foco; Z ou Enter confirma.

**Barra de controles:** toda tela mostra no rodapé uma linha fixa de teclas, com como avançar e como voltar (14.8). Isso vale também para a exploração.

**Celular:** o jogo só funciona em modo paisagem. Em modo retrato, aparece uma tela pedindo para girar o aparelho.

---

## 6. Interface e textos

- **Textos curtos**, com frases que uma criança de 5 anos consegue acompanhar. Adultos não devem achar o texto infantil demais.
- **Fonte legível** em tamanho grande, com espaçamento confortável.
- **Diálogos com botão de avanço** (A), sem tempo automático.
- **Barra de controles em toda tela** (14.8): uma linha de teclas no rodapé, sempre visível, com o texto exato de cada tela.
- **Sem pressão de tempo:** nada na tela conta o tempo da partida.
- **Sem salvamento:** nada é gravado. Cada vez que o jogo é aberto, ele começa do título.

---

## 7. Arte e áudio

### 7.1 Estilo visual

- Pixel art em resolução base de 240×160 (perfil v1), escalada em número inteiro. **Casa real do Marco 1 (decidido pelo Diretor, 2026-11-07):** perfil HD, tile de 32 px, tela de 15×11 tiles (480×352), escala fracionária no perfil HD (ADR-003, ADR-004). Ver 14.10.
- Tiles de 16×16 px.
- Paleta limitada (16 a 32 cores), com tons quentes de Natal (vermelho, verde, dourado) combinados com tons neutros para a casa.
- Câmera fixa por cômodo (sem rolagem suave no início).
- Referência: estética de GBA, sem copiar personagens, sprites ou elementos protegidos da Nintendo ou da Game Freak.

### 7.2 Personagens e itens

- **Os Sobrinhos (LoLô, BiBi, DanDan e TuTu):** 4 personagens jogáveis, cada um com seu conjunto de sprites. Cada um precisa de: andar nas 4 direções (cima, baixo, esquerda, direita), parado, interagindo e comemorando (tela de conquista e final). Os 4 devem ter o mesmo tamanho e a mesma estrutura de animação, para compartilhar a lógica. Aparência decidida pelo Diretor (ver 12, item 6): folhas em `assets/referencia/`, sprites finais em `assets/sobrinhos_final/`. Quadros dos sprites finais: 16×24 px.
- **Nick:** cachorro, sprites para dormindo, acordado, farejando e feliz.
- **Tio Ítalo e tia Nath:** aparecem apenas em textos e possivelmente em um retrato na tela de introdução [TBD].
- **Árvore:** 4 estados visuais (desmontada, 1 parte, 2 partes, completa com enfeites).
- **Caixas de enfeite:** sprite de caixa fechada e animação de abertura.

### 7.3 Áudio

- Música de fundo tranquila, com clima de Natal (sem direitos autorais; usar faixas de domínio público ou licenciadas de forma gratuita).
- Efeitos: interruptor, peça encontrada, porta destravando, latido do Nick, farejar, conquista.
- Áudio pode ser silenciado no menu.

---

## 8. Telas

Todas as telas têm barra de controles no rodapé (14.8).

1. **Título:** logo do jogo, botões "Começar" e "Como jogar", versão visível. Não há "Continuar" (não há save).
2. **Como jogar:** controles explicados em texto curto, com botão "Voltar" (ver 14.1).
3. **Seleção de personagem:** mostra os 4 sobrinhos (LoLô, BiBi, DanDan e TuTu). O jogador navega com as direções e confirma com A. Aparece sempre depois de "Começar".
4. **Jogo:** exploração em cada cômodo, com HUD mínimo (ícone de dica e, quando o Nick está acordado, a seta de farejar ao pressionar B).
5. **Diálogo:** caixa de texto na parte inferior.
6. **Painel de código:** teclado numérico para a porta.
7. **Tela de conquista:** imagem ou ilustração, texto e botão "Continuar".
8. **Dica:** imagem da árvore, texto e botão "Voltar".
9. **Pausa:** opções de áudio e voltar ao título.
10. **Créditos:** árvore montada, sobrinho escolhido, Nick e agradecimento.
11. **Aviso de rotação:** exibida no celular em modo retrato.

---

## 9. Requisitos técnicos

- **Motor:** Phaser 3 com TypeScript.
- **Editor de mapas:** Tiled, exportado em JSON.
- **Build:** Vite.
- **Testes:** Vitest para a camada de domínio.
- **Arquitetura:** Clean Architecture com DDD (ver ADR-001, a ser criada).
- **Persistência:** nenhuma. Não há save nem `localStorage`: o jogo sempre começa do zero (decisão do Diretor, 2026-11-07).
- **Playtests:** build de arquivo HTML único, publicada como artifact no Claude (não no GitHub Pages).
- **Publicação (releases finais):** GitHub Pages, com deploy automatizado a partir de tags de versão (`vX.Y.Z`).
- **Releases e evolução:** versionamento SemVer, `CHANGELOG.md` e conteúdo (mapas, missões, textos) em `content/` com manifesto, para permitir novas versões com novos mapas sem alterar o motor.
- **Compatibilidade:** versões recentes de Chrome, Edge, Firefox e Safari, no desktop e no celular.
- **Performance:** o jogo deve rodar bem em celulares intermediários e em notebooks simples, sem carregamento pesado. Assets otimizados.

---

## 10. Conteúdo e acessibilidade

- **Classificação:** livre, sem violência, sem conteúdo assustador ou sombrio. A casa escura é uma atmosfera de brincadeira, não de terror.
- **Acessibilidade básica:** texto com bom contraste, tamanho de fonte ajustável [TBD], controles de teclado e toque, e áudio com opção de desligar.
- **Privacidade:** nenhum dado pessoal é coletado nem gravado no navegador. Nenhum serviço de terceiros de rastreamento. Os códigos da porta revelam os 3 últimos dígitos do ano de nascimento dos sobrinhos, que são pessoas reais; a exposição foi aceita pelo Diretor (ver 12, P6b).

---

## 11. Fora de escopo (v1)

- Sorteio das peças da árvore e da caixa de enfeite a cada partida (planejado para versão futura).
- Corrida (o botão B está reservado para o farejar do Nick).
- Modo multijogador.
- Monetização, anúncios ou compras.
- Versão aplicativo nativo (iOS/Android).
- Conteúdo adicional (novos mapas e missões): fora da v1.0, mas a arquitetura da v1.0 deve estar pronta para recebê-lo.
- Idiomas além do português.
- Salvamento de progresso (checkpoint, "Continuar", `localStorage`, migração de saves): fora da v1.0, por decisão do Diretor (2026-11-07).
- Combate ou sistema de inventário complexo.

---

## 12. Pendências para definir

| # | Item | Responsável sugerido |
|---|---|---|
| 1 | ~~Pergunta, código, texto e suporte visual da pista~~ (decidido: bilhete ao lado da porta, 4.2 e 14.4) | — |
| 2 | Cômodo exato da caixa de enfeite na v1 (deve ser diferente dos cômodos das peças) | Produto, com você |
| 3 | Em que cômodo Nick dorme após cada item: posição fixa por fase ou sorteada? | Produto |
| 4 | Seta do farejar: aparece até o item ser encontrado ou por tempo limitado? | Produto |
| 5 | Nick reage quando o jogador entra em um cômodo com o item? (ex.: late) | Produto |
| ~~6~~ | ~~Aparência e traços de cada sobrinho (LoLô, BiBi, DanDan, TuTu)~~ **Decidido (Diretor, 2026-11-07):** folhas de referência em `assets/referencia/` (`ref_<nome>_folha.webp`, referência oficial) e sprites finais em `assets/sobrinhos_final/`. A folha do Nick também está em `assets/referencia/`; os sprites dele ficam para o Marco 3 | — |
| 6a | ~~Diálogos com o nome do sobrinho~~ (decidido) | — |
| ~~6b~~ | ~~Os sobrinhos são pessoas reais da família?~~ **Decidido (Diretor, 2026-11-07):** sim, são pessoas reais, e o Diretor aceita que os códigos da porta revelem os 3 últimos dígitos do ano de nascimento. Regra mantida: sem fotos reais e sem dados além de nome e código (ver 10 e 14.6) | — |
| 7 | ~~Visual do escuro~~ (decidido: penumbra azul-noite com círculo de luz, 14.5; a Arte pode refinar cores dentro da paleta) | — |
| 8 | Tamanho de fonte ajustável (fora do Marco 1: a fonte padrão já é grande; revisar no Marco 6) | Desenvolvimento |
| 9 | Trilha sonora escolhida | Arte e áudio |
| 10 | ~~Sala com 11 linhas: como a câmera mostra a Sala (14.10.7, pergunta 1)~~ **Decidido (Diretor, 2026-11-07):** perfil HD com tela de 15×11 tiles, câmera sem rolagem; a Sala cabe inteira (14.10.1) | — |
| 11 | ~~Distância do interruptor até a entrada (14.10.7, pergunta 2)~~ **Decidido (Diretor, 2026-11-07):** fora do círculo de luz inicial de 3 tiles, ao lado da P1 (14.10.2, item 5) | — |
| 12 | ~~Textos novos das portas fechadas e da Cozinha; Lavanderia sem objeto (14.10.7, pergunta 3)~~ **Decidido (Diretor, 2026-11-07):** textos aprovados, ajustáveis depois; Pia, Fogão e Geladeira; Lavanderia sem objeto (14.10.3, 14.10.4) | — |
| 13 | Tamanho do sprite dos Sobrinhos no perfil HD: 32×48 (provisório) ou 48×72. A Arte faz o teste lado a lado e o Diretor escolhe. Não bloqueia o Marco 1 (ADR-004, Resposta, item 4) | Arte + Diretor |
| ~~14~~ | ~~Condução automática após a conquista: texto da barra durante o trajeto e alcance do 2×~~ **Decidido (Diretor, 2026-11-08):** durante a condução a barra não mostra nenhuma tecla nem texto (14.8, exceção); 2× vale para o trajeto inteiro quando ele passa de 10 tiles, do início ao fim (14.11.3, 14.11.5) | — |
| ~~15~~ | ~~Novo local do interruptor na Sala (item 042)~~ **Decidido (Diretor, 2026-11-08):** o print é da planta atual (`assets/referencia/interruptor-pt2-planta-atual.png`, retângulo vermelho logo à direita da P1). A Arte define o tile a partir dele; a regra de 3 tiles é conferida (14.3, 14.12.3, 14.12.5) | — |
| ~~16~~ | ~~Rotação da planta (item 045)~~ **Decidido (Diretor, 2026-11-08):** sentido horário; só o conversor gira (TMX de trabalho na orientação atual); Sala 11×10 sem bloqueio na linha de baixo, que vira coluna da esquerda andável; móveis, paredes e portas giram como imagem, sobrinhos, Nick e árvore ficam em pé; redesenho dos móveis na orientação final vem com as referências do Diretor (item 021) (14.12.5, 14.12.6 R1) | — |
| ~~17~~ | ~~Seta na P7 (passagem Sala ↔ Cozinha, parede da direita): aplica a regra de porta lateral (14.10.10)?~~ **Decidido (Diretor, 2026-11-08): sim.** A regra do 046 vale para a P7 (passagem aberta) e também para as portas fechadas laterais: P1 com seta para a esquerda e P3 com seta para a direita; P2 sem indicador (14.10.10). *Revisto (Produto, 2026-11-08):* a P2 virou passagem lateral (15.3.3); pela regra de 14.10.10 ela recebe seta (direita na Sala, esquerda no Quarto). A confirmação é da captura C20 | — |
| ~~18~~ | ~~Áreas do Marco 2: opção A ou opção B (15.3)~~ **Decidido (Diretor, 2026-11-08): opção B.** Abrem Quarto (por P2), Escritório (por P3) e Suíte Casal (por P1); banheiros continuam fechados (15.3). A Suíte e a Lavanderia têm pendências próprias: 26 e 27 | — |
| ~~19~~ | ~~Posição das 3 peças (15.2.2)~~ **Decidido (Diretor, 2026-11-08):** Sala (1, 4); Cozinha (4, 1); Lavanderia (3, 5). A Arte confirma os tiles no TMX. Reavaliação com a opção B: pergunta 27 | — |
| ~~20~~ | ~~O que é a peça~~ **Decidido (Diretor, 2026-11-08):** sim, uma camada da árvore (base, meio, topo), no chão como miniatura com brilho dourado (15.2.1) | — |
| ~~21~~ | ~~Peças 2 e 3 começam escondidas~~ **Decidido (Diretor, 2026-11-08):** sim, só aparecem depois da anterior (15.2.3). O Diretor acrescentou o aviso "ainda não" ao tentar pegar peça fora de ordem (15.2.7); o gatilho no tile escondido é a pergunta 28 | — |
| ~~22~~ | ~~Diálogo automático de chegada~~ **Decidido (Diretor, 2026-11-08):** sim, uma página depois de cada peça (15.6.5) | — |
| ~~23~~ | ~~Texto da conquista 1~~ **Decidido (Diretor, 2026-11-08):** "primeira parte da árvore de Natal"; partes 2 e 3 com "segunda parte" e "última parte" (15.5, 15.8). Corrige o texto da parte 1 na tabela da seção 3 | — |
| ~~24~~ | ~~Fim do Marco 2~~ **Decidido (Diretor, 2026-11-08):** sim, árvore montada sem enfeite; jogo livre até o Marco 4; o playtest pode terminar aí (15.6.8) | — |
| ~~25~~ | ~~Dica no Marco 2~~ **Decidido (Diretor, 2026-11-08):** sem dica no Marco 2. A dica e o Nick entram no Marco 3 (15.9) | — |
| 26 | **Suíte Casal pela P1: abertura decidida (Diretor, 2026-11-08), geometria aberta.** Resposta literal: "adicione um quadrado para essa versão. Mas as portas deveriam ficar nas arestas dos quadrados." **Decidido:** a Suíte abre no Marco 2 pela P1; as portas são desenhadas sobre as arestas (14.10.9). **Interpretação do Produto, a confirmar pela prévia:** "quadrado" = 1 tile novo de chão na alcova da Sala. **Problema (15.3.4, item 8):** com P1 em (6, 2) e P2 em (7, 1), nenhum tile novo fecha a geometria: a chegada da P1 cairia na alcova (7, 2), que é de P2 e P3, ou a Suíte encostaria no piso do Quarto. **Resposta do Diretor (2026-11-08, literal): "P1 e P2 não mudam de lugar, mas a chegada em linha reta cai fora do cômodo"; ajuste: "Adicione 1 tile em cada um dos cômodos que isso acontece, e o sobrinho cai no início do cômodo."** Aplicado ao Quarto na primeira versão (tile novo (7, −2)); substituído pela P2 horizontal de 2026-11-08 (15.3.4, item 9). Para a Suíte, o Produto verificou que 1 tile não fecha a geometria com P1 em (6, 2): ver pergunta 30. **Padrão até a 30:** Suíte fechada no Marco 2; P1 segue porta fechada em (6, 2), com seta para a esquerda; a Sala não muda. Autor: Diretor (abertura e ajuste) e Produto (geometria). Status: respondida (Diretor, 2026-11-08); a Suíte ficou fechada pela pergunta 30 (A) |
| ~~30~~ | **Decidido (Diretor, 2026-11-08): A.** Suíte fechada no Marco 2; P1 segue porta fechada com seta para a esquerda; o piso da Sala não muda; Quarto e Escritório abrem (15.3.1). *Análise original, de 2026-11-08:* **Suíte Casal com P1 fixa: 1 tile não fecha a geometria (Produto).** P1 (6, 2) e P2 (7, 1) não mudam; a Sala não muda. As quatro saídas da P1, com 1 vão e 1 tile de chegada, não fecham: cima (vão (6, 1), Suíte em (6, 0), chegada (6, −1) encosta no gatilho do Quarto vertical (7, −1), da versão anterior, e a chegada de volta na Sala cairia em (6, 3), que é vazio); baixo (vão (6, 3), Suíte em (6, 4), que é chão da Sala); esquerda (vão (5, 2), Suíte em (4, 2), ambos chão da Sala); direita (vão (7, 2), a alcova de P2 e P3). **Opções (resposta: A, Diretor, 2026-11-08):** (A) Suíte fica fechada no Marco 2, P1 segue porta fechada com seta para a esquerda; **sugestão do Produto, escolhida pelo Diretor**. (B) P1 vai para o canto de cima da Sala, (1, 0), a opção do Especialista (zero tile novo); contraria a resposta de hoje, e o interruptor fica a 5 tiles da P1. (C) A Sala muda; a Arte estuda, com custo alto. Autor: Produto (análise) e Diretor (escolha) |
| 27 | **Lavanderia é cômodo separado da Cozinha (decidido, Diretor, 2026-11-08):** "sim, lavanderia é diferente da cozinha". Peça 2 na Cozinha (4, 1) e peça 3 na Lavanderia (3, 5) cumprem a regra 4.4. A opção de peça 3 no Quarto cai. **Interpretação do Produto, a confirmar pela prévia:** a Lavanderia continua na mesma subárea da Cozinha (sem porta nova, sem câmera nova, sem mudança de mapa); a diferença vale para a regra 4.4 e para o plano de peças. Se o Diretor quiser passagem e câmera próprias, vira subárea nova (custo alto, fora do Marco 2) | Diretor (decidido 2026-11-08) |
| 28 | **Aviso "ainda não" com gatilho no tile escondido (decidido, Diretor, 2026-11-08).** O tile da peça escondida tem gatilho de aviso, sem desenho (15.2.3, 15.2.7). O aviso revela o tile da peça seguinte a quem bate nele; isso é aceito | Diretor (decidido 2026-11-08) |
| 29 | **Cama no Escritório (decidido, Diretor, 2026-11-08):** "sim". A Cama (planta) fica no Escritório, só desenho e bloqueio (15.3.2) | Diretor (decidido 2026-11-08) |

---

## 13. Marcos de desenvolvimento

1. **Fatia vertical:** título (Começar e Como jogar), seleção de personagem (com os sprites finais dos 4 sobrinhos), introdução, porta, luzes e exploração livre no fim da fatia. Testa domínio, cena e teclado.
2. **Peças da árvore:** as três peças, com a tela de conquista e a árvore se montando. Especificado na seção 15 (versão 0.6.0), com a opção B de áreas (Quarto e Escritório abertos; a Suíte fica fechada, pergunta 30 = A; o Quarto tem 4 tiles novos, 15.3.4, item 9).
3. **Nick e dicas:** despertar, farejar e a tela de dica com imagem.
4. **Enfeite e créditos:** caixa de enfeite e fim do jogo.
5. **Toque e rotação:** controles do celular e aviso de modo retrato.
6. **Polimento:** áudio, textos, QA com crianças e adultos.

---

## 14. Especificação da fatia vertical (Marco 1)

Detalha o Marco 1. Textos entre aspas são os textos finais da v1 (vão para `content/`). `{nome}` = nome do sobrinho escolhido. Itens marcados **[Provisório]** aguardam o Diretor ou a Arte, mas não bloqueiam.

**Revisão de 2026-11-07:** a casa do Marco 1 é a planta real do Diretor (14.10). Onde 14.2, 14.3, 14.4, 14.5 e 14.7 divergirem, vale a 14.10. O texto substituído fica marcado como histórico, não é apagado.

### 14.1 Telas e textos

**Título.** Nome: "Natal na Casa do Tio Ítalo e da Tia Nath". Dois botões: "Começar" (foco inicial) e "Como jogar". Setas cima e baixo (ou W e S) trocam o botão em foco; A (Z ou Enter) confirma. "Começar" vai à seleção; "Como jogar" abre a tela abaixo. Versão do jogo visível no canto (ex.: "v0.1.0"). Logo em texto [Provisório]. Não há "Continuar" nem save: o título é sempre o ponto de partida. Barra: "Setas: escolher  Z: confirmar" (14.8).

**Tela "Como jogar".** Aberta pelo botão "Como jogar" do título. Título da tela: "Como jogar". Texto, uma linha por controle, em fonte grande:
- "Mover: setas ou WASD"
- "Botão A: Z ou Enter. Conversar, examinar e avançar textos."
- "Botão B: X ou Esc. Voltar e fechar textos."
- "No celular, em breve: botões na tela."

Botão "Voltar" (foco inicial). Z, X, Enter, Esc e clique voltam ao título, com foco em "Começar". Barra: "Z ou X: voltar" (14.8). No Marco 1 só estes controles aparecem. Quando o Nick (Marco 3) e o toque (Marco 5) existirem, a tela ganha as linhas correspondentes.

**Seleção.** Título: "Quem vai jogar?". Os 4 cartões em fila: LoLô, BiBi, DanDan, TuTu (sprite final + nome). Setas esquerda/direita movem, A confirma, B volta ao título. Sem sobrinho pré-confirmado: o foco começa em LoLô. Barra, em duas linhas: "Setas: escolher  Z: confirmar" e "X: voltar ao título" (14.8).

**Introdução** (cenário: hall do elevador, onde o jogador nasce, 14.10.2; páginas avançam com A, B não pula):
1. "Oi, {nome}!"
2. "O tio Ítalo e a tia Nath não estão em casa."
3. "Eles precisam de ajuda para montar a árvore de Natal."
4. "A casa está bagunçada. Vamos entrar?"
Depois da página 4, aparece o diálogo de orientação (14.9.1) e só então o jogador ganha controle no Hall, perto do Elevador. Sem retrato dos tios no Marco 1. Barra: "Z: avançar  X: voltar". X na página 1 volta à seleção, com o cartão escolhido em foco; X nas páginas 2 a 4 volta à página anterior. X nunca pula a introdução.

**Bilhete (pista).** Diálogo ao examinar: "Um bilhete para você." e depois "Dica: os 3 últimos dígitos do ano em que {nome} nasceu." Barra de diálogo (14.8). **PT2 (item 040):** o bilhete é um objeto de parede, preso na parede do Hall ao lado da P8, e não fica no piso.

**Porta.** Examinar a porta trancada (A), que é a P8 entre o Hall e a Sala, abre o painel. Pergunta no painel: "Senha". Teclado numérico na tela com 0 a 9, "Apagar" e "OK", exibindo 3 campos. Teclado do computador: dígitos 0-9 digitam no próximo campo, sem mover o foco (ignorados com os 3 campos cheios). Setas ou WASD movem o foco entre as teclas (0-9, "Apagar", "OK"); ao abrir o painel, o foco começa em OK. **PT2 (itens 038 e 039):** WASD e setas valem igual no painel. O painel não tem texto de dica: só a pergunta, os campos, o teclado e as mensagens. A dica fica no bilhete. Z ou Enter aperta a tecla em foco; em OK, confirma. X ou Backspace apaga o último dígito. Esc fecha o painel, e nenhuma outra tecla fecha. Sem penalidade. Barra, em duas linhas: "Setas: escolher  Z: apertar" e "X: apagar  Esc: fechar" (14.8). As mensagens do painel aparecem acima da barra.
- Menos de 3 dígitos ao confirmar: "Faltam números."
- Código errado (mensagem alterna, na ordem, sem contagem visível): "Quase! Leia o bilhete de novo." / "Hmm, esse não é. Tente outra vez!" / "Sem pressa. Você consegue!" Os campos são limpos.
- Código certo: o painel fecha e aparece o diálogo "Clique! A porta abriu." (toca efeito de porta, se houver; barra de diálogo). Ao fechar o diálogo, o jogador entra na casa (14.3).
- Porta já aberta: examinar de novo só atravessa.

**Casa escura.** Na Sala, ao ver a escuridão pela primeira vez, diálogo automático: "Está tudo escuro! Procure o interruptor." (uma vez só). Barra de diálogo (14.8).

**Interruptor.** Examinar (A): "Clique!" e as luzes acendem com fade curto (cerca de 0,5 s). Em seguida, tela de conquista.

**Tela de conquista 1.** Ilustração de lâmpada ou luzes acesas [Provisório]. Texto exato: "Parabéns, você conseguiu acender as luzes." Botão "Continuar" (A). Barra: "Z ou X: continuar" (X também continua, porque a conquista não tem voltar; 14.8). Ao continuar, começa a condução automática até a árvore (14.11), com as luzes acesas. Destino: 1 tile acima da árvore, de frente para ela (14.12.3). *Histórico (antes de 2026-11-08, item 036): "Ao continuar, o jogador nasce ao lado da árvore, com as luzes acesas."*

**Árvore desmontada** (fim do Marco 1): examinar (A): "A árvore ainda está desmontada. Ela precisa de 3 partes." (texto ajustado no Marco 1.1, 14.9.3; o antigo "Vamos procurar as partes!" prometia uma etapa que só existe no Marco 2). Antes das luzes, A na árvore não faz nada (14.10.2).

### 14.2 Estrutura mínima da casa (Marco 1)

**Atualização (2026-11-07, decisão do Diretor sobre o perfil HD; ADR-004).** Câmera do Marco 1: perfil HD, tile de 32 px, tela de 15×11 tiles (480×352). A câmera é fixa por subárea e não tem rolagem. A Sala, com 11 linhas, cabe inteira. Subárea menor que a tela é centralizada. Cada subárea (Hall com Elevador; Sala; Cozinha e Lavanderia, que é uma só) tem sua câmera. A troca de câmera acontece só pela porta (14.10.5), nunca por passagem sem gatilho. Após a rotação da planta (14.12), a Sala tem 11 colunas e 10 linhas; a tela continua 15×11.

**Histórico, substituído pela 14.10.1 e pela atualização acima (revisão de 2026-11-07).** Câmera fixa por cômodo, 15×10 tiles (240×160, perfil v1). Três cômodos (original):
1. **Hall do elevador** (fora de casa, sempre iluminado): elevador (decoração), bilhete na parede ao lado da porta, porta da casa. Jogador nasce aqui na introdução, de frente para a porta, a 3 tiles dela.
2. **Sala** (primeiro cômodo da casa, escuro até as luzes): entrada (porta que vem do hall), interruptor, árvore desmontada, saída para o cômodo 3.
3. **Cozinha** (provisória, mesma lógica de escuro/claro): cômodo vazio com móveis simples, só para provar a troca de cômodo e a câmera fixa. Será conteúdo real no Marco 2.

Troca de cômodo: ao atravessar a passagem, a câmera pula para o outro cômodo (sem rolagem). Sem inimigos, sem perigo.

### 14.3 Posições (Marco 1)

**Atual (revisão de 2026-11-08, rotação da planta; vale sobre a 14.10.2 e a 14.10.5):**
*Posições da planta girada, conforme 14.12.3. As posições anteriores à rotação ficam no histórico desta seção.*
- **Entrada:** o jogador nasce na Sala, 1 tile dentro da P8, na frente dela, olhando para cima (chegada da P8 na Sala em (6, 6), 14.12.3; 14.10.5). *Histórico (antes de 2026-11-08): "olhando para oeste".*
- **Interruptor:** tile **(5, 3)** na planta girada (conteúdo atual; 14.12.3). O print do Diretor é `assets/referencia/interruptor-pt2-planta-atual.png` (planta antes de girar; retângulo vermelho logo à direita da P1). A Arte confere no TMX de trabalho que o tile corresponde ao print (item 042). A regra de distância continua: fica **fora do círculo de luz inicial de 3 tiles**: a mais de 3 tiles do ponto de entrada (6, 6), medidos de centro a centro. Distância: 3,16 tiles (euclidiana). Por isso, o jogador precisa andar até ele. Tem brilho fraco e constante para ser achável.
- **Árvore:** na Sala, na 2ª linha contando de baixo para cima e na 4ª coluna contando da esquerda: tile (3, 8) (14.12.3; 14.10.2, item 7). Após as luzes, a condução automática (14.11) leva o jogador a 1 tile acima da árvore, tile (3, 7), de frente para ela (direção de chegada `baixo`). *[Muda com 036.]* *Histórico (planta atual, antes de 2026-11-08): "na 4ª linha de baixo para cima, no bloco mais à direita"; "1 tile à esquerda da árvore, de frente para ela".*

**Histórico, substituído pela 14.10.2 e pelo bloco acima (revisão de 2026-11-07).** Posições originais, mantidas para registro. A regra de 8 tiles do interruptor saiu:

- **Entrada:** jogador nasce na sala, 1 tile à frente da porta de entrada, de frente para dentro, quando a porta abre.
- **Interruptor:** na parede oposta à entrada na sala (lado do fundo), a pelo menos 8 tiles do ponto de entrada, para o jogador andar um pouco na penumbra. Tem um brilho fraco e constante para ser achável.
- **Árvore:** no centro-direita da sala. Após as luzes, o jogador nasce 1 tile à esquerda da árvore, de frente para ela.

### 14.4 Pista da porta
Bilhete de papel amarelo, colado na parede ao lado da P8 (porta da casa), do lado do Hall, visível da tela de nascimento (Elevador), sem ser preciso procurar. *Histórico (antes de 2026-11-07): "colado na parede à direita da porta, visível no hall".* Com um pequeno brilho (pisca suave) para chamar atenção, em linha com o pilar "ajuda sem frustração". O texto usa o nome do sobrinho para a criança saber qual ano procurar. **PT2 (item 040):** o bilhete é objeto de parede, não de piso (14.10.9).

### 14.5 Visual do escuro
Uma camada escura azul-noite sobre as subáreas com campo `escuro` (14.10.1: Sala, Cozinha e Lavanderia), com opacidade alta mas nunca total (os móveis ainda se adivinham). Ao redor do jogador há um círculo de luz de 3 tiles de raio (48 px no perfil v1; 96 px no perfil HD), com borda em degraus de pixel (estilo pixel art, sem desfoque). O círculo acompanha o jogador. O círculo inicial, na entrada da Sala, é a referência da regra do interruptor (14.3). Quando as luzes acendem, a camada some com fade. O hall do elevador nunca fica escuro.

### 14.6 Sem salvamento (decisão do Diretor, 2026-11-07)
Não há save, checkpoint nem "Continuar". Nada é gravado no navegador (sem `localStorage`). Ao abrir o jogo, o jogador começa no título. O sobrinho escolhido e o andamento (introdução, porta, luzes) existem só durante a sessão. Nenhum dado pessoal é gravado.

### 14.7 Fim do Marco 1
Depois da tela de conquista 1 e da condução automática (14.11), o jogador chega 1 tile acima da árvore, de frente para ela (14.12.3) (*histórico, antes de 2026-11-08: "nasce ao lado da árvore"*), com as luzes acesas, e pode explorar livremente as 4 áreas abertas: Hall (com Elevador), Sala, Cozinha e Lavanderia (14.10). Não há objetivos novos no Marco 1. Reabrir o jogo volta ao título. Durante a exploração, a barra é "Setas: andar  Z: examinar" (sem X, 14.8).

### 14.8 Barra de controles (decidido pelo Diretor, 2026-11-07)

Toda tela mostra, o tempo todo, uma linha fixa de teclas no rodapé, dizendo como avançar e como voltar. Se a tela não tem "voltar", a barra não inventa um: mostra só a ação que existe (ver tabela). O texto não muda com o estado do jogo.

**Vocabulário**
- **Avançar:** ir à próxima página ou etapa. **Confirmar:** escolher o item em foco. **Voltar:** ir à etapa anterior. **Fechar:** fechar caixa de texto ou painel e voltar ao jogo. **Apagar:** apagar um número no painel.
- A barra mostra só as teclas principais, Z e X. Enter, Esc, setas e WASD também funcionam; as alternativas estão em "Como jogar" (14.1).
- Z = botão A. X = botão B, exceto no painel da porta (X apaga; Esc fecha).
- Não confundir com a **dica** (4.7, tecla H, Marco 3).

**Textos por tela (exatos; vêm de `content/`, item 013)**

| Tela | Barra (texto exato) | Z / Enter (A) | X / Esc (B) |
|---|---|---|---|
| Título | "Setas: escolher  Z: confirmar" | Ativa o botão em foco: "Começar" vai à seleção; "Como jogar" abre a tela | Nada. Não mostra "voltar", porque o título é o início |
| Como jogar | "Z ou X: voltar" | Volta ao título, com foco em "Começar" | Volta ao título, com foco em "Começar" |
| Seleção | linha 1: "Setas: escolher  Z: confirmar"; linha 2: "X: voltar ao título" | Confirma o sobrinho e vai à introdução | Volta ao título |
| Introdução | "Z: avançar  X: voltar" | Próxima página; na página 4, dá o controle ao jogador | Página 1: volta à seleção, com o cartão escolhido em foco. Páginas 2 a 4: página anterior. Não pula |
| Diálogo (bilhete, "Clique!", casa escura, árvore, porta aberta) | "Z: avançar  X: fechar" | Próxima frase; na última, fecha | Fecha o diálogo |
| Painel da porta | linha 1: "Setas: escolher  Z: apertar"; linha 2: "X: apagar  Esc: fechar" | Aperta a tecla em foco; em OK, confirma o código | X apaga o último número. Esc fecha o painel (única tecla que fecha) |
| Conquista 1 (e as conquistas 2 a 6) | "Z ou X: continuar" | Continua | Continua. A conquista não tem voltar, então X também continua |
| Exploração livre | "Setas: andar  Z: examinar" | Examina o objeto em frente | Nada. Não há "voltar" na exploração |

**Posição e formato**
- Rodapé da tela (título, seleção, Como jogar, painel) ou última linha da caixa de texto (diálogo e introdução). Alinhada à esquerda, com 8 px de margem lateral e 4 px da borda inferior (base 240×160, perfil v1; outros perfis escalam estas medidas, ADR-003).
- Até 2 linhas, até 32 caracteres por linha. Entre duas ações, 2 espaços. Caixa normal, exceto as teclas (Z, X, Esc, Enter).
- Fonte pixel dos textos, com altura de letra de pelo menos 8 px na base (32 px na tela, com escala 4×).
- Contraste mínimo de 4,5:1 com o fundo. A Arte escolhe: texto claro sobre faixa escura semitransparente, ou escuro sobre faixa clara.
- Fixa: não pisca, não anima e não some enquanto a tela está aberta. Mensagens de feedback (ex.: "Faltam números.") aparecem acima da barra e não a substituem.
- Se faltar espaço, reduz-se o espaçamento do conteúdo. A barra e o texto nunca são cortados.
- Exploração: a barra ocupa a última linha de tiles da tela: y 144 a 160 no perfil v1; y 320 a 352 no perfil HD (15×11). Por isso, nenhum objeto, gatilho de porta, spawn ou passagem fica nessa linha (Arte e Level Design). A regra vale em toda subárea e é conferida pelo `validarConteudo` (ADR-004, seção 8, item 6). Decidida com o ADR-004 (aceito em 2026-11-07).

**Exceção: condução automática (item 036, decidida pelo Diretor em 2026-11-08; ver 14.11).** Durante o trajeto depois da conquista 1, a barra não mostra nenhuma tecla nem texto: fica vazia. A condução é a única tela sem ações. Nas demais telas, a regra acima vale sem exceção.

**Próximos marcos (não valem no Marco 1)**
- Marco 3: a dica tem "Z ou X: voltar". Com Nick acordado, a exploração ganha "X: farejar"; a barra pode passar a 2 linhas.
- Marco 5: a barra ganha a versão de toque (ex.: "A: avançar  B: voltar"). A regra acima não muda.
- Pausa e Créditos: a linha é definida quando o marco for detalhado. Toda tela terá linha fixa.

### 14.9 Ajustes do PT1 (Marco 1.1)

Origem: retorno do Diretor no PT1 (2026-11-07, `playtests.md`). Itens 016 a 019 do `backlog.md`. Os textos entre aspas são finais. Esta seção vale sobre 14.1, 14.3 e 14.8 quando houver divergência.

**Regra geral deste bloco:** o jogador nunca precisa adivinhar onde ficar. A tolerância de interação (14.9.2) não cria interação nova: A continua sendo o único botão que age, e nada acontece só por andar.

#### 14.9.1 Orientação ao ganhar o controle (item 016)

- **Quando:** logo depois da página 4 da introdução, antes de o jogador ter controle no hall. Aparece **uma vez por partida**: não reaparece ao voltar ao hall. Uma nova partida (título, "Começar") mostra de novo.
- **Formato:** diálogo de 2 páginas, avança com A, sem tempo automático. Barra: "Z: avançar  X: fechar" (14.8). X fecha o diálogo inteiro e dá o controle.
- **Texto (exato):**
  1. "Vamos montar a árvore de Natal, {nome}!"
  2. "Abra a porta. Há um bilhete perto dela, com a dica."
- **Limite:** cada página ocupa no máximo 2 linhas da caixa (cerca de 28 caracteres por linha, nome incluído).
- **Depois:** ao fechar, o jogador tem o controle no hall, com a entrada bloqueada por 200 ms, como nos outros diálogos.

#### 14.9.2 Regra geral de interação (item 017)

Vale para todo objeto interativo: interruptor, bilhete, porta (painel), árvore e, nas próximas fases, peças e caixa de enfeite. Substitui a regra atual de "um ponto exato à frente" (hoje em `application/mundo/movimento.ts`, função `objetoNaFrente`).

**Definições** (valores em pixels na base 240×160; 1 tile = 16 px):
- **Centro dos pés:** o ponto central da caixa dos pés (12×8 px), como hoje.
- **Quadrado de interação:** 16×16 px (1 tile), com o centro 16 px à frente do centro dos pés, na direção em que o jogador olha. Sua borda mais próxima fica 8 px à frente do centro dos pés, e a mais distante, 24 px.
- **Encostado:** a caixa dos pés está a no máximo 4 px do objeto, em um dos lados (esquerda, direita, cima ou baixo). Diagonal não conta.

**Ordem de decisão** ao pressionar A:
1. **Na frente:** o objeto é alvo se o quadrado de interação toca o objeto (com área maior que zero). Na prática: o objeto está no tile logo à frente do jogador, e o jogador pode estar até 1 tile desalinhado do centro do objeto, para qualquer lado.
2. **Encostado (se nada estiver na frente):** o objeto é alvo, mesmo que o jogador olhe para outra direção.
3. **Nada:** A não faz nada. Não há mensagem de erro.

**Desempates:**
- Vários na frente: vence o objeto mais próximo do centro do quadrado de interação.
- Vários encostados: vence o mais próximo da caixa dos pés. Se ainda empatar, vence o primeiro da lista de objetos do mapa.

**Não aciona:** objeto com um tile vazio ou mais entre ele e o jogador (sem encostar); só diagonal; diálogo ou painel aberto (como hoje).

**Casos de QA** (teclado, com cada um dos 4 sobrinhos; interruptor, bilhete, porta e árvore):
- Q1: de frente, no tile colado ao objeto, centrado: aciona.
- Q2: de frente, no tile colado, desalinhado até 1 tile para um lado: aciona.
- Q3: de frente, com um tile vazio entre o jogador e o objeto: não aciona.
- Q4: encostado de lado, olhando para o lado oposto: aciona.
- Q5: só na diagonal (canto): não aciona.
- Q6: bilhete e porta juntos no hall: o da frente vence; sem nenhum na frente, o mais próximo.
- Q7: parado no destino da condução, tile (3, 7), de frente para a árvore (3, 8), direção `baixo` (14.12.3): aciona na primeira tentativa.
- Q8: diálogo ou painel aberto: A não aciona nada.
- Q9: porta já aberta: A não abre o painel (14.1).

Caso fora desta lista que não bate com a ordem de decisão acima é bug.

#### 14.9.3 Chamar o jogador à árvore (item 018)

**Escolha:** pisca **e** diálogo único. Pisca sozinho chama o olhar mas não explica o que fazer; diálogo sozinho passa e some. Juntos, o pisca chama e o diálogo explica.

- **Diálogo único:** ao chegar ao destino da condução (14.11), 1 tile acima da árvore, de frente para ela, logo depois da conquista 1 (14.1), aparece **uma vez por partida**, antes de o jogador ganhar o controle. **Começa sozinho, na chegada: o jogador não aperta nenhuma tecla para abri-lo** (item 047, decidido pelo Diretor em 2026-11-08; o jogo força a interação com a árvore). O pisca começa junto com o diálogo. Entrada bloqueada por 200 ms, como nos outros diálogos. Duas páginas; Z avança (sem tempo automático); X fecha o diálogo inteiro. Barra: "Z: avançar  X: fechar" (14.8). Ao fechar, o controle volta e o jogador fica livre. *[Muda com 036 e 047.]* *Histórico (antes de 2026-11-08): "ao nascer ao lado da árvore"; (antes de 047): "avanço com A", o jogador precisava interagir com a árvore para o diálogo.*
  1. "A árvore ainda está desmontada."
  2. "Ela precisa de 3 partes. Examine a árvore!"
- **Examinar (A, na frente da árvore):** "A árvore ainda está desmontada. Ela precisa de 3 partes." Uma página, barra "Z: avançar  X: fechar". Substitui o texto de 14.1.
- **Repetível (item 047, decidido em 2026-11-08):** a árvore continua examinável. Depois das luzes, cada A na frente dela mostra o mesmo texto, quantas vezes o jogador quiser, até a árvore mudar no Marco 2. Isso não repete o diálogo automático de chegada, que acontece uma vez por partida. Ajuda a quem esqueceu a explicação e não bloqueia nada (pilar 2).
- **Pisca:** halo dourado (`#f4d35e`, a mesma cor do brilho do interruptor) atrás da árvore, com 4 px de margem em volta do sprite. Ritmo: ciclo de 2 s. Sobe em 0,8 s até opacidade 35%, desce em 0,8 s até 0%, e fica apagado por 0,4 s. Repete.
- **Para:** no primeiro exame da árvore (A na frente dela). O diálogo automático de chegada (14.9.3, item 047) não conta como exame. Depois do primeiro exame não volta nessa partida. Não para ao trocar de cômodo nem durante diálogos.
- **Nova partida:** o pisca e o diálogo único voltam (são de partida, não de save).
- **Por que o texto mudou:** "Vamos procurar as partes!" dá uma tarefa que o Marco 1 não permite cumprir. "Ela precisa de 3 partes" explica a próxima etapa sem prometer quando ela chega.

#### 14.9.4 Botões distintos do texto (item 019)

**O que é botão** (tem caixa e borda, e reage a foco e a ação): "Começar" e "Como jogar" (título); "Voltar" (Como jogar); os 4 cartões (seleção); as teclas 0 a 9, "Apagar" e "OK" (painel da porta).

**O que não é botão** (nunca tem caixa): título do jogo, textos de Como jogar, pergunta do painel, mensagens do painel, textos de diálogo e a barra de controles.

**Paleta** (já existe em `src/presentation/ui/textos.ts`, objeto `COR`; não cria cor nova):
- Texto `#f4e9c8` · Destaque `#f4d35e` · Fraco `#9aa3c7` · Fundo `#0b1030` · Caixa `#1b2452`

**Estados do botão:**

| Estado | Fundo | Borda | Texto | Marca |
|---|---|---|---|---|
| Normal | `#1b2452` | 1 px `#9aa3c7` | `#f4e9c8` | nenhuma |
| Foco | `#1b2452` | 2 px `#f4d35e` (1 px nas teclas do painel) | `#f4d35e` | ">" à esquerda (título e Como jogar); nos cartões, só o nome em `#f4d35e` |
| Pressionado (150 ms após A, Z, Enter ou clique) | `#f4d35e` | `#f4d35e` | `#0b1030` | a mesma do estado de foco |

Depois dos 150 ms, o botão volta ao estado de foco (ou normal, se não tiver o foco).

**Contraste** (fórmula WCAG; mínimo 4,5:1 para texto e 3:1 para borda):

| Par | Razão | Situação |
|---|---|---|
| Texto normal `#f4e9c8` sobre `#1b2452` | 12,2:1 | ok |
| Texto de foco `#f4d35e` sobre `#1b2452` | 10,1:1 | ok |
| Texto pressionado `#0b1030` sobre `#f4d35e` | 12,7:1 | ok |
| Borda normal `#9aa3c7` sobre `#1b2452` | 5,9:1 | ok (mínimo 3:1 para borda) |
| Texto informativo `#f4e9c8` sobre `#0b1030`, sem caixa | 15,3:1 | ok (não muda) |

**Regra de distinção:** botão tem caixa e borda; texto informativo não tem caixa. Se a Arte trocar a cor (ex.: refinamento do item 021), os pares acima precisam continuar acima de 4,5:1 e a regra de caixa continua valendo.

**Casos de QA:** em título, Como jogar, seleção e painel, cada botão mostra o estado normal, de foco e pressionado conforme a tabela; nenhum texto informativo tem caixa; os 5 pares acima são conferidos com um medidor de contraste sobre captura de tela.

### 14.10 Casa real no Marco 1 (revisão de 2026-11-07)

Origem: respostas do Diretor às perguntas de `docs/mapa-casa-real.md` (ver `decisions.md`, 2026-11-07, "Mapa real, respostas do Diretor"). Planta: `maps/casa-real/our-home.tmx`. Esta seção descreve posições por lado e por linha; a coordenada exata de cada tile é da Arte, no Tiled. Esta seção vale sobre 14.2, 14.3, 14.4, 14.5 e 14.7. A regra da última linha da tela (14.8) vale em todas as áreas. **Revisão de 2026-11-08 (item 036):** o nascimento depois da conquista 1 vira condução automática até a árvore (14.11). O restante desta seção não muda; o que muda está marcado "[Muda com 036]". **Revisão de 2026-11-08 (PT2):** ajustes em 14.10.2, 14.10.3 e 14.10.9 (desenho das portas e passagens). As posições de 14.10 são da planta girada (14.12.3), já aplicada no conteúdo (`content/maps/casa-real/*.json`, conferido em 2026-11-08). O que descreve a planta antiga está marcado como histórico.

**14.10.1 Áreas do Marco 1**

| Área | Estado no Marco 1 | O que tem |
|---|---|---|
| Hall (com o Elevador) | Aberta. Sempre claro. Fica fora da casa | Elevador (decoração; é onde o jogador nasce, coluna da esquerda, tile (0, 1)), bilhete (pista, parede, tile (2, 0)), P8 (porta da casa, com painel do código, gatilho (3, 0)) |
| Sala | Aberta. Escura até as luzes | P8 (entrada, gatilho (6, 7)), interruptor (5, 3), árvore desmontada (3, 8), passagem para a Cozinha e Lavanderia (P7, na parede da direita, gatilho (10, 5)), portas fechadas P1 (6, 2), P2 (7, 1) e P3 (8, 2) na parede de cima. P1 e P3 são verticais, nas faces da alcova (7, 2); P2 é o fundo dela (14.10.3) |
| Cozinha e Lavanderia | Aberta. Escura até as luzes | Pia, Fogão e Geladeira (examináveis, 14.10.4); passagem P7 (parede da esquerda, gatilho (0, 0)) |
| Escritório, Banheiro do Escritório, quarto, Suíte e Banheiro do casal | Fechadas no Marco 1, sem porta nem passagem. *Marco 2: Quarto e Escritório abrem (opção B, 15.3); a Suíte fica fechada (pergunta 30 = A); banheiros continuam fechados* | Existem na planta, mas não aparecem no jogo no Marco 1 (14.10.3) |

- **Tamanho:** a Sala tem **11 colunas e 10 linhas** na planta girada (14.12.2), com 110 tiles. A câmera do Marco 1 é o perfil HD: 15×11 tiles de 32 px (480×352), sem rolagem. A Sala cabe inteira, com a passagem P7 na parede da direita (decisão do Diretor, 2026-11-07; ver 14.10.7). *Histórico (planta antes de 2026-11-08): "a Sala tem 11 linhas"; "passagem P7 na linha de cima"; "câmera do Marco 1 mostra 15×10 tiles" (antes de 2026-11-07).*
- **Critério:** só essas 4 áreas são alcançáveis. As portas P4, P5 e P6 (nas áreas fechadas) não são alcançáveis.

**14.10.2 Fluxo da missão**

1. **Nascer:** o jogador nasce no Elevador, tile (0, 1), na coluna da esquerda do Hall, olhando para a direita (14.12.3). Esse ponto é o início da introdução (decisão do Diretor, 2026-11-07). *Histórico (antes de 2026-11-08): "no bloco mais distante da P8 (o de baixo), olhando para o Hall".* Depois da página 4 da introdução, aparece o diálogo 14.9.1 e só então ele ganha o controle.
2. **Bilhete:** no Hall, o bilhete fica na parede, tile (2, 0), à esquerda da P8 (gatilho (3, 0)), com vizinho livre embaixo, (2, 1). Aparece na tela de nascimento, sem andar. PT2 (item 040): o bilhete é tile de parede, não de piso (14.10.9). O texto da dica é o da 14.1, sem mudança (texto decidido pelo Diretor, 2026-11-07).
3. **Porta:** A na P8 abre o painel (14.1). Com o código certo do sobrinho (017, 020, 023 ou 024), aparece "Clique! A porta abriu." Ao fechar o diálogo, o jogador vai para a Sala, tile (6, 6), olhando para cima (14.10.5).
4. **Sala escura:** na primeira entrada, aparece "Está tudo escuro! Procure o interruptor." (14.1).
5. **Interruptor:** tile (5, 3), na Sala, na diagonal da P1 (6, 2). Brilho fraco (14.3). **Regra (decisão do Diretor, 2026-11-07):** fica fora do círculo de luz inicial de 3 tiles, ou seja, a mais de 3 tiles do ponto de entrada (6, 6). Distância: 3,16 tiles (14.3). O jogador precisa andar até ele. A regra de 8 tiles da 14.3 sai. *Histórico: "na parede oeste da Sala, ao lado da P1"; "PENDENTE, item 042" (antes de 2026-11-08); "fica a cerca de 3 a 4 passos da entrada... distância mínima de 4 passos (pergunta 2)."*
6. **Luzes e conquista 1:** A no interruptor acende a casa toda (Sala, Cozinha e Lavanderia; o Hall já está claro). Aparece a tela de conquista 1 (14.1). Ao continuar, começa a condução automática (14.11) até o tile (3, 7), 1 tile acima da árvore, na Sala, de frente para ela (direção de chegada `baixo`). *[Muda com 036.]* *Histórico (antes de 2026-11-08): "nasce na Sala, 1 tile à esquerda da árvore, de frente para ela".*
7. **Árvore:** fica na Sala, no tile (3, 8): 2ª linha contando de baixo para cima (a linha mais de baixo é a 1ª) e 4ª coluna contando da esquerda (14.12.3). Não fica no Elevador. *Histórico (planta antes de 2026-11-08): "4ª linha de baixo para cima, no bloco mais à direita", tile (8, 7).* Depois da conquista 1 e da condução, o pisca e o diálogo único de 14.9.3 começam. *[Muda com 036: antes, começavam ao nascer.]* Antes das luzes, A na árvore não faz nada. **[Provisório]** decisão do Produto, para não prometer uma etapa antes da hora.
8. **Exploração:** livre pelas 4 áreas abertas (14.7).

**14.10.3 Portas fechadas (P1, P2 e P3)**

- **Onde:** na parede de cima da Sala: P1 (6, 2), P2 (7, 1) e P3 (8, 2). Levam a áreas fechadas. A alcova (7, 2) é tile de chão da Sala, com P2 no fundo e P1 e P3 nas laterais. *Marco 2: P2 vira passagem para o Quarto (15.3.3); esta descrição é do Marco 1.* *Histórico (antes de 2026-11-08): "na parede oeste da Sala".*
- **Vê:** porta fechada desenhada de cima, em retângulo comprido alinhado à parede, sem brilho e sem painel de código (a P8 tem painel). P2 é horizontal; P1 e P3 são verticais, como a P7, e têm seta (14.10.10). Uma porta é uma só abertura: P1 não tem segunda entrada (PT2, itens 043 e 044; 14.10.9).
- **Ouve:** nenhum som. Não há efeito de porta.
- **A na frente:** diálogo, com o mesmo texto para as três: "Essa porta está fechada." / "Hoje não dá para entrar." Barra "Z: avançar  X: fechar" (14.8). Cada A abre o diálogo de novo.
- **Andar contra a porta:** o jogador para, sem texto e sem transição.
- **Critério:** nenhuma das três leva a outro lugar; nenhuma tem painel; o texto cabe em 2 linhas de até 28 caracteres.

**14.10.4 Cozinha e Lavanderia**

- **O que fazer:** só explorar. Não há missão, pista nem contagem. Cômodo escuro até as luzes. Ao entrar no escuro, não aparece diálogo (o diálogo de escuro é só da Sala).
- **Objetos examináveis** (A; diálogo de 2 linhas cada):
  - **Pia:** "A pia está limpinha." / "Os copos já estão secos."
  - **Fogão:** "O fogão está apagado." / "Cheiro de bolo de Natal?"
  - **Geladeira:** "A geladeira está cheia." / "Coisas gostosas para a ceia!"
- **Lavanderia:** sem objeto examinável no Marco 1 (a planta não tem móvel nomeado nela). Pergunta 3.
- **Critério:** os 3 textos saem exatos; paredes e móveis sem nome não reagem a A; a barra é "Setas: andar  Z: examinar" (14.8).

**14.10.5 Transições entre áreas**

- **Quando:**
  - (a) P7, passagem aberta: andar sobre o gatilho da passagem.
  - (b) P8 já aberta: andar sobre o gatilho, ou A na frente da porta (como em 14.1, "examinar de novo só atravessa").
- **Vão:** P7 e P8 têm 1 tile vazio entre os dois gatilhos (ADR-004, seção 3 e Anexo; a P8 foi confirmada pelo Diretor em 2026-11-07). O vão nunca é andável: a transição acontece no gatilho.
  - (c) P8 com código certo: ao fechar "Clique! A porta abriu.", o jogador vai para a Sala.
  - P1, P2 e P3: nenhuma transição no Marco 1 (no Marco 2, P2 e P3 viram passagens, 15.3.3).
- **Efeito:** fade para a cor de fundo `#0b1030` (nunca preto puro). 0,25 s para escurecer, troca de área, 0,25 s para clarear (total de cerca de 0,5 s). Durante o fade, o controle e o A ficam bloqueados.
- **Onde nasce:** sempre no ponto de destino fixo, não onde o jogador andou, de frente para dentro do destino:
  - Hall para Sala (P8): tile (6, 6) da Sala, na frente da P8, olhando para cima.
  - Sala para Hall (P8): tile (3, 1) do Hall, na frente da P8, olhando para baixo.
  - Sala para Cozinha e Lavanderia (P7): tile (1, 0) da Cozinha e Lavanderia, na frente da passagem, olhando para a direita.
  - Cozinha e Lavanderia para Sala (P7): tile (9, 5) da Sala, na frente da passagem, olhando para a esquerda.
  - Gatilhos (14.12.3): P8 em (6, 7) na Sala e (3, 0) no Hall; P7 em (10, 5) na Sala e (0, 0) na Cozinha e Lavanderia.
- **Não muda com 036:** esta regra é do nascimento por porta. A condução depois da conquista 1 (14.11) não usa este item; usa o fade e a chegada de 14.11.3.
- **Câmera:** pula para a área de destino, sem rolagem (14.2). Como a tela de 15×11 cabe a Sala inteira, não há rolagem em nenhuma área do Marco 1.
- **Estado:** luzes, árvore, pisca e a primeira vez de "Está tudo escuro!" continuam na partida (14.6: nada é gravado). Voltar ao Hall pela P8 não pede o código de novo.
- **Critério:** os 4 sentidos de passagem nascem no ponto certo; o fade dura cerca de 0,5 s; o A não age durante o fade.

**14.10.6 Privacidade dos nomes**

- Só os nomes dos Sobrinhos aparecem no jogo (decisão do Diretor, 2026-11-07; ver 10).
- Rótulos da planta (nomes de cômodos, móveis e nomes de arquivos) não são texto do jogo. Nenhum rótulo com nome de pessoa da família entra em `content/`, no código ou nos textos. Os cômodos fechados recebem rótulo genérico ou não são exportados (item 034). Ver `docs/mapa-casa-real.md`, seções 1.2 e 3.1.

**14.10.7 Pendências desta revisão (resolvidas em 2026-11-07; ver `decisions.md`)**

- **Pergunta 1, resolvida: Sala com 11 linhas.** Decisão do Diretor: perfil HD com tela de 15×11 tiles (480×352), câmera sem rolagem. A Sala cabe inteira (14.10.1). *Histórico: a pergunta tinha três opções (rolagem de 1 tile só na Sala; câmera de 11 linhas só nessa área; tirar a linha de cima). A sugestão original era a rolagem.*
- **Pergunta 2, resolvida: distância do interruptor.** Decisão do Diretor: o interruptor fica fora do círculo de luz inicial de 3 tiles, ao lado da P1 (14.10.2, item 5). A regra 14.9.2 decide qual objeto responde ao A ao lado da P1, e o QA testa (C5). *Histórico: sugestão original de 4 passos.*
- **Pergunta 3, resolvida: textos novos e Lavanderia.** Decisão do Diretor: os textos de 14.10.3 e 14.10.4 estão aprovados (ajustáveis depois, sem mudar o código). A Lavanderia fica sem objeto no Marco 1.
- **Pendência nova, não bloqueia: tamanho do sprite no perfil HD** (32×48 ou 48×72). Ver 12, item 13. Trocar o sprite é perfil novo, sem mudar o mapa (ADR-004, Resposta, item 4).

**14.10.8 Casos de QA (Marco 1, casa real)**

Com os 4 sobrinhos, no teclado (cada caso vale para cada um deles):

- **C1:** nasce no Elevador, tile (0, 1), olhando para a direita; o bilhete aparece na tela sem andar.
- **C2:** A no bilhete mostra os dois textos de 14.1, exatos.
- **C3:** P8 com 20 erros seguidos não muda nada. Com o código do sobrinho escolhido (017, 020, 023 ou 024), abre. Código de outro sobrinho é rejeitado.
- **C4:** ao fechar "Clique! A porta abriu.", fade de cerca de 0,5 s e nascimento 1 tile dentro da Sala, olhando para cima (14.12.3). "Está tudo escuro!" aparece uma vez.
- **C5:** interruptor em (5, 3), na diagonal da P1 (6, 2), fora do círculo de luz inicial de 3 tiles (14.3; 3,16 tiles do ponto de entrada (6, 6)). Partindo da entrada, o jogador precisa andar para alcançá-lo. Com A na frente do interruptor, ele acende. Perto da P1, A aciona o que está na frente (14.9.2, Q6).
- **C6:** P1, P2 e P3: A mostra o texto de 14.10.3; andar contra a porta não mostra nada; nenhuma transição.
- **C7:** árvore na 2ª linha de baixo para cima da Sala, na 4ª coluna da esquerda (tile (3, 8), 14.12.3). Antes das luzes, A nela não faz nada.
- **C8:** após a conquista 1, a condução (14.11) leva o jogador até 1 tile acima da árvore (tile (3, 7)), de frente para ela (direção `baixo`); só então o diálogo e o pisca começam sozinhos, sem tecla (14.9.3, item 047). *[Muda com 036 e 047. Histórico: "nasce 1 tile à esquerda da árvore; aparecem o diálogo e o pisca (14.9.3)."]*
- **C9:** andar sobre a passagem P7 leva à Cozinha e Lavanderia (fade; nasce na frente da passagem; escuro até as luzes). Ao acender, a casa toda acende.
- **C10:** Pia, Fogão e Geladeira com os textos exatos; a Lavanderia não tem objeto.
- **C11:** voltar pela P7 e pela P8 (sem código de novo): nasce do lado certo; luzes e árvore mantidas.
- **C12:** o Hall nunca fica escuro; A no Elevador não faz nada.
- **C13:** nenhum nome de pessoa da família aparece no jogo (item 034).
- **C14:** nenhuma área fora das 4 abertas é alcançável. *(Marco 1. No Marco 2 o equivalente é E19, 15.10.)*
- **C15:** a Sala inteira (11 colunas × 10 linhas, depois da rotação) aparece na tela da Sala, sem rolagem e sem cortar; a passagem P7 (parede da direita) e o interruptor ficam visíveis. Confirmado pelo QA no item 033 do backlog, antes da rotação (então eram 11 linhas).

**14.10.9 Desenho das portas e passagens (PT2, itens 040, 041, 043, 044)**

Origem: retorno do Diretor no PT2 (2026-11-08, `playtests.md`). Não muda a lógica de porta (ADR-004): muda o que o jogador vê e o que o conteúdo marca. As posições destes itens são as da planta girada (14.12), já aplicada no conteúdo (item 045).

- **Porta em vista superior (043):** toda porta (P1 a P8) é um retângulo comprido, alinhado à parede, visto de cima. Não é fachada de porta. Nas paredes horizontais e verticais, o desenho é o mesmo, girado (decisão da Arte).
- **Uma porta, uma entrada (044):** P1 tem uma só abertura e uma só folha. No conteúdo, P1 é um único objeto `portaFechada`, sem segundo gatilho nem segunda marca.
- **Passagem visível (041):** a passagem P7 (Sala ↔ Cozinha e Lavanderia) aparece como abertura na parede: o gatilho tem desenho de vão aberto, com cor ou desenho diferente da parede e do piso. A parede em volta é contínua e não tem texto. A P8, quando aberta, usa o mesmo desenho de passagem.
- **Regra de arestas (Diretor, 2026-11-08, pergunta 26: "as portas deveriam ficar nas arestas dos quadrados"):** cada porta é um retângulo fino desenhado sobre a **aresta** (borda) entre o tile de chão do lado de dentro e o tile do vão ou da passagem. Não fica no centro do tile do vão. Interpretação do Produto, a confirmar pela prévia (print `assets/referencia/planta-girada-diretor.png`, retângulos finos sobre as bordas). Impacto nos sprites: `spr_porta` (horizontal) e `spr_porta_vertical` (vertical) hoje são 32×32 presos ao tile. Para a regra valer, a Arte faz um desenho fino (faixa de cerca de 6 a 8 px de espessura, com 32 px de comprimento) centrado na aresta, ou um sprite 32×32 com a faixa no lugar certo da arte (decisão da Arte, sem mudar o conteúdo). A P1 e a P3 usam `spr_porta_vertical`, a P2 e a P8 usam `spr_porta`. A seta e o tapete (14.10.10) não mudam de tile: seguem a regra de 14.10.10.
- **Vão continua não andável:** o vão de 1 tile (14.10.5) segue bloqueado. O desenho não pode sugerir chão onde o jogador bate: o que está vazio aparece como parede ou fundo, nunca como piso.
- **Bilhete de parede (040):** o bilhete é tile de parede, bloqueado, com vizinho livre (como `examinavel`, ADR-004 seção 6). Continua sendo lido com A, pela regra de 14.9.2.
- **Indicadores de saída (046):** seta ou tapete por cima deste desenho, conforme a direção de saída. Ver 14.10.10.
- **Critérios de QA (C16 a C19):**
  - **C16:** na Sala, P1 aparece como uma só porta na captura (044).
  - **C17:** na tela da Sala, sem andar e sem texto, a passagem P7 (parede da direita, 14.12.3) aparece como abertura distinta da parede (041).
  - **C18:** captura de P1, P2, P3, P7 e P8: retângulo comprido de vista superior, com comprimento de pelo menos 2× a largura (043). O Diretor aprova a captura antes de republicar.
  - **C19:** painel da P8, no teclado: sem texto de dica, só a pergunta, os campos e o teclado (039); WASD move o foco como as setas (038).

**14.10.10 Indicadores de porta (PT2b, item 046)**

Origem: retorno do Diretor no PT2b (2026-11-08, `playtests.md`). Na vista de cima, uma porta que leva para a direita ou para a esquerda, ou que sai para baixo, é difícil de reconhecer como porta. As portas que levam para cima ficam fáceis, porque a arte isométrica mostra a fachada, e ficam como estão. Esta seção acrescenta um indicador sobre o desenho de 14.10.9. Não muda a lógica de porta (ADR-004).

- **Regra, pela direção de saída.** A direção é a do lado da área pelo qual o jogador sai ao atravessar a porta, na tela da planta girada (14.12.1). Sempre medida a partir da área onde a porta está desenhada:
  - **Saída para a direita ou para a esquerda:** seta branca como `assets/referencia/ref_porta_seta.webp`, sobre o tile da porta, apontando para o lado de saída.
  - **Saída para baixo:** tapete vermelho como `assets/referencia/ref_saida_tapete.webp`, no tile do vão, logo abaixo do gatilho da porta, fora da área de piso desenhada. Não ocupa o gatilho. Decisão do Diretor (2026-11-08): o tapete marca a saída, por isso fica no vão, e não mais no tile de chegada. Produto escolheu o tapete (o Diretor deu tapete ou seta de saída; a seta de saída fica como alternativa, se a captura pedir). *Histórico (antes de 2026-11-08): "no tile de chão logo à frente da porta, do lado de dentro da área", tile (6, 6).*
  - **Exceção explícita a 14.10.9 (vão não sugere chão):** o tapete é o único desenho de chão sobre o vão. O vão segue não andável, e o tapete não muda isso.
  - **Saída para cima:** nenhum indicador. A porta fica como em 14.10.9.
- **Marco 1 (planta girada):**

| Porta | Área onde está | Lado de saída | Indicador |
|---|---|---|---|
| P1 (6, 2) | Sala (alcova, face esquerda) | esquerda | seta para a esquerda |
| P2 (7, 1) | Sala (passagem para o Quarto; fechada no Marco 1, 14.10.3) | direita | seta para a direita sobre o tile (7, 1) |
| P2 (0, 7) | Quarto (coordenadas locais; passagem a partir do Marco 2, 15.3.3) | esquerda | seta para a esquerda sobre o tile (0, 7) |
| P3 (8, 2) | Sala (alcova, face direita) | direita | seta para a direita |
| P7 (10, 5) | Sala (parede da direita) | direita | seta para a direita |
| P7 (0, 0) | Cozinha e Lavanderia (parede da esquerda) | esquerda | seta para a esquerda |
| P8 (6, 7) | Sala (parede de baixo) | baixo | tapete no vão (6, 8), abaixo do gatilho, fora do piso desenhado |
| P8 (3, 0) | Hall (parede de cima) | cima | nenhum |

- **Com a porta fechada ou aberta:** o indicador segue a mesma regra, sem depender do estado (decisão do Produto, 2026-11-08). Na prática, a P8 só é vista da Sala com a porta aberta, porque a Sala só se alcança por ela.
- **Portas laterais, abertas e fechadas:** a regra vale para a P7 (passagem aberta) e para as portas fechadas laterais P1 e P3. Decisão do Diretor (2026-11-08, pergunta 17 da seção 12, decidida): a regra vale também para portas fechadas laterais; o Diretor pediu "use como referência para as portas". P1 ganha seta para a esquerda, P3 seta para a direita, e P2 (para cima, na versão fechada) não tinha indicador; com a P2 horizontal (15.3.3), a saída é lateral e ela ganha seta. P1 e P3 ganham a seta; a regra de porta fechada (14.10.3: texto, sem painel, sem transição) não muda.
- **Atenção (captura):** a alcova (7, 2) está entre P1 e P3. A seta de P1 aponta para o tile (5, 2), que é da Sala, e a de P3 aponta para a parede (9, 2). A captura C20 deve mostrar isso e o Diretor confirma se a leitura está clara.
- **Estático:** sem pisca, sem animação e sem texto. O pisca é só da árvore (14.9.3), para não confundir.
- **Só desenho:** o indicador não cria objeto, gatilho nem colisão. O tapete no vão (6, 8) não é andável: o vão de P7 e P8 segue não andável (14.10.5). O jogador não pisa no tapete, só o vê.
- **Portas de mapas futuros:** a mesma regra vale para novas portas (sem mudar o motor, ADR-004).
- **Casos de QA (captura, sem andar, salvo indicação; no teclado com os 4 sobrinhos onde houver jogador):**
  - **C20 (Sala girada, tela inteira):** seta branca sobre P7 apontando para a direita; seta branca sobre P1 apontando para a esquerda e sobre P3 apontando para a direita; P2 com seta branca para a direita sobre (7, 1) (passagem lateral, 15.3.3), sem tapete; tapete vermelho no vão (6, 8), abaixo do gatilho (6, 7), fora do piso desenhado. Captura aprovada pelo Diretor antes de republicar (regra de 2026-11-08).
  - **C21 (Cozinha e Lavanderia):** seta branca sobre P7 apontando para a esquerda; nenhum outro indicador.
  - **C22 (Hall):** P8 sem indicador; elevador e bilhete como em 14.10.2.
  - **C23 (teclado):** andar sobre o tapete não é possível (ele está no vão, não andável); andar sobre o vão de P7 ou P8 não; A na frente da seta, do tapete ou de P1 e P3 não faz nada além do que o objeto já faz (passagem, diálogo "Essa porta está fechada." ou nada).
  - **C24 (regra):** nenhum indicador aparece na última linha de tiles da tela (14.8), e nenhum indicador é desenhado sobre o bilhete, a árvore, o interruptor ou o tile de chão da alcova (7, 2).

### 14.11 Condução automática após a conquista (item 036, 2026-11-08)

Origem: ideia do Diretor para dar fluidez, no lugar do teleporte ao lado da árvore depois da conquista 1 (`decisions.md`, 2026-11-08). Substitui o nascimento de `nascimentoPorFase` nessa etapa (14.11.4). Status: regras do Diretor fechadas; as duas perguntas da 14.11.5 foram respondidas pelo Diretor em 2026-11-08 (`decisions.md`) e estão incorporadas abaixo; as demais decisões do Produto valem.

**14.11.1 Fluxo**
1. A no interruptor: "Clique!" e as luzes acendem com fade (14.1, sem mudança).
2. Tela de conquista 1 (14.1): "Parabéns, você conseguiu acender as luzes." e "Continuar". É a tela de sucesso; não há tela nova.
3. Ao continuar, começa a condução de onde o jogador está até o destino da fase. O sobrinho anda sozinho (14.11.3).
4. Ao chegar, para no destino, de frente para a árvore. Nenhuma tecla do jogador é necessária para isso.
5. **Diálogo da árvore começa sozinho** (14.9.3), na chegada, sem tecla (item 047). O pisca começa junto. O jogo força esta interação; o jogador não precisa apertar A para ela acontecer.
6. Ao fechar o diálogo (Z na última página, ou X), o jogador recebe o controle e fica livre para explorar (14.7). Não precisa voltar à árvore nem interagir com ela de novo. *[Histórico, antes de 2026-11-08 (047): o diálogo só vinha com A, depois de chegar.]*

**14.11.2 Regras do Diretor (2026-11-08; não mudam)**
- O trajeto não pode ser pulado. Nenhuma tecla, clique ou ação o encurta.
- Trajeto com mais de 10 tiles: velocidade 2×. Até 10 tiles: velocidade normal.
- O diálogo começa só depois da chegada.
- A condução pode atravessar portas e subáreas.
- Botões não fazem nada durante o trajeto. A cutscene não é cancelada.
- **Diálogo automático da árvore (item 047, decidido pelo Diretor em 2026-11-08):** ao chegar, o diálogo da árvore começa sozinho. O jogo força essa interação; o jogador não precisa apertar A. Terminado o diálogo, o jogador fica livre e não precisa interagir de novo com a árvore.

**14.11.3 Decisões do Produto (2026-11-08)**
- **Velocidade normal:** a velocidade de andar do próprio sobrinho, a mesma do jogador. Não cria valor novo. **2×:** quando o trajeto, do início ao fim, passa de 10 tiles, contados pelos passos da rota (não pela linha reta). A escolha é feita uma vez, antes de começar, e vale para o trajeto inteiro, sem trocar no meio (14.11.5, decidido pelo Diretor).
- **Barra durante o trajeto:** vazia. Nenhuma tecla e nenhum texto, nem "Aguarde...". Ao abrir o diálogo, a barra volta à do diálogo ("Z: avançar  X: fechar"). Exceção à regra "toda tela tem barra" (14.8).
- **Portas no trajeto:** o mesmo fade de 14.10.5 (0,25 s escurecendo, troca de área, 0,25 s clareando; cor `#0b1030`). Durante o fade, o sobrinho não anda e o A não age. Depois, o trajeto continua a partir do ponto de nascimento da área de destino (14.10.5). Sem corte seco.
- **Câmera:** fixa por subárea, sem rolagem (14.2). Trocar de subárea só acontece pela porta.
- **Destino por fase (regra por dado):** cada fase tem seu destino no arquivo da missão em `content/missions/`: área, ponto de chegada e direção de chegada. Nenhum destino fica escrito no código. Na fase das luzes, o destino é 1 tile acima da árvore, de frente para ela, com direção de chegada `baixo`: tile (3, 7) na planta girada (14.12.3). Antes da rotação, era 1 tile à esquerda da árvore (14.10.2, item 6). Outras fases entram só com dados, sem mudar o motor. O campo já está no conteúdo com o nome `conducao` (14.11.4). O nome final é do Especialista (ADR-002 e ADR-004).
- **Interrupções:** nenhuma. Não há pausa, nem cancelamento por tecla, Esc ou troca de cômodo, nem diálogo no meio do caminho. Se o trajeto travar, é bug, não comportamento previsto.
- **Rota:** a mesma colisão que o jogador usa (ADR-003 e ADR-004). Caminho mais curto em 4 direções, sem diagonal, sobre tiles livres. Nunca atravessa parede, móvel, objeto, porta fechada (P1 a P3) nem o vão entre os dois gatilhos de uma porta (14.10.5). Pode usar passagem aberta (P7) e porta já aberta (P8). O mesmo início e o mesmo destino dão sempre a mesma rota. Não há rota de reserva: destino sem rota é conteúdo inválido (validação do ADR-004, seção 8).
- **Movimento:** o sobrinho anda de tile em tile, com a animação de caminhada que já existe para o jogador. Ao chegar, a direção é a do destino.
- **Uma vez por partida (revisto em 047):** a condução da fase e o diálogo automático da árvore acontecem uma vez por partida. Voltar ao Hall ou à Sala depois não repete a condução nem o diálogo automático. Nova partida (título, "Começar") repete os dois. Examinar a árvore (A) não é "uma vez": é repetível (14.9.3), e não dispara condução nem diálogo automático.
- **Pisca da árvore (14.9.3):** começa quando o diálogo aparece, não durante o trajeto.

**14.11.4 O que muda em relação ao nascimentoPorFase (14.10)**

| Item | Antes (2026-11-07, histórico) | Depois (2026-11-08) |
|---|---|---|
| Ponto depois da conquista 1 | Teleporte: nasce 1 tile à esquerda da árvore (14.10.2, item 6; 14.1; 14.3; 14.7) | **Muda:** condução até o mesmo ponto |
| Origem do ponto | Dado `nascimentoPorFase.luzes` (`mapa: sala`, `spawn: ao-lado-da-arvore`) | **Muda de função:** vira destino da condução, lido do dado da fase. O ponto é o mesmo |
| Gatilho do diálogo e do pisca da árvore (14.9.3) | Ao nascer | **Muda:** ao chegar, sozinho, sem tecla (item 047) |
| Barra depois da conquista | "Setas: andar  Z: examinar", ao nascer | **Muda:** barra vazia durante o trajeto, sem teclas nem texto (14.8, exceção; decidido pelo Diretor, 2026-11-08) |
| Nascimento ao atravessar porta (14.10.5, P7 e P8) | Ponto fixo na frente da porta | **Não muda.** Não é `nascimentoPorFase` |
| Conquista 1, "Continuar", luzes, árvore, "Está tudo escuro!" | Como em 14.1 e 14.10.2 | **Não muda** |
| Sem save (14.6) | Nada é gravado | **Não muda** |

- Status no conteúdo (conferido em 2026-11-08): `content/missions/marco1.json` já tem `conducao.luzes` (mapa `sala`, x 3, y 7, direção `baixo`) e não tem mais `nascimentoPorFase`. Os ADR-002 e ADR-004 que citam o campo antigo são do Especialista; este Produto não os altera.
- Textos anteriores ficaram nas seções 14.1, 14.3, 14.7, 14.9.3, 14.10.2 e 14.10.8 (C8), marcados "[Muda com 036]" e com o histórico.

**14.11.5 Perguntas ao Diretor**

**Respostas do Diretor (2026-11-08, `decisions.md`):**
1. **Barra durante o trajeto:** nenhum botão e nenhum texto de teclas. A barra fica vazia (14.8, exceção). Não há "Aguarde...".
2. **2×:** vale para o trajeto inteiro, decidido ao começar, quando o trajeto (início ao fim) passa de 10 tiles.

**14.11.6 Casos de QA (036)**

Com os 4 sobrinhos, no teclado, salvo indicação:
- **D1 (não pula):** depois de "Continuar", sem tocar em nada, o sobrinho chega sozinho ao destino. Durante o trajeto, setas, WASD, Z, X, Enter e Esc não mudam nada: sem pausa, sem diálogo, sem parada.
- **D2 (velocidade):** trajeto (início ao fim) de até 10 tiles anda na velocidade de andar do jogador; trajeto de mais de 10 tiles anda em 2× do início ao fim, sem trocar no meio. Medir com destino de teste de 10 tiles e de 11 tiles, e medir a rota real da fase das luzes (registrar no relatório).
- **D3 (rota):** nenhuma rota passa por parede, móvel, objeto, porta P1 a P3 ou vão de porta. Com destino de teste em outra subárea, a rota usa a passagem aberta. Referência: `qa/scripts/lib-rota.mjs`.
- **D4 (chegada):** o sobrinho para no ponto exato, de frente para a árvore. O diálogo (14.9.3) aparece sozinho depois de parar, sem tecla (047); depois dele, o controle volta.
- **D11 (diálogo automático, 047):** depois de "Continuar", sem tocar em nada, o diálogo da árvore aparece ao chegar, nos 4 sobrinhos. Nos primeiros 200 ms do diálogo, Z, X, Enter e Esc não avançam nem fecham. Duas páginas, Z avança, X fecha, sem avanço por tempo.
- **D12 (fim livre, 047):** ao fechar o diálogo, o controle volta na hora. O jogador anda e examina sem nenhuma interação extra com a árvore. Depois, A na frente da árvore mostra "A árvore ainda está desmontada. Ela precisa de 3 partes." e repete a cada A, sem disparar o diálogo automático de novo.
- **D13 (pisca, 047):** o pisca começa junto com o diálogo automático, não durante o trajeto, e para no primeiro A na frente da árvore (não no fim do diálogo).
- **D14 (uma vez, 047):** depois da condução e do diálogo automático, voltar ao Hall e à Sala não repete nenhum dos dois. Nova partida repete (D9).
- **D5 (barra):** durante o trajeto, a barra está vazia: nenhuma tecla e nenhum texto. No diálogo, volta "Z: avançar  X: fechar".
- **D6 (porta no trajeto):** com destino de teste em outra subárea, a porta no trajeto faz fade de cerca de 0,5 s na cor `#0b1030`; A e teclas não respondem no fade; o sobrinho nasce no ponto de chegada da área nova (14.10.5) e o trajeto continua até o destino.
- **D7 (dado):** trocar o destino no arquivo da missão (ex.: 1 tile para a direita) muda onde o sobrinho para, sem mexer no código.
- **D8 (validação):** destino sem rota (ex.: ponto dentro de parede, ou só alcançável por porta fechada) é recusado pelo `validarConteudo` com erro, não aviso (teste automatizado).
- **D9 (uma vez por partida):** depois da condução, voltar ao Hall e à Sala não repete a condução nem o diálogo. Nova partida repete os dois.
- **D10 (regressão):** "Clique!", o fade das luzes, a tela de conquista e "Continuar" acontecem como em 14.1, sem mudança.

### 14.12 Rotação da planta (item 045, decidido pelo Diretor, 2026-11-08)

Origem: retorno do PT2 ("vai precisar rotacionar mesmo! será melhor"; `decisions.md`, 2026-11-08, "Rotação da planta CONFIRMADA"). Esta seção é o escopo do item 045 e dos ajustes que dependem dele. Os números são da conta mecânica sobre `content/maps/casa-real/*.json`. A rotação é aplicada pelo conversor. A cópia de trabalho do TMX (`maps/casa-real/our-home-jogo.tmx`) fica na orientação atual (decisão do Diretor, 2026-11-08).

**14.12.1 Regra**
- A planta de **todas** as subáreas gira **90° para a direita** (sentido horário, vista de cima): o que está em cima vai para a direita; a direita vai para baixo; embaixo vai para a esquerda; a esquerda vai para cima. Vale também para as áreas fechadas, para as versões seguintes.
- A tela não gira: continua deitada, 15×11 tiles de 32 px (perfil HD), câmera fixa por subárea, sem rolagem (ADR-004). A barra, os textos, os botões e as setas não giram.
- As direções nos dados (`spawn`, `spawnDestino`, `conducao`) são as da tela, já depois da rotação. Ex.: onde era "cima", passa a ser "direita".
- Rotação não muda distâncias: a rota entre dois pontos tem o mesmo número de passos antes e depois.
- Fórmula de conversão (conversor): numa subárea de `largura × altura`, a tile (x, y) vai para (altura − 1 − y, x). A nova subárea tem `altura × largura`.

**14.12.2 Tamanho e posição das subáreas**

| Subárea | Hoje (colunas × linhas) | Depois da rotação | Cabe em 15×11 | Posição na tela (ADR-004, seção 2) |
|---|---|---|---|---|
| Sala | 10 × 11 | 11 × 10 | sim | (2, 0): 2 colunas de folga de cada lado; linha 10, sob a barra, vazia |
| Hall (com Elevador) | 3 × 4 | 4 × 3 | sim | (5, 4), centrada |
| Cozinha e Lavanderia | 7 × 6 | 6 × 7 | sim | (4, 2), centrada |
| Escritório | 6 × 8 | 8 × 6 | sim | fechado no Marco 1; aberto no Marco 2 pela P3 (15.3.4, item 6) |
| Quarto | 8 × 5 | 5 × 8 | sim | fechado no Marco 1; aberto no Marco 2 pela P2 (15.3.4, item 9) |
| Suíte | 5 × 6 | 6 × 5 | sim | fechada no Marco 1 |
| Banheiro do casal | 3 × 3 | 3 × 3 | sim | fechada no Marco 1 |
| Banheiro do Escritório | 2 × 2 | 2 × 2 | sim | fechada no Marco 1 |

- Todas as áreas cabem em 15×11 (a maior dimensão é 11). A Sala continua com 110 tiles: mesma área, mesmo tamanho real (decisão 3, 2026-11-07). *No Marco 2 (opção B), a caixa continua 11×10, e a Sala ganha 2 tiles de chão de passagem, (7, 1) e (8, 2) (15.3.4). Contagem de chão da Sala: 73 hoje, 75 no Marco 2. A Suíte fica fechada no Marco 2 (pergunta 30 = A); a Sala não muda com ela.*
- Relações, na planta girada: a Sala fica **acima** do Hall; a Cozinha e a Lavanderia ficam **à direita** da Sala; P1, P2 e P3 ficam na **parede de cima** da Sala; P7 fica na **parede da direita** da Sala; P8 fica entre a **parede de baixo** da Sala e a **parede de cima** do Hall.

**14.12.3 Pontos do Marco 1 depois da rotação**

Coordenadas locais, em tiles. "Hoje" vem de `content/maps/casa-real/*.json`. "Depois" vem da fórmula de 14.12.1. A Arte confirma no TMX.

| Item | Hoje | Depois da rotação | Observação |
|---|---|---|---|
| Sala: gatilho e spawn de chegada da P8 | gatilho (7, 4); spawn (6, 4), esquerda | gatilho (6, 7); spawn (6, 6), cima | Entrada pela parede de baixo da Sala; nasce 1 tile dentro, olhando para cima (14.10.5) |
| Hall: gatilho e spawn de chegada da P8 | gatilho (0, 0); spawn (1, 0), direita | gatilho (3, 0); spawn (3, 1), baixo | Gatilho na parede de cima do Hall, no canto direito |
| Sala: gatilho e spawn de chegada da P7 | gatilho (5, 0); spawn (5, 1), baixo | gatilho (10, 5); spawn (9, 5), esquerda | Passagem na parede da direita (041) |
| Cozinha e Lavanderia: gatilho e spawn da P7 | gatilho (0, 5); spawn (0, 4), cima | gatilho (0, 0); spawn (1, 0), direita | |
| Hall: spawn `elevador` (introdução) | (1, 3), cima | (0, 1), direita | Elevador na coluna da esquerda do Hall; nasce olhando para o Hall |
| Hall: bilhete | (0, 1), piso | (2, 0), parede, à esquerda da P8, com vizinho livre embaixo | Item 040 (14.10.9) |
| Sala: portas fechadas P1, P2 e P3 | (2, 4), (1, 3), (2, 2) | (6, 2), (7, 1), (8, 2) | Parede de cima da Sala (P1: item 044) |
| Sala: árvore | (8, 7) | (3, 8) | 4ª coluna contando da esquerda; 2ª linha contando de baixo |
| Sala: destino da condução `luzes` | (7, 7), direita | (3, 7), baixo | 1 tile acima da árvore, de frente para ela (14.11) |
| Sala: interruptor | (2, 5) | (5, 3), no conteúdo; a Arte confere com o print (042) | Print recebido (14.12.5, pergunta 3). Distância ao ponto de entrada (6, 6): 3,16 tiles, fora do círculo de 3 (14.3) |

- **Atenção (Arte):** na planta atual, o gatilho da P8 na Sala não encosta na borda da Sala (vão em (8, 4), borda em x = 9). A rotação mantém essa distância: o gatilho fica em (6, 7) e a borda em y = 9. Antes de converter, a Arte confirma no TMX que a porta aparece na parede (043) e que o vão não aparece como buraco no chão (14.10.9).

**14.12.4 O que muda em outros lugares**
- **Sprites:** sobrinhos, Nick e árvore não giram (ficam em pé na tela). Móveis, paredes e portas giram com a planta, se o Diretor confirmar (14.12.5, pergunta 4).
- **Interruptor:** o local novo (042) está no conteúdo em (5, 3). A Arte confere no TMX de trabalho, a partir do print `assets/referencia/interruptor-pt2-planta-atual.png` (planta antes de girar).
- **Condução:** `conducao.luzes` em `content/missions/marco1.json` já está com a tile girada: (3, 7), direção `baixo` (14.12.3). O ponto de partida da condução é o tile em frente ao interruptor. Com o interruptor novo, a rota pode mudar de tamanho; se passar de 10 passos, vale a regra de 2× (14.11.3), já aprovada pelo Diretor. Isso é consequência, não decisão nova.
- **Linha da barra:** a Sala tem 10 linhas, e a linha 10 da tela (sob a barra) fica vazia. O bloqueio dessa linha (BUG-M12-02) não é mais necessário (Diretor, 2026-11-08). A antiga linha de baixo da Sala vira a coluna da esquerda, e fica **andável** (decisão do Diretor, 2026-11-08). A regra da linha da barra (ADR-004, seção 8, item 6) continua valendo como guarda para subáreas de 11 linhas.
- **P8 do código:** continua a única porta com código, Hall ↔ Sala. Não muda de função; muda só de lado (14.12.2).
- **Início:** o jogador nasce no Elevador, na coluna da esquerda do Hall, olhando para a direita. A regra não muda: nasce olhando para o Hall.
- **Controles:** setas e WASD continuam na tela. "Direita" anda para a direita da tela, em todas as áreas.

**14.12.5 Perguntas ao Diretor (itens 045 e 042)**

**Respondidas pelo Diretor em 2026-11-08** (`decisions.md`, "Respostas do Diretor ao Produto" e "Respostas ao Especialista"): 1, sim, sentido horário; 2, sim, Sala 11×10 sem bloqueio na última linha, e a coluna da esquerda fica andável; 3, planta atual (print `assets/referencia/interruptor-pt2-planta-atual.png`); 4, sim, móveis, paredes e portas giram como imagem, sobrinhos, Nick e árvore ficam em pé. As perguntas ficam abaixo para registro.
1. **Sentido:** "girar 90° para a direita" é o sentido horário, em que o topo vai para a direita? **Sugestão: sim.**
2. **Linha de baixo da Sala:** a Sala gira para 11 colunas × 10 linhas, no topo da tela, com a linha de baixo vazia, sob a barra. Isso dispensa o bloqueio da linha 10 aprovado em 2026-11-08 (BUG-M12-02). **Sugestão: sim.**
3. **Print do interruptor:** o print foi feito na planta atual (antes de girar) ou na planta já girada? Ele não chegou ao Orquestrador. **Sugestão: planta atual; o Produto converte a posição para a planta girada.**
4. **Móveis e paredes:** móveis, paredes e portas giram como imagem (rotação de 90°, sem redesenho), junto com a planta? Sobrinhos, Nick e árvore ficam em pé. **Sugestão: sim; redesenho só se a rotação ficar ruim, e o Diretor vê no preview.**

**14.12.6 Critérios de QA (item 045)**
- **R1:** a rotação é feita pelo conversor: `content/` e o golden saem com as 8 subáreas giradas 90° para a direita. O TMX de trabalho (`maps/casa-real/our-home-jogo.tmx`) **não é girado**: fica na orientação atual (decisão do Diretor, 2026-11-08). O original `our-home.tmx` fica igual (diff).
- **R2:** o conversor gera `content/` com a planta girada, e o golden é revisado pelo Diretor.
- **R3:** `validarConteudo` passa; cada subárea cabe em 15×11; a Sala tem 11×10 e 110 tiles.
- **R4:** cada área aparece centralizada conforme 14.12.2, sem rolagem e sem corte.
- **R5:** os pontos de 14.12.3 batem com o conteúdo gerado (teste de coordenadas).
- **R6:** `conducao.luzes` aponta para a tile girada da árvore, com direção "baixo" (teste). A rota até ela tem o mesmo número de passos que na planta atual, para o mesmo par de pontos (teste de domínio).
- **R7:** setas e WASD: "direita" anda para a direita da tela, em todas as áreas, com os 4 sobrinhos.
- **R8:** sobrinhos e árvore não giram (captura). Móveis e paredes giram conforme a pergunta 4.
- **R9:** casos C1 a C19 e D1 a D10 repetidos com os 4 sobrinhos, no teclado. O QA ajusta os roteiros de coordenadas (`qa/scripts`, `lib-rota`) antes de rodar.
- **R10:** o Diretor confere a captura da planta girada antes de qualquer artifact (regra de 2026-11-08, após o incidente da Version 3).

---

## 15. Especificação do Marco 2 (peças da árvore)

Detalha o Marco 2 (seção 13, item 2). Origem: o Diretor liberou o Marco 2 depois de aprovar o Marco 1 (v0.5.0), em 2026-11-08 (`decisions.md`). Versão do jogo ao fim do marco: **0.6.0**. Textos entre aspas são os textos propostos para a v0.6.0 e vão para `content/texts/pt-BR.json` (chaves na 15.8). **[Provisório]** = aguarda o Diretor ou a Arte, sem bloquear o escopo. **[Pendente]** = pergunta aberta (seção 12: 26, respondida em parte, e 30). As decisões 27 a 29 estão fechadas. As decisões 18 a 25 estão fechadas (Diretor, 2026-11-08); quando um item depende de pendência, o padrão enquanto ela não é respondida está escrito no próprio item. Nenhuma decisão de visão do Marco 2 está tomada sem o Diretor.

Tudo o que o Marco 1 fixou (seções 4, 5, 8 e 14) continua valendo, salvo o que esta seção muda de forma explícita: a árvore (15.4) e o que acontece depois de cada peça (15.6), que segue a condução da 14.11.

### 15.1 Escopo e fluxo

| Etapa | No Marco 2 | Onde está |
|---|---|---|
| Introdução, porta, luzes, conquista 1 e condução até a árvore | Como no Marco 1 | 14.1, 14.9.1, 14.10.2, 14.11 |
| Parte 1 | Nova. Visível na Sala depois que a casa acende | 15.2, 15.5, 15.6 |
| Parte 2 | Nova. Escondida até a parte 1 ser encaixada; aviso "ainda não" antes disso | 15.2.3, 15.2.7 |
| Parte 3 | Nova. Escondida até a parte 2 ser encaixada; aviso "ainda não" antes disso | 15.2.3, 15.2.7 |
| Áreas (opção B) | Quarto e Escritório abrem; a Suíte fica fechada no Marco 2 (pergunta 30 = A); banheiros fechados | 15.3 |
| Enfeites e créditos | Fora do Marco 2 (Marco 4). Depois da parte 3 o jogo fica livre, sem objetivo novo (15.6.8) | 13 |

**Entra no Marco 2:** as 3 peças, as 3 telas de conquista, os estados 1 a 3 da árvore, a condução e o encaixe depois de cada peça, o diálogo de chegada, o aviso "ainda não" (15.2.7), a barra de controles das telas novas, as áreas da opção B (15.3) e os indicadores das passagens novas (15.3.3).

**Não entra:** Nick (acordar, seguir, farejar: Marco 3); tela de dica H (Marco 3); caixa de enfeite e créditos (Marco 4); toque e aviso de rotação (Marco 5); áudio e polimento (Marco 6); sorteio das peças (fora da v1, seção 11).

**Ordem (GDD 3):** a parte 2 só existe depois da parte 1, e a parte 3 depois da parte 2. Isso não exige que o jogador saiba a regra: a peça seguinte simplesmente ainda não está lá (15.2.3).

**Sem Nick no Marco 2:** a tecla B não faz nada na exploração (barra "Setas: andar  Z: examinar", 14.8). Não há seta de farejar nem Nick na casa. **Sem dica (H)** no Marco 2 (pergunta 25, decidida).

### 15.2 As três peças

**15.2.1 O que é (decidido, pergunta 20, 2026-11-08).** Cada peça é uma das três camadas da árvore: a parte 1 é a base (tronco com suporte), a parte 2 é o meio (ramos) e a parte 3 é o topo (ponta). No chão, cada peça é uma miniatura da própria camada, de 1 tile (32×32 px no perfil HD), com brilho dourado. Encaixada, a camada aparece na árvore (15.4).

**15.2.2 Onde ficam (decidido, pergunta 19, 2026-11-08; parte 3 na Lavanderia confirmada pela pergunta 27, 2026-11-08).** Coordenadas locais à subárea, na planta girada (14.12.1). A Arte confirma os tiles no TMX de trabalho.

| Peça | Área | Tile (x, y) | Aparece | Observação |
|---|---|---|---|---|
| Parte 1 (base) | Sala | (1, 4) | Quando a casa acende (depois das luzes) | Lado esquerdo, perto do Sofá. Livres ao redor: (0, 4), (2, 4), (1, 3), (1, 5) |
| Parte 2 (meio) | Cozinha e Lavanderia, parte da Cozinha | (4, 1) | Depois que a parte 1 está encaixada | Perto da Pia (5, 1). Livres ao redor: (3, 1), (4, 2) |
| Parte 3 (topo) | Lavanderia (parte de baixo, sem móvel; cômodo próprio, pergunta 27) | (3, 5) | Depois que a parte 2 está encaixada | Livres ao redor: (3, 4), (4, 5). Peça, não objeto examinável. Cumpre a regra 4.4 com a parte 2 na Cozinha (4, 1). Mesma subárea da Cozinha no mapa (interpretação a confirmar, 12, item 27) |

- Nenhuma peça fica no Hall (é fora da casa), no Elevador, em gatilho de porta, no vão, no spawn, em tile de chegada gerado por porta, no interruptor, na árvore, na última linha da tela (14.8) ou sobre móvel.
- Posições fixas na v1 (seção 11: sorteio fica para versão futura).
- **Parte 3 fixa na Lavanderia, (3, 5)** (pergunta 27, decidida em 2026-11-08). A opção de Quarto ou Escritório para a parte 3 cai.
- **Regra 4.4 cumprida:** parte 1 na Sala, parte 2 na Cozinha (4, 1), parte 3 na Lavanderia (3, 5).

**15.2.3 Visibilidade.**
- **Visível:** desenhada, com brilho, e bloqueia o tile (com vizinho livre, 15.2.5). Pode ser pega com A.
- **Escondida:** não desenhada e sem brilho. O tile é chão livre: o sobrinho anda sobre ele. Tem um gatilho de aviso (15.2.7), sem desenho. Não existe parede invisível.
- **Encaixada:** a camada aparece na árvore (15.4). O tile volta a chão livre, sem gatilho. A peça não volta ao chão.
- A parte 1 fica visível quando a casa acende. A parte 2 fica escondida até a parte 1 ser encaixada, e a parte 3 até a parte 2 ser encaixada (decisão 21, 2026-11-08). Nova partida recomeça assim (14.6).
- O tile muda de chão livre para bloqueado (quando a peça aparece) só no encaixe anterior, que acontece com o sobrinho na árvore. Nunca com o sobrinho sobre o tile (teste de 052).

**15.2.4 Brilho.** Halo dourado (`#f4d35e`), com 4 px de margem em volta do sprite, opacidade de 40% com pulso lento de 2 s entre 40% e 70%. Precisa ser visível a 3 tiles de distância, sem zoom, na tela 480×352. Sem seta, sem texto e sem tremor. O pisca de 14.9.3 é só da árvore. A Arte escolhe o tom dentro da paleta. Se o PT2 disser que a peça não brilha o suficiente, o ajuste é de arte (mais halo), não de regra.

**15.2.5 Como o jogador pega (A).** Vale a regra de 14.9.2: A na frente, ou com a peça encostada (casos Q1 a Q5). Diagonal não aciona. Tipo de objeto `peca`: tile bloqueado com vizinho livre, como `examinavel`, para o jogador encarar a peça e não pisar nela. A peça não é examinável: A não mostra texto e vai direto à conquista (15.5). Peça escondida: A mostra o aviso da 15.2.7, e não pega nada.

**15.2.6 Sem inventário.** A peça não vai para nenhuma lista na tela. Não há HUD de peças (seção 11: sem inventário complexo).

**15.2.7 Peça fora de ordem: aviso "ainda não" (decidido pelo Diretor, 2026-11-08; substitui "sem aviso").**
- **Quando:** só quando o jogador dá A numa peça escondida (14.9.2: na frente ou encostado). Uma peça escondida não é desenhada, então o aviso acontece por tentativa no tile certo. Uma peça visível nunca está fora de ordem: se aparece, pega-se (15.2.5). Não existe peça "visível mas bloqueada".
- **Onde fica o gatilho:** no próprio tile da peça escondida, como chão livre e sem desenho. Por isso o aviso revela o tile da peça seguinte a quem bate nele. Sugestão do Produto, pendente de confirmação (pergunta 28).
- **Antes das luzes,** nenhuma peça responde (como a árvore, 14.10.2). O aviso só vale depois que a casa acende.
- **Textos (exatos; chaves em 15.8).** Duas páginas, sempre nesta ordem. A página 1 é "Ainda não!" em todos os casos:
  - Peça 2, com a parte 1 não encaixada. Página 2: "Essa é a parte do meio. Encontre a base antes."
  - Peça 3, com a parte 1 não encaixada. Página 2: "Essa é a parte de cima. Encontre as outras antes."
  - Peça 3, com a parte 2 não encaixada (a parte 1 já encaixada). Página 2: "Essa é a parte de cima. Encontre a do meio antes."
- **Não faz:** não pega nada, não muda estado, não conta e não tem penalidade. Cada A repete o aviso, quantas vezes for.
- **Diálogo:** Z avança, X fecha, barra "Z: avançar  X: fechar" (14.8). Entrada bloqueada de 200 ms, como nos outros diálogos. Sem tempo automático.
- **Peça 1:** nunca tem aviso (é sempre a primeira).

### 15.3 Áreas e portas no Marco 2

**15.3.1 Decisão (pergunta 18, decidida pelo Diretor em 2026-11-08): opção B.** Abrem o Quarto (por P2) e o Escritório (por P3). A Suíte Casal (por P1) fica fechada no Marco 2 (pergunta 30 = A). Os banheiros continuam fechados. A opção A (áreas do Marco 1) sai do plano.
- **Suíte (pergunta 30 = A, Diretor, 2026-11-08): fechada no Marco 2.** A Suíte abre pela P1 numa versão posterior, com a planta ajustada. O Produto verificou que 1 tile novo não fecha a geometria com P1 em (6, 2) (15.3.4, item 8). A P1 segue porta fechada, com seta para a esquerda, como no Marco 1, e a Suíte não entra em `missions[].maps`. O resto da seção 15 vale igual.

**15.3.2 Áreas do Marco 2.**

| Área | Estado | Como se entra | O que tem |
|---|---|---|---|
| Hall (com Elevador), Sala, Cozinha e Lavanderia | Como no Marco 1 (14.10.1) | — | O que tem no Marco 1, mais as peças (15.2) |
| Quarto | Aberto | Só pela P2, passagem à direita de (7, 1) na Sala (15.3.3). Chegada de entrada em (0, 6) do Quarto, olhando para cima (15.3.4, item 9) | Paredes, piso e os 4 tiles novos (gatilho, chegada e corredor). Sem móvel nomeado na planta. Porta fechada P4 para o Banheiro Casal (texto de 14.10.3). Sem peça (15.2.2) |
| Escritório | Aberto | Só pela P3, passagem na face direita da alcova (15.3.3) | Cama e Mesa (planta; só desenho). Porta fechada P6 para o Banheiro do Escritório. Sem peça (15.2.2) |
| Suíte Casal | Fechada no Marco 2 (pergunta 30 = A) | Numa versão posterior: só pela P1 (15.3.3), com geometria a ajustar | Cama e Armário (planta; só desenho). Porta fechada P5 para o Banheiro Casal (só quando a Suíte abrir) |
| Banheiro Casal e Banheiro do Escritório | Fechados | Só por P4, P5 e P6, que ficam fechadas | Pia do Banheiro Casal (planta), inacessível |

- **O que o jogador encontra nos cômodos novos (Produto, 2026-11-08):**
  - **Quarto:** paredes, piso, a passagem P2 (com seta para a esquerda sobre o gatilho, sem tapete) e a porta fechada P4 (texto de 14.10.3). Nenhum móvel nomeado na planta.
  - **Escritório:** Cama e Mesa (só desenho e bloqueio); porta fechada P6.
  - **Suíte Casal (fechada no Marco 2, pergunta 30 = A):** Cama e Armário (só desenho e bloqueio); porta fechada P5.
  - **Nos três:** sem NPC, sem peça, sem brilho, sem objeto examinável e sem texto novo (15.8). A ação A nos móveis não mostra nada, como no Sofá.
- **Móveis novos** (Cama, Mesa, Armário, já nomeados na planta): só desenho e bloqueio. A não reage, como o Sofá e a Estante na Sala (padrão do Produto; texto de exame de móvel fica como ideia futura). Nomes de móvel e de cômodo são rótulos da planta, não texto do jogo (14.10.6).
- **Sem NPC e sem Nick** nas áreas novas (Nick é Marco 3).
- **Sala:** a caixa continua 11×10. O chão ganha 2 tiles de passagem, (7, 1) e (8, 2), e passa de 73 para 75 tiles de chão (caixa de 110 tiles, como antes). Nenhum móvel, nome de cômodo ou tamanho muda.

**15.3.3 Portas e passagens na opção B.** Coordenadas na contagem da Sala (planta girada). As coordenadas do Quarto e do Escritório são da Arte, que as converte para a contagem própria de cada área.

| Porta | Onde | Estado no Marco 2 | Saída | Indicador (14.10.10) |
|---|---|---|---|---|
| P2 | Sala, gatilho (7, 1): chão novo; vão (8, 1), escuro (sem piso, não andável) | Passagem | direita | seta para a direita sobre (7, 1) |
| P2 | Quarto (coordenadas locais): gatilho (0, 7); chegada (0, 6), olhando para cima | Passagem | esquerda | seta para a esquerda sobre (0, 7); sem tapete |
| P3 | Sala, (8, 2): chão novo, face direita da alcova | Passagem | direita | seta para a direita sobre (8, 2) |
| P3 | Escritório: gatilho em (10, 2); vão em (9, 2) | Passagem | esquerda | seta para a esquerda sobre o gatilho |
| P1 | Sala, (6, 2) | Porta fechada, texto de 14.10.3, enquanto a Suíte estiver fechada (pergunta 30 = A) | esquerda | seta para a esquerda (sem mudança) |
| P4 | Quarto, parede do lado do Banheiro Casal | Porta fechada | conforme o lado | seta, se lateral; nenhum, se sai para cima |
| P6 | Escritório, parede do lado do Banheiro do Escritório | Porta fechada | idem | idem |
| P5 | Suíte, parede do lado do Banheiro Casal (posição no TMX, Arte) | Porta fechada (`portaFechada`, texto de 14.10.3); entra no conteúdo só quando a Suíte abrir | conforme o lado: lateral com seta; para cima, nada (14.10.10) | idem |
| P7 | Sala (10, 5) e Cozinha e Lavanderia (0, 0) | Passagem (sem mudança) | direita (Sala); esquerda (Cozinha) | seta sobre o gatilho (sem mudança) |
| P8 | Sala (6, 7) e Hall (3, 0) | Porta com código (sem mudança) | baixo (Sala) | tapete no vão (6, 8) (sem mudança); nada no Hall |

- **Vão de 1 tile vazio em cada par, nunca andável** (ADR-004, seção 3; 14.10.5).
- **Chegadas (Diretor, 2026-11-08: "o sobrinho cai no início do cômodo").** Cada porta aberta tem, em cada lado, um tile e uma direção de chegada. O tile é explícito: declarado no TMX pela Arte e no contrato pelo Especialista (ADR-004, seção 3). O conversor valida que ele é piso do próprio cômodo, não encosta em piso de outra área e está dentro da caixa. Valores: P2 traz para a Sala em (7, 2), olhando para baixo (é o mesmo tile de chegada da P3; a direção é a da P2), e para o Quarto em (0, 6) local, olhando para cima (15.3.4, item 9). P3 traz para a Sala em (7, 2) e para o Escritório em (11, 2), que tem de ser chão do Escritório (conferir, 15.3.4, item 9). A direção de chegada é a de dentro da área. A chegada da P3 na Sala fica de frente para a P1, fechada; é o efeito da regra, e o Diretor confirma na captura.
- **P2 nos dois lados (14.10.10):** do lado da Sala, a saída é para a direita: seta para a direita sobre (7, 1). Do lado do Quarto, a saída é para a esquerda: seta para a esquerda sobre (0, 7). Nenhum tapete. A saída é declarada no conteúdo (`porta.saida`), e não deduzida da chegada: a P2 é entrada por baixo na Sala e sai pela direita (`docs/mapa-casa-real.md`, 8.4). **P1:** seta para a esquerda, como em 14.10.10, com porta fechada ou passagem.
- **Passagens com desenho de vão aberto** (14.10.9, item 041). O vão de 1 tile não tem desenho de chão.
- **Portas nas arestas** (14.10.9, regra de arestas, pergunta 26): as portas fechadas ficam na aresta entre o chão de dentro e o vão. P2 e P3, abertas, são passagens com desenho de vão aberto (041), sem faixa de porta. Os indicadores (14.10.10) seguem o tile de cada porta.
- **Indicadores** (14.10.10): só desenho, estáticos, sem pisca, sem colisão. Não ficam na última linha da tela nem sobre peça, bilhete, árvore ou interruptor (C24).
- **Portas fechadas laterais** (P1, P3 quando fechada, P4, P5 e P6) recebem seta; porta que sai para cima não recebe nada (decisão 17, 2026-11-08).

**15.3.4 Geometria: o que muda no piso e os riscos.** O Produto leu o conteúdo atual (`content/maps/casa-real/`, `tools-arte/golden/casa-real/resumo.json`). A Arte desenha; o Diretor aprova a captura antes da conversão (decisão de 2026-11-08, 15.3.2).
1. **P2 (Sala ↔ Quarto), horizontal (versão de 2026-11-08).** Diretor: "não altere a área"; só acréscimo de tiles. O gatilho da Sala, (7, 1), vira chão de passagem (1 tile novo); o vão é (8, 1), sem piso; o gatilho do Quarto é (0, 7), na caixa local do Quarto. Nenhum tile do Quarto pode tocar chão da Sala, senão o conversor funde as duas áreas. A versão vertical anterior (vão em (7, 0), Quarto em (7, −1)) foi substituída. Na planta original, o vão entre as duas áreas era de 3 tiles (`docs/mapa-casa-real.md`, 1.4).
2. **P3 (Sala ↔ Escritório), factível com deslocamento.** A marca atual (8, 2) não serve como está. Se ficasse ali, a chegada da P3 na Sala cairia em (6, 2), que é a P1 (fechada e bloqueada), e a regra de chegada (ADR-004, seção 3) não acha piso livre. Por isso P3 passa a ser chão em (8, 2), com vão em (9, 2), e o Escritório começa em (10, 2). Hoje o vão é de 2 tiles.
3. **P1 (Sala ↔ Suíte), não cabe na planta atual.** O tile do outro lado de P1, (5, 2), é chão da própria Sala, e o interruptor fica em (5, 3). A alcova (7, 2) não serve: é o acesso de P2 e P3. Para abrir a Suíte, P1 precisa sair da parede da alcova, ou a Suíte precisa de outra porta. Pergunta 30 (ver item 8).
4. **Vão de 1 tile em todo par** (ADR-004, seção 3). Os cômodos são deslocados, sem mudar tamanho, nomes ou móveis.
5. **Caixa do Quarto (sem tapete).** A caixa (5×8) inclui os 4 tiles novos do Quarto: gatilho (0, 7), chegada (0, 6) e corredor (0, 5) e (0, 4). O vão (8, 1) fica fora da caixa, do lado da Sala. A P2 não tem tapete: a saída é lateral, e o indicador é a seta (14.10.10).
6. **Cabe em 15×11.** Quarto (5×8) e Escritório (8×6) cabem na tela sem rolagem (ADR-004, seção 2; 14.12.2). O Escritório fica com a cama e a mesa da planta.
7. **Escritório só entra se a P3 for ajustada.** Sem o item 2, o Escritório não tem acesso. (Com a pergunta 27 decidida, a parte 3 fica na Lavanderia; o Escritório não precisa de peça.)
8. **Suíte pela P1: por que um tile não basta (pergunta 26, análise do Produto, 2026-11-08).** *Atualizado pela resposta do Diretor (2026-11-08): P1 e P2 não mudam, e a opção A (P1 no canto) sai do plano. O tile novo do item 9 é a resposta ao ajuste; a análise abaixo mostra que, só com ele, a Suíte não fecha. A decisão agora é a pergunta 30.* Pela regra antiga (chegada G + (G − V), em linha reta, ADR-004, seção 3), a P1 em (6, 2) só tinha quatro saídas possíveis. Com a chegada declarada (059), o Especialista apontou que a Suíte exigiria cortar piso da Sala em (5, 2) (`decisions.md`, 2026-11-08). A análise segue:
   - **Esquerda** (vão (5, 2), Suíte em (4, 2)): (5, 2) e (4, 2) são chão da Sala, e a chegada da Sala cairia em (7, 2), a alcova de P2 e P3. Não dá chegada própria.
   - **Direita:** o vão seria a alcova (7, 2), que é o único acesso de P2 e P3. Não dá.
   - **Baixo** (vão (6, 3), Suíte em (6, 4)): (6, 4) é chão da Sala. Não dá.
   - **Cima** (vão (6, 1), Suíte em (6, 0), chegada da Suíte em (6, −1), chegada da Sala em (6, 3), que é o tile novo): a chegada da Suíte em (6, −1) encosta no gatilho do Quarto em (7, −1). Dois pisos de subáreas se tocam, e o conversor funde as duas (ADR-004, seção 8, item 4 e seção 2). Não dá com o Quarto vertical de então (7, −1), que foi substituído pela P2 horizontal.
   - Conclusão: com P1 em (6, 2) e P2 em (7, 1), **nenhuma das quatro saídas da P1 abre a Suíte** com 1 vão e 1 tile de chegada, sem encostar em piso da Sala nem no Quarto, com ou sem o tile novo na alcova. Isso não depende da arte: é a regra de chegada e de piso (ADR-004, seções 2 e 3). Pergunta 30.
   - **Opções para o Diretor (PERGUNTA 26, relatório do Orquestrador; superada pela resposta de 2026-11-08, ver pergunta 30):**
     - **(A) P1 muda de lugar** para o canto de cima da Sala, (1, 0): gatilho (1, 0), vão (1, −1), gatilho da Suíte (1, −2), chegada da Suíte (1, −3), chegada da Sala (1, 1), que já é chão livre. **Zero tiles novos**: a Sala continua com 75 tiles de chão. A Suíte fica acima do canto de cima-esquerda da Sala, com piso que não encosta em (0, 0) nem em (1, 0) (ou seja, nada em (0, −1) nem (1, −1)). Custa: P1 sai da alcova, o que muda o Marco 1 (já jogado no PT1 e no PT2). Chegada em (1, 1) fica a 4,47 tiles do interruptor (5, 3), e a árvore (3, 8) e a condução (3, 7) não mudam.
     - **(B) Suíte fechada no Marco 2** (padrão). Zero custo; a abertura da Suíte vai para a 1.x (ADR-004, seção 9), com a Suíte no `maps` do Marco 3 ou depois. Contraria a decisão do Diretor de 2026-11-08.
     - **(C) Mexer em P2 ou P3 também** (cascata: P2 e P3 encostam em outro gatilho se saírem da alcova). Custo alto; não recomendado.
   - **Sugestão do Produto (2026-11-08):** superada pela resposta do Diretor (P1 não muda). Ver pergunta 30, com as opções A, B e C.
   - **Fora da 26:** a regra de 3 tiles (14.3, 14.5) vale para a **entrada no escuro** (P8, (6, 6)), como diz 14.5. As chegadas de P2 e P3 em (7, 2) ficam a 2,24 tiles do interruptor. Depois das luzes isso não importa para o jogador; o ADR-004 (seção 8, item 11) lê "todo spawn", o que faria o conversor recusar P2 e P3. Pedido ao Especialista: restringir a regra 11 ao spawn de entrada (P8, e o de P7 se a Cozinha for escura na entrada). Interpretação do Produto, a confirmar.

9. **Tile novo no início de cada cômodo (decisão do Diretor, 2026-11-08).** Resposta literal: "P1 e P2 não mudam de lugar, mas a chegada em linha reta cai fora do cômodo." Ajuste literal: "Adicione 1 tile em cada um dos cômodos que isso acontece, e o sobrinho cai no início do cômodo." Regra: o tile de chegada de entrada num cômodo é o primeiro tile de chão do cômodo, a partir da porta, e precisa existir.
   - **Quarto (aplicado neste GDD, versão horizontal de 2026-11-08):** chegada da P2 em (0, 6) local, olhando para cima; gatilho em (0, 7). Os tiles novos do Quarto são (0, 7), (0, 6), (0, 5) e (0, 4): 4 tiles, e não o 1 tile da regra, porque a P2 horizontal precisa de corredor até o chão do Quarto (`docs/mapa-casa-real.md`, 8.4). A caixa do Quarto é 5×8, como em `content/maps/casa-real/quarto.json` e na 14.12.2.
   - **Escritório (conferir):** chegada da P3 em (11, 2). Se não for chão do Escritório, a Arte acrescenta o tile novo pela mesma regra. Não é decisão nova.
   - **Suíte (não fecha com 1 tile):** ver item 8 e pergunta 30.
   - **Sala:** não muda. A volta pelas passagens cai em (7, 2), que já é chão da alcova.
   - **Validação (ADR-004, Especialista):** todo tile de chegada cai em chão do próprio cômodo e não encosta em piso de outra área (E004).

**15.3.5 Rota da condução (passos medidos pelo Dev, 2026-11-08; o QA confere ao vivo).** Passos = tiles visitados pela rota + 3 da passagem (ADR-004, seção 11.2). A velocidade segue 14.11.3: até 10 passos, normal; mais de 10, 2× no trajeto inteiro. A condução não passa pelo Quarto, nem pelo Escritório, nem pela Suíte: nenhuma peça fica lá, e as rotas usam só a passagem P7.

| Peça | Tile de início (frente da peça) | Passos | Total estimado | Velocidade |
|---|---|---|---|---|
| Parte 1, Sala (1, 4) | (2, 4), (1, 5), (1, 3) ou (0, 4) | sem passagem | 4 a 6 | normal |
| Parte 2, Cozinha (4, 1) | (3, 1) ou (4, 2) | inclui a passagem P7 (3 passos) | 15 a 17 | 2× |
| Parte 3, Lavanderia (3, 5), fixa (pergunta 27) | (3, 4) ou (4, 5) | inclui a passagem P7 (3 passos) | 20 a 22 | 2× |
| ~~Parte 3, Quarto~~ e ~~Escritório~~ | removidas (pergunta 27) | — | — | — |

**15.3.6 Conteúdo (`missions[]`, ADR-002 e ADR-004, seção 9).**
- `marco1`: `maps` continua `["hall", "sala", "cozinha"]`. Sem mudança.
- `parte1`, `parte2` e `parte3`: `maps` = `["hall", "sala", "cozinha", "quarto", "escritorio"]`. `quarto` já estava na lista (opção B, sem mudança). `suite_casal` fica fora do Marco 2 (pergunta 30 = A), para não carregar uma área sem entrada; entra com a Suíte, numa versão posterior. Os banheiros não entram.
- **Câmera e condução nas áreas novas (avaliação do Produto, 2026-11-08):** nada muda na regra. A câmera continua fixa por subárea e centralizada na tela de 15×11, sem rolagem (14.2, ADR-004 seção 2). Entrar no Quarto ou na Suíte é troca de subárea pela porta, com fade de 0,5 s (14.10.5). A condução não entra nem no Quarto nem na Suíte: nenhuma peça fica lá, e as rotas de 15.3.5 passam só pela P7. Por isso não há câmera nova nem rota nova.
- `conducao.parte<N>` = `{mapa: "sala", x: 3, y: 7, direcao: "baixo"}` nas três partes. `conquistas.parte<N>` = `conquista.parte<N>`.
- Abrir uma área é dado, não motor (ADR-004, seção 9).

### 15.4 A árvore nos estados 0 a 3

- **Estados:** 0 desmontada (como no Marco 1, 14.1); 1 parte; 2 partes; 3 montada, sem enfeites. "Completa com enfeites" (7.2) é o estado do Marco 4.
- **Lugar:** o mesmo tile da árvore na Sala, (3, 8) (14.10.2, item 7). A Arte mantém a âncora e a escala da árvore atual.
- **Muda só no encaixe** (15.6.4). Nunca volta a um estado anterior na mesma partida.
- **Exame (A na frente da árvore, repetível):** uma página, barra "Z: avançar  X: fechar", quantas vezes o jogador quiser. Não dispara o diálogo de chegada (15.6.5).
  - estado 0: "A árvore ainda está desmontada. Ela precisa de 3 partes." (14.9.3, sem mudança)
  - estado 1: "Ela já tem 1 parte. Faltam 2 partes."
  - estado 2: "Ela já tem 2 partes. Falta 1 parte."
  - estado 3: "A árvore está montada! Que linda!"
- **Pisca (14.9.3):** segue só até o primeiro exame da árvore no Marco 1. No Marco 2 não pisca.
- **Antes das luzes,** A na árvore não faz nada (14.10.2).
- **Pilar 2:** a árvore sempre diz quantas partes faltam. É a pista do Marco 2 (15.9).

### 15.5 Tela de conquista de cada peça

- **Layout [Provisório, Arte]:** à esquerda, a ilustração da peça em tamanho grande (cerca de 3× o sprite do chão), sobre o mesmo fundo da conquista 1. À direita, o sobrinho comemorando (sprite `celebrate`, que já existe, 7.2). Embaixo, o texto e o botão "Continuar", com foco inicial.
- **Textos (exatos, chaves em 15.8):**
  - Parte 1: "Parabéns, você conseguiu encontrar a primeira parte da árvore de Natal." (decidido, pergunta 23, 2026-11-08)
  - Parte 2: "Parabéns, você conseguiu encontrar a segunda parte da árvore de Natal."
  - Parte 3: "Parabéns, você conseguiu encontrar a última parte da árvore de Natal!"
- **Tamanho:** até 3 linhas de 28 caracteres, sem corte, em 480×352.
- **Barra:** "Z ou X: continuar" (14.8). Z, X e Enter continuam. Não há voltar.
- **Sem tempo automático.** Não é tela de carregamento (seção 3). Ao continuar, começa a condução (15.6).

### 15.6 Depois de cada peça: condução, encaixe e diálogo

Sequência para cada peça:
1. A na peça (15.2.5).
2. Tela de conquista (15.5).
3. Continuar. A condução começa do tile em frente à peça, onde o jogador estava.
4. Condução até o destino da fase, `conducao.parteN` (Sala, tile (3, 7), direção `baixo`, de frente para a árvore). Valem 14.11.2 e 14.11.3: não pula, sem interrupção, barra vazia, velocidade normal até 10 passos, 2× no trajeto inteiro acima de 10 passos, decidido antes do primeiro passo. Portas no trajeto: fade de 14.10.5.
5. Encaixe: a peça desce sobre a árvore em 0,6 s, com um flash dourado de 0,3 s. Depois, a árvore muda para o novo estado (15.4).
6. Diálogo de chegada (15.6.5), sozinho.
7. Ao fechar o diálogo, o controle volta na hora.

**15.6.1 Velocidade (estimativa do Produto, com a opção B; o QA mede).** Da frente da parte 1 até a árvore, a rota tem 4 a 6 passos: velocidade normal. Das partes 2 e 3, a rota passa pela passagem P7 e tem mais de 10 passos: 2× no trajeto inteiro. Tabela em 15.3.5.

**15.6.2 Porta no trajeto.** A condução cruza só a P7: as peças 2 e 3 estão na Cozinha e na Lavanderia (15.2.2). Fade de 0,5 s na cor `#0b1030`, A bloqueado no fade, nasce no ponto de chegada da Sala, (9, 5), e o trajeto segue (14.10.5). **Quarto, Suíte e Escritório não entram em nenhum trajeto:** nenhuma peça fica lá, e as rotas de 15.3.5 não mudam com a abertura das áreas novas (avaliação do Produto, 2026-11-08). As passagens P2 e P3 e a P1 são só para o jogador explorar (E17, E21, E23). É a primeira vez que a porta no trajeto pode ser testada ao vivo (backlog 035, D6), pela P7.

**15.6.3 Destino por fase (dado).** O destino de cada fase fica em `content/missions/parte<N>.json`, no campo `conducao`. Mudar o destino é mudar dado, não código (regra D7).

**15.6.4 Encaixe.** Nada se move antes do fim do encaixe. A árvore não muda em outro momento.

**15.6.5 Diálogo de chegada (decidido, pergunta 22, 2026-11-08).** Começa sozinho, depois do encaixe, uma vez por peça. Uma página de até 2 linhas de 28 caracteres. Entrada bloqueada por 200 ms (Z, X, Enter e Esc não fazem nada nesse intervalo). Barra "Z: avançar  X: fechar". Textos em 15.8: chegada 1, "Agora a árvore tem 1 parte. Faltam 2 partes!"; chegada 2, "Agora a árvore tem 2 partes. Falta 1 parte!"; chegada 3, "A árvore está montada! Que linda!". Sem tempo automático.

**15.6.6 Controle.** Ao fechar o diálogo, o jogador fica livre, sem interação extra com a árvore (como 14.11.1, passo 6).

**15.6.7 Uma vez por partida.** Cada peça é pega uma vez. Voltar pelas portas não repete condução nem diálogo. Nova partida repete tudo (14.11.3).

**15.6.8 Depois da parte 3 (decidido, pergunta 24, 2026-11-08).** A árvore fica montada, sem enfeites. O jogo fica livre, sem objetivo novo, até o Marco 4. Nenhuma tela promete o enfeite.

### 15.7 Barra de controles nas telas do Marco 2 (14.8)

| Tela | Barra (texto exato) | Z / Enter (A) | X / Esc (B) |
|---|---|---|---|
| Título, Como jogar, Seleção, Introdução, bilhete, painel da porta, "Clique!", "Está tudo escuro!" | Iguais ao Marco 1 (14.8) | Iguais ao Marco 1 | Iguais ao Marco 1 |
| Conquista 1 (luzes) | "Z ou X: continuar" | Continua | Continua |
| Conquista de peça (1 a 3) | "Z ou X: continuar" | Continua | Continua |
| Exploração | "Setas: andar  Z: examinar" | Examina o objeto em frente (árvore, peça, móvel, interruptor) | Nada |
| Condução (luzes e peças) | Vazia (exceção de 14.8) | Nada | Nada |
| Diálogo de chegada (peça) e exame da árvore | "Z: avançar  X: fechar" | Avança; na última página, fecha | Fecha |
| Aviso "ainda não" (peça escondida, 15.2.7) | "Z: avançar  X: fechar" | Avança; na última página, fecha | Fecha |

Nenhuma tela nova usa tecla fora da barra. Em "Como jogar" não entram linhas novas, porque nenhum controle novo existe no Marco 2.

### 15.8 Textos do Marco 2 (pt-BR)

Chaves novas em `content/texts/pt-BR.json`. Textos exatos, com quebra automática, nos limites de 15.5 e 15.6. **Decisões 26 a 29 (2026-11-08):** nenhum texto novo. O aviso "ainda não" com gatilho no tile escondido (28) usa as chaves abaixo; a parte 3 na Lavanderia (27) e a Cama no Escritório (29) não têm texto.

| Chave | Texto | Onde aparece |
|---|---|---|
| `conquista.parte1` | "Parabéns, você conseguiu encontrar a primeira parte da árvore de Natal." | Conquista da parte 1 (15.5; decidido, pergunta 23) |
| `conquista.parte2` | "Parabéns, você conseguiu encontrar a segunda parte da árvore de Natal." | Conquista da parte 2 |
| `conquista.parte3` | "Parabéns, você conseguiu encontrar a última parte da árvore de Natal!" | Conquista da parte 3 |
| `arvore.estado.1` | "Ela já tem 1 parte. Faltam 2 partes." | Exame, estado 1 (15.4) |
| `arvore.estado.2` | "Ela já tem 2 partes. Falta 1 parte." | Exame, estado 2 |
| `arvore.estado.3` | "A árvore está montada! Que linda!" | Exame, estado 3 |
| `arvore.chegada.1` | "Agora a árvore tem 1 parte. Faltam 2 partes!" | Diálogo após a parte 1 (15.6.5) |
| `arvore.chegada.2` | "Agora a árvore tem 2 partes. Falta 1 parte!" | Diálogo após a parte 2 |
| `arvore.chegada.3` | "A árvore está montada! Que linda!" | Diálogo após a parte 3 |
| `aviso.peca2.antes1` | Página 1: "Ainda não!" / Página 2: "Essa é a parte do meio. Encontre a base antes." | Peça 2 com a parte 1 não encaixada (15.2.7) |
| `aviso.peca3.antes1` | Página 1: "Ainda não!" / Página 2: "Essa é a parte de cima. Encontre as outras antes." | Peça 3 com a parte 1 não encaixada (15.2.7) |
| `aviso.peca3.antes2` | Página 1: "Ainda não!" / Página 2: "Essa é a parte de cima. Encontre a do meio antes." | Peça 3 com a parte 2 não encaixada, parte 1 já encaixada (15.2.7) |

- `arvore.desmontada`, `conquista.luzes` e os demais textos do Marco 1 não mudam.
- Portas fechadas P4, P5 e P6 usam `porta.fechada` (14.10.3). Nenhum texto novo para o Quarto, a Suíte nem o Escritório.
- Nenhum texto cita nome de pessoa da família (14.10.6, item 034). O rótulo do TMX que traz nome de pessoa da família, no cômodo do Quarto, não entra no jogo: o cômodo é "Quarto" (14.10.6, item 034).

### 15.9 Regras para crianças de 5 a 10 anos (procurar sem frustrar, pilar 2)

No Marco 2, a pista é o brilho da peça, o texto da árvore e o aviso "ainda não" (15.2.7). Não há dica (H) nem Nick (pergunta 25, decidida: sem dica no Marco 2).

1. **Nenhuma peça fica impossível de pegar.** Cada uma tem tiles livres ao redor (15.2.2), e a regra de 14.9.2 aceita a peça de frente ou encostada.
2. **Aviso, não erro.** Dar A numa peça escondida mostra o aviso "ainda não" (15.2.7). Não há penalidade, contador nem perda. Substitui o antigo "sem aviso" (decisão do Diretor, 2026-11-08).
3. **Ordem sem pista falsa.** A peça seguinte só aparece depois da anterior. O aviso diz qual parte vem antes; o único lugar que ele revela é o tile da peça escondida (pergunta 28).
4. **Brilho visível sem andar até o tile** (15.2.4).
5. **A árvore diz sempre quantas faltam** (15.4). Um adulto que lê junto entende sem manual.
6. **Sem tempo, sem pontuação e sem contador na tela** (pilar 1; 1.1 e 6).
7. **Sem parede invisível** (15.2.3).
8. **Textos curtos:** diálogo de até 2 linhas de 28 caracteres por página (chegada, aviso e exame); conquista de até 3 linhas de 28.
9. **Voltar é livre:** ir a qualquer cômodo, em qualquer ordem, não tem custo.

### 15.10 Casos de QA (Marco 2)

Com os 4 sobrinhos, no teclado, salvo indicação. Cada rodada do QA dura no máximo 15 minutos (regra do Diretor, 2026-11-07).

- **E1 (aparição):** depois das luzes e da condução da conquista 1, só a parte 1 aparece, na Sala, no tile (1, 4). As partes 2 e 3 não aparecem (sem desenho e sem brilho), e seus tiles são chão livre (o jogador anda sobre eles).
- **E2 (pegar, 14.9.2):** A na parte 1 de frente (Q1) e com a peça encostada, olhando para o lado oposto (Q4), abre a conquista 1. Diagonal (Q5) e tile vazio entre o jogador e a peça (Q3) não abrem nada.
- **E3 (conquista):** barra "Z ou X: continuar"; Z, X e Enter continuam; a ilustração e o sobrinho comemorando aparecem.
- **E4 (condução):** sem tocar em nada, o sobrinho vai até (3, 7) da Sala, de frente para a árvore. Teclas e Esc não mudam nada, e a barra fica vazia no trajeto.
- **E5 (encaixe e diálogo):** depois do encaixe de 0,6 s, a árvore passa ao estado 1. O diálogo "Agora a árvore tem 1 parte. Faltam 2 partes!" aparece sozinho, com entrada bloqueada de 200 ms. Z ou X fecham, e o controle volta na hora.
- **E6 (exame):** A na frente da árvore, no estado 1, mostra "Ela já tem 1 parte. Faltam 2 partes." quantas vezes for, sem disparar o diálogo de novo.
- **E7 (parte 2 e 2×):** a parte 2 só aparece depois do encaixe da parte 1, no tile (4, 1) da Cozinha e Lavanderia. Ao pegar, a condução cruza a P7 com fade de 0,5 s e A bloqueado, segue do spawn da Sala e chega à árvore. Registrar passos e velocidade (esperado: 15 a 17 passos, 2×; 15.3.5).
- **E8 (parte 3):** a parte 3 só aparece depois do encaixe da parte 2, no tile (3, 5) da Lavanderia. Conquista, condução, encaixe, e árvore no estado 3 com "A árvore está montada! Que linda!".
- **E9 (depois da parte 3):** exploração livre, sem objetivo novo. O exame da árvore mostra o estado 3, e nenhuma peça fica visível.
- **E10 (uma vez):** voltar pela P7 e pela P8 não repete condução nem diálogo de nenhuma peça, e as peças pegas não reaparecem.
- **E11 (nova partida):** título, Começar, seleção e introdução. Só a parte 1 aparece, e a árvore está desmontada (estado 0).
- **E12 (textos):** conquistas 1 a 3, chegadas 1 a 3, estados 1 a 3 e os 3 avisos "ainda não" (duas páginas cada) com o texto exato, nos 4 nomes. Nenhum nome de família no jogo.
- **E13 (captura, não ao vivo):** parte 1 na Sala (brilho legível a 3 tiles, sem zoom), com as partes 2 e 3 escondidas (sem desenho); parte 2 na Cozinha; parte 3 na Lavanderia (3, 5); Quarto e Escritório (opção B), com os indicadores de 15.3.3; árvore nos estados 0 a 3; as 3 telas de conquista; diálogo de chegada; os 3 avisos "ainda não"; a árvore fora da linha 10 (barra). O Diretor aprova antes de publicar.
- **E14 (áreas B):** o Quarto só se alcança pela P2 e o Escritório só pela P3, sem outra entrada. A Suíte fica fechada (pergunta 30 = A); quando abrir, só pela P1 (E23). Banheiros fechados: P4 e P6 com o texto de 14.10.3 (15.3.2); P5 só existe com a Suíte aberta.
- **E15 (aviso, peça 2 antes da 1):** depois das luzes e antes de encaixar a parte 1, A no tile escondido da parte 2 (Cozinha, (4, 1)) mostra "Ainda não!" e, na página 2, "Essa é a parte do meio. Encontre a base antes.". Z avança, X fecha, e nada muda.
- **E16 (aviso, peça 3):** A no tile escondido da parte 3 mostra "Ainda não!" e "Essa é a parte de cima. Encontre as outras antes." antes da parte 1 encaixada; e "Ainda não!" e "Essa é a parte de cima. Encontre a do meio antes." com a parte 1 encaixada e a 2 não. Antes das luzes, nenhum aviso (15.2.7).
- **E17 (passagens novas):** sem andar, P2 e P3 aparecem como abertura (14.10.9) e com os indicadores de 15.3.3 (captura). Andar sobre o gatilho de P2 leva ao Quarto, e sobre o de P3, ao Escritório, com fade de 0,5 s. Voltar pelo mesmo gatilho nasce no tile de chegada da Sala, (7, 2). Entrar pela P2 nasce em (0, 6) do Quarto, olhando para cima (15.3.4, item 9); entrar pela P3 nasce em (11, 2), no Escritório.
- **E18 (vão):** o vão de P2 (8, 1) da Sala e o de P3 (9, 2) não são andáveis; o Quarto não tem tapete (a P2 tem seta, 15.3.3).
- **E19 (áreas fechadas):** a Suíte e os banheiros não são alcançáveis (pergunta 30 = A). P1 segue porta fechada, com o texto de 14.10.3 e seta para a esquerda. P4 e P6 mostram o texto de 14.10.3.
- **E20 (rota com passagem P7 e 2×):** a condução da parte 3, saindo da Lavanderia (3, 5), cruza a P7 e chega a (3, 7) da Sala, com 2× e fade na passagem. Registrar passos (esperado: 20 a 22). As áreas novas (Quarto e Escritório) não têm peça: só entram no E17 e no E18.
- **E21 (Quarto, ida e volta):** da Sala, em (7, 2), andar para cima sobre o gatilho (7, 1): fade de 0,5 s, nasce em (0, 6) do Quarto, de frente para cima. Andar para baixo sobre o gatilho (0, 7) e voltar: fade, nasce em (7, 2) da Sala, de frente para baixo. Tentar andar para o vão (8, 1) não faz nada, porque ele não é andável. Com os 4 sobrinhos, no teclado.
- **E22 (Quarto, caixa e câmera):** captura em 480×352 com os 4 tiles novos do Quarto desenhados (gatilho (0, 7), chegada (0, 6) e corredor (0, 5) e (0, 4)), a seta para a esquerda sobre o gatilho (0, 7) e nenhum tapete; a caixa do Quarto (5×8) inclui os tiles novos; câmera centralizada, sem rolagem e sem corte; a última linha da tela sem chão andável. Teste: nenhum piso do Quarto encosta em piso da Sala (E004). Captura aprovada pelo Diretor antes da conversão.
- **E23 (Suíte, N/A no Marco 2; vale numa versão posterior):** ida e volta pela P1, pelo caminho que a 30 escolher; a chegada de entrada é o tile novo da Suíte; Cama e Armário no lugar da planta, sem reação a A; P5 é porta fechada com o texto de 14.10.3. No Marco 2, E23 vira N/A no checklist e vale o E19.
- **E24 (nada de peça nos cômodos novos):** no Quarto, na Suíte e no Escritório, nenhuma peça, brilho, aviso "ainda não" ou NPC aparece; A em Cama, Armário e Mesa não mostra nada; o Quarto não tem móvel nomeado.

### 15.11 Versão, entrega e playtest

- **Versão:** 0.6.0 no `package.json`, visível no título e no build de playtest (11 e 4 da seção 9).
- **Captura antes de publicar:** o Diretor aprova as capturas de E13 antes de qualquer artifact (regra de 2026-11-08).
- **Roteiro de playtest (Orquestrador):** título, Começar, seleção, introdução, porta, luzes, condução, parte 1, aviso "ainda não" (ao tentar a parte 2 antes), parte 2, parte 3, árvore montada e exploração livre, passando pelo Quarto ou pelo Escritório se a opção B estiver no artifact.
- **Perguntas-chave (CLAUDE.md, playtest do Marco 2):** procurar é divertido ou cansativo? As peças brilham o suficiente? As conquistas emocionam? Acrescentar: a árvore diz o que falta? O diálogo de chegada ajuda ou atrapalha? O aviso "ainda não" ajuda ou atrapalha? As passagens para o Quarto e o Escritório são claras?
- **Fora de escopo, confirmado:** sorteio (seção 11), corrida (o B fica reservado, 4.1 e 11) e enfeites (Marco 4).
