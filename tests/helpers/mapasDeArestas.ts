import { BIT_DO_LADO } from '../../src/application/mundo/arestas';
import type { MapaDoJogo, ObjetoDoMapa } from '../../src/application/content/Mapa';

/**
 * Mapas de teste escritos à mão em "grade dupla" (a mesma ideia do golden `.txt` de ADR-011 seção 6), para o motor e a
 * validação não dependerem do conteúdo gerado pela Arte.
 *
 * `2·altura + 1` linhas por `2·largura + 1` colunas. Os tiles ficam nas posições ímpares (linha e coluna): `.` piso livre,
 * `#` piso bloqueado (`colisao` 1), espaço sem piso. As arestas ficam nas posições mistas: `-` (horizontal) e `|` (vertical)
 * são parede, `D` é aresta de porta (também é parede na máscara, que é completa) e espaço é aberta. Os vértices (par, par)
 * são ignorados. Fronteira com o vazio ou com fora da caixa vira parede sozinha (invariante 2 da seção 2.1), mesmo sem o
 * desenho.
 */
export function mapaDeTexto(id: string, grade: string[], objetos: ObjetoDoMapa[] = [], opcoes: { tile?: number; escuro?: boolean } = {}): MapaDoJogo {
  const linhas = grade.map((l) => l.padEnd(grade[0].length, ' '));
  const altura = (linhas.length - 1) / 2;
  const largura = (linhas[0].length - 1) / 2;
  if (!Number.isInteger(altura) || !Number.isInteger(largura)) throw new Error('grade dupla precisa de 2n+1 linhas e colunas');
  const chao: number[][] = [];
  const colisao: boolean[][] = [];
  const paredes: number[][] = [];
  const celula = (r: number, c: number): string => linhas[r]?.[c] ?? ' ';
  const temPiso = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < largura && y < altura && celula(2 * y + 1, 2 * x + 1) !== ' ';
  for (let y = 0; y < altura; y++) {
    chao.push([]);
    colisao.push([]);
    paredes.push([]);
    for (let x = 0; x < largura; x++) {
      const t = celula(2 * y + 1, 2 * x + 1);
      chao[y].push(t === ' ' ? 0 : 1);
      colisao[y].push(t === '#' || t === ' ');
      if (t === ' ') {
        paredes[y].push(0);
        continue;
      }
      const marca = (r: number, c: number) => ['-', '|', 'D'].includes(celula(r, c));
      let bits = 0;
      if (marca(2 * y, 2 * x + 1) || !temPiso(x, y - 1)) bits |= BIT_DO_LADO.cima;
      if (marca(2 * y + 2, 2 * x + 1) || !temPiso(x, y + 1)) bits |= BIT_DO_LADO.baixo;
      if (marca(2 * y + 1, 2 * x) || !temPiso(x - 1, y)) bits |= BIT_DO_LADO.esquerda;
      if (marca(2 * y + 1, 2 * x + 2) || !temPiso(x + 1, y)) bits |= BIT_DO_LADO.direita;
      paredes[y].push(bits);
    }
  }
  return { id, tileset: 'tiles_casa', tile: opcoes.tile ?? 32, largura, altura, escuro: opcoes.escuro ?? false, chao, colisao, paredes, objetos };
}

/** Atalho de objeto do mapa. */
export const objeto = (tipo: string, x: number, y: number, dados: ObjetoDoMapa['dados'] = {}): ObjetoDoMapa => ({ tipo, x, y, dados });

/** Porta em (x, y) para o `lado`, com a chegada de mesmo nome na área de destino. */
export const porta = (id: string, x: number, y: number, lado: 'cima' | 'baixo' | 'esquerda' | 'direita', destino: string, extra: ObjetoDoMapa['dados'] = {}): ObjetoDoMapa =>
  objeto('porta', x, y, { id, lado, destino, spawnDestino: id, ...extra });

/** Spawn de chegada (nome = id da porta) no tile da porta, olhando para dentro (direção = lado da porta do outro lado). */
export const chegada = (id: string, x: number, y: number, direcao: 'cima' | 'baixo' | 'esquerda' | 'direita'): ObjetoDoMapa => objeto('spawn', x, y, { nome: id, direcao });
