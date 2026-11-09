import type Phaser from 'phaser';
import { centroDosPes } from '../../application/mundo/movimento';
import { FASES } from '../../domain/progresso/Fase';

/**
 * GANCHO DE QA (só no build de QA: `npm run build:qa`, flag __QA__). Nunca entra em build:playtest,
 * build normal ou release. Expõe window.__estado() e window.__teleportar(mapa, spawn) para o QA
 * provar colisão, vãos, fade e portas sem ler o estado do jogo a olho. Ver tools/build-qa.md.
 *
 * Notas para o QA (2026-11-09, rodada 2 do Marco 3):
 * - `__teleportar` não é um atalho de jogo: ele não conclui fases nem muda a missão. Use `__irParaFase` antes, para
 *   abrir o cômodo (ex.: `__irParaFase('parte2')` e depois `__teleportar('quarto', 'P2')`).
 * - `__teleportar` cancela um fade em andamento (o fim do fade antigo não carrega mais a subárea anterior).
 * - `travado` fica true depois de teleportar para a Sala escura: é o aviso "Está tudo escuro!", que a entrada real
 *   pela P8 também mostra (texto de primeira entrada, GDD 14.1). Um Z fecha esse diálogo; não é perda de tecla.
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
  sv: {
    sessao: {
      fase: string;
      progresso: { nick: { estado: string; tile: { mapa: string; x: number; y: number }; oculto: boolean; direcao: string; fila: { entradas: unknown[] } }; concluir(f: string): { ok: boolean; valor: { progresso: unknown } } };
      farejo: { ativo: boolean; restanteMs: number; porta: { id: string; saida: string; mapa: string } | undefined };
      definir(p: unknown): void;
    };
    devolverControle: { executar(): unknown };
  };
  dica: unknown;
  nickOcupado: boolean;
  sniffando: boolean;
  nick: { sprite: { anims: { currentAnim: { key: string } | null; isPlaying: boolean } | undefined } | undefined } | undefined;
  fade: { setAlpha(v: number): unknown };
  tweens: { killTweensOf(alvo: unknown): void };
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
      /** Nick (ADR-005): estado, tile local da subárea, se está oculto, direção e quantas entradas tem a fila. */
      nick: (() => {
        const n = c.sv.sessao.progresso.nick;
        return { estado: n.estado, mapa: n.tile.mapa, tileX: n.tile.x, tileY: n.tile.y, oculto: n.oculto, direcao: n.direcao, filaEntradas: n.fila.entradas.length };
      })(),
      /** Farejo (ADR-005 seção 4.5): seta visível, tempo restante e porta a seguir (id e saída). */
      farejo: (() => {
        const f = c.sv.sessao.farejo;
        return { ativo: f.ativo, restanteMs: f.restanteMs, porta: f.porta ? { id: f.porta.id, saida: f.porta.saida, mapa: f.porta.mapa } : null };
      })(),
      /** Animação ativa do sprite do Nick (ex.: nick-feliz) e se está tocando (BUG-M3-R5 e pedido de 2026-11-09). */
      // Tolerante: com a cena em troca (Conquista, reinício), o Phaser já destruiu o sprite do Nick e `anims` não existe.
      animacaoDoNick: c.nick?.sprite?.anims?.currentAnim?.key ?? null,
      animandoNick: c.nick?.sprite?.anims?.isPlaying ?? false,
      /** Farejar em curso (ocupado: B ignorado) e animação de farejar antes da seta (PT3, 2026-11-09). */
      ocupadoNick: c.nickOcupado,
      sniffando: c.sniffando,
      /** Dica aberta (H ou ícone): o mundo está parado. */
      dicaAberta: c.dica !== null,
    };
  };
  janela.__teleportar = (mapa: string, spawn: string) => {
    const c = casa();
    if (!c) return false;
    // Cancela um fade pendente: o fim dele carregaria a subárea de antes (corrida do QA, rodada 2).
    c.tweens.killTweensOf(c.fade);
    c.fade.setAlpha(0);
    c.transitando = false;
    c.estado = 'livre';
    c.carregarSubarea(mapa, spawn);
    return true;
  };
  /**
   * Leva a partida até a fase pedida, concluindo as fases antes dela pelas regras de domínio (Progresso.concluir), como
   * o jogo faria. Depois de cada luzes ou parte, o Nick vai dormir no tile da próxima fase (DevolverControle). Não toca
   * na posição do sobrinho: depois use __teleportar. Devolve a fase atual, ou null se a fase não existe ou não dá para
   * chegar a ela (já passou).
   */
  janela.__irParaFase = (fase: string) => {
    const c = casa();
    if (!c || !(FASES as readonly string[]).includes(fase)) return null;
    let limite = FASES.length;
    while (c.sv.sessao.fase !== fase && limite-- > 0) {
      const atual = c.sv.sessao.fase;
      const r = c.sv.sessao.progresso.concluir(atual);
      if (!r.ok) return null;
      c.sv.sessao.definir(r.valor.progresso);
      if (atual === 'luzes' || atual.startsWith('parte')) c.sv.devolverControle.executar();
    }
    return c.sv.sessao.fase === fase ? fase : null;
  };
}
