import type { SpritesDoPerfil } from './SpritesDoPerfil';
import type { VistaDaArte } from './VistaDaArte';

/** Arte da build já validada: sprites.json do perfil e URL de cada PNG (ADR-003 seção 3). */
export interface ArteDoPerfil {
  sprites: SpritesDoPerfil;
  /** Nome do PNG (ex.: "spr_lolo_idle.png") para a URL embutida pelo Vite. */
  urls: Record<string, string>;
  /** Dados de arte da visão 3/4 (`vista.json`): hoje só o vidro da Sala. Ausente = sem vidro. */
  vista?: VistaDaArte;
}
