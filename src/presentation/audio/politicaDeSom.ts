/**
 * Quais efeitos cada tela pode tocar (ADR-008 R8; GDD 19.2.2 e AU7). Função pura. A música toca em todas as telas
 * (AU2), por isso não passa por aqui: só os efeitos.
 */
import type { EventoDeAudio } from '../../application/audio/eventosDeAudio';

export type TelaDoSom =
  | 'titulo'
  | 'comoJogar'
  | 'selecao'
  | 'introducao'
  | 'exploracao'
  | 'dialogo'
  | 'painel'
  | 'conquista'
  | 'dica'
  | 'pausa'
  | 'pausaSair'
  | 'pausaComoJogar'
  | 'conducao'
  | 'fade'
  | 'creditos'
  | 'rotacao';

/** Efeitos que a pausa e a confirmação aceitam: só foco (S11) e confirmação (S12) de menu (AU7). */
const DA_PAUSA: EventoDeAudio[] = ['S11', 'S12'];

export function efeitoPermitidoNaTela(tela: TelaDoSom, evento: EventoDeAudio): boolean {
  switch (tela) {
    case 'rotacao':
      return false;
    case 'pausa':
    case 'pausaSair':
    case 'pausaComoJogar':
      return DA_PAUSA.includes(evento);
    case 'conducao':
      return evento === 'S01';
    case 'fade':
      return evento === 'S02';
    default:
      return true;
  }
}
