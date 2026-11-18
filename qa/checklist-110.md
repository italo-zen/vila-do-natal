# Checklist QA 1.1.0 (rodada 1, 10 min; início 1794968385)
Legenda: OK / N/T (limite de tempo)
- PL1/PL2 áreas e portas: OK (resumo.json: 8/70/30/13/17/24/12/4/6 piso; 28 móveis; 18 pontos de porta = 9 portas). Conferido por dados, não por captura.
- PL3/PL6 paredes e esquinas, PL15 móveis (dados): OK pelas suítes (70 arquivos, 1061 testes). Ao vivo: N/T.
- PL5 4 portas, 2 sentidos, contra e A, teclado: OK (16/16, sem voltar sozinho, sem fade preso; `qa/scripts/v110-portas.mjs`).
- PL5 toque 667x375: só hall->sala contra OK; o resto N/T (o script falhou ao achar o botão A no modo explorar; ajuste do script, não do jogo). Toque 844x390: N/T.
- PL7 fechadas (4): OK no teclado (diálogo "Essa porta está fechada."). PL8 código hall-sala: N/T (regressão 1.0.0 passou no smoke-navegador).
- PL14 cacto: smoke-cacto OK (empurra 27 px por vez, repetível, sem erro). Atravessar móvel/parede e A de frente: N/T (testes de domínio passam).
- PL16 enfeites sobre móveis: N/T.
- PL9 fluxo com sobrinho: smoke-navegador OK (4 sobrinhos, partida concluída). Passos reais das conduções 2x: N/T.
- PL11 explorar: entrada OK (Sala), andou pelas 5 áreas na verificação de portas. Sem dica/missão: N/T.
- PL13: tamanho OK (584,1 KB gzip, limite 727; áudio 301,1/320 KB); validar:perfil sem argumento mostra uso (não executado de fato); verificar:conteudo executado em segundo plano, saída não conferida (N/T); verificar:release OK "1.1.0"; smoke:release OK, título desenhado 3,2 s, imagem 3,6 s (<= 4 s); smoke de toque-menus, pausa-som, icones, imagem: OK sem falhas.
- comparar:capturas: 337 diferenças, esperadas (planta nova mudou todas as capturas); baseline não atualizada.
- Capturas por área (teclado 960x704, 667x375, 844x390): ver qa/evidencias/v110/ (844 só até a falha do script nas portas; ver relatório).

## Rodada 2 (início 1794968943, fim ~1794969525)
- PL5 toque 667x375 e 844x390: 32/32 travessias OK (4 portas, 2 sentidos, contra e A), sem voltar, sem prender (`qa/scripts/v110-portas.mjs toque667,toque844`).
- PL7 toque: 8/8 OK (diálogo "Essa porta está fechada.", rodapé "A: avançar  B: fechar").
- verificar:conteudo e validar:perfil hd-480x352: OK ("Perfil válido").
- PL16, cacto (móvel/parede/A/Nick), paredes e muro da Cozinha ao vivo, móveis: INCONCLUSIVO. `qa/scripts/v110-enfeites.mjs` não conseguiu levar o sobrinho aos tiles (chegou=false); resultados descartados (falha do script, não do jogo). N/T.
- N/T: PL8 ao vivo, PL9 conduções 2x, PL10, PL11 detalhe, título/créditos 1.1.0 por captura, capturas 667/844 do cacto.
