import type { PortaASeguir } from '../../../domain/nick/PortaASeguir';
import type { MapaDoJogo } from '../../content/Mapa';
import { ladoDaPorta } from '../subarea';

/**
 * Porta a seguir (ADR-005 seção 4.2, GDD 16.5.3): BFS sobre as subáreas abertas, pelos gatilhos `porta` (não
 * `portaFechada`). Trancada conta como passável (ADR-004 seção 11.2). A ordem dos vizinhos é a da lista de objetos da
 * subárea de origem, então o resultado é igual em toda execução. Devolve a primeira porta do caminho, que é a única que
 * a seta mostra. Sem caminho: undefined (N012 garante que não acontece).
 */
export function portaASeguir(
  mapas: ReadonlyMap<string, MapaDoJogo>,
  aberta: (id: string) => boolean,
  origem: string,
  alvo: string,
): PortaASeguir | undefined {
  if (origem === alvo) return undefined;
  const visitados = new Set<string>([origem]);
  const fila: string[] = [origem];
  const primeiraPorta = new Map<string, PortaASeguir>();
  while (fila.length > 0) {
    const n = fila.shift()!;
    const mapa = mapas.get(n);
    if (!mapa) continue;
    for (const g of mapa.objetos) {
      if (g.tipo !== 'porta') continue;
      const destino = String(g.dados.destino);
      if (!aberta(destino) || visitados.has(destino)) continue;
      const saida = ladoDaPorta(g);
      if (!saida) continue;
      visitados.add(destino);
      const porta: PortaASeguir = primeiraPorta.get(n) ?? { mapa: origem, id: String(g.dados.id), gatilho: { x: g.x, y: g.y }, saida };
      primeiraPorta.set(destino, porta);
      if (destino === alvo) return porta;
      fila.push(destino);
    }
  }
  return undefined;
}
