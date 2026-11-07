# GDD: Natal na Casa do Tio Ítalo e da Tia Nath

**Versão:** 1.0 (rascunho)
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
| 3 | **Parte 1** | Encontrar a primeira parte da árvore | Interagir com a peça em qualquer cômodo | "Parabéns, você conseguiu encontrar a primeira árvore de Natal." | Ao lado da árvore, com a parte 1 montada |
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
- **Pergunta:** "Em que ano você nasceu?" (o código são os 3 últimos dígitos do ano de nascimento do sobrinho escolhido).
- **Código por personagem:**

| Personagem | Gênero | Código |
|---|---|---|
| LoLô | menina | 017 |
| BiBi | menina | 020 |
| DanDan | menino | 023 |
| TuTu | menino | 024 |

- **Pista:** o código depende do sobrinho escolhido, então o jogo valida o código do personagem atual (não um código único). **Pista no hall (definida pelo Diretor):** o texto "os 3 últimos dígitos do ano em que {nome_do_personagem} nasceu", com o nome do sobrinho escolhido. [TBD: suporte visual da pista (bilhete, placa, porta-retrato), a definir pelo Produto e a Arte].

### 4.3 Luzes

- A casa começa escura. Os cômodos são visíveis apenas parcialmente (iluminação de "lanterna" ou de penumbra) [TBD: confirmar o visual].
- O interruptor principal fica em um ponto fixo.
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
| **LoLô** | Menina. Código da porta: 017. [TBD: aparência e personalidade] |
| **BiBi** | Menina. Código da porta: 020. [TBD: aparência e personalidade] |
| **DanDan** | Menino. Código da porta: 023. [TBD: aparência e personalidade] |
| **TuTu** | Menino. Código da porta: 024. [TBD: aparência e personalidade] |

**Regras (v1):**
- A escolha é **cosmética**: os 4 têm as mesmas habilidades, velocidade e interações. Isso mantém o jogo justo e a QA simples.
- A escolha é feita em um **novo jogo**, na tela de seleção, que aparece depois do título e antes da introdução.
- O personagem escolhido é salvo junto com o checkpoint. Ao continuar, o jogador retoma com o mesmo sobrinho.
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

**Celular:** o jogo só funciona em modo paisagem. Em modo retrato, aparece uma tela pedindo para girar o aparelho.

---

## 6. Interface e textos

- **Textos curtos**, com frases que uma criança de 5 anos consegue acompanhar. Adultos não devem achar o texto infantil demais.
- **Fonte legível** em tamanho grande, com espaçamento confortável.
- **Diálogos com botão de avanço** (A), sem tempo automático.
- **Sem pressão de tempo:** nada na tela conta o tempo da partida.
- **Salvamento automático:** o progresso é salvo em cada conclusão de fase (checkpoint), junto com o sobrinho escolhido. Ao reabrir o jogo, ele retoma do último checkpoint.

---

## 7. Arte e áudio

### 7.1 Estilo visual

- Pixel art em resolução base de 240×160, escalada em número inteiro.
- Tiles de 16×16 px.
- Paleta limitada (16 a 32 cores), com tons quentes de Natal (vermelho, verde, dourado) combinados com tons neutros para a casa.
- Câmera fixa por cômodo (sem rolagem suave no início).
- Referência: estética de GBA, sem copiar personagens, sprites ou elementos protegidos da Nintendo ou da Game Freak.

### 7.2 Personagens e itens

- **Os Sobrinhos (LoLô, BiBi, DanDan e TuTu):** 4 personagens jogáveis, cada um com seu conjunto de sprites. Cada um precisa de: andar nas 4 direções (cima, baixo, esquerda, direita), parado, interagindo e comemorando (tela de conquista e final). Os 4 devem ter o mesmo tamanho e a mesma estrutura de animação, para compartilhar a lógica. [TBD: aparência e traços de cada um]
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

1. **Título:** logo do jogo e opção "Começar" ou "Continuar" (se houver salvamento).
2. **Seleção de personagem:** mostra os 4 sobrinhos (LoLô, BiBi, DanDan e TuTu). O jogador navega com as direções e confirma com A. Aparece só em novo jogo.
3. **Jogo:** exploração em cada cômodo, com HUD mínimo (ícone de dica e, quando o Nick está acordado, a seta de farejar ao pressionar B).
4. **Diálogo:** caixa de texto na parte inferior.
5. **Painel de código:** teclado numérico para a porta.
6. **Tela de conquista:** imagem ou ilustração, texto e botão "Continuar".
7. **Dica:** imagem da árvore, texto e botão "Voltar".
8. **Pausa:** opções de áudio e voltar ao título.
9. **Créditos:** árvore montada, sobrinho escolhido, Nick e agradecimento.
10. **Aviso de rotação:** exibida no celular em modo retrato.

---

## 9. Requisitos técnicos

- **Motor:** Phaser 3 com TypeScript.
- **Editor de mapas:** Tiled, exportado em JSON.
- **Build:** Vite.
- **Testes:** Vitest para a camada de domínio.
- **Arquitetura:** Clean Architecture com DDD (ver ADR-001, a ser criada).
- **Persistência:** `localStorage` para checkpoints.
- **Playtests:** build de arquivo HTML único, publicada como artifact no Claude (não no GitHub Pages).
- **Publicação (releases finais):** GitHub Pages, com deploy automatizado a partir de tags de versão (`vX.Y.Z`).
- **Releases e evolução:** versionamento SemVer, `CHANGELOG.md`, conteúdo (mapas, missões, textos) em `content/` com manifesto, e saves versionados com migração, para permitir novas versões com novos mapas sem quebrar saves antigos.
- **Compatibilidade:** versões recentes de Chrome, Edge, Firefox e Safari, no desktop e no celular.
- **Performance:** o jogo deve rodar bem em celulares intermediários e em notebooks simples, sem carregamento pesado. Assets otimizados.

---

## 10. Conteúdo e acessibilidade

- **Classificação:** livre, sem violência, sem conteúdo assustador ou sombrio. A casa escura é uma atmosfera de brincadeira, não de terror.
- **Acessibilidade básica:** texto com bom contraste, tamanho de fonte ajustável [TBD], controles de teclado e toque, e áudio com opção de desligar.
- **Privacidade:** nenhum dado pessoal é coletado. Nenhum serviço de terceiros de rastreamento.

---

## 11. Fora de escopo (v1)

- Sorteio das peças da árvore e da caixa de enfeite a cada partida (planejado para versão futura).
- Corrida (o botão B está reservado para o farejar do Nick).
- Modo multijogador.
- Monetização, anúncios ou compras.
- Versão aplicativo nativo (iOS/Android).
- Conteúdo adicional (novos mapas e missões): fora da v1.0, mas a arquitetura da v1.0 deve estar pronta para recebê-lo.
- Idiomas além do português.
- Combate ou sistema de inventário complexo.

---

## 12. Pendências para definir

| # | Item | Responsável sugerido |
|---|---|---|
| 1 | ~~Pergunta, código e texto da pista~~ (definidos em 4.2). Falta só o suporte visual da pista | Produto + Arte |
| 2 | Cômodo exato da caixa de enfeite na v1 (deve ser diferente dos cômodos das peças) | Produto, com você |
| 3 | Em que cômodo Nick dorme após cada item: posição fixa por fase ou sorteada? | Produto |
| 4 | Seta do farejar: aparece até o item ser encontrado ou por tempo limitado? | Produto |
| 5 | Nick reage quando o jogador entra em um cômodo com o item? (ex.: late) | Produto |
| 6 | Aparência e traços de cada sobrinho (LoLô, BiBi, DanDan, TuTu) | Arte, com você |
| 6a | ~~Diálogos com o nome do sobrinho~~ (decidido) | — |
| 6b | Os sobrinhos são pessoas reais da família (afeta fotos, referências e privacidade)? | Você |
| 7 | Visual do escuro nas luzes apagadas | Arte |
| 8 | Tamanho de fonte ajustável | Desenvolvimento |
| 9 | Trilha sonora escolhida | Arte e áudio |

---

## 13. Marcos de desenvolvimento

1. **Fatia vertical:** seleção de personagem (com sprites provisórios), introdução, porta, luzes e checkpoint. Testa domínio, cena, teclado e salvamento.
2. **Peças da árvore:** as três peças, com a tela de conquista e a árvore se montando.
3. **Nick e dicas:** despertar, farejar e a tela de dica com imagem.
4. **Enfeite e créditos:** caixa de enfeite e fim do jogo.
5. **Toque e rotação:** controles do celular e aviso de modo retrato.
6. **Polimento:** áudio, textos, QA com crianças e adultos.
