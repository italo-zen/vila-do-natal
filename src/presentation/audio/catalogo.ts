/**
 * Catálogo de sons do jogo (ADR-008 5 e 5.1; GDD 19.2.2 e 19.2.7). Resolve cada evento a seu arquivo pelo `content/audio.json`
 * (schema 2). Função pura. As cenas só chamam `som.tocar(evento, tela)` ou `som.tocarConquista(chave, tela)`; nunca leem o arquivo.
 */
import type { EventoDeAudio } from '../../application/audio/eventosDeAudio';

export interface ConfigDoCatalogo {
  schemaVersion?: number;
  mestre: number;
  musica: { id: string; ganhoDb: number };
  /** S09 é a família de jingles: tem `variante`, e não tem `id`. */
  eventos: Record<string, { id?: string; ganhoDb?: number; variante?: string }>;
  conquistas?: Record<string, { id: string; ganhoDb: number }>;
  creditos?: { id: string; ganhoDb: number };
}

/** Id do arquivo de um efeito. S09 (família) não tem arquivo: quem toca é `tocarConquista`. */
export function idDoEvento(config: ConfigDoCatalogo, evento: EventoDeAudio): string {
  const e = config.eventos[evento];
  if (!e || !e.id) throw new Error(`Evento ${evento} sem arquivo em content/audio.json.`);
  return e.id;
}

/** Ganho linear de um efeito (ganhoDb só atenua; ADR-008 4.2). */
export function ganhoLinear(ganhoDb: number): number {
  return Math.pow(10, ganhoDb / 20);
}
