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
/**
 * Estados da árvore (GDD 15.4 e 17.5): índice = número de peças encaixadas (0 a 3); 4 é a árvore com a caixa de enfeite
 * encaixada (ADR-006 seção 3.2).
 */
export const CHAVE_DA_ARVORE: readonly string[] = [
  'spr_arvore_desmontada',
  'spr_arvore_1parte',
  'spr_arvore_2partes',
  'spr_arvore_completa',
  'spr_arvore_enfeitada',
];
/** Caixa de enfeite (GDD 17.3 e 17.4): caixa fechada e aberta (folha de 2 quadros), e o enfeite que sobe à árvore. */
export const CHAVE_DO_ENFEITE = { caixa: 'spr_enfeite_caixa', flutuante: 'spr_enfeite_flutuante' } as const;
/** Ilustração da conquista da caixa de enfeite (96×96, GDD 17.4 item 1). */
export const CHAVE_DA_CONQUISTA_DO_ENFEITE = 'spr_conquista_enfeites';
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

/** Chaves do Nick, dos balões, da fumaça, da seta de farejar e do ícone de dica (ADR-005 seção 7.1). Nomes dos PNG. */
export const CHAVE_NICK = {
  dormir: 'spr_nick_sleep',
  acordar: 'spr_nick_wake',
  farejar: 'spr_nick_sniff',
  feliz: 'spr_nick_happy',
  andar: (dir: Direcao): string => `spr_nick_walk_${SUFIXO_DA_DIRECAO[dir]}`,
  parado: (dir: Direcao): string => `spr_nick_idle_${SUFIXO_DA_DIRECAO[dir]}`,
} as const;

/** Animações do Nick (criadas no BootScene a partir dos quadros do sprites.json). */
export const ANIM_NICK = {
  dormir: 'nick-dormir',
  acordar: 'nick-acordar',
  farejar: 'nick-farejar',
  feliz: 'nick-feliz',
  andar: (dir: Direcao): string => `nick-andar-${SUFIXO_DA_DIRECAO[dir]}`,
} as const;

export const CHAVE_BALAO = { au: 'spr_balao_au', zzz: 'spr_balao_zzz' } as const;
export const CHAVE_FUMACA = 'spr_fumaca_dormir';
export const ANIM_FUMACA = 'fumaca-dormir';
/** Seta dourada de farejar, na direção de saída da porta (direita, esquerda, cima). */
export const CHAVE_SETA_FAREJAR = (dir: Direcao): string => `spr_seta_farejar_${dir}`;
export const CHAVE_ICONE_DICA = 'spr_icone_dica';
