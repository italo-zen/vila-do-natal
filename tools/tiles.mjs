// Tiles do tileset `tiles_casa` (16×16, grade de 8 colunas). Ordem = índice; gid = índice + 1 (Tiled).
// Compartilhado por gerar-assets.mjs (desenha o PNG) e gerar-mapa.mjs (usa os gids).
export const TILES = [
  'madeira',
  'cozinha',
  'pedra',
  'parede',
  'fachada',
  'sofa',
  'mesa',
  'geladeira',
  'balcao',
  'elevador_esq',
  'elevador_dir',
  'vazio',
  'vazio',
  'vazio',
  'vazio',
  'vazio',
];

export const GID = Object.fromEntries(TILES.map((nome, i) => [nome, i + 1]));
export const COLUNAS_DO_TILESET = 8;
