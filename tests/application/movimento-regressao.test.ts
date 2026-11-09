import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { mover, geometriaDoSobrinho, posicaoDoTile, centroDosPes, ColisaoDoMapa, type Direcao } from '../../src/application/mundo/movimento';
import { bloqueiosDaSubarea, deslocamentoDaSubarea } from '../../src/application/mundo/subarea';
import { interpretarSubarea } from '../../src/application/content/interpretarSubarea';

/**
 * Regressão do BUG-M12-03 (qa/bugs.md, seção do Dev): o personagem não pode ficar preso num tile livre.
 * Para cada tile livre da casa real, cada direção cujo vizinho é livre, e cada chegada com o centro dos pés
 * dentro do tile (caixa inteira nele), o movimento tem de sair do lugar com passos de frame de vários tamanhos.
 */
const RAIZ = join(__dirname, '..', '..');
const perfil = JSON.parse(readFileSync(join(RAIZ, 'content', 'art-profiles', 'hd-480x352.json'), 'utf-8'));
const g = geometriaDoSobrinho(perfil);
const DELTA: Record<Direcao, [number, number]> = { esquerda: [-1, 0], direita: [1, 0], cima: [0, -1], baixo: [0, 1] };

describe('regressão BUG-M12-03: nenhum tile livre prende o personagem', () => {
  for (const id of ['hall', 'sala', 'cozinha']) {
    it(`${id}: sai de todo tile livre em direção a vizinho livre, de qualquer chegada dentro do tile`, () => {
      const mapa = interpretarSubarea(JSON.parse(readFileSync(join(RAIZ, 'content', 'maps', 'casa-real', `${id}.json`), 'utf-8')), { id, file: '', tileset: 'tiles_casa' });
      const d = deslocamentoDaSubarea(mapa, perfil.sala);
      const col = new ColisaoDoMapa(bloqueiosDaSubarea(mapa, () => true));
      const bloq = (tx: number, ty: number) => col.bloqueado(tx - d.x, ty - d.y);
      const presos: string[] = [];
      for (let y = 0; y < mapa.altura; y++) {
        for (let x = 0; x < mapa.largura; x++) {
          if (mapa.chao[y][x] === 0 || mapa.colisao[y][x]) continue;
          for (const dir of Object.keys(DELTA) as Direcao[]) {
            const [dx, dy] = DELTA[dir];
            if (bloq(x + dx + d.x, y + dy + d.y)) continue; // vizinho bloqueado: não se espera sair
            // Chegadas com a caixa dos pés (24x16) inteira dentro do tile: centro x em [12,20], y em [8,24].
            // Inclui frações de milésimo além das bordas da caixa (12,002 e 20,002 em x; 8,002 e 24,002 em y):
            // é assim que o centro dos pés pode parar, por ponto flutuante, encostando no tile de baixo ou de cima.
            for (const fx of [12, 12.002, 16, 20, 20.002]) {
              for (const fy of [8, 8.002, 16, 24, 24.002]) {
                const base = posicaoDoTile(x + d.x, y + d.y, g);
                const p = { x: base.x + (fx - 16), y: base.y + (fy - 24) };
                const ini = centroDosPes(p, g);
                for (const dist of [2.048, 2.13, 3.1, 4.2]) {
                  let q = p;
                  let saiu = false;
                  for (let i = 0; i < 12 && !saiu; i++) {
                    q = mover(q, dir, dist, bloq, g);
                    const c = centroDosPes(q, g);
                    if (Math.abs(c.x - ini.x) + Math.abs(c.y - ini.y) > 4) saiu = true;
                  }
                  if (!saiu) presos.push(`${id} tile(${x},${y}) ${dir} centro ${ini.x.toFixed(2)},${ini.y.toFixed(2)} dist ${dist}`);
                }
              }
            }
          }
        }
      }
      expect(presos.slice(0, 5)).toEqual([]);
    });
  }
});
