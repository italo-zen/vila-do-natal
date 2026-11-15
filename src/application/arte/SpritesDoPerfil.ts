import type { Dimensao, PerfilDeArte } from './PerfilDeArte';
import { PERSONAGEM_IDS } from '../../domain/personagem/PersonagemId';

/** Tipos de imagem da build (ADR-003 seção 4): tileset de tiles, folhas de quadros (andar) e imagem única. */
export const TIPOS_DE_IMAGEM = ['tileset', 'folhas', 'imagem'] as const;
export type TipoDeImagem = (typeof TIPOS_DE_IMAGEM)[number];

export interface ImagemDoPerfil {
  /** Nome do PNG dentro da pasta do perfil. */
  arquivo: string;
  tipo: TipoDeImagem;
  /** Quadro (w, h). Obrigatório em tileset e folhas. */
  quadro?: Dimensao;
  /** Número de quadros de uma folha (folhas). */
  quadros?: number;
}

/** Conteúdo de `assets/<perfil>/sprites.json`: o que cada PNG é, sem depender do nome do arquivo. */
export interface SpritesDoPerfil {
  schemaVersion: number;
  perfil: string;
  imagens: ImagemDoPerfil[];
}

/** Sprite de sobrinho: spr_<id>_... (ADR-003 seção 4; GDD 4.8). */
export const EHSPRITE_DE_SOBRINHO = /^spr_(lolo|bibi|dandan|tutu)_/;

/**
 * Regra por sprite (BUG de publicação: sprites de sobrinho com 4 cores foram para o artifact).
 * `contagens` é a quantidade de cores distintas de cada PNG (arquivo -> cores). Devolve os erros.
 */
export function validarCoresDosSobrinhos(contagens: Record<string, number>, perfil: PerfilDeArte): string[] {
  const min = perfil.sprites.sobrinho.coresMin;
  return Object.entries(contagens)
    .filter(([arquivo, cores]) => EHSPRITE_DE_SOBRINHO.test(arquivo) && cores < min)
    .map(([arquivo, cores]) => `${arquivo}: ${cores} cores; o mínimo por sprite de sobrinho é ${min} (sprites.sobrinho.coresMin).`);
}

/** Sprite do Nick (spr_nick_*): mesmo critério de cor mínima (ADR-005 seção 7.1; `sprites.nick.coresMin`). */
export const EHSPRITE_DO_NICK = /^spr_nick_/;

/** Cores de cada sprite do Sobrinho e do Nick, contra os mínimos do perfil (regra de 2026-11-08). */
export function validarCoresDosPersonagens(contagens: Record<string, number>, perfil: PerfilDeArte): string[] {
  const erros = validarCoresDosSobrinhos(contagens, perfil);
  const min = perfil.sprites.nick?.coresMin;
  if (min === undefined) return [...erros, 'sprites.nick.coresMin ausente no perfil (ADR-005 seção 7.1).'];
  for (const [arquivo, cores] of Object.entries(contagens)) {
    if (EHSPRITE_DO_NICK.test(arquivo) && cores < min) erros.push(`${arquivo}: ${cores} cores; o mínimo por sprite do Nick é ${min} (sprites.nick.coresMin).`);
  }
  return erros;
}

export type ResultadoSprites = { ok: true; sprites: SpritesDoPerfil } | { ok: false; erros: string[] };

const ehInteiroPositivo = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v > 0;

/**
 * Valida o sprites.json contra o perfil: tileset com quadro = tile, folhas com quadro e número de quadros,
 * nomes únicos e `.png`. As dimensões reais dos PNG são conferidas pelo `npm run validar:perfil`.
 */
export function validarSprites(bruto: unknown, perfil: PerfilDeArte): ResultadoSprites {
  const erros: string[] = [];
  const s = bruto as Partial<SpritesDoPerfil> | null;
  if (typeof s !== 'object' || s === null || Array.isArray(s)) return { ok: false, erros: ['sprites.json precisa ser um objeto.'] };
  if (s.perfil !== perfil.id) erros.push(`sprites.json é do perfil "${String(s.perfil)}", mas a build usa "${perfil.id}".`);
  if (!Array.isArray(s.imagens)) return { ok: false, erros: [...erros, 'sprites.json sem a lista "imagens".'] };

  const vistos = new Set<string>();
  s.imagens.forEach((img, i) => {
    const rotulo = `imagens[${i}]`;
    if (typeof img?.arquivo !== 'string' || !img.arquivo.endsWith('.png')) {
      erros.push(`${rotulo}: "arquivo" precisa ser um nome .png.`);
      return;
    }
    if (vistos.has(img.arquivo)) erros.push(`${rotulo}: arquivo "${img.arquivo}" repetido.`);
    vistos.add(img.arquivo);
    if (!(TIPOS_DE_IMAGEM as readonly string[]).includes(img.tipo)) {
      erros.push(`${rotulo} (${img.arquivo}): tipo "${String(img.tipo)}" desconhecido.`);
      return;
    }
    if (img.tipo === 'tileset' || img.tipo === 'folhas') {
      if (!img.quadro || !ehInteiroPositivo(img.quadro.w) || !ehInteiroPositivo(img.quadro.h)) {
        erros.push(`${rotulo} (${img.arquivo}): quadro precisa de w e h inteiros positivos.`);
      }
    }
    if (img.tipo === 'tileset' && img.quadro && img.quadro.w !== perfil.tile) {
      erros.push(`${rotulo} (${img.arquivo}): tileset com quadro ${img.quadro.w} px, mas o tile do perfil é ${perfil.tile}.`);
    }
    if (img.tipo === 'folhas' && !ehInteiroPositivo(img.quadros)) {
      erros.push(`${rotulo} (${img.arquivo}): folhas precisam de "quadros" inteiro positivo.`);
    }
    // Folhas do Sobrinho (spr_<id>_...): o quadro do sprite tem de ser o quadro do corpo do perfil (ADR-003 seção 4).
    const doSobrinho = PERSONAGEM_IDS.some((id) => img.arquivo.startsWith(`spr_${id}_`));
    const corpo = perfil.corpos.sobrinho.quadro;
    if (doSobrinho && img.tipo === 'folhas' && img.quadro && (img.quadro.w !== corpo.w || img.quadro.h !== corpo.h)) {
      erros.push(
        `${rotulo} (${img.arquivo}): quadro ${img.quadro.w}×${img.quadro.h} do Sobrinho não bate com corpos.sobrinho.quadro do perfil (${corpo.w}×${corpo.h}).`,
      );
    }
  });

  return erros.length > 0 ? { ok: false, erros } : { ok: true, sprites: bruto as SpritesDoPerfil };
}
