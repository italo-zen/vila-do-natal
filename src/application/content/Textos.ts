export type Variaveis = Record<string, string>;

/**
 * Valor de uma chave de texto: uma string (uma página) ou uma lista de strings (várias páginas, como os avisos
 * "ainda não" de GDD 15.2.7 e ADR-002 seção 2.2). Cada página segue o limite de 2 linhas de 28 caracteres.
 */
export type ValorDeTexto = string | string[];

/** Dicionário de textos com interpolação de `{variavel}`. Nunca devolve "undefined". */
export class Textos {
  constructor(private readonly dicionario: Record<string, ValorDeTexto>) {}

  tem(chave: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.dicionario, chave);
  }

  /** Primeira página do texto (ou o próprio texto, se for uma página só). */
  t(chave: string, vars: Variaveis = {}): string {
    return this.paginas(chave, vars)[0];
  }

  /** Todas as páginas de uma chave, na ordem. Chave ausente vira "[chave]", como em `t`. */
  paginas(chave: string, vars: Variaveis = {}): string[] {
    const base = this.dicionario[chave];
    const lista = typeof base === 'string' ? [base] : Array.isArray(base) ? base : null;
    if (!lista || lista.length === 0) return [`[${chave}]`];
    return lista.map((p) => p.replace(/\{(\w+)\}/g, (inteiro, nome: string) => (nome in vars ? vars[nome] : inteiro)));
  }

  /** Número de páginas de uma chave (0 se não existe). */
  quantasPaginas(chave: string): number {
    const base = this.dicionario[chave];
    if (typeof base === 'string') return 1;
    return Array.isArray(base) ? base.length : 0;
  }
}

export function interpretarTextos(bruto: unknown): Textos {
  if (typeof bruto !== 'object' || bruto === null || Array.isArray(bruto)) {
    throw new Error('Arquivo de textos inválido.');
  }
  const d: Record<string, ValorDeTexto> = {};
  for (const [k, v] of Object.entries(bruto as Record<string, unknown>)) {
    if (typeof v === 'string') d[k] = v;
    else if (Array.isArray(v) && v.every((p) => typeof p === 'string')) d[k] = [...(v as string[])];
  }
  return new Textos(d);
}
