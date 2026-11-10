# GDD: Natal na Casa do Tio Ítalo e da Tia Nath

**Versão:** 1.0 (rascunho; revisão de 2026-11-09 (Marco 6: seção 19 nova (áudio, pausa, polimento, acessibilidade, desempenho e release 1.0.0); versão 0.11.0 no PT5 e 1.0.0 na release (19.7); 5, 7.3, 8, 10, 11, 12 (pendências 8 e 9; pergunta 44 nova), 13, 14.1, 14.8 e 17.7 com nota; backlog 120 a 142); revisão de 2026-11-09 (ajuste 0.10.0: joystick virtual no lugar da cruz, 18.19; 5, 18.1, 18.2 e 18.16 com nota; pergunta 43 nova; backlog 111 a 119); revisão de 2026-11-09 (ADR-007 aceito: divergências V1 a V7 aplicadas em 18.2, 18.5, 18.6, 18.7, 18.9, 18.12, 18.13, TQ1, TQ5 e TQ19; perguntas 39 e 40 novas; backlog 097 aprovado e 098 a 109 ajustados); revisão de 2026-11-09 (Marco 5: seção 18 nova (toque, aviso de rotação, versão 0.9.0); pergunta 38 nova; 5, 12, 13, 14.1 e 14.8 com nota; backlog 097 a 109); revisão de 2026-11-09 (v0.8.1, plot twist: `arvore.chegada.3` com 3 páginas; controle, Nick dormindo e caixa só depois da página 3; 15.6.5, 15.8, 15.10 (E8), 17.2, 17.3, 17.5, 17.6, 17.8, 17.16 e 17.18 novo; backlog 096); revisão de 2026-11-09 (Marco 4: seção 17 nova, enfeite, créditos e fim (versão 0.8.0); pergunta 2 decidida; perguntas 36 e 37 novas; 13, 15.4, 15.6.8, 16.2.2 e 16.11 com nota de superação; backlog 086 a 095); revisão de 2026-11-09 (v0.7.1, ajustes do PT3 do Diretor: 16.4, 16.5.3, 16.5.4, 16.14, 16.15, 16.16 e 16.17 novo; pergunta 35 nova); revisão de 2026-11-08 (Marco 3: seção 16 nova (Nick, farejar, dica, barra de 2 linhas, Como jogar, textos, QA, versão 0.7.0); pendências 31 a 34 abertas com padrão aplicado; pendências 3, 4 e 5 decididas pelo Produto; 12, 13 e 14.8 atualizados); revisão de 2026-11-08 (P2 horizontal Sala ↔ Quarto com chegada declarada nos dois lados, Quarto 5×8 e 5 tiles novos; pergunta 30 = A, Suíte fechada no Marco 2; passos da condução do 15.3.5 medidos; 12, 13, 14.10.1, 14.10.3, 14.10.5, 14.10.10, 14.12.2, 15.1, 15.3 e 15.10 atualizados); revisão de 2026-11-08 (Suíte e Quarto com chegada explícita, decisão do Diretor: 1 tile no início de cada cômodo; 12, 13, 15.1, 15.3, 15.6, 15.8 e 15.10 atualizados; pergunta 26 respondida em parte; pergunta 30 aberta); revisão de 2026-11-08 (pendências 26 a 29): Lavanderia como cômodo próprio para a regra 4.4 (27), aviso com gatilho no tile escondido (28), Cama no Escritório (29), Suíte com abertura pela P1 decidida mas geometria pendente (26, 15.3.4 item 8), regra de arestas das portas (14.10.9); 15.2.2, 15.3.1, 15.3.4, 15.3.5, 15.8, 15.10 atualizados; revisão de 2026-11-07: sem save, tela Como jogar, P6b fechada, barra de controles em toda tela (14.8), painel da porta com X apaga e Esc fecha, personalidade dos sobrinhos em 4.8, barras com 2 espaços entre ações; ajustes do PT1 em 14.9; casa real no Marco 1 em 14.10; perfil HD 15×11, regra do interruptor e vão da P8 decididos em 2026-11-07; revisão de 2026-11-08: ajustes do PT2 em 14.1, 14.3, 14.4, 14.10 e 14.10.9; rotação da planta em 14.12 (sentido horário, só o conversor gira, print do interruptor recebido), com 14.1, 14.3, 14.7, 14.10.8, 14.11.3 e 14.12.5 atualizados para a planta girada; revisão de 2026-11-08 (PT2b): indicadores de porta em 14.10.10 (item 046) e diálogo da árvore automático na condução em 14.9.3, 14.11 e 14.10.8 (item 047); reescrita da planta girada em 14.9.2 (Q7), 14.9.3, 14.10.1, 14.10.2, 14.10.3, 14.10.5, 14.10.8 (C1, C5), 14.10.10 (P1 e P3 com seta; pergunta 17 decidida em 2026-11-08) e 14.12.3 e 14.12.4 conforme o conteúdo atual); revisão de 2026-11-08 (Marco 2): seção 15 nova (peças da árvore, versão 0.6.0), respostas do Diretor às pendências 18 a 25 incorporadas em 12 e 15 (opção B de áreas, aviso "ainda não", textos da conquista 1; pendências 26 a 29 abertas) e item 2 da seção 13 apontando para a 15
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
- **Localização (v1):** em um cômodo onde nenhuma peça da árvore foi colocada, para que o jogador não encontre tudo no mesmo lugar. Posição exata fixa. **Decidido (Produto, 2026-11-09, pergunta 2):** Escritório; ver 17.3.
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
| Mover | Setas ou WASD | Joystick virtual na tela, em grade de 4 direções, sem diagonal (18.19; substitui a cruz da 18.2) |
| Interagir (A) | Z ou Enter | Botão A |
| Cancelar (B) / Farejar com Nick (B) | X ou Esc | Botão B |
| Abrir dica | H | Ícone de ajuda |
| Pausa (Marco 6, 19.3) | P | Ícone II no canto superior esquerdo, na exploração |
| Mudo (Marco 6, 19.2.3) | M | Ícone de som no canto superior esquerdo |

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
- Áudio pode ser silenciado: M e ícone de som (19.2.3).
- **Marco 6 (seção 19.2):** a música e os efeitos são gerados por síntese, originais do projeto (sem sample, faixa ou fonte de terceiros). Isso vale no lugar do "domínio público ou licença gratuita" acima.

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
9. **Pausa:** continuar, som, Como jogar e voltar ao título (seção 19.3).
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
- **Acessibilidade básica:** texto com bom contraste, tamanho de fonte fixo, com piso de 12 px de jogo (19.5; pendência 8 decidida), controles de teclado e toque, e áudio com opção de desligar (19.2.3).
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
- Volume ajustável, trilha por cômodo e som espacial (19.10; o áudio é música e efeitos, sem voz).
- Salvamento de progresso (checkpoint, "Continuar", `localStorage`, migração de saves): fora da v1.0, por decisão do Diretor (2026-11-07).
- Combate ou sistema de inventário complexo.

---

## 12. Pendências para definir

| # | Item | Responsável sugerido |
|---|---|---|
| 1 | ~~Pergunta, código, texto e suporte visual da pista~~ (decidido: bilhete ao lado da porta, 4.2 e 14.4) | — |
| ~~2~~ | ~~Cômodo exato da caixa de enfeite na v1 (deve ser diferente dos cômodos das peças)~~ **Decidido (Produto, 2026-11-09; padrão, o Diretor confirma na captura EN2):** Escritório. Não tem peça, fica a uma porta da Sala e a P3 já está aberta na parte 3. Ver 17.3 | Produto |
| ~~3~~ | ~~Em que cômodo Nick dorme após cada item: posição fixa por fase ou sorteada?~~ **Decidido (Produto, 2026-11-08; padrão para o Diretor confirmar no PT3):** cômodo fixo por fase, sem sorteio (seção 11): Sala na porta e nas luzes; Cozinha e Lavanderia na parte 1; Quarto na parte 2; Escritório na parte 3; Sala depois da parte 3. Ver 16.2 | Produto |
| ~~4~~ | ~~Seta do farejar: aparece até o item ser encontrado ou por tempo limitado?~~ **Decidido (Produto, 2026-11-08):** a seta mostra só a porta a seguir, dura 5 s e reinicia com B; sem cooldown e sem limite de usos (pilares 1 e 2). Ver 16.5.3 | Produto |
| ~~5~~ | ~~Nick reage quando o jogador entra em um cômodo com o item? (ex.: late)~~ **Decidido (Produto, 2026-11-08): não.** Nick reage ao acordar, ao farejar, ao chegar com a conquista e ao abanar. Reagir ao cômodo entregaria o lugar do item. Ver 16.5.4 e 16.7 | Produto |
| ~~6~~ | ~~Aparência e traços de cada sobrinho (LoLô, BiBi, DanDan, TuTu)~~ **Decidido (Diretor, 2026-11-07):** folhas de referência em `assets/referencia/` (`ref_<nome>_folha.webp`, referência oficial) e sprites finais em `assets/sobrinhos_final/`. A folha do Nick também está em `assets/referencia/`; os sprites dele ficam para o Marco 3 | — |
| 6a | ~~Diálogos com o nome do sobrinho~~ (decidido) | — |
| ~~6b~~ | ~~Os sobrinhos são pessoas reais da família?~~ **Decidido (Diretor, 2026-11-07):** sim, são pessoas reais, e o Diretor aceita que os códigos da porta revelem os 3 últimos dígitos do ano de nascimento. Regra mantida: sem fotos reais e sem dados além de nome e código (ver 10 e 14.6) | — |
| 7 | ~~Visual do escuro~~ (decidido: penumbra azul-noite com círculo de luz, 14.5; a Arte pode refinar cores dentro da paleta) | — |
| ~~8~~ | ~~Tamanho de fonte ajustável~~ **Decidido (padrão do Produto, 2026-11-09; GDD 19.5 e 19.11, k):** fonte fixa na 1.0, com piso de 12 px de jogo para qualquer texto. Ajuste de fonte vai para 1.x (19.4.3) | — |
| 9 | Trilha sonora escolhida (ver pergunta 44) | Diretor; aberta, com padrão aplicado (sinos e celesta, 19.2.1) |
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
| 31 | **Barra de 2 linhas na exploração e linha 9 da Sala (Marco 3, 16.9). PERGUNTA AO DIRETOR.** A barra nova ocupa as linhas 9 e 10 da tela. Na Sala, a linha 9 tem 2 tiles andáveis, (0, 9) e (1, 9), no canto inferior esquerdo, sem objeto. Em 2026-11-08 você dispensou o bloqueio dessa linha porque a barra era de 1 linha. **Pergunta:** você aprova bloquear só esses 2 tiles? **Sugestão do Produto: sim** (custo mínimo: nenhum objeto, peça ou gatilho). **Alternativa:** barra de 1 linha só, "Z: examinar  X: farejar  H: dica", sem "Setas: andar". **Padrão até a resposta:** item 073 em espera; os demais itens do Marco 3 seguem | Diretor (aberta) |
| 32 | **Onde Nick dorme em cada fase (Marco 3, 16.2.2). PERGUNTA AO DIRETOR.** Padrão aplicado: Sala na porta e nas luzes; Cozinha e Lavanderia na parte 1; Quarto na parte 2; Escritório na parte 3; Sala depois da parte 3. Nick fica sempre a uma porta da Sala, e cada item leva a criança a outro cômodo. **Pergunta:** aprova essa sequência? **Sugestão do Produto: sim.** | Diretor (aberta; padrão aplicado) |
| 33 | **Nick sai de cena para dormir (Marco 3, 16.6). PERGUNTA AO DIRETOR.** Ao fim de cada item, ele some com uma fumacinha e aparece dormindo no cômodo da próxima fase, sem andar até lá. **Pergunta:** prefere que ele ande sozinho até o novo lugar? Custa mais para Arte e Dev. **Sugestão do Produto: fumacinha.** | Diretor (aberta; padrão aplicado) |
| 34 | **Textos novos do Marco 3 (Marco 3, 16.10 e 16.11). PERGUNTA AO DIRETOR.** Dica por fase, falas do Nick ("O Nick acordou!...") e as duas linhas novas de Como jogar são propostas do Produto. **Pergunta:** aprova como estão? **Sugestão do Produto: aprovar; ajustável depois sem mudar código.** | Diretor (aberta; padrão aplicado) |
| 35 | **Ajustes do PT3 (v0.7.1), 16.17. PERGUNTA AO DIRETOR.** O retorno do PT3 pede que, ao farejar, a seta faça 2 tremidas e fique amarela. Duas interpretações ficaram em aberto: (a) B de novo, com a seta visível, refaz o farejando de Nick (1,2 s) antes das tremidas e dos 5 s? (b) depois das 2 tremidas, a seta fica parada até sumir, sem o sobe e desce? **Sugestão do Produto: sim para (a) e sim para (b).** Alternativa para (a): só as tremidas e os 5 s recomeçam, sem o farejando de novo. Padrão aplicado até a resposta: como 16.17 | Diretor (aberta; padrão aplicado) |
| 36 | **Aparência da caixa de enfeite e dos enfeites da árvore (Marco 4, 17.3 e 17.5). PERGUNTA AO DIRETOR.** A caixa é vermelha, com laço dourado, e a tampa abre para cima. A árvore enfeitada tem bolas vermelhas e douradas, fita verde e estrela dourada no topo. **Pergunta:** aprova essa descrição? **Sugestão do Produto: sim.** Padrão aplicado até a resposta: a Arte faz placeholders com essa descrição; nenhum item espera a resposta para começar | Diretor (aberta; padrão aplicado) |
| 37 | **Como os créditos começam (Marco 4, 17.4 e 17.7). PERGUNTA AO DIRETOR.** Opção A: depois do diálogo final, os créditos abrem sozinhos, com fade. Opção B: o jogador fica livre na casa; a árvore enfeitada se examina e um diálogo pergunta "Quer ver os créditos?" (Z: sim; X: não). **Pergunta:** A ou B? **Sugestão do Produto: A** (a seção 3 diz "Automático", e sem save a sessão é curta). Padrão aplicado até a resposta: A | Diretor (aberta; padrão aplicado) |
| ~~38~~ | **Botões de toque por cima da casa, em celular estreito (Marco 5, 18.2). PERGUNTA AO DIRETOR.** Decidida (Diretor, 2026-11-09): sim. Em celular estreito (faixa livre menor que 144 px de cada lado, como 667×375), a cruz e os botões A e B ficam por cima da tela do jogo, 60% transparentes, com a mesma caixa escura dos menus. Em celular largo (como 844×390), ficam nas laterais e não cobrem nada. **Pergunta:** no celular estreito, você aceita os botões por cima da casa? **Sugestão do Produto: sim.** A alternativa é encolher a tela do jogo para abrir faixas: a casa fica menor e a pixel art perde nitidez. **Decidida (Diretor, 2026-11-09): sim.** Layout B só na exploração, com cruz, A e B a 60%; diálogo e introdução com A e B, sem cruz; menus sem botão (18.2, 18.4). Autor: Produto | Diretor (decidida) |
| ~~39~~ | **Cruz com braços encostados, 144 px (Marco 5, 18.2; ADR-007, V1). PERGUNTA AO DIRETOR.** Decidida (Diretor, 2026-11-09): sim. Cada braço da cruz tem 48 px e os braços ficam encostados, somando 144 px (faixa mínima do layout A). O 8 px continua entre a cruz, A, B e os demais controles. **Pergunta:** a cruz pode ter os braços encostados, com 144 px? **Sugestão do Produto: sim.** Alternativa: braços com 8 px entre eles (cruz de 160 px); nesse caso o layout A exige faixas de 160 px, e em 844×390 (faixa de 156 px) a tela cai no layout B. **Decidida (Diretor, 2026-11-09): sim.** Braços encostados, 144 px. Autor: Produto (conta) e Especialista (ADR-007, V1) | Diretor (decidida) |
| ~~40~~ | **Teclado do painel no toque, em 5 colunas × 3 linhas (Marco 5, 18.6; ADR-007, V5). PERGUNTA AO DIRETOR.** Decidida (Diretor, 2026-11-09): sim. No computador, a grade fica como está (3 × 4). No toque, a grade passa a 5 colunas × 3 linhas: linha 1 = 1 a 5; linha 2 = 6 a 0; linha 3 = Apagar, OK e Fechar. A conta mostra que a grade de 4 linhas desce até o y 332 em 480×352, e a barra começa no y 296. **Pergunta:** no toque, aceita a grade de 5 × 3 com "Fechar"? **Sugestão do Produto: sim.** **Decidida (Diretor, 2026-11-09): sim.** Grade de 5 × 3, só no toque. Autor: Produto (grade) e Especialista (ADR-007, V5) | Diretor (decidida) |
| ~~41~~ | **Grade do painel no toque: "Apagar" e "Fechar" em 2 colunas, "OK" em 1 (Marco 5, 18.6). PERGUNTA AO DIRETOR.** A linha 3 da grade de 5 × 3 tem 5 colunas: Apagar (2), OK (1), Fechar (2). Motivo: "Apagar" e "Fechar" não cabem em 1 coluna de 56 px (Dev, backlog 102). **Decidida (Diretor, 2026-11-09): sim.** Autor: Orquestrador (padrão), Dev | Diretor (decidida) |
| 42 | **Seleção no layout B sem o botão B: como voltar ao título por toque? PERGUNTA AO DIRETOR.** Pela regra de 18.4, a seleção do celular estreito não tem cruz nem A/B, e o cartão é tocado direto. Sem B, a única saída é recarregar a página. **Opções:** (A) botão de menu "Voltar ao título" abaixo dos cartões, só no layout B, como em Como jogar e Créditos; (B) o botão B aparece na seleção do layout B (contraria 18.4); (C) sem saída por toque (não recomendado). **Sugestão do Produto: A.** Padrão aplicado até a resposta: A (barra `barra.selecao2.toque.menu`, 18.12). Autor: Produto | Diretor (aberta; padrão aplicado) |
| 43 | **Joystick fixo ou flutuante (Marco 5, ajuste 0.10.0, 18.19). PERGUNTA AO DIRETOR.** O controle de direção deixa de ser a cruz e passa a ser um joystick virtual (base redonda com bolinha que acompanha o polegar; movimento em grade de 4 direções, sem diagonal). **Pergunta:** a base fica sempre no mesmo lugar (embaixo à esquerda, onde estava a cruz) ou aparece onde o polegar toca? **Sugestão do Produto: fixo.** Motivos: no layout B, a área da casa é reservada (18.4); no flutuante, a tela inteira vira zona de toque, o que contraria a regra 5 (18.5); e o analógico físico também é fixo. O pedido "modelo analógico" vale nas duas posições e não muda essa sugestão. **Padrão aplicado até a resposta:** fixo. Autor: Produto | Diretor (aberta; padrão aplicado) |
| 44 | **Estilo da música de fundo (Marco 6, 19.2.1). PERGUNTA AO DIRETOR.** O GDD 7.3 pede música tranquila, com clima de Natal. A faixa será gerada por síntese, sem terceiros. **Opções:** (A) chiptune suave, com ondas quadradas e triangulares, no mesmo estilo dos efeitos e da pixel art (lembra o GBA); (B) sinos e celesta sintetizados, mais acústicos e mais de Natal. **Pergunta:** A ou B? **Sugestão do Produto: B.** Padrão aplicado até a resposta: B. Só a faixa (item 123) espera a resposta; os demais itens do Marco 6 seguem | Diretor (aberta; padrão aplicado) |

---

## 13. Marcos de desenvolvimento

1. **Fatia vertical:** título (Começar e Como jogar), seleção de personagem (com os sprites finais dos 4 sobrinhos), introdução, porta, luzes e exploração livre no fim da fatia. Testa domínio, cena e teclado.
2. **Peças da árvore:** as três peças, com a tela de conquista e a árvore se montando. Especificado na seção 15 (versão 0.6.0), com a opção B de áreas (Quarto e Escritório abertos; a Suíte fica fechada, pergunta 30 = A; o Quarto tem 4 tiles novos, 15.3.4, item 9).
3. **Nick e dicas:** despertar, farejar e a tela de dica com imagem. Especificado na seção 16 (versão 0.7.0; backlog 064 a 078; ajustes da versão 0.7.1 em 16.17, backlog 080 a 085).
4. **Enfeite e créditos:** caixa de enfeite e fim do jogo. Especificado na seção 17 (versão 0.8.0; backlog 086 a 095).
5. **Toque e rotação:** controles do celular e aviso de modo retrato. Especificado na seção 18 (versão 0.9.0; backlog 097 a 109). Ajuste 0.10.0: joystick virtual no lugar da cruz (18.19; backlog 111 a 119).
6. **Polimento:** áudio, pausa, polimento, acessibilidade básica e desempenho. Especificado na seção 19 (versão 0.11.0 no PT5; release 1.0.0 depois da aprovação do PT5; backlog 120 a 142).

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
- "No celular, em breve: botões na tela." (sai no Marco 5; a versão de toque está em 18.7)

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
- Código errado (mensagem alterna, na ordem, sem contagem visível): "Quase! Leia o bilhete de novo." / "Hmm, esse não é. Tente outra vez!" / "Sem pressa. Você consegue!" Os campos são limpos. **Marco 6 (19.11, j):** as mensagens de erro e "Faltam números." somem na primeira tecla digitada ou apagada.
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
- Marco 3 (detalhado na 16.9): a dica tem "Z ou X: voltar" (16.8.4). A exploração ganha uma segunda linha, "X: farejar  H: dica", fixa: o texto não muda com o estado do Nick. Isso substitui a versão anterior deste bullet, que dizia "com Nick acordado".
- Marco 5: a barra ganha a versão de toque (ex.: "A: avançar  B: voltar"). A regra acima não muda. Textos de toque em 18.4 e 18.12.
- Pausa: linha definida na seção 19.3 (Marco 6). Créditos: linha definida na 17.7. Toda tela terá linha fixa.

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

**Faixas medidas (QA, 2026-11-09, item 133; 4 sobrinhos, mesmo número em todos).** A rota não muda; a faixa antiga (15 a 17 e 20 a 22) era estimativa e fica superada. O QA contou trocas de tile durante a condução: E7 = 10 e E20 = 14. Pela regra de passos desta seção, somam-se os 3 da passagem: **E7 = 13 passos e E20 = 17 passos**, ambas em 2× (passam de 10). Como o script conta a troca de mapa da passagem como uma troca só, o QA reconfirma ao vivo a contagem total (PO5) antes de fechar o item 133.

| Peça | Tile de início (frente da peça) | Passos | Total estimado | Velocidade |
|---|---|---|---|---|
| Parte 1, Sala (1, 4) | (2, 4), (1, 5), (1, 3) ou (0, 4) | sem passagem | 4 a 6 | normal |
| Parte 2, Cozinha (4, 1) | (3, 1) ou (4, 2) | inclui a passagem P7 (3 passos) | 13 (medido: 10 tiles + 3) | 2× |
| Parte 3, Lavanderia (3, 5), fixa (pergunta 27) | (3, 4) ou (4, 5) | inclui a passagem P7 (3 passos) | 17 (medido: 14 tiles + 3) | 2× |
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
  - estado 3: "A árvore está montada!" / "Falta a caixa de enfeites." (Marco 4, 17.5; antes: "A árvore está montada! Que linda!". O exame do estado 3 só existe no Marco 3 em diante)
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

**15.6.5 Diálogo de chegada (decidido, pergunta 22, 2026-11-08; chegada 3 com 3 páginas, 0.8.1).** Começa sozinho, depois do encaixe, uma vez por peça. Cada página tem até 2 linhas de 28 caracteres. Entrada bloqueada por 200 ms (Z, X, Enter e Esc não fazem nada nesse intervalo), só ao abrir o diálogo (padrão do Produto para diálogos de mais de uma página, 17.18). Barra "Z: avançar  X: fechar". Textos em 15.8: chegada 1, "Agora a árvore tem 1 parte. Faltam 2 partes!" (1 página); chegada 2, "Agora a árvore tem 2 partes. Falta 1 parte!" (1 página); chegada 3, 3 páginas (17.18). Sem tempo automático. **Fechar o diálogo da chegada 3 é o que libera a fase enfeites:** só ao fechar (Z na página 3, ou X em qualquer página) o controle volta, Nick vai dormir e a caixa aparece (15.6.6, 17.2, 17.3).

**15.6.6 Controle.** Ao fechar o diálogo, o jogador fica livre, sem interação extra com a árvore (como 14.11.1, passo 6). Na chegada 3, o controle só volta ao fechar o diálogo, depois da página 3 (17.18).

**15.6.7 Uma vez por partida.** Cada peça é pega uma vez. Voltar pelas portas não repete condução nem diálogo. Nova partida repete tudo (14.11.3).

**15.6.8 Depois da parte 3 (decidido, pergunta 24, 2026-11-08).** A árvore fica montada, sem enfeites. O jogo fica livre, sem objetivo novo, até o Marco 4. Nenhuma tela promete o enfeite. **Superado pelo Marco 4 (seção 17):** depois da parte 3 começa a fase enfeites, com a caixa no Escritório. Esta frase vale só para o Marco 2 e o Marco 3. O exame do estado 3 muda (17.5), e os casos E9 e E12 de 15.10 seguem 17.13 (RG1).

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
| `arvore.chegada.3` (muda na 0.8.1) | Página 1: "A árvore está montada! Que linda!" / Página 2: "Mas tem algo estranho... Ainda falta alguma coisa." / Página 3: "Deve estar perdida pela casa." | Diálogo após a parte 3 (15.6.5; 17.18) |
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
- **E7 (parte 2 e 2×):** a parte 2 só aparece depois do encaixe da parte 1, no tile (4, 1) da Cozinha e Lavanderia. Ao pegar, a condução cruza a P7 com fade de 0,5 s e A bloqueado, segue do spawn da Sala e chega à árvore. Registrar passos e velocidade (esperado: 13 passos, 2×; 15.3.5, medido em 2026-11-09).
- **E8 (parte 3):** a parte 3 só aparece depois do encaixe da parte 2, no tile (3, 5) da Lavanderia. Conquista, condução, encaixe, e o diálogo de 3 páginas da chegada 3 (15.8; 17.18, EN-PT1 a EN-PT3), com a árvore no estado 3.
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
- **E20 (rota com passagem P7 e 2×):** a condução da parte 3, saindo da Lavanderia (3, 5), cruza a P7 e chega a (3, 7) da Sala, com 2× e fade na passagem. Registrar passos (esperado: 17 passos, 2×; 15.3.5). As áreas novas (Quarto e Escritório) não têm peça: só entram no E17 e no E18.
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

---

## 16. Especificação do Marco 3 (Nick e dicas)

Detalha o Marco 3 (seção 13, item 3). Origem: o Diretor aprovou o Marco 2 e liberou o Marco 3 em 2026-11-08 ("Está bom até aqui. Pode seguir.", `playtests.md`, PT2). Versão do jogo ao fim do marco: **0.7.0**. Textos entre aspas são propostas do Produto para `content/texts/pt-BR.json` (chaves em 16.11). **[Provisório]** = aguarda Arte ou Diretor, sem bloquear. **[Pendente]** = pergunta aberta (seção 12, 31 a 34), com o padrão já aplicado.

Tudo o que os Marcos 1 e 2 fixaram continua valendo, salvo o que esta seção muda de forma explícita: a barra de exploração (16.9, muda 14.8), a tela Como jogar (16.10, acrescenta duas linhas a 14.1), o B na exploração (16.5, muda 4.1 e 15.1) e a regra de interação, que Nick passa a usar (16.3, 14.9.2).

### 16.1 Escopo e fluxo

| Etapa | No Marco 3 | Onde está |
|---|---|---|
| Introdução, porta, luzes, conquista 1 e condução | Como no Marco 1. Nick dorme na Sala desde o início da partida | 14.1, 14.11, 16.2 |
| Partes 1 a 3 (peças, conquistas, encaixe, diálogo) | Como no Marco 2. Nick acompanha a condução e reage ao encaixe | 15, 16.4.4, 16.7 |
| Nick: acordar, seguir, farejar, voltar a dormir | Novo | 16.2 a 16.7 |
| Tela de dica (tecla H e ícone) | Novo | 16.8 |
| Barra de exploração e Como jogar | Duas linhas novas | 16.9, 16.10 |
| Áreas | As do Marco 2 (Quarto e Escritório abertos; Suíte e banheiros fechados). Nick não dorme no Hall, que fica fora da casa | 15.3, 16.2 |
| Enfeites e créditos | Fora: Marco 4 | 13 |
| Toque e aviso de rotação | Fora: Marco 5 | 13 |
| Áudio e tela de pausa (8, item 9) | Fora: Marco 6. Até lá, o latido é o balão "Au!". A dica congela o mundo (16.8.5) | 7.3, 13 |
| Sorteio das peças, corrida | Fora da v1 | 11 |

### 16.2 Nick: onde dorme

**16.2.1 Regras.**
- Nick começa toda partida dormindo na Sala, dentro do círculo de luz da entrada (14.5). Ele não sorteia: em cada fase, dorme em um cômodo fixo (padrão, pergunta 32).
- Cômodos possíveis: só os de dentro da casa que estão abertos no Marco 3: Sala, Cozinha e Lavanderia, Quarto e Escritório. Nick não dorme no Hall (fora da casa), na Suíte nem nos banheiros (fechados, 15.3.2).
- O tile de dormir é escolhido pela Arte dentro destas regras: chão livre; com pelo menos 2 vizinhos livres, nenhum deles tile de peça; fora da última linha da tela (14.8; na Sala, ver pergunta 31); fora de gatilho, vão, chegada, interruptor, árvore, peça, bilhete e móvel; e fora da rota de condução da fase (16.14, N14).

**16.2.2 Onde Nick dorme em cada fase** (fases conforme a seção 3)

| Fase | Nick dorme em | Tile | Motivo |
|---|---|---|---|
| Porta (1) | Sala | (8, 5) [sugestão do Produto; a Arte confirma]. Chão livre, 3 vizinhos livres, a 2,24 tiles da entrada (6, 6), dentro do círculo de luz | Aparece assim que a porta abre, sem andar. É o primeiro encontro com o Nick |
| Luzes (2) | Sala | (8, 5) | Mesmo lugar. Pode ser acordado antes das luzes |
| Parte 1 (3) | Cozinha e Lavanderia | Arte escolhe | Cômodo aberto pela P7, a uma porta da Sala |
| Parte 2 (4) | Quarto | Arte escolhe | Aberto pela P2, a uma porta da Sala |
| Parte 3 (5) | Escritório | Arte escolhe | Aberto pela P3, a uma porta da Sala |
| Depois da parte 3 (fase enfeites, seção 17) | Sala | (8, 5) | Volta para casa. Igual no Marco 4 (17.6) |

Em toda fase, Nick está no máximo a uma porta da Sala. A busca pelo cachorro é curta, e o farejar (16.5) acompanha a criança até o item.

**16.2.3 Quando ele muda de lugar.** No fim de cada fase, com o controle devolvido ao sobrinho (16.6). Nova partida: Nick volta à Sala, dormindo.

### 16.3 Acordar (A)

- **Como:** A na frente do Nick dormindo, ou com o sobrinho encostado nele (regra 14.9.2; casos Q1 a Q4 valem). Nick dormindo é alvo do A como um examinável, com a mesma ordem de decisão de 14.9.2.
- **Animação "acordando"** (4 quadros, cerca de 1,2 s no total): dormindo; sobressalto com "!" amarelo; atento; de pé. O balão "Au!" aparece no segundo quadro.
- **Durante a animação:** o sobrinho não anda e o A não age. Nada se perde.
- **Depois:** Nick acordado passa a seguir o sobrinho (16.4).
- **Diálogo da primeira vez na partida** (uma vez por partida, como 14.9.1): página 1, "O Nick acordou! Ele vai seguir você."; página 2, "Aperte X para farejar.". Barra "Z: avançar  X: fechar" (14.8). Sem tempo automático. Nova partida repete.
- **Nick acordado e A:** A nele abana o rabo (animação "feliz", 1 s), sem texto e sem efeito. Isso só acontece quando nenhum outro objeto é alvo: Nick acordado perde o desempate para qualquer objeto na frente ou encostado. Assim o A nunca "rouba" o interruptor ou a porta.

### 16.4 Seguir

**16.4.1 Distância e atraso.** Nick anda pelo mesmo caminho do sobrinho, **1 tile atrás, encostado** (versão 0.7.1; antes, 2 tiles): ele segue o último tile por onde o sobrinho passou. Cada passo do sobrinho é um passo do Nick. Quando o sobrinho para, Nick para no tile que o sobrinho deixou por último, sempre encostado, nunca em cima do sobrinho. A velocidade é a do sobrinho (inclusive o 2× da condução). Animação: andar nas 4 direções (4 quadros cada); parado, a pose da última direção.

**16.4.2 Portas.** Nick não atravessa sozinho e não teleporta. Quando o sobrinho troca de área (fade de 0,5 s, 14.10.5), Nick acordado vai junto, **no mesmo fade**, para o **tile de chegada** do sobrinho, **oculto** (não desenhado). Não tem fade próprio. Ele aparece inteiro **no primeiro passo** do sobrinho dentro da área nova: fica no tile de chegada, 1 tile atrás do sobrinho, e a partir daí segue como em 16.4.1. O passo que conta é o que leva a um tile da área; entrar no gatilho da porta é a troca de área, não um passo. Enquanto está oculto, Nick não bloqueia, não é alvo do A e nunca fica à frente do sobrinho. Se o sobrinho troca de área de novo antes do primeiro passo, o Nick oculto vai junto para a nova chegada. Nick nunca fica para trás: segue em todas as áreas abertas. Nick dormindo não muda de lugar. A "semente" vizinha da chegada, do texto anterior desta seção, sai (versão 0.7.1, 16.17). Regra de posição: ADR-005, seção 3.2 (a revisar, backlog 083).

**16.4.3 Colisão.** Nick acordado **não bloqueia**: não é obstáculo para o sobrinho e não entra em nenhuma rota de condução. Quando o sobrinho dá a volta e entra no tile dele, Nick passa para o tile que o sobrinho acabou de deixar: os dois trocam de lugar no mesmo passo. Ao fim do passo, Nick nunca está em cima do sobrinho (versão 0.7.1; antes, Nick era desenhado atrás). Nick dormindo é o oposto: bloqueia o tile (16.3).

**16.4.4 Condução.** Nick acompanha a condução (conquista das luzes e de cada peça) na mesma fila: segue o caminho e para 1 tile atrás do sobrinho, encostado, no caminho dele (versão 0.7.1; antes, 2 tiles). Não interrompe, não entra em diálogo e não muda a rota (14.11.2, D1). Se Nick estava dormindo quando a condução começou, ele não acompanha, e o tile dele conta como bloqueado para a rota (regra única de 16.4.3 e 16.3). Por isso a Arte escolhe o tile de dormir de modo que nenhuma rota de condução passe por ele: é a regra N009 do ADR-005, e o teste N14 cobre o pior caso (16.14).

**16.4.5 Dormindo.** Nick dormindo não segue, não se mexe, bloqueia o tile e não reage a nada, exceto a A e B (16.3 e 16.5.5).

**16.4.6 Sem tecla própria.** Seguir é automático. Nick não tem ação de movimento.

### 16.5 Farejar (B)

**16.5.1 Quando.** B (X ou Esc) na exploração, com Nick acordado. Com Nick dormindo, B mostra o balão "zzz" (16.5.5). B não faz nada em diálogo, painel, tela de conquista, dica, condução nem fade.

**16.5.2 Alvo por fase.** O alvo é o item procurado. A regra de peça está em 16.5.7.

| Fase | Alvo | Subárea que a seta procura |
|---|---|---|
| Porta | Não se aplica: o Nick dorme na Sala, atrás da porta, e não pode ser acordado antes dela. Se B for apertado, vale 16.5.5 ("zzz") | (não se aplica) |
| Luzes | Interruptor | Sala |
| Parte 1 | Peça 1, na Sala (1, 4) | Sala |
| Parte 2 | Peça 2, na Cozinha (4, 1) | Cozinha e Lavanderia |
| Parte 3 | Peça 3, na Lavanderia (3, 5) | Cozinha e Lavanderia |
| Depois da parte 3 | Nenhum (Marco 4 traz o enfeite). Sem alvo: 16.5.6 | Sem seta (16.5.6) |

O alvo é a **subárea** (o cômodo do farejar, 16.5.4), não o tile do item. Cozinha e Lavanderia são **um só alvo**: a Lavanderia é a mesma subárea da Cozinha (ADR-004, seção 2), então a peça 2 e a peça 3 têm como alvo a Cozinha, e o farejar não distingue os dois.

**16.5.3 Como é a seta** (decisão do Produto, pendência 4).
- A seta mostra **uma porta**: a que se atravessa para ir ao cômodo do alvo, a porta "a seguir". Ela não aponta para o tile do item nem para uma direção livre na tela. Se o cômodo do alvo não é vizinho, mostra só o primeiro passo. Exemplo: no Quarto, com o alvo na Cozinha, a seta aponta para a P2, que leva à Sala.
- **Desenho:** seta **amarela** (`#f4d35e`; a mesma cor que as seções anteriores chamavam de dourada) sobre o gatilho dessa porta, apontando para a direção de saída. Durante os 5 s, ela substitui a seta branca estática daquela porta (14.10.10), se houver. A amarela é a cor do farejar e é distinta da seta branca das portas (versão 0.7.1).
- **Tremidas (versão 0.7.1, decidido pelo Diretor):** ao aparecer, no fim do farejando, a seta faz **2 tremidas**. Cada tremida dura 0,4 s e desloca a seta 2 px para um lado e para o outro, na direção da seta (horizontal para direita e esquerda; vertical para cima). Depois, a seta fica parada até sumir. O sobe e desce de 0,8 s sai. Não é pisca: o pisca é só da árvore (14.9.3).
- **Direções usadas no Marco 3:** direita (P7, P2 e P3 saindo da Sala); esquerda (P7 saindo da Cozinha, P2 saindo do Quarto, P3 saindo do Escritório); cima (P8 saindo do Hall). A seta para baixo não é usada, porque nenhum alvo fica no Hall.
- **Acima da penumbra:** a seta aparece também no escuro, como a barra. A porta já é conhecida, então a seta não revela nada novo.
- **Duração:** 5 s, contados a partir do fim do farejando. Depois some com fade de 0,5 s.
- **Apertar B de novo (versão 0.7.1, decidido pelo Diretor: "reinicia a animação e os 5 s"):** com a seta visível, B refaz o ciclo: Nick faz o farejando de novo (1,2 s), a seta treme de novo (2 tremidas) e os 5 s recomeçam. A seta continua visível durante o novo farejando, sem sumir. B é ignorado só enquanto o farejando está em curso. Sem cooldown e sem limite. Interpretação do Produto para "a animação" (refazer o farejando ou só as tremidas): pergunta 35 (a).
- **Limite:** nenhum. Sem cooldown e sem contador (pilares 1 e 2).
- **Como se escolhe a porta:** a partir da subárea atual do sobrinho, a seta mostra a **primeira porta** do caminho até a subárea do alvo, pelas portas abertas da fase (busca em largura). Se houver mais de um caminho de mesmo tamanho, a seta usa sempre a mesma porta (ordem do mapa), e isso é igual em toda execução (ADR-005, seção 4.2).
- **Trocar de cômodo:** a seta some. Passar pelo gatilho não muda nada: a seta é só desenho (16.14, F9).
- **Antes da seta:** Nick faz "farejando" (4 quadros, cerca de 1,2 s) e para. O sobrinho continua livre para andar durante o farejar.

**16.5.4 Alvo no mesmo cômodo.** Nick fareja (1,2 s) e o balão "Au!" aparece sobre ele por 1,5 s. Nenhuma seta, nenhum texto. "Au!" diz que o item está ali, sem dizer onde. O cômodo do farejar é a subárea (14.10.1): Cozinha e Lavanderia são o mesmo cômodo, porque ficam na mesma tela. Cada B repetido no cômodo do alvo refaz o farejando e o "Au!" (versão 0.7.1, 16.17). Como a seta some ao trocar de cômodo (16.5.3), no alvo o B só dá "Au!", nunca seta.

**16.5.5 Nick dormindo.** B mostra o balão "zzz" sobre o sobrinho por 1,5 s. Sem seta, sem texto, nada muda. A dica explica como acordar (16.8.2).

**16.5.6 Depois da parte 3.** O jogo fica livre e não há alvo no Marco 3. O Nick volta a dormir na Sala (16.2.2, 16.6). Então:
- **Nick acordado:** B faz Nick abanar (animação "feliz", 1 s) com "Au!". Sem seta, sem texto.
- **Nick dormindo:** B mostra "zzz" (16.5.5). Nada muda.
- **Para ver o abanar:** o jogador acorda o Nick de novo com A (16.3). O diálogo de primeira vez não se repete, porque ele vale uma vez por partida. O acordar segue 16.3 (animação de 1,2 s, balão "Au!" no segundo quadro).
- **Critério:** depois da parte 3, com Nick dormindo, B mostra "zzz"; A acorda o Nick sem diálogo; com Nick acordado, B faz o abanar com "Au!", sem seta (F6).

**16.5.7 Peça escondida (relação com 15.2.7).** O alvo é sempre a peça **visível** da fase. Peça escondida nunca é alvo e nunca aparece na seta. Exemplo: com a parte 1 não encaixada, B na Cozinha mostra a seta para a esquerda na P7, que leva ao alvo (peça 1, na Sala), e não revela a peça 2 escondida. O aviso "ainda não" (15.2.7) continua sendo a única pista da peça escondida, e só por tentativa no tile.

### 16.6 Voltar a dormir

- **Quando:** no fim da fase, com o controle devolvido ao sobrinho, depois do diálogo de chegada (14.9.3 para as luzes; 15.6.5 para as peças). Não há pressa e nada se perde.
- **Destino:** o tile de dormir da missão que fica ativa depois da conclusão, isto é, o `nick.dorme` da próxima fase (16.2.2). Depois da parte 3, não há missão ativa: o destino é a Sala (16.2.2, "depois").
- **Como:** Nick sai da fila e aparece dormindo nesse tile, com uma fumacinha de 0,5 s. Ele não anda até lá. Pergunta 33: a alternativa é ele andar sozinho até lá.
- **Se não foi acordado na fase:** ele também muda para o tile da próxima fase, com a mesma fumacinha. O lugar da fase é o que vale, e Nick não precisa ter sido acordado para trocar de lugar.
- **Depois da parte 3:** Nick volta para a Sala, no tile de 16.2.2.
- **Uma vez por partida:** a sequência de fases acontece uma vez. Voltar a um cômodo depois não repete nada.
- **Nova partida:** Nick na Sala, dormindo.

### 16.7 Reações às conquistas

- **Ao chegar à árvore com uma conquista** (luzes ou peça): Nick acordado faz "feliz" (4 quadros, 1,6 s: pulinhos, faíscas amarelas e um coração) e o balão "Au!" aparece uma vez. Na conquista das luzes, a reação acontece com o pisca de 14.9.3. Na peça, acontece junto com o encaixe de 0,6 s. O jogo não espera a reação: o diálogo começa no mesmo momento.
- **Nick dormindo:** não reage. A fumacinha de 16.6 é a única animação.
- **Tela de conquista (15.5):** continua só com o sobrinho comemorando. Nick não entra nela, para não lotar 480×352 (ideia futura, 16.15).
- **Depois da parte 3:** Nick abana ao ser farejado (16.5.6).

### 16.8 Tela de dica

**16.8.1 Como abre.** H na exploração, ou clique com o mouse no **ícone de ajuda**: um "?" no canto superior direito, 32×32 px no perfil HD, com caixa `#1b2452` e borda 1 px `#9aa3c7` (como os botões de 14.9.4). O ícone aparece em toda tela de exploração e some em diálogo, painel, conquista, dica, condução e fade. Ele fica fora de qualquer cômodo do Marco 3 (a coluna 14 e a linha 0 não pertencem a nenhuma subárea, 14.12.2), então não cobre objeto.

**16.8.2 O que mostra.**
- Título "Dica" (texto informativo, sem caixa).
- Imagem da árvore no **estado atual** (0 a 3, 15.4), ampliada pelo maior inteiro que cabe. Sprites: `spr_arvore_desmontada`, `spr_arvore_1parte`, `spr_arvore_2partes` e `spr_arvore_completa` (estado 3 sem enfeite; ver 16.13).
- Texto da fase e do Nick (16.11), até 3 linhas de 28 caracteres.
- Botão "Voltar", com foco inicial (estados de botão, 14.9.4).

**16.8.3 Como fecha.** Z, X, Esc, Enter ou clique em "Voltar". H não fecha, porque a barra não lista H. Ao fechar, o jogo volta ao mesmo ponto, sem efeito.

**16.8.4 Barra.** "Z ou X: voltar" (14.8, Marco 3).

**16.8.5 Pausa e bloqueio.** Com a dica aberta, o mundo congela: sobrinho, Nick, animações e o tempo da seta de farejar param. Ao fechar, tudo retoma de onde parou. A dica não tem tempo, não tem estado de jogo (aberta ou fechada é só a tela) e não tira nada do jogador (pilar 2). Só Z, X, Esc, Enter ou "Voltar" fecham; H não fecha (16.8.3). Não há tela de pausa no Marco 3 (seção 13, Marco 6).

**16.8.6 Quando não abre.** H e o ícone não abrem a dica no título, na seleção, na introdução, em diálogo, no painel da porta, na tela de conquista, na condução (barra vazia, 14.8) nem durante o fade de porta. O ícone some nessas telas.

**16.8.7 Desde quando.** Existe desde a primeira exploração, no Hall, antes da porta (fase porta).

**16.8.8 Não entrega posição.** Nenhum texto da dica diz cômodo, tile, direção ou porta. A imagem é da árvore, nunca da peça. A dica não mostra o código da porta (4.2 e 14.1; o código fica no bilhete).

### 16.9 Barra de controles (muda 14.8)

- **Exploração, do Marco 3 em diante: duas linhas fixas.**
  - Linha 1: "Setas: andar  Z: examinar"
  - Linha 2: "X: farejar  H: dica"
- **Texto fixo:** a barra não muda com o estado do Nick (14.8: o texto não muda com o estado do jogo). "X: farejar" aparece desde a primeira exploração. Com Nick dormindo, X mostra "zzz" (16.5.5), e a dica explica o resto.
- **Posição:** as duas linhas ocupam as linhas 9 e 10 da tela (y de 288 a 352 px no perfil HD). Nos cômodos do Marco 3, só a Sala tem chão na linha 9: os tiles (0, 9) e (1, 9), no canto inferior esquerdo, sem objeto. Hall, Cozinha e Lavanderia, Quarto e Escritório ficam acima da linha 9. **Pergunta 31:** o padrão é bloquear esses 2 tiles. O item 073 espera a resposta; os demais itens não.
- **Condução:** barra vazia (exceção de 14.8).
- **Dica:** "Z ou X: voltar" (16.8.4).
- **Demais telas:** iguais às do Marco 1 e do Marco 2 (14.8, 15.7).
- **Medidas:** cada linha tem no máximo 32 caracteres (14.8). Dois espaços entre ações. Margem de 8 px e 4 px da borda inferior. Sem caixa. Nunca cortada.

### 16.10 Como jogar: linhas novas (acrescenta a 14.1)

Depois da linha "Botão B: X ou Esc. Voltar e fechar textos.", a tela ganha duas linhas, nesta ordem:
- "Farejar: X, com o Nick acordado."
- "Dica: H, ou clique no ícone ?"

As demais linhas e a barra "Z ou X: voltar" não mudam. O texto precisa caber em 480×352 sem corte (captura).

### 16.11 Textos do Marco 3 (pt-BR)

Chaves novas em `content/texts/pt-BR.json`, com texto exato e quebra automática. Limites: diálogo com até 2 linhas de 28 caracteres por página; dica com até 3 linhas de 28.

| Chave | Texto | Onde aparece |
|---|---|---|
| `barra.casa` | "Setas: andar  Z: examinar" (existente) | Exploração, linha 1 (16.9) |
| `barra.casa2` | "X: farejar  H: dica" | Exploração, linha 2 |
| `barra.dica` | "Z ou X: voltar" | Tela de dica |
| `comojogar.farejar` | "Farejar: X, com o Nick acordado." | Como jogar (16.10) |
| `comojogar.dica` | "Dica: H, ou clique no ícone ?" | Como jogar (16.10) |
| `dica.titulo` | "Dica" | Título da tela de dica |
| `dica.voltar` | "Voltar" | Botão da tela de dica |
| `dica.porta` | "Leia o bilhete na parede." / "Ele tem a pista da senha." | Fase porta |
| `dica.luzes.dormindo` | "A casa está escura." / "Procure o interruptor." / "O Nick está dormindo." | Fase luzes, Nick dormindo |
| `dica.luzes.acordado` | "A casa está escura." / "Procure o interruptor." / "Aperte X e o Nick fareja." | Fase luzes, Nick acordado |
| `dica.parte1.dormindo` | "Procure uma parte da árvore." / "O Nick ainda está dormindo." | Parte 1, Nick dormindo |
| `dica.parte1.acordado` | "Procure uma parte da árvore." / "Aperte X e o Nick fareja." | Parte 1, Nick acordado |
| `dica.parte2.dormindo` | "Procure a parte do meio." / "O Nick ainda está dormindo." | Parte 2, Nick dormindo |
| `dica.parte2.acordado` | "Procure a parte do meio." / "Aperte X e o Nick fareja." | Parte 2, Nick acordado |
| `dica.parte3.dormindo` | "Procure a parte de cima." / "O Nick ainda está dormindo." | Parte 3, Nick dormindo |
| `dica.parte3.acordado` | "Procure a parte de cima." / "Aperte X e o Nick fareja." | Parte 3, Nick acordado |
| `dica.livre` | "A árvore está montada!" / "Explore a casa no seu ritmo." | Depois da parte 3. No Marco 4 sai de uso: a fase enfeites tem a sua dica (17.10) |
| `nick.acordou` | Página 1: "O Nick acordou! Ele vai seguir você." / Página 2: "Aperte X para farejar." | Primeiro acordar da partida (16.3) |
| `nick.latido` | "Au!" (balão, não é diálogo) | Acordar, farejar no mesmo cômodo, chegada com conquista, abanar depois da parte 3 (16.5.6) |

- Nenhum texto cita nome de pessoa da família (14.10.6, item 034).
- Nenhum texto da dica diz cômodo, tile ou direção (16.8.8).
- Os textos são propostas do Produto e ficam sujeitos à pergunta 34.

### 16.12 Regras para crianças de 5 a 10 anos

1. **Nick nunca some de vez.** Ele sempre volta a seguir, e dorme em cômodo aberto, sempre a uma porta da Sala (16.2.2).
2. **Nick não atrapalha.** Acordado, ele não bloqueia nem trava o caminho (16.4.3).
3. **Sem tempo e sem limite.** Farejar pode ser repetido; a seta dura 5 s; nada se perde (pilar 1).
4. **Ajuda sem entregar.** A seta mostra a porta, o "Au!" mostra que o item está ali, e a dica fala do que fazer, nunca do lugar (pilar 2).
5. **Sem punição.** X com Nick dormindo só mostra "zzz", sem texto de erro.
6. **Três caminhos para a mesma ajuda.** A (acordar e examinar), X (farejar) e H ou o ícone (dica), todos na barra.
7. **Textos curtos.** Diálogo de até 2 linhas de 28 caracteres por página; dica de até 3 linhas; frases que uma criança de 5 anos acompanha.
8. **Dica sempre disponível, nunca obrigatória.** Ela não muda estado e não trava nada (pilar 2).
9. **Criança e adulto leem o mesmo texto.** A dica diz o que fazer, e o adulto pode ler junto (pilar 4).
10. **A primeira vez ensina.** O diálogo do acordar explica o Nick; depois disso o jogo não repete.

### 16.13 Placeholders e o que depende do Diretor

- **Placeholder aceito no 0.7.0** (a Arte troca depois, sem mudar código): balão "Au!", balão "zzz", "!" amarelo de acordar, fumacinha, seta de farejar (a seta branca de `spr_indicador_seta_*` recolorida), ícone "?" da HUD, e o Nick em cores provisórias até os sprites finais.
- **Sprites finais do Nick (Arte).** A folha oficial é `assets/referencia/ref_nick_folha.webp`. A folha geral, com os quadros de andar, é `assets/referencia/ref_todos_folha.webp`. A Arte gera os sprites a partir delas, como fez com os sobrinhos (`tools-arte/gerar_sobrinhos.py`). Tamanho: ponto de partida 32×32 px, como diz a folha; os sobrinhos são 32×48 no perfil HD. A Arte decide na prévia se o Nick fica em 32×32 ou passa a 32×48, mostrando os dois lado a lado; o Diretor aprova na captura (ver ADR-003, teste de sprite). Não é pergunta: é a conferência normal de arte.
- **Árvore estado 3 sem enfeite.** `assets/hd-480x352/spr_arvore_completa.png` precisa ser a árvore montada **sem enfeites** (15.4). A Arte confirma; se tiver enfeite, faz a versão sem (o enfeite é do Marco 4). Item 068.
- **Seta para cima (nova).** Não existe em `assets/hd-480x352/`. A Arte cria (item 068). Direita e esquerda reaproveitam a seta branca, recolorida.
- **Depende do Diretor:** respostas 31 a 34. A arte do Nick não depende de criação nova do Diretor: a folha já é a referência oficial (decisão de 2026-11-07).
- **Áudio:** o latido sonoro fica no Marco 6 (7.3). Até lá, o balão "Au!" faz esse papel.

### 16.14 Casos de QA (Marco 3)

Com os 4 sobrinhos, no teclado, salvo indicação. Cada rodada do QA dura no máximo 15 minutos (regra do Diretor, 2026-11-07). O que não couber vira "não testado (limite de tempo)".

**Nick (N)**
- **N1 (início):** nova partida; Nick dormindo na Sala, no tile de 16.2.2, visível dentro do círculo de luz quando a P8 abre. Captura.
- **N2 (acordar):** A na frente de Nick dormindo, e também com o sobrinho encostado de lado, olhando para o outro lado (Q4). Animação de 1,2 s com o controle travado. Depois, "O Nick acordou! Ele vai seguir você." e "Aperte X para farejar.", com barra "Z: avançar  X: fechar".
- **N3 (uma vez):** outro acordar na mesma partida não mostra o diálogo de primeira vez.
- **N4 (seguir):** andar 10 passos com Nick acordado. Ele fica 1 tile atrás, encostado, pelo mesmo caminho; parado, para no tile que o sobrinho deixou por último (versão 0.7.1).
- **N5 (não bloqueia):** passar sobre o tile de Nick acordado, dar a volta e voltar contra ele, sem travar. No passo de volta, Nick passa para o tile que o sobrinho deixou; nunca fica em cima dele (16.4.3).
- **N6 (portas):** P8, P7, P2 e P3 com Nick acordado. Na troca de área ele vai junto, oculto (não aparece). No primeiro passo do sobrinho dentro da área, ele aparece no tile de chegada, 1 tile atrás. Captura de antes e depois do primeiro passo; em nenhum quadro ele está à frente do sobrinho. Sem fade próprio: o fade é o de 0,5 s do sobrinho (16.4.2).
- **N7 (condução):** luzes e cada peça com Nick acordado. Ele vai 1 tile atrás do sobrinho, pelo caminho, e para com ele; nenhuma tecla o interrompe.
- **N8 (reação):** ao chegar à árvore com a conquista, Nick faz "feliz" de 1,6 s com "Au!" uma vez. O diálogo começa sem esperar a animação.
- **N9 (dormir):** ao fim do diálogo de chegada, Nick some com fumacinha e aparece dormindo no tile da próxima fase. Não segue até ser acordado.
- **N10 (cômodo por fase):** luzes na Sala; parte 1 na Cozinha; parte 2 no Quarto; parte 3 no Escritório; livre na Sala (16.2.2). Nos 4 sobrinhos (ao menos um inteiro e captura nos outros).
- **N11 (bloqueio):** Nick dormindo bloqueia o tile; andar contra ele não atravessa; A na frente acorda.
- **N12 (desempate):** A em Nick acordado, sem outro alvo, faz abanar (1 s), sem texto. Com interruptor ou porta na frente, o alvo responde.
- **N13 (nova partida):** Nick volta a dormir na Sala, e o diálogo de primeira vez volta.
- **N14 (rota):** nenhum trajeto de condução passa pelo tile de dormir da fase. Teste de domínio com o tile de Nick tratado como bloqueado, que é a regra única (16.4.4); N009 do ADR-005 garante o mesmo antes do QA (pior caso).
- **N15 (fora da conquista):** Nick não aparece na tela de conquista.

**Farejar (F)**
- **F1 (seta):** Nick acordado, alvo em outro cômodo. "Farejando" de 1,2 s; seta amarela sobre o gatilho da porta a seguir, na direção certa; 2 tremidas ao aparecer, depois parada; some em 5 s, com fade de 0,5 s (16.5.3).
- **F2 (sem limite):** B repetido sem esperar funciona; B com a seta visível refaz o farejando, as 2 tremidas e os 5 s (16.5.3; pergunta 35 a); B durante o farejando não faz nada.
- **F3 (mesmo cômodo):** alvo na mesma tela. "Farejando" e "Au!" por 1,5 s; nenhuma seta. Cada B repetido refaz os dois (16.5.4).
- **F4 (direções):** do Hall com alvo na Sala, seta para cima sobre a P8. Da Cozinha com alvo na Sala, seta para a esquerda sobre a P7. Da Sala com alvo na Cozinha, seta para a direita sobre a P7. Do Quarto com alvo na Sala, seta para a esquerda sobre a P2. Do Escritório com alvo na Sala, seta para a esquerda sobre a P3.
- **F5 (Nick dormindo):** B mostra "zzz" por 1,5 s; sem seta, sem texto, nada muda.
- **F6 (depois da parte 3):** com Nick dormindo, B mostra "zzz"; A acorda o Nick sem diálogo; com Nick acordado, B faz Nick abanar com "Au!"; sem seta (16.5.6).
- **F7 (peça escondida):** com a parte 1 não encaixada, B na Cozinha aponta para a P7 (alvo: peça 1, na Sala). A seta nunca aponta para a peça 2 escondida.
- **F8 (outras telas):** B durante diálogo, painel, dica, conquista e condução não faz nada.
- **F9 (só desenho):** andar sobre o gatilho da porta, com a seta visível, leva ao outro cômodo, como sem seta.

**Dica (D)**
- **D1 (abrir):** H na exploração abre a dica; clique no ícone "?" com o mouse também abre; o botão "Voltar" tem foco inicial.
- **D2 (fechar):** Z, X, Esc ou clique em "Voltar" fecham; H não fecha; o jogo continua no mesmo ponto.
- **D3 (conteúdo):** fase porta; luzes (dormindo e acordado); parte 1, 2 e 3 (dormindo e acordado); livre. Texto exato de 16.11 nos 4 nomes (ao menos uma de cada fase por sobrinho; o restante por amostra).
- **D4 (imagem):** a árvore da dica é a do estado atual (0, 1, 2 e 3), e o estado 3 não tem enfeite.
- **D5 (bloqueios):** H e o ícone não abrem em título, seleção, introdução, diálogo, painel, conquista, condução nem fade. O ícone some nessas telas.
- **D6 (sem efeito):** abrir e fechar a dica não muda peça, árvore, Nick nem estado. A seta de farejar para no tempo e retoma.
- **D7 (textos):** cada linha tem até 28 caracteres, e a dica tem até 3 linhas, sem corte em 480×352 (captura).
- **D8 (sem posição):** nenhum texto da dica cita cômodo ou direção ("Sala", "Cozinha", "Quarto", "Escritório", "esquerda", "direita", "cima", "baixo").

**Barra e textos (B)**
- **B1 (exploração):** Hall, Sala, Cozinha, Quarto e Escritório mostram "Setas: andar  Z: examinar" e "X: farejar  H: dica" em duas linhas, com margens de 8 px e 4 px. Cabe sem corte.
- **B2 (condução):** barra vazia; ícone escondido.
- **B3 (linha 9 da Sala):** se a pergunta 31 for sim, os tiles (0, 9) e (1, 9) não são andáveis, e nenhum outro tile da Sala muda (captura e teste). Se não, o caso é N/A.
- **B4 (estável):** a barra não muda quando o Nick acorda ou dorme.
- **B5 (Como jogar):** as duas linhas novas aparecem; "Z ou X: voltar" não muda; cabe em 480×352 sem corte. Nenhum texto cita nome de família.

**Ordem de prioridade** (se o tempo acabar): N1, N2, N4, N9, N10, F1, F4, D1, D3, B1. O restante vem depois.

### 16.15 Versão, entrega e playtest

- **Versão:** 0.7.0 (SemVer: recurso novo, versão menor). Visível no título e no build de playtest. Ajustes do PT3 em 0.7.1 (correção, patch; 16.17).
- **Capturas antes do artifact:** o Diretor aprova N1 (Nick dormindo na Sala), Nick acordado seguindo pela Sala, F3 (Au!), F4 (setas para a direita e para cima), D3 (dica nas fases porta, luzes, parte 1 e livre), B1 (barra de 2 linhas) e B5 (Como jogar).
- **Roteiro de playtest (PT3, Orquestrador):** título, Começar, seleção, introdução, porta (Nick dormindo, visto ao abrir a porta), luzes (acordar, farejar, dica), condução, parte 1 (farejar a partir da Cozinha), parte 2 (Quarto), parte 3 (Escritório), livre (dica e árvore montada).
- **Perguntas-chave (CLAUDE.md, PT3):** Nick é carismático? A seta ajuda sem estragar o jogo? A dica orienta sem frustrar? Acrescentar: a criança acha o Nick sem ajuda? A seta de farejar é clara? "Au!" e "zzz" são entendidos sem texto?
- **Fora de escopo deste marco:** sorteio (11), corrida (4.1), enfeites e créditos (Marco 4), toque e aviso de rotação (Marco 5), áudio e tela de pausa (Marco 6). Ideias futuras: Nick na tela de conquista; afagar o Nick com texto; caminhada especial do Nick como animação extra (a Arte decide).

### 16.16 Pendências deste marco

- Perguntas 31 a 34 em 12, com padrão aplicado. Só a 31 bloqueia um item (073). A 31 segue aberta.
- Itens de backlog 064 a 079 em `backlog.md`, com dono, critério de aceite e dependências. O 079 são os ajustes de ADR-002 e ADR-004 que este marco pede, depois do aceite do ADR-005.
- Contrato técnico novo: `docs/ADR-005.md` (Especialista, item 065; escrito em 2026-11-08, aguarda aceite do Orquestrador). O motor não deve implementar nada fora dele.
- Ajustes do PT3 (versão 0.7.1, 16.17): backlog 080 a 085. Pergunta 35 respondida pelo Diretor (siga a sugestão). ADR-005 revisado (backlog 083).

### 16.17 Ajustes do PT3 (versão 0.7.1, 2026-11-09)

Origem: retorno do Diretor ao PT3 (`playtests.md`, "PT3 — retorno do Diretor", 2026-11-09). Decisões do Diretor, com a 0.7.0 como base. Backlog 080 a 085. Nada disso muda texto de tela, conteúdo de `content/` nem a regra de quem dorme em cada fase.

**(a) Seta de farejar: 2 tremidas e amarela (16.5.3, 16.5.4, 16.14 F1 a F3).**
- Cor: amarela `#f4d35e`, distinta da seta branca das portas (14.10.10). Não é cor nova: é a que as seções anteriores chamavam de dourada.
- Ao aparecer (fim do farejando, 1,2 s): 2 tremidas de 0,4 s, 2 px para um lado e para o outro, na direção da seta. Depois fica parada até os 5 s. O sobe e desce sai.
- B de novo com a seta visível: refaz o ciclo (farejando, tremidas e 5 s). B é ignorado só enquanto o farejando está em curso. Pergunta 35 (a): padrão sim.
- Mesmo cômodo do alvo: sem seta; "Au!" por 1,5 s; cada B repetido refaz o farejando e o "Au!". Ao trocar de cômodo, a seta some (16.5.3), então no alvo nunca há seta.
- O retorno registrou que, numa vez, B "não repetiu" o farejar. Pela regra acima, o B repetido no mesmo cômodo refaz farejando e "Au!". O QA confirma se houve falha ou se foi só a ausência de seta (backlog 084). Bugs confirmados: nenhum.

**(b) Nick mais colado (16.4.1, 16.4.3, 16.4.4, 16.14 N4, N5, N7).**
- Distância de seguir: **1 tile atrás, encostado**, no caminho do sobrinho. Antes: 2 tiles. Onde o texto citava "2 tiles" ou "2 passos", vale 1 tile.
- Parado: Nick para no tile que o sobrinho deixou por último.
- Ida e volta: quando o sobrinho volta sobre o tile do Nick, o Nick passa para o tile que o sobrinho deixou; os dois trocam de lugar no mesmo passo, e ao fim do passo o Nick não está em cima dele.
- Condução: para 1 tile atrás do sobrinho, no caminho dele (não "ao lado da árvore").

**(c) Troca de área com Nick oculto (16.4.2, 16.14 N6).**
- Substitui a semente vizinha da chegada (texto anterior de 16.4.2 e ADR-005 seção 3.2).
- Troca de área com Nick acordado: ele vai junto, no mesmo fade, para o tile de chegada do sobrinho, **oculto** (não desenhado).
- Ele aparece inteiro no **primeiro passo** do sobrinho para um tile da área (entrar no gatilho da porta não conta). Fica no tile de chegada, 1 tile atrás, e segue.
- Nunca aparece à frente do sobrinho. Oculto: não bloqueia, não é alvo do A.
- Proposta do Produto, para o Especialista confirmar no ADR-005 (não é pergunta ao Diretor): enquanto oculto, B funciona como em 16.5 (seta ou "Au!"), mas sem a animação de farejar, porque Nick não está desenhado.
- Dormindo: não muda de lugar na troca de área (como antes).

**Critérios antigos que conflitam e já foram trocados neste GDD:** N4 (2 tiles), N5 (passo de volta), N6 (aparecer junto com o sobrinho, no fade), N7 (ao lado da árvore), F1 (cor dourada), F2 (reinício só dos 5 s), F3 (repetição). Backlog 069 (2) e (4) e 070 (3) foram ajustados no mesmo sentido.

**Pontos para o Especialista (ADR-005, backlog 083):**
- Seção 1.1: "Semente" sai da troca de área; "fila" passa a ter 2 entradas.
- Seção 1.2: `FilaDoSobrinho` com `CASAS_ATRAS_DO_NICK = 1` (2 entradas); `alvo()` sem semente; `entrarNaArea(chegada, direcao)` com estado oculto, sem parâmetro `semente`.
- Seção 1.4 e 1.6: a função `semente` e `semente.ts` saem. O uso de `comSemente` no despertar (`acordar`) é outra coisa e pode ficar.
- Seção 3.1 (fila de 1), 3.2 (chegada oculta; o fallback de semente vira a regra), 3.3 (condução a 1 tile).
- Seção 4.5: B refaz o farejando e as tremidas; sobe e desce sai.
- Seção 7.2 e 8: temporização (2 tremidas de 0,4 s) e testes (semente sai; testes de ocultação e de ida e volta entram).
- Seção 9: riscos 3, 4 e 9 revistos. Novo risco: B com Nick oculto (proposta acima).
- Definição de "passo" para a troca de área: tile da área, não o gatilho da porta.

---

## 17. Especificação do Marco 4 (enfeite e créditos, versão 0.8.0)

Detalha o Marco 4 (seção 13, item 4). Origem: o retorno PT3b do Diretor, em 2026-11-09 ("Deu tudo certo, pode continuar.", `playtests.md`), liberou o Marco 4. Versão do jogo ao fim do marco: **0.8.0** (SemVer: recurso e missão novos, versão menor; ADR-002 seção 1). Textos entre aspas são propostas do Produto para `content/texts/pt-BR.json` (chaves em 17.8). **[Pendente]** = pergunta aberta (seção 12, 36 e 37), com o padrão já aplicado.

Tudo o que os Marcos 1 a 3 fixaram continua valendo, salvo o que esta seção muda de forma explícita: o texto do exame do estado 3 (15.4), a frase "depois da parte 3" (15.6.8), a linha "Depois da parte 3" de 16.2.2 e o `dica.livre` (16.11). Os casos E9 e E12 de 15.10 mudam pelo mesmo motivo (17.13, RG1).

### 17.1 Escopo e fluxo

| Etapa | No Marco 4 | Onde está |
|---|---|---|
| Introdução, porta, luzes, partes 1 a 3 | Como no Marco 3. Ao fim da parte 3, Nick vai dormir na Sala | 14, 15, 16 |
| Fase enfeites (nova) | Começa quando o diálogo de chegada da parte 3 fecha (depois da página 3, 0.8.1). A caixa aparece no Escritório | 17.2, 17.3, 17.18 |
| Caixa de enfeite | Achada, aberta com A, levada à árvore pela condução e encaixada com animação própria | 17.3, 17.4 |
| Árvore com enfeites (estado 4) | Muda só no encaixe da caixa | 17.5 |
| Nick e farejar | Nick dorme na Sala; farejar aponta para o Escritório | 17.6 |
| Dica (H e ícone "?") | Texto próprio da fase enfeites | 17.10 |
| Diálogo final e créditos | Diálogo final, fade, créditos (automáticos, pergunta 37 = A) | 17.4, 17.7 |
| Fora deste marco | Toque e rotação (Marco 5); áudio, pausa e polimento (Marco 6); sorteio e corrida (seção 11); save (nunca, seção 3) | 17.14 |

### 17.2 A fase enfeites

- **Começa:** quando o diálogo de chegada da parte 3 fecha, o que só acontece depois da página 3 (`arvore.chegada.3`, 15.6.5; 17.18). Com o controle devolvido (15.6.6), Nick vai dormir na Sala (17.6) e a caixa passa a existir (17.3).
- **Termina:** com o encaixe da caixa e o diálogo final (17.4). Depois, os créditos (17.7). Não há fase depois. A missão é a última da partida (campo `final`, 17.12).
- **Sem pressão:** nada na tela conta o tempo nem mostra contador. A única pista do que falta é o exame da árvore (17.5) e a dica (17.10).

### 17.3 A caixa de enfeite

- **Quantidade e lugar:** 1 caixa, no **Escritório** (pergunta 2 decidida pelo Produto, padrão; ver 12). Razões: o Escritório não tem peça (4.5); a P3 já está aberta na parte 3 (15.3); fica a uma porta da Sala (16.12, regra 1); e o farejar da Sala aponta para a P3, que o jogador já conhece (16.5.3).
- **Tile:** a Arte escolhe, com estas regras: chão livre; pelo menos 2 vizinhos livres, nenhum deles peça; fora de móvel, gatilho, vão, chegada, bilhete, interruptor e árvore; fora das linhas 9 e 10 da tela; diferente do tile de dormir da parte 3 (16.2.2, Escritório).
- **Até o diálogo de chegada da parte 3 fechar** (`arvore.chegada.3`, 17.2; inclui as páginas 1 e 2, 17.18): a caixa não aparece (sem desenho, sem brilho, sem colisão). O tile tem gatilho de aviso, como o tile escondido das peças 2 e 3 (15.2.7 e decisão 28). A ao encostar: "Ainda não!" / "Essa é a caixa de enfeites. Monte a árvore antes." (17.8). Nada muda.
- **Depois do diálogo de chegada da parte 3:** a caixa aparece no tile, com brilho dourado `#f4d35e` (4.4). Enquanto visível, ela bloqueia o tile, como uma peça (ADR-004 seção 6). Desenho: caixa vermelha com laço dourado [Pendente 36].
- **Como se pega:** A na caixa, pela regra de 14.9.2 (de frente, ou encostado de lado; diagonal não). Quem é alvo do A é a caixa, nunca o Nick (16.3).
- **Uma vez:** depois de pegar, a caixa some do chão e a fase acaba. Nova partida, a caixa volta escondida.

### 17.4 Pegar, levar e encaixar a caixa

1. **Conquista.** A na caixa abre a tela de conquista `conquista.enfeites` (17.8), com ilustração de caixa aberta e o sobrinho comemorando [Provisório]. Barra "Z ou X: continuar".
2. **Condução.** Ao continuar, a condução automática (14.11) leva o sobrinho à Sala, tile (3, 7), direção `baixo` (de frente para a árvore). Valem as regras de 14.11: sem pular, sem interrupção, barra vazia, velocidade normal até 10 passos e 2× no trajeto inteiro acima de 10 passos, decidido antes do primeiro passo. Portas no trajeto: fade de 0,5 s (14.10.5). Nick acordado segue 1 tile atrás (16.4.4).
3. **Encaixe** (controle travado, cerca de 1,7 s, nada se move antes do fim): a caixa abre (0,6 s, tampa para cima); o enfeite sobe e flutua até a árvore (0,8 s); encaixa com flash dourado de 0,3 s. Só depois a árvore muda para o estado 4 (17.5).
4. **Reação do Nick.** Se acordado: "feliz" (1,6 s) e o balão "Au!" uma vez, junto do encaixe (16.7). Se dormindo: nenhuma reação. O diálogo não espera a reação.
5. **Diálogo final** `arvore.chegada.4`, sozinho, com entrada bloqueada de 200 ms (15.6.5). Duas páginas (17.8). Z avança; X fecha. Sem tempo automático.
6. **Fim.** Ao fechar o diálogo, fade de 0,5 s na cor `#0b1030` e tela de créditos (17.7). Automático [Pendente 37; padrão: A].
   - *Se a 37 for B:* depois do encaixe o controle volta ao jogador na casa. A árvore enfeitada se examina (A), com `arvore.estado.4` (17.8). Na árvore, A abre "Quer ver os créditos?" (Z: sim; X: não). Sim leva aos créditos com o fade; não fecha o diálogo e o jogador segue livre.
- Tudo acontece uma vez por partida (15.6.7).

### 17.5 A árvore: estados 0 a 4

- **Estados:** 0 desmontada; 1 parte; 2 partes; 3 montada, sem enfeite (15.4); **4 completa com enfeites** (7.2). Estado 4 usa o sprite `spr_arvore_enfeitada`, na mesma âncora e escala da árvore atual (tile (3, 8), 15.4).
- **Exame do estado 3 (muda no Marco 4):** de "A árvore está montada! Que linda!" para duas páginas, "A árvore está montada!" / "Falta a caixa de enfeites.", barra "Z: avançar  X: fechar". Motivo: pilar 2 e 15.9 (regra 5, "a árvore diz o que falta"). Como o estado 3 só existe na fase enfeites, a mudança não afeta outro momento do jogo.
- **Chegada da parte 3** tem 3 páginas desde a 0.8.1 (15.8, 17.18). O estado 3 e o exame (acima) não mudam por causa disso: o diálogo de chegada só existe uma vez por partida, e o exame segue com as duas páginas de 17.8.
- **Estado 4** aparece no encaixe (17.4, item 3) e nos créditos (17.7). Não há exame do estado 4 no fluxo padrão (pergunta 37 = A). Se a 37 for B, o exame entra (17.8).
- **Dica:** na fase enfeites, a imagem da dica é a do estado 3 (`spr_arvore_completa`), porque a caixa ainda não foi encaixada (17.10).

### 17.6 Nick na fase enfeites

- **Dormir:** ao fechar o diálogo de chegada da parte 3 (depois da página 3, 17.18), Nick some com fumacinha de 0,5 s e aparece dormindo na Sala, tile (8, 5), direção `baixo` (16.6). Ele não anda até lá (pergunta 33). É o mesmo tile que hoje vale "depois da parte 3" (16.2.2).
- **Acordar:** A na frente dele, como sempre (16.3). O diálogo "O Nick acordou! Ele vai seguir você." só aparece se for a primeira vez na partida (16.3, uma vez por partida).
- **Farejar (B), alvo = Escritório** (subárea, 16.5.2). A seta mostra a porta a seguir (16.5.3), amarela, com 2 tremidas e 5 s:
  - Sala: seta sobre a P3, para a direita.
  - Cozinha ou Lavanderia: seta sobre a P7, para a esquerda.
  - Quarto: seta sobre a P2, para a esquerda.
  - Hall: seta sobre a P8, para cima.
  - Escritório: sem seta; "Au!" sobre o Nick por 1,5 s (16.5.4).
  - Nick dormindo: balão "zzz" por 1,5 s (16.5.5).
- **Seguir:** acordado, Nick acompanha 1 tile atrás, encostado, inclusive na condução (16.4.1, 16.4.4).
- **Reação:** no encaixe, como em 17.4 item 4. Não entra na tela de conquista (16.7, 16.15).
- **Caixa escondida:** nunca é alvo do farejar. O alvo "escritorio" só existe na fase enfeites, então antes da parte 3 B não mostra nada sobre a caixa.
- **Depois do encaixe:** a fase acaba. Nick aparece feliz nos créditos (17.7).

### 17.7 Tela de créditos

- **Como abre:** ao fim do diálogo final (17.4, item 6), com fade de 0,5 s. Não há botão "Créditos" no título (ideia futura, 17.14). Se a 37 for B, abre pela pergunta da árvore (17.4).
- **Conteúdo** (estático, sem rolagem e sem tempo), de cima para baixo:
  1. Título: "Créditos".
  2. Nome do jogo: "Natal na Casa do Tio Ítalo e da Tia Nath".
  3. Sobrinho escolhido comemorando (sprite de conquista), com "Obrigado, {nome}! A árvore ficou linda.".
  4. Árvore no estado 4 (`spr_arvore_enfeitada`).
  5. Nick feliz (`spr_nick_happy`), com "O Nick também ajudou muito!".
  6. "Feito com carinho para a família." Não cita nome de pessoa da família; o nome do jogo já traz o tio e a tia.
  7. Versão "Versão 0.8.0", lida do `package.json` (ADR-002 seção 1), igual à do título.
- **Layout:** cabe em 480×352 sem zoom e sem corte. Cada linha tem até 28 caracteres. O arranjo exato é da Arte e do Dev, dentro do perfil HD.
- **Como volta ao título:** botão "Voltar ao título" com foco inicial. Z, X, Enter, Esc ou clique voltam ao título, com foco em "Começar" (como em "Como jogar", 14.1). Barra: "Z ou X: voltar ao título".
- **Sem save:** ao voltar, o título começa do zero (ADR-002 seção 3). "Começar" leva à seleção e à introdução de novo.
- **Sem pressão:** nada se mexe sozinho, exceto a entrada do fade. Música de fundo a partir do Marco 6 (19.2.1; a mesma faixa do jogo). Ao abrir, toca uma vez o jingle de Natal por cima da trilha (19.2.7, item c). Fica o tempo que a pessoa quiser.
- **Sem dica e sem farejar:** H, o ícone "?" e B não fazem nada nos créditos (16.8.6).

### 17.8 Textos do Marco 4 (pt-BR)

Chaves novas em `content/texts/pt-BR.json`. Formato: `string` ou `string[]` (uma entrada por página). Diálogo: até 2 linhas de 28 por página. Conquista: até 3 linhas de 28. Dica: até 3 linhas de 28.

| Chave | Texto | Onde aparece |
|---|---|---|
| `conquista.enfeites` | "Parabéns, você conseguiu encontrar a caixa de enfeites de Natal!" | Conquista da caixa (17.4, item 1) |
| `aviso.enfeite.antes3` | Página 1: "Ainda não!" / Página 2: "Essa é a caixa de enfeites. Monte a árvore antes." | Tile escondido da caixa, até o diálogo de chegada da parte 3 fechar (17.3) |
| `arvore.estado.3` (muda) | Página 1: "A árvore está montada!" / Página 2: "Falta a caixa de enfeites." | Exame, estado 3 (17.5). Substitui "A árvore está montada! Que linda!" no exame |
| `arvore.chegada.3` (muda na 0.8.1) | Página 1: "A árvore está montada! Que linda!" / Página 2: "Mas tem algo estranho... Ainda falta alguma coisa." / Página 3: "Deve estar perdida pela casa." | Diálogo após a parte 3 (15.6.5). Antes da 0.8.1 tinha uma página, a mesma da primeira linha. Ver 17.18 |
| `arvore.chegada.4` | Página 1: "Agora a árvore está toda enfeitada!" / Página 2: "Feliz Natal para a família!" | Diálogo final, depois do encaixe (17.4, item 5) |
| `dica.enfeites.dormindo` | "Procure a caixa de enfeites." / "O Nick ainda está dormindo." | Dica da fase enfeites, Nick dormindo (17.10) |
| `dica.enfeites.acordado` | "Procure a caixa de enfeites." / "Aperte X e o Nick fareja." | Dica da fase enfeites, Nick acordado (17.10) |
| `creditos.titulo` | "Créditos" | Título da tela (17.7) |
| `creditos.jogo` | "Natal na Casa do Tio Ítalo e da Tia Nath" | Nome do jogo, na tela de créditos |
| `creditos.sobrinho` | "Obrigado, {nome}! A árvore ficou linda." | Ao lado do sobrinho escolhido |
| `creditos.nick` | "O Nick também ajudou muito!" | Ao lado do Nick |
| `creditos.agradecimento` | "Feito com carinho para a família." | Texto da parte de baixo |
| `creditos.versao` | "Versão {versao}" | Rodapé. `{versao}` vem do `package.json` |
| `creditos.voltar` | "Voltar ao título" | Botão da tela de créditos |
| `barra.creditos` | "Z ou X: voltar ao título" | Barra da tela de créditos |

**Só se a 37 for B** (17.4, item 6): `arvore.estado.4` ("A árvore está linda, com enfeites!" / "Feliz Natal!"), `creditos.pergunta` ("Quer ver os créditos?") e a barra da pergunta "Z: sim  X: não".

- Nenhum texto cita nome de pessoa da família (14.10.6, item 034). "Tio Ítalo" e "Tia Nath" aparecem só no nome do jogo, como já estava.
- Nenhum texto da dica diz cômodo, tile ou direção (16.8.8). "Procure a caixa de enfeites." não diz onde.

### 17.9 Regras para crianças de 5 a 10 anos (Marco 4)

1. **A caixa tem ajuda, mas não entrega o lugar.** Nick acordado fareja até a porta; a dica fala do que fazer; a posição só se descobre andando (pilar 2).
2. **"Ainda não!" não é erro.** O mesmo tom do 15.2.7: diz o que falta, sem punição.
3. **O final chega sem escolha.** O diálogo da árvore leva aos créditos (pergunta 37 = A).
4. **Calma.** Créditos sem tempo, sem música e sem susto; a criança fica o tempo que quiser (pilar 1).
5. **Criança e adulto leem o mesmo texto.** O diálogo final e os créditos são curtos e servem para os dois (pilar 4).

### 17.10 Dica (H) e farejar (B) na fase enfeites

- **Dica (H ou ícone "?"):** abre na exploração da fase enfeites (16.8). Título "Dica"; imagem da árvore no estado 3 (`spr_arvore_completa`); texto `dica.enfeites.dormindo` ou `dica.enfeites.acordado`; botão "Voltar" com foco inicial; barra "Z ou X: voltar" (`barra.dica`). Não diz cômodo nem posição (16.8.8).
- **Dica depois do encaixe:** não existe, porque a fase acaba e vão os créditos. A chave `dica.livre` (16.11) sai do conteúdo (17.12).
- **Farejar (B):** segue 17.6 (seta, "Au!", "zzz"). Com a caixa pega, B não tem efeito, porque a fase já acabou.
- **Bloqueios:** H, o ícone e B não fazem nada na conquista, na condução, no encaixe, no diálogo final, no fade e nos créditos (16.8.6, F8). Durante o diálogo do aviso da caixa, B fecha o diálogo, como em todo diálogo.

### 17.11 Barra de controles e Como jogar

| Tela | Barra (texto exato) | Z / Enter (A) | X / Esc (B) |
|---|---|---|---|
| Exploração (antes da parte 3 e na fase enfeites) | "Setas: andar  Z: examinar" e "X: farejar  H: dica" (16.9, sem mudança) | Examina o objeto em frente | Farejar, com Nick acordado |
| Aviso da caixa (`aviso.enfeite.antes3`) | "Z: avançar  X: fechar" | Avança; na última página, fecha | Fecha |
| Conquista da caixa | "Z ou X: continuar" | Continua | Continua |
| Condução e encaixe | Vazia (exceção de 14.8) | Nada | Nada |
| Diálogo final (`arvore.chegada.4`) | "Z: avançar  X: fechar" | Avança; na última página, fecha | Fecha |
| Exame da árvore, estado 3 | "Z: avançar  X: fechar" | Avança; na última página, fecha | Fecha |
| Créditos | "Z ou X: voltar ao título" | Volta ao título | Volta ao título |

- **Como jogar:** nenhuma linha nova. O Marco 4 não cria controle novo; a tela segue como no fim do Marco 3 (16.10, B5).
- **Nenhuma tela nova usa tecla fora da barra.**

### 17.12 Conteúdo e estado (contrato para o Especialista e o Dev)

Os detalhes de formato são do Especialista (ADR-006, backlog 087). Esta seção fixa os valores de jogo.

- **Fase nova:** `enfeites`, valor do enum `Fase`, depois de `parte3`. Missão `missions/enfeites.json` com `requires: ["parte3"]` no manifesto e as mesmas 5 subáreas das partes (`hall`, `sala`, `cozinha`, `quarto`, `escritorio`).
- **Campos da missão** (valores de jogo):
  - `conducao.enfeites` = `{ mapa: "sala", x: 3, y: 7, direcao: "baixo" }`.
  - `conquistas.enfeites` = `"conquista.enfeites"`.
  - `nick.dorme` = `{ mapa: "sala", x: 8, y: 5, direcao: "baixo" }`; `nick.alvo` = `"escritorio"`.
  - `dica.enfeites` com `dormindo` e `acordado`.
- **Fim do jogo (`final`):** o campo `final: true` fica na entrada `enfeites` de `missions[]` no `manifest.json`, e não em `missions/enfeites.json` (ADR-006 1.3). Só uma missão pode ter essa marca. Ao concluí-la, o jogo vai aos créditos (17.4).
- **Caixa de enfeite:** objeto de ordem 4, tipo `enfeite`, no tile do Escritório (17.3). Não é `peca` (ADR-006 2.1). Aviso `aviso.enfeite.antes3`. A colisão segue o estado (visível bloqueia; escondida e encaixada livres), como nas peças (ADR-004 seção 6).
- **Árvore:** estado 4 com o sprite `spr_arvore_enfeitada`. `arvore.estado.3` ganha duas páginas (17.8).
- **Saem do conteúdo** (ADR-006 seção 6): `parte3.depois` (o Nick vai para `enfeites.nick.dorme`, que é o mesmo tile) e `dica.livre` (a fase enfeites tem a sua dica). N008 e N014 de ADR-005 são reescritos (backlog 087).
- **Schema:** continua 2, aditivo (ADR-002 seção 2.2). Sem migração, porque não há release (ADR-002 seção 2.1).
- **Créditos:** tela de apresentação. Não tem regra de domínio: lê o estado (sobrinho, árvore, versão) e os textos.
- **Versão:** lida do `package.json` e injetada no build (ADR-002 seção 1). Nunca digitada no código.

### 17.13 Casos de QA (Marco 4)

Com os 4 sobrinhos, no teclado, salvo indicação. Cada rodada do QA dura no máximo 15 minutos (regra do Diretor, 2026-11-07). O que não couber vira "não testado (limite de tempo)".

**Enfeite (EN)**
- **EN1 (escondida):** até o diálogo de chegada da parte 3 fechar, o Escritório não mostra caixa (sem desenho e sem brilho). A no tile mostra "Ainda não!" e "Essa é a caixa de enfeites. Monte a árvore antes."; Z avança, X fecha, nada muda. Captura.
- **EN2 (aparece):** depois do diálogo de chegada da parte 3, Nick vai dormir na Sala com fumacinha, e a caixa aparece no Escritório com brilho dourado, legível a 3 tiles, sem zoom e sem cobrir a barra. Captura. Nenhum enfeite na Sala.
- **EN3 (pegar):** A de frente (Q1) e com a caixa encostada de lado (Q4) abre "Parabéns, você conseguiu encontrar a caixa de enfeites de Natal!" com a barra "Z ou X: continuar". Z, X e Enter continuam. Diagonal (Q5) não abre.
- **EN4 (condução):** sem tocar em nada, o sobrinho vai até (3, 7) da Sala, de frente para a árvore. Barra vazia. Teclas e Esc não mudam nada. Registrar passos e velocidade (2× se passar de 10 passos).
- **EN5 (encaixe):** a caixa abre, o enfeite sobe e encaixa com flash, em cerca de 1,7 s. A árvore muda para o estado 4 só no fim. Captura de 3 quadros (caixa aberta, enfeite no ar, encaixe).
- **EN6 (Nick):** com Nick acordado, "feliz" e "Au!" uma vez junto do encaixe, sem atrasar o diálogo. Com Nick dormindo, nada acontece.
- **EN7 (diálogo final):** "Agora a árvore está toda enfeitada!" / "Feliz Natal para a família!" aparecem sozinhos, com 200 ms de entrada bloqueada. Z avança, X fecha. Nenhuma página passa sozinha.
- **EN8 (fim):** depois do diálogo, fade de 0,5 s e tela de créditos, sem tecla extra (pergunta 37 = A). Feito ao menos uma vez por sobrinho, no que couber.
- **EN9 (uma vez):** a caixa é pega uma vez por partida. Nova partida mostra a caixa escondida de novo, antes da parte 3.
- **EN10 (farejar na fase enfeites):** da Sala, seta amarela sobre a P3 (direita). Do Escritório, "Au!" sem seta. Da Cozinha, seta sobre a P7 (esquerda). Do Quarto, seta sobre a P2 (esquerda). Do Hall, seta sobre a P8 (cima). Nick dormindo: "zzz".
- **EN11 (dica):** H e o ícone "?" abrem "Dica" com `dica.enfeites` (dormindo e acordado) e a árvore no estado 3. Texto exato. H não fecha; Z, X, Esc e "Voltar" fecham.
- **EN12 (bloqueios):** H, o ícone e B não fazem nada na conquista, na condução, no encaixe, no diálogo final e no fade.

**Créditos (CR)**
- **CR1 (conteúdo):** textos exatos de 17.7 e 17.8 nos 4 sobrinhos; o nome do sobrinho escolhido aparece; árvore no estado 4; Nick feliz; "Versão 0.8.0". Captura.
- **CR2 (voltar):** "Voltar ao título" tem foco inicial. Z, X, Enter, Esc e clique voltam ao título com foco em "Começar". Barra "Z ou X: voltar ao título".
- **CR3 (sem save):** depois de voltar, nova partida começa do zero: título, seleção, introdução, porta, Nick dormindo na Sala, caixa escondida. Nada é lembrado.
- **CR4 (sem tempo):** ficar 30 s parado nos créditos. Nada muda e nada sai sozinho. Sem rolagem.
- **CR5 (cabe):** cada linha tem até 28 caracteres. Sem corte em 480×352. Nenhum nome de família, além do nome do jogo.
- **CR6 (versão):** título e créditos mostram a mesma versão do `package.json`.

**Regressão (RG)**
- **RG1 (Marcos 1 e 2):** título, Começar, seleção, introdução, porta, luzes, conquista 1, condução, partes 1 a 3 com as quatro chegadas e os avisos das peças 2 e 3, como no Marco 2 (E1 a E8 de 15.10). Mudanças esperadas: o exame do estado 3 (17.5) e a caixa (EN1, EN2). O E9 de 15.10 passa a ter o novo exame; o E12, o novo texto de `arvore.estado.3`.
- **RG2 (Marco 3):** N4, N6, F1 e F2 com os 4 sobrinhos, dentro dos 15 min (084). "Au!" e "zzz" iguais aos do Marco 3.
- **RG3 (exploração e Como jogar):** barra de 2 linhas e ícone "?" como em 16.9 e 16.8.1. Como jogar sem mudança (B5).
- **RG4 (conteúdo e build):** `npm test`, `npm run verificar:conteudo`, `npm run validar:perfil -- hd-480x352` e `npm run build:playtest` (sem rede) passam.
- **RG5 (ordem):** a caixa não aparece até o diálogo de chegada da parte 3 fechar. As partes 2 e 3 continuam só depois da anterior.

**Ordem de prioridade** (se o tempo acabar): EN2, EN3, EN5, EN8, CR1, CR2, RG1, EN10, EN11, RG2. O restante vem depois.

### 17.14 Fora de escopo deste marco

- Toque, direcional, botões na tela e aviso de rotação (Marco 5).
- Áudio, música, sons do encaixe e dos créditos; tela de pausa; tamanho de fonte ajustável (Marco 6).
- Sorteio da caixa e das peças (seção 11); corrida (4.1 e 11).
- Botão "Créditos" no título; créditos com rolagem ou com tempo; exame do estado 4 e pergunta de créditos, salvo se a 37 for B. São ideias futuras, e a 37 decide o início dos créditos.
- Mais de uma caixa, mais de um final, "novo jogo +", repetir o encaixe, Nick na tela de conquista (16.15).
- Save ou "continuar de onde parou" (seção 3; ADR-002 seção 3).

### 17.15 Versão, entrega e playtest

- **Versão:** 0.8.0 (SemVer, versão menor: missão e tela novas). Visível no título e nos créditos.
- **Capturas antes do artifact** (o Diretor aprova): EN1, EN2, EN3, EN5 (sequência do encaixe), EN10 (seta para a direita, na Sala), EN11 (dica da fase enfeites), CR1 e CR2.
- **Roteiro de jogo (Orquestrador):** título, Começar, seleção, introdução, porta, luzes, partes 1 a 3, Nick dormindo na Sala, achar a caixa no Escritório (farejar da Sala), encaixe, diálogo final, créditos, voltar ao título.
- **Perguntas-chave:** a caixa é fácil de achar? O farejar e a dica ajudam sem entregar o lugar? O final emociona? A árvore com enfeites é bonita? Os créditos são calmos?
- **Playtest:** a tabela do CLAUDE.md não tem playtest para o Marco 4 (PT4 é o Marco 5). Sugestão do Produto: um playtest curto do final, com rótulo a definir pelo Orquestrador.

### 17.16 Pendências deste marco e padrões aplicados

- **Pergunta 2 (seção 12): decidida pelo Produto** (2026-11-09): Escritório (17.3). O Diretor pode trocar na captura EN2.
- **Pergunta 36** (aparência da caixa e da árvore enfeitada) e **pergunta 37** (início dos créditos): abertas, com padrão aplicado.
- **Padrões aplicados** (sugestões do Produto, sem pergunta ao Diretor):
  - a. A caixa só aparece depois do diálogo de chegada da parte 3 fechar, depois da página 3 (`arvore.chegada.3`, 17.2, 17.3 e 17.18). Antes, o tile tem aviso "Ainda não!" (17.3).
  - b. Nick dorme na Sala no fim da parte 3, no tile de hoje (8, 5), e o alvo do farejar é o Escritório (17.6).
  - c. Encaixe de cerca de 1,7 s, com a reação do Nick junto (17.4), como nas peças.
  - d. O exame do estado 3 passa a dizer o que falta (17.5). Muda o texto do Marco 2 nos casos E9 e E12.
  - e. `dica.livre` sai de uso, e a fase enfeites tem a sua dica (17.10).
  - f. Créditos sem rolagem, sem tempo, sem música e sem botão no título. "Feito com carinho para a família." no lugar de nomes de pessoas (17.7).
  - g. Sem save: os créditos voltam ao título do zero (ADR-002 seção 3).
  - h. Versão 0.8.0 (versão menor).
  - i. Nenhum controle novo. Barra e Como jogar sem linhas novas (17.11).
- **Superações registradas nesta revisão:** 13 (item 4), 15.4 (exame do estado 3), 15.6.8, 15.10 (E9 e E12, pelo texto), 16.2.2 (linha "depois da parte 3") e 16.11 (`dica.livre`).

### 17.17 Riscos

| # | Risco | Tratamento |
|---|---|---|
| 1 | A criança não acha a caixa | Farejar com Nick acordado, dica e aviso "Ainda não!" já dão o caminho. QA em EN10 e EN11. Se o playtest mostrar perdido, ajustar o texto da dica, não a regra |
| 2 | A 37 = B muda o fluxo (exame do estado 4 e pergunta sim/não) | O Produto escreve a versão B da 17.4 e da 17.7 antes do item 091, se o Diretor escolher. Custo maior: um diálogo a mais e um exame novo |
| 3 | `parte3.depois` e `dica.livre` viram campos mortos; N008 e N014 de ADR-005 ficam errados | ADR-006 (backlog 087) decide. Testes de conteúdo reescritos no item 090 |
| 4 | O texto novo do estado 3 muda casos já aprovados (E9 e E12) | RG1; o QA atualiza `qa/checklist-marco2` |
| 5 | A caixa no Escritório bloqueia uma rota de condução | A peça da fase conduzida vira chão livre durante a condução (decisão do Dev, 2026-11-08). A Arte confere a rota de 17.4 com o tile escolhido |
| 6 | Sprite da árvore com enfeites no estilo errado | Placeholder, captura aprovada (item 095) e pergunta 36 |
| 7 | Os créditos são vistos uma vez só | É a regra do jogo sem save (ADR-002 seção 3). Com a 37 = B, o jogador escolhe quando abri-los, depois do encaixe, dentro da mesma partida |
| 8 | A rota da caixa até a Sala pode passar de 10 passos (2×) | O QA mede (EN4). A regra de 14.11 vale sem mudança |

### 17.18 Ajuste 0.8.1: plot twist na chegada da parte 3 (backlog 096)

Origem: o Diretor, 2026-11-09, no retorno do PT4a (`decisions.md`, "Plot twist na parte 3"). Versão do jogo: **0.8.1** (SemVer, patch: texto e comportamento de diálogo; nenhum mapa, missão, controle ou tela nova).

- **Texto:** `arvore.chegada.3` passa a ter 3 páginas, exatas, de até 2 linhas de 28 caracteres cada (15.8 e 17.8): "A árvore está montada! Que linda!" / "Mas tem algo estranho... Ainda falta alguma coisa." / "Deve estar perdida pela casa."
- **Ordem:** o diálogo abre sozinho depois do encaixe da parte 3 (15.6.5). Z avança de página; na página 3, Z fecha. X fecha em qualquer página (barra "Z: avançar  X: fechar", 15.7).
- **Efeitos só ao fechar o diálogo:** o controle volta (15.6.6), Nick some e vai dormir na Sala (17.6) e a caixa aparece no Escritório (17.3). Nas páginas 1 e 2, nada disso acontece: o jogador não anda, Nick não muda e a caixa segue escondida, com o aviso de 17.3.
- **Padrões do Produto (não estavam na decisão do Diretor; o Diretor pode trocar):** (a) X em qualquer página fecha o diálogo inteiro, e os efeitos valem ao fechar, como em 15.7. (b) A entrada bloqueada de 200 ms vale só ao abrir o diálogo, não a cada página.
- **Não muda:** chegadas 1 e 2 (1 página cada), exame do estado 3 (17.5), o aviso da caixa (17.3), a barra e "Como jogar" (17.11). Nenhuma tela nova.
- **Versão:** "v0.8.1" no título e "Versão 0.8.1" nos créditos, lidos do `package.json` (ADR-002 seção 1).

**Casos de teste (backlog 096):**
- **EN-PT1 (3 páginas):** depois do encaixe da parte 3, o diálogo abre sozinho com a página 1. Z avança para a página 2 e depois para a página 3, com os textos exatos, em ordem. Z na página 3 fecha. Nada passa sozinho. Captura das 3 páginas.
- **EN-PT2 (caixa e Nick só depois da página 3):** nas páginas 1 e 2, setas, A, B e farejar não movem o sobrinho nem mudam nada; Nick não some e não vai dormir; a caixa não aparece no Escritório (sem desenho e sem brilho). Só ao fechar a página 3, Nick some com fumacinha e a caixa aparece (EN2 de 17.13).
- **EN-PT3 (X fecha em qualquer página):** X na página 1 fecha o diálogo inteiro. Depois, o controle volta e os efeitos da EN-PT2 acontecem uma vez. O diálogo não reabre na mesma partida (15.6.7).
- **EN-PT4 (entrada bloqueada):** Z, X, Enter e Esc nos primeiros 200 ms, ao abrir o diálogo, não avançam nem fecham. Depois disso, Z avança normalmente.
- **EN-PT5 (versão):** título "v0.8.1" e créditos "Versão 0.8.1" (captura, junto com CR6).
- **Regressão:** E8 e E12 de 15.10 mudam para o novo texto da chegada 3; RG1 e RG5 valem sem outra mudança.

---

## 18. Especificação do Marco 5 (toque e rotação, versão 0.9.0)

Detalha o Marco 5 (seção 13, item 5). Origem: o Diretor liberou o Marco 5 em 2026-11-09 ("depois libere o marco 5", `decisions.md`). O playtest deste marco é o PT4 (CLAUDE.md): jogo completo, em paisagem, em aparelho real. Versão do jogo ao fim do marco: **0.9.0** (SemVer: recurso novo, versão menor; ADR-002 seção 1). Textos entre aspas são propostas do Produto para `content/texts/pt-BR.json` (chaves em 18.12). **[Pendente]** = pergunta aberta (seção 12; hoje só a 42), com o padrão já aplicado. As perguntas 38 a 41 foram decididas pelo Diretor em 2026-11-09 (`decisions.md`).

Tudo o que os Marcos 1 a 4 fixaram continua valendo, salvo o que esta seção muda de forma explícita: o movimento no toque (5), a barra (14.8, 18.4), a tela Como jogar (14.1, 18.7), os textos com tecla (16.11, 18.12) e a escala no celular (ADR-003, 18.9). No computador nada muda.

### 18.1 Escopo e fluxo

| Item | No Marco 5 | Onde está |
|---|---|---|
| Controles de toque | Joystick virtual em grade de 4 direções (substitui a cruz, 18.19), botão A, botão B e ícone "?" na tela | 18.2, 18.3, 18.6, 18.19 |
| Barra e botões por tela | Mesmas telas do teclado, com os nomes "A" e "B" no lugar das teclas | 18.4, 18.12 |
| Regras de toque | Ação ao pressionar, toque fora dos botões não age, gestos do navegador desligados | 18.5 |
| Como jogar do celular | Linhas de toque no lugar das linhas de teclado | 18.7 |
| Aviso de rotação | Aparelho com toque em retrato mostra pedido para girar | 18.8 |
| Escala no celular | Tela 480×352 inteira, sem rolagem, em paisagem | 18.9 |
| Tocar para começar | Os botões do título aceitam toque; nenhuma tela extra | 18.10 |
| Sem save e teclado junto | Continuam valendo; nenhum modo desliga o outro | 18.11 |
| Fora deste marco | Áudio, música, sons e tela de pausa (Marco 6); analógico de curso livre (o joystick em grade é 18.19); sorteio e corrida (seção 11); app nativo | 18.16 |

### 18.2 Controles de toque: o que existe e onde ficam

**Ajuste 0.10.0 (18.19):** a cruz descrita abaixo sai no toque e é substituída pelo joystick virtual. Os tamanhos de A, B e "?", os textos de menu e a regra de layouts A e B (com a regra por tela de 18.4) continuam valendo. Onde esta seção diz "cruz", leia "joystick" (18.19).

**Peças (sem texto de frase; só desenho, com as letras A e B dentro do botão, V7):**
- **Cruz (direcional):** 4 teclas (cima, baixo, esquerda e direita), sem diagonal e sem analógico. Fica à esquerda da tela. Cada braço tem 48 CSS px e os braços ficam encostados entre si, sem espaço entre eles; o centro é vazio. A cruz inteira é um quadrado de 3 × 48 = 144 CSS px (V1).
- **Botão A:** redondo, com a letra A, à direita, no alcance do polegar direito. **Botão B:** redondo, à esquerda do A, na mesma linha.
- **Ícone "?":** canto superior direito da tela do jogo (16.8.1), só na exploração.

**Tamanhos.** Os tamanhos são valores do perfil de arte (bloco `toque`, ADR-003), em CSS px do aparelho. Não escalam com a tela do jogo. Mínimo de **48 CSS px** em todo alvo de toque (o style-guide diz 44; o Especialista atualiza, backlog 097). Espaço de **8 CSS px** entre a cruz, A, B e os demais controles, para que nenhuma área de toque sobreponha outra. Dentro da cruz, os braços se encostam (V1).

| Elemento | Desenho | Área de toque |
|---|---|---|
| Cruz (cada braço) | 48 CSS px; cruz inteira de 144 CSS px, braços encostados (V1) | 48 CSS px por braço |
| Botões A e B | 64 CSS px de diâmetro | 64 CSS px |
| Ícone "?" | 32 px do jogo (16.8.1) | 48 CSS px (pode ser maior que o desenho) |
| Botões de menu (título, Como jogar, seleção, dica, créditos) | Caixa da linha do botão (14.9.4) | 48 CSS px de altura, a faixa inteira da linha |
| Cartões da seleção | Cartão (4.8) | 48 CSS px de altura, o cartão inteiro |
| Teclas do painel da porta e "Fechar" | Grade do painel (14.1): 3 × 4 no teclado; 5 × 3 no toque (18.6, V5) | 48 CSS px; a Arte confere a grade 5 × 3 no perfil de toque (18.6) |

**Duas disposições.** Vale a que couber no aparelho:
- **Layout A (faixas laterais; preferido).** Quando as duas faixas livres, entre a borda da janela e a tela do jogo, têm **pelo menos 144 CSS px** cada. A cruz fica na faixa da esquerda, e A e B na faixa da direita, no terço de baixo. Nenhum botão cobre a tela do jogo. Exemplo: 844×390, tela 532×390, faixas de 156 px; a cruz (144 px) fica com 6 px de folga de cada lado (TQ1).
- **Layout B (sobreposto; celular estreito).** Quando alguma faixa tem menos de 144 CSS px. Os botões ficam **por cima da tela do jogo**, nas linhas 2 a 8 da tela (nunca nas linhas 0, 9 e 10, onde estão o "?" e a barra). Repouso com **60% de opacidade**; pressionado com 100%. Exemplo: 667×375, tela 511×375, faixas de 78 px. Quais botões aparecem em cada tela (regra de 2026-11-09, pergunta 38; detalhe em 18.4):
  - **Exploração:** cruz no lado esquerdo, A e B no lado direito, e o "?".
  - **Diálogo e introdução:** sem cruz. A e B no maior trecho livre da faixa de linhas 2 a 8, **fora da caixa de texto** e sem cobrir o texto.
  - **Título, Como jogar, seleção, conquista, dica, créditos e painel:** nenhum botão de toque; o toque vai direto no item. Exceção da seleção: o botão "Voltar ao título" (pergunta 42, padrão aplicado).
- Os dois layouts usam as mesmas cores de 14.9.4 (caixa `#1b2452`, borda `#9aa3c7`, pressionado `#f4d35e`), sem cor nova.
- A escolha é recalculada ao girar ou redimensionar a janela, sem reiniciar o jogo.

**Pergunta 38 (seção 12): decidida (Diretor, 2026-11-09): sim.** Layout B só na exploração, com cruz, A e B a 60%; nos demais casos, como descrito acima.

**Pergunta 39 (seção 12): decidida (Diretor, 2026-11-09): sim.** Cruz de 144 CSS px com os braços encostados (V1).

### 18.3 Como cada tecla vira toque

| Tecla no computador | No toque | Observação |
|---|---|---|
| Setas ou WASD | Cruz | 4 direções, sem diagonal (18.5, regra 1) |
| Z ou Enter (botão A) | Botão A | Examina, confirma, avança |
| X ou Esc (botão B) | Botão B | Voltar, fechar, continuar; farejar na exploração |
| Clique do mouse | Toque | Vale igual nos botões de menu e nos cartões |
| H (dica) | Ícone "?" | Toque no ícone abre a dica (16.8) |
| Dígitos 0 a 9 no painel | Teclas da grade | Toque direto; sem foco |
| X no painel (apagar) | Tecla "Apagar" da grade | O botão B some no painel |
| Esc no painel (fechar) | Tecla "Fechar" da grade | Só no toque (18.6) |
| Backspace no painel | Tecla "Apagar" da grade | |

### 18.4 Botões e barra por tela (toque)

Cada tela mostra só os botões que a barra cita. Botão que não tem ação **some** (não fica apagado).

As colunas de cruz, A, B e "?" valem para o layout A (e o computador, sem toque). As três últimas colunas dizem o que muda no layout B (celular estreito, 667×375; regra de 2026-11-09).

| Tela | Cruz | A | B | "?" | Barra no toque, layout A (texto exato, 18.12) | Layout B: botões | Layout B: barra (18.12) |
|---|---|---|---|---|---|---|---|
| Título | cima e baixo | sim | não | não | "Setas: escolher  A: confirmar" | nenhum | "Toque para escolher" (`.toque.menu`) |
| Como jogar | não | sim | sim | não | "A ou B: voltar" | nenhum | "Toque em Voltar" (`.toque.menu`) |
| Seleção | esquerda e direita | sim | sim | não | 1: "Setas: escolher  A: confirmar"; 2: "B: voltar ao título" | nenhum, exceto "Voltar ao título" (pergunta 42, padrão aplicado) | 1: "Toque para escolher"; 2: "Toque em Voltar ao título" (`.toque.menu`) |
| Introdução | não | sim | sim | não | "A: avançar  B: voltar" | A e B, fora da caixa de texto | igual ao layout A |
| Exploração | sim | sim | sim (farejar) | sim | 1: "Setas: andar  A: examinar"; 2: "B: farejar  ?: dica" | cruz, A, B (60%) e "?" | igual ao layout A |
| Diálogo (incluindo o da chegada à árvore e o do Nick) | não | sim | sim | não | "A: avançar  B: fechar" | A e B, fora da caixa de texto | igual ao layout A |
| Painel da porta | não | não | não | não | 1: "Toque nas teclas para digitar"; 2: "Toque em Fechar para sair" | nenhum | 1: "Toque nas teclas para digitar"; 2: "Toque em Fechar" (`.toque.menu`) |
| Conquista | não | sim | sim | não | "A ou B: continuar" | nenhum | "Toque em Continuar" (`.toque.menu`) |
| Dica | não | sim | sim | não | "A ou B: voltar" | nenhum | "Toque em Voltar" (`.toque.menu`) |
| Condução e fade de porta | não | não | não | não | Vazia (exceção de 14.8) | nenhum | Vazia |
| Créditos | não | sim | sim | não | "A ou B: voltar ao título" | nenhum | "Toque em Voltar ao título" (`.toque.menu`) |
| Aviso de rotação | não | não | não | não | Nenhuma (18.8) | não se aplica | Nenhuma (18.8) |

- **Condução e fade:** nenhum botão e nenhum texto de tecla, como o "?" e a barra (decisão do Diretor, 2026-11-08, 14.11). Os botões voltam quando o controle volta.
- **Barra conforme o aparelho:** o texto de toque aparece em todo aparelho com toque, mesmo que o jogador use o teclado. O texto não muda com o último comando dado.
- **Textos `.toque.menu`:** no layout B, nas telas em que não há botão (título, Como jogar, seleção, conquista, dica, créditos e painel), a barra usa a versão `.toque.menu` de 18.12, com até 29 caracteres. Em todas as outras telas, e em todo o layout A, vale o texto `.toque`.
- **Seleção sem B:** no layout B a seleção não tem botão B, e o cartão é tocado direto. Sem o botão "Voltar ao título" não haveria saída por toque; por isso o padrão aplicado é esse botão, até a pergunta 42.
- **Painel:** a grade é o controle. Tocar numa tecla aperta na hora, sem foco. Cruz, A e B somem.
- **Ícones de som e de pausa (nota, ADR-008 7.4):** o ícone de som (título e exploração) e o ícone II (exploração) não são controles de jogo. Ficam fora da regra "menus sem controle" desta tabela, mas não podem cobrir botão, cartão ou texto de barra (ADR-007 12.4, itens c e d). Aparecem onde 19.3.2 manda, em qualquer layout.

### 18.5 Regras de toque

1. **Cruz.** Enquanto o dedo estiver numa tecla, o sobrinho anda naquela direção. Com duas teclas pressionadas, vale a última; ao soltá-la, o sobrinho segue na outra, se ela ainda estiver pressionada. Nunca anda em diagonal. Arrastar o dedo de um braço para outro troca a direção; sair da cruz para fora solta a direção (V2).
2. **Juntos.** Cruz e botões funcionam ao mesmo tempo. Ex.: com a cruz pressionada, tocar em A examina o objeto à frente, como no teclado (14.9.2).
3. **Ação ao pressionar.** A e B agem no momento em que o dedo toca o botão, não ao soltar. Um toque, uma ação. Segurar o dedo não repete a ação. O botão fica no estado pressionado por 150 ms (14.9.4).
4. **Toque no botão.** A e B só agem se o toque começou no botão: um toque que começa fora e termina nele não age. Arrastar o dedo para fora depois de pressionar não desfaz a ação, que já aconteceu (V2).
5. **Toque na tela do jogo.** Fora dos botões, não faz nada: não anda, não examina e não avança. A é o único botão que age (14.9).
6. **Menus.** Tocar num botão de menu é o mesmo que clicar: age na hora. Tocar num cartão da seleção confirma o sobrinho (não só põe o foco nele).
7. **Diálogos.** Tocar na caixa de texto não avança nem fecha. Só A avança e só B fecha (14.8).
8. **Gestos do navegador desligados.** A página não rola, não dá zoom com dois dedos, não abre menu de toque longo e não seleciona texto.

### 18.6 Ícone "?" e "Fechar" no toque

- **"?"** abre a dica (16.8) com toque na área de 48 CSS px. Some em diálogo, painel, conquista, dica, condução e fade (16.8.6).
- **"Fechar" no painel (novo, só no toque).** Faz o que Esc faz: fecha o painel. Tocar fora da grade não fecha. Nada se perde; não há penalidade (14.1).
- **Grade no toque (V5; pergunta 40, seção 12):** o botão "Fechar" entra na grade do painel só no toque, e a grade passa a **5 colunas × 3 linhas**: linha 1 = 1, 2, 3, 4, 5; linha 2 = 6, 7, 8, 9, 0; linha 3 = Apagar (2 colunas), OK (1), Fechar (2) (pergunta 41, decidida em 2026-11-09). No computador, a grade fica como está (3 × 4, sem "Fechar"). Motivo: com 4 linhas de 3 colunas, a grade desce até o y 332 em 480×352, e a barra começa no y 296. A Arte decide a posição e o tamanho no perfil de toque, respeitando a área mínima de 48 CSS px.
- **Decidido (Diretor, 2026-11-09, perguntas 40 e 41):** a grade de 5 × 3, só no toque, com "Apagar" e "Fechar" em 2 colunas cada e "OK" em 1.

### 18.7 Como jogar no celular

A tela aparece com o mesmo título e o mesmo botão "Voltar" de 14.1. No aparelho com toque, as linhas de teclado são trocadas pelas abaixo (chaves em 18.12):
- "Mover: setas na tela."
- "Botão A: examinar, avançar."
- "Botão B: voltar e fechar."
- "Farejar: B, com o Nick acordado."
- "Dica: toque no ícone ?"

Barra: "A ou B: voltar" (18.4); no layout B, "Toque em Voltar" (18.4). A linha "No celular, em breve: botões na tela." sai de uso (decisão do Diretor, 2026-11-09). A chave `comojogar.celular` é removida. No computador, a tela segue 14.1 e 16.10, sem linha de toque. O texto precisa caber em 480×352 sem corte; se não couber, reduz-se o espaçamento (14.8), nunca o texto.
- **Medida (V4):** até 27 caracteres por linha da lista. A linha "Farejar: B, com o Nick acordado." tem 32: se a captura T4 mostrar que a lista não cabe em 480×352, essa linha quebra em duas (sem cortar o texto). O Produto pode encurtar o texto, se preferir.

### 18.8 Aviso de rotação (retrato)

- **Quando aparece:** em aparelho com toque, com a janela em retrato (altura maior que a largura). A detecção usa o tamanho da janela, não a API de orientação, para que o QA possa testar no navegador. **Computador nunca mostra o aviso**, mesmo com a janela estreita: a tela só encolhe.
- **O que mostra:** tela inteira, fundo `#0b1030`, um sprite de celular girando (Arte, sem texto) e duas linhas de texto (18.12): "Gire o celular para o lado." / "O jogo fica na horizontal." Sem barra e sem botões: não há tecla a ensinar. Não tem tempo nem botão de continuar.
- **O que congela:** enquanto o aviso aparece, o mundo para por completo: sobrinho, Nick, a seta de farejar (seus 5 s), animações, condução e diálogo. Teclas e toques são ignorados. Uma dica aberta continua aberta.
- **Volta:** ao girar para paisagem, o jogo retoma do mesmo ponto. Não reinicia, não perde nada e não pede nada.
- **Não pede tela cheia nem trava de orientação.** O jogo não usa a API de tela cheia nem tenta travar a rotação. O pedido é o aviso, feito com o próprio aparelho.

### 18.9 Escala e tela no celular

- **Tela:** 480×352 (perfil HD, 15×11 tiles), inteira e sem rolagem, em paisagem. Escala híbrida (ADR-003 seção 9): fator = menor valor entre largura/480 e altura/352; a partir de 2× arredonda para baixo; abaixo de 2×, é fracionário.
- **Exemplos** (janela em px CSS):

| Aparelho (paisagem) | Fator | Tela | Faixa livre por lado | Layout |
|---|---|---|---|---|
| 844×390 | 1,11 | 532×390 | 156 | A |
| 932×430 | 1,22 | 586×430 | 173 | A |
| 667×375 | 1,07 | 511×375 | 78 | B |
| 1024×768 (tablet) | 2 | 960×704 | 32 | B |
| 1920×955 (computador, sem toque) | 2 | 960×704 | 480 | Nenhum |

- **Nitidez:** a tela desenha no pixel físico do aparelho (celular de alta densidade, DPR 2 ou 3), sem borrão. Pixel art com bordas duras.
- **Barra do navegador:** quando a barra de endereços ocupa altura, o jogo se ajusta à área visível. Nada é cortado e nada rola.
- **Janela pequena (V6):** com a área visível abaixo de 375 CSS px de altura (fator abaixo de 1,065), um alvo de 48 CSS px dentro do canvas (menu, cartão, tecla do painel, "?" e "Continuar") vale só quando não invade o vizinho. Se invadir, o alvo fica no tamanho do desenho e o QA anota. O PT4 mede num aparelho pequeno real. Não bloqueia o marco.
- **Computador:** nada muda.

### 18.10 Tocar para começar

- O título não ganha tela extra de "toque para começar". "Começar" e "Como jogar" aceitam toque como clique, e o foco inicial continua em "Começar" (14.1).
- Liberar áudio no primeiro toque fica para o Marco 6 (7.3). O Marco 5 não tem nenhum passo de áudio.
- A versão "v0.9.0" aparece no título, como nos demais marcos.

### 18.11 Sem save e teclado junto

- **Sem save (seção 3):** cada abertura do jogo começa no título, em qualquer aparelho. Girar o aparelho não reinicia a partida (18.8). Recarregar a página começa do zero, como no computador.
- **Teclado e toque juntos:** um celular com teclado ou um computador com tela de toque aceita os dois. Nenhum modo desliga o outro, e a mesma partida pode usar os dois.

### 18.12 Textos do Marco 5 (pt-BR)

Chaves novas em `content/texts/pt-BR.json`. Limite de 29 caracteres por linha da barra (V3; a medida real é do QA; o teclado já usa 29 com espaçamento reduzido), de 28 nos diálogos (16.11) e de 27 nas linhas de Como jogar (V4). Os textos são propostas do Produto.

| Chave | Texto | Onde aparece |
|---|---|---|
| `barra.titulo.toque` | "Setas: escolher  A: confirmar" | Título (18.4) |
| `barra.comojogar.toque` | "A ou B: voltar" | Como jogar |
| `barra.selecao1.toque` | "Setas: escolher  A: confirmar" | Seleção, linha 1 |
| `barra.selecao2.toque` | "B: voltar ao título" | Seleção, linha 2 |
| `barra.intro.toque` | "A: avançar  B: voltar" | Introdução |
| `barra.dialogo.toque` | "A: avançar  B: fechar" | Diálogos |
| `barra.painel1.toque` | "Toque nas teclas para digitar" | Painel, linha 1 |
| `barra.painel2.toque` | "Toque em Fechar para sair" | Painel, linha 2 |
| `barra.conquista.toque` | "A ou B: continuar" | Conquistas |
| `barra.casa.toque` | "Setas: andar  A: examinar" | Exploração, linha 1 |
| `barra.casa2.toque` | "B: farejar  ?: dica" | Exploração, linha 2 |
| `barra.dica.toque` | "A ou B: voltar" | Dica |
| `barra.creditos.toque` | "A ou B: voltar ao título" | Créditos |
| `barra.titulo.toque.menu` | "Toque para escolher" | Título, layout B (18.4) |
| `barra.comojogar.toque.menu` | "Toque em Voltar" | Como jogar, layout B |
| `barra.selecao1.toque.menu` | "Toque para escolher" | Seleção, linha 1, layout B |
| `barra.selecao2.toque.menu` | "Toque em Voltar ao título" | Seleção, linha 2, layout B (vale com o botão da pergunta 42, padrão aplicado) |
| `barra.conquista.toque.menu` | "Toque em Continuar" | Conquistas, layout B |
| `barra.dica.toque.menu` | "Toque em Voltar" | Dica, layout B |
| `barra.creditos.toque.menu` | "Toque em Voltar ao título" | Créditos, layout B |
| `barra.painel1.toque.menu` | "Toque nas teclas para digitar" | Painel, linha 1, layout B |
| `barra.painel2.toque.menu` | "Toque em Fechar" | Painel, linha 2, layout B |
| `comojogar.mover.toque` | "Mover: setas na tela." | Como jogar |
| `comojogar.botaoA.toque` | "Botão A: examinar, avançar." | Como jogar |
| `comojogar.botaoB.toque` | "Botão B: voltar e fechar." | Como jogar |
| `comojogar.farejar.toque` | "Farejar: B, com o Nick acordado." | Como jogar |
| `comojogar.dica.toque` | "Dica: toque no ícone ?" | Como jogar |
| `painel.fechar` | "Fechar" | Tecla da grade do painel (só no toque) |
| `rotacao.1` | "Gire o celular para o lado." | Aviso de rotação |
| `rotacao.2` | "O jogo fica na horizontal." | Aviso de rotação |

**Textos com tecla que mudam no toque** (a versão de teclado não muda):
- "Aperte X e o Nick fareja." → "Toque em B e o Nick fareja." (`dica.luzes.acordado`, `dica.parte1.acordado`, `dica.parte2.acordado`, `dica.parte3.acordado` e `dica.enfeites.acordado`, na linha final).
- "Aperte X para farejar." → "Toque em B para farejar." (`nick.acordou`, página 2, só no toque).
- Chave `comojogar.celular`: sai de uso e é removida.

**Regra:** nenhum texto de toque cita Z, X, H, Esc, Enter ou Backspace. O teste é de busca em `content/`.

### 18.13 Regras para crianças de 5 a 10 anos (toque)

1. **Alvos grandes e separados.** 48 a 64 CSS px, com 8 px entre a cruz, A, B e os demais controles: a criança não toca no botão errado por acaso. Dentro da cruz, os braços se encostam (V1).
2. **Um botão, uma ação.** A e B fazem só o que a barra diz, e agem ao pressionar.
3. **Botão só onde serve.** A cruz não aparece onde não há andar, e o "?" não aparece onde não há dica (18.4). Nas telas de menu do celular estreito não há botão: a criança toca direto no item.
4. **Nada se perde.** Girar o aparelho, abrir a dica ou ficar parado não tira nada da criança (pilar 1).
5. **Toque fora dos botões não faz nada.** A criança não precisa aprender onde tocar.
6. **Mesmo texto para criança e adulto.** A barra diz "A" e "B", e o adulto pode ler junto (pilar 4).

### 18.14 Casos de aceite (QA)

**Regras de execução:** cada rodada do QA dura no máximo 15 minutos (regra do Diretor, 2026-11-07). Com os 4 sobrinhos quando couber (LoLô inteiro e um dos outros três). O que não couber vira "não testado (limite de tempo)".

**Como o QA emula o toque no Chromium:** modo de dispositivo com toque ligado e tamanho da janela do aparelho; multitoque por comandos de toque (ex.: `Input.dispatchTouchEvent` no DevTools); rotação por troca do tamanho da janela (retrato ↔ paisagem), sem recarregar a página. Tudo emulado deve ser marcado como "emulado" no relatório.

**Emulável no Chromium:**
- **TQ1 (layout A):** janela 844×390 com toque. Cruz de 144 px à esquerda, na faixa de 156 px, com 6 px de folga de cada lado; A e B à direita; nenhum botão sobre a tela do jogo (folga medida); tela de 532×390 (captura).
- **TQ2 (layout B):** janela 667×375 com toque. Na exploração, botões sobre a tela, 60% de opacidade no repouso; nenhum botão nas linhas 0, 9 e 10. Captura de Hall, Sala, Cozinha, Quarto e Escritório. Se um botão cobrir objeto interativo (bilhete, interruptor, porta, peça, árvore ou Nick), o QA anota para o PT4 (pergunta 38, decidida); isso não reprova sozinho. Menus, diálogo e introdução: ver TQ22.
- **TQ3 (cruz):** cada uma das 4 teclas anda na direção certa, no Hall e na Sala, com colisão. Com duas teclas, vence a última; soltar a última mantém a outra. Nenhuma diagonal.
- **TQ4 (juntos):** cruz pressionada e toque em A: examina o objeto à frente, na direção em que o sobrinho está olhando.
- **TQ5 (ação ao pressionar):** A e B agem no toque ao pressionar, no botão onde o toque começou; estado pressionado por 150 ms; toque que começa fora e termina no botão não age; arrastar para fora de A ou B depois de pressionar não desfaz a ação, que já aconteceu. Na cruz, arrastar de um braço para outro troca a direção, e sair da cruz solta a direção (18.5, regras 1 e 4; V2).
- **TQ6 (tela do jogo):** toque no meio da tela, fora dos botões, em cada uma das 4 salas: nenhum movimento, nenhuma ação, nenhum diálogo.
- **TQ7 (título e Como jogar):** toque em "Começar" vai à seleção; toque em "Como jogar" abre a tela com as linhas de 18.7; "Voltar" fecha com foco em "Começar". Área de toque de cada botão medida em ≥ 48 CSS px.
- **TQ8 (seleção):** toque num cartão confirma o sobrinho e leva à introdução com o nome certo (testar os 4). B volta ao título.
- **TQ9 (dica):** "?" abre a dica; "Voltar" fecha; a imagem é a árvore do estado atual. "?" some em diálogo, painel, conquista, condução e fade (captura de cada um).
- **TQ10 (painel):** teclas da grade e "Fechar" com área ≥ 48 CSS px. Digitar o código por toque com os 4 sobrinhos (017, 020, 023, 024). Erros sem limite (20 seguidos, nada muda). Só "Fechar" fecha; tocar fora não fecha. Cruz, A e B somem.
- **TQ11 (barra de toque):** textos de 18.4 exatos em cada tela, nos dois layouts (em 667×375, os textos `.toque.menu` nas telas sem botão), em captura; nenhuma tela de toque mostra Z, X, H, Esc ou Enter (busca e captura). Barra de duas linhas cabe em 480×352 sem corte.
- **TQ12 (condução e fade):** depois de "Continuar" na conquista 1 e na conquista de uma peça, os botões somem e a barra fica vazia. Tocar não interrompe a condução. Ao devolver o controle, os botões voltam.
- **TQ13 (aviso de rotação):** janela 390×844 com toque mostra o aviso com as duas linhas exatas, sem barra e sem botão. Com a seta de farejar em andamento e a dica aberta, nada avança durante o aviso. Voltar para 844×390 retoma no mesmo ponto (mesma posição, mesma peça, mesma dica), sem recarregar a página.
- **TQ14 (aviso só no toque):** janela 390×844 sem toque (computador): nenhum aviso; o jogo segue na janela.
- **TQ15 (escala):** 844×390 dá tela 532×390; 667×375 dá 511×375; 1920×955 sem toque dá 960×704 (inalterado). Pixels nítidos, sem borrão, também com DPR 2 e 3 emulados.
- **TQ16 (gestos do navegador):** pinça com dois dedos não dá zoom (escala visual 1); arrastar sobre a tela não rola a página; toque longo não abre menu de contexto nem seleciona texto.
- **TQ17 (teclado junto):** com toque ligado, setas, WASD, Z, X, H, Esc e Enter continuam funcionando, na mesma partida.
- **TQ18 (sem save):** recarregar a página em celular emulado volta ao título; "Começar" de novo começa do zero.
- **TQ19 (alvos):** medir a área de toque de cada braço da cruz, A, B, "?", botões de menu, cartões, teclas do painel, "Fechar" e "Voltar ao título": todos ≥ 48 CSS px (a cruz inteira mede 144 px, com os braços encostados, V1). Entre a cruz, A, B e os demais alvos, ≥ 8 CSS px. Exceção V6 (18.9): em janela com fator abaixo de 1,065, um alvo do canvas pode ficar no tamanho do desenho quando a área de 48 px invadiria o vizinho; o QA anota e não reprova sozinho.
- **TQ20 (versão):** título "v0.9.0" com toque e com teclado; créditos "Versão 0.9.0" (lido do `package.json`).
- **TQ21 (textos de farejar):** com toque, "Toque em B e o Nick fareja." e "Toque em B para farejar." (18.12); com teclado, os textos "Aperte X" de antes, sem mudança.
- **TQ22 (sobreposição no layout B, 667×375, com toque):** em título, Como jogar, seleção, introdução, diálogo (com bilhete e com "Clique!"), conquista 1, dica, créditos, painel, e na exploração (Hall e Sala). (a) Telas de menu (título, Como jogar, seleção, conquista, dica, créditos e painel): nenhum controle de jogo (direções, A, B ou "?") aparece; reprova se aparecer. Os ícones de som e de pausa não são controles de jogo: não reprovam por aparecer, mas não podem cobrir cartão, botão ou texto de barra (18.4, nota). (b) Introdução e diálogo: sem cruz; A e B não cobrem o texto nem a caixa de texto, e ficam dentro das linhas 2 a 8; reprova se cobrirem. (c) Exploração: cruz, A, B e "?" não cobrem botão de menu nem texto de barra; se cobrirem objeto interativo, o QA anota (TQ2), sem reprovar. (d) Seleção: o botão "Voltar ao título" (pergunta 42) não cobre cartão e volta ao título ao toque. Medida: `window.__alvosDeToque()` (ADR-007 12.3) para cruz, A, B, "?" e botões de menu; a caixa de texto e a barra, por captura na mesma escala. Reprova só por sobreposição confirmada na captura.

**Só o Diretor testa (aparelho real, PT4):**
- Conforto e precisão do toque de criança de 5 a 10 anos e de adulto; se 48 CSS px é suficiente.
- Dedo cobrindo botão ou objeto de verdade (layout B).
- Barra de endereços real do Safari no iPhone e do Chrome no Android, e a altura útil que sobra.
- Girar o aparelho de verdade (sensor e animação do sistema) e a sensação do aviso.
- Desempenho e aquecimento em celular intermediário (seção 9).
- Latência do toque e sensação de resposta.
- Safari no iPhone e Chrome no Android em aparelho real (compatibilidade, seção 9).

**Regressão no teclado (RM1 a RM5):**
- **RM1:** os roteiros prioritários de 16.14 (N1, N2, N4, N9, N10, F1, F4, D1, D3, B1) e a ordem de prioridade de 17.13 passam, sem mudança de texto nem de tecla.
- **RM2:** o checklist do Marco 1 (`qa/checklist-marco1.md`) passa em amostra com os 4 sobrinhos.
- **RM3:** Como jogar no computador mostra as linhas de 16.10 e 14.1, sem "No celular" e sem linhas de toque.
- **RM4:** os textos com "Aperte X" continuam iguais no computador.
- **RM5:** o fluxo completo (porta, luzes, partes 1 a 3, enfeites, créditos) passa sem erro no console, com teclado.

### 18.15 Versão, entrega e playtest

- **Versão:** 0.9.0 (SemVer, versão menor: recurso novo). Título "v0.9.0" e créditos "Versão 0.9.0", lidos do `package.json`.
- **Capturas antes do artifact (o Diretor aprova):** T1 (layout A, 844×390, Sala), T2 (layout B, 667×375, Sala e Hall; título e diálogo da introdução, para TQ22), T3 (aviso de rotação), T4 (Como jogar de toque), T5 (painel com "Fechar") e T6 (dica com "?" e "Voltar").
- **Roteiro do PT4 (Orquestrador; o Diretor joga no celular, em paisagem):**
  1. Abrir, título, "Como jogar" (ler e voltar).
  2. "Começar", escolher um sobrinho com o toque, introdução com A e B.
  3. Porta: digitar o código com o toque (um erro e depois o certo).
  4. Girar para retrato e voltar à paisagem.
  5. Luzes, interruptor e condução até a árvore (girar de novo durante a condução, se possível).
  6. Farejar com B e dica com "?".
  7. Partes 1 a 3 e enfeites.
  8. Créditos e voltar ao título.
- **Perguntas-chave (CLAUDE.md, PT4):** Os botões A e B e a cruz são confortáveis? O aviso de rotação funciona? Acrescentar: os botões cobrem a casa no celular estreito? A criança acha o "?" e entende a barra de toque? Alguém toca no botão errado? Um adulto consegue segurar o aparelho e jogar junto?
- **Playtest:** a rodada do PT4 só começa depois do QA aprovar (backlog 106 e 107) e o Diretor aprovar as capturas (108).

### 18.16 Fora de escopo deste marco

- Áudio, música, sons e a liberação de áudio no toque (Marco 6, 7.3).
- Tela de pausa e tamanho de fonte ajustável (Marco 6, 8 e 13).
- Analógico de curso livre no toque (andar em qualquer ângulo, velocidade proporcional ao empurrão): fora. O controle é o joystick em grade da 18.19 (ajuste 0.10.0, que substitui a cruz). Se o Diretor pedir curso livre, vira ideia futura.
- Andar tocando no destino (toque na tela para andar) e gestos de arrastar para andar.
- Tela cheia obrigatória, trava de orientação e app nativo (seção 11).
- Vibração e gestos com mais de dois dedos.
- Tocar na caixa de diálogo para avançar (padrão: não, 18.5, regra 7).
- Corrida e sorteio (seção 11); save (seção 3).

### 18.17 Pendências deste marco e padrões aplicados

- **Perguntas 38 a 41 (seção 12): decididas (Diretor, 2026-11-09): sim às quatro.** 38: layout B a 60% de opacidade, só na exploração, com a regra por tela de 18.2 e 18.4. 39: cruz de 144 CSS px com braços encostados (V1). 40: grade de 5 × 3 só no toque, com "Fechar" (V5). 41: "Apagar" e "Fechar" em 2 colunas, "OK" em 1.
- **Pergunta 42 (seção 12): aberta.** Saída por toque da seleção no layout B, que não tem botão B. Padrão aplicado: botão "Voltar ao título" de menu, só no layout B. Sugestão do Produto: sim.
- **Padrões aplicados (sugestões do Produto, sem pergunta ao Diretor):**
  - a. Cruz digital de 4 teclas, sem analógico (seção 5 atualizada).
  - b. A à direita e B à esquerda do A; cruz à esquerda (18.2).
  - c. Alvo mínimo de 48 CSS px, acima dos 44 do style-guide (Especialista atualiza, backlog 097).
  - d. Ação ao pressionar; toque fora dos botões não age; toque no cartão confirma; tocar na caixa de diálogo não avança (18.5).
  - e. Botão some onde não tem ação, e some na condução e no fade (18.4, consistente com a decisão de 2026-11-08 sobre a condução).
  - f. Painel no toque ganha "Fechar", que equivale ao Esc; cruz, A e B somem no painel (18.6).
  - g. Aviso de rotação: 2 linhas, sem barra, congela o mundo; detecção pela janela; computador nunca mostra; sem tela cheia nem trava de orientação (18.8).
  - h. Textos de toque usam "A", "B" e "?"; nenhum texto de toque cita tecla do teclado (18.12).
  - i. A barra e o Como jogar seguem o aparelho com toque, não o último comando (18.4).
  - j. Tocar para começar: sem tela extra; áudio fica para o Marco 6 (18.10).
  - k. Versão 0.9.0 (SemVer, versão menor).
  - l. `comojogar.celular` sai de uso (18.7).
  - m. Divergências V1 a V7 do ADR-007 (aceitas em 2026-11-09) aplicadas em 18.2, 18.5, 18.6, 18.7, 18.9, 18.12, 18.13 e nos casos TQ1, TQ5 e TQ19.

### 18.18 Riscos

| # | Risco | Tratamento |
|---|---|---|
| 1 | Botões tapam a casa em celular estreito | Layout B a 60%, só na exploração; diálogo e introdução sem cruz e fora da caixa de texto; menus sem botão (18.4); TQ2 e TQ22 medem; o PT4 confirma no aparelho |
| 2 | Criança erra o botão, ou toca sem querer | Alvos de 48 a 64 CSS px, 8 px entre cruz, A, B e os demais controles, ação ao pressionar, toque fora sem ação (TQ5, TQ6, TQ19) |
| 3 | A barra de endereços do navegador reduz a altura útil | O jogo se ajusta sem cortar (TQ15, backlog 104); o Diretor confere no aparelho real (PT4) |
| 4 | Tela HD (4,4 vezes os pixels do v1) pesa em celular intermediário | Medir no PT4 (ADR-003, Desempenho). Se pesar, a Arte reduz o perfil de toque, não a regra |
| 5 | Girar o aparelho no meio de uma ação | O mundo congela e nada se perde (18.8, TQ13) |
| 6 | Grade do painel com teclas pequenas no toque | Área mínima de 48 CSS px; grade de 5 × 3 no toque (18.6, V5; TQ19) |
| 7 | Layout A e layout B divergem no visual | Mesmas cores e mesmos sprites; captura T1 e T2 aprovadas pelo Diretor antes de publicar |

### 18.19 Ajuste 0.10.0: joystick virtual no lugar da cruz (PT4, 2026-11-09)

**Origem:** no PT4 (v0.9.0), o Diretor pediu trocar as setas direcionais do celular por um controle de direção analógico. Depois, pediu o "modelo analógico": base redonda com uma haste (bolinha) que acompanha o polegar, e não uma cruz de setas. **Versão 0.10.0** (SemVer: recurso que troca o controle de movimento no toque; não é correção, por isso não é 0.9.x).

**Substitui** (onde o texto antigo diz "cruz", leia "joystick"): 18.1 (linha de controles), 18.2 (peça da cruz e tamanhos), 18.3 (linha de setas no toque), 18.4 (coluna da cruz e barras com "Setas"), 18.5 regras 1 e 4 na parte da direção, 18.7 (linha de movimento), 18.12 (textos com "Setas"), 18.13 regra 1, 18.14 (TQ1 a TQ5, TQ19 e TQ22, em 18.19.14) e 18.16 (analógico). A pergunta 39 (cruz de 144 px, braços encostados) fica superada e vai ao histórico. Todo o resto do Marco 5 vale como está.

**18.19.1 O que é.** Um joystick virtual: uma base redonda, fixa, e uma bolinha no centro. O polegar arrasta a bolinha dentro da base. O movimento é em grade: o sobrinho anda em 4 direções (cima, baixo, esquerda e direita), nunca em diagonal, e continua andando enquanto a bolinha estiver inclinada. A velocidade é a mesma de hoje, sem depender de quanto a bolinha foi empurrada. Teclado, A e B não mudam.

**18.19.2 Posição: fixa (padrão aplicado; pergunta 43).** A base fica no lugar da cruz:
- **Layout A:** faixa da esquerda, a 8 CSS px da borda da janela, alinhada pela base com A e B (como a cruz, ADR-007 P2).
- **Layout B:** lado esquerdo da tela do jogo, a 8 CSS px da borda, centrada na faixa das linhas 2 a 8.

**18.19.3 Tamanho.**
- **Base:** 120 CSS px de diâmetro (sugestão do Produto; a faixa aceita vai de 96 a 120). É a área de toque inteira.
- **Bolinha:** 48 CSS px de diâmetro (só desenho; a área de toque é a base).
- **Curso da bolinha:** 36 CSS px do centro (raio da base menos o raio da bolinha). Além disso, a bolinha fica presa na borda, na direção do dedo.
- **Layout A:** 120 + 2 × 8 = 136 CSS px, que cabe na faixa de 144. A faixa mínima de 144 (18.2) não muda, e a escolha entre A e B fica igual.
- **Layout B:** a base é menor que a cruz (que ocupava 144 × 144), então cobre menos da casa.
- **Perfil de arte:** os tamanhos ficam em `toque.analogico` (base 120, bolinha 48). O curso (36) é derivado; `cruzCss` e `cursoCss` não entram no perfil (ADR-007 5.1).

**18.19.4 Zona morta, limiar e histerese.** Medidas a partir do centro da base, pela distância euclidiana (`hypot(dx, dy)`), em CSS px:
- **Zona morta:** distância `≤ 12` solta. Dentro dela, nenhuma direção.
- **Engajamento:** distância `≥ 20`, e só a partir do repouso. Com o joystick em repouso, ao chegar a 20 a direção começa e o setor aparece (18.19.7). Trocar de direção sem voltar à zona morta não engaja nada (18.19.8).
- **Histerese:** depois de engajada, a direção continua enquanto a distância for maior que 12, mesmo abaixo de 20 (por exemplo, 16 continua). Só solta com `≤ 12`. Assim o tremor do dedo na borda não liga e desliga o andar.
- **Eixo dominante:** vale o eixo de maior módulo (|dx| ou |dy|). Uma direção só, sem diagonal.
- **Empate exato** (|dx| = |dy|): mantém a direção anterior; sem direção anterior, nenhuma.
- **Ordem de decisão:** (1) distância `≤ 12`: nenhuma. (2) Em repouso e distância menor que 20: nenhuma. (3) Empate: a anterior, ou nenhuma. (4) Eixo dominante.
- Esses números são constantes de código (ADR-007 5.2), não do perfil de arte.

**18.19.5 Movimento.**
- Uma direção por vez, sem diagonal. Se a bolinha passar de um eixo para o outro, o sobrinho muda de direção no quadro seguinte, sem parar.
- Só o primeiro dedo que começa dentro da base comanda. Um segundo dedo na base não muda nada.
- Soltar, ou voltar para a zona morta, para o sobrinho. Parar nunca dá um passo a mais.

**18.19.6 Toque e captura.**
- Um toque que começa dentro da base comanda o joystick até soltar, mesmo que o dedo saia da base (captura do navegador, ADR-007 R7).
- Ao sair da base, a bolinha fica na borda, e a direção segue o lado onde o dedo está. Soltar em qualquer lugar zera o joystick.
- Toque que começa fora da base não age no joystick (18.5, regra 5).
- Redimensionar a janela ou mudar a área visível (barra do navegador) não solta o dedo: a base é medida de novo a cada movimento e o comando segue. Solta tudo só na troca de layout (A para B) e no aviso de rotação (ADR-007 10.3 e 10.5).
- Joystick, A e B são independentes: um dedo na base e outro em A, juntos, funcionam (18.5, regra 2). Toque que começa em A e desliza até a base não move o sobrinho (18.5, regra 4).

**18.19.7 Feedback visual.**
- A bolinha acompanha o dedo até o curso (36). Em repouso, fica no centro.
- **Setor em anel:** ao engajar uma direção (18.19.4), a borda da base acende em amarelo `#f4d35e` num único setor de 90°, em anel entre 52 e 60 CSS px do centro, do lado do eixo ativo. Fica acima da bolinha, para continuar visível quando ela encosta na borda. Nunca dois setores. O setor mostra a grade mesmo quando a bolinha está num ângulo intermediário.
- **Quando acende e quando some:** acende ao engajar (a partir do repouso, 20) e continua aceso na histerese; some ao voltar a `≤ 12`. Em repouso, nenhum setor.
- **Só nas direções da tela:** o setor acende só para as direções que a tela aceita (18.19.9 e ADR-007 6): título, cima e baixo; seleção, esquerda e direita; exploração, as quatro. No título, empurrar para a esquerda move a bolinha, mas não acende setor, porque nada anda.
- Repouso: opacidade da 18.4 (100% no layout A; 60% no layout B). Pressionado: 100%.
- Sem setas desenhadas e sem texto no joystick (V7).

**18.19.8 Menus.** Um empurrão = um passo, como cada tecla do teclado.
- Empurrão é a passagem da zona morta (`≤ 12`) para o engajamento (`≥ 20`, a partir do repouso), numa direção. No quadro em que engaja, o foco anda um item: uma borda por engajamento.
- Trocar de direção sem voltar à zona morta não dá passo (por exemplo, de cima para a direita, sem passar por `≤ 12`).
- **Segurar não repete (BUG-M5-04; decisão do Orquestrador de 2026-11-09).** Num menu, um empurrão = um passo; segurar não repete. Para o foco andar de novo, a bolinha tem de voltar à zona morta. A mesma regra valia para a cruz na correção 0.9.1.
- Nos limites (primeiro e último item), o foco para e não dá volta.
- Trocar de tela solta o joystick e descarta o passo pendente: nenhum passo passa de uma tela para a seguinte.
- **Título (layout A):** cima e baixo trocam o botão em foco (Começar e Como jogar). Esquerda e direita são ignoradas.
- **Seleção (layout A):** esquerda e direita trocam o cartão em foco. Cima e baixo são ignorados.
- **Como jogar, conquista, créditos, dica e painel:** sem joystick (18.4). A dica tem só o botão "Voltar" (16.8.2), e não há item a mover; por isso "um empurrão = um passo" vale só para título e seleção.
- **Layout B:** título e seleção seguem sem botão de toque (18.4, pergunta 38). O toque vai direto no item, então o empurrão não aparece nesse layout.
- Tocar num item continua valendo como clique (18.5, regra 6).

**18.19.9 Exploração e telas sem joystick.** Na exploração, o joystick anda nas 4 direções pelo eixo dominante (18.19.5). Nada muda na barra, no "?" e na dica. O joystick não aparece na introdução, no diálogo, no painel, na conquista, na condução nem no fade (18.4, sem alteração).

**18.19.10 Textos.** Só estas chaves mudam (`content/texts/pt-BR.json`). As demais chaves de toque (18.12) seguem iguais.

| Chave | Antes (0.9.0) | Agora (0.10.0) | Caracteres |
|---|---|---|---|
| `barra.titulo.toque` | "Setas: escolher  A: confirmar" | "Mover: escolher  A: confirmar" | 29 |
| `barra.selecao1.toque` | "Setas: escolher  A: confirmar" | "Mover: escolher  A: confirmar" | 29 |
| `barra.casa.toque` | "Setas: andar  A: examinar" | "Mover: andar  A: examinar" | 25 |
| `comojogar.mover.toque` | "Mover: setas na tela." | "Mover: controle na tela." | 24 |

- "Mover:" e não "Controle:": "Controle: escolher  A: confirmar" tem 32 caracteres e passa do limite de 29 (V3).
- **Regra nova:** nenhum texto de toque cita "setas". No toque não há setas.
- Mesmos limites de 18.12 (barra 29; Como jogar 27 por linha; diálogo 28).
- Textos de teclado: iguais (RM4).

**18.19.11 Teclado, A e B.** Setas e WASD, Z, X, Enter, Esc, H e Backspace valem como antes. O teclado não ganha joystick e nenhum texto de teclado muda.

**18.19.12 Regras para crianças de 5 a 10 anos (joystick).**
1. **Um lugar só.** A base fica sempre no mesmo lugar, onde estava a cruz. A criança aprende uma vez.
2. **Empurrão claro.** Nos menus, cada empurrão anda um item. Não há passos extras se a criança segura o dedo.
3. **Setor amarelo.** Mostra para onde o sobrinho vai, sem depender de ler a bolinha.
4. **Só onde há o que mover.** O joystick aparece só no título, na seleção e na exploração (no layout A).

**18.19.13 Casos de aceite (QA).** Vale a regra de 15 minutos por rodada (18.14). Os casos abaixo somam-se aos da 18.14, com a troca de "cruz" por "joystick".

*Ajustes nos casos existentes (18.14):*
- **TQ1 (layout A):** a base de 120 cabe na faixa de 156 px (844×390), a 8 CSS px da borda da janela; nenhum controle sobre a tela do jogo. Substitui a cruz de 144 px e a folga de 6 px.
- **TQ2 (layout B):** a base fica nas linhas 2 a 8 (667×375), sem nada nas linhas 0, 9 e 10. Objeto coberto segue para anotação (pergunta 38).
- **TQ3 e TQ4:** o joystick anda nas 4 direções, sem diagonal (TQ24); com A, funciona junto (TQ30).
- **TQ5:** vale o 18.19.6. Toque que começa fora da base não age; arrastar para fora da base não solta a direção até soltar o dedo.
- **TQ19:** a base mede 120 CSS px (≥ 48). A bolinha não é alvo. Os quatro braços da cruz saem da lista.
- **TQ22 (c):** o joystick não cobre botão de menu nem texto da barra.

*Casos novos:*
- **TQ23 (posição fixa):** em 844×390 e 667×375, a base aparece no mesmo lugar da cruz e não se move quando se toca fora dela (captura antes e depois). Emulado (CDP).
- **TQ24 (grade):** toque no centro da base e arrasto até o curso (≥ 30 CSS px) em 0°, 90°, 180° e 270°: anda naquela direção. A 45° ± 5°: anda só no eixo dominante. Teste de domínio: 1000 ângulos aleatórios, uma direção por quadro. Emulado (CDP) e automático.
- **TQ25 (zona morta, limiar e histerese; distância euclidiana):** em repouso, deslocamentos de 0, 8 e 16 CSS px: nada. (14, 14) (≈ 19,8): nada. (16, 12) (= 20): engaja para a direita. Com a direção engajada, 16 continua; 12 solta. Teste de domínio e CDP.
- **TQ26 (empurrão nos menus, layout A):** no título, empurrar para baixo: "Como jogar" em foco, uma vez; segurar 3 s: nenhum passo a mais; voltar ao centro e empurrar de novo: "Começar" em foco. Na seleção, esquerda e direita trocam o cartão uma vez por empurrão; cima e baixo não fazem nada. Emulado (CDP).
- **TQ27 (telas sem joystick):** introdução, diálogo, painel, dica, conquista e créditos não mostram a base (captura). Na dica, o empurrão não faz nada além de "Voltar" pelo botão.
- **TQ28 (feedback):** captura com a bolinha a 10, 30 e 40 CSS px do centro: a 10 não há setor (zona morta); a 30 a bolinha segue o dedo, dentro do curso de 36; a 40 ela fica presa na borda do curso. Em 30 e 40 o setor em anel (52 a 60) aparece na direção do eixo dominante, só um, mesmo com dois eixos. Ele aparece ao engajar (acima de 20, a partir do repouso) e some ao voltar a 12 ou menos. No título, empurrar para a esquerda move a bolinha e não acende setor. Emulado (CDP) e captura.
- **TQ29 (deslizar para fora):** o toque começa na base e sai dela (mais de 60 CSS px do centro): a direção segue o lado do dedo; a bolinha fica na borda; soltar fora zera e nada mais age. Emulado (CDP).
- **TQ30 (multitoque):** com a bolinha para a direita, toque em A com outro dedo (id fixo): o sobrinho anda e A examina o objeto à frente; soltar A não para o andar; um terceiro dedo que começa na base não muda a direção. Emulado (CDP).
- **TQ31 (textos):** nenhum texto de toque tem "setas" (busca em `content/`); as chaves de 18.19.10 saem exatas e com até 29 caracteres na barra (captura T1 e T4). Automático e captura.
- **TQ32 (sem cruz):** `window.__alvosDeToque()` (build de QA, ADR-007 12.3) não lista os quatro braços; lista a base de 120 CSS px. Emulado (Playwright).
- **TQ33 (teclado inalterado):** setas e WASD andam nas 4 direções, sem base na tela; RM1 a RM5 (18.14) passam; capturas do smoke de teclado iguais à linha de base do Marco 5. Teclado.

*Só o Diretor testa (aparelho real, PT4b):*
- O setor amarelo basta para a criança entender a direção, ou a bolinha escondida pelo polegar confunde?
- O empurrão nos menus anda na velocidade certa para uma criança de 5 anos?
- O movimento parece controle analógico ou de setas? Uma criança que empurra pouco espera andar mais devagar?
- A base de 120 CSS px cabe no polegar e não cansa?
- A base fixa é natural, ou o polegar procura o controle?
- A base cobre objeto da casa no celular estreito (layout B)?

**18.19.14 Versão e entrega.**
- **Versão:** 0.10.0. Título "v0.10.0" e créditos "Versão 0.10.0", lidos do `package.json`.
- **Antes da 0.10.0:** a 0.9.1 (correção BUG-M5-04: num menu, um toque no braço da cruz passa a dar um passo, sem repetir ao segurar) sai primeiro e tem reteste do QA. A 0.10.0 começa depois desse reteste (decisão do Orquestrador de 2026-11-09).
- **Capturas antes do artifact (o Diretor aprova):** T1 (layout A, 844×390, Sala com a base), T2 (layout B, 667×375, Sala e introdução), T4 (Como jogar com "Mover: controle na tela.") e T7 (close-up do joystick: repouso, no curso e com o setor amarelo, em 844×390).
- **Roteiro sugerido do PT4b (Orquestrador decide):** 1) título, empurrar para baixo e para cima; 2) seleção, esquerda e direita; 3) Sala, andar nas 4 direções e segurar; 4) diagonal: só um eixo anda; 5) deslizar o polegar para fora da base; 6) A e B com o joystick ao mesmo tempo; 7) Como jogar, ler "Mover: controle na tela.".
- **Perguntas-chave:** parece controle analógico ou de setas? A base cobre a casa no celular estreito? O polegar acha a base de primeira? O empurrão nos menus é confortável?
- **Playtest:** a rodada começa só depois do QA (backlog 118) e da aprovação das capturas (backlog 119).

**18.19.15 Fora deste ajuste.**
- Curso livre (andar em diagonal, velocidade proporcional ao empurrão): fora (18.16).
- Joystick flutuante: fora nesta versão. Só muda se a pergunta 43 for respondida com "flutuante"; nesse caso, 18.5 regra 5, 18.19.2 e TQ23 mudam.
- Joystick nos menus do layout B: exige rever a pergunta 38.
- Empurrão na dica: a dica não tem item a mover.
- Sensibilidade ajustável: fica com a fonte ajustável, no Marco 6 (seção 13, item 8).

**18.19.16 Padrões aplicados e pendências.**
- **Pergunta 43 (seção 12):** fixo ou flutuante. Padrão aplicado: fixo.
- **Padrões do Produto (sem pergunta ao Diretor):** base 120 e bolinha 48; curso 36; zona morta 12; distância euclidiana; zona morta `≤ 12`; engajamento `≥ 20` só a partir do repouso, com histerese até 12; eixo dominante; empate mantém a direção anterior; setor em anel de 52 a 60, único, ao engajar; menus com um empurrão = um passo só no layout A; dica sem joystick; textos com "Mover:" e sem "setas" no toque. Os valores são ajustáveis no código depois do PT4b, sem mudar a regra.

**18.19.17 Riscos.**

| # | Risco | Tratamento |
|---|---|---|
| R1 | A bolinha num ângulo intermediário parece diagonal | Setor em anel único, eixo dominante; TQ24 e TQ28 |
| R2 | Dedo sai da base no meio do andar | Captura; bolinha na borda; soltar zera; TQ29 |
| R3 | Joystick e A/B se atrapalham no multitoque | Fontes independentes, um pointer por controle; TQ30 |
| R4 | Tremor do dedo na zona morta ou no limiar liga e desliga o andar | Histerese (12 e 20); TQ25 |
| R5 | Polegar cobre a bolinha e a direção fica ilegível | Setor amarelo na borda, fora do polegar; PT4b |
| R6 | Criança espera andar mais devagar ao empurrar pouco | Velocidade fixa, sem curso proporcional (18.19.1); PT4b |
| R7 | Base cobre objeto no layout B | Base menor que a cruz; TQ2 anota; PT4b |

---

## 19. Especificação do Marco 6 (áudio, pausa e polimento; versão 0.11.0; release 1.0.0)

Detalha o Marco 6 (seção 13, item 6). Origem: o Diretor aprovou o Marco 5 (v0.10.0, joystick) e autorizou a próxima etapa (2026-11-09). O playtest deste marco é o **PT5** (CLAUDE.md): o jogo final, jogado por pelo menos uma criança e um adulto juntos.

**Versão.** Ao fim do marco, **0.11.0** (SemVer: áudio e tela de pausa são recursos novos, versão menor). A **1.0.0** é a tag de release e sai só depois do PT5 aprovado (19.7.1). Textos entre aspas são propostas do Produto para `content/texts/pt-BR.json` (chaves em 19.8). **[Pergunta]** = pergunta aberta (seção 12, 44). Tudo o que os Marcos 1 a 5 fixaram continua valendo, salvo o que esta seção muda de forma explícita.

**Pilares.** Pausa e confirmação não têm tempo (pilar 1). A pausa não abre na dica e não bloqueia nada (pilar 2). Música calma, com sinos, e textos curtos (pilares 3 e 4).

### 19.1 Escopo e fluxo

| Item | No Marco 6 | Onde está |
|---|---|---|
| Áudio | Música de fundo, 13 efeitos, liberação no primeiro gesto, mudo (M e ícone) | 19.2 |
| Tela de pausa | P ou ícone II; continuar, som, como jogar, voltar ao título | 19.3 |
| Polimento | Lista priorizada do que sobrou dos Marcos 1 a 5 e das ideias; o que entra na 1.0 e o que fica fora | 19.4 |
| Acessibilidade básica | Contraste, mudo, tamanho do texto, nenhuma informação só no som | 19.5 |
| Desempenho | Celular intermediário e tamanho do HTML | 19.6 |
| Release 1.0.0 | Critérios de pronto, CHANGELOG, GitHub Pages, roteiro do PT5 | 19.7 |
| Textos | Chaves novas | 19.8 |
| Casos de aceite | O que o QA emula, o que só o Diretor testa, regressão dos Marcos 1 a 5 | 19.9 |
| Fora deste marco | Volume, voz, Nick na conquista, arte nova | 19.10 |
| Pendências e riscos | Pergunta 44, padrões aplicados, riscos | 19.11 e 19.12 |

### 19.2 Áudio

**19.2.1 Música de fundo.**
- Uma faixa, em loop, tranquila, com clima de Natal: **sinos e celesta sintetizados** (padrão aplicado; pergunta 44). Sem voz e sem bateria marcada. Não muda por cômodo.
- Duração-alvo de **36 s** (faixa de 30 a 40 s), com emenda sem silêncio e sem clique audível. Arquivo-alvo de 144 000 bytes (ADR-008 1.4).
- Toca em todas as telas, a partir da liberação (19.2.3): título, seleção, introdução, exploração, diálogo, painel, conquista, dica, pausa, condução, fade, créditos e aviso de rotação. Nenhuma tela pausa a música. Só o mudo a silencia. Durante um jingle de conquista ou o jingle de créditos, a trilha baixa de nível (ducking), sem parar (19.2.7).
- Nos créditos, a mesma faixa (17.7 deixa de dizer "sem música"), com o jingle de créditos JC tocado uma vez por cima dela (19.2.7 c).

**19.2.2 Efeitos.**

| ID | Evento (quando toca) | Caráter | Máximo |
|---|---|---|---|
| S01 | Passos: a cada tile andado pelo sobrinho, na exploração e na condução. Não toca no fade nem no diálogo | Suave, dois tons alternados, baixo | 0,15 s |
| S02 | Troca de área pela porta, no fade de 14.10.5 (P1 a P3, P7 e P8) | Porta curta, grave | 0,5 s |
| S03 | Porta destrancada (P8, código certo), junto com "Clique! A porta abriu." | Clique e ranger leve | 1 s |
| S04 | Interruptor: "Clique!" e as luzes acendendo (14.3) | Clique e acorde curto | 0,8 s |
| S05 | Peça encontrada (15.5) | Brilho e tilintar | 1 s |
| S06 | Encaixe da peça ou da caixa na árvore (15.6, 17.4) | Clique e sino | 1,5 s |
| S07 | "Au!" do Nick (16.5, 16.7) | Latido curto, de brinquedo | 0,4 s |
| S08 | Nick farejando (16.5) | Fungada curta | 0,5 s |
| S09 | Abertura de uma tela de conquista (14.1, 15.5, 17.4). Uma variante por conquista: J01 a J05 (19.2.7) | Jingle curto de sinos e celesta, diferente em cada conquista | 2,5 a 3,8 s (19.2.7) |
| S10 | Abertura de cada página de diálogo (não por letra) | Blip baixo e curto | 0,2 s |
| S11 | Trocar o item em foco (título, seleção, pausa, confirmação, painel) | Tique | 0,1 s |
| S12 | Confirmar um item (A ou Enter, ou toque em item) | Tique mais agudo | 0,2 s |
| S13 | Código errado no painel (14.1) | Dois tons descendentes, suaves, sem buzzer | 0,6 s |

- No máximo 3 efeitos ao mesmo tempo. Se houver mais, o mais antigo para (AU5).
- Nenhum efeito no aviso de rotação. No fade, só o S02.
- Nenhum som é a única informação: cada evento já tem sinal visual (19.5, item 4).

**Regras de derivação (ADR-008 5).** A tabela acima não cobre todos os casos. Estas regras cobrem os demais e valem para o Dev, o QA e a Arte. A tabela de eventos e os ganhos de `content/audio.json` (ADR-008 5) são a fonte dos IDs e dos níveis.
- **R1 (diálogo):** cada página de diálogo que abre toca S10, inclusive a primeira, os avisos "ainda não" (15.2.7) e as falas do Nick. Fechar o diálogo não toca nada.
- **R2 (confirmar):** confirmar um item (A, Enter ou toque no item) toca S12. Vale para "Começar", "Como jogar", "Voltar", "Continuar", "Sim", "Não", "Voltar ao título", "Fechar" e os cartões da seleção. B, X e Esc sem item confirmado não tocam nada.
- **R3 (foco):** mudar o foco com setas, WASD ou empurrão do joystick toca S11. Tocar num item não move o foco visual (18.3): toca só S12.
- **R4 (painel):** dígito e Apagar tocam S11. OK e Fechar tocam S12. Código certo toca S03 (na porta que abre). Código errado toca S13.
- **R5 (sem som):** abrir ou fechar dica, pausa, Como jogar, créditos e painel não toca nada, salvo os casos acima. Fumaça de dormir e abanar do Nick também não tocam.
- **R6 (som ligado):** ligar o som (M, ícone ou item da pausa) toca S12. Desligar não toca.
- **R7 (limite):** quando mais de 3 efeitos tocam ao mesmo tempo, para o mais antigo, com rampa de 10 ms (AU5). A música não conta no limite.
- **R8 (por tela):** aviso de rotação: nenhum efeito (AU7). Pausa: só S11 e S12 de menu. Condução: só S01. Fade: só S02. Música: em todas as telas (19.2.1), inclusive diálogo, painel e conquista.

**19.2.3 Liberação, gesto e mudo.**
- O navegador só libera som depois de um gesto do jogador. Por isso nada toca antes do **primeiro toque, clique ou tecla** em qualquer tela. `Esc` não conta, porque o navegador não o trata como gesto. O gesto libera o som mesmo quando o jogo o ignora (ex.: aviso de rotação, 18.8). Daí em diante, a música começa.
- **Mudo**, sempre ao alcance:
  - **M** (teclado), em todas as telas, exceto no aviso de rotação.
  - **Ícone de som** (toque e mouse), no canto superior esquerdo: no título e na exploração (19.3.2).
- O ícone mostra o estado: alto-falante (ligado) e alto-falante com risco (desligado). Na pausa, o texto diz "Som: ligado" ou "Som: desligado".
- Mudo silencia música e efeitos. Não pausa nem muda nada no jogo.
- **Sem save:** o estado do mudo fica só na memória. Recarregar a página volta a "ligado" (seção 3; sem `localStorage`).
- **Volume fixo.** Sem controle deslizante na 1.0 (19.10).
- **Dentro do iframe (ADR-008 2.5).** O gesto que libera precisa acontecer dentro do documento do jogo. Num artifact do Claude, um clique na interface fora do iframe não libera o som. O jogo não controla o atributo `allow` nem o `sandbox` do iframe. Por isso, antes do PT5, o Orquestrador publica um artifact de teste (um botão e um tom, sem nada da casa) e confirma o som no clique (AU14). Se o ambiente bloquear, o PT5 espera.

**19.2.4 Mixagem.**
- Nenhum arquivo passa de -3 dBFS de pico.
- A música fica cerca de 10 dB abaixo dos efeitos (medida por RMS).
- Passos e diálogo são os mais baixos. Conquista e "Au!" são os mais altos.
- Os níveis ficam em `content/audio.json` (conteúdo, editável sem código). O formato é do ADR-008.
- Os jingles de conquista (19.2.7) entram nas regras (a) e (c) como efeitos, com o ganho de `content/audio.json`. O jingle de créditos entra como música, em soma com a trilha.
- `validarAudio` confere as regras (a) a (d) do ADR-008 4.3 e reprova o conteúdo que as violar (AU10). O efetivo de cada som é o arquivo mais o ganho de `content/audio.json`, com o mestre incluído.

**19.2.5 Fonte e licença.**
- Tudo é **gerado por síntese, original do projeto**. Não há sample, faixa, trecho ou fonte de terceiros, nem de domínio público.
- Os arquivos saem de um script em `tools-arte/` (a Arte escreve; o ADR-008 define a linguagem). O script gera; ninguém edita o arquivo à mão.
- `docs/audio-licencas.md` lista cada arquivo, com origem ("gerado pelo projeto, síntese original") e data.
- Isto substitui, neste marco, o "domínio público ou licença gratuita" da 7.3 (ver 19.11, h).

**19.2.6 Formato e orçamento.**
- Formato: **MP3, mono, 22.050 Hz, CBR 32 kbps**, com a tag do encoder. Toca em Chrome, Edge, Firefox e Safari. Decidido no ADR-008 (aceito em 2026-11-09). AAC em m4a só se a emenda do laço falhar em WebKit (ADR-008 1.3).
- **1 KB = 1000 bytes** (ADR-008 1.4). A faixa-alvo é de **36 s**, que dá 144 000 bytes a 32 kbps.
- Orçamento (áudio em arquivo, antes do base64):

| Item | Limite |
|---|---|
| Música | 160 000 bytes (alvo: 144 000) |
| Cada efeito | 12 000 bytes |
| Todos os efeitos (13) | 160 000 bytes |
| Áudio total | 320 000 bytes |
| HTML único de playtest e de release, com o áudio em base64 | 2 500 000 bytes |

- **Ajuste 0.12.0 (19.2.7):** os limites de jingles e de créditos e o total de 320 000 bytes, com a previsão, estão em 19.2.7 (item e). Os limites acima continuam valendo para o que já existe.
- O `verificar:tamanho` (item 136) reprova o build que passar de um desses limites, com a mensagem do limite e do valor medido.
- **Aviso, sem reprovar:** HTML sem áudio acima de 2 000 000 bytes. No pior caso, o áudio ocupa 426 667 bytes em base64, então o HTML sem áudio precisa ficar em até cerca de 2 073 000 bytes para caber em 2 500 000. Se o aviso aparecer, o Dev avisa o Produto antes de gerar a faixa final. O limite é revisto, não estourado.

**19.2.7 Jingles de conquista e de créditos (ajuste 0.12.0, 2026-11-10).**
Origem: retorno do PT5 do Diretor, literal: "as páginas de conquista pode tocar músicas diferentes?" e "a página de crédito pode tocar um jingle de natal?". O Diretor achou os áudios "legais". Padrão do Produto, com a decisão e o motivo de cada item.

*(a) Conquistas: um jingle por tela.* Hoje as cinco telas de conquista tocam o mesmo S09. Passam a ter um jingle próprio, da mesma família S09 (ADR-008 5), em dó maior, com o timbre de sinos e celesta da trilha (19.2.1), terminando na tônica:

| ID | Conquista (chave) | Tela (onde) | Duração | Caráter |
|---|---|---|---|---|
| J01 | `conquista.luzes` | Conquista 1, luzes (14.1) | 2,5 s | Acorde ascendente curto: a casa acende |
| J02 | `conquista.parte1` | Parte 1 (15.5) | 3,0 s | Tilintar de sinos, leve |
| J03 | `conquista.parte2` | Parte 2 (15.5) | 3,0 s | Como J02, com um degrau a mais |
| J04 | `conquista.parte3` | Parte 3 (15.5) | 3,0 s | Fecho da última peça |
| J05 | `conquista.enfeites` | Caixa de enfeites (17.4) | 3,8 s | O mais cheio, com a última frase da árvore |

- **Arquivos:** `jin_j01_luzes.mp3`, `jin_j02_parte1.mp3`, `jin_j03_parte2.mp3`, `jin_j04_parte3.mp3` e `jin_j05_enfeites.mp3`, e o jingle de créditos `jin_jc_natal.mp3`. Mapa em `assets/audio/audio-jingles-proposta.json` (proposta da Arte, a ser integrada em `content/audio.json` pelo Dev, ADR-008 rev. 2).
- **Motivo:** cada conquista ganha um som com identidade, sem trocar a regra de S09. O S09 deixa de ser um som único e vira a família J01 a J05. O arquivo `sfx_s09_conquista.mp3` sai do catálogo e de `assets/audio/`.
- A dica do jogo não muda: nenhum jingle toca fora de uma tela de conquista ou dos créditos.
- Os sinos, a celesta e a tonalidade seguem a trilha. Não há voz nem bateria (19.2.1).

*(b) Como a trilha se comporta: ducking, não pausa.* Durante um jingle de conquista, a trilha baixa **8 dB** em 0,3 s e volta em 0,5 s, quando o jingle acaba. A trilha não para e não reinicia: é um único laço, e o ganho muda, não a posição. Ao sair da tela (Continuar, X ou B), o jingle para com rampa de 30 ms (sem clique) e a trilha volta ao nível normal.
- **Sem sobreposição:** (1) nunca dois jingles tocam ao mesmo tempo; (2) se a conquista abre com um efeito ainda em curso (S04 interruptor, S05 peça ou S06 encaixe), o jingle espera o fim dele, com teto de 1,5 s. A tela aparece na hora; só o som espera.
- **Ao confirmar Continuar**, o jingle para e S12 toca. Os dois não tocam juntos.
- **Mudo:** o jingle segue no tempo, em silêncio, como a trilha. Desmudar não reinicia nada.
- **Pausa:** não há conquista na pausa nem jingle; a pausa não muda o nível da trilha (19.3.5).

*(c) Créditos: jingle de Natal, uma vez, por cima da trilha.* Ao abrir os créditos (depois do fade de 17.4, item 6), toca **uma vez** o jingle de créditos (JC, `jin_jc_natal.mp3`), de **15 s** (dentro da faixa de 12 a 16 s). A trilha baixa **10 dB** em 0,5 s, durante o jingle, e volta ao nível normal em 0,5 s ao fim dele. Não há laço: o jingle não volta. Ao voltar ao título, o som está no nível normal, e a próxima partida começa sem jingle de créditos até os créditos de novo.
- **Melodia:** original, composta pelo script da Arte (19.2.5), em dó maior, 3/4 ou 4/4, sinos e celesta, terminando na tônica. **Não é domínio público nem tema conhecido**, para não depender de checar licença e para o arquivo sair como "síntese original" (AU12). Um tema de domínio público (ex.: "Jingle Bells", de 1857) seria a alternativa; não foi escolhido porque a faixa de créditos deve soar nova.
- **Duração de 12 a 16 s, e não 20 s:** 20 s dão 80 000 bytes e levam o total a cerca de 312 000, quase no teto de 320 000 e sem folga para um ajuste de Arte. A Arte entregou 15 s (60 517 bytes), com folga. Se o Diretor quiser 20 s, é mudança de orçamento (item e).

*(d) Níveis (ADR-008 4.4 e content/audio.json).* Os jingles de conquista (J01 a J05) entram em **0 dB** de partida, e JC em **−2 dB**. Os 0 dB dos conquistas foram uma correção: com −2 dB, a Arte mediu que a regra A6 de mixagem (ADR-008 4.3) falha; em 0 dB ela passa. A regra (c) fica perto do limite, e o `validarAudio` decide. Os níveis são conteúdo: a Arte ajusta, e os testes decidem.

*(e) Orçamento novo.* O total de 320 000 bytes não sobe. Medido pela Arte em 2026-11-10 (arquivos em `assets/audio/audio-meta.json`):

| Item | Limite (bytes) | Medido em 2026-11-09 | Medido em 2026-11-10 (Arte) |
|---|---|---|---|
| Música (trilha) | 160 000 (sem mudança) | 144 526 | 144 526 |
| Cada jingle de conquista (J01 a J05) | 16 000 | — | 10 466 a 15 690 |
| Jingles de conquista somados | 64 000 | — | 63 509 (folga de 491) |
| Jingle de créditos (JC) | 64 000 | — | 60 517 |
| Efeitos (S01 a S08, S10 a S13, 12 arquivos) somados | 160 000 | 31 446 | 31 446 |
| Áudio total | 320 000 (sem mudança) | 184 453 | 299 998 sem o S09 antigo (308 479 se ele ficar no meta) |
| HTML único (playtest e release) | 2 500 000 | cerca de 1 898 000 | cerca de 2 050 000 (previsão) |

- **Atenção ao S09:** `sfx_s09_conquista.mp3` (8 481 bytes) tem de sair de `assets/audio/` e do meta. Sem ele, o total é 299 998; com ele, 308 479. O teto de 320 000 vale nos dois casos.
- **Folga pequena em J01 a J05:** 491 bytes. Qualquer ajuste de duração de um dos cinco estoura o limite de 64 000 e obriga a voltar ao Produto.
- A previsão de HTML usa o base64 do áudio (4/3) e supõe o HTML sem áudio de cerca de 1 652 000 bytes, o que está abaixo de 2 000 000: o aviso de 19.2.6 não dispara.
- Se algum arquivo passar do limite, ou o total de 320 000, o `verificar:tamanho` reprova. A decisão de subir qualquer limite volta ao Produto, não sai do Dev.

*(f) Testes.* Ver AU15 a AU20 em 19.9, e o item de catálogo em 19.2.2.

### 19.3 Tela de pausa

**19.3.1 Como abre e onde.**
- Teclado: **P**, na exploração.
- Toque: ícone de pausa (duas barras, "II"), no canto superior esquerdo, com 48 CSS px de área de toque.
- Abre nas mesmas telas em que o "?" aparece (16.8.6): a exploração, em todas as áreas. Não abre no título, na seleção, na introdução, no diálogo, no painel, na conquista, na dica, na condução, no fade, nos créditos nem no aviso de rotação. O ícone II some nessas telas.
- A condução não é interrompida (14.11), e a pausa não entra na dica, que já congela o mundo (16.8.5).

**19.3.2 Ícones na tela.**

| Ícone | Onde aparece | Toque | Teclado |
|---|---|---|---|
| II (pausa) | Canto superior esquerdo, exploração | Abre a pausa | P |
| Som (ligado ou desligado) | Canto superior esquerdo: ao lado do II na exploração; sozinho no título | Liga e desliga | M |
| ? (dica, 16.8.1) | Canto superior direito, exploração | Abre a dica | H |

- Mesma caixa e borda dos botões (14.9.4). Desenho de 32 px de jogo, como o "?".
- Nenhum ícone cobre objeto, porta, peça, árvore, bilhete ou Nick. A linha 0 e a coluna de fora não pertencem a nenhuma área (16.8.1); o QA confere em captura.
- O ícone de som aparece no título em qualquer layout. Não é controle de jogo: a regra "menus sem botão" de 18.4 vale para cruz, A e B (19.11, d).

**19.3.3 Itens da pausa.** Título "Pausa" (texto informativo, sem caixa). Quatro itens em coluna, no centro, cada um com caixa (14.9.4):
1. **"Continuar"** (foco inicial). Z ou Enter, X, Esc ou P fecham a pausa e voltam ao mesmo ponto.
2. **"Som: ligado"** ou **"Som: desligado"**. Z ou Enter alterna, e o texto troca na hora. M faz o mesmo.
3. **"Como jogar"**. Abre a tela de 16.10 com as linhas de teclado ou de toque. X, Z, Esc ou "Voltar" fecham e voltam à **pausa**, com foco em "Como jogar". Não vai ao título.
4. **"Voltar ao título"**. Abre a confirmação (19.3.4).
- Setas ou WASD trocam o foco. No toque com layout A, o joystick também troca (cima e baixo; um empurrão = um passo, 18.19.8). Nos limites, o foco para. Tocar em item é clique (18.5, regra 6).

**19.3.4 Confirmação de "Voltar ao título".** Sem save, voltar ao título perde a partida. Por isso, antes de sair, a tela pergunta:
- Texto: "Sair da partida?" / "Ela não fica salva."
- Botões: **"Sim"** e **"Não"**. Foco inicial em **"Não"**, a mesma proteção do aviso de save de 2026-11-07.
- "Sim": vai ao título e começa do zero (seção 3).
- "Não": volta à pausa, com foco em "Voltar ao título".
- Esquerda e direita trocam o foco entre Sim e Não. Sem tempo.

**19.3.5 O que congela.** Com a pausa aberta, o mundo para por completo, como na dica (16.8.5): o sobrinho, o Nick, as animações e a seta de farejar (com os 5 s) param. Ao fechar, tudo retoma do mesmo ponto. A música continua (19.2.1). Se o aparelho girar com a pausa aberta, o aviso de rotação aparece (18.8); ao voltar à paisagem, a pausa segue no mesmo item.

**19.3.6 Barra e botões por tela.**

| Tela | Barra, teclado | Barra, toque layout A | Barra, toque layout B | Botões de toque (layout B) |
|---|---|---|---|---|
| Pausa | "Setas: escolher  Z: confirmar" / "X ou P: continuar" | "Mover: escolher  A: confirmar" / "B: continuar" | "Toque para escolher" / "Toque em Continuar" | Nenhum (18.4) |
| Confirmação | "Z: sim  X: não" | "A: sim  B: não" | "Toque em Sim ou em Não" | Nenhum |
| Como jogar, vindo da pausa | "Z ou X: voltar" | "A ou B: voltar" | "Toque em Voltar" | Nenhum |

**19.3.7 Textos.** Em 19.8.

### 19.4 Polimento: o que entra e o que fica fora da 1.0

**19.4.1 Lista priorizada.** P0 = bloqueia o PT5. P1 = entra se não atrasar o PT5. "Fechado" = sem trabalho novo.

| # | Item | Origem | Prioridade | Entra na 1.0 | Dono | Backlog |
|---|---|---|---|---|---|---|
| 1 | "Quase! Leia o bilhete de novo." continua na tela enquanto o jogador apaga | Checklist do Marco 5; `qa/bugs.md` | P0 | Sim | Dev | 129 |
| 2 | Nome do DanDan quase tocando a borda do cartão da seleção | Briefing do Orquestrador (ver 19.11, n) | P0 | Sim | Dev + Arte | 130 |
| 3 | BUG-M2-02, BUG-M2-04 e BUG-M2-05 (a confirmar) | `qa/bugs.md` | P0 | Sim, se confirmados | QA; Dev ou Arte corrige | 132 |
| 4 | BUG-M2-03: faixa de passos da condução (E7 e E20) | `qa/bugs.md` | P0 (documento) | Sim | Produto | 133 |
| 5 | Casos ainda sem teste: F9, F6-AU e F8 (diálogo e painel); fumaça de dormir no Escritório; Nick no Quarto e no Escritório | PT1e, PT3, PT4a e checklists dos Marcos 3 e 5 | P0 | Sim | QA | 132, 138 |
| 6 | Alvo "Voltar ao título" da seleção no layout B, com 1 px de folga | PT4 | P1 | Sim | Dev | 138 |
| 7 | Setor amarelo no título e na seleção; TQ27 nas telas de conquista, painel e introdução; velocidade do joystick igual à do teclado (REG-V) | QA do Marco 5 (joystick) | P1 | Sim | QA | 138 |
| 8 | Piso de 12 px de jogo para texto (acessibilidade) | GDD 10 e pendência 8 | P0 | Sim | Dev | 131 |
| 9 | Ícones de pausa e som, tela de pausa e linhas de Como jogar | Marco 6 | P0 | Sim | Arte + Dev | 123 a 128 |
| 10 | BUG-R13-03: resto de cena atrás do painel da senha | `qa/bugs.md` | P1 | Sim | Dev (fundo sólido) | 132 |
| 11 | Gancho de QA: base do joystick listada durante o fade | QA do Marco 5 | P1 (ferramenta de QA) | Sim, só no build de QA | Dev | 134 |
| 12 | Sprites parados por direção (item 015) | Playtest PT1 | P1 | Só se ainda estiver aberto | Arte (confirma) | 132 |
| 13 | BUG-R13-01 (geometria de P1 a P3), BUG-R14-01 (árvore desmontada no tile (3,8)) e BUG-R15-01 (caixa do diálogo no topo) | `qa/bugs.md` | Fechado | Sem trabalho, salvo reteste negativo | QA (fecha) | 132 |

**19.4.2 Regra de polimento.** Na 1.0 entra só correção e o que está nesta lista. Se um item pedir tela, controle ou conteúdo novo, ele vai para 1.x (19.4.3). Nada entra por gosto de última hora sem decisão do Diretor.

**19.4.3 Ideias futuras (1.x e depois).**

| Ideia | Origem | Destino |
|---|---|---|
| Novos mapas e missões, pelo manifesto, sem mudar o motor | Seção 11 e ADR-002 | 1.1 ou depois (versão menor) |
| Arte em estilo Sea of Stars, com perfil novo | Item 021 (critério 4) e decisão de 2026-11-07 | 1.x (já decidido; 19.11, t) |
| Sprite 48×72 | Pendência 13 | Só com perfil novo, se a arte pedir |
| Nick na tela de conquista | 16.15 e 17.14 | Ideia |
| Afagar o Nick, com texto | 16.15 | Ideia |
| Caminhada especial do Nick, como animação extra | 16.15 | Ideia (a Arte decide) |
| Sorteio das peças e da caixa a cada partida | Seção 11 | Ideia (exige revisar 4.5 e 16.2) |
| Botão "Créditos" no título; créditos com tempo ou rolagem; mais de um final; "novo jogo +" | 17.14 | Ideia |
| Pergunta de créditos (opção B da 37) | 17.4 | Ideia (padrão A) |
| Corrida | 4.1 e seção 11 | Fora da v1 (B é do farejar) |
| Analógico de curso livre; joystick flutuante; sensibilidade ajustável | 18.16 e 18.19.15 | Ideia |
| Andar tocando no destino; vibração | 18.16 | Ideia |
| Volume ajustável; trilha por cômodo; som espacial | 19.10 | Ideia |
| Tamanho de fonte ajustável | Pendência 8 | 1.x (19.5) |
| Idiomas | Seção 11 | Fora |
| Save e "continuar" | Seção 3 e ADR-002 | Nunca na v1.x |

### 19.5 Acessibilidade básica (1.0)

1. **Contraste.** Texto com ≥ 4,5:1 sobre o fundo, medido em captura. Borda e ícones (II e som) com ≥ 3:1. Os ícones usam `#1b2452` com borda `#9aa3c7` (5,9:1), como os botões de 14.9.4.
2. **Mudo.** M e ícone de som, com um gesto (19.2.3).
3. **Tamanho do texto.** Fonte fixa, corpo de 16 px de jogo (Press Start 2P, decidido em 2026-11-07). Nenhum texto abaixo de 12 px de jogo; o validador (item 131) impede. Em 667×375, o menor texto tem ≥ 12 CSS px. Ajuste de tamanho de fonte fica para 1.x: barras e caixas têm limites de caracteres medidos (29, 28 e 27), e um segundo tamanho quebraria esses limites.
4. **Nenhuma informação só no som.** Porta, interruptor, peça, encaixe, "Au!", farejar e conquista têm sinal visual (balão, seta, luz, tela de conquista, tremida). O QA joga com o mudo ligado (AU6).
5. **Sem pisca rápido.** Nenhum elemento pisca mais de 3 vezes por segundo. O halo (2 s), as tremidas (0,4 s) e o fade (0,5 s) ficam abaixo disso. Sem flash de tela.
6. **Não depender só de cor.** O mudo tem o risco no desenho, e o menu escreve "Som: desligado". A seta de farejar tem as tremidas, além da cor amarela.
7. **Teclado e toque.** Toda ação tem as duas formas (19.3.6 e 18.4).
8. **Sem pressa.** A pausa e a confirmação não têm tempo (pilar 1).

### 19.6 Desempenho em celular intermediário

- **Referência:** celular de faixa média de 2021. No Chromium, o QA aproxima com CPU 4× mais lenta e rede "Fast 4G" (emulados; DS1 a DS4). O aparelho real é do Diretor, no PT5.
- **Quadros:** em 60 s de exploração a 844×390 ou 667×375, com música e efeitos ligados, média ≥ 45 quadros por segundo e nenhum intervalo de 2 s abaixo de 30.
- **Início:** título pronto em até 4 s, com rede Fast 4G emulada.
- **Decodificação do áudio:** os 14 arquivos decodificados no boot em até 500 ms com CPU 4× (`__estado().audio.tempoDecodeMs`, ADR-008 10). Não bloqueia o título.
- **Tamanho:** HTML de playtest e de release ≤ 2,5 MB (19.2.6).
- **Som e toque:** do toque ao primeiro som ou à primeira ação, no máximo 100 ms.
- **Memória:** 10 min de jogo com trocas de área e efeitos, sem crescimento acima de 30 MB. Se a rodada não couber, vira "não testado (limite de tempo)".
- **Se falhar:** o Dev reduz trabalho de quadro (ex.: halo, luz) antes de mexer em regra. A regra de 18.9 e a escala do ADR-003 não mudam.

### 19.7 Versão, release 1.0.0 e PT5

**19.7.1 Versão.**
- O Marco 6 entrega **0.11.0** (recurso novo, versão menor). Título "v0.11.0" e créditos "Versão 0.11.0", lidos do `package.json`.
- **Ajuste pós-PT5 (2026-11-10): 0.12.0.** O retorno do PT5 pediu jingles por conquista e um jingle de créditos (19.2.7). São arquivos de áudio novos e um comportamento novo (ducking): é recurso, então versão menor, e não patch. Não se aplica o "0.11.1" desta seção a esse ajuste; o 0.11.1 fica para correções sem recurso novo.
- A **1.0.0** é a tag de release e sai só depois do PT5 aprovado pelo Diretor. Motivo: a 1.0.0 promete jogo completo; antes do teste com crianças seria um rótulo sem prova. Ajustes do PT5 saem como 0.11.1, 0.11.2 etc. (SemVer, patch), e a 1.0.0 é o build aprovado.
- Sem tag de pré-lançamento (1.0.0-rc): o pipeline (ADR-002 seção 1) não tem regra para isso, e o artifact de playtest não é release.

**19.7.2 Critérios de pronto da release 1.0.0.** Todos precisam valer:
1. PT5 aprovado pelo Diretor, com uma criança e um adulto jogando juntos. Retorno em `playtests.md`. Nenhum bug de severidade alta aberto; os de média e baixa aparecem como conhecidos no CHANGELOG.
2. QA: checklist do Marco 6 (19.9) aprovado, com o que ficou "não testado (limite de tempo)" listado no relatório.
3. `package.json` com `"version": "1.0.0"`; título "v1.0.0" e créditos "Versão 1.0.0".
4. `CHANGELOG.md` na raiz, em Keep a Changelog, com as seções de 0.1.0 a 1.0.0. A 1.0.0 resume os Marcos 1 a 6 e a lista de conhecidos.
5. Tag `v1.0.0` na `main`. O GitHub Actions passa: testes, `verificar:conteudo`, `validar:perfil`, `verificar:tamanho` e build (ADR-002 seção 1).
6. **GitHub Pages** com o jogo e a versão visível. **GitHub Release** com a seção do CHANGELOG.
7. O build final é o código aprovado no PT5 (mesmo commit, ou só versão e CHANGELOG).
8. Checagens automáticas no build de release: nenhum gancho de QA; nenhum `localStorage`; nenhum nome de pessoa da família além de "Tio Ítalo" e "Tia Nath" no nome do jogo (seção 10, item 034).
9. `docs/audio-licencas.md` completo (19.2.5).
10. Smoke no Pages: título, exploração, créditos e volta ao título, no Chromium, sem erro de console.
11. Teste de novo mapa via manifesto (item 013) passa no workflow.
12. `metrics/resumo.md` escrito pelo Orquestrador (CLAUDE.md).

**19.7.3 Roteiro do PT5 (sugestão do Produto; o Orquestrador decide).**

Pré-requisito: o artifact de teste de áudio (AU14, 19.2.3) toca o som no clique, no computador e no celular. Se bloquear, o PT5 espera.

1. Título: tocar em qualquer lugar (o som começa). Desligar e ligar o som pelo ícone.
2. Como jogar: ler o botão de pausa e o do som.
3. Seleção, introdução e porta: um código errado e depois o certo. Ver o "Quase!" sumir ao apagar.
4. Luzes, condução e farejar com o Nick.
5. Pausa (P ou o ícone II): ver os itens, abrir Como jogar e voltar; em "Voltar ao título", escolher "Não".
6. Partes 1 a 3, enfeites, créditos com música e volta ao título.

Perguntas-chave (CLAUDE.md, PT5): dá para jogar junto? Alguém travou? Algo confuso ou infantil demais? A música cansa depois de 15 min? O ícone de som é achado sem ajuda? A pausa é clara e não tira nada? O "Quase!" some na hora certa?

### 19.8 Textos do Marco 6 (pt-BR)

Chaves novas em `content/texts/pt-BR.json`. Limites: barra até 29 caracteres por linha; diálogo até 2 linhas de 28; Como jogar até 27 por linha. Os textos são propostas do Produto.

| Chave | Texto | Onde aparece |
|---|---|---|
| `pausa.titulo` | "Pausa" | Título da pausa |
| `pausa.continuar` | "Continuar" | Item 1 |
| `pausa.som.ligado` | "Som: ligado" | Item 2 |
| `pausa.som.desligado` | "Som: desligado" | Item 2 |
| `pausa.comojogar` | "Como jogar" | Item 3 |
| `pausa.sair` | "Voltar ao título" | Item 4 |
| `pausa.sair.pergunta` | "Sair da partida?" (linha 1) / "Ela não fica salva." (linha 2) | Confirmação |
| `pausa.sair.sim` | "Sim" | Confirmação |
| `pausa.sair.nao` | "Não" | Confirmação (foco inicial) |
| `barra.pausa1` | "Setas: escolher  Z: confirmar" | Pausa, teclado, linha 1 |
| `barra.pausa2` | "X ou P: continuar" | Pausa, teclado, linha 2 |
| `barra.pausa1.toque` | "Mover: escolher  A: confirmar" | Pausa, toque, layout A, linha 1 |
| `barra.pausa2.toque` | "B: continuar" | Pausa, toque, layout A, linha 2 |
| `barra.pausa1.toque.menu` | "Toque para escolher" | Pausa, toque, layout B, linha 1 |
| `barra.pausa2.toque.menu` | "Toque em Continuar" | Pausa, toque, layout B, linha 2 |
| `barra.sair` | "Z: sim  X: não" | Confirmação, teclado |
| `barra.sair.toque` | "A: sim  B: não" | Confirmação, toque, layout A |
| `barra.sair.toque.menu` | "Toque em Sim ou em Não" | Confirmação, toque, layout B |
| `comojogar.pausa` | "P: pausa.  M: mudo." | Como jogar, teclado (linha nova, no fim) |
| `comojogar.pausa.toque` | "No alto: pausa e mudo." | Como jogar, toque (linha nova, no fim) |

- Nenhum texto de toque cita Z, X, P, M, H, Esc, Enter ou Backspace (teste de busca em `content/`).
- Os textos de teclado e de toque que já existem não mudam (teste de igualdade).
- Nenhum texto cita nome de família (034).

### 19.9 Casos de aceite (QA)

**Regras.** Cada rodada dura no máximo 15 minutos (regra do Diretor, 2026-11-07). O que não couber vira "não testado (limite de tempo)". "Emulado" = Chromium, com teclado e CDP. "Gancho" = `window.__estado()` do build de QA, com os campos `audio` e `pausa` (itens 125 e 127). **Ordem de prioridade**, se o tempo acabar: PO1, PS1, PS3, PS4, AU1, AU4, PS7, PO2, RG6-6, RG6-3, AU6, AC1.

*Áudio (AU)*
- **AU1 (liberação):** sem nenhum gesto, nada toca (gancho: liberado = falso). O primeiro clique ou toque no título libera, e a música começa. A primeira tecla (setas, Z ou Enter) também libera. Um toque no aviso de rotação (390×844) libera. Emulado (gancho).
- **AU2 (música):** a música toca em título, seleção, introdução, exploração, dica, pausa, condução, fade e créditos (gancho: música ativa em cada tela), e não para ao trocar de área. Emulado (gancho).
- **AU3 (efeitos):** o gancho registra cada evento no momento certo: 5 tiles andados (S01 ×5), a troca de área (S02), a P8 destrancada (S03), o interruptor (S04), uma peça (S05), o encaixe (S06), o "Au!" (S07), o farejar (S08), uma conquista (S09), cada página de diálogo (S10, uma vez por página), o foco de menu (S11), o confirmar (S12) e o código errado (S13). Emulado (gancho) e teclado.
- **AU4 (mudo):** M liga e desliga (gancho: mudo). Com mudo, nenhum evento toca e a música para. O ícone e o texto da pausa mudam para desligado. Recarregar a página volta a ligado. Teclado e, no toque, o clique no ícone. Emulado.
- **AU5 (limite):** no máximo 3 efeitos ao mesmo tempo, mesmo andando rápido e trocando de área (gancho). Emulado.
- **AU6 (sem informação só no som):** com o mudo ligado, jogar porta, luzes, peça, encaixe, "Au!" e conquista. Cada um tem sinal visual (captura de cada um). Teclado.
- **AU7 (horário):** nada toca no aviso de rotação, no título antes da liberação, na pausa (só S11 e S12 de menu), na condução (só S01) e no fade (só S02). Emulado (gancho).
- **AU8 (mapa de eventos):** teste automático: os 13 IDs têm arquivo e chave em `content/audio.json`; nenhum evento fica sem som. Automático.
- **AU9 (orçamento):** `verificar:tamanho`: música ≤ 160 000 bytes; cada efeito ≤ 12 000; **todos os efeitos somados ≤ 160 000**; jingles de conquista (16 000 cada, 64 000 somados) e jingle de créditos (64 000), conforme 19.2.7 (e) a partir de 0.12.0; áudio total ≤ 320 000; HTML ≤ 2 500 000 bytes. Aviso, sem reprovar, se o HTML sem áudio passar de 2 000 000 (19.2.6). Automático.
- **AU10 (mixagem):** o pico de cada arquivo fica ≤ -3 dBFS. Medido no **efetivo** (arquivo mais o ganho de `content/audio.json`, mestre incluído): a música fica entre 7 e 13 dB abaixo da média dos 13 efeitos (10 ± 3 dB), e a soma do pico dos três efeitos mais altos com o da música fica ≤ 1,0 (ADR-008 4.3, regras a e c). Automático.
- **AU11 (laço):** início e fim da faixa com no máximo 20 ms de silêncio, medido no meta depois da aparagem do atraso do encoder (ADR-008 1.4). Automático. A emenda sem clique é ouvida pelo Diretor (AU13).
- **AU12 (licença):** `docs/audio-licencas.md` lista cada arquivo com "gerado pelo projeto, síntese original" e data; nenhum arquivo de terceiros em `assets/` ou `content/`. Verificação manual do QA.
- **AU13 (só o Diretor):** a música agrada, a emenda do laço não se percebe, os efeitos não irritam e a música não cansa em 15 min.
- **AU15 (jingle por conquista, 19.2.7 a):** ao abrir cada uma das cinco conquistas, `ultimosEventos` registra S09 com a variante certa (J01 a J05), uma vez. Os cinco arquivos têm hash diferente. Emulado (gancho).
- **AU16 (ducking, 19.2.7 b e c):** durante o jingle, o campo de ganho da trilha no gancho cai 8 dB (conquista) ou 10 dB (créditos) e volta ao normal ao fim. A posição do laço cresce sem voltar a zero (sem reinício). Emulado (gancho).
- **AU17 (sem sobreposição, 19.2.7 b):** nunca dois jingles ao mesmo tempo. Com S04, S05 ou S06 em curso, o jingle da conquista começa só depois do fim desse efeito (teto de 1,5 s). Ao confirmar Continuar, o jingle para e S12 toca. Emulado (gancho, instantes de `ultimosEventos`).
- **AU18 (sem clique, 19.2.7 b):** no corte (Continuar, mudo ou fim), a saída usa rampa de 30 ms, e o gancho registra a rampa. Não há salto de amplitude. Emulado (gancho) e ouvido pelo Diretor (AU13).
- **AU19 (mudo e pausa, 19.2.7 b e f):** com o mudo ligado, nenhum jingle é ouvido, e a trilha não para (gancho: mudo, ganho mestre 0, posição da trilha). Na pausa não há jingle e a trilha mantém o nível (gancho). Emulado (gancho).
- **AU20 (créditos, 19.2.7 c):** ao abrir os créditos, JC toca uma vez (gancho: `ultimosEventos` com JC, contado 1), a trilha baixa 10 dB durante o jingle e volta ao fim. Voltar ao título e recomeçar não toca JC de novo fora dos créditos. Emulado (gancho).
- **AU21 (iPhone, interruptor de silencioso; só o Diretor, com o conserto do Dev):** no iPhone 16 Pro, Safari, com o interruptor de silencioso **desligado**, a música e os efeitos tocam depois do primeiro toque dentro do artifact (AU1, AU14). Com o interruptor **ligado**, o jogo não mostra erro e fica sem som pelo aparelho; ao desligar o interruptor, o som volta sem recarregar a página. Padrão do Produto: o jogo respeita o silencioso do aparelho, como qualquer app de jogo. O teste usa o artifact de diagnóstico (backlog 149). Só o Diretor testa.
- **AU14 (ambiente, Orquestrador, antes do PT5):** o artifact de teste (um botão e um tom de 1 s, sem nada da casa) toca o tom no clique dentro dele (19.2.3). No celular, o Diretor confirma no mesmo teste. Manual; se bloquear, o PT5 espera.

*Pausa (PS)*
- **PS1 (abrir, teclado):** P na exploração de Hall, Sala, Cozinha, Quarto e Escritório abre a pausa, com foco em "Continuar". Teclado.
- **PS2 (abrir, toque):** o ícone II abre a pausa em 844×390 e em 667×375 (layout B). Emulado.
- **PS3 (fechar):** "Continuar", X, Esc e P fecham, e o jogo volta ao mesmo ponto (mesma posição, mesmo tile). Teclado e emulado.
- **PS4 (congela, sem tempo):** com a pausa aberta, setas, WASD e joystick não movem; o Nick não anda; a seta de farejar não avança. Depois de 3 min de pausa, a seta retoma com o tempo que faltava. Emulado (gancho).
- **PS5 (não abre onde não deve):** P e o ícone II não abrem no título, na seleção, na introdução, no diálogo, no painel, na dica, na conquista, na condução, no fade, nos créditos nem no aviso; o ícone II some nessas telas (captura). Teclado e emulado.
- **PS6 (itens):** Z ou Enter em "Som" alterna o texto; M também. "Como jogar" abre a tela; X, Z, Esc ou "Voltar" voltam à pausa com foco em "Como jogar", não ao título. Teclado.
- **PS7 (voltar ao título):** "Voltar ao título" pede confirmação com foco em "Não". "Não" volta à pausa, com foco em "Voltar ao título". "Sim" vai ao título, e "Começar" leva à seleção do zero, sem nada salvo. Teclado e toque.
- **PS8 (textos):** os textos de 19.8 aparecem exatos em cada tela e layout (captura). Busca em `content/`: nenhum texto de toque cita tecla. Emulado.
- **PS9 (layout B, 667×375):** pausa e confirmação sem cruz, A, B ou joystick; toque direto no item; os ícones de pausa e som não cobrem texto (captura). Emulado.
- **PS10 (girar):** com a pausa aberta, girar para retrato mostra o aviso; voltar à paisagem mostra a pausa com o mesmo item em foco. Emulado.
- **PS11 (Como jogar):** as linhas novas ("P: pausa.  M: mudo." no teclado; "No alto: pausa e mudo." no toque) aparecem no fim da lista e cabem em 480×352 sem corte (captura). Emulado.
- **PS12 (sem tempo na tela):** a pausa não mostra contagem nem tempo. Emulado.
- **PS13 (dica):** P e o ícone II não fazem nada na dica, e a dica segue igual (16.8.5). Teclado.

*Polimento (PO)*
- **PO1 ("Quase!"):** depois de "Quase! Leia o bilhete de novo.", a primeira tecla de dígito, X ou Backspace tira a mensagem. O próximo código errado mostra a mensagem seguinte da ordem ("Hmm, esse não é. Tente outra vez!"). "Faltam números." também some na primeira tecla. Teclado e toque emulado.
- **PO2 (DanDan):** captura dos 4 cartões em 480×352 e 667×375: o nome tem ≥ 4 px de folga até a borda interna, sem corte. Emulado (captura).
- **PO3 ("Voltar ao título" na seleção, layout B):** a área de toque tem ≥ 48 CSS px sem invadir o cartão (medida por `__alvosDeToque`), e o toque volta ao título. Se invadir (V6), o QA anota. Emulado.
- **PO4 (bugs):** cada item 3, 5, 10, 11, 12 e 13 de 19.4.1 fechado com evidência ou com correção no backlog; nenhum "a confirmar" resta. QA.
- **PO5 (GDD 15.10):** a faixa de passos de E7 e E20 bate com a rota medida ao vivo (19.11, l). QA.

*Acessibilidade (AC)*
- **AC1 (contraste):** texto da pausa e da confirmação com ≥ 4,5:1; II e som com ≥ 3:1. Medidor sobre captura. Emulado.
- **AC2 (piso de texto):** automático: nenhum texto abaixo de 12 px de jogo. Captura em 667×375: menor texto ≥ 12 CSS px. Automático e captura.
- **AC3 (sem informação só no som):** é o AU6.
- **AC4 (pisca):** nenhum elemento pisca mais de 3 vezes por segundo (captura de 2 s com halo, tremida e fade). Emulado.
- **AC5 (cor):** o estado do som aparece no desenho (risco) e no texto. Captura.
- **AC6 (teclado e toque):** P e II, M e som, Z e A, X e B, setas e joystick: cada par faz a mesma coisa (PS1, PS2 e AU4). Emulado.
- **AC7 (só o Diretor):** texto e ícones legíveis no celular, na distância normal de uso.

*Desempenho (DS)* (19.6)
- **DS1 (quadros):** 60 s de exploração com CPU 4× mais lenta e som ligado: média ≥ 45 e nenhum intervalo de 2 s abaixo de 30. Num carregamento com a mesma CPU 4×, `tempoDecodeMs` ≤ 500 ms (19.6). Emulado.
- **DS2 (início):** título pronto em até 4 s com Fast 4G emulado. Emulado.
- **DS3 (latência):** do toque ao primeiro som ou ação, até 100 ms (gancho com marcas de tempo). Emulado.
- **DS4 (memória):** 10 min com trocas de área e efeitos, sem crescimento acima de 30 MB. Emulado; se não couber, "não testado (limite de tempo)".
- **DS5 (tamanho):** `verificar:tamanho` (AU9). Automático.
- **DS6 (só o Diretor):** aparelho intermediário real: travamento, aquecimento, bateria e sensação de resposta.

*Regressão dos Marcos 1 a 5 (RG6)*
- **RG6-1 (Marco 1):** título, Como jogar, seleção (os 4 nomes), introdução, porta (um erro, código certo), luzes, condução, e Hall, Sala e Cozinha. Teclado (amostra do checklist do Marco 1, com os 4 sobrinhos).
- **RG6-2 (Marco 2):** as 3 partes em ordem; "ainda não" fora de ordem; condução 2× acima de 10 tiles; árvore com 3 partes; fade na P7. Teclado (casos prioritários da 15.10).
- **RG6-3 (Marco 3):** N1, N2, N4, N9, N10, F1, F4, D1, D3 e B1 (ordem de 16.14), e agora F9 (passar pelo gatilho com a seta), F6-AU ("Au!" depois da parte 3 com Nick acordado) e F8 (B em diálogo, painel, dica, conquista e condução não tem efeito). Teclado.
- **RG6-4 (Marco 4):** EN-PT1 a EN-PT5 (17.18), encaixe, diálogo final, créditos com música e volta ao título. Teclado.
- **RG6-5 (Marco 5):** TQ1, TQ3, TQ5, TQ7, TQ8, TQ10, TQ13, TQ16, TQ19 e TQ22 (layout B, 667×375), os casos de joystick TQ23 a TQ33 (18.19.13) e RM1 a RM5 do teclado. Emulado.
- **RG6-6 (fluxo completo):** roteiro do PT5 (19.7.3) sem o passo da pausa, primeiro em teclado e depois em toque emulado, sem erro no console. Teclado e emulado.

*Release (RL)* (item 141, depois do tag)
- **RL1 (versão):** "v1.0.0" no título e "Versão 1.0.0" nos créditos, lidos do `package.json`. Emulado (captura).
- **RL2 (CHANGELOG):** seções de 0.1.0 a 1.0.0 presentes. Automático.
- **RL3 (publicação):** workflow verde; o jogo abre no GitHub Pages; GitHub Release com a seção do CHANGELOG. Manual.
- **RL4 (checagens de release):** sem gancho de QA, sem `localStorage` e sem nome de familiar além dos permitidos. Automático.
- **RL5 (smoke no Pages):** título, exploração, créditos e volta ao título, sem erro de console. Emulado.

*Só o Diretor testa (PT5, aparelho real e pessoas)*
- Dá para jogar junto, criança e adulto? Alguém travou?
- A música agrada, e os efeitos não incomodam?
- O ícone de som é achado sem ajuda? A pausa é clara?
- No celular real, os ícones II e som são alvos confortáveis e não cobrem a casa.
- Som no Safari (iPhone) e no Chrome (Android): a liberação do áudio funciona no primeiro toque.
- O "Quase!" some na hora certa? Algo confuso ou infantil demais?

### 19.10 Fora de escopo deste marco
- Volume ajustável, trilha por cômodo, som espacial e música por fase.
- Voz, narração e som de diálogo por letra.
- Guardar a preferência de som (sem save).
- Nick na tela de conquista, afagar e caminhada especial (19.4.3).
- Arte nova em estilo Sea of Stars e sprite 48×72 (19.4.3).
- Tamanho de fonte ajustável (19.5).
- Idiomas, app nativo, tela cheia e trava de orientação (seção 11; 18.16).
- Botão "Créditos" no título e créditos com tempo ou rolagem.
- Novos mapas e missões (1.1 ou depois).

### 19.11 Pendências deste marco e padrões aplicados

- **Pergunta 44 (seção 12): estilo da música.** Aberta; padrão aplicado: B (sinos e celesta). Só a faixa (item 123) espera a resposta.
- **Padrões aplicados (sem pergunta ao Diretor):**
  - a. P abre a pausa; M alterna o mudo; II e som ficam no canto superior esquerdo (19.3.2).
  - b. A pausa só abre onde o "?" abre (16.8.6). A música não para em nenhuma tela (19.2.1).
  - c. "Voltar ao título" pede confirmação, com "Não" em foco, porque não há save.
  - d. O ícone de som aparece no título em qualquer layout. Não é controle de jogo; a regra de 18.4 vale para cruz, A e B.
  - e. A liberação do som vem do primeiro gesto, mesmo quando o jogo o ignora.
  - f. O mudo volta a "ligado" ao recarregar a página (sem save).
  - g. Volume fixo, sem controle deslizante.
  - h. Áudio gerado por síntese, original do projeto. Substitui, neste marco, o "domínio público ou licença gratuita" da 7.3 e do style-guide (o Especialista atualiza o style-guide no item 122).
  - i. Formato MP3 mono 32 kbps e orçamento de 19.2.6; o ADR-008 confirma.
  - j. "Quase!" e "Faltam números." somem na primeira tecla de dígito, X ou Backspace. Antes, ficavam na tela até o próximo OK.
  - k. Fonte fixa, com piso de 12 px de jogo. Pendência 8 decidida por padrão; ajuste de fonte fica para 1.x.
  - l. BUG-M2-03 não é bug de jogo. A regra de 14.11 (2× acima de 10 tiles) está certa; as faixas da 15.10 e da 15.3.5 ficaram desatualizadas com a planta girada e a Lavanderia. Corrigidas em 2026-11-09 pela medida do QA: E7 = 13 passos e E20 = 17 passos, ambas em 2× (15.3.5). A rota não mudou.
  - m. BUG-R13-01, BUG-R14-01 e BUG-R15-01 ficam fechados pelas decisões de 2026-11-08 (`decisions.md`), salvo reteste negativo.
  - n. Origem da observação do DanDan: não encontrei o registro nos arquivos do repositório (`playtests.md`, `qa/`). Tratei como vinda do briefing do Orquestrador. Confirmar a origem e a captura antes do item 130.
  - o. Versão 0.11.0 no PT5 e 1.0.0 na release, sem tag de pré-lançamento (19.7.1).
  - p. As pendências 31 a 37 e 42 a 43 fecham por implicação dos retornos (PT3b, PT4a e PT4b) e da aprovação do Marco 5. O Orquestrador registra em `decisions.md`.
  - q. Os créditos ganham a faixa de fundo (17.7), sem texto novo.
  - r. Nick na tela de conquista: fora da 1.0 (19.4.3).
  - s. Como jogar ganha uma linha por modo (19.8). Se não couber em 480×352, reduz-se o espaçamento (14.8); a linha de som não sai.
  - t. Arte nova em estilo Sea of Stars: fora da 1.0. Já decidido em 2026-11-07 (item 021, critério 4: versão 1.x), por isso não virou pergunta.
  - u. Liberação do som dentro do iframe do artifact (ADR-008 2.5): o gesto precisa ser no documento do jogo. O artifact de teste antes do PT5 é o AU14.
  - w. Jingles de conquista e de créditos (19.2.7, retorno do PT5, 2026-11-10): um jingle por conquista (J01 a J05), ducking da trilha em vez de pausa, jingle de créditos uma vez, original, 12 a 16 s. Limites novos em 19.2.7 (e); o total de 320 000 não sobe.
  - x. Versão 0.12.0 para o ajuste pós-PT5 (19.7.1), não 0.11.1.
  - y. Pergunta ao Diretor (créditos): o jingle de créditos toca uma vez por cima da trilha (padrão aplicado, 19.2.7 c), ou em laço durante os créditos? Sugestão: uma vez, porque os créditos ficam o tempo que a pessoa quiser e um jingle em laço cansa.
  - v. Música em todas as telas, inclusive diálogo, painel e conquista (19.2.1 diz "todas as telas"; a lista de R8 no ADR-008 não citava essas três, e o GDD prevalece).

### 19.12 Riscos

| # | Risco | Tratamento |
|---|---|---|
| 1 | A música cansa em 15 min de jogo | Faixa curta de 30 a 40 s, em loop, volume baixo; mudo fácil (M e ícone); PT5 pergunta. Se cansar, troca de faixa é arte, sem mudar a regra |
| 2 | O som no celular atrasa o toque ou trava em aparelho intermediário | Orçamento pequeno; no máximo 3 efeitos; DS1 e DS3, medidos antes do PT5 |
| 3 | A criança não acha o mudo nem a pausa | Ícones visíveis; a pausa aparece em Como jogar; PT5 pergunta. Se não achar, ajusta-se o texto, não a regra |
| 4 | A pausa vira espera e a seta de farejar some | A pausa congela o tempo; nada avança (PS4) |
| 5 | Voltar ao título por engano apaga a partida | Confirmação com "Não" em foco (PS7) |
| 6 | O HTML único passa do limite com o áudio | `verificar:tamanho` reprova o build; orçamento de 19.2.6 |
| 7 | O polimento vira recurso novo e atrasa a 1.0 | Regra de 19.4.2: só correção e o que está na lista; o resto é 1.x |
| 8 | Ícones cobrem objeto no celular estreito | Canto superior esquerdo, linha 0 fora das áreas (16.8.1); QA confere em captura; PT5 |
| 9 | Regressão nos Marcos 1 a 5 ao mexer em tela e som | Linha de base nova antes de qualquer código (item 121); RG6 |
| 10 | Confusão entre 0.11.0 e 1.0.0 | Regra de 19.7.1 |
