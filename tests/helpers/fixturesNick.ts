import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Conteudo } from '../../src/application/usecases/CarregarConteudo';
import type { MissaoCarregada } from '../../src/application/mundo/missoes';
import type { MapaDoJogo } from '../../src/application/content/Mapa';
import { interpretarTextos, type Textos } from '../../src/application/content/Textos';
import type { EntradaDoNick } from '../../src/application/content/validarNick';

/**
 * Fixtures de conteúdo para os testes do Nick (ADR-005 seção 8). Cada função devolve uma entrada de validarNick feita
 * de uma cópia do conteúdo real com uma mudança. O conteúdo carregado nunca muda.
 */

const copia = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/** Missão `id` alterada por `fn` (o objeto `missao` copiado: `nick`, `dica`, `conducao`, ...). */
export function entradaComMissao(c: Conteudo, id: string, fn: (missao: any) => void): EntradaDoNick { // eslint-disable-line @typescript-eslint/no-explicit-any
  const missoes: MissaoCarregada[] = c.missoes.map((m) => {
    if (m.id !== id) return m;
    const missao = copia(m.missao);
    fn(missao);
    return { ...m, missao };
  });
  return { todos: c.todosOsMapas, missoes, textos: c.textos, perfil: c.perfil };
}

/** Subárea `id` alterada por `fn` (cópia). */
export function entradaComMapa(c: Conteudo, id: string, fn: (mapa: MapaDoJogo) => void): EntradaDoNick {
  const todos = new Map(c.todosOsMapas);
  const mapa = copia(c.todosOsMapas.get(id)!);
  fn(mapa);
  todos.set(id, mapa);
  return { todos, missoes: c.missoes, textos: c.textos, perfil: c.perfil };
}

/** Textos alterados por `fn`, sobre o dicionário bruto de content/texts/pt-BR.json (lido do disco). */
export function entradaComTextos(c: Conteudo, fn: (dic: Record<string, unknown>) => void): EntradaDoNick {
  const bruto = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content', 'texts', 'pt-BR.json'), 'utf-8')) as Record<string, unknown>;
  fn(bruto);
  const textos: Textos = interpretarTextos(bruto);
  return { todos: c.todosOsMapas, missoes: c.missoes, textos, perfil: c.perfil };
}
