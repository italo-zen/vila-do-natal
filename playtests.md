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

### PT2 — retorno do Diretor (2026-11-08, build 0.6.0)
- **Observações (literais):** "Está bom até aqui. Pode seguir."
- **Classificação:** bugs → nenhum; ajustes → nenhum; ideias futuras → nenhuma nova.
- **Marco 2 aprovado pelo Diretor e Marco 3 liberado** ("Pode seguir").


## PT3 (build 0.7.0, Marco 3) — enviado ao Diretor em 2026-11-09
- Artifact: https://claude.ai/artifact/CoeWrzbkQBsnmStFsnBqNP (Version 8). QA: aprovado para Chromium desktop com teclado (rodadas 1 a 7; sem bug aberto no jogo). Capturas aprovadas pelo Diretor antes de publicar.
- Inclui: Nick (dorme, acorda com A, segue, abana), farejar com X ou B (seta da primeira porta do caminho, 5 s), dica por H ou pelo ícone "?", barra de 2 linhas, Como jogar com 7 linhas, reação feliz + "Au!" na chegada, Sala com (0,9) e (1,9) bloqueados.
- Não coberto pelo QA: celular/toque, Firefox, Safari, TuTu; entrada pelo código da BiBi (conferir).
- Perguntas-chave: o Nick é carismático? A seta ajuda sem estragar o jogo? A dica orienta sem frustrar?
- Retorno do Diretor: pendente.

### PT3 — retorno do Diretor (2026-11-09, build 0.7.0)
- **Observações (literais):** "Ficou legal! Nick está legal, as mecânicas funcionaram no geral. (1) em um momento na sala, ele não fez a açao de farejar, parecia que o botão não funcionava. Mas acho que foi porque eu já tinha feito o botão de farejar e depois acho que ele não repetiu. No começo não tinha ficado claro que no farejar, ele deixava a seta amarela. Vamos fazer um ajuste, quando o nick farejar, faça 2 animacoes tremulas da seta e a deixe amarela. (2) o Nick está muito longe do outro personagem, deixe ele mais colado. (3) quando muda de fase o nick as vezes aparece a frente do personagem, isso é um comportamento ruim. Deixe assim: quando mudar de comodo, deixe o nick na mesma posição do sobrinho, depois, assim que o sobrinho atinge o 'offset' do nick, ele começa a seguir. Nesse padrão, o nick ficará escondido quando carrega o novo comodo, mas assim que inicia o caminhar, o nick aparece completamente."
- **Classificação:** bugs → nenhum confirmado (investigar se "farejar não repetiu" é bug ou só o Au! no mesmo cômodo, sem seta); ajustes → (a) seta de farejar: 2 tremidas e fica amarela, (b) Nick mais colado (fila menor), (c) troca de cômodo: Nick na mesma posição do sobrinho, oculto até o sobrinho andar o offset, depois aparece e segue; ideias futuras → nenhuma nova.
- **Nick aprovado no geral.** Marco 4 ainda não liberado.

## PT3b (build 0.7.1, ajustes do PT3) — publicado em 2026-11-09
- Artifact: https://claude.ai/artifact/CoeWrzbkQBsnmStFsnBqNP (Version 9, compartilhado com quem tem o link). QA: aprovado para Chromium desktop com teclado (rodadas 8 e 9). Capturas aprovadas pelo Diretor antes de publicar.
- Inclui: seta de farejar com 2 tremidas de 0,4 s e depois amarela parada; Nick 1 tile atrás, encostado; na troca de cômodo o Nick entra oculto no tile do sobrinho e aparece no primeiro passo; B repetido refaz o farejando.
- Não coberto pelo QA: celular/toque, Firefox, Safari, TuTu.
- Retorno do Diretor e do amigo: pendente.

### PT3b — retorno do Diretor (2026-11-09, build 0.7.1)
- **Observações (literais):** "Deu tudo certo, pode continuar."
- **Classificação:** bugs → nenhum; ajustes → nenhum; ideias futuras → nenhuma nova. Retorno do amigo: não informado (registrar se chegar).
- **Marco 3 aprovado pelo Diretor; "pode continuar" tomado como liberação do Marco 4.**


## PT4a (build 0.8.0, Marco 4: enfeite e créditos) — publicado em 2026-11-09
- Artifact: https://claude.ai/artifact/CoeWrzbkQBsnmStFsnBqNP (Version 10, "Anyone with the link"). QA: aprovado com ressalvas para Chromium desktop com teclado (3 rodadas). Capturas aprovadas pelo Diretor antes de publicar.
- Roteiro: (1) jogar até a parte 3 e a árvore montada; (2) ir ao Escritório e achar a caixa (aviso "Ainda não!" antes); (3) pegar a caixa e ver o encaixe e o diálogo final; (4) ler os créditos e voltar ao título; (5) tentar a dica (H) e o farejar (X) na fase final.
- Perguntas-chave: achar a caixa é divertido ou cansativo? A caixa cobrindo o sobrinho no encaixe incomoda? Os créditos emocionam? O texto "Feito com carinho para a família" serve?
- Não coberto pelo QA: celular/toque, Firefox, Safari; medida da condução sem fade; fumaça de dormir no Escritório.
- Retorno do Diretor: pendente.

### PT4a — retorno do Diretor (2026-11-09, build 0.8.0)
- **Observações (literais):** "Está ótimo. Os créditos ficaram legais. Precisamos de alguns ajustes só: quando acha a parte de cima da árvore apenas monta a árvore e não fala mais nada. Neste ponto adicione um 'plot twist': coloque a mensagem que 'terminamos a árvore mas tem algo estranho: tem algo faltando ainda que deve estar perdido pela casa.'"
- **Classificação:** bugs → nenhum; ajustes → (a) diálogo de chegada da parte 3 ganha uma 2ª página com o plot twist; ideias futuras → nenhuma. Créditos aprovados.

## PT4b (build 0.8.1, plot twist da parte 3) — publicado em 2026-11-09
- Artifact: https://claude.ai/artifact/CoeWrzbkQBsnmStFsnBqNP (Version 11, "Anyone with the link"). QA: aprovado com ressalvas para Chromium desktop com teclado (rodadas 4 e 5). Capturas das 3 páginas aprovadas pelo Diretor antes de publicar.
- Muda: ao montar o topo da árvore, o diálogo tem 3 páginas ("A árvore está montada! Que linda!" / "Mas tem algo estranho... Ainda falta alguma coisa." / "Deve estar perdida pela casa."); depois disso a caixa aparece no Escritório.
- Perguntas-chave: o plot twist anima a procurar a caixa? X na página 1 pula o aviso: incomoda?
- Não coberto pelo QA: seta de farejar na cozinha e no quarto, X na página 1, celular/toque, Firefox, Safari.
- Retorno do Diretor: pendente.

### PT4b — retorno do Diretor (2026-11-09, build 0.8.1)
- **Observações (literais):** "Está ótimo."
- **Classificação:** bugs → nenhum; ajustes → nenhum; ideias futuras → nenhuma. **Marco 4 aprovado pelo Diretor.** Marco 5 ainda não liberado.


## PT4 (build 0.9.0, Marco 5: celular) — publicado em 2026-11-09
- Artifact: https://claude.ai/artifact/CoeWrzbkQBsnmStFsnBqNP (Version 12, "Anyone with the link"). QA: aprovado com ressalvas, só emulado no Chromium (toque, 844×390, 667×375, 390×844, DPR 2 e 3); nada em aparelho real. Capturas aprovadas pelo Diretor antes de publicar.
- Roteiro (celular, em paisagem, aparelho real; ao menos uma criança e um adulto): (1) abrir o link com o celular em retrato e ver o aviso de rotação; girar para paisagem; (2) título → Como jogar → Voltar → Começar → escolher o sobrinho por toque (e testar "Voltar ao título" na seleção); (3) jogar até as luzes: painel de código por toque, cruz, A e B; (4) acordar o Nick (A), farejar (B), abrir a dica pelo "?"; (5) ir até o fim: peças, caixa, encaixe, plot twist, créditos, voltar ao título.
- Perguntas-chave: os botões A/B e a cruz são confortáveis (tamanho, posição, dedo cobrindo a tela)? O aviso de rotação funciona? Algum botão cobre algo importante? A barra de endereços atrapalha? A tela fica nítida e o jogo roda leve?
- Não coberto: aparelho real, Safari iOS, Chrome Android, multitoque real, desempenho. Zona de toque do botão "Voltar ao título" da seleção com 1 px de folga a conferir.
- Retorno do Diretor: pendente.

### PT4 — retorno do Diretor (2026-11-09, build 0.9.0, aparelho real)
- **Observações (literais):** "Eu joguei e achei um bug simples. No início: o botão de cima e baixo para navegar entre 'Começar' e 'Como jogar' não funciona. Assim como a tela posterior de seleção de algum sobrinho com a seta de esquerda e direita, também não funciona. Mas faça um ajuste: troque as setas direcionais que aparecem no celular para um controle de direção analógico, que tal?"
- **Classificação:** bugs → (a) cruz na tela não navega nos menus de título e de seleção (vai ao Dev, v0.9.1); ajustes → (b) trocar a cruz por um controle analógico (joystick virtual) no toque (vai ao Produto); ideias futuras → nenhuma.

## PT4b (build 0.9.1, correção da cruz nos menus) — publicado em 2026-11-09
- Artifact: https://claude.ai/artifact/CoeWrzbkQBsnmStFsnBqNP (Version 13, "Anyone with the link"). QA: toque aprovado, teclado quase fechado (F9, "Au!" do F6 e F8 em diálogo e painel sem teste), emulado no Chromium. Capturas aprovadas pelo Diretor antes de publicar.
- Muda: a cruz na tela navega o título (cima/baixo) e a seleção (esquerda/direita); um toque = um passo, segurar não repete (BUG-M5-04). A cruz só gera passo de menu nos menus.
- Roteiro curto: título (cruz cima/baixo, A em Como jogar, B volta), seleção (cruz esquerda/direita), jogar um trecho com a cruz segurada.
- Retorno do Diretor: pendente. Próximo: joystick analógico (0.10.0).

## PT4c (build 0.10.0, joystick virtual) — publicado em 2026-11-09
- Artifact: https://claude.ai/artifact/CoeWrzbkQBsnmStFsnBqNP (Version 14, "Anyone with the link"). QA: joystick e toque aprovados, teclado aprovado com pendências (F9, "Au!" do F6 e F8 em diálogo sem teste), emulado no Chromium. Capturas aprovadas antecipadamente pelo Diretor (prévia do agente).
- Muda: a cruz sai e entra um joystick virtual fixo embaixo à esquerda (base 120 CSS px, bolinha, anel amarelo na direção); movimento em 4 direções, sem diagonal; menus: um empurrão = um passo.
- Roteiro curto (celular em paisagem, aparelho real): título e seleção só com o joystick; andar pela casa; segurar o joystick e apertar A/B ao mesmo tempo; girar o aparelho com o dedo no joystick.
- Perguntas-chave: a base de 120 px é confortável para criança e adulto? A zona morta e o limiar parecem certos ao polegar? O anel amarelo aparece com a mão cobrindo? Multitoque (polegar esquerdo no joystick, direito no A) funciona? A barra do navegador atrapalha?
- Retorno do Diretor: pendente. Pergunta 43 (fixo ou flutuante) com padrão fixo.

## PT5 — v0.11.0 (jogo final), publicado em 2026-11-10 (artifact Version 15)
- **Status:** retorno parcial recebido em 2026-11-10 (macbook e iPhone 16 Pro); criança e adulto ainda não.
- **Quem joga:** o Diretor, com pelo menos uma criança e um adulto jogando junto.
- **Perguntas-chave:** dá para jogar junto? alguém travou? algo confuso ou infantil demais? A música agrada e não cansa, a emenda do laço não se percebe, os efeitos não irritam? Texto e ícones legíveis no celular? Os ícones de pausa e som são fáceis de achar? O jogo carrega rápido?
- **Retorno literal (2026-11-10):** "Testei no macbook e o som saiu normalmente. Mas testei no meu iphone 16pro e não saiu nada. Sobre os áudios: estão legais; as páginas de conquista pode tocar músicas diferentes?; a página de crédito pode tocar um jingle de natal?"
- **Classificação:** (1) iPhone 16 Pro sem som = BUG (P1, vai ao Dev/QA; suspeitas: chave de silencioso do iOS, destrave do contexto no iOS, decodificação; diagnóstico em artifact separado); (2) conquistas com músicas diferentes = AJUSTE (Produto/Arte); (3) jingle de Natal nos créditos = AJUSTE (Produto/Arte). Áudio aprovado pelo Diretor ("estão legais"; AU13 ok no macbook).
- **Respostas do Diretor (2026-11-10):** o botão lateral de silencioso do iPhone estava ligado; jogou no Google Chrome do iPhone 16 Pro (WebKit no iOS). Causa mais provável: o modo silencioso do iOS silencia o Web Audio; o Dev testa o caminho de mídia (<audio> HTML) e entrega diagnóstico.
- **Retorno do Diretor sobre os jingles (2026-11-10, literal):** "queria que ficasse mais diferente entre uma conquista e outra. O de natal, ainda não parece de natal. Não podemos usar um já conhecido mas adaptado para nossa versão? Por exemplo 'we wish you a marry christmas'". Classificação: AJUSTE (Arte): jingles mais distintos entre si; JC com a melodia tradicional de "We Wish You a Merry Christmas" em arranjo nosso.
- **Teste de diagnóstico no iPhone (2026-11-10):** app do Claude no iOS 18.7 (UA "Claude/1.261030.19", em iframe), silencioso DESLIGADO: 14/14 MP3 decodificados no boot e no contexto real; destravar leva o contexto a "running"; "Web Audio puro", S05 e S09 tocaram. Passos 1 e 2 são silenciosos por projeto. Diretor aprovou publicar a v0.11.1 (conserto de áudio, sem jingles) para testar o jogo real no iPhone.
- **v0.11.1 publicada em 2026-11-10 (artifact Version 16):** conserto de áudio do iPhone para testar o jogo real. Retorno pendente.
- **Retorno sobre a v0.11.1 (2026-11-10, literal):** "Continua sem sair as músicas". O diagnóstico simples toca; o jogo real não. Dev investiga a diferença (taxa 44100 vs 48000 no laço, gesto no canvas do Phaser, resume assíncrono) e prepara build de diagnóstico do jogo com painel de texto.
- **Detalhe (2026-11-10):** no jogo real no iPhone ficou tudo mudo, música e efeitos. Indica falha de liberação/saída, não só do laço da trilha.
- **Retorno sobre o diag-jogo (2026-11-10, literal):** "não copiar o texto no celular. Mas agora funcionou o audio. Pode tirar a caixa de texto para eu testar". O build de diagnóstico, com as correções do laço (taxa 44,1/48 kHz), da música refeita ao virar "running" e dos rastros de erro, tocou no iPhone. Publica-se a 0.11.2 sem o painel.
- **v0.11.2 publicada em 2026-11-10 (artifact Version 17):** sem painel, para o Diretor testar o iPhone real. Retorno pendente.
