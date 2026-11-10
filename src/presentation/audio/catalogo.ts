/**
 * Catálogo de sons do jogo (ADR-008 5; GDD 19.2.2). Resolve cada evento a seu arquivo pelo `content/audio.json`. Função
 * pura. As cenas só chamam `som.tocar(evento, tela)`; nunca leem o arquivo.
 */
import type { EventoDeAudio } from '../../application/audio/eventosDeAudio';

export interface ConfigDoCatalogo {
  mestre: number;
  musica: { id: string; ganhoDb: number };
  eventos: Record<string, { id: string; ganhoDb: number }>;
}

export function idDoEvento(config: ConfigDoCatalogo, evento: EventoDeAudio): string {
  const e = config.eventos[evento];
  if (!e) throw new Error(`Evento ${evento} sem arquivo em content/audio.json.`);
  return e.id;
}

/** Ganho linear de um efeito (ganhoDb só atenua; ADR-008 4.2). */
export function ganhoLinear(ganhoDb: number): number {
  return Math.pow(10, ganhoDb / 20);
}
