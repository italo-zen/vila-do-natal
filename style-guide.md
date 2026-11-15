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
- **Linhas da barra (guarda):** a partir do Marco 3, as duas últimas linhas da tela (`sala.linhas − 2` e `sala.linhas − 1`, contadas na tela) não têm chão andável, objeto, gatilho nem spawn. A linha `sala.linhas − 1` é erro. A linha `sala.linhas − 2` (9 no HD) é aviso enquanto a pergunta 31 estiver aberta: a Sala tem (0, 9) e (1, 9) andáveis, sob a barra. Se a 31 for A, os dois tiles são bloqueados na Arte e a linha vira erro. Se for B (barra de uma linha), a linha sai da guarda (ADR-004 seção 8, item 6; ADR-005 seção 6)
- **Portas e passagens (GDD 14.10.9):** P1 a P8 em vista superior, retângulo comprido alinhado à parede. Uma porta é uma abertura e uma folha, desenhada sobre a aresta entre o tile de chão e o vão (ou a passagem), e não no centro do tile (decisão do Diretor, 2026-11-08; ADR-004 seção 3, regra de arestas). A passagem aberta (P7, e P8 quando aberta) tem desenho de vão, distinto da parede e do piso. O vão de 1 tile não é andável. Paredes horizontais e verticais usam o mesmo desenho, girado. Par com destino fechado e chegada lateral: a faixa fica na aresta do gatilho voltada para a chegada (P2 fechada, chegada abaixo: aresta de baixo; P3 fechada, chegada à esquerda: aresta da esquerda); ao abrir, passa para a aresta entre o gatilho e o vão (ADR-004 seção 3) Marco 2: P2 e P3 também são passagens com desenho de vão. Indicador por saída: lateral = seta sobre o gatilho; para baixo = tapete no vão; para cima = nada (GDD 14.10.10). A caixa da subárea inclui o vão do tapete
- **Cômodo com porta de entrada (ADR-004 seção 13, a confirmar pela prévia):** o tile de chão encostado no gatilho de entrada, do lado de dentro, é chão como os outros. Ele é a chegada do sobrinho; não recebe marca nem brilho. A Suíte e o Quarto ganham esse tile. Par com chegada declarada nos dois lados pode ter vão de qualquer tamanho: o vão é vazio (`tema.fundo`), desenhado só dentro da caixa da subárea do gatilho; seta e tapete seguem `porta.saida` do conteúdo (ADR-004 seções 13.13 a 13.18)
- **Bilhete de parede:** tile bloqueado com vizinho livre, como o objeto examinável (ADR-004 seção 6)
- **Perfil `toque` (Marco 5, ADR-007 seção 5; revisão 2):** bloco do perfil ativo com tamanhos em CSS px do aparelho (joystick em `analogico`, botões, espaçamento, faixa mínima, opacidades, painel em pixels de jogo). Os mínimos (48 e 8) e os limites da base (96 a 120) e da bolinha (40) são código, em `validarToque`, não arte
- **Sprites de controle (ADR-007 seção 5.5, revisão 2):** `ctl_analogico_base.png`, `ctl_analogico_bolinha.png` (e `_pressionada`), `ctl_analogico_brilho_<dir>.png` (setor em anel na borda), `ctl_botao_a.png`, `ctl_botao_b.png` (e `_pressionado`), `ctl_celular.png` (folhas). Sem texto no joystick e no celular; a letra de A e de B é desenho do botão. Arte em 3× o tamanho CSS. Os `ctl_cruz_*` saem quando o Dev trocar a entrada
- **Nitidez no celular (ADR-007 seção 3.3):** `resolution` do Phaser = DPR do aparelho, lido no boot; CSS fracionário com `image-rendering: pixelated`. Com DPR 1 nada muda
- Sem copiar personagens, sprites ou elementos da Nintendo/Game Freak
- Os 4 Sobrinhos: mesmo tamanho (quadro do perfil) e mesma estrutura de animação (andar ×4 direções, parado, interagindo, comemorando)
- Nick (Marco 3): `spr_nick_sleep`, `spr_nick_wake`, `spr_nick_walk_<dir>`, `spr_nick_idle_<dir>`, `spr_nick_sniff`, `spr_nick_happy`; quadro 32×32 (perfil `corpos.nick`). Balões, fumaça, seta de farejar (`spr_seta_farejar_<dir>`) e ícone de dica são sprites sem texto: o texto vem de `content/` (ADR-005 seção 7). Seta de farejar amarela `#f4d35e`, distinta da branca das portas; ao aparecer, 2 tremidas de 0,4 s (±2 px) e depois parada, sem sobe e desce (ADR-005 4.5; GDD 16.17)
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
- Barra de exploração em duas linhas a partir do Marco 3 (GDD 16.9): "Setas: andar  Z: examinar" e "X: farejar  H: dica". Ocupa as duas últimas linhas da tela (9 e 10 no perfil HD), ancorada na base. Até o Marco 2 era uma linha (ADR-003 seção 6; a regra de mapa está em Arte)
- Alvo de toque mínimo: **48 CSS px** em todo alvo de toque, com 8 CSS px entre alvos separados (GDD 18.2; ADR-007 seções 4.5 e 5.2). Regra de usabilidade: o validador impõe o mínimo, o perfil só pode ir acima. A base do joystick tem 96 a 120 CSS px (GDD 18.19.3), acima do mínimo. A cruz de braços encostados (V1 e pergunta 39) é histórico (ADR-007, revisão 2)
- Controles de toque em dois layouts: **A** (faixas laterais, quando cada faixa livre tem 144 CSS px ou mais) e **B** (sobre a tela, 60% de opacidade no repouso). A escolha é função pura, recalculada ao girar (GDD 18.2; ADR-007 seção 4)
- **Joystick (ADR-007 seções 1.3 e 7.1; GDD 18.19):** base de 120 CSS px no lugar da cruz, com movimento em 4 direções e sem diagonal. Zona morta de 12 e limiar de 20 CSS px, medidos do centro da base, com histerese e eixo dominante. Menus: um empurrão = um passo, sem repetir até a bolinha voltar à zona morta. O setor amarelo fica na borda e só acende nas direções que a tela aceita
- Layout B só na exploração leva joystick, A e B. Diálogo e introdução levam A e B, sem joystick, fora da caixa de texto. Título, Como jogar, seleção, conquista, dica, créditos e painel não têm botão de toque (o toque vai direto no item); a seleção tem o botão "Voltar ao título" (pergunta 42, padrão aplicado) (GDD 18.4; ADR-007 seção 4.6)
- Textos de toque: chave com sufixo `.toque` (ex.: `barra.casa.toque`). Nos menus do layout B, a barra usa `.toque.menu` (ex.: `barra.titulo.toque.menu`). Nenhum texto de toque cita Z, X, H, Esc, Enter ou Backspace (GDD 18.12; ADR-007 seções 9 e 4.6). Nenhum texto de toque cita "setas" nem "cruz": o verbo do toque é "Mover:" (GDD 18.19.10)
- Só modo paisagem no celular; retrato mostra aviso de rotação, e só em aparelho com toque (ADR-007 seção 10)
- **Pausa e ícones (Marco 6; GDD 19.3; ADR-008 seção 6):** P ou ícone II (canto superior esquerdo, só onde o "?" abre). Itens: "Continuar", "Som: ligado/desligado", "Como jogar" e "Voltar ao título" (com confirmação, "Não" em foco). Ícones II e som: caixa `#1b2452`, borda `#9aa3c7`, 32 px de jogo, sem texto (o estado do som aparece no desenho e, na pausa, no texto). Chaves `pausa.*` (19.8)
- **Ícone de som fora do controle de jogo:** aparece no título e na exploração, em qualquer layout. A regra "menus sem controle" (18.4) vale para direções, A, B e "?" (ADR-008 seção 7.4)

## Código
- Phaser 3 + TypeScript, Vite, Vitest (testes na camada de domínio)
- Clean Architecture + DDD (ver `docs/ADR-001.md`; conteúdo e SemVer em `docs/ADR-002.md`)
- Domínio sem dependência de Phaser; cenas só orquestram
- Áudio e pausa são apresentação (`presentation/audio/`, `presentation/ui/pausa/`). Domínio e aplicação não conhecem som nem pausa; a única exceção é `validarAudio`, função pura (ADR-008 seção 1.7)
- Personagem escolhido = identificador; sprite por id, sem duplicar lógica
- Mapas: autoria no Tiled (TMX em `maps/`). O motor lê JSON de subárea gerado pelo conversor em `content/maps/` (ADR-004). Uma subárea = um mapa. Portas são pares de gatilhos; a troca de subárea tem fade de 0,5 s (ADR-004 seções 3 e 11). Chegada de porta = spawn com nome = id da porta, na subárea de destino: gerada pelo conversor ou declarada no TMX com `chegada` (ADR-004 seção 13). Encosta sempre no gatilho de entrada, do lado de dentro; a passagem custa 3 passos (`CUSTO_DA_PORTA`), qualquer que seja o vão (ADR-004 seção 13.17). Gatilho de par tem uma entrada só (um vizinho livre): erro para par com chegada declarada, aviso para par de fórmula (ADR-004 seção 13.19)
- Tipos de objeto de jogo (ADR-004 seção 6): `spawn` e `interruptor` em piso livre; `bilhete`, `examinavel` e `portaFechada` em tile bloqueado com vizinho livre; `arvore` no próprio piso (o tile vira bloqueio); `peca` em piso livre com vizinho livre (colisão 0 no conteúdo; o bloqueio vem do estado, ADR-004 seção 6)
- Validação de porta fechada (ADR-004 seção 8, item 14): cada `portaFechada` aparece uma só vez, sem gatilho de mesmo `id`. P1 é um só objeto `portaFechada`, na Sala. Par cujo destino está fora das áreas abertas age como porta fechada, sem transição (ADR-004 seções 3 e 9.1)
- Sem persistência na v1.x: o jogo começa do zero a cada carregamento, sem `localStorage` (ver `docs/ADR-002.md`, seção 3)
- Conteúdo em `content/` (mapas, missões, textos) + `content/manifest.json`; o motor lê o manifesto, não conhece mapas pelo nome
- Chaves de fase são minúsculas e valores do enum `Fase` (`luzes`). O nome de exibição vem do GDD ("Luzes"). Chaves de texto do Marco 2: `conquista.<fase>`, `arvore.estado.<n>`, `arvore.chegada.<n>`, `aviso.peca<N>.antes<M>` (ADR-002 seção 2.2). Chaves do Marco 3: `dica.<fase>.<dormindo|acordado>` (ou `dica.<fase>` quando o texto serve aos dois estados), `dica.livre`, `nick.acordou`, `nick.latido`, `barra.casa2`, `barra.dica` (ADR-005 seção 2)
- Nick e farejar: o estado do Nick e a fila ficam no domínio (`domain/nick/`); a regra de alvo e de rota fica em `application/mundo/nick/`; a apresentação só guarda tempos de animação (`presentation/nick/temporizacao.ts`). Nick dorme em `nick.dorme` da missão, nunca no TMX (ADR-005 seções 1 e 2)
- Colisão do Nick: dormindo bloqueia o tile de dormir (regra única, `bloqueia(tile)`); acordado não bloqueia nem entra em rota. A rota de `conducao` nunca passa pelo tile de dormir: N009 garante isso no conteúdo (ADR-005 seções 2.6 e 3.4; ADR-004 seção 11.2)
- Destino da condução (`conducao`) fica na missão. A condução segue a rota de colisão do sobrinho e nunca encurta o trajeto (ADR-004 seção 11)
- Colisão de peça decidida pelo estado (escondida livre, visível bloqueada, encaixada livre); o conteúdo grava o tile livre (ADR-004 seção 6)
- Versão do jogo vem do `package.json` e aparece na tela de título
- Build de playtest: arquivo HTML único (`npm run build:playtest`)
- Sem rastreamento nem serviço de terceiros

## Pastas
`src/` · `assets/` · `maps/` · `content/` · `qa/` · `docs/`

## Áudio
- **Origem (Marco 6; GDD 19.2.5; ADR-008):** todo áudio é gerado por síntese original do projeto, por script em `tools-arte/gerar_audio.py`. Sem sample, faixa, trecho ou fonte de terceiros, nem de domínio público, nem de licença gratuita. Vale para a faixa de fundo e para os efeitos. Cada arquivo tem linha em `docs/audio-licencas.md` ("gerado pelo projeto, síntese original", com data). Nenhum arquivo de áudio é editado à mão. **Exceção declarada por arquivo (decisão do Diretor, 2026-11-10):** o JC usa a melodia de "We Wish You a Merry Christmas" (domínio público, arranjo original), e o J05 cita quatro notas de "Jingle Bells" (domínio público). Ambos em `docs/audio-licencas.md`. Nenhuma outra melodia de terceiros.
- **Formato:** MP3 mono, 22.050 Hz, 32 kbps CBR, em `assets/audio/` (fora de `assets/<perfil>/`: áudio não é arte). Metadados em `assets/audio/audio-meta.json`. Prefixos: `mus_` (trilha), `sfx_` (efeitos) e `jin_` (jingles de conquista e de créditos). Eventos S01 a S13, conquistas e créditos em `content/audio.json` (ADR-008 seções 5, 5.1 e 8).
- **Jingles (0.12.0; GDD 19.2.7):** cada conquista tem um jingle próprio (J01 a J05). Os créditos tocam uma vez um jingle de Natal (JC), por cima da trilha. A trilha baixa (ducking) e volta do mesmo ponto; nunca para nem reinicia (ADR-008 5.2).
- **Orçamento (19.2.6 e 19.2.7):** música ≤ 160 KB; cada efeito ≤ 12 KB; cada jingle de conquista ≤ 16 KB, somados ≤ 64 KB; JC ≤ 64 KB; áudio total ≤ 320 KB; HTML ≤ 2,5 MB. KB = 1000 bytes.
- **Medidos (2026-11-10, `assets/audio/audio-meta.json`):** trilha 144 526 B; efeitos somados (12) 31 446 B; jingles de conquista somados 62 674 B; JC 62 502 B; total 301 148 B; 19 arquivos.
- **Mudo:** M (teclado) e ícone de som (toque e mouse). Fica só na memória; recarregar a página volta a ligado (sem save). O jogo respeita a chave de silencioso do iPhone e não a contorna (ADR-008 2.7, decisão "respeite o silencioso", 2026-11-10).
- **Som não é a única informação:** cada evento tem sinal visual (19.5, item 4).
