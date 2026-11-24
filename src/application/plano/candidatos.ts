import type { MapaDoJogo } from '../content/Mapa';
import { livreNoMapa, vizinhosLivresAlcancaveis } from '../content/pontosDePartida';
import type { RetanguloDoComodo } from '../content/Sorteio';
import { arestaAberta, LADOS, VETOR_DO_LADO } from '../mundo/arestas';

/**
 * Candidatos do sorteio (GDD 21.16.1 e 21.16.4; ADR-013 seção 6). Funções puras sobre os mapas de `content/`: mudar um móvel muda a lista.
 * É a única definição das regras. Coordenadas locais do mapa, na ordem fixa y e depois x (parte do contrato de consumo do RNG).
 *
 * Divergências do texto do GDD, registradas: (1) enfeites de decoração não excluem tile, porque a decoração só aparece no modo explorar,
 * depois das peças (o golden de 21.16.1 só bate assim); (2) "nem vizinho da passagem" não vale (decisão do Produto, 2026-11-19): só o tile da passagem
 * (`passagem` da área, em sorteio.json) é recusado, e ele não conta como acesso a examinável; (3) o Nick das luzes fica a Chebyshev 2 ou mais da chegada.
 */
export interface Tile2 {
  x: number;
  y: number;
}
const chave = (x: number, y: number) => `${x},${y}`;
const manhattan = (a: Tile2, b: Tile2) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

/** Cópia do mapa sem objetos `peca` nem `enfeite` (a caixa) (as peças do plano são injetadas por `mapasComPlano`). */
export const semPecas = (m: MapaDoJogo): MapaDoJogo => ({ ...m, objetos: m.objetos.filter((o) => o.tipo !== 'peca' && o.tipo !== 'enfeite') });

const portasDe = (m: MapaDoJogo): Tile2[] => m.objetos.filter((o) => o.tipo === 'porta').map((o) => ({ x: o.x, y: o.y }));

/** Barra de controles: a tela tem `linhasDaTela`, o mapa é centrado; tile fora das 2 últimas linhas da tela (a barra). */
function foraDaBarra(m: MapaDoJogo, y: number, linhasDaTela: number): boolean {
  const yDaTela = Math.floor((linhasDaTela - m.altura) / 2) + y;
  return yDaTela <= linhasDaTela - 3;
}

/** Tiles livres alcançáveis a partir de `inicio` pelas arestas abertas, sem passar pelos `bloqueados`. */
export function alcancaveisDe(m: MapaDoJogo, inicio: Tile2, bloqueados: ReadonlySet<string>): Set<string> {
  const visto = new Set<string>();
  if (bloqueados.has(chave(inicio.x, inicio.y)) || !livreNoMapa(m, inicio.x, inicio.y)) return visto;
  visto.add(chave(inicio.x, inicio.y));
  const fila = [inicio];
  while (fila.length > 0) {
    const n = fila.shift()!;
    for (const lado of LADOS) {
      const v = { x: n.x + VETOR_DO_LADO[lado].x, y: n.y + VETOR_DO_LADO[lado].y };
      if (!livreNoMapa(m, v.x, v.y) || visto.has(chave(v.x, v.y)) || bloqueados.has(chave(v.x, v.y)) || !arestaAberta(m.paredes, n.x, n.y, lado)) continue;
      visto.add(chave(v.x, v.y));
      fila.push(v);
    }
  }
  return visto;
}

/** Tile da árvore e tile de frente dela. */
function tilesDaArvore(m: MapaDoJogo): Tile2[] {
  const a = m.objetos.find((o) => o.tipo === 'arvore');
  return a ? [{ x: a.x, y: a.y }, { x: a.x, y: a.y - 1 }] : [];
}

const dentro = (r: RetanguloDoComodo | undefined, x: number, y: number): boolean => !!r && x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

/** Toda porta continua alcançável das outras e todo examinável tem um vizinho livre alcançável, com `bloqueados` no mapa. */
function nadaTrancado(m: MapaDoJogo, bloqueados: ReadonlySet<string>, passagem?: RetanguloDoComodo): boolean {
  const portas = portasDe(m);
  if (portas.length === 0) return true;
  const comp = alcancaveisDe(m, portas[0], bloqueados);
  if (!portas.every((p) => comp.has(chave(p.x, p.y)))) return false;
  return m.objetos.filter((o) => o.tipo === 'examinavel').every((o) => vizinhosLivresAlcancaveis(m, o.x, o.y).some((v) => comp.has(chave(v.x, v.y)) && !bloqueados.has(chave(v.x, v.y)) && !dentro(passagem, v.x, v.y)));
}

/**
 * Candidatos de peça de uma área ou de um cômodo (retângulo local): piso livre, sem objeto, Manhattan 2 ou mais de toda porta, fora da
 * barra, com 1 ou mais vizinho livre alcançável, e a peça presente não tranca nada (`nadaTrancado`). `m` é o mapa cru (peças ignoradas).
 */
export function candidatosDePeca(mapa: MapaDoJogo, linhasDaTela: number, retangulo?: RetanguloDoComodo, passagem?: RetanguloDoComodo): Tile2[] {
  const m = semPecas(mapa);
  const ocup = new Set(m.objetos.filter((o) => o.tipo !== 'movel').map((o) => chave(o.x, o.y)));
  const portas = portasDe(m);
  const arvore = new Set(tilesDaArvore(m).map((t) => chave(t.x, t.y)));
  const out: Tile2[] = [];
  for (let y = 0; y < m.altura; y++) {
    for (let x = 0; x < m.largura; x++) {
      if (retangulo && (x < retangulo.x || x >= retangulo.x + retangulo.w || y < retangulo.y || y >= retangulo.y + retangulo.h)) continue;
      if (!livreNoMapa(m, x, y) || ocup.has(chave(x, y)) || arvore.has(chave(x, y))) continue;
      if (portas.some((p) => manhattan(p, { x, y }) < 2) || !foraDaBarra(m, y, linhasDaTela)) continue;
      if (vizinhosLivresAlcancaveis(m, x, y).length < 1) continue;
      if (dentro(passagem, x, y) || !nadaTrancado(m, new Set([chave(x, y)]), passagem)) continue;
      out.push({ x, y });
    }
  }
  return out;
}

export interface OpcoesDoNick {
  linhasDaTela: number;
  /** Caixa de enfeite do plano nesta área, se houver (o Nick não dorme encostado nela). */
  caixa?: Tile2;
  /** Tiles de peça do plano nesta área (a peça e os vizinhos dela não servem). */
  pecas: readonly Tile2[];
  /** Destino da condução da missão, quando está nesta área (não serve). */
  destino?: Tile2;
  /** Luz de entrada: dentro do círculo de `raio` tiles e a Chebyshev 2 ou mais da chegada. */
  luz?: { chegada: Tile2; raio: number };
  /** Passagem da área (sorteio.json): o Nick não dorme nela (PL30). */
  passagem?: RetanguloDoComodo;
}

/**
 * Candidatos de dormir do Nick numa área (N004 a N007, mais alcançável pelas chegadas): piso livre, sem objeto (porta, spawn, interruptor,
 * examinável, árvore, caixa), Manhattan 2 ou mais de toda porta, fora da barra, fora do tile da árvore e do tile de frente, fora das peças
 * do plano e dos vizinhos delas e da caixa, com 2 ou mais vizinhos livres alcançáveis, e de cada porta existe caminho até um vizinho dele
 * com o tile bloqueado. A rota da condução (N009) é conferida pelo plano, que tem as missões. `mapa` é o mapa cru (peças ignoradas).
 */
export function candidatosDoNick(mapa: MapaDoJogo, opcoes: OpcoesDoNick): Tile2[] {
  const m = semPecas(mapa);
  const pecas = opcoes.pecas;
  const mComPecas: MapaDoJogo = { ...m, objetos: [...m.objetos, ...pecas.map((p) => ({ tipo: 'peca', x: p.x, y: p.y, dados: {} })), ...(opcoes.caixa ? [{ tipo: 'enfeite', x: opcoes.caixa.x, y: opcoes.caixa.y, dados: {} }] : [])] };
  const ocup = new Set(m.objetos.filter((o) => o.tipo !== 'movel').map((o) => chave(o.x, o.y)));
  const portas = portasDe(m);
  const arvore = new Set(tilesDaArvore(m).map((t) => chave(t.x, t.y)));
  const caixas = opcoes.caixa ? [opcoes.caixa] : [];
  const out: Tile2[] = [];
  for (let y = 0; y < m.altura; y++) {
    for (let x = 0; x < m.largura; x++) {
      const t = { x, y };
      if (!livreNoMapa(m, x, y) || ocup.has(chave(x, y)) || arvore.has(chave(x, y))) continue;
      if (dentro(opcoes.passagem, x, y)) continue;
      if (opcoes.destino && opcoes.destino.x === x && opcoes.destino.y === y) continue;
      if (portas.some((p) => manhattan(p, t) < 2) || !foraDaBarra(m, y, opcoes.linhasDaTela)) continue;
      if (pecas.some((p) => manhattan(p, t) < 2) || caixas.some((c) => manhattan(c, t) < 2)) continue;
      if (opcoes.luz && (Math.hypot(x - opcoes.luz.chegada.x, y - opcoes.luz.chegada.y) > opcoes.luz.raio || Math.max(Math.abs(x - opcoes.luz.chegada.x), Math.abs(y - opcoes.luz.chegada.y)) < 2)) continue;
      const vizinhos = vizinhosLivresAlcancaveis(mComPecas, x, y);
      if (vizinhos.length < 2) continue;
      const bloq = new Set([chave(x, y)]);
      const comp = portas.length > 0 ? alcancaveisDe(mComPecas, portas[0], bloq) : new Set<string>();
      if (portas.length > 0 && !(portas.every((p) => comp.has(chave(p.x, p.y))) && vizinhos.some((v) => comp.has(chave(v.x, v.y))))) continue;
      out.push(t);
    }
  }
  return out;
}
