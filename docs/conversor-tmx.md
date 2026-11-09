# Contrato do conversor: planta do Tiled para `content/`

- **Status:** Aceito em 2026-11-07, junto com ADR-004 (decisão 74 em `decisions.md`). Revisado em 2026-11-08 (móveis para o conteúdo, decisão do Diretor): tipo de saída `movel` (seção 4.2) e erro E020 (seção 6). Revisado em 2026-11-08 (BUG-M12-02): passo 11 (linha da barra), erros E018 e E019, item 7 da Arte e critérios de aceite. Revisado em 2026-11-08 (rotação da planta, item 045; bilhete de parede, item 040): seção 3.1 (nova), tipo `bilhete` (regra 9), `rotacao` no golden (seção 5), checklist (seção 7) e critérios de aceite (seção 8). Revisado em 2026-11-08 (Especialista, ADR-004 seção 8 item 11 e seção 3, arestas): regra 9 (interruptor e distância à entrada no escuro), seção 3.1 (opção `--girar`; [TBD] resolvidos), seção 4.2 (desenho de porta) e checklist da Arte (itens 6 e 7; [TBD] resolvidos). Revisado em 2026-11-08 (chegada explícita, ADR-004 seção 13; **a confirmar pela prévia**): spawn com `chegada` (seção 2.3), regra 9 (tipo de tile), regra 10 (chegada declarada), regra 10b (uma entrada), seção 3.1 (rotação), seção 4.2 (saída sem mudança de formato), erros E024 a E027 (seção 6), checklist da Arte (item 5) e critérios (seção 8).
- **Extensão (ADR-004 seção 13.13 a 13.24; PROPOSTA, 2026-11-08):** vão livre com chegada declarada nos dois lados (regras 5, 6, 10 e 10b); `porta.saida` em todo `porta` (seção 4.2); erro E028 novo; item 21 do ADR vira W027 para par de fórmula (seção 6). Nada disso está implementado até a Arte e o Dev entregarem.
- **Revisão do Marco 4 (item 089, 2026-11-09):** caixa de enfeite, classe `enfeite` (seções 2.3, 3 passo 8, regra 9, 4.2 e 5), erro E029 (seção 6) e critério (seção 8). Contrato em ADR-006 seção 2.
- **Revisão do Marco 2 (item 061, 2026-11-08; aguarda aceite):** peça `peca` (seções 2.3, 4.2 e regra 9; erros E014, E021 a E023), caixa com o vão de saída para baixo (regra 6), pares P2 e P3 e alcova (seção 7, item 5), áreas abertas por missão fora do TMX (seção 4.3), golden com dígitos 1 a 3 (seção 5) e critérios (seção 8).
- **Dono da implementação:** Arte (`tools-arte/tmx_para_conteudo.py`). Comando `npm run gen:conteudo` e teste de golden no CI: Generalista (backlog 025). Consumidor: Dev (motor e `validarConteudo`, backlog 026 e 027).
- **Referências:** ADR-004 (seções 2 a 8), ADR-003 (perfil e tile), ADR-002 (manifesto), `docs/mapa-casa-real.md` (inventário e riscos).

---

## 1. Papel e divisão de responsabilidades

O conversor lê a cópia de trabalho do Tiled e grava, para cada subárea, um JSON de conteúdo (`content/maps/casa-real/<id>.json`). Atualiza as entradas de mapa do manifesto e grava o golden.

- **Conversor (geometria e tiles):** componentes de piso, caixa, `chao`, `colisao`, pares de porta e vão, spawns de chegada, rotação da planta (seção 3.1), rotação de retângulo e cobertura dos bloqueantes, objetos de jogo em tile, tile do perfil. Regras das seções 2 a 7 do ADR-004.
- **`validarConteudo` (application, Dev):** referências entre subáreas e missões, `inicio`, `conducao`, `conquistas`, `trancadaAte`, última linha da tela, distância do interruptor e caixa dentro da tela. Regras da seção 8 do ADR-004.

O conversor **não corrige a planta**. Se uma regra falha, para com erro e não grava nada (seção 6). A correção é feita na cópia de trabalho.

**Determinismo:** a mesma entrada produz os mesmos bytes em `content/`, no manifesto e no golden.

---

## 2. Entrada

### 2.1 Arquivo e formato

- **Arquivo:** `maps/casa-real/our-home-jogo.tmx` (cópia de trabalho, padrão). O original `our-home.tmx` não é editado. Ele não serve de entrada: não tem rótulos com `id`, e o conversor recusa (E005).
- **Tiled:** formato TMX, `orientation="orthogonal"`, `tilewidth` = `tileheight` = `perfil.tile` (32 no HD).
- **Mapa infinito** (`infinite="1"`, com `<chunk>`) ou finito: ambos aceitos. `width` e `height` do mapa são ignorados (ADR-004 seção 5).
- **Camadas de tile:** `<data encoding="csv">`, com ou sem chunks. Base64 e compressão são recusados (E000). No Tiled: formato de camada = CSV.
- **Flip e rotação de tile:** não permitidos (E003).
- **Python:** 3.10 ou superior, só biblioteca padrão (como `tools-arte/inventario_casa_real.py`).

### 2.2 Perfil

- O tile vem de `perfil.tile` do perfil ativo: `content/manifest.json` → `artProfile` → `content/art-profiles/<id>.json`. `--perfil` sobrescreve.
- A tela vem de `sala.colunas` e `sala.linhas` do mesmo perfil (HD: 15 × 11).

### 2.3 Camadas e grupos (nomes exatos)

Nomes diferentes de estes são erro (E000). Textos de rótulo, marca e objeto de jogo são lidos do conteúdo do elemento `<text>` ou das propriedades, nunca do atributo `name`.

| Nome | Tipo no Tiled | Conteúdo |
|---|---|---|
| `Pisos` | camada de tiles | Piso de todas as subáreas |
| `Rótulos das subáreas` | grupo de objetos | Um texto por subárea. Propriedade `id` (obrigatória) e `escuro` (booleana, padrão falso). Antigo nome no original: "Nome das subareas" (a Arte renomeia na cópia) |
| `Portas` | grupo de objetos | Textos `P1` a `P8`. Pares: dois com o mesmo nome. Porta fechada: uma marca com `fechada = true`. Retângulo sem texto é batente (visual, ignorado) |
| `Objetos da casa bloqueantes` | grupo de objetos | Retângulos de colisão |
| `Objetos de jogo` | grupo de objetos (novo) | Spawns, interruptor, bilhete, árvore, examináveis, peças (`peca`) e a caixa de enfeite (`enfeite`). Classe = atributo `class` do objeto (Tiled 1.9 ou superior) |

Propriedades são as propriedades customizadas do Tiled. Tipos `bool`, `int` e `string` são respeitados.

**Peça (`peca`, Marco 2).** Objeto `<text>` no grupo `Objetos de jogo`, com class `peca`. O conteúdo do texto é a ordem (`1`, `2` ou `3`), lido do texto do elemento (regra 2.3 deste contrato). A propriedade `estadoInicial` (string: `visivel` ou `escondida`) é obrigatória. O objeto ocupa 1 tile (32×32 no HD), centrado no tile (regra 8). A Arte vê a ordem no mapa. O conversor não lê o atributo `name`.

**Caixa de enfeite (`enfeite`, Marco 4, ADR-006 seção 2).** Objeto no grupo `Objetos de jogo`, com class `enfeite`, sem texto e sem propriedades: `ordem` (4) e `estadoInicial` (`escondida`) são fixos no conversor, não se lêem do TMX. Exatamente um objeto no mapa inteiro (E029). O objeto ocupa 1 tile, centrado no tile (regra 8). O conversor não sabe qual é a missão: a regra de tile da missão (tile de dormir do Nick, 4-vizinhos) é de `validarConteudo` (ADR-006 T007 e T008).

**Chegada declarada (`spawn` com `chegada`, ADR-004 seção 13).** Objeto `<object>` no grupo `Objetos de jogo`, com class `spawn`, no tile em que o sobrinho aparece ao atravessar a porta. Propriedades: `chegada` (string, id da porta, ex.: `P1`; obrigatória para este tipo) e `direcao` (obrigatória). Não tem `nome`: o conversor grava `nome` = valor de `chegada` na saída. Ter `nome` e `chegada` juntos, ou nenhum dos dois com class `spawn` sem `chegada`, é E014. O objeto fica na subárea cujo piso contém o tile; ele vale para o gatilho de mesmo id que leva a essa subárea (E024).

### 2.4 Tileset de piso

- **Uma única fonte de piso:** o tileset `tiles_casa`, embutido ou externo (com `.tsx` presente). O conversor lê `firstgid` e `tilecount`; não lê a imagem.
- Todo gid de `Pisos` deve estar em `tiles_casa` (E002).
- Os três tilesets do original (`wood`, `light wood.tsx`, `wood.tsx`) são substituídos por `tiles_casa` na cópia de trabalho (decisão 12; inventário R6).
- **Enquanto o tileset real não chega:** a Arte declara um tileset placeholder `tiles_casa` com `tilecount` maior ou igual ao maior gid usado.

---

## 3. Regras de conversão (na ordem)

Coordenadas do Tiled: objetos vêm em pixel. O tile de um ponto ou retângulo é `floor(x / T)`, `floor(y / T)`, com `T` = `perfil.tile`. Tile de chunk já é em tile.

1. **Carga e cabeçalho.** Lê o TMX, confere `tilewidth` = `tileheight` = `perfil.tile` (E001) e a presença dos grupos e camadas da seção 2.3 (E000).
2. **Piso.** Monta o mapa `(x, y) → gid`. Gid zero é sem piso. Gid com flags de flip ou rotação é erro (E003). Gid fora de `tiles_casa` é erro (E002).
3. **Subáreas.** Cada componente 4-conexa do piso é uma subárea candidata. Componente sem piso não existe (E016 se o grupo `Pisos` estiver vazio).
4. **Rótulos.** Cada componente tem exatamente um rótulo cujo centro cai no piso dela (E004). `id` é obrigatório, único e casa com `[a-z0-9_]+` (E005). O `id` vira nome do arquivo (`<id>.json`).
   - Para o centro: `cx = x + w/2`, `cy = y + h/2`, tile = `floor(cx / T)`, `floor(cy / T)`.
5. **Marcas de porta.** Para cada texto `Pn` no grupo `Portas`:
   - **Porta fechada** (`fechada = true`): exatamente uma marca com esse nome. Sem par. Deve estar dentro da caixa da subárea que a contém (regra 6). O tile dela pode estar fora do piso (E007 se houver mais de uma).
   - **Par** (sem `fechada`): exatamente duas marcas com o nome. Cada uma sobre o piso livre da sua subárea (E008). As duas na mesma linha ou coluna, cada uma sobre o piso livre de uma subárea diferente (E008); as duas na mesma linha ou coluna (E008); **todos** os tiles entre elas **sem piso** (E008), que formam o vão. Par **sem** chegada declarada nos dois lados: vão de exatamente 1 tile (E008). Par **com** chegada declarada nos dois lados (regra 10): vão de 1 ou mais tiles (ADR-004 seção 13.14).
   - Nome com uma marca só (sem `fechada`) ou com três ou mais marcas: E007.
   - Propriedade `trancadaAte` vale só para par. Seu valor é uma fase; a validação de fase é de `validarConteudo`.
6. **Caixa.** A caixa de cada subárea é o menor retângulo que contém o piso da subárea e as marcas de porta dela (pares e portas fechadas). Se a caixa passa da tela (`sala.colunas` × `sala.linhas`), erro (E006). Coordenadas locais: `x − minX`, `y − minY`.
   - A caixa inclui também o vão do par cuja saída, deste lado, é para baixo (indicador de tapete; ADR-004 seção 2). Saída = `V − G` (ADR-004 seção 3). O vão é tile sem piso dentro da caixa, nunca andável. Só o primeiro tile do vão (o que encosta no gatilho) entra na caixa; os demais não entram (ADR-004 seção 13.16).
   - Tile de piso de **outra** subárea dentro da caixa vira "sem piso" para esta subárea, com aviso W001. No Marco 2, o W001 é esperado para os tiles do piso do Escritório que caem na caixa da Sala (coluna 10, em torno de (10, 2)). Não é erro.
7. **Colisão.**
   - Tile dentro da caixa sem piso: `colisao = 1`.
   - Tile com piso: bloqueado se a **união** dos retângulos de `Objetos da casa bloqueantes` cobre pelo menos metade do tile. Medição: 8 × 8 pontos por tile, nos centros de subcélulas de 1/8 de tile. Bloqueado se ao menos 32 dos 64 pontos caem dentro de algum retângulo (`x0 ≤ px < x1` e `y0 ≤ py < y1`).
   - **Rotação de retângulo** (não é a rotação da planta, seção 3.1): 0, 90, 180 ou 270 com tolerância de 1°. A caixa é a envolvente dos cantos girados em torno do canto superior esquerdo. Fórmula em y para baixo (sentido horário, como o Tiled): `x' = dx·cos θ − dy·sin θ`, `y' = dx·sin θ + dy·cos θ`, com `dx, dy` relativos ao canto. Outro ângulo é erro (E012).
   - Retângulo que, sozinho, não bloqueia nenhum tile é erro (E011). Batente do grupo `Portas` não entra aqui.
   - Gatilho, spawn, interruptor e bilhete devem ficar em tile livre (regra 9).
8. **Objetos de jogo.** Cada objeto do grupo `Objetos de jogo` vai para o tile do centro (mesma regra do passo 4). Erros:
   - Retângulo maior que um tile, ou centro a menos de 2 px da borda do tile (E013). Recomendado: o objeto centrado no tile, com retângulo de até 1 tile.
   - Classe desconhecida, `direcao` fora de `cima`, `baixo`, `esquerda`, `direita`, ou propriedade obrigatória ausente (E014).
   - Dois objetos no mesmo tile, ou dois spawns com o mesmo nome na subárea (E015).
   - Tipo de tile exigido (regra 9): erro E010.
   - Caixa de enfeite (`enfeite`): número de objetos diferente de 1 no mapa inteiro: E029. Tile sem piso livre ou com menos de 2 vizinhos livres (sem gatilho, porta, spawn, interruptor, peça ou árvore): E010.
   - Peça (`peca`): ordem fora de 1 a 3, texto que não é inteiro, ou `estadoInicial` ausente ou fora de `visivel`/`escondida`: E014. Ordem repetida ou conjunto de peças diferente de {1, 2, 3}: E021. `estadoInicial` que não bate com a ordem: E022. Peça sobre o interruptor ou 4-vizinha dele: E023 (ADR-004 seção 8, itens 15 a 17).
9. **Tipos de tile exigidos.** Fonte única da regra; cada tipo de objeto só cai onde está listado.

   | Objeto | Tile exigido | Tile fica |
   |---|---|---|
   | `spawn` (de Objetos de jogo) | piso livre | livre |
| `spawn` com `chegada` (declarada) | piso livre, 4-adjacente ao gatilho de entrada da mesma subárea (E026), sem ser vão nem gatilho (E025) | livre |
   | `interruptor` | piso livre | livre. Fora do círculo de luz: a mais de 3 tiles, em linha reta, do spawn de entrada no escuro (hoje, a chegada `P8` na Sala, (6, 6) girada; ADR-004 seção 8, item 11). O conversor não confere a distância, porque não sabe qual chegada é de entrada: a Arte posiciona o interruptor e `validarConteudo` confere |
   | `bilhete` | bloqueado, com ao menos um vizinho (4) de piso livre | bloqueado |
   | `arvore` | piso | bloqueado (o tile vira bloqueio, ADR-003 seção 5) |
   | `examinavel` | bloqueado, com ao menos um vizinho (4) de piso livre | bloqueado |
   | `portaFechada` | bloqueado, com ao menos um vizinho de piso livre | bloqueado |
   | `porta` (gatilho de par) | piso livre | livre |
   | spawn de chegada (gerado) | piso livre | livre |
| `peca` | piso livre, sem bloqueante, móvel ou parede, com vizinho (4) de piso livre que não seja gatilho, vão, spawn, chegada, interruptor nem porta fechada; não sobre o interruptor nem 4-vizinha dele (E023) | livre (colisão 0 no conteúdo; o bloqueio do estado é do motor, ADR-004 seção 6) |
| `enfeite` | piso livre, sem bloqueante, móvel ou parede, com pelo menos 2 vizinhos (4) de piso livre que não sejam gatilho, vão, spawn, chegada, interruptor, porta fechada, peça nem árvore (E010) | livre (colisão 0 no conteúdo; o bloqueio do estado é do motor, ADR-006 seção 2.4) |

   Gatilho e spawn nunca caem em gatilho nem em bloqueio (E009 para gatilho e spawn de chegada; E010 para os demais).
10. **Portas: spawn de chegada.** Para o par com gatilho `G_B` no lado B e vão `V`: spawn de chegada em B = `G_B + (G_B − V)`, nome = id da porta (ex.: `P8`), direção = sentido de `G_B − V` (para dentro de B). Deve ser piso livre (E009). Por construção, esse tile é o que fica do outro lado do gatilho `G_B`, um tile para dentro. Vale só para par sem chegada declarada nos dois lados (vão de 1 tile).
    **Chegada declarada (ADR-004 seção 13):** se a subárea B tem um `spawn` com `chegada` = id da porta, ele é a chegada desse lado e substitui a fórmula (não se gera o spawn da fórmula). Sem declaração, vale a fórmula. Em qualquer caso, a chegada tem de encostar no gatilho `G_B` (E026) e cair em piso livre (E009 para a fórmula; E025 para a declarada). Chegada declarada conta como spawn para a regra 11 (linha da barra, E019) e para a regra 9 (tipo de tile). Cada lado de um par é independente. Par com chegada declarada nos dois lados (ADR-004 seção 13.14): não há fórmula, as duas chegadas são as declaradas, e o vão pode ter mais de 1 tile.

10b. **Gatilho com uma entrada (ADR-004 seção 13; seção 8, item 21).** Para cada gatilho de par `G` da subárea: exatamente um vizinho (4) de piso livre na própria subárea (`chao` > 0 e sem bloqueio, contando gatilho vizinho). Zero ou dois ou mais: E027 (lado com chegada declarada) ou W027 (lado com chegada da fórmula). O vão não conta, porque não tem piso. Para cada lado, grava também `saida` = direção do gatilho ao primeiro tile do vão, em todo par (ADR-004 seção 13.18).
11. **Linha da barra (ADR-004 seção 8, item 6).** Depois dos passos 7 a 10, para cada tile da caixa cuja linha de tela é `sala.linhas − 1`. Só caixa com altura igual a `sala.linhas` tem tile nessa linha (o `deslocamentoY` do passo 6 faz as menores terminarem acima dela):
    - tile com `colisao = 0` (chão andável) → E018, uma linha por tile;
    - objeto de jogo, gatilho ou spawn de chegada nesse tile → E019.

    O conversor só informa: não bloqueia a linha (ADR-004 seção 4, regra 7). A correção é retângulo de colisão na cópia de trabalho (seção 7, item 7).

12. **Ordenação e saída.** Ver seção 4.

### 3.1 Rotação da planta (opção; ADR-004 seção 12)

- **Opção:** flag `--girar` de `tools-arte/tmx_para_conteudo.py` (nome dado pela Arte na entrega de 2026-11-08). Sem a flag, a planta sai na orientação atual (equivale a `0`); com ela, gira 90° no sentido horário (equivale a `90`). O `content/` do Marco 1 é gerado com `--girar` (decisão do Diretor, 2026-11-08).
- **Onde:** depois das regras 1 a 10, sobre o resultado de cada subárea. Tiles (`chao`, `colisao`, objetos e caixa) seguem `(x, y) → (altura − 1 − y, x)`, com `altura` da subárea antes de girar. A origem da casa é recalculada depois da rotação.
- **Regra 11 e caixa na tela girada:** a linha da barra (regra 11) e o limite de tela (regra 6, E006) são conferidos sobre a subárea já girada, porque a tela não gira.
- **Direções:** `spawn`, spawn de chegada (gerado ou declarado com `chegada`) e `direcao` de objeto: cima → direita, direita → baixo, baixo → esquerda, esquerda → cima. As coordenadas de `conducao` não são do conversor: vêm da missão, já na tela girada (ADR-004 seção 11.1). A peça (`peca`) gira como tile, sem direção.
- **Não gira no conversor:** o TMX de entrada (`our-home.tmx` fica intocado; a cópia de trabalho fica na orientação atual, e só o conversor gira (ADR-004 seção 12.2)); as imagens de móveis, paredes, portas e tiles, que são da Arte; a rotação de retângulo de colisão (regra 7), que é outra coisa.
- **Conferência depois de girar (erro, não grava):** cada par de porta tem exatamente um tile vazio entre os gatilhos (E008); o spawn de chegada cai em piso livre e aponta para dentro (E009); a linha da barra vale na tela girada (E018, E019); a caixa cabe em `sala.colunas × sala.linhas` (E006).
- **Golden e `--verificar`:** usam o mesmo valor de rotação que gerou o `content/` (seção 5).

---

## 4. Saída

### 4.1 Arquivos

- `content/maps/casa-real/<id>.json`: um arquivo por subárea. Hoje, 8: `hall`, `sala`, `cozinha`, `escritorio`, `banheiro_escritorio`, `quarto`, `banheiro_casal`, `suite_casal`.
- A pasta é reescrita inteira. JSON que não corresponde a uma subárea da cópia de trabalho é removido (com aviso).

### 4.2 Formato da subárea

Exemplo fictício de 3 × 2 (não é a planta real):

```json
{
  "altura": 2,
  "chao": [1, 1, 0, 1, 1, 1],
  "colisao": [0, 0, 1, 0, 0, 1],
  "escuro": false,
  "id": "exemplo",
  "largura": 3,
  "objetos": [
    { "tipo": "interruptor", "x": 1, "y": 1 },
    { "tipo": "portaFechada", "id": "P1", "x": 2, "y": 0, "texto": "porta.fechada" },
    { "tipo": "spawn", "nome": "elevador", "x": 0, "y": 0, "direcao": "cima" }
  ],
  "tile": 32
}
```

**Campos:**
- `id`, `tile`, `largura`, `altura`, `escuro`: como no rótulo e no perfil.
- `chao`: lista plana, linha a linha. Índice = `y × largura + x`. Valor = gid local no `tiles_casa` (`gid − firstgid + 1`); 0 = sem piso.
- `colisao`: mesmo formato. 1 = bloqueado (inclui sem piso); 0 = livre.
- `objetos`: lista ordenada por (`tipo`, `id` ou `nome`, `y`, `x`). Cada objeto segue a tabela abaixo.

**Chaves:** ordenadas alfabeticamente. Sem campo `salas` (ADR-004 seção 6).

**Desenho de porta:** a porta é desenhada sobre a aresta entre o tile de chão e o vão ou a passagem (regra de arestas, ADR-004 seção 3). O conteúdo não grava posição de desenho: o `porta` e o `portaFechada` seguem como estão.

**Tipos de objeto (saída):**

| `tipo` | Campos |
|---|---|
| `porta` | `id`, `x`, `y`, `destino` (id da subárea de chegada), `spawnDestino` (nome do spawn lá, igual ao `id`), `trancadaAte` (só se houver), `saida` (`cima`, `baixo`, `esquerda` ou `direita`: direção do gatilho ao primeiro tile do vão; sempre gravado; ausente ou inválido = erro de conteúdo, sem fallback; ADR-004 seção 13.18), `origemChegada` (`declarada` se o lado tem spawn com `chegada`; `formula` caso contrário; sempre gravado; o motor não infere) |
| `portaFechada` | `id`, `x`, `y`, `texto` (padrão `porta.fechada`), `saida` (`cima`, `baixo`, `esquerda` ou `direita`; ADR-004 seção 6) |
| `spawn` | `nome`, `x`, `y`, `direcao` (chegada declarada sai igual: `nome` = id da porta) |
| `interruptor` | `x`, `y` |
| `bilhete` | `x`, `y`, `texto` (chave em `texts/`, ex.: `bilhete.pista`) |
| `arvore` | `x`, `y`, `estado` |
| `examinavel` | `x`, `y`, `texto` (chave em `texts/`, ex.: `cozinha.pia`) |
| `movel` | `id` (slug do `nome`, único na subárea), `nome` (texto do TMX, ex.: `Rack TV`), `x`, `y`, `w`, `h` (em tiles, na tela girada). Um por retângulo com texto em `Objetos da casa bloqueantes` (mesmo retângulo da colisão). Só para desenho: não muda a colisão. Parede, pilar e batente não geram móvel. |
| `peca` | `id` (`peca<ordem>`), `ordem` (1, 2 ou 3), `estadoInicial` (`visivel` ou `escondida`), `x`, `y`. Sem colisão no conteúdo: o bloqueio é do estado no motor (ADR-004 seção 6). Ordenado por `id` |
| `enfeite` | `id` (`enfeite`), `ordem` (4), `estadoInicial` (`escondida`), `x`, `y`. Sem colisão no conteúdo (ADR-006 seção 2.2). Exatamente um, no mapa inteiro (E029). Sai depois de `peca` e antes de `movel` |

**Formato:** JSON com `indent=2`, `sort_keys=True`, `ensure_ascii=False`, UTF-8 sem BOM, terminado em `\n`.

### 4.3 Manifesto

- O conversor atualiza `content/manifest.json` **só** nas entradas de `maps[]` cujo `file` começa com `maps/casa-real/`.
- Forma de cada entrada: `{ "id": "<id>", "file": "maps/casa-real/<id>.json", "tileset": "tiles_casa" }`.
- Ordem: as entradas existentes mantêm a posição; as novas vão ao fim, em ordem de id.
- Outras chaves do manifesto (`missions`, `texts`, `artProfile`, etc.) não são tocadas. Missões são escritas à mão.
- **Áreas abertas (Marco 2).** O conversor não lê nenhuma marca de "aberta" no TMX. Ele converte as 8 subáreas, abertas ou não. Quais estão abertas é `missions[].maps` (ADR-002 seção 2.2), escrito à mão e fora do TMX. Abrir uma área, como o Quarto na parte 1, não muda a conversão.

### 4.4 Escrita

- Tudo é calculado em memória. Se houver erro, nada é gravado e o processo sai com código 1.
- Com sucesso, grava `content/maps/casa-real/*.json` e o manifesto. O golden só é gravado com `--atualizar-golden`.

---

## 5. Golden file

Pasta: `tools-arte/golden/casa-real/`. Duas partes:

**`resumo.json`:**
- `origemDaCasa`: tile do TMX do canto superior esquerdo do piso (todas as subáreas). Hoje `(-20, -13)`, sem rotação; com rotação, é a origem da casa girada.
- `rotacao`: o valor usado (`0` ou `90`, seção 3.1).
- Por subárea: `id`, `deslocamento` (origem local no TMX), `largura`, `altura`, `deslocamentoNaTela` (centralização, ADR-004 seção 2), `contagens` (piso, livres, bloqueados com piso, sem piso, objetos por tipo) e `sha256` do JSON gerado.

**`<id>.txt`** (uma por subárea): grade ASCII, uma linha por linha de tile, para revisão visual. Legenda:

| Caractere | Significado |
|---|---|
| `.` | Piso livre |
| `#` | Piso bloqueado |
| ` ` (espaço) | Sem piso (bloqueado) |
| `G` | Gatilho de par |
| `F` | Porta fechada |
| `S` | Spawn (inclui o de chegada) |
| `I` | Interruptor |
| `B` | Bilhete |
| `A` | Árvore |
| `E` | Examinável |
| `C` | Caixa de enfeite (`enfeite`), escondida ou não: a grade só mostra a posição |
| `1`, `2`, `3` | Peça, pela ordem (o estado inicial não aparece na grade) |

**Uso:**
- Teste no CI (Generalista): roda o conversor em pasta temporária, compara byte a byte com `tools-arte/golden/casa-real/`, e o resultado com `content/maps/casa-real/`. Qualquer diferença falha o teste.
- `--verificar`: não grava nada; compara `content/`, manifesto entries e golden; sai com código 1 se algo diferir (E017).
- `--atualizar-golden`: grava o golden junto com o conteúdo. O diff do `.txt` é a revisão visual da mudança de planta; o Diretor olha esse diff antes do merge.

---

## 6. Erros

Formato na saída de erro (stderr), uma linha por erro, e saída com código 1:

```
ERRO E004 maps/casa-real/our-home-jogo.tmx: componente 37 (piso): 2 rótulos (hall, sala); esperado 1
```

| Código | Quando | Mensagem (modelo) |
|---|---|---|
| E000 | Estrutura: arquivo não é TMX, grupo ou camada ausente, encoding não CSV | "grupo 'Objetos de jogo' não encontrado" |
| E001 | `tilewidth` ou `tileheight` diferente de `perfil.tile` | "tilewidth 16 ≠ perfil.tile 32 (hd-480x352)" |
| E002 | Gid de piso fora de `tiles_casa`, ou tileset sem `tilecount` ou `.tsx` ausente | "gid 532 não está em 'tiles_casa' (firstgid 1, tilecount 256)" |
| E003 | Gid com flip ou rotação | "gid com flag de flip em (x, y)" |
| E004 | Componente de piso sem exatamente um rótulo no piso dela | "componente 5: 2 rótulos (hall, sala); esperado 1" |
| E005 | Rótulo sem `id`, `id` repetido ou fora de `[a-z0-9_]+`; `escuro` não booleano | "rótulo 'Sala': id ausente" |
| E006 | Caixa maior que a tela | "subárea 'sala': caixa 12×11 > tela 11×11" (exemplo; tela real 15×11) |
| E007 | Marca de porta sem par, com três ou mais, ou porta fechada com duas | "P8: 1 marca; par exige 2" |
| E008 | Par fora da regra de vão: marcas não alinhadas, vão com piso, ou vão diferente de 1 tile sem chegada declarada nos dois lados (ADR-004 seção 13.14) | "P7: marcas em (−6,−6) e (−4,−6); distância 2 exigida e vão sem piso" |
| E009 | Gatilho ou spawn de chegada em tile que não é piso livre | "spawn P8 de chegada em hall (0,−1) cai em bloqueio" |
| E010 | Objeto de jogo em tile que não é o exigido (seção 3, passo 9) | "interruptor em (x, y) sobre bloqueio" |
| E011 | Retângulo de colisão que não bloqueia nenhum tile | "'Cama' (id 79): 0 tiles pela regra de 50%" |
| E012 | Rotação fora de 0, 90, 180, 270 (±1°) | "objeto 90: rotação 38°" |
| E013 | Objeto de jogo ambíguo (maior que um tile, ou centro a menos de 2 px da borda) | "spawn 'elevador': centro a 1 px da borda do tile" |
| E014 | Classe desconhecida, direção inválida ou propriedade obrigatória ausente | "spawn 'elevador': direcao ausente" |
| E015 | Dois objetos no mesmo tile, ou spawn com nome repetido na subárea | "spawn 'P8' repetido em 'sala'" |
| E016 | Subárea sem piso | "grupo 'Pisos' sem tiles" |
| E017 | Saída difere do golden ou do `content/` (só `--verificar`) | "resumo.json difere do golden" |
| E018 | Tile da linha da barra (linha `sala.linhas − 1` da tela) é andável, `colisao = 0` (passo 11) | "subárea 'sala': chão andável em (−3, 5) (TMX), linha 10 da tela; a barra cobre essa linha" |
| E019 | Objeto de jogo, gatilho ou spawn de chegada na linha da barra (passo 11) | "subárea 'sala': interruptor em (−3, 5) (TMX), linha 10 da tela" |
| E020 | Móvel (retângulo com texto em `Objetos da casa bloqueantes`) fora da grade de tile, ou com tiles fora do piso ou em mais de uma subárea | "móvel 'Cama' (id 79): tiles fora do piso ou em mais de uma subárea" |
| E021 | Peça: ordem repetida, ou conjunto de peças diferente de {1, 2, 3} no conteúdo inteiro | "peça 2 aparece 2 vezes" |
| E022 | Peça: `estadoInicial` incompatível com a ordem (ordem 1 pede `visivel`; 2 e 3 pedem `escondida`) | "peça 3: estadoInicial 'visivel', esperado 'escondida'" |
| E023 | Peça sobre o interruptor, ou 4-vizinha dele, na mesma subárea (ADR-004 seção 8, item 17) | "peça 1 em (x, y) encosta no interruptor" |
| E024 | Chegada declarada (`spawn` com `chegada`) em subárea que nenhum gatilho de mesmo id leva a (ADR-004 seção 13) | "chegada 'P2' em 'quarto': nenhum gatilho P2 leva a 'quarto'" |
| E025 | Chegada declarada fora de piso livre: sobre bloqueio, objeto, gatilho, vão ou fora do piso da subárea (seção 3, regra 10) | "chegada 'P1' em 'suite_casal' (x, y) sem piso livre" |
| E026 | Chegada (declarada ou da fórmula) não 4-adjacente ao gatilho de entrada da subárea, ou dentro do vão (ADR-004 seção 13) | "chegada 'P2' em (7, −3) não encosta no gatilho (7, −1) de 'quarto'" |
| E027 | Gatilho de par sem exatamente um vizinho de piso livre na própria subárea (seção 3, regra 10b; ADR-004 seção 8, item 21) | "gatilho P1 em 'sala' (6, 2): 2 vizinhos livres (esperado 1)" |
| E029 | Caixa de enfeite (`enfeite`): número de objetos no mapa inteiro diferente de 1 (ADR-006 seção 2.2) | "caixa de enfeite: esperada 1 (classe 'enfeite'), há 2" |
| E028 | Chegada declarada (`spawn` com `chegada`) cuja `direcao` não é o sentido do gatilho para ela, isto é, não aponta para dentro da subárea (ADR-004 seção 13.14, d) | "chegada 'P2' em 'quarto' (8, −1): direção 'esquerda', esperado 'direita'" |

**Aviso (não bloqueia):** W001 (tile de piso de outra subárea dentro da caixa). Aparece na saída padrão.

**W027 (implementado em 2026-11-08, Arte; a confirmar pelo Especialista):** E027 vale como erro só para gatilho cujo lado tem chegada declarada (`spawn` com `chegada`). Para gatilho de par com chegada da fórmula, a mesma condição sai como W027. Motivo: na planta atual, P7 (gatilho (4, −5) do TMX girado, 2 vizinhos livres) e P8 (gatilho (0, −3), 3 vizinhos livres) falham a regra de uma entrada; corrigir isso muda o andar da Sala, o que depende do Diretor. Decidido na extensão (ADR-004 seção 13.19, 2026-11-08): aviso para lado de par de fórmula, sem bloquear; o aviso também vai para `Conteudo.avisos` ao carregar (`CarregarConteudo`), para P7 e P8; para lado com chegada declarada, continua erro. Item 21 do ADR segue o mesmo critério.

**Códigos de saída:** 0 = sucesso; 1 = erro de regra (E0xx); 2 = uso incorreto da linha de comando.

---

## 7. Checklist da Arte (cópia de trabalho)

Antes da primeira execução, a cópia `maps/casa-real/our-home-jogo.tmx` precisa de:

1. **Cópia e grupos.** Copiar o original. Renomear o grupo para `Rótulos das subáreas`. Criar o grupo `Objetos de jogo`.
2. **Tileset.** `tiles_casa` embutido (placeholder ou real). Remover os três tilesets do original.
3. **Corte Sala/Hall.** Remover o piso das linhas em que Sala e Hall se encostam, de modo que o vão de 1 tile em (-2, -1) seja o único separador. Hall e Sala devem ser componentes separadas (E004). O Elevador fica no Hall.
4. **Rótulos.** Um por subárea, com `id` (`hall`, `sala`, `cozinha`, `escritorio`, `banheiro_escritorio`, `quarto_olivia`, `banheiro_casal`, `suite_casal`). `escuro = true` em `sala` e `cozinha`; nas outras, falso. O centro do rótulo cai no piso da própria subárea.
5. **Portas.**
   - P8: dois textos `P8`, um de cada lado do vão (-2, -1): Hall em (-1, -1) e Sala em (-3, -1). Propriedade `trancadaAte = porta` nos dois.
   - P7: dois textos `P7`, um de cada lado do vão, na linha de cima da Sala. A coluna é escolha da Arte; precisa de piso livre nos dois lados (hoje há bloqueio em (-5..-3, -5)).
   - P1: uma marca com `fechada = true`, no lado da Sala: P1 em (-8, -1) (TMX, antes da rotação).
   - P2 e P3 (Marco 2): pares, com gatilho em piso e vão de 1 tile sem piso. Na Sala girada: P2 com gatilho (7, 1), vão (7, 0) e gatilho do Quarto (7, −1); P3 com gatilho (8, 2), vão (9, 2) e gatilho do Escritório (10, 2) (GDD 15.3.3). A posição no TMX de trabalho sai da seção 12.8 do ADR-004.
   - Alcova da Sala: chão novo em (7, 1) e (8, 2); (7, 2) continua chão; vãos (7, 0) e (9, 2) sem piso; (6, 1), (8, 1) e (8, 3) bloqueados [TBD: Arte confirma (8, 3) no TMX]. Piso do Quarto e do Escritório não encosta no piso da Sala, a não ser pelo vão (E004 se encostar).
   - P4 e P6: marcas com `fechada = true` nos lados dos banheiros (Quarto e Escritório). P5: fora da cópia enquanto a Suíte estiver fechada (pergunta 26 [TBD]).
   - P4, P5 e P6: **fora** da cópia do Marco 1 (áreas fechadas; ADR-004 seção 9).
   - **Chegadas (ADR-004 seção 13; a confirmar pela prévia):** Suíte (P1) e Quarto (P2) ganham 1 tile de chão encostado no gatilho de entrada, do lado de dentro. Esse tile é a chegada. Se a chegada não cair em linha reta com o vão, declarar o objeto `spawn` com `chegada` (id da porta) e `direcao`, no tile. P1: o vão (5, 2) da Sala não pode ter piso; a Arte confirma o corte com o Diretor antes (ADR-004 seção 13.9, item 1). Ver também as perguntas da seção 13.11. **Extensão (13.13 a 13.24):** a P2 depende das premissas da seção 13.21 (número do vão e piso sob a marca do Quarto). Até a Arte confirmar, não gerar a P2 explícita.
6. **Objetos de jogo** (grupo novo; classe no atributo `class`):
   - `spawn` `elevador`, direção `cima`, no Elevador, no bloco mais distante da P8: (0, 2).
   - ~~`spawn` `ao-lado-da-arvore`, direção `direita`: (-3, 2).~~ Sai com o item 036 (ADR-004 seção 11): o destino da condução fica em `conducao` da missão, não no mapa. Ponto de referência: (-3, 2) do TMX, direção `direita`.
   - `arvore`, estado `desmontada`: (-2, 2), bloco mais à direita da Sala, 4ª linha de baixo para cima.
   - `interruptor`: (-7, 0) no TMX de trabalho (planta atual), que é (5, 3) na planta girada (decisão do Diretor, 2026-11-08, item 042). Fora do círculo de luz: a mais de 3 tiles, em linha reta, da chegada da P8 na Sala, (6, 6) girada; hoje 3,16 (ADR-004 seção 8, item 11). **Não** (-8, -2): encosta nas marcas P2 e P3 (posições da planta antiga).
   - `bilhete`, texto `bilhete.pista`: no Hall, em tile de parede ao lado da P8 (na mesma parede), bloqueado, com vizinho livre (ADR-004 seção 6; decisão de 2026-11-08). Antes da rotação, era piso perto da P8, sem ser (0, -1).
   - `examinavel`: Pia, Fogão e Geladeira, cada um com um tile bloqueado do móvel e vizinho livre. Textos `cozinha.pia`, `cozinha.fogao`, `cozinha.geladeira`. Lavanderia sem objeto.
   - Sem `spawn` extra na cozinha: o de chegada da P7 é gerado.
   - `peca` (grupo `Objetos de jogo`, texto `<text>` com a ordem e propriedade `estadoInicial`, ver 2.3): peça 1 em (1, 4) da Sala, peça 2 em (4, 1) da Cozinha e peça 3 em (3, 5) da Cozinha (a Lavanderia é a mesma subárea), todas na planta girada. A peça 3 pode mudar pela pergunta 27 (ADR-004 seção 12.8). Cada peça tem piso sem bloqueante, e não é móvel, parede, vão nem gatilho.
7. **Bloqueantes.**
   - Rotação 0 na cópia de trabalho. Redesenhar o retângulo com as medidas finais, se preciso.
   - Alinhar à grade os móveis que dão 0 tiles pela regra de 50% (Cama 79 e 80, Sofá 81), ou o conversor recusa (E011).
   - **Histórico, antes da rotação (BUG-M12-02; não se aplica à planta girada, ADR-004 seção 12.6). Linha da barra da Sala (linha 10 da tela):** retângulo de colisão no grupo `Objetos da casa bloqueantes` que cubra a linha inteira (TMX x de −10 a −1, y = 5; 1 tile de altura), para bloquear os 10 tiles com piso. **Manter o piso da linha:** sem ele, a caixa da Sala perde uma linha e muda de tamanho. Ver ADR-004 seção 8, item 6.
   - **Depois da rotação da planta (ADR-004 seção 12.6):** a Sala tem 10 linhas, e o retângulo da linha da barra não é mais necessário. Não se põe retângulo nessa linha: a coluna 0 da Sala girada é andável (decisão do Diretor, 2026-11-08).
8. **Confirmar no Tiled** a convenção de pivô de rotação (inventário R12), se alguma rotação não zero permanecer.

---

## 8. Critérios de aceite

- `python3 tools-arte/tmx_para_conteudo.py --atualizar-golden` roda sem erro na cópia de trabalho e gera 8 subáreas. Para o Marco 1, com a opção de rotação da seção 3.1 (valor `90`).
- Sem E018 nem E019. Com rotação `90`, a Sala sai com 11 colunas × 10 linhas (110 tiles), nenhuma subárea tem altura 11, e a linha da tela `sala.linhas − 1` não tem tile de subárea.
- `--verificar` passa logo em seguida (idempotência).
- Com rotação `90`: os pontos e as relações do ADR-004 seção 12 (pares de porta, chegada da P8 e da P7, bilhete, árvore e destino `conducao.luzes`) conferem com o `content/` girado (teste de coordenadas, QA R5).
- Diff do golden (`.txt` e `resumo.json`) revisado pelo Diretor, em imagem ou texto.
- Teste de CI do Generalista passa.
- `validarConteudo` (Dev) passa sobre o `content/` real. Isso cobre as regras de referência e de missão do ADR-004 seção 8.
- **Marco 4 (item 089):** exatamente uma `enfeite` no mapa (sem E029); tile da caixa com 2 vizinhos livres (sem E010). Golden com diff só no tile da caixa (`C`, Escritório (5, 2) na planta girada) e na contagem `enfeite` de `resumo.json`; as demais subáreas ficam byte a byte iguais. A caixa é posta à mão no TMX de trabalho (objeto `enfeite` de id 114, em tile (−11, −10) da cópia atual; o conversor gira).
- **Marco 2 (item 061):** sem E004 (nenhuma fusão de subáreas); E008 nos pares P2 e P3 (vão de 1 tile sem piso); W001 só nos tiles do piso do Escritório que caem na caixa da Sala; três peças presentes e únicas (sem E014, E021, E022 nem E023); golden com diff só de peças, passagens P2 e P3, alcova e a caixa do Quarto (inclui o vão). As áreas já existem no golden (8 subáreas): o Marco 2 não cria área, só muda a abertura (ADR-002 seção 2.2). Grade `.txt` com 1, 2 e 3 nos tiles da tabela 15.2.2 do GDD, na planta girada.
- **Chegada e uma entrada (ADR-004 seção 13):** sem E024 a E027 no golden; cada gatilho de par tem um vizinho livre; cada chegada (declarada ou da fórmula) encosta no gatilho de entrada. O Quarto e a Suíte entram com o tile novo na caixa; a Sala mantém 11×10. Diff do golden revisado pelo Diretor (regra de publicação).
- **Vão livre (ADR-004 seção 13.13):** par com chegada declarada nos dois lados passa com vão de 2 ou mais tiles; vão com piso ou marcas desalinhadas dá E008; `saida` gravado em todo `porta`; golden com a coluna `saida` e sem W027 novo além de P7 e P8.
