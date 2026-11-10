# Bugs: Marco 1 (rodada 1, 2026-11-07)

Ambiente comum: build normal (`dist/` servido em HTTP local) e playtest (`dist-playtest/index.html` por file://); versão do jogo v0.1.0; commit 4435f3a + alterações de trabalho do Marco 1; Google Chrome (headless, playwright-core) no macOS Darwin 25.6; resolução de teste 960x640.

## BUG-001: personagem parado não mostra para onde olha
- Item de backlog: 005, 007, 008
- Caso do checklist: D-10 (também G-16 e F-28, "de frente")
- Severidade: Média
- Estado: corrigido, reteste OK (rodada 2). Correção provisória do Dev: parado = quadro 0 da caminhada na direção olhada (CasaScene.ts). Capturas `dist-playtest/capturas/*-parado-*-3x.png`: o sprite não aparece mais de frente. Sprites parados por direção continuam como pendência de Arte (PERGUNTA AO DIRETOR).
- Ambiente: build normal e playtest; Chrome headless; macOS
- Passos para reproduzir:
  1. Escolher LoLô (ou qualquer sobrinho) e terminar a introdução (4 Z).
  2. Não apertar nenhuma seta: o jogador nasce em (11,4) com direção "direita" (content/maps/casa.json).
  3. Olhar o sprite do jogador (captura `qa/evidencias/marco1/dist-D10-hall-DanDan.png` e a de G-16 `dist-G16-nasce-ao-lado-arvore.png`).
- Esperado: o personagem parado aparece virado para a porta (direita), "de frente para a porta" (GDD 14.1 e 14.3).
- Obtido: o sprite parado é sempre o de frente (um único `idle` por sobrinho). A direção só aparece ao andar. A lógica de direção está correta (testes de interação passam); o que falta é a aparência.
- Frequência: sempre (4 de 4 sobrinhos)
- Evidência: capturas citadas acima
- Observações: decisão de design/arte: com um sprite parado por direção, ou usando o quadro de caminhada na direção olhada. Ver PERGUNTA AO DIRETOR no relatório.

## BUG-002: build do Vite emite aviso de configuração
- Item de backlog: 002, 011
- Caso do checklist: A-03, A-06 (sem falha de código)
- Severidade: Baixa
- Estado: fechado (rodada 2: `npm test`, `npm run build` e `npm run build:playtest` sem o aviso; 0 ocorrências)
- Ambiente: `npm test`, `npm run build`, `npm run build:playtest` (Vite 8.3.6)
- Passos para reproduzir: rodar `npm run build`.
- Esperado: saída limpa.
- Obtido: aviso "configLoader native ... import "./vite.shared" without a file extension" em vite.config.ts, vite.playtest.config.ts e vitest.config.ts. Os comandos terminam com código 0.
- Frequência: sempre
- Evidência: `qa/evidencias/marco1/npm-build.log`, `npm-test.log`
- Observações: corrigir ao adicionar a extensão `.ts`/`.js` no import (sugestão ao Dev).

## BUG-003: teclas do painel da porta cobertas pelo fundo do painel (invisíveis)
- Item de backlog: 019 (e 007, teclado do painel; GDD 14.9.4)
- Caso do checklist: 019-03 (Marco 1.1, seção M4)
- Severidade: Alta (item 019 reprovado; teclas e foco não aparecem na tela)
- Estado: corrigido, reteste OK (rodada 2, 2026-11-07). Correção do Dev: profundidade das teclas em 2010 (`Botao` com opção `profundidade`, `PainelDeCodigo.ts` linha 84). Evidências novas: `dist-playtest/capturas/painel-teclas-foco-ok.png` (teclas `#1b2452`, texto `#f4e9c8` com contraste 12,20:1; foco em OK com borda e texto `#f4d35e`, 10,08:1) e `painel-tecla-pressionada.png` (tecla 9 em `#f4d35e`, 12,67:1 com número `#0b1030`; borda normal `#9aa3c7` 5,94:1).
- Ambiente: build de playtest (`dist-playtest/index.html`, v0.1.0); Chrome headless; macOS Darwin 25.6; 960x640
- Passos para reproduzir:
  1. Escolher LoLô, terminar a introdução (4 Z) e ganhar o controle no hall (com o diálogo de orientação fechado).
  2. Ir até a porta (ver `qa/scripts/porta.mjs`, função `irAtePainel`) e apertar A para abrir o painel de código.
  3. Olhar as teclas 0 a 9, "Apagar" e "OK" (captura `dist-playtest/capturas/lolo-08-painel-codigo.png`).
- Esperado: teclas com caixa `#1b2452` e borda 1 px `#9aa3c7`, visíveis; foco inicial em "OK" com borda `#f4d35e` 1 px e texto `#f4d35e` (GDD 14.9.4).
- Obtido: as teclas não aparecem. O fundo do painel (`src/presentation/ui/PainelDeCodigo.ts`, linha 44: `fillStyle(0x0b1030, 0.94)`, profundidade 2000) cobre os botões, que `Botao.ts` desenha com profundidade 10 e 11. Medição: o fundo da tecla é `#0c1132`, que é exatamente a mistura de 94% de `#0b1030` com 6% de `#1b2452` (fundo do botão). A borda e o texto somem do mesmo jeito; o foco em "OK" não se vê.
- Frequência: sempre (painel aberto em qualquer sobrinho; teste de LoLô e cálculo para os demais, que usam o mesmo código)
- Evidência: `dist-playtest/capturas/lolo-08-painel-codigo.png` (amostragem de pixel com `node` sobre o PNG decodificado)
- Observações: a correção fica com o Dev (ex.: profundidade dos botões acima do fundo do painel, ou fundo do painel abaixo dos botões). Também vale verificar se as teclas acompanham a câmera (`setScrollFactor(0)` não é aplicado aos `Botao`); não verificado. Os textos do painel (depth 2001, 2002) aparecem na captura, então só as teclas são afetadas.

- Suspeita aberta (rodada 2, não é bug confirmado): `qa/scripts/casa.mjs` no playtest falhou em interruptor, luzes e conquista (G-01 a G-16, G-20, G-26), enquanto o `smoke:playtest` completou partidas inteiras. Pode ser roteiro desatualizado; precisa de checagem manual do Dev/QA no build normal antes de qualquer conclusão (ver checklist, R2-04).

## BUG-014-01: validar:perfil aceita corpo do Sobrinho que não bate com o sprite
- Item de backlog: 014 (ADR-003 seção 1 e 11; critério 1 e validação do perfil)
- Caso do checklist: 014-07
- Severidade: Média (um perfil novo com corpo errado passa na validação e a colisão e a profundidade usariam medidas que não batem com a arte)
- Estado: corrigido, reteste OK (rodada 3, 2026-11-07): quadro 99 reprovado com 16 erros; perfil original válido
- Ambiente: Darwin 25.6; Node com `tools/validar-perfil.mjs`; cópia temporária fora do repo (`scratchpad/perfil-quebrado/repo`)
- Passos para reproduzir:
  1. Copiar o repo para uma pasta temporária (com `node_modules` linkado).
  2. Em `content/art-profiles/gba-240x160.json`, trocar `corpos.sobrinho.quadro.w` de 16 para 99 (deixar `sprites.json` como está, com quadro 16×24).
  3. Rodar `node tools/validar-perfil.mjs gba-240x160`.
- Esperado: exit 1 com erro dizendo que `corpos.sobrinho.quadro` (99×24) não bate com o quadro do `sprites.json` (16×24).
- Obtido: exit 0, "Perfil válido". O validador só confere o `quadro` do corpo contra os PNG da pasta e a caixa dos pés contra o quadro; não compara o quadro do corpo com `sprites.json`.
- Frequência: sempre (reprodução determinística)
- Evidência: saída no terminal da rodada; cópia em `scratchpad/perfil-quebrado/repo`
- Observações: sugestão ao Dev: validar que `corpos.sobrinho.quadro` é igual a `quadro` das folhas do Sobrinho em `sprites.json`.

## BUG-014-02: perfil com JSON malformado mostra stack trace em vez de mensagem clara
- Item de backlog: 014
- Caso do checklist: 014-07
- Severidade: Baixa (o código de saída é 1, como pedido; só a mensagem é ruim)
- Estado: corrigido, reteste OK (rodada 3): mensagem "Perfil inválido: JSON malformado em <caminho>", exit 1
- Ambiente: Darwin 25.6; `node tools/validar-perfil.mjs <caminho.json>`
- Passos para reproduzir:
  1. Criar `perfil.json` com conteúdo `{ "schemaVersion": 1, ` (sem fechar).
  2. Rodar `node tools/validar-perfil.mjs /caminho/perfil.json`.
- Esperado: exit 1 com mensagem do tipo "Perfil inválido: JSON malformado em <caminho>".
- Obtido: exit 1, mas a saída é o erro bruto do `JSON.parse` com "<anonymous_script>:2" (sem mensagem em português e sem caminho claro).
- Frequência: sempre
- Evidência: `scratchpad/perfil-quebrado/saida-json.txt`
- Observações: baixa prioridade.

## BUG-M12-01: teclado do painel da porta cortado nas laterais (casa real, perfil HD)
- Item de backlog: 029 (painel da P8), 032 (casos de QA da 14.10.8 C3)
- Caso do checklist: Marco 1.2, seção P8 (C3)
- Severidade: Alta (teclas 1, 6, 7 e a tecla OK com foco ficam fora da tela; o jogador não vê o código inteiro)
- Estado: corrigido, reteste OK (rodada 5, 2026-11-08): grade 3×4 inteira na captura `lolo-04-painel-erro.png` regenerada, com 1 a 9, Apagar, 0 e OK com foco visível
- Ambiente: build de playtest (`dist-playtest/index.html`, perfil hd-480x352), Chrome headless, janela 960x640 (escala visível 1,82x)
- Passos para reproduzir:
  1. Abrir o playtest em 960x640, escolher LoLô, terminar a introdução.
  2. No hall, ir até a P8 e apertar Z (painel de código) com a P8 trancada.
- Esperado: as 12 teclas (1 a 9, Apagar, 0, OK) inteiras, dentro da tela, com o foco visível (GDD 14.9.4, 14.10.8 C3).
- Obtido: a grade aparece cortada: só 2 a 5 e 8 a 0 inteiras; a coluna da esquerda e a da direita e a borda da tecla OK com foco estão fora da área visível.
- Frequência: observado na captura do smoke `dist-playtest/capturas/lolo-04-painel-erro.png`; reprodução interativa não feita (limite de tempo).
- Evidência: `dist-playtest/capturas/lolo-04-painel-erro.png`
- Observações: a grade parece maior que os 480 px do perfil HD. Verificar se é a largura do painel ou o deslocamento da câmera (o painel deve ter `setScrollFactor(0)`, ver BUG-003).

## BUG-M12-02: última linha da Sala é chão andável, escondida pela barra (candidato, a confirmar)
- Item de backlog: 029, 033 (C15), GDD 14.8 e 14.10
- Caso do checklist: Marco 1.2, C15 e regra "nada na última linha"
- Severidade: Média (a regra do GDD diz que nada fica na última linha; o chão ali é andável e some atrás da barra)
- Estado: aberto (pergunta ao Diretor, ver relatório)
- Ambiente: `content/maps/casa-real/sala.json` (11 linhas, `linhas − 1` = 10); captura `dist-playtest/capturas/lolo-06-sala-escura.png`
- Passos para reproduzir: abrir a Sala (após a P8) em 960x640 e andar até a linha de baixo.
- Esperado: a última linha da Sala (linha 10) não é andável ou não tem chão, porque a barra cobre a linha (GDD 14.8, 14.10 e ADR-004 item 6, que hoje só proíbe objetos, gatilhos, spawns e passagens).
- Obtido: `chao` da linha 10 é todo piso (`0..9` sem colisão, `[..........]` no mapa de colisão). A barra cobre essa linha na tela 480×352.
- Frequência: sempre (dado do arquivo)
- Evidência: leitura de `content/maps/casa-real/sala.json`
- Observações: pode ser regra incompleta do ADR-004 (validação só de objetos), ou decisão de design a confirmar.

## BUG-M13-01: barra de controles visível durante a condução automática (GDD 14.11.3, D5)
- Item de backlog: 036 (condução automática após as luzes)
- Caso do checklist: Marco 1.3, D5
- Severidade: Média (se reproduzido)
- Estado: não reproduzido na rodada 12 (2026-11-08). A captura anterior (`m13-conducao-meio.png`) foi tirada depois da chegada, com o diálogo fechado por teclas do roteiro. Nova captura `qa/evidencias/marco1/m13b-conducao-sem-teclas.png`, tirada com emConducao=true e sem teclas: sem barra, sem texto (`D5b`: nenhum texto desenhado na condução).
- Ambiente: build de QA (`dist-qa/index.html`), Chrome headless, 960x640
- Passos para reproduzir: LoLô, acender as luzes (A no interruptor), "Continuar" na conquista 1; durante o trajeto, olhar a parte de baixo da tela.
- Esperado: barra vazia durante a condução (sem teclas e sem texto).
- Obtido: a barra "Setas: andar  Z: examinar" aparece durante o trajeto.
- Frequência: observado na captura `qa/evidencias/marco1/m13-conducao-meio.png` (rodada 11)
- Evidência: `qa/evidencias/marco1/m13-conducao-meio.png`

## BUG-M13-02: retângulo amarelo sólido ao lado do sobrinho durante a condução
- Item de backlog: 036
- Severidade: Baixa
- Estado: corrigido pelo Dev (halo da árvore nascia antes da chegada). Não reproduzido na rodada 12: `qa/evidencias/marco1/m13b-conducao-sem-teclas.png` (emConducao=true) não tem retângulo amarelo.
- Passos: mesmos de BUG-M13-01; olhar o sobrinho no meio do trajeto.
- Obtido: um retângulo amarelo chapado (aprox. 4 tiles de largura parcial) à direita do sobrinho em `qa/evidencias/marco1/m13-conducao-meio.png`.
- Esperado: nada além do sobrinho, do piso e da barra (o pisca só começa ao chegar, GDD 14.11.3).

## Observações não classificadas como bug (para o Orquestrador)
- Toque de tecla mais curto que um quadro (~16 ms, ex.: `Z` instantâneo) não é lido pelo Phaser (JustDown). Teclado humano normal não é afetado. Sugestão: Dev avaliar só se houver relato de toque perdido.
- Painel: a palavra "Apagar" ocupa quase toda a largura da tecla (captura de F-11). Cosmético, não verificado por medição.
- `docs/ADR-003.md` existe como arquivo não rastreado e não aparece no backlog. Não auditado pelo QA.
- Checklist: seção K2 corrigida para 2 espaços (decisão do Diretor, 2026-11-07).

## Seção do Dev (Marco 1.2, rodada de correção)

## BUG-M12-03: personagem para numa posição fracionária da Sala (trava intermitente)
- Item de backlog: 029 (movimento da casa real), 032 (QA da 14.10.8)
- Severidade: Alta (trava o jogador, mesmo com a seta pressionada)
- Estado: corrigido, reteste OK (rodada 8, 2026-11-08): 30 de 30 repetições de chegar a (4,3) na Sala e andar à esquerda param em (2,3) (`qa/scripts/casa12-vivo.mjs`, asserção M12-03x30).
- Causa: a colisão da caixa dos pés contava qualquer sobreposição com um tile (tolerância de 0,001 px). Por ponto flutuante, o centro dos pés podia ficar milésimos de pixel além da borda do tile de baixo (ex.: y1 = 128,002). Nesse caso, a caixa já "entrava" no tile bloqueado, e todo passo lateral era recusado: o personagem não deslizava para fora. Chegadas em (4,3) com x 140,87 e y 120 (ou y 117,87) caíam nessa condição.
- Correção: só conta como colisão a sobreposição de pelo menos 1 px nos dois eixos. Milésimos não bloqueiam. Parede continua segurando o personagem (a sobreposição real é de vários pixels).
- Teste de regressão: tests/application/movimento-regressao.test.ts varre todo tile livre de hall, sala e cozinha, cada direção com vizinho livre, chegadas com a caixa dos pés dentro do tile e com deslocamentos de milésimo além das bordas, e 4 tamanhos de passo. Antes da correção, falhava nos três cômodos; depois, passa.
- Diagnóstico observado: o `delta` por quadro é normal (16,6–16,7 ms); a tecla é lida; o `mover` com a grade real anda a partir de qualquer posição varrida, exceto nas posições com milésimo além da borda, que é a causa.

## Rodada 13 (QA, itens 038 a 045, planta girada): candidatos, a confirmar pelo Diretor ou pela Arte
Roteiro: `qa/scripts/marco1-r13-vivo.mjs` (build de QA). Capturas em `qa/evidencias/marco1/r13-*.png`.

## BUG-R13-01: P1, P2 e P3 com geometria de parede a confirmar (candidato)
- Item de backlog: 044, 045 (relações da 14.12.4)
- Severidade: Média (se for erro de conteúdo; afeta a leitura do enigma da porta)
- Estado: aberto (pergunta à Arte e ao Produto)
- Ambiente: build de QA, Chrome headless, 960x640, perfil HD (canvas 480x352)
- Passos para reproduzir: LoLô, abrir a P8 (código 017), ir à parede de cima da Sala.
- Esperado: P1, P2 e P3 na parede de cima, cada uma com uma só entrada (14.12.4; 044).
- Obtido na grade do conversor (`content/maps/casa-real/sala.json`): P1 (6,2) tem parede em (6,1) e (6,3); só é acessível de (5,2) e (7,2). P3 (8,2) tem parede em (8,3); acessível de (7,2). P2 (7,1) é acessível de (7,2). P1 e P3 estão numa linha diferente de P2, e (7,2) é o único lado de P2 e P3. Captura `qa/evidencias/marco1/r13-e-sala-parede-cima.png`.
- Observação: a regra "uma só entrada" do 044 é atendida pelo objeto (um `portaFechada` por ponto), mas a leitura visual precisa de confirmação do Diretor.

## BUG-R13-02: foco do painel pode pular ao descer na última linha (candidato, a verificar)
- Item de backlog: 038
- Severidade: Baixa
- Estado: a verificar (rodada 13, leitura automática)
- Passos: abrir o painel da P8; posicionar o foco em OK (canto inferior direito); apertar ArrowDown ou S.
- Obtido na leitura automática: o foco foi para "Apagar" (canto inferior esquerdo) após ArrowDown/S a partir de OK. Não conferido se é o comportamento esperado de navegação com "volta" de linha.
- Esperado: a seta para baixo na última linha não move o foco para outro lado (ou o comportamento é o mesmo do GDD 14.1, a confirmar).

## BUG-R13-03: resto de cena atrás do painel da senha (cosmético, candidato)
- Item de backlog: 039
- Severidade: Baixa
- Captura: `qa/evidencias/marco1/r13-b-painel-senha.png` (um retângulo escuro fraco no centro, entre a caixa dos campos e o teclado)
- Esperado: o painel cobre a cena (fundo sólido, só a pergunta, campos, teclado e barra).

## Rodada 14 (QA, planta girada, build de QA 2026-11-08)
Roteiros: `qa/scripts/marco1-r13-vivo.mjs` (de novo), `qa/scripts/marco1-r14-painel-wasd.mjs` (038), `qa/scripts/marco1-r14-sobrinhos.mjs` (BiBi, DanDan, TuTu). Capturas `qa/evidencias/marco1/r14-*.png` e `r13-*.png`.

## BUG-R13-02: resolvido como esperado (não reproduzido)
- Item de backlog: 038
- Classificação: **esperado** (não é bug). Reteste com `qa/scripts/marco1-r14-painel-wasd.mjs`, painel aberto de novo a cada caso (foco inicial em OK, conferido):
  - Do meio (5): d = ArrowRight (foco em 6), s = ArrowDown (8), a = ArrowLeft (4), w = ArrowUp (2). Iguais nos quatro pares.
  - Bordas: em OK, ArrowDown/s e ArrowRight/d ficam em OK; em 1, ArrowUp/w e ArrowLeft/a ficam em 1; em Apagar, ArrowDown/s e ArrowLeft/a ficam em Apagar. Nenhum salto de borda (sem wrap).
- Por que a leitura da rodada 13 deu "Apagar": não foi reproduzido com a mesma sequência; a leitura anterior foi automática e pode ter pego o destaque em piscada. Não há passo que reproduza o salto.
- GDD 14.1 diz só que "setas ou WASD movem o foco entre as teclas" e não define o comportamento na borda. Comportamento observado (ficar na borda) é o mais natural. Pergunta ao Diretor abaixo, só para confirmar.

## BUG-R13-03: resto de cena atrás do painel da senha (ainda visível)
- Item de backlog: 039
- Severidade: Baixa (cosmético)
- Estado: aberto. Captura `qa/evidencias/marco1/r13-b-painel-senha.png` (rodada 14, nova execução): há um retângulo escuro fraco logo acima das teclas 2 e 5, e um traço atrás da linha 7-8. O fundo do painel não é totalmente sólido.
- Esperado: fundo sólido sem resto de cena (GDD 14.1, "o painel cobre a cena").

## BUG-R14-01 (candidato, a confirmar com Arte): aparência da árvore desmontada no tile (3,8)
- Item de backlog: 036 (halo e chegada); conferir também o item da árvore de pé no tile (3,8) no backlog
- Severidade: Média se a árvore estiver errada; Baixa se for só o estado desmontado
- Estado: a confirmar (só a parte da árvore; o halo não é bug). Capturas `qa/evidencias/marco1/r14-BiBi-chegada-sem-dialogo.png`, `r14-DanDan-chegada-sem-dialogo.png`, `r14-TuTu-chegada-sem-dialogo.png`.
- Observado (igual nos 3 sobrinhos): o Sobrinho está em (3,7) de frente para baixo, e a árvore está logo abaixo, no tile (3,8). O sprite da árvore ocupa só a metade de baixo do tile (3,8), com aparência de pilha baixa (dois triângulos), e não de árvore de pé. O halo está certo: é um retângulo dourado translúcido com margem em volta da árvore (visto em fase alta em `qa/evidencias/marco1/r13-j-sala-final.png`). Na captura de chegada ele aparece em fase baixa, mais escuro, e isso é esperado pelo pisca (GDD 14.9.3). Em (4,7) e (4,8) ele não aparece, também pela fase.
- Esperado: GDD 14.9.3 e 14.12.3: árvore "desmontada" é pilha pequena (texto "A árvore ainda está desmontada"), e o halo é dourado. Se a pilha for o desenho correto do estado desmontado, o item "de pé" não se aplica; confirmar com a Arte e o Produto.
- Passos: LoLô (ou BiBi, DanDan, TuTu), código da P8 (017, 020, 023, 024), luzes, Continuar, condução até (3,7).

## Notas da rodada 14 (não são bugs)
- E-P2 (rodada 14, script `marco1-r13-vivo.mjs`): o script registrou falha porque leu texto vazio, mas a captura `qa/evidencias/marco1/r13-e-P2-sem-texto.png` mostra "Essa porta está fechada. Hoje não dá para entrar." Falha de leitura do script. E-P3 não foi conferido por captura.
- A-d/A-s (rodada 14, script r13): falharam na sequência longa do script, não isolados. No teste isolado (`marco1-r14-painel-wasd.mjs`), passaram.
- Acentos: "Fogão" e "Forno" conferidos na Cozinha (`qa/evidencias/marco1/r13-f-cozinha.png`); "Mesa" e "Rack TV" conferidos na Sala. "Sofá": não verificado. A captura `qa/evidencias/marco1/r14-sofa-acento.png` mostra o Sofá em (3,3) (1×2 tiles, `content/maps/casa-real/sala.json`) sem nenhum rótulo, enquanto "Rack TV" e "Mesa" (2×1) têm rótulo. Pode ser regra de rótulo (só móvel largo) ou bug: a confirmar com o Dev. "Armário" está em `suite_casal.json`, fora da rota do Marco 1: não testado.
- Scripts da rodada 12/13 que usam coordenadas antigas (casa12-vivo, casa13-vivo, conducao-rodada2, casa12-rotas-demo, arte-caminhada-vivo, porta-rota) foram marcados como obsoletos no topo, com o motivo (planta girada, GDD 14.12.3).

## Rodada PT2b (QA, itens 046 e 047, 2026-11-08)
Checklist: `qa/checklist-046-047.md`. Script: `qa/scripts/pt2b-046-047.mjs`. Build: dist-qa. Sem bug confirmado nesta rodada.
- Observação (não é bug ainda): "A repetido" na árvore (047-11). Depois do 2º A fecha e do 3º A reabre a fala (travado = true), mas o texto não foi lido pelo script. Confirmar por captura antes de classificar.
- Observação: na captura da Sala, a fala de 1 página cobre o Sobrinho em (3,7) e a árvore. Comportamento normal de diálogo, só registro.

## BUG-R15-01: pisca da árvore invisível durante o diálogo automático (caixa de diálogo cobre o tile (3,8))
- Item de backlog: 047 (pisca, D13 de 14.11); 036 (halo)
- Severidade: Média (o pisca é o chamariz do diálogo; GDD 14.9.3 diz que começa junto com o diálogo, mas o jogador não o vê nesse momento)
- Estado: aberto (é decisão de layout/visual: Produto e Arte). Não é travamento.
- Ambiente: Chromium headless, 960×640, dist-qa, perfil HD (480×352). LoLô, rodada final r15/r15b.
- Passos: LoLô, código da P8 (0, 1, 7), luzes, Continuar, esperar a condução até (3,7). O diálogo abre sozinho.
- Esperado: GDD 14.9.3: o pisca do halo atrás da árvore começa junto com o diálogo e é visível.
- Obtido: a caixa de diálogo ocupa a faixa de baixo da tela e cobre o tile da árvore (3,8). Só o topo do sobrinho aparece acima da caixa. O pisca só volta a ser visível depois de fechar o diálogo com X. Captura: `qa/evidencias/marco1/r15b-dialogo-auto-p1.png` (árvore coberta) e `qa/evidencias/marco1/r15b-halo-antes-A-1.png` (halo visível sem diálogo).
- Pergunta ao Diretor abaixo (só o Diretor decide se o diálogo muda de lugar ou se o pisca passa a ser visível de outro jeito).

## Rodada final r15 (2026-11-08, pré-PT2c), resultado dos itens em qa/checklist-046-047.md
- Confirmado: setas em P1 (esquerda) e P3 (direita), P2 limpa, P7 direita (Sala) e esquerda (Cozinha), tapete em (6,6). Capturas `r15-sala-completa.png`, `r15-cozinha.png`.
- Confirmado: A em P1, P2 e P3 mostra "Essa porta está fechada. Hoje não dá para entrar." (capturas `r15-A-P1.png`, `r15-A-P2.png`, `r15-A-P3.png`). O script leu texto vazio em P2 e P3, mas a captura mostra a mensagem. Falha de leitura do script, não bug.
- Confirmado: A na árvore reabre a fala no 3º A (captura `r15-arvore-A3.png`). A2 fecha, sem texto. Não é bug.
- Nota (não é bug): o sobrinho em (9,5), ao lado de P7, não fica sob a seta e não é coberto por ela (`r15-sala-perto-P7.png`). A sobreposição real (046-7) não foi forçada.

## Rodada Marco 2 (v0.6.0, 2026-11-08), roteiro `qa/scripts/marco2-v060-lolo.mjs`, checklist `qa/checklist-marco2.md`

## BUG-M2-01: Quarto não abre pela P2 (059, opção B)
- Severidade: Alta (conteúdo do Marco 2 ausente nesta build; a conferir com o Produto se 059 já entrou)
- Passos: LoLô, código 017, luzes, Sala, ir a (7,2) e apertar cima até encostar em P2 (7,1), A.
- Esperado (059 item 2/3): P2 é passagem com vão (7,0) e gatilho do Quarto em (7,-1); Quarto aberto.
- Obtido: `content/maps/casa-real/sala.json` tem P2 como `portaFechada` em (7,1); sem gatilho nem vão. Texto de A: a confirmar pela captura `qa/evidencias/marco2/06b-P2-fechada.png` (leitura do script veio vazia).
- Nota: o briefing do QA pede "Quarto inacessível". Diferença a esclarecer com o Orquestrador/Produto (059 diz aberto).

## BUG-M2-02 (a confirmar): P2 e P1 sem texto lido
- Passos: idem acima. Leitura do script vazia em P2; P1 mostrou "Essa porta está fechada. Hoje não dá para entrar.".
- Estado: a confirmar pela captura `06b-P2-fechada.png`.

## Notas da rodada Marco 2 (não são bugs)
- Movimento curto (90 ms) não muda de tile no runtime (passo de 0,36 tile): falsos "não bloqueia" e "não anda" no script. Usar 260 ms.
- Escondida (4,1) não bloqueia (ArrowUp 400 ms de (4,2) entra em (4,1)). OK.
- Aviso da peça 2 e da peça 3 (antes da 1): "Ainda não!" + página 2 corretas. OK.
- Conquista 1 "primeira parte da árvore de Natal" OK. Encaixe 1 e diálogo "Agora a árvore tem 1 parte. Faltam 2 partes!" OK. Exame estado 1 "Ela já tem 1 parte. Faltam 2 partes." OK.
- Passos e 2× da condução não medidos (detecção do script perdeu a condução curta, E4 passos=0).

## Rodada 2 do Marco 2 (v0.6.0, 2026-11-08): roteiros `qa/scripts/marco2-r2-completo.mjs` e `qa/scripts/marco2-r2b-detalhes.mjs`
Quarto e Suíte ignorados nesta rodada (decisão do Diretor, em produção: BUG-M2-01 é "esperado até a entrega").

## BUG-M2-03: passos da condução 2× diferentes do GDD (E7 e E20), a confirmar
- Severidade: Média
- Passos: LoLô, luzes, peça 1; teleporte para a Cozinha (`__teleportar('cozinha','P7')`); ir a (3,1), ArrowRight contra a peça 2 (bloqueia), A, Continuar. Depois, peça 3: teleporte, ir a (3,4), ArrowDown (bloqueia), A, Continuar.
- Esperado: E7 cerca de 12 a 13 passos (orquestrador pediu 15); E20 cerca de 17 a 18 (pedido: 20). 2× e fade 0,25 + 0,25 s.
- Obtido (contagem por mudança de tile): peça 2 = 11 passos, 1,99 s no total com fade, fade observado; peça 3 = 16 passos, 2,74 s, fade observado. Velocidade compatível com 2× (sem contagem de tempo exata).
- Nota: a origem da condução foi (3,1) e (3,4), não o tile da peça. Reproduzir a partir de outra origem antes de classificar. Dev deve conferir a regra 15.3.5 e ADR-004 seção 11.2.

## BUG-M2-04: texto do exame da árvore no estado 3 não lido (a confirmar)
- Severidade: Baixa
- Passos: peça 3 encaixada, sobrinho em (3,7), A na árvore.
- Esperado: "A árvore está montada! Que linda!" (GDD 15.8, arvore.estado.3).
- Obtido: leitura vazia do texto; o script registrou falha. Captura `qa/evidencias/marco2/r2-arvore-estado3.png` mostra a Sala sem caixa de texto. Confirmar com nova rodada (A, espera de 400 ms, leitura).

## Notas da rodada 2 (não são bugs)
- Títulos e textos OK: "primeira parte...", "Agora a árvore tem 1 parte. Faltam 2 partes!", "segunda parte", "Agora a árvore tem 2 partes. Falta 1 parte!", "última parte", "A árvore está montada! Que linda!" (chegadas 1 e 2, conquistas 1 a 3 confirmadas por leitura).
- Peça 2 e peça 3 visíveis bloqueiam (ArrowRight e ArrowDown ficam paradas). OK.
- Avisos repetem sempre: peça 3 (antes da 1) e peça 2 (antes da 1), 3 de 3 tentativas cada, página 1 "Ainda não!" e página 2 corretas. Não há "uma vez só".
- Pisca: 4 quadros da tela a 250 ms, depois do encaixe 1, iguais. Sem pisca após a 1ª peça (coerente com GDD 15.8/14.9.3: no Marco 2 não pisca). OK.
- Botões e teclas durante a condução (Esc, setas, Z, X, Enter): sem efeito, posição final correta, sem caixa de texto. OK. A leitura de "Mesa Rack TV" é rótulo de móvel, não diálogo.
- Parede (4,4): sobrinho parado em (4,3) com centroY 120,12 a 121,00 nas duas medições. Não há deriva de 2 px observada com teclado real. Não reproduzido. Comparação de topo: ArrowUp de (1,1) para (1,0) chega a centroY 7,06 (borda do mapa).
- Peça 2 e peça 3 aparecem como triângulo verde com halo na captura (`r2-peca2-bloqueia.png`). Pode ser placeholder da Arte (item 050 não entregue). Confirmar com o Diretor.
- BiBi, DanDan, TuTu: título → Começar → sobrinho → intro → código → luzes → condução → peça 1 → conquista 1 → encaixe 1 com diálogo correto nos 4 sobrinhos (BiBi 2 passos, DanDan 2, TuTu 2). Peça 3 por teleporte para BiBi, DanDan e TuTu: não testada.
- Nova partida: título com "v0.6.0" no canto superior direito (captura `qa/evidencias/marco2/r2-02-nova-partida-titulo.png`). OK.
- Erros de página e console: nenhum nas duas rodadas.

## Rodada 3 do Marco 2 (v0.6.0, 2026-11-08): Quarto pela P2, setas, paredes, sobrinhos
Build: `npm run build:qa` (dist-qa). Roteiros: `qa/scripts/marco2-v060-r3-quarto.mjs`, `qa/scripts/marco2-v060-r3-sobrinhos.mjs`, e as regressões `marco2-r2-completo.mjs` e `marco2-r2b-detalhes.mjs`. Capturas em `qa/evidencias/marco2-r3/`.

## BUG-M2-05: seta esquerda do gatilho do Quarto parece estar um tile abaixo do gatilho (a confirmar)
- Severidade: Média (indicador de saída do Quarto; leitura errada do caminho de volta)
- Ambiente: Chromium headless, 480×352 (HD), dist-qa, LoLô, código 017, luzes, P2 (7,1) da Sala, ida ao Quarto.
- Passos: entrar no Quarto pela P2; a chegada é em (0,6) local, de frente para cima (estado confirmado por `__estado`).
- Esperado (GDD 15.3.3 e 15.10 E17): a seta esquerda fica no gatilho do Quarto, (0,7) local, o tile logo abaixo da chegada.
- Obtido: na captura `qa/evidencias/marco2-r3/12-quarto-chegada.png` o sobrinho está em cima de uma coluna clara, e há um tile claro livre entre ele e a seta. A seta aparece dois tiles abaixo da posição lida pelo jogo. A volta funciona: andar de (0,6) para baixo leva à Sala (7,2), de frente para baixo (E21e, fade confirmado).
- Pode ser desenho da seta ou do sobrinho (ou da câmera do Quarto, 5×8 centralizada). Não dá para afirmar só pela captura. Confirmar com a Arte e com o Dev, comparando com `content/maps/casa-real/quarto.json`.
- Captura de apoio: `qa/evidencias/marco2-r3/13-quarto-passeio.png` (mostra a seta e o topo da coluna).

## Notas da rodada 3 (não são bugs)
- Leitura dos textos do Quarto (E19b, P4 fechada; E21b, P2 fechada antes das luzes): o script leu a frase "Essa porta está fechada." no buffer de texto. A captura `14-quarto-P4-fechada.png` foi tirada depois de fechar a caixa; a leitura é do script, não captura. Conferir ao vivo na próxima rodada se houver tempo.
- Passeio, paredes do Quarto (nenhuma saída pelo lado da parede; a saída fica só no gatilho (0,7)), e volta: OK.
- Setas inspecionadas (captura `11-sala-com-setas.png`): P1 seta esquerda, P2 seta direita (Sala), P3 seta direita, P7 seta direita (Sala), tapete vermelho em frente à P8. Escritório (`16-escritorio.png`): P3 seta esquerda no gatilho e P6 fechada com seta direita. Cozinha (`17-cozinha-parede.png`): P7 seta esquerda. Segundo 15.3.3 / 14.10.10 (decisão 17, GDD linha 937), as portas fechadas laterais (P1, P3 fechada, P4, P5, P6) recebem seta; P6 tem seta, de acordo.
- Travamento de 2 px (P7-01): com teclado real, de (4,3) segurando seta para baixo por 700 ms e depois de novo, o centro ficou em 121,00 (sem deriva). Seta para a direita de (4,3) e (3,3) entra no tile (5,3) sem sobrar. Não reproduzido.
- Regressão r2 (`qa/evidencias/r3-r2-completo.txt`): peça 1 (conquista e encaixe) OK; peça 2 condução 11 passos, 2× (fade, 2,0 s); peça 3 condução 16 passos, 2× (fade, 2,7 s); esperado 12 a 13 e 17 a 18 (BUG-M2-03, continua aberto).
- Exame da árvore no estado 3: o script leu vazio, mas a captura `qa/evidencias/marco2/r2-arvore-estado3.png` mostra "A árvore está montada! Que linda!" com a árvore de pé, na Sala. BUG-M2-04 segue a confirmar (ver se o exame por A, e não só o diálogo do encaixe, mostra esse texto).
- `r2b` "botões na condução: sem efeito": a leitura "Mesa Rack TV" é o rótulo de móvel, não caixa de diálogo. Falso positivo do script.
- Sobrinhos BiBi, DanDan e TuTu: título, senha (020, 023, 024), luzes, conquista 1 e encaixe 1 com o diálogo "Agora a árvore tem 1 parte. Faltam 2 partes!": OK nos três, sem erro de página.

## Rodada 2 do Marco 3 (v0.7.0, 2026-11-09), roteiro `qa/scripts/marco3-r2.mjs`
Sem bug confirmado. Observações para o Dev:
- Após `__teleportar`, `travado=true` até uma tecla (diálogo do hall). Os roteiros fecham com X antes de agir. Dev confirma se é o gancho ou a cena.
- Leitura do mapa depois do código 017 veio "hall" (5 s), mas as luzes e a condução seguiram na Sala. A confirmar com a captura antes de virar bug.

## Rodada 3 do Marco 3 (v0.7.0, 2026-11-09)
- Observação 2 da rodada 2 ("hall" por 5 s depois do código 017): NÃO é bug. Captura `qa/evidencias/marco3-r3/01-porta-aberta.png`: a porta abriu e o diálogo "Clique! A porta abriu." aparece com o sobrinho ainda no Hall. O roteiro antigo esperava a entrada automática. Dev: sem ação.
- Regressão do Marco 2 (`qa/scripts/marco2-r2-completo.mjs`, rodada de hoje, build com Marco 3): reproduzidos BUG-M2-03 (peça 2 com 11 passos a 2×; esperado 12 a 13) e BUG-M2-04 (exame da árvore estado 3, leitura vazia). Continuam abertos; sem novo bug.
- Observação (Dev): `__teleportar` continua deixando `travado=true` no aviso da Sala escura (confirmado pelo Dev, não é bug).

## BUG-M3-R4-01: Nick não faz a reação "feliz" + "Au!" ao chegar com conquista (N8, backlog 069)
- Severidade: Média (é o momento de alegria da criança; o item 069 pede e o GDD 16.7 descreve)
- Estado: fechado no reteste da rodada 5 (2026-11-09): LoLô com Nick acordado: "Au!" aparece com o diálogo da árvore na chegada das luzes (`qa/evidencias/marco3-r5/LoLô-acordado/chegada-0.png` e `chegada-3.png`). Com Nick dormindo: nenhum "Au!" (script `IDX=0 WAKE=0`). Pose "feliz" não confirmada quadro a quadro (o sprite muda de pose entre os quadros, mas não foi isolado).
- Ambiente: build de QA (`dist-qa`, rodada 4, 2026-11-09), Chromium headless, 480x352, LoLô e BiBi (mesmo resultado). Teclado.
- Passos para reproduzir: `qa/scripts/marco3-r4-final.mjs`. Com o Nick acordado (Cozinha, acordado com A), trocar para a Sala (F9), conduzir a peça 1 com A, A (Continuar), e observar a chegada à árvore.
- Esperado: ao chegar com a conquista, o Nick faz "feliz" de 1,6 s com "Au!" uma vez, e o diálogo começa sem esperar a animação (GDD 16.7, N8; backlog 069 item 2).
- Obtido: nenhum "Au!" durante a condução nem na chegada (o buffer de texto não recebe o balão). No código, `CasaScene.ts` só chama `nick.feliz()` em `abanar()` (linha ~1001) e no caso `semAlvo` (linha ~1030). Não há reação na chegada de conquista.
- Evidência: `qa/evidencias/marco3-r4/03-depois-chegada.png` (Nick dormindo no Quarto depois; a chegada não tem o balão). Log do roteiro: "N8 FALHA".
- Observação: o "Au!" de acordar e o de abanar funcionam (F6 OK).

## Notas da rodada 4 (não são bugs)
- BUG-M2-03 (passos 11/16 a 2×): falso positivo. A contagem não inclui os 3 passos da passagem (confirmado pelo Diretor/Orquestrador). Não reabrir.
- BUG-M2-04 (exame da árvore no estado 3): falso positivo. A captura `qa/evidencias/marco2/r2-arvore-estado3.png` mostra "A árvore está montada! Que linda!". Não reabrir.

## BUG-M3-R5-01 (candidato): fumacinha ao dormir (N9) não aparece nas capturas
- Severidade: Baixa (efeito visual de 0,5 s; o estado do Nick está certo)
- Estado: FECHADO (não é bug, Dev, 2026-11-09: a captura foi tardia; a fumaça dura ~0,5 s no tile de origem, ver dist-playtest/capturas/montagem-feliz-e-fumaca.png). Não reconferido em captura na rodada 6.
- Ambiente: `dist-qa`, LoLô, Nick acordado na Sala, luzes, chegada e fim do diálogo (`IDX=0 WAKE=1 node qa/scripts/marco3-r5-reacao.mjs`)
- Passos: depois do fim do diálogo de chegada, o Nick sai da Sala e dorme na Cozinha (estado correto).
- Esperado: fumacinha de 0,5 s onde o Nick estava (GDD 16.6, ADR-005 seção 3.5 "CasaScene.devolverControle").
- Obtido: capturas `qa/evidencias/marco3-r5/LoLô-acordado/fumaca-0.png`, `fumaca-1.png` e `fumaca-2.png` (iniciadas logo após o controle voltar) não mostram fumacinha no tile onde o Nick estava.
- Observação: pode ser a captura começar depois da fumaça, ou o `anterior` não estar na Sala. Dev confirma.

## Rodada 6 do Marco 3 (2026-11-09), build com a correção de reagirAConquista (Dev)
- BUG-M3-R4-01 (reação "feliz" + "Au!"): reteste OK em LoLô e DanDan (luzes, Nick acordado): `animacaoDoNick` = `nick-feliz` por ~1,1 s+ com `animandoNick`, "Au!" e diálogo na chegada (`qa/evidencias/marco3-r6/`). Fechado.
- Achado na hook de QA (`src/presentation/qa/ganchoQa.ts`, função `__estado`): às vezes lança `Cannot read properties of undefined (reading 'currentAnim')` (`c.nick.sprite.anims` indefinido, ao trocar de área). Dev confirma se a animação do sprite pode ser destruída nessa hora. O roteiro ganhou tolerância (retry).
- BiBi: com o caminho do código (`irAtePainel` + "020") a entrada na Sala falhou nesta rodada (ficou no Hall). O atalho `__irParaFase('luzes')` funcionou. Não é reprodução do código; o código funciona no Marco 2 (`marco2-r2-completo.mjs`).

## Rodada 7 do Marco 3 (2026-11-09, build corrigido, Chromium, teclado; `qa/scripts/marco3-r7.mjs`, `MODO=acordado` e `MODO=dormindo`)
- (1) Peça 1 com Nick acordado: OK. "Au!" na chegada (3 ms), `animacaoDoNick` = `nick-feliz` por ~1 s+ com `animandoNick`, diálogo em ~1,0 s (antes do fim da animação de 1,6 s). Capturas `qa/evidencias/marco3-r7/acordado/peca1-acordado-*.png`.
- (2) Peça 1 com Nick dormindo: OK. Nenhum "Au!" e `animacaoDoNick` null (sem animação feliz). Capturas `qa/evidencias/marco3-r7/dormindo/`.
- (3) F7 ao vivo: OK. Com a peça 1 pendente, B na Cozinha aponta para a P7 (saída esquerda), nunca para a peça 2 escondida (captura `qa/evidencias/marco3-r7/acordado/f7-seta-P7.png`).
- (4) Fumacinha: OK. Quadro 0 ao fechar o diálogo de chegada mostra a fumacinha no tile onde o Nick estava na Sala (`qa/evidencias/marco3-r7/acordado/fumaca/f-00.png`). BUG-M3-R5-01 fechado como não é bug (ver acima).
- Sem bug novo.

## Rodada 8 (v0.7.1, 2026-11-09)
- Relato do PT3 "farejar não repetiu": NÃO reproduzido. B repetido funciona com alvo em outro cômodo (refaz farejando e reinicia os 5 s) e no mesmo cômodo (refaz "Au!"). Sem bug. Ver `qa/checklist-marco3.md`, rodada 8.
- Observação (não é bug): o estado `farejo.ativo` fica verdadeiro desde o B, com `restanteMs` parado em 5000 até o fim do farejando. Pela leitura do código o relógio de 5 s começa no fim do farejando, como pede o GDD 16.5.3. Não confirmado pela captura das tremidas.
- Candidatos não testados nesta rodada: P8 (Sala-Hall) e Nick com dois sobrinhos a mais.

## Rodada 9 (v0.7.1, veredito final)
- Nenhum bug confirmado no jogo.
- OBSERVAÇÃO (tremidas, a confirmar pelo Dev e pelo QA): medição por pixel do ouro (`#f4d35e`, quadros a cada 100 ms) mostra oscilação do centroide de ~1,5 px durante mais de 1,4 s, quando o GDD 16.5.3 pede 2 tremidas de 0,4 s (0,8 s no total) e depois parada. Pode ser o efeito do sprite (centroide) e não a animação. Captura `qa/evidencias/marco3-r9/LoLô/seta-P7.png`. Não aberto como bug.
- OBSERVAÇÃO (penumbra, a confirmar): na captura da barra (`qa/evidencias/marco3-r9/DanDan/barra-2-linhas-sala.png`) a Sala aparece quase toda escura depois de `__irParaFase('parte1')`, com luz só ao redor do sobrinho. Pode ser o estado de luzes que o gancho conclui sem o diálogo. Conferir se é o gancho ou o jogo com as luzes acesas em jogo normal.
- O relato anterior de "Nick em cima do sobrinho" (um teste que entrou de novo pela porta) foi causado pelo roteiro: o roteiro deu passo para o gatilho. Corrigido no roteiro. Não é bug.

## Rodada 4 do Marco 4b (v0.8.1, 2026-11-09, `qa/scripts/marco4-r4.mjs`)
- BUG-M4-01 (a confirmar): Nick com estado "dormindo" no Escritório (6,1) durante as 3 páginas da chegada da parte 3 (LoLô). Esperado: Nick só vai dormir na Sala (8,5) depois do diálogo (caso 2). Obtido: leitura `escritorio:6,1` durante o diálogo, `dormindo`, e `sala:8,5` depois. Severidade: Média. Ambiente: dist-qa, LoLô, partida real (`__irParaFase('parte2')`, peças 2 e 3 jogadas). Passos: chegar à peça 3, A, condução até (3,7) da Sala, observar `__estado().nick` durante as páginas. Status: aberto, Dev confirma se é a posição de origem do Nick ou um estado que não deveria existir. Captura não feita.
- BUG-M4-02 (a confirmar): no diálogo final "Agora a árvore está toda enfeitada!", o Z na página 1 não mostrou a página 2 "Feliz Natal para a família!" nesta rodada (leitura de textos vazia logo depois do Z, nos dois sobrinhos). Esperado: Z avança à página 2 (GDD 17.7). Obtido: sem texto visível depois do Z. Severidade: Alta se for real (diálogo fecha sozinho). Status: aberto, reteste com captura `qa/evidencias/marco4-r4/<sobrinho>/CASO4-final-p1.png` e quadros seguintes antes de classificar. Também: Z na tela de créditos não levou ao título na leitura (texto vazio depois do Z); conferir junto.
- Rodada 5 (2026-11-09): BUG-M4-01 FECHADO como não-bug (GDD 16.2.2: Nick dorme no tile da fase, Escritório, durante a parte 3). BUG-M4-02 FECHADO como não reproduzido com espera de 1,5 s (página 2 e título OK nos dois sobrinhos); ver checklist-marco4b.md, rodada 5.

## Rodada 1 do Marco 5 (v0.9.0, 2026-11-09, toque emulado, `qa/scripts/marco5-r1.mjs`)
- Nenhum bug confirmado nesta rodada. Capturas em `qa/evidencias/marco5-r1/`, checklist em `qa/checklist-marco5.md`.
- Observação (não é bug): a mensagem "Quase! Leia o bilhete de novo." fica na tela depois de um código errado enquanto se apaga e digita outro código (`qa/evidencias/marco5-r1/10-painel-codigo-017.png`). Decisão do Produto.
- Não é bug: `direcao` no `__estado` é a direção em que o sobrinho olha, não a tecla pressionada. A prova de ausência de diagonal foi pela posição (x constante com dois dedos), registrada no checklist.

## BUG-M5-02: B/X não farejar na fase luzes (FECHADO: não reproduzido, leitura cedo)
- Severidade: Alta se confirmado (farejar é a mecânica de busca do Marco 3; o B é o botão do farejar no toque e X no teclado).
- Ambiente: dist-qa, LoLô e BiBi, Chromium, teclado (`qa/scripts/marco5-r5.mjs`, `qa/evidencias/marco5-r5-saida.txt`) e toque (rodada 1, TQ5: B sem texto na exploração, `qa/evidencias/marco5-r1/06-B-farejar.png`).
- Passos: porta P8 pelo código; Nick acordado (N2 com Aperte X); fase luzes (alvo Interruptor, na Sala, 16.5.2); no mesmo cômodo pressionar X (F3) ou, do Hall, pressionar X (F4).
- Esperado: "farejando" 1,2 s e "Au!" (mesmo cômodo, F3) ou seta para cima sobre a P8 (F4), GDD 16.5.
- Obtido: nada. `farejo.ativo` = false antes e depois; sem texto; sem seta.
- Status: FECHADO (não reproduzido, leitura cedo; Dev, rodada 6 do QA). O farejar com Nick acordado tem 1,2 s de animação (nickOcupado=true) antes do "Au!" no mesmo cômodo; no Hall a seta sobre a P8 aparece logo. Idêntico no build do commit 0edf562 (Marco 4): não é regressão. A leitura do QA foi feita cedo demais (rodada 5).

## BUG-M5-03 (rodada 7): menus em layout A (844×390) mostram cruz, A/B e a barra com teclas (FECHADO: comportamento esperado, GDD 18.4)
- Severidade: Média (quebra a regra nova do Dev: menus sem cruz nem A/B; a barra diz "Setas: escolher  A: confirmar" e "B: voltar ao título" em vez de "Toque para escolher" / "Toque em Voltar ao título").
- Ambiente: dist-qa (build novo, rodada 7), Chromium, toque emulado, 844×390, `qa/scripts/marco5-r7.mjs`, capturas `qa/evidencias/marco5-r7/844x390_t_tulo.png` (cruz, A e barra antigos) e `667x375_t_tulo.png` (correto).
- Passos: título, Como jogar, seleção e dica em 844×390.
- Esperado: sem cruz nem A/B nos menus; barra "Toque num item do menu" (título), "Toque em Voltar" (Como jogar e dica), "Toque para escolher" (seleção), como em 667×375.
- Obtido: cruz e A visíveis no título, Como jogar, seleção e dica; barra com textos de teclado.
- Nota: GDD 18.4 (tabela) pede cruz e A no título em layout A; a regra nova do Dev (menus sem cruz) não foi aplicada ao layout A. Decisão do Orquestrador/Produto: uniformizar os dois layouts ou manter a regra do GDD 18.4.
- Status: aberto (divergência entre layouts; o Diretor/Produto decide).

- Fechamento (Orquestrador, rodada 8): NÃO é bug. No layout A (844×390) os controles ficam nas faixas laterais, fora do texto e dos botões; a barra com "A: confirmar" aponta botões que existem na tela. Vale o GDD 18.4 (colunas do layout A). Comportamento esperado.

## PT4 (Diretor, aparelho real, v0.9.0)

### BUG-M5-04 — A cruz na tela não navega nos menus (título e seleção)
- **Severidade:** alta (jogo no celular não avança sem tocar direto nos itens). **Origem:** PT4, achado pelo Diretor. **Causa (Dev):** a cruz só alimentava `segurada()`; os menus leem `apertada()`, que vinha só das bordas de A e B. **Correção:** v0.9.1 (`FonteDeToque.entrarNaCruz` gera a borda da direção por toque novo; um toque = um passo, sem repetição ao segurar). **Estado:** corrigido pelo Dev, aguarda reteste do QA. Lição: o QA testou toque direto nos itens, mas não a cruz nos menus.

## BUG-M5-04 (reteste da v0.9.1, rodada 9): FECHADO
- Reteste (`qa/scripts/marco5-r9.mjs`, build:qa refeito, foco por `__focoDoMenu`): 844×390: título cruz baixo/cima move o foco 0↔1 (um toque = um passo; segurar não repete); A no foco 1 abre Como jogar; seleção cruz direita/esquerda move 0→1→2→3 (segurar 1,2 s anda um cartão), o último cartão não dá a volta, cruz esquerda 3→2; exploração: cruz segurada 0,5 s anda ~68 px (esperado ~64); cruz + A e cruz + B sem erro; cruz com o aviso de rotação não move o mundo. 667×375: cruz some nos menus; toque direto em Como jogar, em Voltar e nos cartões funciona. Teclado nos menus (`qa/scripts/marco5-r9-teclado.mjs`): setas e Z/X movem o foco e trocam de tela.
- Capturas: qa/evidencias/marco5-r9/ (`*-como-jogar-cruz.png`, `*-selecao-cruz.png`, `*-exploracao-cruz.png`, `*-titulo.png`, `*-selecao-toque.png`).

## BUG-M5-05 (rodada 9): FECHADO como falha do roteiro (caminho até os créditos em 844×390)
- Severidade: a confirmar (regressão se for do jogo; se não, do roteiro). Ambiente: dist-qa (v0.9.1), toque emulado, `qa/scripts/marco5-r7-cam.mjs cam 844 390`. Passou na rodada 7 (mesmo roteiro, v0.9.0). Em 667×375 passa.
- Passos: peça 3, caixa, encaixe, "Agora a árvore está toda enfeitada!" (ok), fade (ok), créditos (não aparecem; a zona "Creditos:Zone" não existe ao fim do loop).
- Obtido: depois do fade, a tela não tem créditos; o roteiro acaba sem "Versão" e sem zona de créditos. Captura do estado final de 844: a captura desta rodada não foi regravada (ver saída `qa/evidencias/marco5-r9-cam-844.txt`).
- Status: aberto. Dev confirma se o caminho de 844 mudou (ex.: loop de A no diálogo final ou o fade). Reproduzir com captura de cada quadro após o "Agora a árvore...".
- Nota: a checagem "Versão 0.9.0" do roteiro está desatualizada: o título e os créditos agora dizem 0.9.1 (a versão do package.json). Não é falha.

- Fechamento (rodada final, Dev e QA): falha do roteiro. O roteiro (marco5-r7-cam.mjs) tinha "Versão 0.9.0" fixo; os créditos agora dizem a versão do package.json (0.9.1). A versão passou a ser lida do package.json. Rodada final: caminho completo por toque até os créditos em 844×390 e 667×375 passa (versão 0.9.1; Voltar ao título tocável).

## Rodada do joystick (v0.10.0, item 118): sem bug aberto
- Nenhum bug confirmado nos testes de TQ23 a TQ32 executados (`qa/checklist-marco5-joystick.md`).
- Falhas que apareceram no roteiro e foram corrigidas no roteiro (não são bugs): direção direita e baixo bloqueadas pela mesa e pela porta no spawn P8 (roteiro: teleporte de sala sem movimento livre); base ausente logo após o teleporte (diálogo "Está tudo escuro" escondia a base: fechar o diálogo antes); 45° exato sem direção anterior é nenhuma direção (empate, 18.19.4), não falha.
- Pendentes: TQ33 (teclado), anel amarelo só nas direções da tela (título), TQ27 nas telas de conquista, painel e intro, velocidade igual ao teclado (REG-V).

## Última rodada do Marco 5 (joystick): observação do gancho (não é bug do jogo)
- `__alvosDeToque` lista o `analogico` durante o fade e o diálogo da Sala (nos dois layouts), mas a captura do mesmo instante mostra a base ausente (`qa/evidencias/marco5-final2/844x390-TQ27-fade.png`, `667x375-TQ27-fade.png`). O jogo esconde a base; a lista do gancho pode estar com um frame de atraso ou incluir a base escondida. Baixa severidade (ferramenta de QA). Dev confirma.
- Anel amarelo em título (esquerda) e seleção (cima): sem setor pela captura (`844x390-ANEL-T-titulo-esquerda.png`); o campo `direcao` do gancho reflete a direção, não o desenho.

## Marco 6, rodada 1 (v0.10.0 + polimento; QA)
- **P3 — divergência de spec: mudo "silencia" (19.2.3) × "a música para" (AU4).** Código: mudo põe o ganho mestre em 0; música segue "tocando" silenciosa (`__estado().audio.musica` = tocando, `mudo` = true). Evidência: `qa/evidencias/marco6-r1` (`marco6-r5-mudo.mjs`). Ação: Produto escolhe o texto certo; o código bate com 19.2.3.
- **P3 — observação de ícone durante fade de porta (667×375), 1 de 2 tentativas.** Em uma passagem pela P7 (Cozinha → Hall), a lista de alvos trouxe um `icone-*` durante o fade; não reproduzido na 2ª. Possível quadro de transição. Reproduzir com captura quadro a quadro (19.3.2; PS5). Não reprovado.
- Não é bug: PS9 em 844×390 mostra o joystick na pausa (19.3, layout A tem joystick na pausa).
- Não é bug (roteiro): F3 e F4 de `marco5-r5.mjs` usam a leitura antiga de `farejo.ativo` logo após o X (leitura cedo); o reteste com polling (r6, r7) mostra F3 e F4 corretos.

- **P3 (mudo) — RESOLVIDO por decisão do Orquestrador (rodada 2 do Marco 6).** Vale o código e o GDD 19.2.3: o mudo silencia (a música continua rodando em silêncio e volta do mesmo ponto ao desmutar). O texto de AU4 no checklist foi corrigido para "a música silencia".

## Marco 6, rodada 2
- **P3 — RESOLVIDO (decisão do Orquestrador): mudo silencia.** Ver a entrada acima; o texto de AU4 no checklist segue "a música silencia".
- **P3 — R134 (ícone listado durante o fade 667×375): NÃO REPRODUZIDO VISUALMENTE.** 5 tentativas (`marco6-r3.mjs`): o gancho listou ícones no 1º quadro do fade em 1 de 5; a captura desse quadro não mostra ícone; nas demais 4 tentativas, nenhum ícone nem base durante o fade. Registro: não reproduzido. Evidência: `qa/evidencias/marco6-r2/fade-667-t1-q1.png`.
- **P3 — DS2 (medida fraca):** o tempo medido (142 ms) é até `window.__estado` existir, não até o título estar desenhado. Não confirma o limite de 4 s. Re-medir (pendência do QA, não do jogo).

## Marco 6, rodada 3
- **P1 (19.4.1, item 6; backlog 138) — PO3 CONFIRMADO: "Voltar ao título" da seleção em 667×375 invade 1 px o cartão.** Zona do canvas de 392×49 em y=280; o cartão 4 termina em y=281. Medido por `__alvosDeToque` (`qa/scripts/marco6-r3.mjs`, PO3). Toque no botão leva ao título (OK). Ação: Dev reduz 1 px ou afasta a zona (correção no backlog 138; QA não corrige).
- **P3 — observação de ordem de toques: o primeiro X (B) logo após fechar o diálogo de entrada na Hall foi ignorado em 1 de 3 tentativas** (seta só apareceu no 2º B; `qa/scripts/marco6-r4.mjs`, F9). Não reproduzido de forma firme; registrar. Dev confirma se o B tem janela de bloqueio após o diálogo.
- **P2 — DS2 depende de compressão:** sem gzip, o HTML de 1,6 MB leva ~9,4 s no título com Fast 4G emulado (qa/scripts/marco6-r3b.mjs); com gzip (727 KB), o título desenhado sai em ~3,9 s (marco6-r3c.mjs), no limite de 4 s. GitHub Pages comprime; o HTML do build de release precisa ser servido com gzip para passar. Se o Pages não comprimir, reprova DS2. Ação: confirmar na release (RL5) e medir de novo no Pages.
- **Não é bug (roteiro):** RM2-d e RM2-e falharam em `marco5-r8.mjs` por rota após as luzes; com a rota certa (`marco5-final-pecas.mjs`), os avisos "Agora a árvore tem 1 parte. Faltam 2 partes!" e "Agora a árvore tem 2 partes. Falta 1 parte!" aparecem nos dois sobrinhos.
- **Não reproduzido (R134/P3):** o ícone listado no fade 667×375 segue sem aparecer em captura (rodada 2).
- **BUG-M2-05 — NÃO REPRODUZIDO (rodada 3 do Marco 6).** Com Nick acordado no Quarto (chegada (0,6) pela P2), B mostra a seta sobre P2 "esquerda" (`porta.id=P2`); na captura `qa/evidencias/marco6-r3/BUG-M2-05-quarto-seta.png` a seta está no tile (0,7), o gatilho, logo abaixo da chegada (conta pelo tile de 58 px: sobrinho em (4,4), seta em (0,7)). Fechar como não reproduzido; a captura antiga (marco2-r3) pode ter sido de outra escala.
- **BUG-M2-02 (P2 e P1 sem texto lido): ainda "a confirmar".** Não foi tratado nesta rodada; fica aberto para PO4 (19.4.1 item 3).
- **P2 — DS2 sem gzip (repetido 3×): 9,4 s; com gzip: 3,9 s.** Ver a entrada acima (Pages comprime; conferir na RL5).
- **BUG-M2-02 — NÃO REPRODUZIDO (Marco 6, rodada 4).** P1 e P2 mostram "Essa porta está fechada. Hoje não dá para entrar." ao Z, quando o sobrinho está de frente (`qa/scripts/marco6-r4-m2-02.mjs`). A leitura antiga falhava por posição.
- **PO3 — FECHADO (corrigido pelo Dev).** "Voltar ao título" da seleção em 667×375 começa na base dos cartões (y 281,3), sem invadir, 392×49, toque leva ao título (rodada 4).
- **P3 do primeiro B após diálogo (Hall) — NÃO REPRODUZIDO**: 0 de 10 (rodada 4).

## Marco 6, rodada 5
- **P2 (candidato, AC4 pisca) — área animada no Hall a ~20 mudanças de quadro por segundo.** Entre quadros de 50 ms, só muda a caixa x 230..249, y 132..155 (canvas 480 px) no Hall (`qa/scripts/marco6-r5-pisca.mjs` e `-diag.mjs`). Pode ser um sprite de pisca (AC4 limita a 3 ciclos/s). Confirmar com o Dev/Arte o que é e a frequência; se for o brilho do bilhete ou da porta, é P2 pelo AC4.
- **P3 (gancho, R134) — ícones listados no 1º quadro do fade em 10 de 10 tentativas (667×375); a captura do mesmo quadro não mostra ícones.** `qa/scripts/marco6-r5-fade.mjs`, capturas `qa/evidencias/marco6-r5/t*-fade-q1.png`. Não é defeito visível; o gancho lista antes da remoção. Dev confirma.
- **P3 (roteiro) — o fluxo combinado (`marco6-r4-fluxo.mjs`) falhou em pausa no Escritório e em créditos porque o próprio roteiro pressionou Z demais.** Com o roteiro corrigido (`marco6-r5-pausa-escritorio.mjs`), a pausa abre no Escritório. Não é bug do jogo.
- **BUG-M2-03 (passos da condução E7/E20) — medido agora:** E7 (peça 2, Cozinha → Sala) = 10 passos (4 sobrinhos); E20 (peça 3, Cozinha → Sala) = 14 passos (4 sobrinhos). Pelo GDD 15.10 atual: E7 "cerca de 12 a 13", E20 "cerca de 17 a 18". Divergência: 2 e 3 passos. Medida: `qa/scripts/marco6-r5-rota.mjs`, saída `qa/evidencias/marco6-r5-rota.txt`. Produto ajusta o GDD à rota medida (19.11 l) ou o Dev revisa a rota (ADR-004 11.2).

## Marco 6, rodada 6
- **P3 (candidato) — P não abre a pausa na Sala logo depois das luzes (condução concluída), em 2 de 2 execuções do fluxo combinado (`qa/scripts/marco6-r6-fluxo.mjs`).** Após teleporte para a Sala, P abre (PS1). A causa não foi isolada (estado de transição após o diálogo das luzes?). Confirmar com captura do estado antes e depois do P; se for real, é P2 pela PS1.
- **PO5 / item 133 — número ao vivo:** da peça 2 (pegar em (3,1) da Cozinha) à árvore: 11 trocas de tile amostradas a 60 ms; o trecho até a porta é o único que o gancho não amostra bem (mapa nulo durante a passagem). Declarado pelo Produto: 13 (E7) e 17 (E20). A medida de 10 e 14 cobria só a condução depois da porta. Resultado: bate dentro da resolução do gancho para o trecho amostrado; não bate exato sem contagem por evento. Pendência menor (QA/Dev).

## Marco 6 — fechamento do item 137 (v0.11.0)
- **P na Sala logo depois das luzes (candidato P3 da rodada 6): FECHADO como comportamento por projeto (decisão do Orquestrador; GDD 19.3.1).** A pausa só abre quando o controle é do jogador; durante a transição das luzes a P fica sem efeito por projeto. Não é bug.
- **E7 e E20 (PO5, item 133): medidos ao vivo 10 e 14 trocas de tile após a porta, 11 da peça 2 até a árvore; o Produto declarou 13 e 17 (GDD 15.3.5, 15.10, incluindo a passagem).** Reconfirmar em PT5 ou depois, com contagem por evento se for preciso. Não bloqueia o 137.
- **Versão 0.11.0:** `comparar:capturas` apontou 5 diferenças, todas na caixa do texto da versão (x 812..841, y 11..35); baseline atualizada (ver `qa/baseline-0100/ORIGEM.txt`). Título "v0.11.0" e créditos "Versão 0.11.0" confirmados por captura (`dist-playtest/capturas/titulo.png`, `lolo-CR1-creditos-entrada.png`).
