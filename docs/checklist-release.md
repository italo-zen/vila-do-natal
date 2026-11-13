# Checklist de release

Fonte: GDD 19.7.2 (itens 1 a 12, valem para a 1.0.0) e ADR-002 seção 1 (pipeline). Para as versões seguintes (1.0.1, 1.1.0 etc.), valem os itens de build, CHANGELOG e tag; os de playtest final e de Pages só se o marco pedir.

O artifact de playtest (CLAUDE.md) não é release: não tem tag e não passa por este checklist. Para ele, basta `npm run build:playtest`.

Legenda: **auto** = passa pelo workflow `.github/workflows/release.yml` ou por `npm run verificar:release`; **manual** = conferido por pessoa e registrado no relatório.

## Uma vez (configuração do repositório)

- [ ] Settings > Pages > Source: **GitHub Actions**. (Manual.)
- [ ] Settings > Environments > `github-pages` > Deployment branches and tags: permitir tags `v*`. Sem isso, o deploy da tag é recusado. (Manual.)
- [x] Repositório público (decidido pelo Diretor, 2026-11-09).
- [x] Endereço do site: `https://italo-zen.github.io/vila-do-natal/`, sem domínio próprio (decidido pelo Diretor, 2026-11-09).
- [ ] `main` como branch padrão do GitHub (Settings > Branches). Só depois que a `main` receber o código. (Manual; o Diretor altera.)

## Rotina de cada tag

1. Marco entregue, QA aprovado e playtest registrado em `playtests.md`.
2. `package.json` com a versão nova (Dev) e a seção `## [X.Y.Z] - AAAA-MM-DD` no `CHANGELOG.md`.
3. Na raiz, nesta ordem; cada comando deve sair com código 0:
   ```
   npm run build:playtest
   npm test
   npm run verificar:conteudo
   npm run validar:perfil -- hd-480x352
   npm run verificar:audio
   npm run build:release
   npm run verificar:tamanho
   npm run verificar:release -- --tag vX.Y.Z
   ```
   (`verificar:audio` roda em modo de verificação, sem gravar: confere a trilha e os efeitos de `content/audio.json` contra `assets/audio/`.)
   (`build:playtest` vem antes de `npm test`: o teste de gancho lê `dist-playtest/index.html`.)
4. Commit na `main`, com autorização do Diretor.
5. Ensaio: Actions > Release > Run workflow, sem tag. Testes e build rodam; nada é publicado.
6. Tag, pelo Orquestrador e depois do aval do Diretor: `git tag -a vX.Y.Z -m "Natal na Casa do Tio Ítalo e da Tia Nath vX.Y.Z"` e `git push origin vX.Y.Z`.
7. Acompanhar o workflow até o fim. Só então conferir o Pages e a GitHub Release.

O workflow recusa a tag que não segue `vX.Y.Z` (inclui sufixos como `-rc1`) e a tag que não aponta para um commit da `main`.

## Verificação do áudio (`npm run verificar:audio`)

- Roda `/usr/bin/python3 tools-arte/gerar_audio.py --verificar`. Use o Python do sistema: o do Homebrew não tem numpy.
- Recalcula o PCM dos 14 arquivos (música e 13 efeitos) em memória e compara o SHA-256 com `assets/audio/audio-meta.json`. Não escreve nada. Sai com 1 se algum arquivo não bater.
- Depois confere, no mesmo meta, AU10 (pico de cada arquivo em -3 dBFS ou menos) e AU11 (silêncio no início e no fim da trilha em 20 ms ou menos).
- Faça antes de cada tag. Se o PCM divergir, o áudio foi gerado de novo ou editado à mão: regenere com o script (`/usr/bin/python3 tools-arte/gerar_audio.py`) e confirme o diff do meta.

## Portões do Marco 6 (antes da tag 1.0.0; ver GDD 19.9 e ADR-008)

| Portão | O que confere | Quando | Quem |
|--------|---------------|--------|------|
| AU13 | Escuta da trilha e dos efeitos: a música agrada, a emenda do laço não se percebe, os efeitos não irritam e a música não cansa em 15 min | antes do PT5 | Diretor (só o Diretor) |
| AU14 | Teste de áudio no artifact (um botão e um tom, dentro do iframe): o som toca no clique. Resultado positivo do Diretor em 2026-11-09 (aparelho e navegador não informados). Repetir no artifact 0.11.0 e confirmar no celular | antes do PT5 | Orquestrador, Diretor |
| DS2 | Título pronto em até 4 s com Fast 4G emulado, medido na transferência de rede. Referência do build atual: 9,4 s sem gzip; 3,86 s com gzip | no Pages, antes da tag | QA |
| Gzip | A resposta do `index.html` no Pages vem comprimida (`Content-Encoding: gzip`). Sem isso, o DS2 passa de 4 s | no Pages, antes da tag | QA |
| AU10 e AU11 | `npm run verificar:audio` passa (ganhos, pico e laço). Roda no workflow, no job de verificação, antes do build de release | em cada build | auto |
| Tamanho | `npm run verificar:tamanho` (ADR-008 revisão 2, 8.4). Só o que `content/audio.json` referencia conta: trilha `mus_` ≤ 160.000 B; efeitos `sfx_` ≤ 12.000 B cada e ≤ 160.000 B somados; jingles `jin_j0*` ≤ 16.000 B cada e ≤ 64.000 B somados; créditos `jin_jc*` ≤ 64.000 B; áudio total ≤ 320.000 B; HTML do playtest ≤ 2.500.000 B (na release externa, o limite é de gzip, ver "Release externa"). Aviso (não reprova) se o HTML sem o áudio passar de 2.000.000 B. A ferramenta diz qual schema detectou (1: 13 eventos, até a 0.11.0; 2: conquistas e créditos, a partir da 0.12.0). Valores de referência (Arte, 2026-11-10; podem mudar na escuta): schema 2 com 19 arquivos, total 301.148 B sem o S09 (com o S09, 309.629 B); jingles 62.674 B; JC 62.502 B. Schema 1 (0.11.0): 14 arquivos, 184.453 B | em cada build | auto |
| PT5 | Playtest final com criança e adulto, no celular em paisagem e no computador, roteiro de GDD 19.7.3. Só depois do retorno aprovado em `playtests.md` a tag `v1.0.0` sai | antes da tag | Diretor, Orquestrador |

## Critérios da 1.0.0 (GDD 19.7.2)

| # | Critério | Como se confere | Quem |
|---|----------|-----------------|------|
| 1 | PT5 aprovado pelo Diretor, com criança e adulto. Retorno em `playtests.md`. Nenhum bug de severidade alta aberto; médios e baixos aparecem como conhecidos no CHANGELOG | manual | Orquestrador, Diretor |
| 2 | Checklist do Marco 6 (`qa/checklist-marco6.md`, GDD 19.9) aprovado, com o que ficou "não testado (limite de tempo)" listado | manual (relatório do QA) | QA |
| 3 | `package.json` com `"version": "1.0.0"`; título "v1.0.0" e créditos "Versão 1.0.0" | auto: versão, tag e versão no build. Título e créditos: captura conferida | Dev, Orquestrador |
| 4 | `CHANGELOG.md` com as seções de 0.1.0 a 1.0.0, em Keep a Changelog; a 1.0.0 resume os Marcos 1 a 6 e lista os conhecidos | auto: seção da tag. As anteriores: manual | Generalista |
| 5 | Tag `v1.0.0` na `main`; workflow verde (testes, `verificar:conteudo`, `validar:perfil`, `verificar:tamanho`, build) | auto (workflow) | Orquestrador |
| 6 | Pages com o jogo e a versão visível; GitHub Release com a seção do CHANGELOG | auto (workflow) e conferir o link | Orquestrador |
| 7 | Build final = código aprovado no PT5: mesmo commit, ou só versão e CHANGELOG | manual: `git diff --stat <commit-do-PT5> vX.Y.Z` deve listar só `package.json`, `CHANGELOG.md` e documentos | Orquestrador |
| 8 | Sem gancho de QA; sem escrita em `localStorage`; sem nome de pessoa da família além de "Tio Ítalo" e "Tia Nath" | auto: `verificar:release` (gancho, código-fonte, build, lista de nomes em `tools/verificar-release.mjs`) | Generalista |
| 9 | `docs/audio-licencas.md` completo, com a origem de cada arquivo | auto só confere que o arquivo existe (quando há `assets/audio`, que já existe); o conteúdo é manual | Arte |
| 10 | Smoke no Pages: título, exploração, créditos e volta ao título, no Chromium, sem erro de console | manual, no endereço publicado | QA |
| 11 | Teste de novo mapa via manifesto (item 013) passa | auto (passo "Novo mapa entra só pelo manifesto" do workflow) | Dev |
| 12 | `metrics/resumo.md` escrito | manual | Orquestrador |

## Depois da release

- Registrar a publicação em `decisions.md` (data, versão, link do Pages e da Release).
- Conferir que o CHANGELOG da 1.0.0 lista os conhecidos e que o `backlog.md` marca o item 141 como concluído.
- Ideias pós-1.0 ficam no backlog (item 142), sem sair da lista sem decisão do Diretor.

## Medida de referência para o ADR-009

Medida em 2026-11-10 com gzip nível 6 (`zlib`, o padrão de servidores), sobre o HTML de build em 0.11.2. Sem alterar o build: a versão "sem áudio" é uma cópia fora do repositório com as data URLs removidas.

| Build | Áudio embutido | Bruto | gzip nível 6 |
|-------|----------------|-------|--------------|
| Release atual (`dist-release/index.html`, schema 2) | 19 arquivos, 402,0 KB brutos (290,1 KB de gzip) | 2.065.399 B | 858.478 B |
| Mesmo build sem o áudio | nenhum | 1.663.406 B | 568.396 B |
| Playtest atual (`dist-playtest/index.html`, schema 1) | 14 arquivos | 1.903.602 B (com) / 1.657.328 B (sem) | 743.406 B (com) / 565.494 B (sem) |

Leitura: o áudio pesa cerca de 290 KB de gzip no build atual, e 34% do HTML comprimido é áudio. O limite de 727.000 B do ADR-009 (seção 5) fica entre os dois casos: o build atual com áudio passa do limite em 131.478 B, e sem áudio ficaria 158.604 B abaixo. Com o 727 KB do QA (DS2, 3,86 s), a medida mais próxima é a do HTML com áudio da 0.11.x (743 KB no playtest, a diferença de 16 KB é de versão); sem áudio, seriam cerca de 565 KB. Portanto, o 727 KB do QA não é o HTML sem áudio. A confirmação exata exige o build da 0.11.0 que foi medido, que não está mais no repositório.

Estimativa de transferência (não é medida): em 1,6 Mbps (200 KB/s), 858 KB levam cerca de 4,3 s só de transferência, acima do limite de 4 s do DS2. Confirmar com DS1b no Pages.

## Release externa (ADR-009, item 159)

A release (`npm run build:release`) não embute áudio nem imagens de tela no HTML. A pasta `dist-release/` tem `index.html` (código, sprites, textos), `audio/` (19 arquivos com hash no nome), `imagens/` (título e fim) e `recursos.json` (lista, bytes e sha256). O playtest continua HTML único, com tudo embutido.

Passos de release, além dos da rotina:

1. O `npm run verificar:release -- --tag vX.Y.Z` e o `npm run verificar:tamanho -- dist-release/index.html` detectam o modo pela presença de `recursos.json`. Conferem: lista ↔ arquivos ↔ hashes; nenhum órfão; nenhum `data:audio/` no HTML; nenhuma imagem de tela em base64; gzip nível 6 do HTML ≤ 727.000 B; imagem ≤ 60.000 B cada (aviso acima de 50.000); áudio ≤ 320.000 B com os orçamentos por classe; atlas `dec_*` ≤ 16.000 B e embutido; rede e rascunho.
2. `npm run smoke:release` sobe `dist-release/` em subcaminho e na raiz, com gzip e Fast 4G emulado (DS1b). Usa o Google Chrome instalado (channel `chrome`), que já vem no runner do GitHub: nenhuma instalação de navegador é necessária. Local: confirmado em 2026-11-12, com o título desenhado em cerca de 3,1 s e 21 arquivos respondendo 200.
3. O workflow publica a pasta inteira no GitHub Pages e anexa à GitHub Release o zip de `dist-release/` (`vila-do-natal-vX.Y.Z.zip`), com a seção do CHANGELOG.
4. Depois do Pages no ar, conferir no endereço publicado: título com a imagem da árvore, tela de fim, áudio tocando depois do primeiro toque, e nenhum erro no console (QA, DS1b).

Exceção documentada: o texto `https://phaser.io` (banner e configuração do Phaser) não é requisição, e a checagem de rede o trata como aviso. O `fetch` do polyfill do Vite e o do carregador do jogo são os dois únicos `fetch(` aceitos no HTML. A confirmação real de rede é o smoke.
