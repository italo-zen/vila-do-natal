import type { Manifest } from '../content/Manifest';
import { interpretarSubarea } from '../content/interpretarSubarea';
import { interpretarMissao, type Inicio, type Missao } from '../content/Missao';
import { interpretarTextos, type Textos } from '../content/Textos';
import { avisosDeConteudo, validarConteudo } from '../content/validarConteudo';
import { validarManifesto } from '../content/validarManifesto';
import { PERFIL_PADRAO_ID, type PerfilDeArte } from '../arte/PerfilDeArte';
import { validarPerfilDeArte } from '../arte/validarPerfilDeArte';
import type { ContentSource } from '../ports/ContentSource';
import type { MissaoCarregada } from '../mundo/missoes';
import { validarDecoracao, type DecoracaoDaSubarea } from '../content/decoracao';
import type { MapaDoJogo } from '../content/Mapa';
import { deslocamentoDaSubarea } from '../mundo/subarea';

export class ConteudoInvalidoError extends Error {
  constructor(public readonly erros: string[]) {
    super(`Conteúdo inválido:\n- ${erros.join('\n- ')}`);
    this.name = 'ConteudoInvalidoError';
  }
}

export interface Conteudo {
  manifesto: Manifest;
  /** Perfil de arte da build, validado (ADR-003). */
  perfil: PerfilDeArte;
  /** Todas as subáreas do manifesto, já validadas. Quais estão abertas depende da missão ativa (ADR-004 seção 9.1). */
  todosOsMapas: Map<string, MapaDoJogo>;
  /** Missões na ordem do manifesto, cada uma com as subáreas que abre (ADR-002 seção 2.2). */
  missoes: MissaoCarregada[];
  /** Missão de início (sem requires): marco1. */
  missao: Missao;
  /** Avisos do conteúdo (W027, ADR-004 seção 13.19). Não bloqueiam; ficam para o relatório, não para o console. */
  avisos: string[];
  /** Início da partida: subárea, spawn e introdução (campo `inicio` da missão de início). */
  inicio: Inicio;
  textos: Textos;
  /** Enfeites do modo explorar por subárea (ADR-010 3). Só as subáreas que têm a chave `decoracao` no manifesto. */
  decoracao: Map<string, DecoracaoDaSubarea>;
}

/** Lê o manifesto (schema 2), o perfil de arte, todas as subáreas e todas as missões, e valida o conjunto. */
export class CarregarConteudo {
  constructor(private readonly fonte: ContentSource) {}

  async executar(): Promise<Conteudo> {
    const v = validarManifesto(await this.fonte.manifesto());
    if (!v.ok) throw new ConteudoInvalidoError(v.erros);
    const manifesto = v.manifesto;

    const idPerfil = manifesto.artProfile ?? PERFIL_PADRAO_ID;
    const vp = validarPerfilDeArte(await this.fonte.perfilDeArte(idPerfil), idPerfil);
    if (!vp.ok) throw new ConteudoInvalidoError(vp.erros);
    const perfil = vp.perfil;

    const todos = new Map<string, MapaDoJogo>();
    for (const decl of manifesto.maps) todos.set(decl.id, interpretarSubarea(await this.fonte.mapa(decl.id), decl));

    const missoes: MissaoCarregada[] = [];
    for (const decl of manifesto.missions) {
      missoes.push({
        id: decl.id,
        requires: [...decl.requires],
        maps: [...decl.maps],
        missao: interpretarMissao(await this.fonte.missao(decl.id)),
        final: decl.final === true,
      });
    }
    const iniciais = manifesto.missions.filter((m) => m.requires.length === 0);
    if (iniciais.length !== 1) throw new ConteudoInvalidoError([`Deve haver exatamente uma missão inicial (sem "requires"); há ${iniciais.length}.`]);
    const missao = missoes.find((m) => m.id === iniciais[0].id)!.missao;
    const textos = interpretarTextos(await this.fonte.textos(manifesto.locale));

    const erros = validarConteudo({ manifesto, todos, missoes, textos, perfil });
    if (erros.length > 0) throw new ConteudoInvalidoError(erros);

    // Decoração (ADR-010 8.2): E1 a E7 e E9 por subárea. E8 (peso do atlas) é do verificar:conteudo.
    const decoracao = new Map<string, DecoracaoDaSubarea>();
    const doModo = missoes.find((m) => m.id === 'enfeites')?.maps ?? [];
    for (const decl of manifesto.maps) {
      if (!decl.decoracao) continue;
      const mapa = todos.get(decl.id);
      const bruta = await this.fonte.decoracao(decl.id);
      if (!mapa) throw new ConteudoInvalidoError([`decoracao de "${decl.id}" sem subárea.`]);
      const errosDaSubarea = validarDecoracao(bruta, {
        subareasDoModo: doModo,
        largura: mapa.largura,
        altura: mapa.altura,
        bloqueado: (x, y) => mapa.colisao[y]?.[x] === true,
        proibido: (x, y) => tilesProibidosDaSubarea(mapa, perfil.sala).has(`${x},${y}`),
        chavesDeTexto: textos.chaves(),
      });
      if (errosDaSubarea.length > 0) throw new ConteudoInvalidoError(errosDaSubarea);
      decoracao.set(decl.id, bruta as DecoracaoDaSubarea);
    }

    const avisos = avisosDeConteudo({ manifesto, todos, missoes, textos, perfil });
    return { manifesto, perfil, todosOsMapas: todos, missoes, missao, inicio: missao.inicio!, textos, avisos, decoracao };
  }
}

/**
 * Tiles onde enfeite não pode ficar (ADR-010 3.7): objetos de jogo (spawn, portas, interruptor, bilhete, árvore, caixa,
 * peças, passagem) e a barra de controles (`sala.linhas − 2` e `− 1`, ADR-004 seção 8). Função pura.
 */
export function tilesProibidosDaSubarea(mapa: MapaDoJogo, tela: { colunas: number; linhas: number }): Set<string> {
  const TIPOS = new Set(['spawn', 'porta', 'portaFechada', 'interruptor', 'bilhete', 'arvore', 'peca', 'enfeite', 'passagem']);
  const proibidos = new Set<string>();
  for (const o of mapa.objetos) if (TIPOS.has(o.tipo)) proibidos.add(`${o.x},${o.y}`);
  // Barra de controles: as duas últimas linhas da TELA (perfil.sala), não do mapa (ADR-004 seção 8, item 6).
  const desl = deslocamentoDaSubarea(mapa, tela);
  for (let y = 0; y < mapa.altura; y++) {
    const linhaDaTela = y + desl.y;
    if (linhaDaTela !== tela.linhas - 2 && linhaDaTela !== tela.linhas - 1) continue;
    for (let x = 0; x < mapa.largura; x++) proibidos.add(`${x},${y}`);
  }
  return proibidos;
}

export type { Textos };
