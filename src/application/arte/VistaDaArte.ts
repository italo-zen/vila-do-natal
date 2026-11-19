/**
 * Dados de arte da visão 3/4 (`assets/<perfil>/vista.json`, ADR-012). Hoje: o vidro. A Arte lista, por área, as arestas verticais
 * (à esquerda do tile (x, y), coordenadas do conteúdo) que usam a peça `spr_parede_vidro_<posição>` em vez da linha de parede.
 * Só desenho: a colisão e `paredes` não mudam.
 */
export interface ArestaDeVidro {
  tipo: 'linha_v';
  x: number;
  y: number;
}

export interface VistaDaArte {
  schemaVersion: number;
  vidro?: Record<string, ArestaDeVidro[]>;
}

export type ResultadoVistaDaArte = { ok: true; vista: VistaDaArte } | { ok: false; erros: string[] };

const ehInteiro = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);

/** Forma do `vista.json`: schemaVersion 1; `vidro` = área → lista de { tipo: "linha_v", x, y } inteiros ≥ 0. */
export function validarVistaDaArte(bruto: unknown): ResultadoVistaDaArte {
  if (typeof bruto !== 'object' || bruto === null || Array.isArray(bruto)) return { ok: false, erros: ['vista.json precisa ser um objeto.'] };
  const v = bruto as Record<string, unknown>;
  const erros: string[] = [];
  if (v.schemaVersion !== 1) erros.push(`schemaVersion ${String(v.schemaVersion)} não suportada (o motor lê a 1).`);
  if (v.vidro !== undefined) {
    if (typeof v.vidro !== 'object' || v.vidro === null || Array.isArray(v.vidro)) erros.push('vidro precisa ser um objeto área → lista de arestas.');
    else {
      for (const [area, lista] of Object.entries(v.vidro as Record<string, unknown>)) {
        if (!Array.isArray(lista)) {
          erros.push(`vidro.${area} precisa ser uma lista.`);
          continue;
        }
        lista.forEach((a, i) => {
          const e = a as Partial<ArestaDeVidro> | null;
          if (!e || e.tipo !== 'linha_v' || !ehInteiro(e.x) || !ehInteiro(e.y) || e.x < 0 || e.y < 0) erros.push(`vidro.${area}[${i}] precisa ser { tipo: "linha_v", x, y } com inteiros ≥ 0.`);
        });
      }
    }
  }
  return erros.length > 0 ? { ok: false, erros } : { ok: true, vista: bruto as VistaDaArte };
}
