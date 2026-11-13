/**
 * Catálogo de eventos de áudio (GDD 19.2.2 e 19.2.7; ADR-008 seções 5 e 5.1). Função de dados, sem DOM e sem Phaser.
 * S09 é a família de jingles de conquista: não tem arquivo próprio (variante `conquistas`, ADR-008 5.1).
 */
export const EVENTOS_DE_AUDIO = ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10', 'S11', 'S12', 'S13'] as const;
export type EventoDeAudio = (typeof EVENTOS_DE_AUDIO)[number];

/** Evento que é família (variante), e não arquivo único. */
export const EVENTO_EM_FAMILIA = 'S09' as const;

/** Chaves de conquista que as missões usam (content/missions/*.json) e o jingle de cada uma (GDD 19.2.7 a). */
export const JINGLE_DE_CONQUISTA: Record<string, { variante: string; prefixo: string }> = {
  'conquista.luzes': { variante: 'J01', prefixo: 'jin_j01' },
  'conquista.parte1': { variante: 'J02', prefixo: 'jin_j02' },
  'conquista.parte2': { variante: 'J03', prefixo: 'jin_j03' },
  'conquista.parte3': { variante: 'J04', prefixo: 'jin_j04' },
  'conquista.enfeites': { variante: 'J05', prefixo: 'jin_j05' },
};

/** Duração máxima, em segundos, de cada efeito com arquivo próprio (ADR-008 5). S09 não está aqui: é família. */
export const DURACAO_MAXIMA_S: Record<Exclude<EventoDeAudio, 'S09'>, number> = {
  S01: 0.15,
  S02: 0.5,
  S03: 1,
  S04: 0.8,
  S05: 1,
  S06: 1.5,
  S07: 0.4,
  S08: 0.5,
  S10: 0.2,
  S11: 0.1,
  S12: 0.2,
  S13: 0.6,
};

/** Orçamento de bytes (GDD 19.2.6 e 19.2.7 e; ADR-008 8.2, A4). Efeitos, jingles e música separados. */
export const ORCAMENTO_AUDIO = {
  musicaBytes: 160_000,
  musicaDuracaoMinS: 30,
  musicaDuracaoMaxS: 40,
  efeitoBytes: 12_000,
  efeitosSomadosBytes: 160_000,
  jingleBytes: 16_000,
  jinglesSomadosBytes: 64_000,
  creditosBytes: 64_000,
  creditosDuracaoMinS: 12,
  creditosDuracaoMaxS: 16,
  totalBytes: 320_000,
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
