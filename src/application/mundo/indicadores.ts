import type { MapaDoJogo, ObjetoDoMapa } from '../content/Mapa';
import { deslocamentoDaSubarea, ladoDaPorta, vaoDaPorta, type LadoDaPorta } from './subarea';

/**
 * Indicadores de porta (GDD 14.10.10, item 046). Só desenho: não cria objeto, gatilho nem colisão.
 *
 * A direção de saída é o campo `saida` do conteúdo (`porta.saida` e `portaFechada.saida`, ADR-004 seção 13.18), gerado
 * pelo conversor. Não se deriva mais da chegada, porque o par com chegada declarada pode ter chegada de lado.
 * Saída para a direita ou esquerda: seta sobre o gatilho. Saída para baixo (só `porta`): tapete no vão, fora do piso.
 * Saída para cima: nada.
 *
 * Coordenadas em tiles locais da subárea (como o conteúdo). A posição na tela é a local mais o deslocamento.
 */

export type TipoDeIndicador = 'seta-direita' | 'seta-esquerda' | 'tapete';

export interface IndicadorDePorta {
  tipo: TipoDeIndicador;
  /** Tile local da subárea (o desenho sai na tela somando o deslocamento). */
  x: number;
  y: number;
  /** Porta (id) a que o indicador pertence, para testes e diagnóstico. */
  porta: string;
}

export type { LadoDaPorta };

/** Porta de parede vertical (saída lateral, para a direita ou a esquerda): sprite `spr_porta_vertical` (ADR-004 seção 6; GDD 14.10.9). */
export function portaEhVertical(objeto: ObjetoDoMapa): boolean {
  const lado = ladoDaPorta(objeto);
  return lado === 'esquerda' || lado === 'direita';
}

/** Tiles de objeto que não recebem indicador por cima (GDD 14.10.10, C24). */
const TIPOS_SEM_INDICADOR = new Set(['bilhete', 'arvore', 'interruptor']);

/** Indicadores de porta da subárea, na tela de `tela` (perfil.sala). Pura. */
export function indicadoresDaSubarea(mapa: MapaDoJogo, tela: { colunas: number; linhas: number }): IndicadorDePorta[] {
  const desl = deslocamentoDaSubarea(mapa, tela);
  const saida: IndicadorDePorta[] = [];
  for (const objeto of mapa.objetos) {
    if (objeto.tipo !== 'porta' && objeto.tipo !== 'portaFechada') continue;
    const id = String(objeto.dados.id);
    const lado = ladoDaPorta(objeto);
    if (!lado) continue;
    let tipo: TipoDeIndicador | null = null;
    let local: { x: number; y: number } = objeto;
    if (lado === 'esquerda') tipo = 'seta-esquerda';
    else if (lado === 'direita') tipo = 'seta-direita';
    else if (lado === 'baixo' && objeto.tipo === 'porta') {
      // Tapete no vão, fora do piso (GDD 14.10.10): não ocupa o gatilho nem o chão de dentro.
      tipo = 'tapete';
      local = vaoDaPorta(objeto, lado);
    }
    if (!tipo) continue;
    // Fora da caixa da tela, ou na última linha (a barra): não desenha (cobertura por teste).
    const xDaTela = local.x + desl.x;
    const yDaTela = local.y + desl.y;
    if (xDaTela < 0 || yDaTela < 0 || xDaTela >= tela.colunas || yDaTela >= tela.linhas - 1) continue;
    // C24: nada sobre bilhete, árvore ou interruptor.
    if (mapa.objetos.some((o) => TIPOS_SEM_INDICADOR.has(o.tipo) && o.x === local.x && o.y === local.y)) continue;
    saida.push({ tipo, x: local.x, y: local.y, porta: id });
  }
  return saida;
}
