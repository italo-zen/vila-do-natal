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
