# Changelog

Mudanças notáveis do jogo, no formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), com [SemVer](https://semver.org/lang/pt-BR/).

## [Não lançado]

- Nada por enquanto. As próximas versões entram aqui.

## [1.4.1] - 2026-11-20

Correção de arte dos personagens. Nenhuma missão, regra, mapa ou texto mudou.

### Corrigido
- Pixels sem cor dentro do desenho dos quatro sobrinhos e do Nick, que deixavam furos aparecerem na tela, sobretudo no cabelo de costas da BiBi.

## [1.4.0] - 2026-11-20

A caixa de enfeites também muda de lugar a cada partida. Nenhuma missão ou texto mudou.

### Adicionado
- A caixa de enfeites nasce, a cada partida, na única área que sobra entre a Cozinha e Lavanderia, o Quarto da Oli, o Escritório e o Quarto do casal depois das três partes da árvore. Nunca na Sala. O Nick da última fase dorme em outro lugar (nunca na área da caixa) e a seta de farejar leva à porta certa.
- Para o QA (só no build de QA): `__plano()` traz a caixa; `__irACaixa()` leva o sobrinho até ela.

### Mudou
- A caixa e o brilho dela desenham sempre acima dos móveis.
- Para quem mantém o conteúdo: o objeto `enfeite` (a caixa) sai do mapa gerado e entra pelo plano (como as peças). Com a caixa fora do mapa, o Escritório passa a ter 4 tiles candidatos (e não 2), 24 no total. S008 (peça ou caixa fixa no mapa) agora é erro.

## [1.3.1] - 2026-11-20

Acabamento dos personagens. Nenhuma missão, regra, mapa ou texto mudou.

### Mudou
- Os quatro sobrinhos e o Nick têm o acabamento da visão 3/4: contorno marrom, luz de cima à esquerda e sombra de contato sob os pés.
- Rostos mais expressivos: brilho nos olhos, bochechas, boca e sobrancelhas; o Nick ganhou brilho nos olhos e no focinho.
- A caminhada dos sobrinhos agora tem 4 quadros (parado, passo, parado, passo), a 8 quadros por segundo.
- O jogo ficou menos pesado (imagens dos personagens com menos cores).
- Para quem mantém o conteúdo: o mínimo de cores por sprite (`sprites.sobrinho.coresMin` e `sprites.nick.coresMin`) caiu de 16 para 8, porque o máximo de 16 cores da visão 3/4 (ADR-012) contradizia o mínimo de 16.

## [1.3.0] - 2026-11-20

Três cômodos novos para explorar, peças da árvore e Nick em lugares diferentes a cada partida, e vários ajustes de conforto. Nenhuma missão ou texto mudou.

**Para quem mantém o conteúdo (schema 4, ADR-013):** o manifesto passa a `schemaVersion` 4 e ganha a chave `sorteio` (`content/sorteio.json`: as áreas sorteáveis e as regras do Nick). `nick.dorme` e `nick.alvo` saíram das missões (`nick` presente é erro N015). Os objetos `peca` saem dos mapas (S008; por enquanto, aviso: o motor os ignora). Conteúdo de antes do sorteio (schema 3) é recusado com mensagem clara.

### Adicionado
- As três partes da árvore agora nascem em lugares diferentes a cada partida: sempre em três cômodos diferentes entre a Cozinha e a Lavanderia, o Quarto da Oli, o Escritório e o Quarto do casal, e nunca na Sala. O Nick também dorme em lugares diferentes a cada fase: na Sala nas luzes e na parte 1 (é ele quem ensina a farejar), e em outro cômodo, que não o da peça, nas partes 2 e 3. A seta de farejar leva sempre à porta certa. A partida seguinte não repete o cômodo da primeira peça. Nada é guardado no aparelho.
- Seta de direção em todas as portas abertas, inclusive a do Quarto da Oli (porta de baixo, seta virada para cima).
- O Nick tem um farejar mais confiável: a seta amarela volta a aparecer em todas as portas (a de lado baixo não tinha imagem).
- Para o QA (só no build de QA): `__semente(n)`, `__plano()` e `?semente=N` fixam e leem o sorteio; o plano nunca aparece na tela.
- O Quarto do casal, o Banheiro do quarto e o Banheiro do escritório estão abertos para andar. As portas deles abrem junto com o Quarto da Oli e o Escritório. O Quartinho segue fechado.
- No modo "Explorar a casa", enfeites de Natal nesses três cômodos.
- Assistência de quina: quando o sobrinho esbarra numa quina por poucos pixels, o jogo o desliza para o lado livre. Acabaram os travamentos na entrada do corredor das portas e ao descer da Cozinha para a Lavanderia. Vale no teclado e no toque, e nunca atravessa parede nem móvel.
- Móveis altos ficam transparentes enquanto alguém está atrás deles, para não esconder o sobrinho nem o Nick.
- Vidro também na quina da parede da Sala, perto do cacto.

### Mudou
- Peça e brilho desenham sempre acima dos móveis, para nunca ficarem escondidos atrás de um móvel alto.
- Candidatos do sorteio: Cozinha 3, Lavanderia 4, Quarto da Oli 7, Escritório 2, Quarto do casal 6 (22 tiles). As regras vivem num lugar só (`candidatos.ts`) e valem no jogo e na validação; testes percorrem todas as combinações e 1000 sementes.
- O brilho do interruptor agora fica em cima da placa na parede, e o A funciona de frente para ela, a partir do tile onde ela está.
- As alturas da geladeira, do forno e de outros eletros foram reduzidas pela Arte.
- Ids de arte e de conteúdo ajustados (sem efeito no jogo).
- Os mapas gerados saem sem as peças fixas: o sorteio é o dono delas (S008 agora é erro).

## [1.2.2] - 2026-11-20

Ajuste de arte dos quartos, do Escritório e da Cozinha. Nada de regra, missão, mapa ou texto mudou.

### Adicionado
- Quarto da Oli: boiserie (o painel de madeira na parede) e margaridas na parede.
- Quarto do casal: quadros na parede.
- Escritório: quadro de fotos na parede.
- Cozinha: janela sobre a pia e piso bege.

### Mudou
- Os quartos, o Escritório e a Cozinha foram redesenhados a partir de fotos reais da casa.

## [1.2.1] - 2026-11-20

Ajuste de arte da Sala. Nada de regra, missão, mapa ou texto mudou.

### Adicionado
- Mural de fotos na parede do corredor da Sala, ao lado da porta da Cozinha. É só enfeite: não bloqueia nem responde ao A.

### Mudou
- O sofá, o rack da TV, a mesa de jantar e o aparador foram redesenhados a partir de fotos reais da casa.

## [1.2.0] - 2026-11-19

O jogo ganhou uma nova visão, inspirada nos jogos de aventura em pixel art como Pokémon FireRed: a casa é vista "de três quartos", com paredes e móveis que têm frente, topo e sombra. As missões, as regras e os textos continuam os mesmos.

### Adicionado
- Visão 3/4: paredes com face ao norte e linhas finas a leste e a oeste. O lado sul de cada cômodo não é desenhado, para não atrapalhar a visão.
- Móveis em perspectiva, com sombra de contato no chão, desenhados a partir de fotos da casa real.
- Parede de vidro na Sala, à esquerda.
- Interruptor de parede: aparece sobre a parede e acende quando as luzes ligam.
- Árvore de Natal nova, em cada um dos estados (desmontada, com 1 parte, com 2 partes, completa e enfeitada).
- O cacto da Sala agora é reconhecível como cacto.

### Mudou
- A barra de comandos ficou com 48 px de altura, com fundo e uma linha na borda de cima.
- A Sala é desenhada 16 px mais baixa, para a parede da alcova das portas caber na tela (nessa alcova a parede aparece cortada).
- A Cozinha e a Lavanderia têm uma passagem de 2 tiles entre elas. As fotos dos móveis dessa parte ainda estão pendentes.
- O mapa, a colisão, as portas, as missões, o Nick e os textos não mudaram.

### Conhecidos
- Na tela de fim, o texto "A ou B: continuar" aparece, mas o botão B não existe na tela do celular. Segue como na 1.0.0.
- Na tela de fim, a barra de comandos cobre a base do corpo dos personagens. Segue como na 1.0.0.
- A porta de baixo da Sala (a do Hall) fica colada na barra de comandos e aparece pela metade.
- No celular em 667×375, o joystick cobre parte da Sala.

## [1.1.0] - 2026-11-17

A casa ganhou uma planta nova, mais fiel à casa real, desenhada pelo Diretor. Nenhuma missão, regra de jogo ou texto mudou: continua sendo o mesmo jogo, numa casa maior e mais bonita.

### Adicionado
- Planta nova com 9 áreas: Hall, Sala, Cozinha (com a Lavanderia), Quarto da Oli, Escritório, Banheiro do escritório, Quarto do casal, Banheiro 1 e Quartinho. As áreas se tocam, sem os antigos vãos entre elas.
- Portas e muros finos desenhados sobre a divisa entre as áreas. Para passar, é só andar contra a porta (ou apertar A de frente para ela). A porta do Hall continua pedindo o código. Ao chegar do outro lado, o sobrinho não volta sozinho se a direção ficar apertada.
- 28 móveis desenhados (sofá, mesa de jantar, camas, pia, fogão, geladeira e outros). A Pia, o Fogão e a Geladeira da Cozinha continuam podendo ser examinados.
- Quartinho, Quarto do casal e os dois banheiros ficam fechados nesta versão (a porta mostra "Essa porta está fechada").
- Easter egg: o cacto da Sala é espinhoso. Quem esbarra nele é devolvido um passo e o cacto pisca.
- No modo "Explorar a casa", enfeites de Natal sobre os móveis da planta nova.

### Mudou
- O Nick, a condução automática e a seta do farejar respeitam os muros e as portas novas. Os trajetos mudaram: os caminhos até a árvore agora têm de 3 a 22 passos, e os maiores que 10 seguem na velocidade dobrada.
- Nomes internos das áreas: `suite_casal` virou `quarto_casal` e `banheiro_casal` virou `banheiro1`. O jogo não tem save, então nada do jogador é afetado.
- Formato do conteúdo (`schemaVersion` 3): cada área traz as paredes por aresta e as portas dizem para onde olham. O motor recusa conteúdo da planta antiga.
- Versão visível no título e nos créditos: 1.1.0.

### Conhecidos
- Na tela de fim, o texto "A ou B: continuar" aparece, mas o botão B não existe na tela do celular. Segue como na 1.0.0.
- Na tela de fim, a barra de comandos cobre a base do corpo dos personagens. Segue como na 1.0.0.

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
