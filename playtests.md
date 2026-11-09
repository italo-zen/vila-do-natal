# Playtests

> Dono: Orquestrador. Roteiro e calendário em `CLAUDE.md` (seção Playtests com o Diretor).

## Modelo de registro

### PT# — data — versão/link da build
- **Quem jogou / aparelho / navegador:**
- **Observações do Diretor (literais):**
- **Classificação:**
  - Bugs → `qa/bugs.md` (IDs)
  - Ajustes → itens de backlog (IDs)
  - Ideias futuras →
- **Liberado para o próximo marco?** sim / não


### PT1 — 2026-11-07 — v0.1.0 (artifact https://claude.ai/artifact/CoeWrzbkQBsnmStFsnBqNP)
- **Quem jogou / aparelho / navegador:** Diretor, teclado (aparelho e navegador não informados)
- **Observações do Diretor (literais):**
  - Jogabilidade: "está legal, no geral, todos os botões funcionaram"; "seleção dos personagens funcionou bem legal"
  - "quando inicia o jogo no Hall acredito que precisa mais da caixa de texto para explicar o que fazer."
  - "para acender as luzes precisa ficar exatamente na frente da luz, talvez faça sentido conseguir interagir com o interruptor sem ter que estar no pixel exato."
  - "quando acontece o re-spawn depois de acender as luzes, é importante ter algo que 'chame' o jogador para interagir com a árvore (por exemplo ela piscar). Ou então já soltar a caixa de texto explicando a próxima etapa do jogo."
  - Arte: "não gostei tanto da arte em si, acho que está muito parecido com o pokemon clássico e de fato eu vou querer algo mais próximo de sea of stars. mas sei que ainda estamos em testes e em fases iniciais."
  - "tela de 'conquista' ficou bem legal."
  - "A cor do texto dos botões de escolha podem ser diferentes do texto informativo, ou então colocar um fundo atrás sinalizando melhor que é um botão."
  - Mapa: "Parece que foi feito aleatoriamente mas queria já deixar num formato que é igual da minha casa."
  - "Estou fazendo um arquivo no software Tiled que eu gostaria que fosse o mapa."
- **Classificação:**
  - Bugs → nenhum novo
  - Ajustes → 016 (texto de orientação no hall), 017 (interruptor com área de interação tolerante), 018 (chamar o jogador à árvore após as luzes), 019 (botões distintos do texto), 020 (mapa da casa real em Tiled, aguarda o arquivo)
  - Ideias futuras → 021 (direção de arte estilo Sea of Stars; ligada ao item 014/ADR-003)
- **Liberado para o próximo marco?** não, aguarda tratar o retorno ou liberação explícita do Diretor

## PT1b (build 0.2.0, casa real) — enviado ao Diretor em 2026-11-08
- Artifact: https://claude.ai/artifact/CoeWrzbkQBsnmStFsnBqNP (Version 3). QA: aprovado com ressalvas (Marco 1.2).
- Roteiro: ver mensagem ao Diretor. Retorno: pendente.

## PT1c (build 0.3.0) — enviado ao Diretor em 2026-11-08
- Artifact: https://claude.ai/artifact/CoeWrzbkQBsnmStFsnBqNP (Version 4). QA: aprovado com ressalvas (Marco 1.3). Inclui condução automática, última linha da Sala bloqueada, Geladeira e Forno, arte dos sobrinhos corrigida (a Version 3 tinha sprites em 4 cores).
- Retorno do Diretor: pendente (sem acesso ao notebook em 2026-11-08).

### PT1d (build 0.3.0, Version 4; rotulado PT2 na época) — 2026-11-08 — Diretor, teclado
- **Observações do Diretor (literais):**
  - "quando abrir o local da senha, tire o texto com a dica (é para o jogador ler no bilhete)"
  - "no hall, deixe o bilhete na parede, parece que ele está no chão."
  - "bug: quando abre a parte da senha, o AWSD não está funcionando, apenas as setas."
  - "Não está claro que há uma passagem entre a sala e a cozinha."
  - "A posicão do interruptor precisa ser mudada, mandei o novo local no print aqui" (o print NÃO chegou ao Orquestrador; pedido de reenvio)
  - "A arte das portas não está legal. Prefiro uma are com a visão mais 'Superior' da porta, sendo um retangulo comprido."
  - "A porta P1 parece que tem duas entradas, é para ter 1 só."
  - "De resto, foi tudo ok."
  - Depois: "vai precisar rotacionar mesmo! será melhor" (planta girada 90° à direita; tela deitada)
- **Classificação:**
  - Bug → 038 (WASD no painel da senha) — Dev
  - Ajustes → 039 (tirar dica do painel da senha), 040 (bilhete na parede), 041 (passagem Sala↔Cozinha clara), 042 (novo local do interruptor; aguarda print), 043 (arte das portas em vista superior, retângulo comprido), 044 (P1 com uma só entrada), 045 (rotação da planta 90° à direita, tela deitada)
  - Ideias futuras → nenhuma
- **Liberado para o próximo marco?** não; Marco 1 segue aberto até tratar estes itens.

## PT1e (build 0.4.0, rotulado PT2b na época) — enviado ao Diretor em 2026-11-08
- Artifact: https://claude.ai/artifact/CoeWrzbkQBsnmStFsnBqNP (Version 5). QA: rodadas 13 e 14 aprovadas (038–045), com ressalvas (árvore desmontada como pilha pequena; móveis de 1 tile sem nome; resto de cena atrás do painel, BUG-R13-03). Capturas aprovadas pelo Diretor antes de publicar.
- Inclui: planta girada 90° horário, interruptor em (5,3), bilhete na parede, portas em vista superior, P1 com uma só entrada, passagem Sala↔Cozinha, painel "Senha" sem dica e com WASD, móveis como retângulos com nome, árvore no tile certo.
- Retorno do Diretor: pendente.

### PT1e — retorno do Diretor (2026-11-08, build 0.4.0)
- **Observações (literais):**
  - "a planta girada ficou bem melhor e a porta entre a cozinha e a sala ficaram melhor!"
  - "as portas ficaram menos pior. Nas portas que foram para a direita ou esquerda, inclua setas como o print de referencia que eu mandei. Já que a visão isometrica superior faz com que fique difícil entender que ali tem uma porta. Assim ficará melhor do jeito que está. A portas que forem para o sentido de andar para cima do mapa são as mais fáceis de identificar pois a arte isometrica permitirá a identifação dela. As portas que foram para "baixo" deverão ficar como uma flecha indicando a saída ou então um "tapete" que indique a saida, como no segundo print que enviei."
  - "a condução ficou legal! só achei que não precisa pedir para interagir com a árvore novamente. Leve o personagem até a árvore e force a interação, uma vez terminada, o personagem está livre para explorar."
  - "mantenha a árvore como está, está difícil de entender com essa arte mas quando aumentarmos os pixels (parecido com o Sea of Stars, vai melhorar)."
  - "Testei uma senha errada e esse fluxo está ótimo também."
  - Referências enviadas: assets/referencia/ref_porta_seta.webp (seta branca na porta lateral) e ref_saida_tapete.webp (tapete vermelho na saída de baixo).
- **Classificação:**
  - Bugs → nenhum
  - Ajustes → 046 (indicadores de porta: seta nas portas laterais; seta ou tapete nas portas para baixo; portas para cima ficam como estão), 047 (condução termina forçando a interação com a árvore; depois o jogador fica livre)
  - Mantido → árvore como está; planta girada, passagem Sala↔Cozinha e fluxo de senha errada aprovados
  - Ideias futuras → nenhuma nova (arte em estilo Sea of Stars já é o 021)
- **Liberado para o próximo marco?** pendente: tratar 046 e 047 e confirmar com o Diretor


## PT1f (build 0.5.0, rotulado PT2c na época) — enviado ao Diretor em 2026-11-08
- Artifact: https://claude.ai/artifact/CoeWrzbkQBsnmStFsnBqNP (Version 6). QA: 047 aprovado nos 4 sobrinhos, 046 aprovado (setas em P1, P3 e P7, tapete no vão), BUG-R15-01 corrigido (caixa do diálogo no topo). Capturas aprovadas pelo Diretor antes de publicar.
- Inclui: indicadores de porta (seta nas laterais, tapete fora do piso na saída de baixo), diálogo da árvore automático na chegada (caixa no topo), GDD reescrito na planta girada.
- Retorno do Diretor: pendente.

### PT1f — retorno do Diretor (2026-11-08, build 0.5.0)
- **Observações (literais):** "esta tudo certo para essa versão inicial. testei e está tudo operando normalmente"
- **Classificação:** bugs → nenhum; ajustes → nenhum; ideias futuras → nenhuma nova.
- **Marco 1 aprovado pelo Diretor.** Liberação do Marco 2: pendente (o Diretor não liberou explicitamente).

## PT2 (build 0.6.0, Marco 2) — enviado ao Diretor em 2026-11-08
- Artifact: https://claude.ai/artifact/CoeWrzbkQBsnmStFsnBqNP (Version 7). QA: aprovado com ressalvas (rodadas 1 a 3 do Marco 2). Capturas aprovadas pelo Diretor antes de publicar.
- Inclui: as 3 partes da árvore (peça 1 na Sala, 2 na Cozinha, 3 na Lavanderia), conquistas, encaixe e diálogo por parte, aviso "ainda não" com a peça fora de ordem, condução com 2× e fade na P7, árvore em 1, 2 e 3 partes (sem enfeite), Quarto aberto pela P2, Escritório pela P3, portas com seta e tapete, Suíte fechada.
- Retorno do Diretor: pendente.
