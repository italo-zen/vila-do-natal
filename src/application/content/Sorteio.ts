import type { Direcao } from '../../domain/shared/Direcao';

/** Dados do sorteio (`content/sorteio.json`, ADR-013 seção 1). Regras e áreas; os tiles candidatos são calculados dos mapas. */
export interface RetanguloDoComodo {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface ComodoDoSorteio {
  id: string;
  mapa: string;
  /** Tiles locais já girados. Sem retângulo, o cômodo é o mapa todo. */
  retangulo?: RetanguloDoComodo;
}
export interface AreaDePeca {
  id: string;
  minimo: number;
  comodos: ComodoDoSorteio[];
  /** Passagem entre cômodos da área (Cozinha e Lavanderia, GDD 21.16.1): a peça não a toma, e ela não conta como acesso a examinável. Tiles locais. */
  passagem?: RetanguloDoComodo;
}
export interface RegraDoNick {
  areas: string[];
  /** Mínimo de candidatos na lista inteira. */
  minimo?: number;
  direcao: Direcao;
  /** Não sorteia o Nick na área da peça de ordem N. */
  foraDaAreaDaPeca?: number;
  /** Não sorteia o Nick na área da caixa de enfeite (só na missão que tem a caixa, GDD 21.16.12). */
  foraDaAreaDaCaixa?: boolean;
  /** Tile a `perfil.luz.raioEmTiles` ou menos do spawn dado, e a Chebyshev 2 ou mais dele. */
  dentroDaLuzDeEntrada?: { mapa: string; spawn: string };
}
export interface Sorteio {
  schemaVersion: number;
  pecas: { quantidade: number; areas: AreaDePeca[] };
  nick: Record<string, RegraDoNick>;
}

/** Leitura sem validar a fundo (a validação é de `validarSorteio`, S001). */
export function interpretarSorteio(bruto: unknown): Sorteio {
  const s = bruto as Partial<Sorteio> | null;
  if (!s || typeof s !== 'object' || !s.pecas || !Array.isArray(s.pecas.areas) || !s.nick || typeof s.nick !== 'object') {
    throw new Error('S001 sorteio.json com forma errada (precisa de pecas.areas e nick).');
  }
  return s as Sorteio;
}
