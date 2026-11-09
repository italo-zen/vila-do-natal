# Natal na Casa do Tio Ítalo e da Tia Nath

Jogo de aventura 2D em pixel art, feito com Phaser 3 + TypeScript + Vite.
Design em `GDD.md`, padrões em `style-guide.md`, decisões em `docs/ADR-001.md` (camadas) e `docs/ADR-002.md` (versões e conteúdo como dados). Fluxo dos agentes em `CLAUDE.md`.

**Estado:** Marco 1 (fatia vertical): título, "Como jogar", seleção, introdução, porta, luzes e exploração livre. Sem save: cada abertura começa no título.

## Como rodar

```bash
npm install
npm run dev            # desenvolvimento (http://localhost:5173)
npm test               # testes Vitest (domínio, aplicação, arquitetura)
npm run build          # build para GitHub Pages (pasta dist/)
npm run build:playtest # arquivo único dist-playtest/index.html (sem rede)
npm run smoke:playtest # abre o playtest num Chrome headless e checa o console (precisa do Google Chrome)
```

`dist-playtest/index.html` abre por duplo clique: JS, mapa, sprites e fonte estão dentro do arquivo. A versão do jogo aparece no canto da tela de título.

## Controles (teclado)

| Ação | Teclado |
|---|---|
| Mover | Setas ou WASD |
| Botão A (conversar, examinar, avançar, confirmar) | Z ou Enter |
| Botão B (voltar, fechar textos e painéis) | X ou Esc |

Título: X e Esc não fazem nada (decisão do Diretor). Mouse: funciona só nos botões do título e de "Como jogar".
Painel da porta: dígitos digitam, X (ou Backspace) apaga, Esc fecha; setas movem o foco nas teclas, o foco começa em OK, Z/Enter confirma no OK e aperta a tecla focada nas demais.

## Estrutura

```
src/
  domain/          regras puras (sobrinhos, código da porta, fases, progresso)
  application/     casos de uso, validação de conteúdo, movimento (sem Phaser/window)
  infrastructure/  adaptador do conteúdo (import.meta.glob do content/)
  presentation/    cenas Phaser, UI, entrada de teclado, escala inteira
  main.ts          composition root (monta conteúdo, serviços e jogo)
content/           conteúdo como dados (ADR-002): manifest.json, maps/, missions/, texts/
assets/            sprites e tiles (provisórios, gerados por tools/)
tools/             gen:assets (sprites), gen:conteudo (mapa da casa), smoke-navegador
tests/             Vitest: domínio, aplicação, arquitetura e "novo mapa via manifesto"
```

## Conteúdo

- Textos, mapas, missões e manifesto ficam em `content/`. O motor lê `content/manifest.json`; não conhece mapas pelo nome.
- **Novo mapa** = arquivo novo em `content/maps/` + uma linha em `manifest.json` (o teste `tests/application/conteudo.test.ts` cobre isso).
- `content/maps/casa.json` é gerado por `tools/gerar-mapa.mjs` a partir do desenho em texto do próprio script. Quando o Level Design fizer o mapa no Tiled, o export substitui o arquivo.
- Códigos da porta: `src/domain/personagem/sobrinhos.ts` (tabela única, GDD 4.2).

## Assets

Os PNG em `assets/` são **provisórios** (`tools/gerar-assets.mjs`). Arte final deve manter os mesmos nomes e tamanhos: sobrinhos 16×24, tiles 16×16, escala inteira em 240×160.

## Versão

A versão vem de `package.json` (`version`) e é injetada pelo Vite. Nunca digitada no código (ADR-002).
