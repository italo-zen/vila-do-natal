import { ehDirecao } from '../../domain/shared/Direcao';
import type { PerfilDeArte } from '../arte/PerfilDeArte';
import { candidatosDeNickDaRegra } from '../plano/candidatosDaRegra';
import { candidatosDePeca } from '../plano/candidatos';
import type { Manifest } from './Manifest';
import type { MapaDoJogo } from './Mapa';
import type { Sorteio } from './Sorteio';
import type { MissaoCarregada } from '../mundo/missoes';

const AREAS_PROIBIDAS = ['hall', 'sala', 'quartinho', 'banheiro1', 'banheiro_escritorio'];

export interface EntradaDoSorteio {
  bruto: unknown;
  manifesto: Manifest;
  todos: Map<string, MapaDoJogo>;
  missoes: readonly MissaoCarregada[];
  perfil: PerfilDeArte;
  /** Enquanto a Arte não regera os mapas sem `peca`, S008 é aviso e o carregador ignora as peças fixas. */
  pecaFixaEAviso?: boolean;
}

export interface ResultadoDoSorteio {
  erros: string[];
  avisos: string[];
}

const ehInt = (v: unknown): v is number => Number.isInteger(v);

/** S001 a S008 (ADR-013 seção 6). Devolve os erros com código (vazio = ok). */
export function validarSorteio(e: EntradaDoSorteio): ResultadoDoSorteio {
  const erros: string[] = [];
  const avisos: string[] = [];
  const s = e.bruto as Partial<Sorteio> | null;
  if (!s || typeof s !== 'object' || s.schemaVersion !== 1 || !s.pecas || !Array.isArray(s.pecas.areas) || !s.nick || typeof s.nick !== 'object') {
    return { erros: ['S001 sorteio.json ausente, com schemaVersion diferente de 1 ou com forma errada.'], avisos };
  }
  const sorteio = s as Sorteio;

  // S002
  if (sorteio.pecas.quantidade !== 3) erros.push(`S002 pecas.quantidade é ${String(sorteio.pecas.quantidade)}; precisa ser 3.`);
  else if (sorteio.pecas.areas.length < sorteio.pecas.quantidade) erros.push(`S002 há ${sorteio.pecas.areas.length} áreas para ${sorteio.pecas.quantidade} peças: não dá para ter áreas distintas.`);

  // S003 e S004
  const idsDeArea = new Set<string>();
  for (const a of sorteio.pecas.areas) {
    if (typeof a.id !== 'string' || !Array.isArray(a.comodos) || a.comodos.length === 0 || !ehInt(a.minimo)) {
      erros.push(`S001 área de peça "${String(a.id)}" com forma errada (id, minimo e comodos).`);
      continue;
    }
    if (idsDeArea.has(a.id)) erros.push(`S003 área "${a.id}" repetida.`);
    idsDeArea.add(a.id);
    if (AREAS_PROIBIDAS.includes(a.id)) erros.push(`S003 área "${a.id}" é proibida para peça (GDD 21.16.1).`);
    let total = 0;
    const retangulos: { x: number; y: number; w: number; h: number }[] = [];
    for (const c of a.comodos) {
      const m = e.todos.get(c.mapa);
      if (!m) {
        erros.push(`S003 cômodo "${String(c.id)}" da área "${a.id}": mapa "${String(c.mapa)}" não existe.`);
        continue;
      }
      if (AREAS_PROIBIDAS.includes(c.mapa)) erros.push(`S003 cômodo "${c.id}": mapa "${c.mapa}" é proibido para peça.`);
      const r = c.retangulo;
      if (r) {
        if (![r.x, r.y, r.w, r.h].every(ehInt) || r.x < 0 || r.y < 0 || r.w < 1 || r.h < 1 || r.x + r.w > m.largura || r.y + r.h > m.altura) {
          erros.push(`S003 cômodo "${c.id}": retângulo fora do mapa "${c.mapa}".`);
          continue;
        }
        for (const o of retangulos) if (r.x < o.x + o.w && o.x < r.x + r.w && r.y < o.y + o.h && o.y < r.y + r.h) erros.push(`S003 área "${a.id}": retângulos de cômodos se sobrepõem.`);
        retangulos.push(r);
      }
      const n = candidatosDePeca(m, e.perfil.sala.linhas, r, a.passagem).length;
      if (n === 0) erros.push(`S004 cômodo "${c.id}" da área "${a.id}" sem nenhum candidato de peça.`);
      total += n;
    }
    if (total < a.minimo) erros.push(`S004 área "${a.id}" tem ${total} candidatos de peça; o mínimo é ${a.minimo}.`);
  }

  // S005, S006, S007
  const ids = new Set(e.missoes.map((m) => m.id));
  for (const m of e.missoes) if (!(m.id in sorteio.nick)) erros.push(`S005 missão "${m.id}" sem regra em sorteio.nick.`);
  for (const [mid, r] of Object.entries(sorteio.nick)) {
    const missao = e.missoes.find((m) => m.id === mid);
    if (!missao) {
      erros.push(`S005 sorteio.nick."${mid}" não é missão do manifesto.`);
      continue;
    }
    if (!Array.isArray(r.areas) || r.areas.length === 0 || !ehDirecao(r.direcao)) {
      erros.push(`S001 sorteio.nick."${mid}" com forma errada (areas e direcao).`);
      continue;
    }
    for (const a of r.areas) {
      if (a === 'hall') erros.push(`S005 sorteio.nick."${mid}": hall é proibido (N003).`);
      else if (!missao.maps.includes(a) || !e.todos.has(a)) erros.push(`S005 sorteio.nick."${mid}": área "${a}" fechada na missão (N002).`);
      else if (a !== 'sala' && !e.todos.get(a)!.objetos.some((o) => o.tipo === 'porta' && o.dados.destino === 'sala')) erros.push(`S005 sorteio.nick."${mid}": área "${a}" sem porta direta para a Sala.`);
    }
    if (r.foraDaAreaDaPeca !== undefined && (!ehInt(r.foraDaAreaDaPeca) || r.foraDaAreaDaPeca < 1 || r.foraDaAreaDaPeca > 3 || !Object.keys(missao.missao.conquistas).some((f) => f === `parte${r.foraDaAreaDaPeca}`))) {
      erros.push(`S006 sorteio.nick."${mid}": foraDaAreaDaPeca ${String(r.foraDaAreaDaPeca)} inválido (1 a 3, e só em missão com essa peça).`);
    }
    if (r.dentroDaLuzDeEntrada && !e.todos.get(r.dentroDaLuzDeEntrada.mapa)?.objetos.some((o) => o.tipo === 'spawn' && o.dados.nome === r.dentroDaLuzDeEntrada!.spawn)) {
      erros.push(`S005 sorteio.nick."${mid}": spawn "${r.dentroDaLuzDeEntrada.spawn}" da luz de entrada não existe.`);
    }
    const n = candidatosDeNickDaRegra(e.todos, e.missoes, mid, r, e.perfil, [], sorteio.pecas.areas).length;
    if (n === 0) erros.push(`S007 sorteio.nick."${mid}" sem nenhum tile válido para o Nick.`);
    else if (r.minimo !== undefined && n < r.minimo) erros.push(`S007 sorteio.nick."${mid}" tem ${n} tiles válidos; o mínimo é ${r.minimo}.`);
  }
  void ids;

  // S008
  const comPeca = [...e.todos.values()].filter((m) => m.objetos.some((o) => o.tipo === 'peca')).map((m) => m.id);
  if (comPeca.length > 0) {
    const msg = `S008 mapa(s) ${comPeca.join(', ')} ainda tem(têm) objeto "peca": o sorteio é o dono das peças (ADR-013).`;
    (e.pecaFixaEAviso ? avisos : erros).push(msg);
  }
  return { erros, avisos };
}
