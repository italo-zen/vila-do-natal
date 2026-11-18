import type { MapaDoJogo } from '../content/Mapa';
import type { PerfilDeArte, VistaDoPerfil } from '../arte/PerfilDeArte';
import { paredeNoTile } from './arestas';

/**
 * Visão 3/4 (ADR-012): contrato de desenho de paredes, móveis e portas. Tudo aqui é função pura sobre o mapa e o perfil: a
 * colisão, `paredes`, portas e conteúdo não mudam (ADR-012 seção 1). Nenhum número de arte mora neste arquivo: faceNorte,
 * linhaLateral, sombra e recuoMaximo vêm de `perfil.vista`.
 */

/** Tipo de peça de parede (ADR-012 seção 3.1). A aresta sul de um cômodo não é desenhada (não aparece na lista). */
export type TipoDeParede = 'face_norte' | 'linha_h' | 'linha_v';

/**
 * Uma aresta a desenhar. Coordenadas em tiles da área, na linha da grade: horizontal em (x, y) é o lado de cima do tile (x, y),
 * da coluna x; vertical em (x, y) é o lado esquerdo do tile (x, y), na linha y.
 */
export interface ArestaDesenhada {
  tipo: TipoDeParede;
  x: number;
  y: number;
  /** Há outra aresta do mesmo tipo à esquerda (horizontais) ou acima (verticais)? Escolhe meio, ponta ou ilha. */
  antes: boolean;
  /** Há outra aresta do mesmo tipo à direita (horizontais) ou abaixo (verticais)? */
  depois: boolean;
  /** Só `linha_v`: há piso a leste da linha (leva a sombra de `sombra.dx` para o leste). */
  pisoALeste: boolean;
  /** Só `linha_v`: a linha encontra uma face norte no alto e sobe até o topo dela. */
  topoComFace: boolean;
  /** `id` da porta que usa esta aresta, se houver. A classificação é a mesma; a cena escolhe a peça da porta. */
  porta?: string;
}

const temPiso = (m: MapaDoJogo, x: number, y: number): boolean => x >= 0 && y >= 0 && x < m.largura && y < m.altura && m.chao[y][x] !== 0;

/**
 * Classifica as arestas com bit ligado em `paredes` (ADR-012 seção 3.1). Aresta compartilhada por dois tiles vale uma só.
 * - Horizontal com piso ao sul e vazio ao norte: `face_norte`. A face (de `faceNorte` px) cai sobre o tile vazio do norte,
 *   então nunca cobre piso da mesma área.
 * - Horizontal com piso dos dois lados (muro interno, como Cozinha e Lavanderia): `linha_h`, sem face.
 * - Horizontal com vazio ao sul: não é desenhada.
 * - Vertical com piso em pelo menos um lado: `linha_v`.
 */
export function classificarArestas(mapa: MapaDoJogo): ArestaDesenhada[] {
  const bruto = new Map<string, { tipo: TipoDeParede; x: number; y: number }>();
  const chave = (t: TipoDeParede, x: number, y: number) => `${t === 'linha_v' ? 'v' : 'h'},${x},${y}`;
  for (let y = 0; y < mapa.altura; y++) {
    for (let x = 0; x < mapa.largura; x++) {
      if (!temPiso(mapa, x, y)) continue;
      if (paredeNoTile(mapa.paredes, x, y, 'cima')) {
        const t: TipoDeParede = temPiso(mapa, x, y - 1) ? 'linha_h' : 'face_norte';
        bruto.set(chave(t, x, y), { tipo: t, x, y });
      }
      if (paredeNoTile(mapa.paredes, x, y, 'baixo') && temPiso(mapa, x, y + 1)) {
        bruto.set(chave('linha_h', x, y + 1), { tipo: 'linha_h', x, y: y + 1 });
      }
      if (paredeNoTile(mapa.paredes, x, y, 'esquerda')) bruto.set(chave('linha_v', x, y), { tipo: 'linha_v', x, y });
      if (paredeNoTile(mapa.paredes, x, y, 'direita')) bruto.set(chave('linha_v', x + 1, y), { tipo: 'linha_v', x: x + 1, y });
    }
  }
  const portas = new Map<string, string>();
  for (const o of mapa.objetos) {
    if (o.tipo !== 'porta') continue;
    const lado = String(o.dados.lado);
    const [ax, ay, tipoDaAresta] =
      lado === 'cima' ? [o.x, o.y, 'h'] : lado === 'baixo' ? [o.x, o.y + 1, 'h'] : lado === 'esquerda' ? [o.x, o.y, 'v'] : [o.x + 1, o.y, 'v'];
    portas.set(`${tipoDaAresta},${ax},${ay}`, String(o.dados.id));
  }
  const arestas: ArestaDesenhada[] = [];
  for (const a of bruto.values()) {
    const vertical = a.tipo === 'linha_v';
    const vizinhoAntes = vertical ? bruto.get(chave(a.tipo, a.x, a.y - 1)) : bruto.get(chave(a.tipo, a.x - 1, a.y));
    const vizinhoDepois = vertical ? bruto.get(chave(a.tipo, a.x, a.y + 1)) : bruto.get(chave(a.tipo, a.x + 1, a.y));
    const faceNoAlto = vertical && (bruto.get(chave('face_norte', a.x - 1, a.y)) !== undefined || bruto.get(chave('face_norte', a.x, a.y)) !== undefined);
    arestas.push({
      tipo: a.tipo,
      x: a.x,
      y: a.y,
      antes: vizinhoAntes !== undefined,
      depois: vizinhoDepois !== undefined,
      pisoALeste: vertical && temPiso(mapa, a.x, a.y),
      topoComFace: vertical && vizinhoAntes === undefined && faceNoAlto,
      porta: portas.get(`${vertical ? 'v' : 'h'},${a.x},${a.y}`),
    });
  }
  return arestas.sort((p, q) => p.y - q.y || p.x - q.x || p.tipo.localeCompare(q.tipo));
}

/** Nome da peça de uma aresta, para escolher o desenho e para o script de combinações (ADR-012 seção 3.2). */
export function chaveDaPeca(a: ArestaDesenhada): string {
  if (a.tipo === 'linha_v') {
    const posicao = a.antes ? (a.depois ? 'meio' : 'fim') : a.topoComFace ? 'topo_com_face' : a.depois ? 'topo' : 'ilha';
    return `linha_v_${posicao}${a.pisoALeste ? '_sombra' : ''}`;
  }
  const posicao = a.antes ? (a.depois ? 'meio' : 'direita') : a.depois ? 'esquerda' : 'ilha';
  return `${a.tipo}_${posicao}`;
}

/**
 * Chave da peça de vidro (ADR-012 + `vista.json`): a mesma `chaveDaPeca` de uma `linha_v`, com o prefixo `linha_v_` trocado por
 * `spr_parede_vidro_` (ex.: `linha_v_meio_sombra` → `spr_parede_vidro_meio_sombra`). Aresta que não é `linha_v` não tem vidro.
 */
export function chaveDoVidro(a: ArestaDesenhada): string | undefined {
  return a.tipo === 'linha_v' ? `spr_parede_vidro_${chaveDaPeca(a).replace(/^linha_v_/, '')}` : undefined;
}

/** A aresta está na lista de vidro da área (`vista.json`)? Coordenadas do conteúdo: aresta vertical à esquerda do tile (x, y). */
export function ehVidro(a: ArestaDesenhada, vidroDaArea: readonly { tipo: string; x: number; y: number }[] | undefined): boolean {
  return a.tipo === 'linha_v' && (vidroDaArea ?? []).some((v) => v.tipo === 'linha_v' && v.x === a.x && v.y === a.y);
}

/**
 * Retângulo, em px da área (sem o deslocamento da tela), que a peça desenhada ocupa. `face_norte` ocupa o tile vazio de cima
 * mais a sombra; as linhas, `linhaLateral` px centrados na aresta (a vertical sobe `faceNorte` quando tem topo com face).
 */
export function retanguloDaAresta(a: ArestaDesenhada, tile: number, v: VistaDoPerfil): { x: number; y: number; w: number; h: number } {
  const px = a.x * tile;
  const py = a.y * tile;
  if (a.tipo === 'face_norte') return { x: px, y: py - v.faceNorte, w: tile, h: v.faceNorte + v.sombra.dy };
  if (a.tipo === 'linha_h') return { x: px, y: py - v.linhaLateral / 2, w: tile, h: v.linhaLateral };
  const sobe = a.topoComFace ? v.faceNorte : 0;
  return { x: px - v.linhaLateral / 2, y: py - sobe, w: v.linhaLateral + (a.pisoALeste ? v.sombra.dx : 0), h: tile + sobe };
}

/**
 * A face nunca cobre piso (ADR-012 seção 3.1): a parte da face acima da aresta cai só em tiles sem piso. Devolve os tiles de
 * piso cobertos (vazio = correto). Vale também para `faceNorte` ≤ tile.
 */
export function pisoCobertoPelaFace(mapa: MapaDoJogo, tile: number, v: VistaDoPerfil, arestas: readonly ArestaDesenhada[] = classificarArestas(mapa)): { x: number; y: number }[] {
  const cobertos: { x: number; y: number }[] = [];
  for (const a of arestas) {
    if (a.tipo !== 'face_norte') continue;
    const topo = a.y * tile - v.faceNorte;
    for (let ty = Math.floor(topo / tile); ty < a.y; ty++) if (temPiso(mapa, a.x, ty)) cobertos.push({ x: a.x, y: ty });
  }
  return cobertos;
}

/** Deslocamento da área na tela, em tiles (como `deslocamentoDaSubarea`, repetido aqui para não depender de `subarea.ts`). */
const deslocamentoY = (m: MapaDoJogo, linhasDaTela: number) => Math.floor((linhasDaTela - m.altura) / 2);

/**
 * Quanto a área é desenhada mais para baixo, em px (ADR-012 seção 4): o que falta para a face caber no alto da tela,
 * limitado pela folga sob a barra e por `recuoMaximo`. Usa a face mais alta na tela (a linha de cima do piso).
 * `folga` = topo da barra − base da última linha de piso andável; sem barra (`barraAltura` 0) a folga é a base da tela.
 * Perfil sem `vista` (ou sem face norte) = 0. Só a Sala tem recuo ≠ 0 nas 9 áreas.
 */
export function recuoVertical(mapa: MapaDoJogo, perfil: Pick<PerfilDeArte, 'tile' | 'sala' | 'vista' | 'barra'>): number {
  const v = perfil.vista;
  if (!v) return 0;
  const faces = classificarArestas(mapa).filter((a) => a.tipo === 'face_norte');
  if (faces.length === 0) return 0;
  const tile = perfil.tile;
  const desl = deslocamentoY(mapa, perfil.sala.linhas);
  const alturaDaTela = perfil.sala.linhas * tile;
  const topoDaBarra = alturaDaTela - perfil.barra.alturaPorLinhas['2'];
  let ultimaLinhaAndavel = -1;
  for (let y = 0; y < mapa.altura; y++) if (mapa.chao[y].some((g, x) => g !== 0 && !mapa.colisao[y][x])) ultimaLinhaAndavel = y;
  const baseDoPiso = (desl + ultimaLinhaAndavel + 1) * tile;
  const folga = Math.max(0, topoDaBarra - baseDoPiso);
  const arestaMaisAlta = Math.min(...faces.map((a) => (desl + a.y) * tile));
  const falta = Math.max(0, v.faceNorte - arestaMaisAlta);
  return Math.min(falta, folga, v.recuoMaximo);
}

/** Profundidade de desenho por base em px (ADR-012 seção 6). `base` = y em px do mundo da aresta ou da pegada. */
export const profundidadeDaFace = (aresta: ArestaDesenhada, tile: number): number => aresta.y * tile;
export const profundidadeDaLinhaH = (aresta: ArestaDesenhada, tile: number): number => aresta.y * tile + 4;
export const profundidadeDaLinhaV = (aresta: ArestaDesenhada, tile: number): number => (aresta.y + 1) * tile;
/** Móvel e enfeite pela aresta sul da pegada (`h` em tiles); `elevacao` de enfeite apoiado soma 1 sobre o móvel. */
export const profundidadeDoMovel = (y: number, h: number, tile: number): number => (y + h) * tile;
/** Empate: o personagem fica na frente (ADR-012 seção 6). */
export const EPSILON_DO_PERSONAGEM = 0.01;
export const profundidadeDoPersonagem = (yDoQuadro: number, alturaDoQuadro: number): number => yDoQuadro + alturaDoQuadro + EPSILON_DO_PERSONAGEM;

export function profundidadeDaAresta(a: ArestaDesenhada, tile: number): number {
  return a.tipo === 'face_norte' ? profundidadeDaFace(a, tile) : a.tipo === 'linha_h' ? profundidadeDaLinhaH(a, tile) : profundidadeDaLinhaV(a, tile);
}

/**
 * Extensão de um móvel acima da pegada (ADR-012 seção 5.1): E = max(0, H − h × tile), com H a altura do desenho acima da aresta
 * sul da pegada, sem a sombra. O PNG tem altura `max(h × tile, H) + sombra.dy`.
 */
export const extensaoDoMovel = (alturaDoPng: number, h: number, tile: number, v: VistaDoPerfil): number => Math.max(0, alturaDoPng - v.sombra.dy - h * tile);

/** Limite de E (ADR-012 seção 5.3): `faceNorte`; `extensaoEmPisoAndavel` (24 no HD) quando o tile ao norte da pegada é andável (o sobrinho e o Nick não somem). */
export const limiteDeExtensao = (norteAndavel: boolean, v: VistaDoPerfil): number => (norteAndavel ? Math.min(v.extensaoEmPisoAndavel, v.faceNorte) : v.faceNorte);
