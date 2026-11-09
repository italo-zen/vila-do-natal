import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Manifest } from '../../src/application/content/Manifest';
import type { MapaDoJogo } from '../../src/application/content/Mapa';
import type { Conteudo } from '../../src/application/usecases/CarregarConteudo';
import type { EntradaDeConteudo } from '../../src/application/content/validarConteudo';
import type { MissaoCarregada } from '../../src/application/mundo/missoes';
import { interpretarTextos, type Textos } from '../../src/application/content/Textos';
import { livreNoMapa } from '../../src/application/content/pontosDePartida';
import type { ObjetoDoMapa } from '../../src/application/content/Mapa';

/**
 * Fixtures de término e da caixa de enfeite (ADR-006 seções 9 e 10). Cada função devolve uma cópia do conteúdo real com
 * uma mudança. O conteúdo carregado nunca muda.
 */

const copia = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/** Códigos de regra (T001 a T009 e N001 a N014) do resultado, sem repetição e em ordem alfabética. */
export const codigosDeRegra = (erros: string[]): string[] =>
  [...new Set(erros.map((e) => e.match(/^([TN]\d{3})\b/)?.[1]).filter((c): c is string => !!c))].sort();

/** Entrada completa de validarConteudo, com manifesto, missões e textos alterados por `fn`. */
export function entradaComManifesto(c: Conteudo, fn: (manifesto: Manifest) => void): EntradaDeConteudo {
  const manifesto = copia(c.manifesto);
  fn(manifesto);
  return { manifesto, todos: c.todosOsMapas, missoes: c.missoes, textos: c.textos, perfil: c.perfil };
}

/** Missões com a flag `final` escolhida (T005 e T002 olham a flag). */
export function missoesComFinal(c: Conteudo, finais: string[]): MissaoCarregada[] {
  return c.missoes.map((m) => ({ ...m, final: finais.includes(m.id) }));
}

/** Entrada de validarConteudo com as missões trocadas por `fn` (cópia). */
export function entradaComMissoes(c: Conteudo, fn: (missoes: MissaoCarregada[]) => void): EntradaDeConteudo {
  const missoes = copia(c.missoes);
  fn(missoes);
  return { manifesto: c.manifesto, todos: c.todosOsMapas, missoes, textos: c.textos, perfil: c.perfil };
}

/** Entrada de validarConteudo com uma subárea alterada por `fn` (cópia). */
export function entradaComSubarea(c: Conteudo, id: string, fn: (mapa: MapaDoJogo) => void): EntradaDeConteudo {
  const todos = new Map(c.todosOsMapas);
  const mapa = copia(c.todosOsMapas.get(id)!);
  fn(mapa);
  todos.set(id, mapa);
  return { manifesto: c.manifesto, todos, missoes: c.missoes, textos: c.textos, perfil: c.perfil };
}

/** Entrada de validarConteudo com os textos alterados por `fn` sobre o dicionário bruto (lido do conteúdo real). */
export function entradaComTextosDoMarco4(c: Conteudo, fn: (dic: Record<string, unknown>) => void): EntradaDeConteudo {
  const bruto = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content', 'texts', 'pt-BR.json'), 'utf-8')) as Record<string, unknown>;
  fn(bruto);
  const textos: Textos = interpretarTextos(bruto);
  return { manifesto: c.manifesto, todos: c.todosOsMapas, missoes: c.missoes, textos, perfil: c.perfil };
}

/**
 * Tile livre de uma subárea onde uma caixa de enfeite caberia (T007): piso livre, dois ou mais vizinhos livres, e nenhum
 * vizinho livre com objeto de gatilho, vão, chegada, peça, enfeite ou examinável. Devolve o primeiro, na ordem de leitura.
 */
export function tileParaCaixa(mapa: MapaDoJogo, evitar: { x: number; y: number }[] = []): { x: number; y: number } | undefined {
  const VIZ: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const proibidos = new Set<string>();
  const tipos = ['porta', 'portaFechada', 'spawn', 'interruptor', 'examinavel', 'arvore', 'bilhete', 'peca', 'enfeite'];
  for (const o of mapa.objetos as ObjetoDoMapa[]) if (tipos.includes(o.tipo)) proibidos.add(`${o.x},${o.y}`);
  // Tile de dormir do Nick não recebe a caixa (N005): é o caso que a fixture não quer testar.
  for (const t of evitar) proibidos.add(`${t.x},${t.y}`);
  for (let y = 0; y < mapa.altura; y++) {
    for (let x = 0; x < mapa.largura; x++) {
      if (!livreNoMapa(mapa, x, y) || proibidos.has(`${x},${y}`)) continue;
      const livres = VIZ.filter(([dx, dy]) => livreNoMapa(mapa, x + dx, y + dy));
      if (livres.length < 2) continue;
      if (livres.some(([dx, dy]) => proibidos.has(`${x + dx},${y + dy}`))) continue;
      return { x, y };
    }
  }
  return undefined;
}

/** Manifesto (já validado) do conteúdo real, para o teste de validarManifesto. */
export const manifestoDe = (c: Conteudo): Manifest => copia(c.manifesto);
