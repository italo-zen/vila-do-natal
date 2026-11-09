# Planta real do Diretor (Tiled): inventário, riscos e plano de conversão

- **Data:** 2026-11-07
- **Autor:** Arte e Level Design
- **Status:** análise e plano. Nenhum arquivo de `src/`, `content/`, `tools/` ou `tests/` foi alterado.
- **Fonte:** `maps/casa-real/our-home.tmx` (Tiled 1.12.2, lido inteiro)
- **Relacionados:** GDD 3, 4.2, 4.3, 14.2, 14.3, 14.5, 14.7, 14.8; ADR-002 (conteúdo como dados); ADR-003 (perfil de arte, seção 5 "mapas em tiles"); backlog 020 e 014
- **Reprodução:** `python3 -I tools-arte/inventario_casa_real.py --ascii` (só biblioteca padrão, só leitura)

---

## 0. Resumo

- **Subáreas (componentes do piso): 7.** Seis cabem numa tela de 15×10 tiles. Uma não cabe: a componente que junta **Sala, Hall e Elevador** tem 12×11 tiles.
- **Tamanho da casa inteira:** 22×19 tiles (186 tiles de piso). Não cabe numa tela, o que confirma a câmera por cômodo.
- **Portas: 8** (P1 a P8). Sete são pares (14 marcadores). **P8 tem um marcador só**, sem par.
- **Bloqueantes: 33 objetos.** 21 retângulos sem nome (paredes e pilares, inferido pela forma) e 12 móveis com nome. Mais da metade das arestas não cai na grade de 32 px.
- **Escala:** o TMX usa tile de **32 px**. O perfil v1 (`gba-240x160`) usa 16 px. O mapa só carrega no perfil HD de 32 px (tela 480×320, que é exatamente 15×10 tiles de 32 px). Isso depende do item 014 (ADR-003).
- **Três bloqueios para o Diretor responder:** (1) qual é a porta do código (hipótese: P8); (2) Sala, Hall e Elevador são subáreas separadas ou uma só; (3) o que fazer com a Sala de 11 linhas.

---

## 1. Inventário medido

Coordenadas em tiles, na origem do TMX (camada infinita, pode ser negativa). O conversor deve deslocar a origem: `x + 20`, `y + 13` leva o canto superior esquerdo da casa ao (0,0).

### 1.1 Arquivo e tilesets

| Item | Medida |
|---|---|
| Mapa | `infinite="1"`, `tilewidth="32"`, `tileheight="32"`, camada `Pisos` em 5 chunks de 16×16 (x de -32 a 15, y de -16 a 15) |
| Camadas de tile | só `Pisos` (CSV, sem flip) |
| Grupos de objeto | `Portas` (30 objetos), `Nome das subareas` (9 rótulos), `Objetos da casa bloqueantes` (33) |
| Tileset 1 | `wood`, embutido, imagem `../wood 2.jpg` (512×512, 256 tiles de 32 px). **Arquivo não existe no projeto** (o caminho aponta para `maps/wood 2.jpg`). |
| Tileset 2 | `../../light wood.tsx` (firstgid 257). **Não existe.** Sem `tilecount` no TMX. |
| Tileset 3 | `../../wood.tsx` (firstgid 513). **Não existe.** Sem `tilecount` no TMX. |
| Gids usados em `Pisos` | 18 gids distintos: wood 1, 2, 3, 4, 18, 19, 20, 34, 37, 38; light wood 258, 260, 274, 277, 310, 355, 358; wood.tsx 532 |

Consequência: sem os três arquivos, o Tiled avisa de tilesets ausentes e não mostra as imagens do piso. O conversor não consegue validar os gids externos sem o `.tsx`.

### 1.2 Subáreas (componentes 4-conexos do piso)

Regra: subárea = componente de tiles não vazios de `Pisos`. Nomes associados pela posição do rótulo (centro do rótulo sobre o piso; se fora, a subárea mais próxima).

| # | Rótulo(s) | Caixa (tiles) | Tiles de piso | Cabe em 15×10? | Cabe em 15×9 (faixa da barra, GDD 14.8)? |
|---|---|---|---|---|---|
| 0 | Banheiro do Escritorio | 2×2 | 4 | sim | sim |
| 1 | Escritório | 5×7 | 17 | sim | sim |
| 2 | Cozinha e Lavanderia | 7×6 | 36 | sim | sim |
| 3 | Quarto Olivia | 4×4 | 13 | sim | sim |
| 4 | Banheiro Casal | 3×3 | 9 | sim | sim |
| **5** | **Sala, Hall, Elevador** (uma só componente) | **12×11** | 83 | **não** (11 linhas) | **não** |
| 6 | Suite Casal | 5×6 | 24 | sim | sim |

- Nenhuma subárea tem rótulo duplicado, e nenhuma está sem rótulo.
- A componente 5 tem três rótulos. Pela 8-conexão, o número de componentes continua 7: não há encostos só na diagonal.
- Os rótulos "Banheiro do Escritorio" (centro a 1,3 tile do piso) e "Elevador" (caixa parcial) foram associados pela regra de proximidade. Confirmar no Tiled.

### 1.3 Subáreas dentro da componente 5 (Sala + Hall + Elevador)

- O piso da Sala, do Hall e do Elevador é **contínuo** (linhas y=-1 e y=0 vão de x=-6 até x=1). Isso contradiz a premissa do Diretor de que "as subáreas não se conectam no piso". Só as subáreas 0 a 4 e 6 estão de fato separadas.
- Na componente, o Hall são 8 tiles: (-1..1, -1..0), mais (0,1) e (0,2). O Elevador tem só 2 tiles de piso, em (0,1) e (0,2). O rótulo "Elevador" cai em (1,1), que é vazio.
- O batente fino `obj 25` (x=-1,08 a -0,92; y -0,94 a -0,03) fica exatamente na linha entre a Sala e o Hall. O marcador P8 fica em (-2,-2), na mesma faixa. Essa é a melhor pista para o corte.

### 1.4 Portas (grupo `Portas`)

Todos os 15 marcadores P estão **fora do piso** (vazio), e nenhum cai em bloqueante. Os pares não são adjacentes: a separação mínima entre as subáreas que cada par liga é de 1 a 3 tiles de vazio.

| Porta | Liga | Marcador em (x,y), lado A | Marcador em (x,y), lado B | Vazio mínimo entre as subáreas (tiles) |
|---|---|---|---|---|
| P1 | Sala (5) ↔ Suite (6) | (-8,-1) | (-12,-3) | 1 |
| P2 | Quarto Olivia (3) ↔ Sala (5) | (-11,-5) | (-9,-2) | 3 |
| P3 | Sala (5) ↔ Escritório (1) | (-8,-3) | (-9,-5) | 2 |
| P4 | Quarto Olivia (3) ↔ Banheiro Casal (4) | (-13,-5) | (-17,-5) | 2 |
| P5 | Banheiro Casal (4) ↔ Suite (6) | (-19,-2) | (-15,-1) | 2 |
| P6 | Escritório (1) ↔ Banheiro do Escritorio (0) | (-9,-11) | (-8,-11) | 1 (célula de vazio (-9,-12) toca as duas) |
| P7 | Sala (5) ↔ Cozinha e Lavanderia (2) | (-6,-6) | (-5,-6) | 1 (células de vazio (-5,-6), (-4,-6), (-3,-6) tocam as duas) |
| **P8** | **só um marcador: (-2,-2).** Vizinho de piso da Sala a oeste, em (-3,-2); a leste é vazio, do lado do Hall | (-2,-2) | — | — |

Observações:
- **P8 é o único marcador sem par.** Pela posição (faixa do batente `obj 25`, Sala de um lado e Hall do outro), a hipótese mais forte é que seja a **porta da casa** (Hall fora, Sala dentro). Ver pergunta 1.
- **Passagens sem marcador P:** há duas células de vazio que tocam duas subáreas diferentes sem nenhum marcador: (-13,-9) e (-12,-9) (Escritório ↔ Quarto Olivia) e (-6,-12) (Banheiro do Escritorio ↔ Cozinha). Hipótese: são só paredes. Ver pergunta 9.
- **Batentes sem rótulo:** 15 retângulos finos, de 0,11 a 0,25 tile de espessura, no grupo `Portas`. Estão a 0,3 a 0,8 tile dos marcadores. Por serem finos, não entram em nenhuma regra de bloqueio (ver 1.5). Tratá-los como visual (moldura da porta) e não como bloqueio.

### 1.5 Objetos bloqueantes (grupo `Objetos da casa bloqueantes`)

Todo objeto é retângulo. Os de rotação 270,5° a 270,7° e 0,5° foram tratados com pivô no canto superior esquerdo (**convenção assumida do Tiled para retângulos; conferir visualmente no Tiled**). Texto (`Cama`, `Sofa`, `Pia`...) é só rótulo de nome. O retângulo é o bloqueio.

**Nenhum tile bloqueado cai fora do piso.** Ou seja, paredes e móveis estão todos sobre o piso.

**Arestas fora da grade:** das 252 arestas medidas, 172 estão a mais de 0,05 tile do inteiro mais próximo, e 96 estão a mais de 0,1 tile. O desvio médio é 0,114 tile (cerca de 3,6 px). As caixas não são múltiplos de 32 px (ex.: 61,16 × 60,14 px).

**Regra de conversão recomendada:**
- **Paredes e pilares (21 sem nome):** tile bloqueado se a sobreposição for ≥ 50% da área do tile. Soma: 56 tiles.
- **Móveis com nome (12):** a regra de 50% falha em 3 deles (`Cama` 79 e 80, `Sofa` 81), que dão **0 tiles**. Com "qualquer sobreposição" eles dariam 4 a 6 tiles. Recomendação: Arte alinha esses 12 móveis à grade no Tiled (cópia de trabalho) antes da conversão. Assim a regra de 50% vale para todos.

Tabela dos 12 móveis (tiles bloqueados por regra: centro | ≥50% | qualquer sobreposição):

| obj | Nome | Subárea | Caixa (tiles) | Centro | ≥50% | Qualquer |
|---|---|---|---|---|---|---|
| 79 | Cama | 1 (Escritório) | 1,69×0,59 | 0 | 0 | 6 |
| 80 | Cama | 6 (Suite) | 1,69×0,59 | 0 | 0 | 4 |
| 81 | Sofa | 5 (Sala) | 1,69×0,59 | 0 | 0 | 6 |
| 82 | Pia | 2 (Cozinha) | 1,69×0,59 | 2 | 1 | 3 |
| 83 | Fogao | 2 (Cozinha) | 0,61×1,70, rot. 270,7 | 2 | 1 | 2 |
| 84 | Forno e Geladeira | 2 (Cozinha) | 0,63×4,39, rot. 270,5 | 4 | 4 | 6 |
| 85 | Mesa | 1 (Escritório) | 0,61×2,69, rot. 270,5 | 3 | 2 | 4 |
| 86 | Pia | 4 (Banheiro Casal) | 0,60×1,27, rot. 270,5 | 2 | 0 | 2 |
| 87 | Armario | 6 (Suite) | 0,61×2,69, rot. 270,5 | 2 | 2 | 4 |
| 88 | Rack TV | 5 (Sala) | 0,61×2,69, rot. 270,5 | 2 | 2 | 4 |
| 89 | Mesa | 5 (Sala) | 0,61×2,69, rot. 270,5 | 2 | 2 | 4 |
| 90 | Bancada | 5 (Sala) | 2,69×0,61, rot. 0,5 | 3 | 3 | 3 |

Por subárea (ids de objeto; sem nome = paredes/pilares):
- 0 Banheiro do Escritorio: 45
- 1 Escritório: 46, 47, Cama 79, Mesa 85
- 2 Cozinha e Lavanderia: 36 a 44, Pia 82, Fogao 83, Forno e Geladeira 84
- 3 Quarto Olivia: 48, 50
- 4 Banheiro Casal: 51, Pia 86
- 5 Sala, Hall, Elevador: 32, 33, 34, 35, Sofa 81, Rack TV 88, Mesa 89, Bancada 90
- 6 Suite Casal: 30, 31, Cama 80, Armario 87

Sobreposições entre bloqueantes: 14 pares (ex.: Armario 87 sobre a parede 31 com 1,65 tile²). Não quebram a colisão (é união), mas o Tiled fica confuso ao editar.

### 1.6 Mapa (ASCII, saída do script)

Letra = subárea (A=0 Banheiro do Escritorio, B=1 Escritório, C=2 Cozinha e Lavanderia, D=3 Quarto Olivia, E=4 Banheiro Casal, F=5 Sala/Hall/Elevador, G=6 Suite). `#` = bloqueio (≥50% do tile) sobre o piso; `!` = bloqueio fora do piso (nenhum nesta casa); dígito = marcador P (P1 a P8), que aparece sobre o vazio. Colunas: a primeira é x=-20, a última é x=1. Linhas: y de -13 a 5.

```
 -13 ............#A........
 -12 .......#B##.AA.###CC##
 -11 .......#B##66..#CCC#C#
 -10 .......#BBBB...#C#CCC#
  -9 ...........B...#C##C..
  -8 .....D#DD..B...CC###..
  -7 .....DDDD..B...C####..
  -6 .....##DD..B..77......
  -5 EEE4...4D2.3..F###....
  -4 EE#...........FFFF....
  -3 EE#.....1...3.FF#F....
  -2 .5.....GG..2FFFF#F8...
  -1 .....5.GG...1.FFFFFFFF
   0 ....GGGG#..#FFFFFFFFFF
   1 ....##GG#..#F##FFFF.F.
   2 ....##GG#..#F##FFFF.F.
   3 ....GGGG#..#FFFFFFF...
   4 ..........FFFFFFFFFF..
   5 ..........FFFFFFFFFF..
     0987654321098765432101
```

Nenhum `!` aparece: todo bloqueio (≥50% da área do tile) cai sobre o piso. Os `#` da Sala e do Hall são paredes internas e móveis (ids 32 a 35, 81, 88 a 90), marcados pela regra de 50%.

---

## 2. Problemas e riscos

| # | Problema | Severidade | Ação proposta |
|---|---|---|---|
| R1 | **Sala, Hall e Elevador são uma só componente de piso.** A premissa "subáreas não se conectam no piso" não vale para essa parte. | Alta | Diretor decide (perguntas 2 e 3). Proposta: cortar em x=-1 (linha do batente `obj 25`). |
| R2 | **Sala com 11 linhas** (y de -5 a 5) e câmera fixa de 10 linhas. A linha y=-5 (x -6 a -3) é a única que estoura. | Alta | Ver 2.1. |
| R3 | **Escala:** o TMX tem tile de 32 px. O v1 usa 16 px (`tile` do `gba-240x160`). ADR-003 exige `tilewidth == perfil.tile`. Sem perfil de 32 px, o conversor falha na validação. Além disso, os sobrinhos atuais (16×24) ficam com meio tile de largura; a árvore atual (32×48) ocupa 1×1,5 tile. | Alta | Usar o perfil HD (tile 32, base 480×320 = 15×10 tiles de 32 px, sugestão do ADR-003). Pré-requisito: item 014 (refator) e perfil HD. Ver 2.2. |
| R4 | **Portas em vazio.** Os 15 marcadores P estão fora do piso e os pares estão a 1 a 3 tiles de vazio. Não há caminho andável entre as subáreas, e a posição exata da passagem não sai do arquivo. | Alta | Arte cria uma cópia de trabalho do TMX com os marcadores passados para o piso de cada lado (ver 3.3). Diretor aprova em imagem. |
| R5 | **P8 sem par.** Única porta com um marcador só. Hipótese: porta da casa. | Média | Pergunta 1. |
| R6 | **Tilesets ausentes:** `maps/wood 2.jpg`, `light wood.tsx`, `wood.tsx`. Sem eles, o Tiled não mostra o piso e o conversor não tem imagem. | Alta para arte, média para lógica | Diretor envia os três arquivos, ou a Arte usa placeholders (um gid = piso, outro = parede). Lógica não depende da arte (a colisão vem dos bloqueantes). |
| R7 | **Gids externos sem `tilecount`.** Não dá para validar que 358 e 532 existem. | Média | Validar quando os `.tsx` chegarem. |
| R8 | **Mapa infinito, com coordenadas negativas** (x de -20 a 1; y de -13 a 5). `interpretarMapa.ts` lê `width`/`height` do JSON e não entende chunk. | Média | O conversor normaliza a origem e gera JSON finito, por subárea (ver 3.1). |
| R9 | **Bloqueantes fora da grade** (252 arestas, 172 com desvio > 0,05 tile). | Média | Regra de 50% e alinhamento dos 12 móveis no Tiled (ver 1.5). |
| R10 | **Três móveis com 1,69×0,59 tile** (`Cama` 79 e 80, `Sofa` 81) dão 0 tiles pela regra de 50%. | Alta para jogo | Alinhar no Tiled (cópia de trabalho) ou aceitar a regra de "qualquer sobreposição" só para móveis (pergunta 10). |
| R11 | **Batentes finos** (15 retângulos de 0,11 a 0,25 tile) no grupo `Portas`. Não viram bloqueio pela regra de 50%. | Baixa | Ignorar na conversão. Exibir como moldura se o Diretor quiser. |
| R12 | **Pivô de rotação** dos 8 móveis rotacionados (270,5°) é assumido (canto superior esquerdo). | Média | Conferir no Tiled ao abrir (se o pivô for outro, a caixa muda de posição). |
| R13 | **Nomes de móvel possivelmente trocados de subárea:** `Cama` 79 cai no Escritório; `Bancada` 90 e `Mesa` 89 caem na Sala (são nomes de cozinha). | Média | Pergunta 10. |
| R14 | **Passagens sem marcador** (Escritório ↔ Quarto Olivia; Banheiro do Escritorio ↔ Cozinha). | Baixa | Pergunta 9. |
| R15 | **Nenhum objeto de jogo no TMX.** Não há spawn, interruptor, bilhete, painel da porta, árvore nem Nick. | Alta | Criar grupo `Objetos` no Tiled (ver 3.4). |
| R16 | **Engine atual não lê este formato.** `interpretarMapa.ts` espera camadas `colisao` (tile), `salas` (retângulos) e `objetos` (com `type`), com um mapa de tamanho fixo. `SalaDoMapa` é retângulo, e não há troca de mapa nem porta. `missions[].map` aceita um mapa só. | Alta | Mudança de motor (ver 3.3). Mecânica nova = item próprio, com ADR. |
| R17 | **Elevador é só 2 tiles de piso** dentro do Hall. | Baixa | Tratar como decoração do Hall, sem subárea (pergunta 2). |
| R18 | **Banheiro do Escritorio é 2×2 tiles** (4 tiles). Cabe, mas é pequeno para a câmera. | Baixa | Nenhuma ação agora. Confirmar que é o tamanho desejado. |

### 2.1 Sala com 11 linhas

Opções (da mais simples à mais cara):
- **(a) Tirar a linha y=-5 (4 tiles, x -6 a -3) do piso** no Tiled (vira vazio). A Sala passa a ter 10 linhas (y -4 a 5) e cabe em 15×10. Recomendado, se a linha for só fundo (o Diretor confirma).
- **(b) Tirar a linha y=-5 e fazer dela uma subárea de 4×1 ("corredor da cozinha")**, com porta própria para a Sala. Mais complexo, sem ganho de cômodo.
- **(c) Rolagem vertical limitada de 1 tile** só nessa subárea. Contraria o GDD 14.2 ("sem rolagem na v1"). Fica para versão futura.
- **(d) Tela maior** (15×11). Não é o caso do perfil HD proposto.

### 2.2 Escala na prática

- Com o perfil atual (16 px), o mapa real precisaria de arte de tile 16 (metade do tamanho do desenho do Diretor). Isso contraria a intenção de mais pixels do ADR-003 e o estilo do Diretor.
- Com o perfil HD (32 px), a tela é 480×320, o mapa usa 1 tile = 32 px, e as salas cabem em tiles (exceto a Sala de 11 linhas).
- Os sprites atuais dos sobrinhos (16×24) não servem ao mapa real: no tile de 32 px ficam com meio tile de largura. A arte dos sobrinhos precisa de versão HD (32×48, como a árvore). Isso é redesenho, não conversão. É a maior incerteza de custo.
- ADR-003, seção 5, pede que "cada cômodo deve medir sala × tile". Para subáreas não retangulares, essa checagem vira "a caixa da subárea cabe em `sala`". Pedir ajuste ao ADR-003 (Especialista).

---

## 3. Plano de conversão

### 3.1 Formato interno por subárea (proposta)

Uma subárea = um mapa JSON com retângulo próprio (caixa), dentro de `content/maps/casa-real/`. O `manifest.json` ganha uma entrada por subárea (ADR-002, "novo mapa = arquivos + uma linha no manifesto"). Cada subárea:

```
content/maps/casa-real/
  hall.json
  sala.json
  cozinha.json
  escritorio.json
  banheiro_escritorio.json
  quarto_olivia.json
  banheiro_casal.json
  suite_casal.json
```

Conteúdo de cada arquivo (mesmo estilo do `casa.json`, para o motor ler sem mudança de formato, exceto onde indicado):
- `tilewidth` = `perfil.tile` (32 no perfil HD). `width` e `height` = caixa da subárea (≤ 15×10).
- Camada de tile `chao`: gid do piso de cada tile da caixa; vazio = 0.
- Camada de tile `colisao`: 1 para tile vazio (fora da subárea) ou bloqueado, 0 para livre. O motor já trata qualquer valor não zero como bloqueio.
- Camada de objetos `salas`: um retângulo com o nome da subárea (compatível com `interpretarMapa.ts`).
- Camada de objetos `objetos`: spawns (`type: "spawn"`), interruptor, bilhete, árvore, painel de porta e portas (`type: "porta"`, com propriedades `destino` = id da subárea de chegada e `spawnDestino` = nome do spawn lá). Os tipos novos (`porta`, `painel`) pedem mudança de motor (item 026).
- Propriedade `escuro` no retângulo da subárea, conforme GDD 14.5 (sala e cozinha escuras até as luzes).

Manifesto (ilustração):
```json
{ "id": "sala", "file": "maps/casa-real/sala.json", "tileset": "piso_casa", "rooms": ["sala"] }
```

Problema: `missions[].map` é um id só. Marco 1 usa três subáreas. Mudar o campo para aceitar uma lista é mudança de contrato (ADR-002, versão menor) e cabe ao Dev junto com o motor.

### 3.2 Conversor tmx → content (proposta)

Script em `tools-arte/tmx_para_conteudo.py` (biblioteca padrão, como o inventário), determinístico, com saída comparada por "golden file". Passos:
1. Ler o TMX. Ler chunks. Validar `tilewidth` contra o perfil.
2. Normalizar a origem (x + 20, y + 13).
3. Para cada subárea (componente): caixa, `chao`, `colisao` pela regra de 50%.
4. Para cada porta: marcador do lado A vira objeto `porta` no piso de A (ver 3.3); marcador do lado B vira `spawnDestino`.
5. Gerar as oito subáreas e o trecho de manifesto.
6. Recusar a conversão (erro claro) se: uma subárea passa de 15×10; um gid não existe no tileset; uma porta não tem par (exceto P8, que é marcada como "porta da casa", a confirmar); um spawn cai fora do piso.

Entrada: o TMX de trabalho (ver 3.3, item 1). Saída: `content/maps/casa-real/*.json`. Execução: `npm run gen:conteudo` ou um comando novo do Generalista (pipeline).

### 3.3 Como carrega, como as portas viram transições

Hoje o motor carrega um mapa só (`startMap`, `missions[].map`) e não tem transição. Para a planta real:
1. **Carregar uma subárea por vez.** Ao entrar numa porta, o motor descarta a subárea atual e carrega a de destino. A câmera fica fixa no retângulo da subárea (sem rolagem).
2. **Passagem comum (P1 a P7) = gatilho de um tile andável.** Ao andar sobre o tile de passagem do lado A, o motor carrega B e posiciona o jogador em `spawnDestino` (de frente para dentro de B).
3. **Problema real:** os marcadores estão no vazio. Sem um tile andável de cada lado, o jogador nunca alcança o gatilho. Solução proposta: **a Arte faz uma cópia de trabalho do TMX** (`maps/casa-real/our-home-jogo.tmx`, o original do Diretor fica intacto) com cada marcador P movido para o piso de seu lado, encostado no vão. O original fica como referência.
4. **Porta da casa (P8) = bloqueio interagível.** Enquanto o código não estiver certo, o tile da porta é bloqueio. A (GDD 4.2 e 14.1) na frente dela abre o painel (objeto `painel`, sobre P8). Com o código certo, o vão fica livre e cruzar leva à Sala. Pela geometria atual, P8 (-2,-2) não tem piso andável do lado do Hall; o vão provável é entre (-1,-1) (Hall) e (-2,-1) (Sala). A Arte confirma no Tiled. A tela do painel e a validação do código já existem (item 007); falta o objeto no mapa.
5. **Portas trancadas no Marco 1:** as portas que levam a subáreas fechadas (P1, P2, P3, P4, P5, P6) não entram na conversão do Marco 1. Sem porta, sem gatilho, e a parede é o vazio. Isso dispensa mecânica de "porta trancada" no Marco 1.

Mudanças de motor (todas Dev, com ADR próprio para as duas primeiras):
- Carregar mapa por subárea e trocar de mapa com estado (posição, direção, luzes).
- Gatilho de porta com destino e spawn.
- Validação: todo `destino` e todo `spawnDestino` existem (em `validarConteudo`, teste automatizado).
- `missions[].map` aceitar várias subáreas (ou uma lista de mapas por missão).

### 3.4 Objetos do Marco 1 na cópia de trabalho (atualizado em 2026-11-08, item 024)

Fonte: `maps/casa-real/our-home-jogo.tmx`. Coordenadas no TMX original (origem da casa = (-20, -13); o conversor normaliza). Cada item está como ficou na cópia; a regra vem de `docs/conversor-tmx.md` seção 7 e ADR-004 seção 6.

| Item | Subárea | Tile (TMX) | Classe / grupo | Regra e origem |
|---|---|---|---|---|
| Spawn de introdução `elevador` | hall | (0, 2), direção `cima` | spawn | Elevador, bloco mais distante da P8 (decisão 7) |
| Gatilho P8 (lado do Hall) | hall | (-1, -1), `trancadaAte = porta` | Portas | Par com P8 da Sala; vão em (-2, -1) |
| Gatilho P8 (lado da Sala) | sala | (-3, -1), `trancadaAte = porta` | Portas | Idem |
| Spawn de chegada P8 (Sala) | sala | (-4, -1), `esquerda`, gerado | — | `G_B + (G_B − V)`, ADR-004 seção 3 |
| Spawn de chegada P8 (Hall) | hall | (0, -1), `direita`, gerado | — | Idem |
| Bilhete | hall | (-1, 0), texto `bilhete.pista` | bilhete | Piso encostado na P8, abaixo do gatilho (decisão 6) |
| Gatilho P7 (lado da Sala) | sala | (-5, -5) | Portas | Linha de cima da Sala (GDD 14.10.1) |
| Gatilho P7 (lado da Cozinha) | cozinha | (-5, -7) | Portas | Vão em (-5, -6) |
| Spawn de chegada P7 (Cozinha) | cozinha | (-5, -8), `cima`, gerado | — | Idem |
| Spawn de chegada P7 (Sala) | sala | (-5, -4), `baixo`, gerado | — | Idem |
| Porta fechada P1 | sala | marca (-8, -1), `fechada = true` | Portas | Parede oeste; vizinho livre (-8, 0) |
| Porta fechada P2 | sala | marca (-9, -2), `fechada = true` | Portas | Fora do piso, dentro da caixa (ADR-004 seção 2) |
| Porta fechada P3 | sala | marca (-8, -3), `fechada = true` | Portas | Parede oeste |
| Interruptor | sala | (-8, 0) | interruptor | Ao lado da P1; 4,12 tiles do spawn P8 (decisão 5; ADR-004 seção 8, regra 11) |
| Árvore desmontada | sala | (-2, 2), `estado = desmontada` | arvore | Bloco mais à direita, 4ª linha de baixo para cima (decisão 4) |
| Spawn `ao-lado-da-arvore` | sala | (-3, 2), `direita` | spawn | GDD 14.10.2, item 6 |
| Pia | cozinha | (-4, -12), tile do móvel com vizinho livre | examinavel, texto `cozinha.pia` | Decisão 5; GDD 14.10.4 |
| Fogão | cozinha | (-5, -10), `cozinha.fogao` | examinavel | Idem |
| Geladeira | cozinha | (-3, -9), `cozinha.geladeira` | examinavel | Idem (tile do conjunto Forno e Geladeira) |
| Lavanderia | cozinha | sem objeto | — | Decisão 5 |
| Peças da árvore, caixa, Nick | — | fora do Marco 1 | — | Marcos 2 e 3 |

Fora da cópia do Marco 1: P4, P5 e P6 (entre áreas fechadas). Continuam no `our-home.tmx` original, onde ficam na posição do Diretor. Ver 3.5.

### 3.5 Subáreas e portas do Marco 1 (atualizado em 2026-11-08)

- **Abertas no Marco 1:** `hall` (com Elevador), `sala`, `cozinha` (com Lavanderia), conforme a decisão 8. Estão em `missions[].maps` (a ser escrito pelo Produto e Dev).
- **Fechadas, sem porta de par:** `escritorio`, `banheiro_escritorio`, `quarto`, `banheiro_casal`, `suite_casal`. Continuam no conteúdo (ADR-004 seção 9).
- **Portas no Marco 1:**
  - P8 (Hall ↔ Sala) e P7 (Sala ↔ Cozinha): pares com vão de 1 tile, como o ADR-004 seção 3 exige.
  - P1, P2 e P3: portas fechadas, com diálogo de A (`porta.fechada`), sem transição.
  - P4, P5 e P6: fora da cópia (ver abaixo).
- **Escuro:** `sala` e `cozinha` (rótulo, propriedade `escuro`). `hall` é claro.
- **Tamanho:** `sala` 10×11 (a Sala não muda de tamanho), `hall` 3×4, `cozinha` 7×6. Tudo cabe em 15×11.

### 3.5.1 O que mudou na cópia de trabalho (item 024)

Cópia: `maps/casa-real/our-home-jogo.tmx`. O original `our-home.tmx` não foi editado. Mudanças, com o motivo:

1. **Piso.** Retirados (-2, -1) e (-2, 0). O primeiro é o vão de 1 tile da P8 (decisão 3). O segundo fecha o outro ponto em que Sala e Hall se encostavam (linha 0). Resultado: 8 componentes de piso, Sala e Hall separados.
2. **Tilesets.** Os três do original (`wood`, `light wood.tsx`, `wood.tsx`) viram um só, `tiles_casa`, com `firstgid` 1 e `tilecount` 532 (maior gid usado). Os gids não mudam. Não há imagem: é placeholder até a Arte entregar o tileset real (item 023).
3. **Rótulos.** Grupo renomeado para `Rótulos das subáreas`. Cada rótulo tem `id` e `escuro`. O rótulo do Elevador foi retirado (o Elevador é do Hall). Os centros foram movidos para o piso da própria subárea. O `id` de Quarto Olivia é `quarto`, e não `quarto_olivia` como sugere o contrato: o nome de pessoa não entra em `content/` (GDD 14.10.6). Pelo mesmo motivo, os nomes de arquivo usam só o cômodo.
4. **Portas.** Os marcadores antigos foram removidos e recolocados (ver 3.4). P4, P5 e P6 saíram da cópia. P2 e P3 viraram portas fechadas (a planta tinha vão de 3 e 2 tiles; o contrato exige marca simples para porta fechada).
5. **Móveis na grade.** Os 12 móveis nomeados foram alinhados a tiles inteiros, com rotação zerada. Cama 79 e 80 e Sofá 81 passaram a bloquear tiles (E011).
6. **Parede da Sala (linha -5).** Encurtada de 3 para 2 tiles (x de -5..-3 para -4..-3), para liberar (-5, -5) para a P7.
7. **Estante (ex-"Bancada", objeto 90).** Renomeada conforme a decisão do Diretor. Encurtada de 3 para 2 tiles (x de -4 a -2) pelo mesmo motivo da parede: cobria (-5, -5) pela regra de 50%. Ajuste de Arte; o Diretor confirma.
8. **Objetos de jogo.** Grupo novo com a classe no atributo `class`. Ver 3.4.

### 3.5.2 Pendências abertas (não bloqueiam a conversão)

- **Textos ausentes em `content/texts/pt-BR.json`:** `bilhete.pista`, `porta.fechada`, `cozinha.pia`, `cozinha.fogao`, `cozinha.geladeira`. O conversor não confere chaves de texto (é trabalho de `validarConteudo`). Produto ou Dev adicionam os textos de GDD 14.10.3 e 14.10.4.
- **P4, P5 e P6 fora da cópia:** entre áreas fechadas, sem vão alinhado com piso livre dos dois lados. Entram quando as áreas abrirem (versão 1.x).
- **Manifesto:** `content/manifest.json` não foi alterado. As entradas novas (`id`, `file`, `tileset`) ainda não passam no validador atual, que exige `rooms`. Entram com o item 026 (ADR-002 schema 2).
- **Perfil ativo:** o manifesto aponta para `gba-240x160` (tile 16). O conversor usa `--perfil hd-480x352` (padrão) e recusa a planta com o perfil v1 (E001). O `hd-480x352.json` foi criado a partir do ADR-003 seção 1.1, sem ativar.
- **Última linha da tela (ADR-004 seção 8, regra 6):** é checada por `validarConteudo` (Dev), não pelo conversor. Nenhum objeto da cópia está na última linha da sala.

### 3.5.3 Como rodar o conversor

```
python3 tools-arte/tmx_para_conteudo.py                 # grava content/maps/casa-real/*.json
python3 tools-arte/tmx_para_conteudo.py --atualizar-golden   # também grava tools-arte/golden/casa-real/
python3 tools-arte/tmx_para_conteudo.py --verificar     # não grava; sai com 1 se difere do content e do golden
```

O golden (`resumo.json` e `<id>.txt`) é a revisão visual da planta: o diff dos `.txt` mostra a mudança de forma.

### 3.6 Itens de backlog derivados (IDs propostos a partir de 022)

Para o orquestrador registrar em `backlog.md`. O item 020 já existe ("aguarda arquivo do Diretor"); o arquivo chegou, então 020 passa a "em análise" e depende de 014 e dos itens abaixo.

| ID | Item | Dono | Depende de | Estimativa (dias de trabalho) |
|---|---|---|---|---|
| 022 | Respostas do Diretor às perguntas 1 a 10 (registrar em `decisions.md`) | Diretor; Produto registra | — | — |
| 023 | Tilesets reais (`wood 2.jpg`, `light wood.tsx`, `wood.tsx`) enviados pelo Diretor, ou placeholders | Diretor; Arte | — | 0 (se placeholder) |
| 024 | Cópia de trabalho do TMX (`our-home-jogo.tmx`): marcadores de porta no piso, objetos de jogo, móveis alinhados à grade, linha y=-5 conforme resposta | Arte | 022, 023 | 0,5 a 1 |
| 025 | Conversor `tools-arte/tmx_para_conteudo.py` + golden file + validação de tile/caixa/gid | Arte (script); Generalista (comando npm) | 024 | 1 a 2 |
| 026 | Motor: carregar subárea por mapa, gatilho de porta com destino e spawn, câmera por subárea, `missions[].map` como lista | Dev | ADR-004 (Especialista); 014 | 3 a 5 |
| 027 | Validação de conteúdo: destinos e spawns existem; cada subárea cabe em `sala` | Dev | 025, 026 | 0,5 a 1 |
| 028 | Perfil HD (tile 32, base 480×320) = refator 014 + perfil novo + sprites HD dos sobrinhos e da árvore | Dev; Arte | 014; decisão 022 | 4 a 8 (maior incerteza: redesenho, não conversão) |
| 029 | Marco 1 com subáreas abertas (Hall, Sala, Cozinha) e fechadas (demais) | Produto (escopo); Arte (conversor) | 025 | 0,5 |
| 030 | ADR-004: mapa multi-subárea, portas e transição de cômodo | Especialista | — | 0,5 |
| 031 | Ajustar ADR-003 seção 5 ("cada cômodo deve medir sala × tile") para subárea não retangular | Especialista | 030 | 0,25 |

Atenção: 014 (refator do perfil) é pré-requisito de 020, 025 e 028. Sem o perfil de 32 px, o mapa real não carrega.

### 3.7 Estimativa

- **Sem contar espera do Diretor e sem contar arte HD:** de 8 a 12 dias de trabalho de sessão, somando 014, o conversor, o motor de portas e a validação.
- **Arte HD dos sobrinhos e da árvore (028):** é a maior incerteza. Não é conversão automática: é redesenho de 4 sobrinhos (4 × 4 estados de animação, ADR-003). Estimativa separada depois de ver o perfil HD.
- Isso é estimativa grosseira, com base neste arquivo. Refinar depois das respostas do Diretor.

---

## 4. PERGUNTA AO DIRETOR

Objetivas, com sugestão. Marcadas como (ambíguo no arquivo) quando a planta não define a resposta.

1. **Qual porta é a porta com o código?** (ambíguo no arquivo) Sugestão: **P8**. É a única porta com um marcador só, fica na linha do batente que separa a Sala do Hall, e é a porta da casa para quem vem de fora.
2. **Hall e Elevador são subáreas separadas da Sala, ou partes de uma só?** (ambíguo: o piso é contínuo entre Sala, Hall e Elevador.) Sugestão: **separadas, com corte entre x=-2 e x=-1, na altura do batente `obj 25`**. O Hall (8 tiles) é o cenário da introdução. O Elevador (2 tiles) vira decoração do Hall, sem subárea própria.
3. **A linha y=-5 da Sala (4 tiles, x de -6 a -3) é da Sala ou é só fundo?** (ambíguo: a Sala tem 11 linhas e a tela cabe 10.) Sugestão: **fundo** (tirar do piso, vira vazio). A Sala fica com 10 linhas (y de -4 a 5). Se for parte da Sala, a alternativa é uma subárea de corredor de 4×1 (ver 2.1, opção b).
4. **Onde fica a árvore desmontada?** (ambíguo: não há objeto no TMX.) Sugestão: **Sala, célula (-4,0)**, livre de móveis, no centro-direita da sala. Nascer após as luzes: **célula (-5,0)**, 1 tile à esquerda da árvore, de frente para ela.
5. **Onde fica o interruptor, e qual é a distância de referência?** (ambíguo no GDD 14.3: "8 tiles", sem dizer se é em linha reta ou andando.) Sugestão: **parede oeste da Sala, no canto sul, em (-10,4) ou (-10,5)**, e medir a distância **andando** (em linha reta a partir da entrada a Sala só chega a 7 tiles).
6. **Onde fica o bilhete?** Sugestão: **Hall, no tile de piso (-1,-1), encostado na porta P8**, com a arte colocando o bilhete na parede ao lado.
7. **Onde o jogador nasce na introdução e ao entrar na casa?** Sugestão: **introdução: Hall, (1,-1), de frente para a porta** (3 tiles, conforme GDD 14.2). **Entrada na casa (depois do código): Sala, (-3,-2), de frente para dentro.**
8. **Quais subáreas ficam abertas no Marco 1?** Sugestão: **Hall (com Elevador), Sala, Cozinha e Lavanderia**. As outras cinco ficam sem porta até uma versão futura.
9. **As duas passagens sem marcador (Escritório ↔ Quarto Olivia em (-13,-9)/(-12,-9); Banheiro do Escritorio ↔ Cozinha em (-6,-12)) são portas ou paredes?** Sugestão: **paredes**. Não criar porta.
10. **Os móveis `Cama` (79, no Escritório), `Bancada` (90) e `Mesa` (89) (na Sala) estão nos cômodos certos?** (ambíguo: nomes de cozinha e de quarto caem em outras subáreas.) Sugestão: **Cama 79 vai para o Quarto Olivia** (se o Escritório não tiver cama), **Bancada e Mesa 89 ficam na Sala** se a sala tiver mesa de jantar, e a Arte alinha os móveis à grade.
11. **Aprovar o perfil HD (32 px, tela 480×320) como destino do mapa real?** Sugestão: **sim**. O mapa real só carrega nesse perfil. O v1 (16 px) segue como está até o refator 014. (Decisão de arte, cabe ao Diretor.)
12. **Enviar os tilesets** (`maps/wood 2.jpg`, `light wood.tsx`, `wood.tsx`), ou aceitar placeholders da Arte? Sugestão: **enviar** (a Arte usa os arquivos reais; placeholder só se o prazo apertar).

---

## 5. O que ficou ambíguo no arquivo

- **Sala + Hall + Elevador como uma componente** (perguntas 2 e 3).
- **Porta da casa:** a planta não diz qual porta é (pergunta 1).
- **Marcadores P no vazio:** não há como saber o tile de passagem exato sem a Arte desenhar a cópia de trabalho (pergunta 12 e item 024).
- **Passagens sem marcador:** duas células de vazio que tocam subáreas diferentes (pergunta 9).
- **Pivô de rotação** dos 8 móveis (R12).
- **Nomes dos móveis:** `Cama` no Escritório, `Bancada` e `Mesa` na Sala (pergunta 10).
- **Batentes finos** no grupo `Portas`: função não declarada (moldura ou bloqueio parcial).
- **Blocos "Cama" e "Sofa" com 1,69×0,59 tile:** a regra de bloqueio não tem resposta limpa (R10).
- **Sem objetos de jogo** (spawn, interruptor, bilhete, árvore, painel, Nick): nenhum está no arquivo (R15).
- **Tilesets referenciados e ausentes** (R6, R7).
- **Distância de 8 tiles do interruptor:** métrica não definida (pergunta 5).

---

## 6. Números principais

- Subáreas: **7** (6 cabem em 15×10; 1 não cabe: 12×11).
- Tiles de piso: **186**. Casa inteira: **22×19** tiles.
- Portas: **8** (7 pares = 14 marcadores, mais P8 = 1 marcador). Batentes finos sem rótulo: **15**.
- Bloqueantes: **33** (21 sem nome, 12 com nome de móvel). Arestas fora da grade: **172 de 252**.
- Itens de backlog propostos: **022 a 031** (10 itens).


## 7. Indicadores de porta na planta girada (item 046, PT2b)

- **Data:** 2026-11-08 (revisado após GDD 14.10.10, regra do Produto)
- **Autor:** Arte e Level Design
- **Origem:** retorno do Diretor no PT2b (`playtests.md`); referências `assets/referencia/ref_porta_seta.webp` e `ref_saida_tapete.webp`; regra em GDD 14.10.10.
- **Regra (GDD 14.10.10):** pela direção de saída. Saída para a direita/esquerda: seta branca sobre o tile da porta. Saída para baixo: tapete no tile de chão à frente da porta, do lado de dentro da área (não gatilho, não vão). Saída para cima: nenhum. Estático, só desenho, sem colisão.
- **Sprites:** `assets/hd-480x352/spr_indicador_seta_direita.png`, `spr_indicador_seta_esquerda.png`, `spr_indicador_seta_baixo.png`, `spr_indicador_tapete.png` (32×32; gerador `tools-arte/gerar_placeholders_hd.py`).
- **Prévia:** `tools-arte/previews/indicadores-sala.png`, `indicadores-hall.png`, `indicadores-cozinha.png` (tela de 15×11 tiles; `tools-arte/preview_indicadores.py`).

### 7.1 Tabela do Marco 1

Tile do conteúdo (`content/maps/casa-real/*.json`, girado) e tile da tela (Sala (2, 0), Hall (5, 4), Cozinha (4, 2); golden/casa-real/resumo.json).

| Porta | Área | Tile do conteúdo | Saída | Indicador | Tile da tela |
|---|---|---|---|---|---|
| P1 | Sala | (6, 2) | esquerda (porta lateral, fechada) | `spr_indicador_seta_esquerda` sobre o tile da porta | (8, 2) |
| P2 | Sala | (7, 1) | cima | nenhum | — |
| P3 | Sala | (8, 2) | direita (porta lateral, fechada) | `spr_indicador_seta_direita` sobre o tile da porta | (10, 2) |
| P7 (Sala) | Sala | (10, 5) | direita | `spr_indicador_seta_direita` sobre o tile | (12, 5) |
| P7 (Cozinha) | Cozinha e Lavanderia | (0, 0) | esquerda | `spr_indicador_seta_esquerda` sobre o tile | (4, 2) |
| P8 (vista da Sala) | Sala | gatilho (6, 7); vão (6, 8) | baixo | `spr_indicador_tapete` no tile do vão, fora do piso (pedido do Diretor) | (8, 8) |
| P8 (vista do Hall) | Hall | gatilho (3, 0); vão (3, −1) | cima | nenhum | — |

- O tapete fica no tile do vão (6, 8), abaixo do gatilho (6, 7), fora da área do piso, para indicar a saída. A porta `spr_porta` é desenhada por cima do tapete. O gatilho (6, 7) e o chão de chegada (6, 6) não recebem nada.
- P2 fica sem indicador (porta para cima). P1 e P3 têm seta, pela regra de porta lateral aprovada pelo Diretor, inclusive fechadas. Desenham-se com `spr_porta_vertical` (parede vertical) e P2 com `spr_porta`.
- P4, P5 e P6 estão fora do Marco 1 e não têm objeto no conteúdo. Quando entrarem, a mesma regra se aplica.

### 7.2 Pontos para conferir

- **Tapete no vão (pedido do Diretor):** o GDD 14.10.10 dizia "não ocupa o vão"; o Diretor pediu o vão. O GDD precisa ser atualizado pelo Produto. O sprite agora cobre quase o tile inteiro (32×32, linhas 4 a 31).
- **Seta em porta lateral fechada:** o Diretor aprovou a seta na P7 como referência para todas as portas laterais, inclusive fechadas (P1 e P3). P1 aponta para a esquerda e P3 para a direita.
- **Captura C20 a C22** precisa ser aprovada pelo Diretor antes de republicar (regra de 2026-11-08).
- **Seta para baixo** (`spr_indicador_seta_baixo.png`) não é usada no Marco 1; fica para mapas futuros, como alternativa ao tapete.

---

## 8. Marco 2 na cópia de trabalho (item 049, 059, 050; 2026-11-08)

- **Data:** 2026-11-08
- **Autor:** Arte e Level Design
- **Status:** cópia de trabalho alterada (`maps/casa-real/our-home-jogo.tmx`); `content/` e golden regenerados; **P2 entrou** (2026-11-08, Diretor: "não altere a área; se necessário, aumente um tile nos cômodos para a P2 existir"; seção 8.4). Nenhum tile foi tirado da Suíte nem da Sala. O original `our-home.tmx` não foi editado. Nenhum arquivo de `src/`, `tests/`, `qa/`, GDD, backlog ou ADR foi alterado.
- **Coordenadas:** "TMX" = a cópia de trabalho, na orientação atual. "Girada" = a planta girada do conteúdo (GDD 14.12), absoluta (antes de subtrair a origem da casa, golden `origemDaCasa`). Conversão: girada `(X, Y)` = TMX `(−y−1, x)`; inversa: TMX `(x, y)` = girada `(Y, −X−1)`. Coordenadas locais de cada subárea: o `deslocamento` do golden.

### 8.1 O que mudou na cópia de trabalho

| Item | TMX | Girada (abs.) | Local da subárea (conteúdo) | Motivo |
|---|---|---|---|---|
| P3, gatilho da Sala | (-8,-3), piso gid 538 | (2,-8) | Sala (8,2) | Par com o Escritório, vão de 1 tile (GDD 15.3.3). Passagem em parede vertical, como a P7 |
| P3, vão | (-8,-4), sem piso | (3,-8) | — | Vão de 1 tile, não andável |
| P3, gatilho do Escritório | (-8,-5), piso gid 538 | (4,-8) | Escritório (0,5) | Idem |
| P3, chegada do Escritório | (-8,-6), piso gid 310 | (5,-8) | Escritório (1,5) | Chegada G + (G − V), direção `direita` |
| P1 | (-8,-1) (marca não mudou) | (0,-8) | Sala (6,2) | Recebeu só `saida = esquerda` (seta 046). Posição e `fechada` iguais |
| P2, gatilho da Sala | (-9,-2) (marca não mudou; virou par, piso novo) | (1,-9) | Sala (7,1) | Par com o Quarto, vão de 1 tile em (2,-9). Saída `direita`. Tile novo de piso (seção 8.4) |
| P2, vão | (-9,-3), sem piso | (2,-9) | — | Vão de 1 tile, não andável |
| P2, gatilho do Quarto | (-9,-4), piso novo | (3,-9) | Quarto (0,7) | Saída `esquerda` |
| P2, chegada da Sala | (-8,-2), piso (já existia), spawn `chegada = P2` | (1,-8) | Sala (7,2) | Declarada; direção `baixo` (para dentro da Sala). Coincide com a chegada de P3 (permitido, ADR-004 13.9, item 6) |
| P2, chegada do Quarto | (-10,-4), piso novo, spawn `chegada = P2` | (3,-10) | Quarto (0,6) | Declarada; direção `cima` (para dentro do Quarto) |
| P4 (nova) | (-16,-7), `fechada`, `saida = cima` | (6,-16) | Quarto (2,0) | Parede de cima do Quarto, lado do Banheiro Casal (seção 8.3) |
| P6 (nova) | (-9,-11), `fechada`, `saida = direita` | (10,-9) | Escritório (6,4) | Parede da direita da ponta do corredor, lado do Banheiro do Escritório (seção 8.3) |
| Peça 1 | (-6,4), `visivel` | (-5,-6) | Sala (1,4) | GDD 15.2.2 |
| Peça 2 | (-4,-11), `escondida` | (10,-4) | Cozinha e Lavanderia (4,1) | GDD 15.2.2; ao lado da Pia (5,1) |
| Peça 3 | (0,-10), `escondida` | (9,0) | Cozinha e Lavanderia (3,5) | GDD 15.2.2; na Lavanderia (pergunta 27) |

- Objetos `peca` são `<text>` no grupo `Objetos de jogo`, com `class="peca"`, texto = ordem e propriedade `estadoInicial` (contrato, seção 2.3).
- A propriedade `saida` (cima, baixo, esquerda, direita) é a direção de **saída** da porta fechada, do lado de dentro da área (GDD 14.10.10). É obrigatória em toda marca `fechada` (E014 se faltar). Dá a seta (lateral) ou nada (cima).
- **Subáreas:** Sala 11×10 (74 tiles de piso, era 73; o tile novo é o gatilho da P3). Escritório passa de 7×5 para **8×6** (a caixa inclui o gatilho da P3 em (4,-8) e a ponta da P6). Quarto passa de 4×4 para **4×5** (a caixa inclui a P4). Cozinha, Hall, banheiros e Suíte não mudaram de tamanho.
- **W001 (esperado):** Sala com o piso do Escritório em (4,-8) (gatilho da P3 do lado do Escritório, dentro da caixa da Sala); Escritório com o piso do Quarto (4..7,-12..-13) e o do banheiro (11,-8) dentro da caixa. Não é erro.

### 8.2 Lado das portas finas (regra para a arte e para o motor)

Regra (GDD 14.10.9, regra de arestas): a faixa fica **na aresta entre o tile da porta e o chão de dentro**. Como a porta fechada é um tile sem piso (ou bloqueado), a aresta é a voltada para o lado de dentro, que é o oposto de `saida`.

| Porta | Tipo | `saida` | Aresta da faixa | Sprite (`assets/hd-480x352`) |
|---|---|---|---|---|
| P1 | fechada, Sala (0,-8) girada | esquerda | direita do tile | `spr_porta_vertical` |
| P2 | par, Sala (1,-9) girada (gatilho) | direita | sem faixa: a passagem é o tile; seta na Sala (direita) | — |
| P2 | par, Quarto (3,-9) girada (gatilho) | esquerda | sem faixa; seta no Quarto (esquerda) | — |
| P4 | fechada, Quarto (6,-16) girada | cima | baixo do tile | `spr_porta` |
| P6 | fechada, Escritório (10,-9) girada | direita | esquerda do tile | `spr_porta_vertical` |
| P3 | par (passagem) | — | sem faixa: o tile é a passagem (gid 538). Seta na Sala (direita) e no Escritório (esquerda) | — |
| P8 (trancada, vista da Sala) | porta no vão (6,8) | baixo | cima do vão (encosta no gatilho) | `spr_porta` |

- **Como o motor deve posicionar (PARA O DEV):** o sprite é 32×32 com a faixa centrada no meio do canvas (linhas 12 a 19 para `spr_porta`; colunas 12 a 19 para `spr_porta_vertical`). Posicione o **centro** do sprite na aresta: origem `(0,5)`, em `(x + 16, y)` para aresta de cima, `(x + 16, y + 32)` de baixo, `(x, y + 16)` da esquerda, `(x + 32, y + 16)` da direita.
- Indicadores (046, GDD 14.10.10): seta sobre o tile da porta quando a saída é lateral; tapete no vão quando a saída é para baixo; nada quando é para cima. Não mudaram.

### 8.3 Lados de P4 e P6 (decisão da Arte)

- **P4 (Quarto):** parede de cima do Quarto, sobre o tile livre (6,-15) girado. O Banheiro Casal fica acima (girado). Saída `cima`: sem seta, como GDD 15.3.3.
- **P6 (Escritório):** parede da direita da ponta do corredor, sobre o tile livre (9,-9) girado. O Banheiro do Escritório fica à direita. Saída `direita`: seta para a direita.
- Se o Diretor preferir outro lado, muda a marca e o `saida` no TMX; o resto não muda.

### 8.4 P2 (Quarto) aberta: tiles novos, sem tirar nada

- **Decisão (Diretor, 2026-11-08, literal):** "não altere a área. Se necessário, aumente um tile nos cômodos para a P2 existir." P1, P2 (marca), Suíte, Sala, P3, P7, P8, interruptor, árvore e peças não mudam de lugar.
- **Por que esta forma:** a marca da P2 na alcova é (1,−9) girada. Pela alcova, o vão só pode ir para a direita, (2,−9), porque (1,−10) cai na Suíte em (1,−12) (a Suíte encostaria no gatilho do Quarto). A marca do Quarto fica em (3,−9), e o corredor sobe por (3,−10), (3,−11), (3,−12) até o piso do Quarto em (4,−12). Não há tile tirado.
- **Tiles novos (5), todos de piso (gid 1 de `tiles_casa`, placeholder; a Arte troca o gid no Tiled por chão de madeira quando houver o tile final):**

| Tile girado | Tile TMX | Cômodo | Papel |
|---|---|---|---|
| (1,−9) | (−9,−2) | Sala | gatilho da P2 (ponto de saída da alcova) |
| (3,−9) | (−9,−4) | Quarto | gatilho da P2 (entrada do Quarto) |
| (3,−10) | (−10,−4) | Quarto | chegada do Quarto (declarada, `cima`) |
| (3,−11) | (−11,−4) | Quarto | corredor |
| (3,−12) | (−12,−4) | Quarto | corredor; encosta em (4,−12), piso do Quarto |

- **Vão:** (2,−9) girada = (−9,−3) TMX, sem piso.
- **Chegadas declaradas nos dois lados:** Sala (1,−8), `direção baixo` (TMX `direita`); Quarto (3,−10), `direção cima` (TMX `esquerda`). Pela regra 13.14 do ADR-004, cada uma encosta no gatilho do seu lado e aponta para dentro.
- **Caixas:** Quarto 5×8 (girada X 3..7, Y −16..−9; inclui o P4 e o gatilho). Sala 11×10 (não muda). Suíte 6×5 (não muda). Tudo dentro de 15×11.
- **Conferido:** `tools-arte/tmx_para_conteudo.py --girar --verificar`, `npm run verificar:conteudo`, `npm run validar:perfil -- hd-480x352` (perfil válido), `npx vitest run` (ver PARA O DEV no relatório: o motor ainda recusa o conteúdo).
- **Limites da forma atual:** a P2 segue o padrão antigo `fechada` até o Dev ler `porta.saida` (o motor hoje deriva a saída como G − S, que dá o resultado errado para chegada lateral; ver PARA O DEV). A Sala passa a ter 2 chegadas no mesmo tile (7,2), P2 e P3, o que o ADR-004 permite.
- **Pendência para o Diretor (não bloqueia a conversão):** o Quarto ainda não está em `missions[].maps`; isso é do Produto/Dev (ADR-002 seção 2.2).

### 8.5 Arte dos sprites e conquistas (item 050)

- `spr_porta.png` e `spr_porta_vertical.png`: faixa de 8 px (seção 8.2), canvas 32×32 (o teste de `sprite-do-objeto` exige 32×32).
- `spr_arvore_1parte`, `spr_arvore_2partes`, `spr_arvore_completa`: estados 1, 2 e 3 do GDD 15.4. A base é o tronco com suporte; o meio, os ramos; o topo, a ponta. Sem enfeite (sem o dourado e as bolas vermelhas da versão anterior). `spr_arvore_desmontada` não mudou.
- `spr_peca_1`, `spr_peca_2`, `spr_peca_3`: a própria camada, em 32×32, com contorno dourado (`#f4d35e`). O halo de 15.2.4 é do motor.
- `spr_conquista_parte1..3`: as mesmas camadas em 96×96 (3×), para a tela de conquista (GDD 15.5). **O perfil não tem posição para elas** (`telas.conquista` só tem `lampada`): PARA O DEV.
- Gerador: `tools-arte/gerar_placeholders_hd.py` (regenerado; só os arquivos listados mudaram; os demais saíram byte a byte iguais).

### 8.6 Prévias (tools-arte/previews/, `tools-arte/preview_marco2.py`)

- Prévias de 2026-11-08 (após a P2): `m2-sala.png` (alcova com P1, P2, P3; peça 1 visível), `m2-quarto.png` (P2 e P4), `p2-aplicada-sala-quarto-suite.png` (Sala, Quarto e Suíte, gerada do TMX de jogo por `tools-arte/preview_p2_opcao.py`), `m2-escritorio.png` (P3 e P6), `m2-cozinha.png` (peças 2 e 3 marcadas como escondidas), `m2-mapa-girado.png` (planta inteira, peças mostradas para revisão), `m2-arvore-estados.png` (estados 0 a 3).
- Marcador magenta = peça escondida. É marcador de revisão, não existe no jogo.
- Obs.: `tools-arte/preview_indicadores.py` (046) ainda desenha o tapete da P8 no tile (6,6); a regra atual (GDD 14.10.10) é o vão (6,8). Não foi alterado nesta entrega.

### 8.7 Pendências (não bloqueiam a conversão)

- P2 e o Quarto: aberto (seção 8.4). Pendências: gid final do piso novo (5 tiles), `missions[].maps` com `quarto` (Produto/Dev), motor ler `porta.saida` e aceitar chegadas coincidentes (PARA O DEV no relatório).
- Textos e `missions[].maps`: Produto e Dev (`escritorio` e `quarto` entram quando a Suíte e a P2 forem decididas).
- Regra 11 (interruptor a mais de 3 tiles de todo spawn) e a validação de par com destino fechado: são do motor (`validarConteudo`); ver relatório.

## 9. Marco 3: tiles de dormir do Nick (item 074; 2026-11-08)

- **Fonte:** GDD 16.2.1 e 16.2.2; ADR-005 seções 2.2, 2.3, 2.6 (N004 a N009) e 7.1 (contrato da Arte).
- **Autor:** Arte e Level Design. **Status:** tiles escolhidos e conferidos. O bloco de conteúdo abaixo é para o PR do conteúdo (Dev); a Arte não o aplicou em `content/missions/`.
- **Reprodução:** `python3 -I tools-arte/checar_tiles_nick.py --escolhido sala:8,5 cozinha:5,3 quarto:4,3 escritorio:6,1` (código 0 = passa; mapa ASCII e candidatos de cada cômodo).

### 9.1 TMX: nada muda

Pelo ADR-005 (seções 2.1 e 2.7), o `nick` não vai no TMX: ele é regra de fase, e o TMX descreve subárea sem fase. Por isso `maps/casa-real/our-home-jogo.tmx` e `our-home.tmx` não foram alterados, e o conversor também não.

### 9.2 Tile de dormir por fase

| Fase (missão) | Cômodo (subárea) | Tile (x, y) | Direção | Tela (linha) | Vizinhos livres | Lado do Nick |
|---|---|---|---|---|---|---|
| Porta e luzes (`marco1`) | `sala` | (8, 5) | baixo | 5 | 3: (7,5), (8,4), (9,5) chegada da P7 | Sugestão do Produto, confirmada |
| Parte 1 (`parte1`) | `cozinha` (Cozinha e Lavanderia) | (5, 3) | baixo | 5 | 2: (4,3), (5,4) | Único tile que passa em tudo (9.4) |
| Parte 2 (`parte2`) | `quarto` | (4, 3) | baixo | 4 | 2: (3,3), (4,4) | Canto do corredor em L, longe da chegada (0,6) |
| Parte 3 (`parte3`) | `escritorio` | (6, 1) | baixo | 3 | 2: (5,1), (7,1) | Nicho ao lado da mesa, sem passagem |
| Depois da parte 3 (`parte3.depois`) | `sala` | (8, 5) | baixo | 5 | 3 | Volta para casa |

- A tela é a da subárea centralizada (ADR-005 seção 6.1): deslocamento Y de 0 na Sala, 2 na Cozinha, 1 no Quarto e 2 no Escritório. A linha de tela do Nick (última coluna da tabela) fica entre 3 e 5, sempre acima das linhas 9 e 10 da barra.
- **Lavanderia:** é a mesma subárea `cozinha` (ADR-004 seção 2; pergunta 27). Um tile só cobre Cozinha e Lavanderia, e a peça 3 (3, 5) fica a dois passos do Nick.
- **Direção:** `baixo` em todos, como no exemplo do ADR-005 (2.2). A pose de frente é a mais legível quando o Nick acorda; depois de acordado ele segue o sobrinho e vira para onde anda. O quadro de dormir é o de perfil da folha (cabeça à esquerda), igual em todos os tiles.

### 9.3 Critérios conferidos

| Critério (ADR-005) | Como foi conferido |
|---|---|
| N004: piso livre (chão ≠ 0, colisão 0) | Confere em todos os tiles |
| N005: sem objeto, chegada, gatilho, vão, interruptor, árvore, peça, bilhete, móvel, `portaFechada` e destino da condução | Confere pela ferramenta (objetos, gatilhos, chegadas e destino (3, 7)). Nenhum tile escolhido é gatilho, chegada nem o tile entre gatilho e chegada das portas do cômodo |
| N006: fora das linhas da barra (`y + deslocamentoY ≥ sala.linhas − 2`) | Linhas de tela 3 a 5 |
| N007: 2 vizinhos livres e nenhum vizinho peça | Vizinhos na tabela da 9.2 |
| N009: com o tile bloqueado, a rota de condução chega ao destino | Sala: BFS de todos os pontos essenciais até (3, 7), com o tile bloqueado, sem aumentar o caminho. Cozinha, Quarto e Escritório: o tile não está em nenhum caminho mais curto (é beco sem objeto ou tem caminho alternativo de mesmo tamanho). Verificado com a ferramenta |
| GDD 16.2.2: visível com a luz da entrada, na Sala | (8, 5) está a 2,2 tiles da chegada da P8 (6, 6), dentro do círculo de luz de 3 tiles (perfil, `luz.raioEmTiles`) |

### 9.4 Cozinha: um tile só

A Cozinha e Lavanderia é um corredor: a chegada da P7 (1, 0) entra por (1,1)–(3,1), passa pela peça 2 (4, 1), desce por (4,2)–(4,3) e segue até a peça 3 (3, 5). Por isso, só (5, 3) passa em todos os critérios. Os demais candidatos cortam a passagem (1,1), (2,1), (3,3) e (4,3), ou ficam com um vizinho só. (5, 3) é um beco: bloqueá-lo isola (5, 4), que não tem objeto. Se o Diretor quiser outro tile nesse cômodo, a solução é mudar a planta (um móvel), e não o tile.

### 9.5 Mapas ASCII (saída da ferramenta)

```
sala (11×10)                 cozinha (6×7)           quarto (5×8)           escritorio (8×6)
     01234567890                  012345                  01234                  01234567
   0 **                         0 PSmm#m                 0    x                   0      mmm
   1 **#mm# P                   1 #**.pm                 1   #*.                  1      *N.
   2 ******xSP                  2 mmmm.#                 2   #*#                  2      *m#
   3 *.*m#I *                   3 ###**N                 3   **N                  3      *m#
   4 .p.m#******                4 ##..#.                 4 *****                  4  *****x
   5 *.******NSP                5    p.#                 5 *                      5 PS
   6 ******Smm*m                6    ###                 6 S
   7 ******P***m                                         7 P
   8 ***A.
   9 ..
```

(`N` = tile escolhido; `*` = candidato; `#` = bloqueado; `P` = gatilho; `S` = chegada; `p` = peça; `m` = móvel; `x` = porta fechada; `I` = interruptor; `A` = árvore.)

### 9.6 Bloco de conteúdo para o PR (ADR-005 2.2 e 2.3)

Para colar em `content/missions/` (os `null` do ADR já fechados). A validação N001 a N014 é do Dev.

```json
// missions/parte1.json
"nick": { "dorme": { "mapa": "cozinha", "x": 5, "y": 3, "direcao": "baixo" }, "alvo": "sala" }

// missions/parte2.json
"nick": { "dorme": { "mapa": "quarto", "x": 4, "y": 3, "direcao": "baixo" }, "alvo": "cozinha" }

// missions/parte3.json
"nick": {
  "dorme": { "mapa": "escritorio", "x": 6, "y": 1, "direcao": "baixo" },
  "alvo": "cozinha",
  "depois": { "mapa": "sala", "x": 8, "y": 5, "direcao": "baixo" }
}

// missions/marco1.json (exemplo do ADR-005 2.2, já com o tile da Sala)
"nick": { "dorme": { "mapa": "sala", "x": 8, "y": 5, "direcao": "baixo" }, "alvo": "sala" }
```

### 9.7 Linha 9 da Sala (item 073)

O tile de dormir da Sala está na linha de tela 5, então não depende da resposta à pergunta 31. A opção A (bloquear (0, 9) e (1, 9)) segue pendente, e o item 073 continua fora deste trabalho, como pedido.
