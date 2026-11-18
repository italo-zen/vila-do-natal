import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { lerConteudoDoDisco } from '../helpers/conteudoReal';
import { descreverComConteudoNovo } from '../helpers/conteudoNovo';
import { CarregarConteudo } from '../../src/application/usecases/CarregarConteudo';
import { ContentSourceDeArquivos } from '../../src/infrastructure/content/ContentSourceDeArquivos';
import { caixaCabeNaAreaDeJogo, deslocamentoDaSubarea, objetosNaTela, posicaoDoSpritePelaBase } from '../../src/application/mundo/subarea';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const ASSETS = join(RAIZ, 'assets', 'hd-480x352');

/** Tamanho em px de um PNG, lido do cabeçalho IHDR (largura e altura, 4 bytes cada, big-endian). */
function tamanhoDoPng(arquivo: string): { w: number; h: number } {
  const b = readFileSync(join(ASSETS, arquivo));
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

const lerConteudo = lerConteudoDoDisco;

descreverComConteudoNovo('sprite de objeto ancorado na base do tile (árvore alta, ADR-004 seção 6)', () => {
  it('a árvore é ancorada pela base: o tamanho vem do PNG do disco e a base do sprite cai na base do tile', () => {
    const { w, h } = tamanhoDoPng('spr_arvore_desmontada.png');
    expect(w).toBeGreaterThan(0);
    expect(h).toBeGreaterThan(0);
    const p = posicaoDoSpritePelaBase({ x: 5, y: 8 }, 32, h);
    expect(p).toEqual({ x: 160, y: 9 * 32 - h });
    // A base do sprite (y + h) cai na base do tile (linha 8, bottom = 9 × 32 = 288).
    expect(p.y + h).toBe(9 * 32);
  });

  it('a árvore real da Sala (tile local (2, 8), tela (4, 8)) cabe na área de jogo 15×11, acima da barra', async () => {
    const { w, h } = tamanhoDoPng('spr_arvore_desmontada.png');
    const c = await new CarregarConteudo(new ContentSourceDeArquivos(lerConteudo())).executar();
    const sala = c.todosOsMapas.get('sala')!;
    const arvore = objetosNaTela(sala, deslocamentoDaSubarea(sala, c.perfil.sala)).find((o) => o.tipo === 'arvore')!;
    expect({ x: arvore.x, y: arvore.y }).toEqual({ x: 4, y: 8 });
    const p = posicaoDoSpritePelaBase(arvore, c.perfil.tile, h);
    const caixa = { x: p.x, y: p.y, w, h };
    expect(caixaCabeNaAreaDeJogo(caixa, c.perfil.sala, c.perfil.tile)).toBe(true);
    // Abaixo da barra (linha 10) nada do sprite entra.
    expect(p.y + h).toBeLessThanOrEqual(10 * c.perfil.tile);
  });

  it('toda árvore de toda subárea cabe na área de jogo com a ancoragem pela base', async () => {
    const { w, h } = tamanhoDoPng('spr_arvore_desmontada.png');
    const c = await new CarregarConteudo(new ContentSourceDeArquivos(lerConteudo())).executar();
    const achadas: string[] = [];
    for (const mapa of c.todosOsMapas.values()) {
      for (const o of objetosNaTela(mapa, deslocamentoDaSubarea(mapa, c.perfil.sala))) {
        if (o.tipo !== 'arvore') continue;
        achadas.push(mapa.id);
        const p = posicaoDoSpritePelaBase(o, c.perfil.tile, h);
        expect(caixaCabeNaAreaDeJogo({ x: p.x, y: p.y, w, h }, c.perfil.sala, c.perfil.tile), `árvore em ${mapa.id}`).toBe(true);
      }
    }
    expect(achadas).toEqual(['sala']);
  });

  it('regressão: sprite alto (fixture sintética 64×96) ancorado pelo topo no tile (5, 8) sai da área e cai sob a barra', () => {
    // Fixture sintética, não o PNG do disco: a regra de ancoragem não pode depender do tamanho atual da arte.
    const FIXTURE = { w: 64, h: 96 };
    const topo = { x: 5 * 32, y: 8 * 32 };
    expect(caixaCabeNaAreaDeJogo({ x: topo.x, y: topo.y, w: FIXTURE.w, h: FIXTURE.h }, { colunas: 15, linhas: 11 }, 32)).toBe(false);
    // A mesma fixture ancorada pela base cabe.
    const p = posicaoDoSpritePelaBase({ x: 5, y: 8 }, 32, FIXTURE.h);
    expect(caixaCabeNaAreaDeJogo({ x: p.x, y: p.y, w: FIXTURE.w, h: FIXTURE.h }, { colunas: 15, linhas: 11 }, 32)).toBe(true);
  });

  it('caixa fora da tela ou dentro da linha da barra não cabe', () => {
    const tela = { colunas: 15, linhas: 11 };
    expect(caixaCabeNaAreaDeJogo({ x: -1, y: 0, w: 32, h: 32 }, tela, 32)).toBe(false);
    expect(caixaCabeNaAreaDeJogo({ x: 0, y: 0, w: 15 * 32 + 1, h: 32 }, tela, 32)).toBe(false);
    expect(caixaCabeNaAreaDeJogo({ x: 0, y: 290, w: 32, h: 32 }, tela, 32)).toBe(false);
    expect(caixaCabeNaAreaDeJogo({ x: 0, y: 288, w: 32, h: 32 }, tela, 32)).toBe(true);
  });

  it('a porta fechada da 1.1.0 (fallback) é 32×32; o bilhete é uma imagem 16×24 presa na parede, com âncora (8, 23)', () => {
    expect(tamanhoDoPng('spr_porta.png')).toEqual({ w: 32, h: 32 });
    expect(tamanhoDoPng('spr_bilhete.png')).toEqual({ w: 16, h: 24 });
    const sprites = JSON.parse(readFileSync(join(ASSETS, 'sprites.json'), 'utf-8')) as { imagens: { arquivo: string; ancora?: { x: number; y: number } }[] };
    expect(sprites.imagens.find((i) => i.arquivo === 'spr_bilhete.png')?.ancora).toEqual({ x: 8, y: 23 });
  });

  it('o interruptor é uma folha de 2 quadros 16×24 (0 apagado, 1 aceso) com âncora (8, 23), posto sobre a face norte do tile', () => {
    const { w, h } = tamanhoDoPng('spr_interruptor.png');
    expect([w, h]).toEqual([32, 24]);
    const sprites = JSON.parse(readFileSync(join(ASSETS, 'sprites.json'), 'utf-8')) as { imagens: { arquivo: string; tipo: string; quadro?: { w: number; h: number }; quadros?: number; ancora?: { x: number; y: number } }[] };
    const img = sprites.imagens.find((i) => i.arquivo === 'spr_interruptor.png')!;
    expect(img).toMatchObject({ tipo: 'folhas', quadro: { w: 16, h: 24 }, quadros: 2, ancora: { x: 8, y: 23 } });
    // Posição pela âncora: x = tile × 32 + 16 − 8; y = tile × 32 − 23 (Sala (6, 4) com deslocamento 2 em x).
    const tx = 6 + 2;
    const ty = 4;
    expect({ x: tx * 32 + 16 - img.ancora!.x, y: ty * 32 - img.ancora!.y }).toEqual({ x: 8 * 32 + 8, y: 128 - 23 });
  });

  it('a árvore e a decoração da árvore têm movel com âncora (0, 56) e posicionam como os móveis', () => {
    const sprites = JSON.parse(readFileSync(join(ASSETS, 'sprites.json'), 'utf-8')) as { imagens: { arquivo: string; movel?: { pegada: { w: number; h: number }; ancora: { x: number; y: number } } }[] };
    for (const [arquivo, ancoraY] of [['spr_arvore_desmontada.png', 56], ['spr_arvore_enfeitada.png', 56], ['dec_arvore_g.png', 56], ['dec_arvore_p.png', 40]] as const) {
      const m = sprites.imagens.find((i) => i.arquivo === arquivo)?.movel;
      expect(m, arquivo).toBeDefined();
      expect(m!.ancora).toEqual({ x: 0, y: ancoraY });
      expect(m!.pegada).toEqual({ w: 1, h: 1 });
    }
    expect(tamanhoDoPng('spr_arvore_desmontada.png')).toEqual({ w: 38, h: 62 });
  });
});
