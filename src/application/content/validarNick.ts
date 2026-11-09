import type { MapaDoJogo, ObjetoDoMapa } from './Mapa';
import type { Textos } from './Textos';
import type { PerfilDeArte } from '../arte/PerfilDeArte';
import type { MissaoCarregada } from '../mundo/missoes';
import { ordemDaFase } from '../mundo/pecas';
import { deslocamentoDaSubarea, ladoDaPorta, vaoDaPorta } from '../mundo/subarea';
import { livreNoMapa, rotaDaFaseExiste } from './pontosDePartida';
import type { Fase } from '../../domain/progresso/Fase';
import { ehDirecao } from '../../domain/shared/Direcao';
import { FASE_DO_ENFEITE } from '../mundo/enfeite';

/**
 * Validação do Nick e das dicas (ADR-005 seção 2.6; GDD 16.2, 16.11). Códigos N001 a N014. Todas são erro. Cada mensagem
 * começa com o código, para o QA e para o teste achar a regra. Função pura: recebe o conteúdo já montado.
 */

export interface EntradaDoNick {
  todos: Map<string, MapaDoJogo>;
  missoes: MissaoCarregada[];
  textos: Textos;
  perfil: PerfilDeArte;
}

/** Hall não é cômodo de dormir: fica fora da casa (GDD 16.2.1; N003). */
const HALL = 'hall';
/** Limite aproximado de caracteres de um texto de dica: 3 linhas de 28 (GDD 16.11; N013). */
export const TETO_DE_CARACTERES_DA_DICA = 84;
/** Chaves fixas do Marco 3 (ADR-005 seção 2.4): sem elas a tela não funciona. */
export const CHAVES_DE_NICK = ['nick.acordou', 'nick.latido'] as const;
export const CHAVES_DE_TELA_DO_MARCO3 = ['dica.titulo', 'dica.voltar', 'barra.casa2', 'barra.dica', 'comojogar.farejar', 'comojogar.dica'] as const;
const ESTADOS = ['dormindo', 'acordado'] as const;

const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const ehInteiro = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);

/** Itens que a fase procura: interruptor em `luzes`; peça N em `parteN` (GDD 16.5.2); caixa em `enfeites` (ADR-006 seção 5). */
function itensDaFase(fase: string): { interruptor?: true; ordemDaPeca?: number; caixa?: true } {
  if (fase === 'luzes') return { interruptor: true };
  if (fase === FASE_DO_ENFEITE) return { caixa: true };
  const ordem = ordemDaFase(fase as Fase);
  return ordem !== undefined ? { ordemDaPeca: ordem } : {};
}

/** Vãos de passagem da subárea (ADR-004 seção 3): o tile fora de cada gatilho, no lado de saída. */
function vaosDo(mapa: MapaDoJogo): { x: number; y: number }[] {
  const vaos: { x: number; y: number }[] = [];
  for (const o of mapa.objetos) {
    if (o.tipo !== 'porta') continue;
    const lado = ladoDaPorta(o);
    if (lado) vaos.push(vaoDaPorta(o, lado));
  }
  return vaos;
}

/** Subáreas alcançáveis a partir de `inicio` por pares de porta, só entre as abertas (ADR-005 seção 2.6, N012). */
function alcancaveis(inicio: string, abertas: Set<string>, todos: Map<string, MapaDoJogo>): Set<string> {
  const visto = new Set<string>([inicio]);
  const fila = [inicio];
  while (fila.length > 0) {
    const atual = fila.shift()!;
    const mapa = todos.get(atual);
    if (!mapa) continue;
    for (const o of mapa.objetos) {
      if (o.tipo !== 'porta') continue;
      const destino = String(o.dados.destino);
      if (!abertas.has(destino) || visto.has(destino)) continue;
      visto.add(destino);
      fila.push(destino);
    }
  }
  return visto;
}

/** Cópia de `todos` com um tile a mais bloqueado na subárea (N009: o Nick dormindo bloqueia, ADR-005 seção 3.3). */
function comTileBloqueado(todos: Map<string, MapaDoJogo>, mapaId: string, x: number, y: number): Map<string, MapaDoJogo> {
  const copia = new Map(todos);
  const mapa = todos.get(mapaId);
  if (!mapa || y < 0 || x < 0 || y >= mapa.altura || x >= mapa.largura) return copia;
  const colisao = mapa.colisao.map((linha) => [...linha]);
  colisao[y][x] = true;
  copia.set(mapaId, { ...mapa, colisao });
  return copia;
}

/** Valida o Nick e as dicas de todas as missões do conteúdo. Devolve os erros com código (vazio = ok). */
export function validarNick(e: EntradaDoNick): string[] {
  const erros: string[] = [];
  const { todos, missoes, textos, perfil } = e;
  const tela = perfil.sala;
  const inicial = missoes.find((m) => m.requires.length === 0);

  for (const m of missoes) {
    const pre = `nick '${m.id}'`;
    const bruto = m.missao as unknown as Record<string, unknown>;
    const nick = bruto.nick as unknown;
    const dica = bruto.dica as unknown;

    if (!ehObjeto(nick)) {
      erros.push(`N001 missão '${m.id}': nick ausente`);
    }
    if (!ehObjeto(dica)) {
      erros.push(`N001 missão '${m.id}': dica ausente`);
    }
    if (!ehObjeto(nick)) continue;

    const dorme = nick.dorme as unknown;
    if (!ehObjeto(dorme)) {
      erros.push(`N001 missão '${m.id}': nick.dorme ausente`);
    } else {
      if (typeof dorme.mapa !== 'string') erros.push(`N001 missão '${m.id}': nick.dorme.mapa precisa ser texto`);
      if (dorme.x === null || dorme.y === null) erros.push(`N001 missão '${m.id}': nick.dorme sem tile (x e y são null; a Arte escolhe, ADR-005 seção 2.2)`);
      else if (!ehInteiro(dorme.x) || !ehInteiro(dorme.y)) erros.push(`N001 missão '${m.id}': nick.dorme.x e nick.dorme.y precisam ser inteiros`);
      if (!ehDirecao(dorme.direcao)) erros.push(`N001 missão '${m.id}': nick.dorme.direcao "${String(dorme.direcao)}" fora de cima, baixo, esquerda, direita`);
    }
    if (typeof nick.alvo !== 'string') erros.push(`N001 missão '${m.id}': nick.alvo ausente ou não é texto`);

    // N008 (ADR-006 seção 6): `depois` foi removido de todas as missões. O Nick vai ao `dorme` da missão seguinte.
    if (nick.depois !== undefined) erros.push(`N008 ${pre}: depois foi removido (ADR-006 seção 6)`);

    // Tile de dormir. Só com os campos de tipo certo (senão já é N001).
    if (ehObjeto(dorme) && typeof dorme.mapa === 'string' && ehInteiro(dorme.x) && ehInteiro(dorme.y)) {
      const abertas = new Set(m.maps);
      checarTile(erros, { m, pre, mapaId: dorme.mapa, x: dorme.x, y: dorme.y, todos, tela, abertas });
    }

    // N009: com o tile de dormir bloqueado, toda rota de condução da missão ainda chega (ADR-005 seção 3.3).
    if (ehObjeto(dorme) && typeof dorme.mapa === 'string' && ehInteiro(dorme.x) && ehInteiro(dorme.y) && m.maps.includes(dorme.mapa) && todos.has(dorme.mapa)) {
      const bloqueado = comTileBloqueado(todos, dorme.mapa, dorme.x, dorme.y);
      for (const fase of Object.keys(m.missao.conducao)) {
        if (!rotaDaFaseExiste(fase as Fase, missoes, bloqueado)) {
          erros.push(`N009 ${pre}: dormir em (${dorme.x}, ${dorme.y}) corta a rota de conducao.${fase}`);
        }
      }
    }

    // N010 a N012: o alvo do farejar (ADR-005 seção 2.6).
    if (typeof nick.alvo === 'string') {
      const alvo = nick.alvo;
      if (!m.maps.includes(alvo) || !todos.has(alvo)) {
        erros.push(`N010 ${pre}: alvo '${alvo}' fechado na fase`);
      } else {
        const mapaAlvo = todos.get(alvo)!;
        for (const fase of Object.keys(m.missao.conquistas)) {
          const itens = itensDaFase(fase);
          if (itens.interruptor && !mapaAlvo.objetos.some((o) => o.tipo === 'interruptor')) {
            erros.push(`N011 ${pre}: alvo '${alvo}' sem interruptor`);
          }
          if (itens.ordemDaPeca !== undefined && !mapaAlvo.objetos.some((o) => o.tipo === 'peca' && Number(o.dados.ordem) === itens.ordemDaPeca)) {
            erros.push(`N011 ${pre}: alvo '${alvo}' sem peça ${itens.ordemDaPeca}`);
          }
          if (itens.caixa && !mapaAlvo.objetos.some((o) => o.tipo === 'enfeite')) {
            erros.push(`N011 ${pre}: alvo '${alvo}' sem caixa de enfeite`);
          }
        }
        const abertas = new Set(m.maps.filter((id) => todos.has(id)));
        const origem = m.maps.find((id) => todos.has(id) && !alcancaveis(id, abertas, todos).has(alvo));
        if (origem !== undefined) erros.push(`N012 ${pre}: alvo '${alvo}' inalcançável a partir de '${origem}'`);
      }
    }

    // N014 e N013 da dica (ADR-005 seção 2.6): cada fase da missão tem dica; por estado quando é objeto.
    if (ehObjeto(dica)) checarDica(erros, { m, pre, dica, textos, ehInicial: inicial?.id === m.id });
  }

  // N013: chaves fixas do Marco 3 (ADR-005 seção 2.4).
  for (const chave of [...CHAVES_DE_NICK, ...CHAVES_DE_TELA_DO_MARCO3]) {
    if (!textos.tem(chave)) erros.push(`N013 chave '${chave}' ausente em texts/pt-BR.json`);
  }
  if (textos.tem('nick.acordou') && textos.quantasPaginas('nick.acordou') !== 2) {
    erros.push(`N013 chave 'nick.acordou' precisa ter 2 páginas (GDD 16.3)`);
  }
  return erros;
}

interface ParamTile {
  m: MissaoCarregada;
  pre: string;
  mapaId: string;
  x: number;
  y: number;
  todos: Map<string, MapaDoJogo>;
  tela: PerfilDeArte['sala'];
  abertas: Set<string>;
}

/** N002 a N007 do tile de dormir: mapa aberto, hall, piso, objetos, barra, vizinhos (ADR-005 seção 2.6; ADR-006 seção 9). */
function checarTile(erros: string[], p: ParamTile): void {
  const { m, pre, mapaId, x, y, todos, tela, abertas } = p;
  const rotulo = 'dorme';
  if (!abertas.has(mapaId) || !todos.has(mapaId)) {
    erros.push(`N002 ${pre}: ${rotulo} em '${mapaId}', fechada na fase`);
    return;
  }
  if (mapaId === HALL) erros.push(`N003 ${pre}: ${rotulo} no hall (proibido)`);
  const mapa = todos.get(mapaId)!;
  const dentro = x >= 0 && y >= 0 && x < mapa.largura && y < mapa.altura;
  if (!dentro || !livreNoMapa(mapa, x, y)) {
    erros.push(`N004 ${pre}: ${rotulo} em (${x}, ${y}) sem piso livre`);
    return;
  }
  // N005: o tile não pode ter objeto (inclusive móvel), gatilho, vão, nem ser o destino de condução da missão.
  const rotuloObjeto = (o: ObjetoDoMapa) => `${o.tipo}${o.dados.id ? ` ${String(o.dados.id)}` : ''}`;
  const emCima = mapa.objetos.find((o) => o.tipo !== 'movel' && o.x === x && o.y === y);
  const movel = mapa.objetos.find((o) => o.tipo === 'movel' && x >= o.x && y >= o.y && x < o.x + Number(o.dados.w) && y < o.y + Number(o.dados.h));
  const vao = vaosDo(mapa).some((v) => v.x === x && v.y === y);
  const destinoDaConducao = Object.values(m.missao.conducao).some((d) => d.mapa === mapaId && d.x === x && d.y === y);
  if (emCima || movel || vao || destinoDaConducao) {
    const quem = emCima ? rotuloObjeto(emCima) : movel ? 'móvel' : vao ? 'vão de passagem' : 'destino de condução';
    erros.push(`N005 ${pre}: ${rotulo} sobre ${quem} (${x}, ${y})`);
  }
  // N006: nenhuma linha da barra da tela (as duas últimas, ADR-005 seção 6).
  const desl = deslocamentoDaSubarea(mapa, tela);
  if (y + desl.y >= tela.linhas - 2) erros.push(`N006 ${pre}: ${rotulo} na linha da barra`);
  // N007: pelo menos 2 vizinhos livres, e nenhum vizinho é peça ou caixa de enfeite (ADR-006 seção 9).
  const vizinhos = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => ({ x: x + dx, y: y + dy }));
  const livres = vizinhos.filter((v) => livreNoMapa(mapa, v.x, v.y)).length;
  if (livres < 2) erros.push(`N007 ${pre}: ${rotulo} em (${x}, ${y}) com ${livres} vizinho livre (mínimo 2)`);
  const pecaVizinha = mapa.objetos.some((o) => (o.tipo === 'peca' || o.tipo === 'enfeite') && vizinhos.some((v) => v.x === o.x && v.y === o.y));
  if (pecaVizinha) erros.push(`N007 ${pre}: ${rotulo} em (${x}, ${y}) encostado em peça`);
}

interface ParamDica {
  m: MissaoCarregada;
  pre: string;
  dica: Record<string, unknown>;
  textos: Textos;
  ehInicial: boolean;
}

/** N013 (texto existe e cabe) e N014 (dica completa por fase e por estado) de uma missão. */
function checarDica(erros: string[], p: ParamDica): void {
  const { m, pre, dica, textos, ehInicial } = p;
  // Fases que esta missão precisa cobrir: as da conquista; a porta fica na missão inicial (marco1). Não há `livre` (ADR-006 seção 6).
  const fases = [...Object.keys(m.missao.conquistas)];
  if (ehInicial) fases.unshift('porta');
  for (const fase of fases) {
    const valor = dica[fase];
    if (valor === undefined) {
      erros.push(`N014 dica '${m.id}': falta a fase '${fase}'`);
      continue;
    }
    if (typeof valor === 'string') checarChave(erros, pre, valor, textos, true);
    else if (ehObjeto(valor)) {
      for (const estado of ESTADOS) {
        const t = valor[estado];
        if (typeof t !== 'string') {
          erros.push(`N014 dica '${m.id}': falta o estado '${estado}'`);
          continue;
        }
        checarChave(erros, pre, t, textos, true);
      }
    } else {
      erros.push(`N001 dica '${m.id}': valor de '${fase}' precisa ser texto ou um objeto com dormindo e acordado`);
    }
  }
  // N014 (ADR-006 seção 6): `livre` foi removido de todas as dicas.
  if (dica.livre !== undefined) erros.push(`N014 ${pre}: livre foi removido (ADR-006 seção 6)`);
}

/** N013 de uma chave de dica: existe e cabe no teto de 84 caracteres (3 linhas de 28, GDD 16.11). */
function checarChave(erros: string[], pre: string, chave: string, textos: Textos, _dica: boolean): void {
  if (!textos.tem(chave)) {
    erros.push(`N013 ${pre}: chave '${chave}' ausente`);
    return;
  }
  const total = textos.paginas(chave).join('').length;
  if (total > TETO_DE_CARACTERES_DA_DICA) erros.push(`N013 ${pre}: chave '${chave}' tem ${total} caracteres (teto ${TETO_DE_CARACTERES_DA_DICA})`);
}
