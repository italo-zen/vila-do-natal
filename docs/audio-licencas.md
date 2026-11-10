# Origem e licença do áudio (Marco 6)

- **Data:** 2026-11-10
- **Gerado por:** `tools-arte/gerar_audio.py` (não editar os arquivos à mão)
- **Estado:** Versão final. Trilha no estilo B (sinos e celesta sintetizados, GDD 19.2.1), escolhido pelo Diretor na pergunta 44; aprovação da faixa pelo Diretor pendente (backlog 123, critério 7)
- **Regra (GDD 19.2.5; ADR-008):** o áudio é síntese original do projeto (sem sample, faixa ou trecho de terceiros). Exceções declaradas abaixo: as melodias tradicionais de domínio público do JC e da citação de J05. A trilha de fundo (`mus_natal`) e os efeitos são composição própria.
- **Autor:** Arte do projeto (agente de arte e level design), pelo script acima.

## Origem das melodias (exceções de domínio público)

- **JC (jingle de créditos, `jin_jc_natal.mp3`):** melodia tradicional de "We Wish You a Merry Christmas" (carol inglês, registrado no século XVI; domínio público). O arranjo, o tempo (3/4), a tonalidade (sol maior) e a instrumentação (sinos e celesta) são originais do projeto. **Não** se usa o arranjo de Arthur Warrell (1935), que tem direitos.
- **J05 (conquista de enfeites, `jin_j05_enfeites.mp3`):** citação de 4 notas (mi, mi, mi, sol) de "Jingle Bells" (melodia de James Lord Pierpont, publicada em 1857; domínio público). O restante do jingle é original.
- **Demais arquivos** (trilha, efeitos S01 a S13, J01 a J04): composição própria, sem melodia de terceiros.

- **Formato:** MP3 mono, 22050 Hz, CBR 32 kbps. Medidas em `assets/audio/audio-meta.json`.

| Arquivo | Evento | Origem | Data | Bytes | Duração (s) |
|---|---|---|---|---|---|
| `mus_natal.mp3` | trilha de fundo (loop) | gerado pelo projeto, síntese original | 2026-11-10 | 144526 | 36.000 |
| `sfx_s01_passo.mp3` | S01 | gerado pelo projeto, síntese original | 2026-11-10 | 957 | 0.130 |
| `sfx_s02_porta.mp3` | S02 | gerado pelo projeto, síntese original | 2026-11-10 | 2316 | 0.450 |
| `sfx_s03_porta_abriu.mp3` | S03 | gerado pelo projeto, síntese original | 2026-11-10 | 4092 | 0.900 |
| `sfx_s04_interruptor.mp3` | S04 | gerado pelo projeto, síntese original | 2026-11-10 | 3465 | 0.750 |
| `sfx_s05_peca.mp3` | S05 | gerado pelo projeto, síntese original | 2026-11-10 | 4092 | 0.900 |
| `sfx_s06_encaixe.mp3` | S06 | gerado pelo projeto, síntese original | 2026-11-10 | 5659 | 1.300 |
| `sfx_s07_au.mp3` | S07 | gerado pelo projeto, síntese original | 2026-11-10 | 2107 | 0.400 |
| `sfx_s08_fungada.mp3` | S08 | gerado pelo projeto, síntese original | 2026-11-10 | 2525 | 0.500 |
| `sfx_s09_conquista.mp3` | S09 | gerado pelo projeto, síntese original | 2026-11-10 | 8481 | 2.000 |
| `sfx_s10_dialogo.mp3` | S10 | gerado pelo projeto, síntese original | 2026-11-10 | 1271 | 0.200 |
| `sfx_s11_foco.mp3` | S11 | gerado pelo projeto, síntese original | 2026-11-10 | 853 | 0.100 |
| `sfx_s12_confirma.mp3` | S12 | gerado pelo projeto, síntese original | 2026-11-10 | 1271 | 0.200 |
| `sfx_s13_erro.mp3` | S13 | gerado pelo projeto, síntese original | 2026-11-10 | 2838 | 0.600 |
| `jin_j01_luzes.mp3` | J01 (jingle, GDD 19.2.7) | gerado pelo projeto, síntese original | 2026-11-10 | 10466 | 2.500 |
| `jin_j02_parte1.mp3` | J02 (jingle, GDD 19.2.7) | gerado pelo projeto, síntese original | 2026-11-10 | 12451 | 3.000 |
| `jin_j03_parte2.mp3` | J03 (jingle, GDD 19.2.7) | gerado pelo projeto, síntese original | 2026-11-10 | 12451 | 3.000 |
| `jin_j04_parte3.mp3` | J04 (jingle, GDD 19.2.7) | gerado pelo projeto, síntese original | 2026-11-10 | 12451 | 3.000 |
| `jin_j05_enfeites.mp3` | J05 (jingle, GDD 19.2.7) | gerado pelo projeto, síntese original | 2026-11-10 | 14855 | 3.600 |
| `jin_jc_natal.mp3` | JC (jingle, GDD 19.2.7) | gerado pelo projeto, síntese original | 2026-11-10 | 62502 | 15.500 |
