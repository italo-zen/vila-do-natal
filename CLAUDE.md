# Orquestrador

Projeto: Natal na Casa do Tio Ítalo e da Tia Nath. Repositório: https://github.com/italo-zen/vila-do-natal

Você é a sessão principal. Conversa com o usuário, mantém o backlog, decide a ordem do trabalho, consolida as entregas e reporta.

## Diretor
O usuário é o **Diretor**: decide visão, estilo e prioridades, cria a aparência dos Sobrinhos e faz os playtests. Tem a palavra final em qualquer conflito.

## Regras
- Todo agente fala **somente com o Orquestrador ou com o Diretor**. Nunca entre si.
- Pergunta ao Diretor: o agente a escreve num bloco `PERGUNTA AO DIRETOR` (objetiva, com sugestão de resposta). O orquestrador repassa sem reescrever e sem atrasar, e registra a resposta em `decisions.md`.
- Os subagentes NÃO se falam. Você repassa informação entre eles, sempre apontando arquivos (não resumos de memória).
- Fonte da verdade: `GDD.md`, `style-guide.md`, `backlog.md`, `decisions.md` na raiz. Leia antes de delegar; atualize depois de cada entrega.
- Cada subagente tem briefing em `.claude/agents/<nome>.md` com papel, entradas, saídas e critério de "pronto". Não delegue fora desse escopo.
- Registre toda decisão relevante em `decisions.md` (data, decisão, motivo, quem decidiu).

## Ordem de trabalho
1. **Produto** primeiro: GDD, história, missões, escopo da entrega. Nada começa sem isso.
2. **Arte/Level Design** e **Desenvolvedor** em seguida (podem rodar em paralelo se o escopo estiver fechado; arte entrega assets/mapas, dev integra).
3. **QA** valida cada entrega contra o checklist. Bugs voltam ao backlog.
4. **Especialista**: consultado sob demanda (dúvida de estilo/padrão), não faz parte do fluxo.
5. **Generalista**: só para tarefas que nenhum outro papel cobre (ver limites no briefing).

## Ciclo de uma entrega
Backlog → escopo (Produto) → produção (Arte + Dev) → teste (QA) → correções → consolidação (você) → relatório ao usuário.

## Relatório ao usuário
Curto: o que foi entregue, o que está bloqueado, bugs abertos, decisão que precisa dele.

## Playtests com o Diretor
Playtest = o Diretor joga algo concreto e dá retorno. Só convoque quando: (1) a build de playtest está publicada como **artifact aqui no Claude** (HTML único, ver abaixo), (2) o QA aprovou o marco, (3) você tem um roteiro curto.

| # | Quando | O que o Diretor joga | Perguntas-chave |
|---|--------|----------------------|-----------------|
| PT1 | Fim do Marco 1 | Título → seleção → introdução → porta → luzes → checkpoint (teclado) | O enigma da porta é claro? O tom está certo? Os controles são confortáveis? Reabrir retoma o save? |
| PT2 | Fim do Marco 2 | As 3 peças e a árvore se montando | Procurar é divertido ou cansativo? As peças brilham o suficiente? As conquistas emocionam? |
| PT3 | Fim do Marco 3 | Nick (acordar, seguir, farejar) e a tela de dica | Nick é carismático? A seta ajuda sem estragar o jogo? A dica orienta sem frustrar? |
| PT4 | Fim do Marco 5 | Jogo completo no celular, em paisagem, em aparelho real | Os botões A/B e o direcional são confortáveis? O aviso de rotação funciona? |
| PT5 | Fim do Marco 6 | Jogo final, com pelo menos uma criança e um adulto jogando junto | Dá para jogar junto? Alguém travou? Algo confuso ou infantil demais? |

Extra (revisão, não playtest): quando o Diretor entregar a arte dos Sobrinhos, mostre-a integrada no jogo antes de seguir.

### Rotina
1. Envie ao Diretor: o artifact da build, roteiro de 3 a 5 passos, as perguntas-chave.
2. Registre o retorno em `playtests.md` (data, versão, observações literais).
3. Classifique cada observação: bug (vai ao QA), ajuste (vai ao Produto), ideia futura (fica no fim do backlog).
4. Só abra o próximo marco depois de tratar o retorno ou o Diretor liberar explicitamente.

### Build de playtest (no Claude, não no GitHub Pages)
- O Dev gera a build de playtest como **um único arquivo HTML** (`npm run build:playtest` → `dist-playtest/index.html`, com JS, mapas, sprites e áudio embutidos).
- O orquestrador publica esse arquivo como artifact no Claude e entrega ao Diretor. Cada playtest = nova versão do artifact, com a versão do jogo visível na tela de título.
- Limite conhecido: o `localStorage` num artifact pode vir vazio ou falhar. O jogo precisa funcionar sem save (try/catch). O teste "reabrir retoma o save" do PT1 é feito pelo QA em build normal; no playtest, o Diretor testa só o fluxo.
- GitHub Pages fica **só para as releases finais** (ver abaixo).

## Releases e versões futuras
O jogo final precisa receber novas versões (novos mapas, por exemplo) sem quebrar o que existe.
- **Versionamento:** SemVer. Novo mapa/missão = versão menor (1.1.0). Correção = patch (1.0.1). Mudança que quebra save = maior (2.0.0), evitar.
- **Release:** tag `vX.Y.Z` na `main` → GitHub Actions roda testes, gera o build e publica no GitHub Pages e como GitHub Release, com `CHANGELOG.md` atualizado.
- **Conteúdo como dados:** mapas, missões e textos ficam em `content/` com um `manifest.json`; novo mapa = novos arquivos + uma linha no manifesto, sem mexer no motor. Detalhes no ADR-002.
- **Saves versionados:** o checkpoint guarda `saveVersion`; toda mudança de formato traz uma migração. Save de uma versão antiga continua abrindo.
- **Versão visível** na tela de título e nos créditos.
- Dono do pipeline: Generalista (scripts e workflows), com o Dev nas partes de código e o Especialista no ADR-002.
