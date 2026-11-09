import type { Manifest } from '../content/Manifest';
import type { MapaDoJogo } from '../content/Mapa';
import { interpretarSubarea } from '../content/interpretarSubarea';
import { interpretarMissao, type Inicio, type Missao } from '../content/Missao';
import { interpretarTextos, type Textos } from '../content/Textos';
import { avisosDeConteudo, validarConteudo } from '../content/validarConteudo';
import { validarManifesto } from '../content/validarManifesto';
import { PERFIL_PADRAO_ID, type PerfilDeArte } from '../arte/PerfilDeArte';
import { validarPerfilDeArte } from '../arte/validarPerfilDeArte';
import type { ContentSource } from '../ports/ContentSource';
import type { MissaoCarregada } from '../mundo/missoes';

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
      missoes.push({ id: decl.id, requires: [...decl.requires], maps: [...decl.maps], missao: interpretarMissao(await this.fonte.missao(decl.id)) });
    }
    const iniciais = manifesto.missions.filter((m) => m.requires.length === 0);
    if (iniciais.length !== 1) throw new ConteudoInvalidoError([`Deve haver exatamente uma missão inicial (sem "requires"); há ${iniciais.length}.`]);
    const missao = missoes.find((m) => m.id === iniciais[0].id)!.missao;
    const textos = interpretarTextos(await this.fonte.textos(manifesto.locale));

    const erros = validarConteudo({ manifesto, todos, missoes, textos, perfil });
    if (erros.length > 0) throw new ConteudoInvalidoError(erros);

    const avisos = avisosDeConteudo({ manifesto, todos, missoes, textos, perfil });
    return { manifesto, perfil, todosOsMapas: todos, missoes, missao, inicio: missao.inicio!, textos, avisos };
  }
}

export type { Textos };
