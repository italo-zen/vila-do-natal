# Changelog

Mudanças notáveis do jogo, no formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), com [SemVer](https://semver.org/lang/pt-BR/).

Entradas de 0.1.0 a 0.4.0 ainda não foram transcritas; entram antes da 1.0.0 (ver `docs/checklist-release.md`, item 4).

## [Não lançado]

- Versão 1.0.0 (lançamento completo) entra aqui depois que o teste final com crianças e adultos for aprovado.

## [0.11.2] - 2026-11-10

### Corrigido
- A música de fundo repete a trilha inteira. Antes, em alguns aparelhos, como o iPhone, ela voltava ao começo no meio da trilha.
- Se o som começar antes de o aparelho liberar o áudio, a música recomeça assim que ele liberar.
- Erros de áudio deixam de ficar escondidos, o que ajuda a achar problemas.

Sem mudanças visuais.

## [0.11.1] - 2026-11-10

### Corrigido
- Som no iPhone: o áudio agora carrega arquivo por arquivo, e uma falha em um arquivo não derruba os outros.
- O primeiro toque destrava o som com mais segurança.
- O jogo respeita a chave de silencioso do iPhone: com a chave ligada, o jogo fica mudo; com a chave desligada, o som toca. O ícone de som do jogo continua sendo o mudo do próprio jogo.

## [0.11.0] - 2026-11-09

### Adicionado
- Música de Natal com sinos e celesta, em laço, tocando em todas as telas. O som começa no primeiro toque ou clique, como os navegadores exigem.
- 13 efeitos sonoros: passos, portas, interruptor, peças da árvore, encaixe, latido do Nick, farejar, conquista, diálogo, troca de item nos menus, confirmação e erro no código.
- Mudo pela tecla M ou pelo ícone de som, que aparece no título e na exploração. O mudo também silencia a música.
- Tela de pausa pela tecla P ou pelo ícone de pausa (II), na exploração. Traz Continuar, Como jogar, Som e "Voltar ao título". Ao voltar ao título, um aviso pede confirmação, com "Não" já selecionado.
- Como jogar com duas linhas novas: "P: pausa. M: mudo." (teclado) e "No alto: pausa e mudo." (celular).

### Alterado
- Nomes dos sobrinhos e rótulos de móveis em letra de 16 px; o nome do DanDan em 14 px. Nenhum texto do jogo fica abaixo de 12 px.
- O painel do código passa a ter fundo sólido: nada da cena aparece por trás dele.
- O aviso "Quase!" e as outras mensagens de erro do painel do código somem assim que a criança digita a primeira tecla.

### Corrigido
- Na seleção de sobrinhos, a área de toque de "Voltar ao título" não invade mais os cartões.
- Ferramenta de teste: a base do joystick era listada durante a troca de cômodo e a condução, mesmo escondida. Não afeta o jogo.

## [0.10.0] - 2026-11-09

### Adicionado
- Joystick virtual fixo no canto inferior esquerdo do celular, no lugar da cruz: base de 120 px com bolinha e anel na direção. Movimento em 4 direções, sem diagonal (GDD 18.19).

### Alterado
- Menus no celular: um empurrão no joystick = um passo.

## [0.9.1] - 2026-11-09

### Corrigido
- Cruz na tela navega o título (cima e baixo) e a seleção de sobrinhos (esquerda e direita). Um toque = um passo; segurar não repete (BUG-M5-04, PT4).

## [0.9.0] - 2026-11-09

### Adicionado
- Marco 5, toque e rotação (GDD 18, ADR-007): botões A e B, painel de código por toque, cruz na tela, aviso para girar o celular e escala no celular.

## [0.8.1] - 2026-11-09

### Alterado
- Plot twist na parte 3: ao montar o topo da árvore, o diálogo tem três páginas ("Ainda falta alguma coisa"). A caixa de enfeite e o Nick dormindo só aparecem depois (PT4a, pedido do Diretor).

## [0.8.0] - 2026-11-09

### Adicionado
- Marco 4, enfeite e créditos (GDD 17): caixa de enfeite no Escritório, encaixe final e diálogo de fechamento.
- Créditos com a versão do jogo.

## [0.7.1] - 2026-11-09

### Alterado
- Seta de farejar: duas tremidas e depois amarela parada.
- Nick fica encostado no sobrinho, um tile atrás. Na troca de cômodo, o Nick entra oculto e aparece no primeiro passo.

## [0.7.0] - 2026-11-09

### Adicionado
- Marco 3, Nick e dicas (GDD 16): o Nick acorda com A, segue o sobrinho, dorme por fase e comemora na chegada com conquista.
- Farejar (X ou B): seta na próxima porta por 5 s.
- Dica (H ou "?"), com imagem, e tela Como jogar com 7 linhas.

## [0.6.0] - 2026-11-08

### Adicionado
- Marco 2, peças da árvore (GDD 15): as três partes (Sala, Cozinha e Lavanderia), tela de conquista, encaixe e diálogo por parte.
- Árvore montada em 1, 2 e 3 partes; Quarto liberado pela parte 2 e Escritório pela parte 3.
- Aviso "ainda não" para peça fora de ordem; condução com fade nas passagens.

## [0.5.0] - 2026-11-08

### Adicionado
- Marco 1 fechado (GDD 14): indicadores de porta (seta nas laterais e tapete no vão da saída).
- Diálogo automático da árvore na chegada.

### Corrigido
- A caixa do diálogo cobria a árvore na chegada; agora ela vai para o topo (BUG-R15-01).
