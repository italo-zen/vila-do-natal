import type { PersonagemId } from '../../domain/personagem/PersonagemId';
import type { Direcao } from '../../application/mundo/movimento';
import type { ArteDoPerfil } from '../../application/arte/ArteDoPerfil';
import type { TipoDeImagem } from '../../application/arte/SpritesDoPerfil';
import type { Dimensao } from '../../application/arte/PerfilDeArte';

export interface ImagemParaCarregar {
  chave: string;
  url: string;
  tipo: TipoDeImagem;
  /** Quadro, em tileset e folhas (vem do sprites.json). */
  quadro?: Dimensao;
}

/**
 * Imagens da build, na ordem do sprites.json do perfil ativo. O tipo e o quadro vêm do arquivo do perfil,
 * não do nome do PNG (ADR-003 seção 4).
 */
export function imagensParaCarregar(arte: ArteDoPerfil): ImagemParaCarregar[] {
  return arte.sprites.imagens.map((img) => ({
    chave: img.arquivo.replace(/\.png$/, ''),
    url: arte.urls[img.arquivo],
    tipo: img.tipo,
    quadro: img.quadro,
  }));
}

/** Sufixo de arquivo de cada direção (style-guide: walk_down, walk_up...). */
export const SUFIXO_DA_DIRECAO: Record<Direcao, string> = {
  baixo: 'down',
  cima: 'up',
  esquerda: 'left',
  direita: 'right',
};

export const CHAVE_DO_TILESET = 'tiles_casa';
/** Estados da árvore (GDD 15.4): índice = número de peças encaixadas (0 a 3). */
export const CHAVE_DA_ARVORE: readonly string[] = [
  'spr_arvore_desmontada',
  'spr_arvore_1parte',
  'spr_arvore_2partes',
  'spr_arvore_completa',
];
/** Miniatura de cada peça no chão e no encaixe (ordem 1 a 3). */
export const CHAVE_DA_PECA: Readonly<Record<number, string>> = { 1: 'spr_peca_1', 2: 'spr_peca_2', 3: 'spr_peca_3' };
/** Ilustração da tela de conquista de cada peça (96×96, GDD 15.5). */
export const CHAVE_DA_CONQUISTA_DA_PECA: Readonly<Record<number, string>> = {
  1: 'spr_conquista_parte1',
  2: 'spr_conquista_parte2',
  3: 'spr_conquista_parte3',
};
export const CHAVE = {
  arvore: 'spr_arvore_desmontada',
  bilhete: 'spr_bilhete',
  interruptor: 'spr_interruptor',
  porta: 'spr_porta',
  portaVertical: 'spr_porta_vertical',
  lampada: 'spr_lampada',
  indicadorSetaDireita: 'spr_indicador_seta_direita',
  indicadorSetaEsquerda: 'spr_indicador_seta_esquerda',
  indicadorTapete: 'spr_indicador_tapete',
} as const;

/** Chaves de sprite e de animação de um sobrinho. Um único código para os 4 (GDD 4.8). */
export const sprites = {
  parado: (id: PersonagemId) => `spr_${id}_idle`,
  interagir: (id: PersonagemId) => `spr_${id}_interact`,
  comemorar: (id: PersonagemId) => `spr_${id}_celebrate`,
  andar: (id: PersonagemId, dir: Direcao) => `spr_${id}_walk_${SUFIXO_DA_DIRECAO[dir]}`,
  animacaoDeAndar: (id: PersonagemId, dir: Direcao) => `${id}-andar-${SUFIXO_DA_DIRECAO[dir]}`,
};
