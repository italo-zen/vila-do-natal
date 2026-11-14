# Changelog

Mudanças notáveis do jogo, no formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), com [SemVer](https://semver.org/lang/pt-BR/).

## [Não lançado]

- Nada por enquanto. As próximas versões entram aqui.

## [1.0.0] - 2026-11-12

Primeira versão pública do jogo "Natal na Casa do Tio Ítalo e da Tia Nath". É um jogo de aventura em pixel art para crianças de 5 a 10 anos, feito com Phaser 3 e TypeScript, que roda no navegador do computador e do celular.

### Adicionado
- Escolha de um dos quatro sobrinhos (LoLô, BiBi, DanDan e TuTu). O jogo usa o nome escolhido nos diálogos.
- Procurar as três partes da árvore de Natal pela casa. O Nick, o cachorro da casa, acorda, segue o sobrinho e fareja a próxima porta.
- Dicas para quem fica perdido (tecla H ou o ícone "?") e a seta do farejar, que aponta a próxima porta por alguns segundos.
- Enfeites: uma caixa de enfeite no Escritório, que se encaixa na árvore.
- Uma reviravolta na parte final: algo ainda está perdido pela casa.
- Fim com a imagem da família, créditos e a opção "Explorar a casa", para andar livremente pela casa com 25 enfeites de Natal.
- Controles pelo teclado (setas ou WASD, Z, X e Esc) e pelo celular, com joystick virtual e botões A e B.
- Pausa pela tecla P ou pelo ícone II, e mudo pela tecla M ou pelo ícone de som.
- Música de fundo de Natal, efeitos sonoros e um jingle para cada conquista, além de um jingle nos créditos.
- Não há save: ao abrir o jogo, ele começa sempre pela tela de título.
- Carregamento rápido: a tela de título aparece em cerca de 3 segundos numa conexão lenta emulada (1,6 Mbps), com compressão. O arquivo principal leva só o código, os sprites e os textos; o áudio e as imagens de tela carregam à parte.

### Conhecidos
- Na tela de fim, o texto "A ou B: continuar" aparece, mas o botão B não existe na tela do celular. O texto será ajustado numa versão seguinte.
- Na tela de fim, a barra de comandos cobre a base do corpo dos personagens. Foi mantido assim.

### Licenças
- A música e os efeitos são sintetizados e originais do projeto.
- Duas melodias são de domínio público: a do jingle dos créditos ("We Wish You a Merry Christmas", em arranjo próprio) e uma citação de quatro notas de "Jingle Bells" no jingle de enfeites. O restante é original.

## [0.13.0] - 2026-11-10

### Adicionado
- A tela de título ganhou a imagem da árvore de Natal.
- Tela de fim, antes dos créditos, com a imagem da família: Nath, Ítalo, Nick e os sobrinhos. Um toque em qualquer ponto avança para os créditos.
- "Explorar a casa", nos créditos: depois do fim, dá para andar livremente pela casa, com 25 enfeites de Natal espalhados pelos cômodos, com pausa e com o Nick junto.

### Alterado
- Os créditos ficaram mais enxutos. A mensagem de fim agradece sem citar nomes.
- A barra de comandos de baixo muda no modo "Explorar a casa".

### Corrigido
- Na tela de fim, em celular estreito (667 por 375), o toque não avançava. Agora avança.

## [0.12.0] - 2026-11-10

### Adicionado
- Cada conquista tem o próprio jingle: luzes, parte 1, parte 2, parte 3 e enfeites.
- Jingle de Natal nos créditos, com a melodia tradicional de "We Wish You a Merry Christmas" em arranjo próprio.

### Alterado
- A música de fundo abaixa durante os jingles, em vez de parar, e volta do mesmo ponto.
- O som único de conquista saiu, no lugar dos jingles novos.

Sem mudança visual.

## [0.11.2] - 2026-11-10

### Corrigido
- A música de fundo repete a trilha inteira. Antes, em alguns aparelhos, como o iPhone, ela voltava ao começo no meio da trilha.
- Se o som começar antes de o aparelho liberar o áudio, a música recomeça assim que ele liberar.
- Erros de áudio deixam de ficar escondidos, o que ajuda a achar problemas.

Sem mudanças visuais.

## [0.11.1] - 2026-11-10

### Corrigido
- Som no iPhone: o áudio agora carrega arquivo por arquivo, e uma falha em um arquivo não derruba os outros.
- O primeiro toque destrava o som com mais segurança.
- O jogo respeita a chave de silencioso do iPhone: com a chave ligada, o jogo fica mudo; com a chave desligada, o som toca. O ícone de som do jogo continua sendo o mudo do próprio jogo.

## [0.11.0] - 2026-11-09

### Adicionado
- Música de Natal com sinos e celesta, em laço, tocando em todas as telas. O som começa no primeiro toque ou clique, como os navegadores exigem.
- 13 efeitos sonoros: passos, portas, interruptor, peças da árvore, encaixe, latido do Nick, farejar, conquista, diálogo, troca de item nos menus, confirmação e erro no código.
- Mudo pela tecla M ou pelo ícone de som, que aparece no título e na exploração. O mudo também silencia a música.
- Tela de pausa pela tecla P ou pelo ícone de pausa (II), na exploração. Traz Continuar, Como jogar, Som e "Voltar ao título". Ao voltar ao título, um aviso pede confirmação, com "Não" já selecionado.
- Como jogar com duas linhas novas: "P: pausa. M: mudo." (teclado) e "No alto: pausa e mudo." (celular).

### Alterado
- Nomes dos sobrinhos e rótulos de móveis em letra de 16 px; o nome do DanDan em 14 px. Nenhum texto do jogo fica abaixo de 12 px.
- O painel do código passa a ter fundo sólido: nada da cena aparece por trás dele.
- O aviso "Quase!" e as outras mensagens de erro do painel do código somem assim que a criança digita a primeira tecla.

### Corrigido
- Na seleção de sobrinhos, a área de toque de "Voltar ao título" não invade mais os cartões.
- Ferramenta de teste: a base do joystick era listada durante a troca de cômodo e a condução, mesmo escondida. Não afeta o jogo.

## [0.10.0] - 2026-11-09

### Adicionado
- Joystick virtual fixo no canto inferior esquerdo do celular, no lugar da cruz: base de 120 px com bolinha e anel na direção. Movimento em 4 direções, sem diagonal (GDD 18.19).

### Alterado
- Menus no celular: um empurrão no joystick = um passo.

## [0.9.1] - 2026-11-09

### Corrigido
- Cruz na tela navega o título (cima e baixo) e a seleção de sobrinhos (esquerda e direita). Um toque = um passo; segurar não repete (BUG-M5-04, PT4).

## [0.9.0] - 2026-11-09

### Adicionado
- Marco 5, toque e rotação (GDD 18, ADR-007): botões A e B, painel de código por toque, cruz na tela, aviso para girar o celular e escala no celular.

## [0.8.1] - 2026-11-09

### Alterado
- Plot twist na parte 3: ao montar o topo da árvore, o diálogo tem três páginas ("Ainda falta alguma coisa"). A caixa de enfeite e o Nick dormindo só aparecem depois (PT4a, pedido do Diretor).

## [0.8.0] - 2026-11-09

### Adicionado
- Marco 4, enfeite e créditos (GDD 17): caixa de enfeite no Escritório, encaixe final e diálogo de fechamento.
- Créditos com a versão do jogo.

## [0.7.1] - 2026-11-09

### Alterado
- Seta de farejar: duas tremidas e depois amarela parada.
- Nick fica encostado no sobrinho, um tile atrás. Na troca de cômodo, o Nick entra oculto e aparece no primeiro passo.

## [0.7.0] - 2026-11-09

### Adicionado
- Marco 3, Nick e dicas (GDD 16): o Nick acorda com A, segue o sobrinho, dorme por fase e comemora na chegada com conquista.
- Farejar (X ou B): seta na próxima porta por 5 s.
- Dica (H ou "?"), com imagem, e tela Como jogar com 7 linhas.

## [0.6.0] - 2026-11-08

### Adicionado
- Marco 2, peças da árvore (GDD 15): as três partes (Sala, Cozinha e Lavanderia), tela de conquista, encaixe e diálogo por parte.
- Árvore montada em 1, 2 e 3 partes; Quarto liberado pela parte 2 e Escritório pela parte 3.
- Aviso "ainda não" para peça fora de ordem; condução com fade nas passagens.

## [0.4.0] - 2026-11-08

### Adicionado
- A planta da casa gira 90° para a direita, com a tela deitada. Os cômodos seguem a planta da casa real do Diretor.
- Interruptor no novo lugar, bilhete pendurado na parede e portas vistas de cima.
- Passagem entre a Sala e a Cozinha, indicada com clareza.
- Móveis desenhados com nome.

### Alterado
- O painel da senha não mostra mais a dica, que fica só no bilhete.
- A porta P1 tem uma só entrada.

### Corrigido
- O painel da senha volta a aceitar as teclas W, A, S e D, além das setas.
- A árvore fica no lugar certo da Sala.

## [0.3.0] - 2026-11-08

### Adicionado
- Condução automática: depois de acender as luzes, o sobrinho é levado sozinho até a árvore.
- Geladeira e Forno na Cozinha.

### Alterado
- A última linha da Sala fica bloqueada, para o sobrinho não andar sobre a barra de comandos.

### Corrigido
- A arte dos sobrinhos voltou a ter as cores certas. A versão 0.2.0 tinha saído com os sprites em 4 cores.

## [0.2.0] - 2026-11-08

### Adicionado
- Casa real: a planta do Diretor, feita no programa Tiled, passa a ser o mapa do jogo.

### Alterado
- Ajustes do primeiro teste, aprovados pelo QA nos Marcos 1.1 e 1.2: texto de orientação no Hall, interação mais tolerante com o interruptor e a árvore, e botões com caixa e borda, diferentes do texto.

## [0.1.0] - 2026-11-07

### Adicionado
- Primeira versão jogável, a fatia vertical do Marco 1: título com "Começar" e "Como jogar", escolha de um dos quatro sobrinhos, introdução no Hall, bilhete com a pista da porta, porta com painel de código (com o aviso de código errado), e interruptor e luzes da casa.
- Arte provisória, que o Diretor pediu para trocar depois.

## [0.5.0] - 2026-11-08

### Adicionado
- Marco 1 fechado (GDD 14): indicadores de porta (seta nas laterais e tapete no vão da saída).
- Diálogo automático da árvore na chegada.

### Corrigido
- A caixa do diálogo cobria a árvore na chegada; agora ela vai para o topo (BUG-R15-01).
