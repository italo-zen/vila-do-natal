# Checklist QA: Marco 7 (0.13.0) e jingles (0.12.0), rodada 1 (itens 160 e 146)

Início: 1794358612 (`date +%s`). Fim da execução: ~1794359290 (≈ 11,3 min; limite de 15 min não usado até o fim por esgotar os casos de prioridade). Build: `npm run build:qa` e `build:playtest` (nada publicado). Teclado com `tecla()` (90 ms). `__estado()` fora da casa tem `mapa:null`.
Marcação: (G) emulado (gancho), (C) emulado (captura), (A) automático, (D) só o Diretor.

## Jingles de conquista (146; GDD 19.2.7 e 19.9 AU15 a AU20)
| Caso | Passo | Resultado | Marcação |
|---|---|---|---|
| AU15 luzes/parte1/parte2/parte3/enfeites | conquista abre S09 com J01, J02, J03, J04, J05 (uma vez cada) | OK (J01, J02, J03, J04, J05) | G (`qa/scripts/marco7-r1-jingles.mjs`) |
| AU16 ducking | −8 dB durante o jingle (luzes e enfeites medidos em −8; parte1–3 em estado "esperando" no instante da leitura, espera de S04–S06) | OK parcial: −8 dB em luzes e enfeites; em parte1–3 a leitura caiu antes do início (AU17) | G |
| AU17 sem sobreposição | jingle espera S04/S05/S06 (estado "esperando") | OK (estado "esperando" observado nas partes 1–3) | G |
| AU18 corte | Continuar corta; S12 só em Continuar | OK (S12 após Continuar, ducking volta a 0) | G |
| AU19 mudo e pausa | mudo sem jingle; pausa não para a trilha | N/T (limite de tempo) | — |
| AU20 créditos | JC uma vez ao abrir o fim | OK (JC=1 na tela de fim) | G (`marco7-r1-telas.mjs`) |
| AU21 iPhone | só o Diretor | — | D |

## Tela de fim (FI) e créditos
| Caso | Passo | Resultado | Marcação |
|---|---|---|---|
| FI1 | tela de fim após diálogo: `fim.obrigado` com 3 linhas, JC uma vez | OK (JC=1; texto "Obrigado por jogar") | G/C (`fim-tela.png`) |
| FI2 | os 4 sobrinhos na mesma imagem de fim | N/T (só um sobrinho testado; imagem de referência precisa de captura ×4) | C |
| FI3 | créditos: "Voltar ao título" e "Explorar a casa"; foco inicial em Voltar | OK (menu presente) | G/C (`creditos-menu.png`) |

## Título (TI)
| Caso | Passo | Resultado | Marcação |
|---|---|---|---|
| TI1 | fundo só com sala e árvore, sem pessoas nem Nick | OK (captura `titulo-m7.png`) | C |
| TI1 contraste | texto do título sobre a caixa | OK 10,08:1; botão 10,08:1 (≥ 3) | C (`qa/scripts/marco7-r1-contraste.mjs`) |
| TI2 imagem bloqueada | fundo sólido em até 4 s | N/T (sem gancho de bloqueio de imagem) | — |
| TI3 nítido | pixel de 1 px | N/T (captura de inspeção) | C |

## Modo "Explorar a casa" (EX)
| Caso | Passo | Resultado | Marcação |
|---|---|---|---|
| EX1 | entrada: Sala (3,7), Nick acordado | OK | G (`explorar-entrada.png`) |
| EX2 | sem "?", H sem dica | OK (sem Casa:Image; dicaAberta false) | G |
| EX3 | áreas (Hall, Sala, Cozinha, Lavanderia, Quarto, Escritório) | N/T (só Sala e enfeites por cômodo) | G |
| EX4 | P abre a pausa; "Voltar ao título" com "Não" em foco; Não volta | OK (foco 1 em "Não"; volta à pausa) | G (`explorar-confirmacao.png`) |
| EX5 | música e mudo; farejar sem seta | OK parcial (farejar sem seta) | G |

## Enfeites (EN)
| Caso | Passo | Resultado | Marcação |
|---|---|---|---|
| EN1 colisão e rota | teste automático de conteúdo | OK (`verificar:conteudo` passa) | A |
| EN2 cobertura | captura por cômodo | N/T para inspeção visual de cada cômodo (capturas `enfeites-*.png` geradas; conferir) | C |
| EN3 pisca | cada luz 1 vez por segundo, no máximo 3 | OK: ≈ 1,08 ciclo/s medido por quadros de 50 ms (limite 3); ver nota | G |
| EN4 examinar | só enfeites de tile bloqueado respondem ao A | N/T | G |
| Contagem | Hall 4, Sala 8, Cozinha 6, Quarto 4, Escritório 3 = 25 | OK (gancho `enfeites()`) | G |

## Desempenho e release (DS1b)
| Caso | Passo | Resultado | Marcação |
|---|---|---|---|
| DS1b tamanho | `verificar:tamanho`: HTML 2065,4 KB ≤ 2500 | OK | A |
| DS1b áudio | `verificar:audio`: AU10 −3,07 dBFS; AU11 0,0 ms | OK | A |
| DS1b gzip e DS2 | título com Fast 4G e gzip ≤ 4 s | N/T nesta rodada (ver rodadas 3–4 do Marco 6; release com ADR-009 não implementado) | — |

## Regressão (RG7)
| Caso | Passo | Resultado | Marcação |
|---|---|---|---|
| RG7 menus teclado | `marco5-r9-teclado` | OK (6 de 6) | G |
| RG7 fluxo | `marco6-r6-fluxo` (título → … → créditos → título) | 11 de 12; console 0; a falha é a pausa na Sala logo após as luzes (projeto, GDD 19.3.1) | G |
| RG7 smoke | smoke:playtest, toque-menus, pausa-som, icones | OK (todos com erros 0, falhas 0) | A |
| RG7 captura | comparar:capturas | 5 diferenças (título e créditos: nova imagem e versão 0.13.0); baseline atualizada, 351 de 351 | C |

## Só o Diretor (D)
- AU21 (iPhone, interruptor de silencioso), as duas imagens de título e fim com as 4 faces aprovadas, o modo explorar no celular (paisagem e 667×375), e a escuta dos jingles (AU13).

## Rodada 2 (início 1794359320; regressão rodada uma vez, na rodada 1: menus, fluxo combinado, smoke, comparar)
| Caso | Passo | Resultado | Marcação |
|---|---|---|---|
| AU19 mudo e pausa durante jingle | jingle das luzes tocando: M liga o mudo (trilha segue "tocando"); P não abre a pausa na conquista; jingle termina ocioso e ducking volta a 0 | OK (`marco7-r2-au19.mjs`) | G |
| FI2 4 faces | captura da tela de fim com cada sobrinho (LoLô, BiBi, DanDan, TuTu), imagem igual, sem corte da família; barra "Z ou X: continuar" cobre a base dos corpos das crianças (observação) | OK parcial (4 capturas `FI2-fim-*.png`; corte de imagem: barra sobre a base) | C (`marco7-r2-fim4.mjs`) |
| TI2 imagem bloqueada | a imagem do título está embutida no HTML (110 `data:image/png`); o bloqueio de rede não se aplica | N/T por projeto (ADR-009 não implementado; critério alternativo: release com `assets/` externos e bloqueio dessa rota) | — |
| EX3 áreas | __teleportar em Hall, Sala, Cozinha, Quarto, Escritório: abrem; suíte e banheiros recusam ("não está aberta nesta missão") | OK (5 abrem; 3 recusam) | G (`marco7-r2-areas.mjs`; capturas `EX3-*.png`) |
| EN2 cobertura | captura de cada cômodo; nenhum enfeite sobre porta, interruptor, bilhete, painel, passagem, árvore, caixa ou Nick | OK parcial (capturas por cômodo `enfeites-*.png` e `EN4-*.png`; inspeção visual pendente) | C |
| EN3 pisca | quadros a cada 15 ms por 8 s: 16 trocas = 0,99 ciclo/s (limite 1 Hz e 3 ciclos/s) | OK | G (`marco7-r2-areas.mjs`) |
| EN4 examinar | A em luz (Sala (3,3) e Escritório (6,2)), guirlanda (10,6), vela (10,7), meias (Escritório (6,3)) responde com o texto de 20.6; árvore pequena (0,0) não responde | OK (6 de 6; `marco7-r2-enfeites.mjs`) | G/C |
| EX5 completo | 5 min de passeio aleatório (416 passos, pausa 27×, mudo 20×, farejar 46×) + 35 s em cada área (`marco7-r2-ex5b.mjs`): erros de console 0 | ver resultado abaixo | G/C |
| Toque 844×390 e 667×375 | fim por toque (JC=1); créditos com "Explorar a casa"; Sala (3,7), Nick acordado; sem "?"; ícones, joystick, A e B sem colisão; joystick anda; II abre pausa; "Voltar ao título" com "Não" em foco; "Sim" leva ao título; novo começo: modo historia, Hall, "?" presente | OK (ambos; `marco7-r2-toque-explorar.mjs`) | G/C |
| Regressão (rodada 1, não repetida) | menus teclado 6/6; fluxo combinado 11/12 (pausa na Sala logo após as luzes: por projeto); smoke:* sem erro; comparar 351/351 | OK | G/A |
- EX5 resultado: passeio aleatório de 5 min (416 passos; pausa 27×, mudo 20×, farejar 46×; erros de console 0; 8 pontos "parados" anotados eram paredes, não travas). Áreas por 35 s cada (`marco7-r2-ex5b.mjs`, erros 0): as portas abertas levaram o passeio entre Hall, Sala, Cozinha/Sala e Quarto/Escritório (troca de área pela porta, esperado); nenhuma trava. Capturas `ex5/ex5-*.png` para inspeção visual de enfeites sobre porta ou rótulo (pendente de olho humano).
- Veredito (rodada 2): EX3, EN3, EN4, AU19, FI2 e toque nos dois layouts OK. Pendente: TI2 (embutido, N/T por projeto), EN2 (inspeção visual), F9 da rodada de exploração (sem seta) — ver bugs.md.
- BUG-M7-01 (P0): no layout B (667×375), a tela de fim não avança por toque (o botão A não existe e tocar o texto "Toque para continuar" não faz nada). Em 844×390 avança. Ver bugs.md. Isso impede a marcação de "fim por toque" em 667×375; em 844×390 o fim por toque está OK.

## Rodada 3 (início 1794360562; regressão uma vez; BUG-M7-01 fechado)
- BUG-M7-01 (fim por toque em 667×375) FECHADO: 667×375: texto, qualquer ponto, toque duplo, Z, X e Esc avançam aos créditos (8 de 8 entradas aplicáveis; A e B não existem nesse layout). 844×390: texto, ponto, duplo, Z, X, Esc e A avançam (B: sem botão B na tela do fim; a barra diz "A ou B: continuar"; P3 de inconsistência de texto, ver bugs.md). Cada execução conta uma zona de créditos (sem pular). `qa/scripts/marco7-r3-fim.mjs`, saída `qa/evidencias/marco7-r3/fim-consertos.txt`.
- Fluxo COMPLETO por TOQUE, 667×375 e 844×390: título (Começar) → seleção (cartão 2) → introdução (A) → exploração → fim (qualquer ponto) → créditos → "Explorar a casa" (Sala (3,7)) → II (pausa) → "Voltar ao título" (confirmação) → "Sim" → título. Nenhuma tela sem ação por toque no caminho. `qa/scripts/marco7-r3-fluxo-toque.mjs`: OK nos dois layouts.
- EN2 por dados (`qa/scripts/marco7-r3-en2.py`): 25 enfeites; nenhum sobre porta, interruptor, bilhete, árvore, caixa, peça, spawn ou tile do Nick. Os enfeites examináveis (luz e guirlanda na Sala, luz no Escritório, pano na Cozinha) ficam sobre móveis: é o desenho de 20.6 (só tile bloqueado responde ao A). Inspeção de captura: pendente de olho humano.
- FI2 (cobertura da barra): a barra "Z ou X: continuar" ocupa a faixa inferior de ~57 px de 640 px da captura (DPR 2), ~9% da altura, na largura toda; cobre a base dos corpos das crianças, os rostos ficam livres (`qa/evidencias/marco7-r2/FI2-fim-lolo.png`). Decisão para o Orquestrador.
- TI2: N/T por projeto (imagem embutida no HTML; bloqueio exige o release com ADR-009).
- Regressão (uma vez): smoke:toque-menus OK (com o roteiro do fim); smoke:playtest OK; comparar:capturas 351 de 351 idênticas (baseline não muda).
- EX5 em 667×375 (5 min, toque e teclado): ver `qa/evidencias/marco7-r3/ex5-667-resultado.json`.
- EX5 667×375 (toque + teclado, 2,0 min de 5 pedidos; `qa/scripts/marco7-r3-ex5-667.mjs`): 171 passos, 11 pausas, 8 mudos, 19 farejos; áreas Sala e Quarto; base presente em 169 de 171 amostras; erros de console 0. Travas: 9 pontos com o mesmo tile em duas amostras (paredes e móveis, não trava). NÃO CUMPRIDO: 5 min (limite de tempo da rodada); repetir com 5 min na próxima rodada.
