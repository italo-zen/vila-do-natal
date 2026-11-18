import type { Dimensao, PerfilDeArte } from './PerfilDeArte';
import { PERSONAGEM_IDS } from '../../domain/personagem/PersonagemId';

/** Tipos de imagem da build (ADR-003 seção 4): tileset de tiles, folhas de quadros (andar) e imagem única. */
export const TIPOS_DE_IMAGEM = ['tileset', 'folhas', 'imagem'] as const;
export type TipoDeImagem = (typeof TIPOS_DE_IMAGEM)[number];

/** Pixel do PNG (ADR-012 seção 8). Para móvel, o canto sudoeste da pegada; para peça de parede e porta, o centro da aresta. */
export interface Ancora {
  x: number;
  y: number;
}

/** Dados de um móvel desenhado em 3/4 (ADR-012 seções 5 e 8). Todos opcionais no `sprites.json`: sem `movel`, desenho de hoje. */
export interface MovelDoSprite {
  pegada: Dimensao;
  ancora: Ancora;
  sombra: { dx: number; dy: number };
}

export interface ImagemDoPerfil {
  /** Nome do PNG dentro da pasta do perfil. */
  arquivo: string;
  tipo: TipoDeImagem;
  /** Quadro (w, h). Obrigatório em tileset e folhas. */
  quadro?: Dimensao;
  /** Número de quadros de uma folha (folhas). */
  quadros?: number;
  /** Âncora de peça de parede ou de porta (ADR-012 seção 8). */
  ancora?: Ancora;
  /** Móvel em 3/4: pegada, âncora e sombra (ADR-012 seção 8). */
  movel?: MovelDoSprite;
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
    // Campos opcionais da visão 3/4 (ADR-012 seção 8): só a forma. As medidas contra o PNG são de `validarMoveisDoPerfil`.
    const ehAncora = (a: unknown): a is Ancora => typeof a === 'object' && a !== null && Number.isInteger((a as Ancora).x) && Number.isInteger((a as Ancora).y);
    if (img.ancora !== undefined && !ehAncora(img.ancora)) erros.push(`${rotulo} (${img.arquivo}): ancora precisa ter x e y inteiros.`);
    if (img.movel !== undefined) {
      const m = img.movel as Partial<MovelDoSprite>;
      if (!m.pegada || !ehInteiroPositivo(m.pegada.w) || !ehInteiroPositivo(m.pegada.h)) erros.push(`${rotulo} (${img.arquivo}): movel.pegada precisa de w e h inteiros positivos.`);
      if (!ehAncora(m.ancora)) erros.push(`${rotulo} (${img.arquivo}): movel.ancora precisa ter x e y inteiros.`);
      if (!m.sombra || !Number.isInteger(m.sombra.dx) || !Number.isInteger(m.sombra.dy)) erros.push(`${rotulo} (${img.arquivo}): movel.sombra precisa de dx e dy inteiros.`);
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

/** Dimensões e cores reais de um PNG, medidas pelo `validar:perfil` (ou fabricadas num teste). */
export interface MedidaDoPng {
  w: number;
  h: number;
  cores: number;
  /** PNG indexado de 8 bits (ADR-012 seção 8). */
  indexado: boolean;
}

/** Máximos de cores da visão 3/4 (ADR-012 seção 8): por móvel e por imagem de parede, porta ou outra peça. */
export const MAX_DE_CORES_POR_MOVEL = 16;
export const MAX_DE_CORES_POR_IMAGEM_3_4 = 32;

/**
 * Confere os móveis (e as âncoras) do `sprites.json` contra o PNG, o perfil e o conteúdo (ADR-012 seção 8). Devolve erros e avisos.
 * - largura do PNG = `w × tile + sombra.dx`; altura ≥ `h × tile + sombra.dy`; `sombra` igual à do perfil;
 * - âncora dentro da imagem; E = altura − sombra.dy − h × tile ≤ `faceNorte` (erro);
 * - E acima do limite de piso andável com tile andável ao norte da pegada: aviso;
 * - ≤ 16 cores por móvel, ≤ 32 por imagem com âncora; PNG indexado;
 * - `pegada` igual a `w` e `h` do objeto `movel` de mesmo id em `content/maps/casa-real/`.
 * `moveis` vem do conteúdo: id → { w, h, norteAndavel }.
 */
export function validarMoveisDoPerfil(
  imagens: readonly ImagemDoPerfil[],
  medidas: Readonly<Record<string, MedidaDoPng>>,
  perfil: PerfilDeArte,
  moveis: ReadonlyMap<string, { w: number; h: number; norteAndavel: boolean }>,
): { erros: string[]; avisos: string[] } {
  const erros: string[] = [];
  const avisos: string[] = [];
  const v = perfil.vista;
  for (const img of imagens) {
    const medida = medidas[img.arquivo];
    if (!medida || (!img.movel && !img.ancora)) continue;
    const nome = img.arquivo;
    const ancora = img.movel?.ancora ?? img.ancora!;
    if (!v) {
      erros.push(`${nome}: usa movel ou ancora, mas o perfil não tem o bloco vista (ADR-012 seção 2).`);
      continue;
    }
    if (ancora.x < 0 || ancora.y < 0 || ancora.x > medida.w || ancora.y > medida.h) erros.push(`${nome}: ancora (${ancora.x}, ${ancora.y}) fora da imagem ${medida.w}×${medida.h}.`);
    if (!medida.indexado) erros.push(`${nome}: o PNG da visão 3/4 precisa ser indexado de 8 bits.`);
    if (medida.cores > MAX_DE_CORES_POR_IMAGEM_3_4) erros.push(`${nome}: ${medida.cores} cores; o máximo por imagem é ${MAX_DE_CORES_POR_IMAGEM_3_4}.`);
    if (!img.movel) continue;
    const { pegada, sombra } = img.movel;
    if (medida.cores > MAX_DE_CORES_POR_MOVEL) erros.push(`${nome}: ${medida.cores} cores; o máximo por móvel é ${MAX_DE_CORES_POR_MOVEL}.`);
    if (sombra.dx !== v.sombra.dx || sombra.dy !== v.sombra.dy) erros.push(`${nome}: movel.sombra ${sombra.dx}/${sombra.dy} difere de vista.sombra ${v.sombra.dx}/${v.sombra.dy}.`);
    const larguraEsperada = pegada.w * perfil.tile + v.sombra.dx;
    if (medida.w !== larguraEsperada) erros.push(`${nome}: largura ${medida.w}; esperado ${larguraEsperada} (w × ${perfil.tile} + sombra.dx).`);
    const alturaMinima = pegada.h * perfil.tile + v.sombra.dy;
    if (medida.h < alturaMinima) erros.push(`${nome}: altura ${medida.h}; o mínimo é ${alturaMinima} (h × ${perfil.tile} + sombra.dy).`);
    const extensao = Math.max(0, medida.h - v.sombra.dy - pegada.h * perfil.tile);
    if (extensao > v.faceNorte) erros.push(`${nome}: extensão E ${extensao} passa de faceNorte ${v.faceNorte}.`);
    const id = nome.replace(/^spr_/, '').replace(/\.png$/, '');
    const doConteudo = moveis.get(id);
    if (doConteudo) {
      if (doConteudo.w !== pegada.w || doConteudo.h !== pegada.h) erros.push(`${nome}: pegada ${pegada.w}×${pegada.h} difere do móvel "${id}" do conteúdo (${doConteudo.w}×${doConteudo.h}).`);
      if (doConteudo.norteAndavel && extensao > Math.min(v.extensaoEmPisoAndavel, v.faceNorte)) {
        avisos.push(`${nome}: extensão E ${extensao} sobre piso andável ao norte; o limite é ${v.extensaoEmPisoAndavel} (o sobrinho some atrás).`);
      }
    }
  }
  return { erros, avisos };
}
