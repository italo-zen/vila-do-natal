import type { MapaDoJogo } from '../content/Mapa';
import { objetosDoTipo } from '../content/Mapa';
import type { Fase } from '../../domain/progresso/Fase';
import { bloqueiosDaSubarea, CONTEXTO_PADRAO, estadoDaPorta, type ContextoDeArea } from './subarea';
import { arestaAberta } from './arestas';
import type { Direcao } from '../../domain/shared/Direcao';

/** Custo de passar por uma porta: de tile a tile, sem vão nem gatilho (ADR-011 seção 5.3; era 3 no ADR-004). */
export const CUSTO_DA_PORTA = 1;

/** Nó da rota: tile local de uma subárea. `spawn` marca o ponto de chegada depois de uma porta. */
export interface NoDaRota {
  mapa: string;
  x: number;
  y: number;
  spawn?: string;
}

export interface RotaDeConducao {
  /** Custo total em passos (tiles andados, com o custo da porta). Decide a velocidade. */
  passos: number;
  /** Nós do caminho, do início ao destino, inclusive as portas (tile da porta e chegada). */
  nos: NoDaRota[];
}

const chave = (n: { mapa: string; x: number; y: number }) => `${n.mapa}:${n.x}:${n.y}`;
/** Ordem de vizinhos para desempate: cima, baixo, esquerda, direita (ADR-004 seção 11.2). */
const VIZINHOS: [number, number, Direcao][] = [[0, -1, 'cima'], [0, 1, 'baixo'], [-1, 0, 'esquerda'], [1, 0, 'direita']];

/**
 * Caminho de menor custo (Dijkstra) entre dois tiles (ADR-011 seção 5.3). Os nós são tiles com `colisao` 0 que o estado
 * não bloqueia (árvore, examinável, peça visível, caixa visível), de áreas abertas. Arestas: vizinho de 4 do mesmo tile com
 * o bit de `paredes` desligado, mais a porta: do tile da porta em A para o tile da porta em B (a chegada), com custo
 * `CUSTO_DA_PORTA`, só se a porta está aberta. `concluida` decide as portas com código; na validação passam-se como
 * passáveis. `ctx` diz quais áreas estão abertas na fase: área fechada não é passável, e porta para área fechada não existe.
 * Sem rota: devolve null. Empate: vizinhos na ordem fixa (cima, baixo, esquerda, direita), então a mesma entrada dá sempre a
 * mesma rota.
 */
export function calcularRotaDeConducao(
  mapas: Map<string, MapaDoJogo>,
  origem: NoDaRota,
  destino: { mapa: string; x: number; y: number },
  concluida: (fase: Fase) => boolean,
  ctx: ContextoDeArea = CONTEXTO_PADRAO,
): RotaDeConducao | null {
  const bloq = new Map<string, boolean[][]>();
  const passavel = (m: string, x: number, y: number): boolean => {
    const mapa = mapas.get(m);
    if (!mapa || !ctx.areaAberta(m) || x < 0 || y < 0 || x >= mapa.largura || y >= mapa.altura) return false;
    if (!bloq.has(m)) bloq.set(m, bloqueiosDaSubarea(mapa, concluida, ctx));
    return !bloq.get(m)![y][x];
  };
  const dist = new Map<string, number>([[chave(origem), 0]]);
  const antes = new Map<string, NoDaRota | null>([[chave(origem), null]]);
  const noPorChave = new Map<string, NoDaRota>([[chave(origem), origem]]);
  const feitos = new Set<string>();
  const fila: string[] = [chave(origem)];
  const alvo = chave(destino);

  while (fila.length) {
    // Menor custo; empate pela ordem de entrada na fila (determinístico).
    let melhor = 0;
    for (let i = 1; i < fila.length; i++) if (dist.get(fila[i])! < dist.get(fila[melhor])!) melhor = i;
    const k = fila.splice(melhor, 1)[0];
    if (feitos.has(k)) continue;
    feitos.add(k);
    if (k === alvo) break;
    const n = noPorChave.get(k)!;
    const d = dist.get(k)!;
    const relaxa = (m: NoDaRota, custo: number) => {
      const mk = chave(m);
      if (feitos.has(mk)) return;
      if (!dist.has(mk) || custo < dist.get(mk)!) {
        dist.set(mk, custo);
        antes.set(mk, n);
        noPorChave.set(mk, m);
        fila.push(mk);
      }
    };
    const mapa = mapas.get(n.mapa);
    if (mapa) {
      for (const [dx, dy, lado] of VIZINHOS) {
        if (arestaAberta(mapa.paredes, n.x, n.y, lado) && passavel(n.mapa, n.x + dx, n.y + dy)) {
          relaxa({ mapa: n.mapa, x: n.x + dx, y: n.y + dy }, d + 1);
        }
      }
      // Portas: do tile da porta em A para o tile da porta em B, o spawn de chegada (ADR-011 seção 3.2).
      for (const p of objetosDoTipo(mapa, 'porta')) {
        if (p.x !== n.x || p.y !== n.y) continue;
        if (estadoDaPorta(p, concluida, ctx) !== 'aberta') continue;
        const destinoMapa = mapas.get(String(p.dados.destino));
        if (!destinoMapa) continue;
        const spawn = destinoMapa.objetos.find((o) => o.tipo === 'spawn' && o.dados.nome === p.dados.spawnDestino);
        if (!spawn || !passavel(destinoMapa.id, spawn.x, spawn.y)) continue;
        relaxa({ mapa: destinoMapa.id, x: spawn.x, y: spawn.y, spawn: String(p.dados.spawnDestino) }, d + CUSTO_DA_PORTA);
      }
    }
  }
  if (!dist.has(alvo)) return null;
  const nos: NoDaRota[] = [];
  for (let n: NoDaRota | null | undefined = noPorChave.get(alvo); n; n = antes.get(chave(n))) nos.unshift(n);
  return { passos: dist.get(alvo)!, nos };
}
