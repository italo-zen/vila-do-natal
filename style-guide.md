# Style Guide

> Dono: agente Especialista. Derivado do GDD (seções 7 e 9). Mudou o GDD, atualize aqui.

## Arte
- **Perfil ativo: `hd-480x352` (desde o Marco 1.2, 2026-11-08).** Tela de 15×11 tiles de 32 px (480×352). Quadro do Sobrinho 32×48, ponto de partida (teste 48×72 pendente). Escala inteira a partir de 2×; abaixo de 2×, encaixe na janela. Dados em `content/art-profiles/hd-480x352.json`. O v1 (`gba-240x160`, 240×160, tiles 16×16, quadro 16×24) fica no repositório (ADR-003).
- **Regra:** valor de arte vem do perfil, nunca de número no código. Resolução, tile, quadro, escala, cor, fonte, margem, raio de luz e posição de UI são lidos do perfil. Mapas, colisão e spawns ficam em unidades de tile. Velocidade, ritmo e limiares de jogo não são arte: ficam no domínio, nunca no perfil (ADR-004 seção 11.3).
- Pixel art em escala inteira (o motor escolhe o fator pela janela, a partir da escala mínima do perfil)
- Tiles: tamanho do perfil (32×32 no HD; 16×16 no v1)
- Paleta: limites do perfil (16 a 32 cores no v1): vermelho, verde e dourado de Natal + neutros para a casa
- Câmera fixa por subárea (ADR-004), numa tela do perfil (HD: 15×11 tiles; v1: 15×10). Subárea menor que a tela é centralizada. Sem rolagem na v1
- **Planta girada (ADR-004 seção 12, 2026-11-08):** todas as subáreas, inclusive as fechadas, giram 90° para a direita (sentido horário), aplicado pelo conversor na saída. Fórmula: tile (x, y) de uma subárea de `largura × altura` vai para (`altura − 1 − y`, `x`). A tela não gira: 15×11, barra, textos, botões, setas, sobrinhos, Nick e árvore ficam como estão. Móveis, paredes e portas giram como imagem
- **Linha da barra (guarda):** a última linha da tela (`sala.linhas − 1`) não tem chão andável, objeto, gatilho nem spawn, em subárea de altura igual a `sala.linhas` (11). Hoje nenhuma: a Sala gira para 11×10 e fica acima da barra (ADR-004 seção 8, item 6 e seção 12.6). A guarda continua valendo para subáreas futuras de 11 linhas
- **Portas e passagens (GDD 14.10.9):** P1 a P8 em vista superior, retângulo comprido alinhado à parede. Uma porta é uma abertura e uma folha, desenhada sobre a aresta entre o tile de chão e o vão (ou a passagem), e não no centro do tile (decisão do Diretor, 2026-11-08; ADR-004 seção 3, regra de arestas). A passagem aberta (P7, e P8 quando aberta) tem desenho de vão, distinto da parede e do piso. O vão de 1 tile não é andável. Paredes horizontais e verticais usam o mesmo desenho, girado. Par com destino fechado e chegada lateral: a faixa fica na aresta do gatilho voltada para a chegada (P2 fechada, chegada abaixo: aresta de baixo; P3 fechada, chegada à esquerda: aresta da esquerda); ao abrir, passa para a aresta entre o gatilho e o vão (ADR-004 seção 3) Marco 2: P2 e P3 também são passagens com desenho de vão. Indicador por saída: lateral = seta sobre o gatilho; para baixo = tapete no vão; para cima = nada (GDD 14.10.10). A caixa da subárea inclui o vão do tapete
- **Cômodo com porta de entrada (ADR-004 seção 13, a confirmar pela prévia):** o tile de chão encostado no gatilho de entrada, do lado de dentro, é chão como os outros. Ele é a chegada do sobrinho; não recebe marca nem brilho. A Suíte e o Quarto ganham esse tile. Par com chegada declarada nos dois lados pode ter vão de qualquer tamanho: o vão é vazio (`tema.fundo`), desenhado só dentro da caixa da subárea do gatilho; seta e tapete seguem `porta.saida` do conteúdo (ADR-004 seções 13.13 a 13.18)
- **Bilhete de parede:** tile bloqueado com vizinho livre, como o objeto examinável (ADR-004 seção 6)
- Sem copiar personagens, sprites ou elementos da Nintendo/Game Freak
- Os 4 Sobrinhos: mesmo tamanho (quadro do perfil) e mesma estrutura de animação (andar ×4 direções, parado, interagindo, comemorando)
- Nick: dormindo, acordado, farejando, feliz
- Árvore: 4 estados (desmontada, 1 parte, 2 partes, completa)
- Peça da árvore (Marco 2): miniatura da camada (base, meio, topo) de 32×32 px no chão, com halo dourado `#f4d35e` (GDD 15.2.4). Só aparece quando visível; some do chão quando encaixada
- Nomes de arquivo: `tipo_nome_variacao.png` (ex.: `spr_lolo_walk_down.png`, `spr_nick_sleep.png`)
- Pasta: `assets/<perfil>/` (v1: `assets/gba-240x160/`). Hoje os PNG estão na raiz de `assets/` (layout legado; a migração é o refator do ADR-003). Folhas de referência ficam em `assets/referencia/`, fora dos perfis.
- Arte nova = perfil novo (pasta própria, JSON próprio, linha no manifesto). O perfil v1 não é sobrescrito.

## UI e texto
- Português brasileiro, frases curtas (uma criança de 5 anos acompanha; adultos não acham infantil)
- Fonte grande e legível, bom contraste
- Diálogos avançam com A, sem tempo automático
- Barra de controles fixa em toda tela (GDD 14.8), com uma exceção: na condução automática depois da conquista 1 (GDD 14.11), a barra fica vazia, sem tecla nem texto
- Barra de exploração em uma linha, ancorada na base e ocupando a última linha de tiles da tela (ADR-003 seção 6; a regra de mapa está em Arte)
- Alvo de toque mínimo: 44×44 px
- Só modo paisagem no celular; retrato mostra aviso de rotação

## Código
- Phaser 3 + TypeScript, Vite, Vitest (testes na camada de domínio)
- Clean Architecture + DDD (ver `docs/ADR-001.md`; conteúdo e SemVer em `docs/ADR-002.md`)
- Domínio sem dependência de Phaser; cenas só orquestram
- Personagem escolhido = identificador; sprite por id, sem duplicar lógica
- Mapas: autoria no Tiled (TMX em `maps/`). O motor lê JSON de subárea gerado pelo conversor em `content/maps/` (ADR-004). Uma subárea = um mapa. Portas são pares de gatilhos; a troca de subárea tem fade de 0,5 s (ADR-004 seções 3 e 11). Chegada de porta = spawn com nome = id da porta, na subárea de destino: gerada pelo conversor ou declarada no TMX com `chegada` (ADR-004 seção 13). Encosta sempre no gatilho de entrada, do lado de dentro; a passagem custa 3 passos (`CUSTO_DA_PORTA`), qualquer que seja o vão (ADR-004 seção 13.17). Gatilho de par tem uma entrada só (um vizinho livre): erro para par com chegada declarada, aviso para par de fórmula (ADR-004 seção 13.19)
- Tipos de objeto de jogo (ADR-004 seção 6): `spawn` e `interruptor` em piso livre; `bilhete`, `examinavel` e `portaFechada` em tile bloqueado com vizinho livre; `arvore` no próprio piso (o tile vira bloqueio); `peca` em piso livre com vizinho livre (colisão 0 no conteúdo; o bloqueio vem do estado, ADR-004 seção 6)
- Validação de porta fechada (ADR-004 seção 8, item 14): cada `portaFechada` aparece uma só vez, sem gatilho de mesmo `id`. P1 é um só objeto `portaFechada`, na Sala. Par cujo destino está fora das áreas abertas age como porta fechada, sem transição (ADR-004 seções 3 e 9.1)
- Sem persistência na v1.x: o jogo começa do zero a cada carregamento, sem `localStorage` (ver `docs/ADR-002.md`, seção 3)
- Conteúdo em `content/` (mapas, missões, textos) + `content/manifest.json`; o motor lê o manifesto, não conhece mapas pelo nome
- Chaves de fase são minúsculas e valores do enum `Fase` (`luzes`). O nome de exibição vem do GDD ("Luzes"). Chaves de texto do Marco 2: `conquista.<fase>`, `arvore.estado.<n>`, `arvore.chegada.<n>`, `aviso.peca<N>.antes<M>` (ADR-002 seção 2.2)
- Destino da condução (`conducao`) fica na missão. A condução segue a rota de colisão do sobrinho e nunca encurta o trajeto (ADR-004 seção 11)
- Colisão de peça decidida pelo estado (escondida livre, visível bloqueada, encaixada livre); o conteúdo grava o tile livre (ADR-004 seção 6)
- Versão do jogo vem do `package.json` e aparece na tela de título
- Build de playtest: arquivo HTML único (`npm run build:playtest`)
- Sem rastreamento nem serviço de terceiros

## Pastas
`src/` · `assets/` · `maps/` · `content/` · `qa/` · `docs/`

## Áudio
- Só faixas de domínio público ou licença gratuita; registrar origem em `docs/audio-licencas.md`
- Tudo silenciável no menu
