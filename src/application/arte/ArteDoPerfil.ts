import type { SpritesDoPerfil } from './SpritesDoPerfil';

/** Arte da build já validada: sprites.json do perfil e URL de cada PNG (ADR-003 seção 3). */
export interface ArteDoPerfil {
  sprites: SpritesDoPerfil;
  /** Nome do PNG (ex.: "spr_lolo_idle.png") para a URL embutida pelo Vite. */
  urls: Record<string, string>;
}
