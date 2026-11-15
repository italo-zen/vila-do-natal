import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { caixaYDoDialogo } from '../../src/presentation/ui/posicaoDoDialogo';
import { deslocamentoDaSubarea } from '../../src/application/mundo/subarea';
import type { MapaDoJogo } from '../../src/application/content/Mapa';
import type { PerfilDeArte } from '../../src/application/arte/PerfilDeArte';

/**
 * BUG-R15-01 (qa/bugs.md): o diálogo automático da chegada cobria a árvore, e o halo sumia enquanto fala.
 * Opção b do Diretor: só esse diálogo sobe para o topo. Regra de posição, com o perfil HD e a Sala reais.
 */
const RAIZ = join(__dirname, '..', '..', 'content');
const perfil: PerfilDeArte = JSON.parse(readFileSync(join(RAIZ, 'art-profiles', 'hd-480x352.json'), 'utf-8'));
const sala: MapaDoJogo = JSON.parse(readFileSync(join(RAIZ, 'maps', 'casa-real', 'sala.json'), 'utf-8'));

const ALTURA_TELA = perfil.sala.linhas * perfil.tile;
const ALTURA_CAIXA = perfil.dialogo.altura;
/** Faixa vertical (px) ocupada por um tile da tela. */
const faixa = (tileY: number) => ({ inicio: tileY * perfil.tile, fim: (tileY + 1) * perfil.tile });
const sobrepoe = (a: { inicio: number; fim: number }, b: { inicio: number; fim: number }) => a.inicio < b.fim && b.inicio < a.fim;

describe('posição da caixa de diálogo (BUG-R15-01, opção b)', () => {
  it('base: a caixa fica embaixo, acima da barra; topo: encostada na borda de cima', () => {
    expect(caixaYDoDialogo(ALTURA_TELA, ALTURA_CAIXA, 'base')).toBe(ALTURA_TELA - ALTURA_CAIXA);
    expect(caixaYDoDialogo(ALTURA_TELA, ALTURA_CAIXA, 'topo')).toBe(0);
  });

  it('na chegada, a caixa de baixo cobre a árvore (era o bug) e a do topo não cobre árvore, sobrinho nem halo', () => {
    const d = deslocamentoDaSubarea(sala, perfil.sala);
    const arvore = sala.objetos.find((o) => o.tipo === 'arvore')!;
    // Tile do destino da condução: 1 acima da árvore (GDD 14.11.1). Sobrinho em (3, 7) da Sala.
    const linhaDaArvore = faixa(arvore.y + d.y);
    const linhaDoSobrinho = faixa(arvore.y - 1 + d.y);
    // Halo: o tile da árvore com 4 px de margem em volta (perfil.objetos.halo.margem).
    const m = perfil.objetos.halo.margem;
    const halo = { inicio: linhaDaArvore.inicio - m, fim: linhaDaArvore.fim + m };

    const caixaDeBaixo = { inicio: caixaYDoDialogo(ALTURA_TELA, ALTURA_CAIXA, 'base'), fim: ALTURA_TELA };
    const caixaDeCima = { inicio: caixaYDoDialogo(ALTURA_TELA, ALTURA_CAIXA, 'topo'), fim: ALTURA_CAIXA };

    expect(sobrepoe(caixaDeBaixo, linhaDaArvore)).toBe(true);
    expect(sobrepoe(caixaDeCima, linhaDaArvore)).toBe(false);
    expect(sobrepoe(caixaDeCima, linhaDoSobrinho)).toBe(false);
    expect(sobrepoe(caixaDeCima, halo)).toBe(false);
  });
});
