# Backlog

> Dono: Orquestrador. Estados: `ideia` → `escopo` → `em produção` → `pronto para QA` → `aprovado` / `reprovado`
> GDD v1.0 já existe. Produto não reescreve; resolve pendências e quebra os marcos em itens.

## Pendências do GDD (seção 12) — bloqueiam a fatia vertical os marcados com ⛔

| ID | Pendência | Dono | Estado |
|----|-----------|------|--------|
| P1 | Suporte visual da pista no hall (texto definido pelo Diretor: "os 3 últimos dígitos do ano em que {nome} nasceu") | Produto + Arte | ideia |
| P6 ⛔ | Aparência/traços de LoLô, BiBi, DanDan, TuTu (usuário vai criar; sprites provisórios bastam na fatia 1) | Usuário → Arte | aguardando usuário |
| P6a | Diálogos com o nome do sobrinho | — | decidido |
| P6b | Sobrinhos são pessoas reais? (fotos, privacidade) | Usuário | ideia |
| P7 | Visual do escuro (lanterna ou penumbra) | Arte | ideia |
| P2 | Cômodo da caixa de enfeite (≠ cômodos das peças) | Produto + usuário | ideia |
| P3 | Onde Nick dorme após cada item (fixo ou sorteado) | Produto | ideia |
| P4 | Seta do farejar: até achar ou por tempo | Produto | ideia |
| P5 | Nick reage ao entrar no cômodo do item? | Produto | ideia |
| P8 | Fonte ajustável | Dev | ideia |
| P9 | Trilha sonora | Arte/áudio | ideia |

## Marco 1 — Fatia vertical
Seleção de personagem (sprites provisórios), introdução, porta, luzes, checkpoint.

| ID | Item | Dono | Estado | Critério de aceite | Depende de |
|----|------|------|--------|--------------------|-----------|
| 001 | ADR-001: Clean Architecture + DDD | Especialista | ideia | Documento em `docs/ADR-001.md` com camadas e regras de dependência | — |
| 002 | Setup do projeto (Phaser 3, TS, Vite, Vitest) | Dev | ideia | `npm run dev` abre o jogo; `npm test` roda | 001 |
| 003 | Tela de título (Começar/Continuar) | Dev | ideia | Continuar só aparece com save | 002 |
| 004 | Seleção de personagem (4 sobrinhos) | Dev + Arte | ideia | Escolha cosmética salva no checkpoint | 002, P6 |
| 005 | Introdução (hall do elevador + texto com o nome do sobrinho) | Dev + Produto | ideia | Texto lido com A, usa o nome escolhido, entra na casa | 004 |
| 006 | Movimento, interação A/B, diálogo | Dev | ideia | Teclado funcionando, câmera fixa por cômodo | 002 |
| 007 | Enigma da porta + painel de código | Dev | ideia | Código validado pelo sobrinho escolhido (017/020/023/024), sem limite de tentativas, mensagem de incentivo no erro | P1 |
| 008 | Luzes + tela de conquista 1 | Dev + Arte | ideia | Interruptor acende, conquista aparece, nasce ao lado da árvore | P7 |
| 009 | Checkpoint em `localStorage` com `saveVersion` | Dev | ideia | Reabrir retoma fase e sobrinho; falha de storage não quebra o jogo | 006 |
| 010 | Checklist de QA da fatia 1 | QA | ideia | `qa/checklist-marco1.md` pronto antes dos testes | — |
| 011 | Build de playtest em HTML único | Dev | ideia | `npm run build:playtest` gera um `index.html` que abre sozinho, sem rede | 002 |
| 012 | ADR-002: versionamento, conteúdo como dados, saves | Especialista | ideia | `docs/ADR-002.md` com SemVer, formato do manifesto e política de migração | 001 |
| 013 | Conteúdo em `content/` com `manifest.json` (mapa da casa já carregado por ele) | Dev | ideia | Adicionar um mapa de teste ao manifesto o faz carregar sem mudar o motor | 012 |

> Itens 009, 012 e 013 entram no Marco 1 de propósito: formato de save e de conteúdo são baratos de definir agora e caros de mudar depois.

## Marcos seguintes (a detalhar pelo Produto quando o Marco 1 fechar)
2. Peças da árvore (3), conquistas, árvore se montando
3. Nick (acordar, seguir, farejar, voltar a dormir) e tela de dica
4. Caixa de enfeite e créditos
5. Toque (direcional, A/B, ícone de ajuda) e aviso de rotação
6. Polimento: áudio, textos, QA com crianças e adultos
7. Release 1.0 e pipeline de versões futuras: workflow de tag → testes → build → GitHub Pages + GitHub Release, `CHANGELOG.md`, versão na tela de título, teste de migração de save e teste de "novo mapa via manifesto" (Generalista + Dev + QA)

## Playtests (ver CLAUDE.md) — entregues como artifact no Claude
| ID | Playtest | Estado |
|----|----------|--------|
| PT1 | Fim do Marco 1 (teclado) | aguardando marco |
| PT2 | Fim do Marco 2 | aguardando marco |
| PT3 | Fim do Marco 3 | aguardando marco |
| PT4 | Fim do Marco 5 (celular real) | aguardando marco |
| PT5 | Fim do Marco 6 (criança + adulto) | aguardando marco |
