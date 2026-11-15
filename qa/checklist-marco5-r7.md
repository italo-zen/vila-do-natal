# Checklist QA: Marco 5 (v0.9.0), rodada 7 (FINAL; escrito antes da execução)

Início: 1794253563 (`date +%s`). Limite: 15 min CHEIOS (fim no relógio, 1794254463 ou depois).
Build: `npm run build:qa` refeito (layout B corrigido pelo Dev: menus sem cruz/A/B; barra `.toque.menu`). `build:playtest` passou sem gancho.
Roteiro: `qa/scripts/marco5-r7.mjs`. Capturas: `qa/evidencias/marco5-r7/`.

## Parte 1: toque, 844×390 (layout A) e 667×375 (layout B)
| ID | Verificação | Resultado | Evidência / nota |
|---|---|---|---|
| T-TIT | Título: barra "Toque num item do menu"; sem cruz, A nem B; Começar e Como jogar tocáveis; sem sobreposição com texto | | |
| T-COM | Como jogar: "Toque em Voltar"; sem controles; Voltar tocável | | |
| T-SEL | Seleção: "Toque no cartão para começar"; cartões tocáveis (confirmam o sobrinho) | | |
| T-INT | Introdução: A/B fora da caixa de texto no layout B; barra "A: avançar  B: voltar" | | |
| T-EXP | Exploração: cruz, A, B e "?" sem sobrepor o texto da barra; barra "Setas: andar  A: examinar" e "B: farejar  ?: dica" | | |
| T-DIC | Dica: "Toque em Voltar"; sem controles; Voltar tocável; "?" some | | |
| T-CON | Conquista: "Toque em Continuar" (A/B fora da caixa); Continuar tocável | | |
| T-PAI | Painel: grade 5×3 sem cruz/A/B; "Fechar" tocável | | |
| T-CRE | Créditos: "Toque em Voltar ao título"; Voltar ao título tocável | | |
| T-ROT | Aviso de rotação 390×844 com toque (textos exatos, sem controles) e volta a 844×390 sem perder o ponto | | |
| T-CAM | Caminho completo por toque até os créditos (peça 3, caixa, encaixe, plot twist) nos dois layouts | | |

## Parte 2: 107 (teclado, 2 sobrinhos LoLô 017 e BiBi 020)
| ID | Verificação | Resultado | Evidência / nota |
|---|---|---|---|
| F3 | Mesmo cômodo com Nick acordado e adjacente: ocupadoNick, farejo e balão "Au!" a cada 200 ms por 2 s; captura quadro a quadro | | |
| F5 | Nick dormindo: "zzz" (captura) e sem seta | | |
| N9 | Chegada da parte 3: 3 páginas do plot twist; Nick dorme no tile da próxima fase | | |
| N10 | Cômodo do Nick por fase (luzes Sala; parte 1 Cozinha; parte 2 Quarto) | | |
| RM2-c | Luzes: "Parabéns, você conseguiu acender as luzes." | | |
| RM2-d | Peça 1: conquista e "Agora a árvore tem 1 parte. Faltam 2 partes!" | | |
| RM2-e | Peça 2: aviso de chegada (Cozinha) | | |

## Resultados (rodada 7, até 1794254111, ~9 min)
- T-TIT/T-COM/T-SEL/T-INT/T-EXP/T-DIC em 667×375: OK. Barras de menu com `.toque.menu` ("Toque num item do menu", "Toque em Voltar", "Toque para escolher", "Toque em Voltar ao título"). Sem cruz nem A/B nos menus; sem sobreposição.
- T-SEL 667×375: botão "Voltar ao título" (zona 392×49) leva ao título por toque. Não aparece em 844×390 (OK). Teclado: N/T (não rodado nesta rodada).
- FALHA em 844×390 (BUG-M5-03): título, Como jogar, seleção e dica ainda com cruz e A, e barra antiga. Captura `844x390_t_tulo.png`.
- T-ROT: aviso 390×844 OK nos dois layouts; sem controles; volta ao ponto.
- T-CAM: caminho completo por toque até os créditos em 844×390 (OK) e 667×375 (OK, com Continuar pelo canvas "Conquista:Zone" em layout B; a conquista em layout B não tem A/B, como o Dev definiu). Versão 0.9.0 nos créditos; Voltar ao título OK.
- F3 OK (LoLô e BiBi): `ocupadoNick=1` por ~1,2 s depois do X (Nick acordado, mesmo cômodo); capturas `*-F3-0000ms.png` a `*-F3-2000ms.png`.
- F5 OK: X com Nick dormindo: sem seta, sem ocupado; capturas `*-F5-zzz-0..3.png` (o "zzz" é balão de sprite; a captura é a prova).
- RM2-b OK (porta P8 pelo código 017 e 020); RM2-c OK ("Parabéns, você conseguiu acender as luzes.").
- N10 OK (leitura de estado após cada fase): Nick em Sala (8,5) na luzes, Cozinha (5,3) na parte 1, Quarto (4,3) na parte 2, Escritório (6,1) na parte 3.
- N9: peça 3 OK ("Parabéns, você conseguiu encontrar a última parte..."), plot twist página 2 OK ("Mas tem algo estranho... Ainda falta alguma coisa."), página 3 NÃO lida (FALHA de leitura; "Deve estar perdida pela casa." não apareceu no buffer do roteiro: conferir captura); Nick dorme na Sala (8,5) depois do diálogo, fase enfeites: OK.
- RM2-d/e: peça 1 e peça 2 com aviso não repetidas nesta rodada (N/T). RM2-d coberto por rodada 5 (aviso "Faltam 2 partes"), não revisto.
- N/T: F6, F7, F8, F9 (esta rodada); teclado da barra de menu (não aparece no teclado) não testado nesta rodada.
