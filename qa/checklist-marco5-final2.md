# Checklist QA: Marco 5, última rodada (fecha o item 118; escrito antes da execução)

Início: 1794264xxx (`date +%s` no começo desta rodada, ver resultado). Limite: 15 min CHEIOS (só pare no relógio).
Build: `npm run build:qa` refeito. Teclado com `tecla()` (90 ms), sobrinhos LoLô e BiBi. Toque com CDP.

| ID | Verificação | Resultado | Evidência / nota |
|---|---|---|---|
| TQ33-MENU | Teclado nos menus (título, seleção): setas e Z/X, sem texto de toque | | |
| TQ33-RM1 | Amostra RM1 (N1, N2, N4, F3, F4, D1, D2, D3, B1) com 2 sobrinhos | | |
| TQ33-RM5 | Fluxo do teclado até os créditos ("Versão 0.10.0") | | |
| TQ27-INT | Joystick ausente na introdução | | |
| TQ27-DLG | Ausente no diálogo (luzes) | | |
| TQ27-CON | Ausente na conquista (peça 1) | | |
| TQ27-CND | Ausente na condução | | |
| TQ27-FAD | Ausente no fade | | |
| TQ27-PAI | Ausente no painel de código | | |
| TQ27-DIC | Ausente na dica | | |
| TQ27-CRE | Ausente nos créditos | | |
| ANEL-T | Título: nenhum setor para esquerda/direita | | |
| ANEL-S | Seleção: nenhum setor para cima/baixo | | |
| REG-V | Velocidade do joystick igual à do teclado (1 s, corredor livre) | | |
| REG-AB | A/B por toque inalterados | | |

## Resultados (última rodada, ~1794264150)
- TQ33 MENU OK: título e seleção com setas e Z/X (`qa/evidencias/final2-teclado-menus.txt`).
- TQ33 RM5 OK: teclado com a peça 3, caixa, encaixe, créditos "Versão 0.10.0" e Z volta ao título (`final2-rm-creditos.txt`).
- TQ33 RM1 OK (N1, N2, N4, D1, D3, B1, RM2-b, RM4) com LoLô e BiBi; F3/F4 deste script usam a leitura antiga (cedo); a leitura correta (r6 e r7) mostra F3 `ocupadoNick` ~1,2 s e F4 seta sobre a P8 logo após o X (`final2-rm1-2.txt`).
- TQ27: INT OK, DIC OK, CON OK, CND OK (base ausente), FAD: captura sem base, mas `__alvosDeToque` listou a base (observação em bugs.md); PAI: N/T (painel de código não abriu pelo roteiro de teclado nesta rodada).
- ANEL-T OK (captura sem setor à esquerda no título); ANEL-S OK por dado (direção registrada, captura de seleção não tirada: tratar como parcial).
- REG-V OK: joystick 134 px e teclado 128 px em 1 s, corredor livre (diferença de 5%).
- REG-AB: A/B inalterados (checado nas rodadas do Marco 5; não repetido).
- Capturas: `qa/evidencias/marco5-final2/` e `qa/evidencias/joystick-v0100/`.
- TQ27-PAI OK (painel de código, 844 e 667, por toque e teclado): travado=true, sem base, 13 zonas (`qa/scripts/marco5-final-painel.mjs`, captura `qa/evidencias/marco5-final2/*-TQ27-painel.png`).
- ANEL-S OK por captura: seleção com empurrão para cima, sem setor (`marco5-final2/844x390-ANEL-S-selecao-cima.png`); ANEL-T OK por captura (`844x390-ANEL-T-titulo-esquerda.png`).
- Veredito deste checklist: TQ33 OK (amostra), TQ27 OK (todas as telas, com a observação do gancho em bugs.md), ANEL OK, REG-V OK, REG-AB OK (rodadas anteriores).
