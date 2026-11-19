import type { MapaDoJogo } from './Mapa';
import type { Textos } from './Textos';
import type { PerfilDeArte } from '../arte/PerfilDeArte';
import type { MissaoCarregada } from '../mundo/missoes';

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

/** Limite aproximado de caracteres de um texto de dica: 3 linhas de 28 (GDD 16.11; N013). */
export const TETO_DE_CARACTERES_DA_DICA = 84;
/** Chaves fixas do Marco 3 (ADR-005 seção 2.4): sem elas a tela não funciona. */
export const CHAVES_DE_NICK = ['nick.acordou', 'nick.latido'] as const;
export const CHAVES_DE_TELA_DO_MARCO3 = ['dica.titulo', 'dica.voltar', 'barra.casa2', 'barra.dica', 'comojogar.farejar', 'comojogar.dica'] as const;
const ESTADOS = ['dormindo', 'acordado'] as const;

const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
/** Valida o Nick e as dicas de todas as missões do conteúdo. Devolve os erros com código (vazio = ok). */
export function validarNick(e: EntradaDoNick): string[] {
  const erros: string[] = [];
  const { missoes, textos } = e;
  const inicial = missoes.find((m) => m.requires.length === 0);

  for (const m of missoes) {
    const pre = `nick '${m.id}'`;
    const bruto = m.missao as unknown as Record<string, unknown>;
    const nick = bruto.nick as unknown;
    const dica = bruto.dica as unknown;

    // N015 (ADR-013): `nick.dorme` e `nick.alvo` saíram das missões; o plano os sorteia por partida (`content/sorteio.json`).
    if (nick !== undefined) erros.push(`N015 missão '${m.id}': nick.dorme e nick.alvo são do plano (sorteio.json), não da missão`);
    if (!ehObjeto(dica)) {
      erros.push(`N001 missão '${m.id}': dica ausente`);
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
