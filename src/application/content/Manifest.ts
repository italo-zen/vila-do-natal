/** Uma subárea do manifesto (schema 3, ADR-002 seção 2 e ADR-011). */
export interface ManifestoMapa {
  id: string;
  file: string;
  tileset: string;
  /** Enfeites do modo explorar desta subárea, em `maps/decoracao/<subarea>.json` (ADR-010 8.1). Opcional. */
  decoracao?: string;
}
/**
 * Missão: `maps` são as subáreas abertas nela (ADR-004 seção 9). Só essas são carregadas. `final` marca a missão de fim
 * do jogo (ADR-006 seção 1.3): concluí-la leva aos créditos. Aditivo no schema 2 (ADR-002 seção 2).
 */
export interface ManifestoMissao {
  id: string;
  file: string;
  maps: string[];
  requires: string[];
  final?: boolean;
}
export interface ManifestoTexto {
  locale: string;
  file: string;
}
export interface Manifest {
  schemaVersion: number;
  contentVersion: string;
  locale: string;
  /** Perfil de arte da build (ADR-003). Opcional; padrão `gba-240x160`. */
  artProfile?: string;
  maps: ManifestoMapa[];
  missions: ManifestoMissao[];
  texts: ManifestoTexto[];
  /** Arquivo do sorteio de peças e do Nick (`content/sorteio.json`, ADR-013 seção 1). Obrigatório no schema 4. */
  sorteio: string;
}

/** Única schemaVersion do manifesto e das áreas que este motor lê (ADR-011 seção 4: 3 = planta por áreas, `paredes`, `porta.lado`; 4 = sorteio de peças e do Nick, ADR-013: `sorteio` no manifesto, sem `nick` nas missões). */
export const SCHEMA_VERSION_SUPORTADA = 4;
