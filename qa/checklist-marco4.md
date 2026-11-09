# Checklist QA: Marco 4 (v0.8.0), rodada 1 (2026-11-09)

Build: `npm run build:qa` (dist-qa/index.html, não publicar). Perfil HD 480x352, Chromium (Playwright, canal Chrome), teclado. Limite 15 min CHEIOS (início e fim com `date +%s`). O que não couber vira "não testado (limite de tempo)".
Roteiro: `qa/scripts/marco4-r1.mjs` (um por sobrinho, `IDX`). Capturas: `qa/evidencias/marco4-r1/`.
Fonte: GDD 17.13 (casos EN, CR, RG) e ordem de prioridade de 17.13: EN2, EN3, EN5, EN8, CR1, CR2, RG1, EN10, EN11, RG2.

Legenda: OK / FALHA / N/T (não testado, com motivo). Os resultados são preenchidos depois da execução.

| ID | Prio | Verificação | Resultado | Evidência / nota |
|---|---|---|---|---|
| EN1 | 2 | Antes do diálogo de chegada da parte 3: sem caixa; A no tile mostra "Ainda não!" e "Essa é a caixa de enfeites. Monte a árvore antes."; Z avança, X fecha, nada muda. Captura | | |
| EN2 | 1 | Depois do diálogo de chegada da parte 3: Nick vai dormir na Sala com fumacinha; caixa no Escritório com brilho dourado, legível a 3 tiles, sem cobrir a barra. Nenhum enfeite na Sala | | |
| EN3 | 1 | A de frente (Q1) e de lado (Q4) abre "Parabéns, você conseguiu encontrar a caixa de enfeites de Natal!" com "Z ou X: continuar". Z, X, Enter continuam. Diagonal (Q5) não abre | | |
| EN4 | 1 | Condução sem tocar: sobrinho vai a (3, 7) da Sala, de frente para a árvore; barra vazia; teclas e Esc não mudam nada. Registrar passos e velocidade (2× se passar de 10 passos) | | |
| EN5 | 1 | Encaixe em ~1,7 s; enfeite sobe e encaixa com flash; árvore vira estado 4 só no fim. Captura de 3 quadros | | |
| EN6 | 3 | Nick acordado: "feliz" e "Au!" uma vez junto do encaixe, sem atrasar o diálogo. Nick dormindo: nada | | |
| EN7 | 3 | "Agora a árvore está toda enfeitada!" / "Feliz Natal para a família!" sozinhos, 200 ms de entrada bloqueada; Z avança, X fecha; nenhuma página passa sozinha | | |
| EN8 | 2 | Depois do diálogo final: fade de 0,5 s e tela de créditos, sem tecla extra. Ao menos uma vez por sobrinho, no que couber | | |
| EN9 | 3 | Caixa pega uma vez por partida (nova partida mostra caixa escondida de novo, antes da parte 3) | | Coberto pelo CR3 se houver tempo |
| EN10 | 2 | Farejar na fase enfeites: da Sala seta sobre P3 (direita); do Escritório "Au!" sem seta; da Cozinha seta sobre P7 (esquerda); do Quarto seta sobre P2 (esquerda); do Hall seta sobre P8 (cima); Nick dormindo: "zzz" | | |
| EN11 | 2 | H e o ícone "?" abrem "Dica" com `dica.enfeites` (dormindo e acordado), árvore no estado 3. H não fecha; Z, X, Esc e "Voltar" fecham | | |
| EN12 | 3 | H, ícone e B sem efeito na conquista, condução, encaixe, diálogo final e fade | | |
| CR1 | 2 | Textos exatos de 17.7 e 17.8; nome do sobrinho escolhido; árvore no estado 4; Nick feliz; "Versão 0.8.0". Captura | | |
| CR2 | 2 | "Voltar ao título" com foco inicial; Z, X, Enter, Esc e clique voltam ao título com foco em "Começar"; barra "Z ou X: voltar ao título" | | |
| CR3 | 3 | Nova partida após voltar começa do zero (título, seleção, introdução, porta, Nick dormindo na Sala, caixa escondida) | | |
| CR4 | 3 | 30 s parado nos créditos: nada muda, nada sai sozinho, sem rolagem | | |
| CR5 | 3 | Cada linha até 28 caracteres; sem corte em 480×352; nenhum nome de família além do nome do jogo | | |
| CR6 | 3 | Título e créditos mostram a mesma versão do `package.json` (0.8.0) | | |
| RG1 | 2 | Marcos 1 e 2: título, Começar, seleção, introdução, porta, luzes, conquista 1, condução, partes 1 a 3 com as chegadas e avisos das peças 2 e 3. E9 e E12 de 15.10 com o novo texto do estado 3 | | |
| RG2 | 3 | Marco 3: N4, N6, F1 e F2 com os sobrinhos, dentro do tempo; "Au!" e "zzz" iguais | | |
| RG3 | 4 | Barra de 2 linhas e ícone "?" na exploração; Como jogar sem mudança | | |
| RG4 | 4 | `npm test`, `verificar:conteudo`, `validar:perfil -- hd-480x352` e `build:playtest` | | Não é o escopo do roteiro de teste de tela; registrar se rodado |
| RG5 | 1 | Caixa não aparece até o diálogo de chegada da parte 3 fechar; partes 2 e 3 só depois da anterior | | |

Capturas obrigatórias (GDD 17.15): EN1, EN2, EN3, EN5 (3 quadros), EN10 (seta para a direita na Sala), EN11, CR1, CR2.
Pendências do Diretor fora deste checklist: aprovação das capturas (095); perguntas 36 e 37.

## Resultados da rodada 1 (2026-11-09, 15 min, Chromium, teclado)

Roteiros: `qa/scripts/marco4-r1.mjs` com `IDX=0 MODO=completo` (LoLô, a partir da parte 3 com o gancho) e `IDX=1 MODO=rapido` (BiBi, a partir da fase enfeites). Capturas: `qa/evidencias/marco4-r1/LoLô/` e `qa/evidencias/marco4-r1/BiBi/`. Tempo: 97 s + 81 s de execução, mais preparação.
Limite do gancho: `__irParaFase('enfeites')` conclui a parte 3 sem o diálogo de chegada, então o EN2 e o RG5 só foram vistos pelo estado do gancho, não pela chegada real. Não foi jogada a peça 3 inteira.

| ID | Resultado | Nota |
|---|---|---|
| EN1 | OK parcial | "Ainda não!" na 1ª página (`LoLô/EN1-ainda-nao.png`); a 2ª página ("Essa é a caixa...") não foi lida (checagem do roteiro só leu a 1ª). Caixa escondida antes da parte 3 (`LoLô/EN1-antes-da-chegada-escritorio.png`). Confirmar a 2ª página |
| EN2 | OK parcial | Caixa com brilho dourado legível no Escritório, sem cobrir a barra (`LoLô/EN2-caixa-escritorio.png`). Nick dormindo na Sala (8,5) pelo estado. Fumacinha e chegada real: não testados |
| EN3 | OK | "Parabéns, você conseguiu encontrar a caixa de enfeites de Natal!" e "Z ou X: continuar" (`LoLô/EN3-conquista.png`, `BiBi`). Diagonal (Q5) e lado (Q4) não testados |
| EN4 | N/T parcial | Condução até (3,7) da Sala, 15 trechos de tile (16 com a porta); barra vazia. Velocidade e tempo não medidos (faltou o cronômetro no fim; `t_fim` não disparou porque a condução terminou com `travado=true` do encaixe). Não dá para afirmar 2× |
| EN5 | N/T | Os quadros EN5-q1 a q3 (`BiBi/`) chegaram tarde: no q2 o diálogo final já estava aberto. Enfeite no ar e flash não capturados. Tempo de 1,7 s não medido. Ver observação do quadrado vermelho abaixo |
| EN6 | N/T | Nick acordado no BiBi (A na Sala, "Au!"), mas não houve encaixe com reação medida |
| EN7 | OK | Página 1 "Agora a árvore está toda enfeitada!" e "Z: avançar  X: fechar"; 4 s sem avançar; Z abre a página 2 "Feliz Natal para a família!" (`BiBi/EN7-pagina1.png`, `EN7-pagina2.png`). Os 200 ms bloqueados não medidos |
| EN8 | OK | Fade e créditos sem tecla extra (LoLô e BiBi) |
| EN9 | N/T | Nova partida não testada nesta rodada |
| EN10 | N/T | Não testado (limite de tempo) |
| EN11 | N/T | Não testado (limite de tempo) |
| EN12 | N/T | Não testado (limite de tempo) |
| CR1 | OK | `BiBi/CR1-creditos.png`: textos de 17.7 e 17.8, "Obrigado, BiBi!", "Versão 0.8.0" no canto superior direito (decisão do Dev), "Voltar ao título" com foco. Árvore no estado 4 e Nick feliz vistos pelo texto. LoLô: textos conferidos no mesmo roteiro (captura `LoLô/CR1-creditos.png`) |
| CR2 | OK | Z leva ao título com "Começar" em destaque (`LoLô/CR2-voltou-titulo.png`). X, Enter, Esc e clique não testados |
| CR3 | N/T | Nova partida após voltar não testada de ponta a ponta |
| CR4 | OK | 30 s parados: nenhum texto novo (LoLô e BiBi) |
| CR5 | OK parcial | Sem corte visível em `BiBi/CR1-creditos.png` (480×352 em 3×); sem nome de família |
| CR6 | OK | Título "v0.8.0" e créditos "Versão 0.8.0" (`LoLô/00-titulo.png`, `BiBi/CR1-creditos.png`) |
| RG1 | N/T | Marcos 1 e 2 não repetidos nesta rodada (ficou para a rodada 2) |
| RG2 | N/T | Marco 3 (N4, N6, F1, F2) não repetido nesta rodada |
| RG3 | N/T | Não testado |
| RG4 | N/T | Não rodado nesta rodada (o Dev reporta em 093) |
| RG5 | OK parcial | Caixa aparece só depois de `__irParaFase('enfeites')` (estado): antes disso, a caixa estava escondida. Chegada real não testada |

Observação para o Diretor e o Dev (não é bug confirmado): na captura `BiBi/EN5-q2.png` aparece um quadrado vermelho com borda branca logo abaixo da árvore, na Sala, perto do Nick. Pode ser a caixa a voar, ou um placeholder de animação. Conferir na rodada 2 com captura cedo.

Não foi aberto nenhum bug nesta rodada (`qa/bugs.md` sem entrada nova).

## Atualização da rodada 1 (EN1, reteste LoLô, 82 s)
- EN1 virou OK: 1ª página "Ainda não!" (`LoLô/EN1-ainda-nao.png`); Z abre a 2ª página "Essa é a caixa de enfeites. Monte a árvore antes." (checagem no roteiro); Z fecha e `travado=false`, mapa igual (nada muda). X não testado nesta rodada.
- EN5 no reteste ficou com "1,1 s" entre o fim da condução e o diálogo final, mas a medição não separa encaixe e diálogo: segue N/T para o tempo exato de 1,7 s.

## Rodada 2 (2026-11-09, DanDan, teclado; roteiros `qa/scripts/marco4-r2.mjs` e `qa/scripts/marco4-r2b-cr2.mjs`; capturas `qa/evidencias/marco4-r2/`)

Passagem REAL da parte 3: a partir de `__irParaFase('parte3')` (atalho só para as partes 1 e 2), a peça 3 foi jogada (A na Cozinha, conquista, Continuar, condução, chegada "A árvore está montada! Que linda!"). Depois da chegada, a caixa existe (a conquista da caixa funcionou sem atalho na parte 3).

| ID | Resultado | Nota |
|---|---|---|
| EN2 | OK | Depois da chegada real: Nick dormindo em (8,5) da Sala (estado). Caixa visível no Escritório (`DanDan/EN2-caixa-escritorio-real.png`). Fumacinha não capturada |
| RG5 | OK | Ordem real: peça 3 → chegada → caixa. Antes da chegada, a caixa não foi vista na passagem (EN1 da rodada 1 continua valendo) |
| EN4 | OK parcial (tempo) | Caixa: 15 trechos de tile, 2,9 s do início à chegada em (3,7). Dois fades de 0,5 s (portas) entram no tempo: sem eles, cerca de 1,9 s, ou ~127 ms por tile (2×, compatível com a regra de 14.11). Medida limpa sem porta: não feita |
| EN5 | OK parcial | Quadros `DanDan/EN5-f00.png` a `EN5-f09.png`: f02 mostra o sobrinho com a caixa aberta sobre o tile dela e "Au!" do Nick; f06 mostra o enfeite vermelho subindo. Tempo medido 1,9 s do início dos quadros até o diálogo final (inclui captura). Ver observação 1 |
| EN6 | OK | Nick acordado (A na Sala, "Au!") e no encaixe "Au!" com a pose feliz (f06). Dormindo: não testado |
| EN7 | OK | Página 1 com Z:avançar, Z abre página 2 "Feliz Natal para a família!" (`DanDan/EN7-pagina2-r2.png`); a 200 ms não medida |
| EN8 | OK | X na página 2 leva aos créditos |
| EN9 | N/T | Nova partida com a caixa escondida antes da parte 3 não verificada (só o início) |
| EN10 | OK | Sala, Nick dormindo: "zzz" (`DanDan/EN10-zzz-nick-dormindo.png`). Nick acordado: seta amarela sobre P3, à direita (`DanDan/EN10-sala-seta-P3.png`). Outros cômodos não testados |
| EN11 | OK | H abre "Dica": "Procure a caixa de enfeites. Aperte X e o Nick fareja." e "Voltar" (`DanDan/EN11-dica.png`); H não fechou (a conferir na captura, que mostra a dica); Z fecha |
| EN12 | OK parcial | H nos créditos sem efeito. H e B durante a conquista/condução não testados |
| CR1 | OK | Créditos DanDan: "Obrigado, DanDan!", "Versão 0.8.0" (`DanDan/CR1-creditos-r2.png`) |
| CR2 | OK | Z (r1), X (r2) e Enter, Esc e clique (`qa/evidencias/marco4-r2/cr2-*/`) voltam ao título com "Começar" em destaque |
| CR3 | OK parcial | Depois de voltar: Começar leva à seleção "Quem vai jogar?". Caixa escondida na nova partida não verificada |
| CR4 | OK | 30 s parados nos créditos: 0 textos novos (DanDan) |
| RG1 | N/T parcial | Peça 3 real, chegada e avisos da parte 3 OK. Porta, luzes, peças 1 e 2 e aviso da peça 2 não repetidos (atalho `__irParaFase`) |
| RG2 | N/T | Marco 3 (N4, N6, F1, F2) não repetido nesta rodada |
| RG3 | OK parcial | Barra de 2 linhas "Setas: andar Z: examinar / X: farejar H: dica" e ícone "?" visíveis (`DanDan/EN2-sala-depois-chegada3.png`). "Como jogar" não reaberta |
| RG4 | OK | `npm test` 483/483 (31 arquivos); `verificar:conteudo` e `validar:perfil -- hd-480x352` com saída 0; `build:playtest` saída 0; sem "__estado" no HTML de playtest |

Observações (não são bugs confirmados; para o Diretor e o Dev):
1. Quadro vermelho da Sala (`DanDan/EN2-sala-depois-chegada3.png`): aparece antes de qualquer encaixe, então é o tapete/decoração da saída de baixo, e não o enfeite. Confirmado.
2. Durante o encaixe, a caixa aberta aparece sobre o tile do sobrinho, cobrindo o corpo (`DanDan/EN5-f02.png`). O GDD 17.4 não fixa a posição. Pode ser o placeholder de animação (ver nota do Dev em 092). Decisão visual do Diretor (captura 095).

## Rodada 3 (2026-11-09, teclado; roteiros `qa/scripts/marco4-r3.mjs`, `marco4-r3b.mjs`, e o existente `marco2-r2-completo.mjs`, `marco3-r9-v071.mjs`, `marco3-r1-nick.mjs`, `marco3-r2.mjs`; capturas `qa/evidencias/marco4-r3/`)

| ID | Resultado | Nota |
|---|---|---|
| EN9 | OK | Depois dos créditos e de "Voltar ao título", nova partida: "Ainda não!" no Escritório antes da parte 3 (`marco4-r3/EN9-nova-partida-escondida.png`). Fase após a nova partida: `porta` (progresso reiniciado). Nick dorme na Sala: não lido nesta rodada |
| EN12 | OK | H e X na tela de conquista (`EN12-conquista-H.png`, sem "Dica"), na condução (`EN12-conducao-HX.png`, Nick dormindo, sem "Dica" nem "zzz") e no encaixe e diálogo final (sem "Dica"). Captura das telas feita |
| EN4 | N/T (limpa) | Sem porta: não possível, porque a condução da caixa sempre passa por P3 (Escritório) |
| EN5 | OK (tempo aprox.) | Polling de `__estado` (chegada em (3,7) até o texto "Agora a árvore está toda enfeitada!"): 1813 ms, com 40 ms de polling. Faixa de ~1,7 s do GDD: aceitável. Estado 4 só no fim: não verificado pela árvore (o exame do estado 4 não existe no fluxo) |
| RG1 | OK parcial | Início real (título, seleção, intro, hall), porta P8 com código, luzes, condução, peça 1 (Au e feliz), peça 2 e peça 3 (bloqueios, conquistas, chegadas) e diálogos de encaixe. Regressão: `marco2-r2-completo.mjs`. Falhas: exame do estado 3 "A na árvore" (esperado, mudou por 17.5: o texto agora é "A árvore está montada!" / "Falta a caixa de enfeites.", confirmado em `marco4-r3b.mjs MODO=exame`), e "parede (4,4)" e "nova partida" (N/T do próprio roteiro). Peças 2 e 3 com teleporte de cômodo (Cozinha), não o caminho de porta |
| RG2 | OK parcial | `marco3-r1-nick.mjs`: N1, N2, N3, N4, N4b, N5, N6, N11, F1, F1b, F1c, F2, F3, D1, D2, D2b, B3 OK. `marco3-r9-v071.mjs`: N6 e F1 OK, tremidas e fumaça OK. "Au!" e "zzz" OK (balão visto na captura `EN10-zzz`, rodada 2) |
| RG3 | OK | "Como jogar" com as linhas de farejar e dica, "Voltar" e "Z ou X: voltar"; X volta ao título (`marco3-r2.mjs` B5). Barra de 2 linhas e ícone "?" na exploração (captura de rodada 2) |
| RG4 | OK | Rodada 2 (`npm test` 483/483, `verificar:conteudo`, `validar:perfil`, `build:playtest`) |

Falso positivo registrado (não é bug): "M1 porta: código 017 abre a P8" em `marco3-r2.mjs` lê o mapa antes da troca de área (já documentado na rodada 3 do Marco 3).
