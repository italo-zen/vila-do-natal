import type { Plano } from '../../domain/plano/Plano';
import type { MapaDoJogo, ObjetoDoMapa } from '../content/Mapa';

/** Objeto `peca` do plano, na forma que o motor lê (ADR-013 seção 3). A peça 1 começa visível, as outras escondidas. */
export const objetoDePeca = (p: { ordem: number; x: number; y: number }): ObjetoDoMapa => ({
  tipo: 'peca',
  x: p.x,
  y: p.y,
  dados: { id: `peca${p.ordem}`, ordem: p.ordem, estadoInicial: p.ordem === 1 ? 'visivel' : 'escondida' },
});

/**
 * Cópia dos mapas com os objetos `peca` do plano injetados; não muda mais nada. Os mapas sem peça são os mesmos objetos de `todos`.
 * Aceita um plano inteiro ou só uma lista de peças (a validação e a enumeração testam uma peça de cada vez).
 */
export function mapasComPlano(todos: ReadonlyMap<string, MapaDoJogo>, plano: Pick<Plano, 'pecas'> | { pecas: readonly { ordem: number; mapa: string; x: number; y: number }[] }): Map<string, MapaDoJogo> {
  const out = new Map<string, MapaDoJogo>();
  for (const [id, m] of todos) out.set(id, m.objetos.some((o) => o.tipo === 'peca') ? { ...m, objetos: m.objetos.filter((o) => o.tipo !== 'peca') } : m);
  for (const p of plano.pecas) {
    const m = out.get(p.mapa);
    if (!m) throw new Error(`Plano com peça em mapa inexistente: ${p.mapa}.`);
    out.set(p.mapa, { ...m, objetos: [...m.objetos, objetoDePeca(p)] });
  }
  return out;
}
