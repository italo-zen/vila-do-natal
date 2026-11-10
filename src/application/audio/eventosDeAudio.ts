/**
 * Catálogo de eventos de áudio (GDD 19.2.2; ADR-008 seção 5). Função de dados, sem DOM e sem Phaser. Os IDs S01 a S13 são
 * as chaves de `content/audio.json`; a duração máxima de cada efeito é a da tabela do ADR-008.
 */
export const EVENTOS_DE_AUDIO = ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10', 'S11', 'S12', 'S13'] as const;
export type EventoDeAudio = (typeof EVENTOS_DE_AUDIO)[number];

/** Duração máxima, em segundos, de cada efeito (ADR-008 5; GDD 19.2.2). */
export const DURACAO_MAXIMA_S: Record<EventoDeAudio, number> = {
  S01: 0.15,
  S02: 0.5,
  S03: 1,
  S04: 0.8,
  S05: 1,
  S06: 1.5,
  S07: 0.4,
  S08: 0.5,
  S09: 2,
  S10: 0.2,
  S11: 0.1,
  S12: 0.2,
  S13: 0.6,
};

/** Orçamento de bytes (GDD 19.2.6; ADR-008 8.2, A4). Música e efeitos separados, como em `verificar:tamanho`. */
export const ORCAMENTO_AUDIO = {
  musicaBytes: 160_000,
  efeitoBytes: 12_000,
  efeitosSomadosBytes: 160_000,
  musicaDuracaoMinS: 30,
  musicaDuracaoMaxS: 40,
} as const;

/** Limites de mixagem (ADR-008 4.3; GDD 19.2.4 e AU10). */
export const MIXAGEM = {
  picoMaximoDbfs: -3,
  diferencaMusicaMinDb: 7,
  diferencaMusicaMaxDb: 13,
  somaDePicosMaxima: 1,
  silencioNasPontasMaxMs: 20,
  ganhoMinimoDb: -40,
} as const;
