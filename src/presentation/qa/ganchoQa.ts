import type Phaser from 'phaser';
import { centroDosPes } from '../../application/mundo/movimento';

/**
 * GANCHO DE QA (só no build de QA: `npm run build:qa`, flag __QA__). Nunca entra em build:playtest,
 * build normal ou release. Expõe window.__estado() e window.__teleportar(mapa, spawn) para o QA
 * provar colisão, vãos, fade e portas sem ler o estado do jogo a olho. Ver tools/build-qa.md.
 */

/** Campos internos da CasaScene que o gancho lê (sem alterar a cena). */
interface CasaPorDentro {
  mapa: { id: string } | undefined;
  desl: { x: number; y: number };
  pos: { x: number; y: number };
  dir: string;
  transitando: boolean;
  estado: string;
  geo: { tile: number; quadro: { w: number; h: number }; pes: { dx: number; dy: number; w: number; h: number } };
  sv: { sessao: { fase: string } };
  carregarSubarea(id: string, spawn?: string): void;
}

export function instalarGancho(jogo: Phaser.Game): void {
  const casa = (): CasaPorDentro | null => {
    const cena = jogo.scene.getScene('Casa') as unknown as CasaPorDentro | undefined;
    return cena && cena.mapa ? cena : null;
  };
  const janela = window as unknown as Record<string, unknown>;
  janela.__estado = () => {
    const c = casa();
    if (!c) return null;
    const centro = centroDosPes(c.pos, c.geo);
    const t = c.geo.tile;
    return {
      mapa: c.mapa!.id,
      tileX: Math.floor(centro.x / t) - c.desl.x,
      tileY: Math.floor(centro.y / t) - c.desl.y,
      /** Centro dos pés em px, relativo à caixa da subárea (0,0 = canto da caixa). */
      centroX: centro.x - c.desl.x * t,
      centroY: centro.y - c.desl.y * t,
      direcao: c.dir,
      emFade: c.transitando,
      travado: c.estado !== 'livre' || c.transitando,
      /** Verdadeiro durante a condução automática (GDD 14.11). */
      emConducao: c.estado === 'conducao',
      fase: c.sv.sessao.fase,
    };
  };
  janela.__teleportar = (mapa: string, spawn: string) => {
    const c = casa();
    if (!c) return false;
    c.transitando = false;
    c.estado = 'livre';
    c.carregarSubarea(mapa, spawn);
    return true;
  };
}
