import type { ManifestoMapa } from './Manifest';
import type { MapaDoJogo, ObjetoDoMapa, ValorDeObjeto } from './Mapa';

/**
 * Lê o JSON de uma subárea gerado pelo conversor (docs/conversor-tmx.md, seção 4.2). Não é o Tiled:
 * o conversor já fez a geometria. Aqui só se confere a forma e se monta o `MapaDoJogo`.
 */
export function interpretarSubarea(bruto: unknown, decl: ManifestoMapa): MapaDoJogo {
  const b = bruto as Record<string, unknown> | null;
  const erro = (msg: string) => new Error(`Subárea "${decl.id}" inválida: ${msg}`);
  if (typeof b !== 'object' || b === null || Array.isArray(b)) throw erro('o arquivo não é um objeto.');
  if (b.id !== decl.id) throw erro(`o id do arquivo é "${String(b.id)}", e o manifesto diz "${decl.id}".`);
  const tile = b.tile;
  const largura = b.largura;
  const altura = b.altura;
  if (!Number.isInteger(tile) || (tile as number) <= 0) throw erro('tile ausente ou inválido.');
  if (!Number.isInteger(largura) || !Number.isInteger(altura) || (largura as number) <= 0 || (altura as number) <= 0) {
    throw erro('largura e altura precisam ser inteiros positivos.');
  }
  if (typeof b.escuro !== 'boolean') throw erro('escuro precisa ser booleano.');
  const L = largura as number;
  const A = altura as number;
  if (!Array.isArray(b.chao) || b.chao.length !== L * A) throw erro(`chao precisa ter ${L * A} valores.`);
  if (!Array.isArray(b.colisao) || b.colisao.length !== L * A) throw erro(`colisao precisa ter ${L * A} valores.`);
  if (!Array.isArray(b.objetos)) throw erro('objetos precisa ser uma lista.');

  const chao: number[][] = [];
  const colisao: boolean[][] = [];
  for (let y = 0; y < A; y++) {
    chao.push((b.chao as number[]).slice(y * L, (y + 1) * L).map(Number));
    colisao.push((b.colisao as number[]).slice(y * L, (y + 1) * L).map((v) => Number(v) !== 0));
  }

  const objetos: ObjetoDoMapa[] = (b.objetos as Array<Record<string, unknown>>).map((o, i) => {
    if (typeof o?.tipo !== 'string' || !Number.isInteger(o.x) || !Number.isInteger(o.y)) {
      throw erro(`objeto ${i} precisa de tipo, x e y inteiros.`);
    }
    // Móvel: w e h são inteiros na leitura (as regras de tamanho e de bloqueio ficam em validarConteudo).
    if (o.tipo === 'movel' && (!Number.isInteger(o.w) || !Number.isInteger(o.h))) {
      throw erro(`objeto ${i} (movel) precisa de w e h inteiros.`);
    }
    const dados: Record<string, ValorDeObjeto> = {};
    for (const [k, v] of Object.entries(o)) {
      if (k === 'tipo' || k === 'x' || k === 'y') continue;
      dados[k] = v as ValorDeObjeto;
    }
    return { tipo: o.tipo, x: o.x as number, y: o.y as number, dados };
  });

  return { id: decl.id, tileset: decl.tileset, tile: tile as number, largura: L, altura: A, escuro: b.escuro, chao, colisao, objetos };
}
