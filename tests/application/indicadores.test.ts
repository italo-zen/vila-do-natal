import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CarregarConteudo } from '../../src/application/usecases/CarregarConteudo';
import { ContentSourceDeArquivos } from '../../src/infrastructure/content/ContentSourceDeArquivos';
import { indicadoresDaSubarea, portaEhVertical } from '../../src/application/mundo/indicadores';
import { deslocamentoDaSubarea, ladoDaPorta } from '../../src/application/mundo/subarea';
import type { MapaDoJogo } from '../../src/application/content/Mapa';

/**
 * Indicadores de porta (GDD 14.10.10, C20 a C24; item 046). A saída vem do campo `saida` do conteúdo
 * (`porta.saida` e `portaFechada.saida`, ADR-004 seção 13.18). Não se deriva da chegada.
 */

const CONTENT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content');
function lerConteudo(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const varrer = (dir: string) => {
    for (const nome of readdirSync(dir)) {
      const cam = join(dir, nome);
      if (statSync(cam).isDirectory()) varrer(cam);
      else if (nome.endsWith('.json')) out[relative(CONTENT, cam).split('\\').join('/')] = JSON.parse(readFileSync(cam, 'utf-8'));
    }
  };
  varrer(CONTENT);
  return out;
}
const carregar = () => new CarregarConteudo(new ContentSourceDeArquivos(lerConteudo())).executar();
/** Tela do perfil HD (perfil.sala = 15×11). */
const TELA = { colunas: 15, linhas: 11 };

/** Subárea mínima de teste, com piso e colisão livres, e os objetos dados. */
function subarea(largura: number, altura: number, objetos: MapaDoJogo['objetos']): MapaDoJogo {
  return {
    id: 'teste',
    tileset: 'tiles_casa',
    tile: 32,
    largura,
    altura,
    escuro: false,
    chao: Array.from({ length: altura }, () => Array(largura).fill(1)),
    colisao: Array.from({ length: altura }, () => Array(largura).fill(false)),
    objetos,
  };
}

describe('indicadores de porta no conteúdo real (GDD 14.10.10; C20, C21, C22)', () => {
  it('Sala (Marco 2): seta à esquerda sobre P1 (6, 2), seta à direita sobre P2 (7, 1) e P3 (8, 2) e P7 (10, 5), tapete no vão da P8 (6, 8)', async () => {
    const c = await carregar();
    const indicadores = indicadoresDaSubarea(c.todosOsMapas.get('sala')!, TELA);
    expect(indicadores).toHaveLength(5);
    expect(indicadores).toEqual(
      expect.arrayContaining([
        { tipo: 'seta-esquerda', x: 6, y: 2, porta: 'P1' },
        { tipo: 'seta-direita', x: 7, y: 1, porta: 'P2' },
        { tipo: 'seta-direita', x: 8, y: 2, porta: 'P3' },
        { tipo: 'seta-direita', x: 10, y: 5, porta: 'P7' },
        { tipo: 'tapete', x: 6, y: 8, porta: 'P8' },
      ]),
    );
  });

  it('Quarto: seta à esquerda sobre o gatilho da P2 (0, 7), e nada mais (a P4 sai para cima)', async () => {
    const c = await carregar();
    expect(indicadoresDaSubarea(c.todosOsMapas.get('quarto')!, TELA)).toEqual([{ tipo: 'seta-esquerda', x: 0, y: 7, porta: 'P2' }]);
  });

  it('Escritório: seta à esquerda sobre o gatilho da P3 (0, 5) e seta à direita sobre a P6 fechada (6, 4)', async () => {
    const c = await carregar();
    const indicadores = indicadoresDaSubarea(c.todosOsMapas.get('escritorio')!, TELA);
    expect(indicadores).toEqual(
      expect.arrayContaining([
        { tipo: 'seta-esquerda', x: 0, y: 5, porta: 'P3' },
        { tipo: 'seta-direita', x: 6, y: 4, porta: 'P6' },
      ]),
    );
  });

  it('a P2 é vertical (saída lateral) na Sala e no Quarto; P4 (saída para cima) não é vertical', async () => {
    const c = await carregar();
    const obj = (mapa: string, id: string) => c.todosOsMapas.get(mapa)!.objetos.find((o) => String(o.dados.id) === id)!;
    expect(portaEhVertical(obj('sala', 'P1'))).toBe(true);
    expect(portaEhVertical(obj('escritorio', 'P6'))).toBe(true);
    expect(portaEhVertical(obj('sala', 'P2'))).toBe(true);
    expect(portaEhVertical(obj('quarto', 'P2'))).toBe(true);
    expect(portaEhVertical(obj('quarto', 'P4'))).toBe(false);
    expect(portaEhVertical(obj('hall', 'P8'))).toBe(false);
    expect(ladoDaPorta(obj('sala', 'P1'))).toBe('esquerda');
    expect(ladoDaPorta(obj('escritorio', 'P6'))).toBe('direita');
    expect(ladoDaPorta(obj('sala', 'P2'))).toBe('direita');
    expect(ladoDaPorta(obj('quarto', 'P2'))).toBe('esquerda');
    expect(ladoDaPorta(obj('quarto', 'P4'))).toBe('cima');
  });

  it('Cozinha: seta para a esquerda sobre a P7 (0, 0), e nada mais', async () => {
    const c = await carregar();
    expect(indicadoresDaSubarea(c.todosOsMapas.get('cozinha')!, TELA)).toEqual([{ tipo: 'seta-esquerda', x: 0, y: 0, porta: 'P7' }]);
  });

  it('Hall: a P8 sai para cima, então nenhum indicador (C22)', async () => {
    const c = await carregar();
    expect(indicadoresDaSubarea(c.todosOsMapas.get('hall')!, TELA)).toEqual([]);
  });

  it('na tela, a Sala desloca os indicadores em (2, 0): seta da P7 em (12, 5) e tapete em (8, 8); Cozinha em (4, 2)', async () => {
    const c = await carregar();
    const sala = c.todosOsMapas.get('sala')!;
    const cozinha = c.todosOsMapas.get('cozinha')!;
    const ds = deslocamentoDaSubarea(sala, TELA);
    const dc = deslocamentoDaSubarea(cozinha, TELA);
    expect(ds).toEqual({ x: 2, y: 0 });
    expect(dc).toEqual({ x: 4, y: 2 });
    const seta = indicadoresDaSubarea(sala, TELA).find((i) => i.porta === 'P7')!;
    const tapete = indicadoresDaSubarea(sala, TELA).find((i) => i.tipo === 'tapete')!;
    expect({ x: seta.x + ds.x, y: seta.y + ds.y }).toEqual({ x: 12, y: 5 });
    expect({ x: tapete.x + ds.x, y: tapete.y + ds.y }).toEqual({ x: 8, y: 8 });
  });

  it('o tapete da P8 fica no vão, fora do piso: (6, 8) não tem chão e não é o chão de dentro (6, 6)', async () => {
    const c = await carregar();
    const sala = c.todosOsMapas.get('sala')!;
    expect(sala.chao[8][6]).toBe(0);
    expect(sala.chao[6][6]).not.toBe(0);
  });
});

describe('indicadores: regra (saída = campo saida, só porta e portaFechada)', () => {
  it('saída para cima não tem indicador (P2 do Quarto na sua forma antiga e P8 do Hall)', () => {
    const m = subarea(3, 3, [
      { tipo: 'porta', x: 1, y: 0, dados: { id: 'Z', destino: 'x', spawnDestino: 'Z', saida: 'cima' } },
      { tipo: 'spawn', x: 1, y: 1, dados: { nome: 'Z', direcao: 'baixo' } },
    ]);
    expect(indicadoresDaSubarea(m, TELA)).toEqual([]);
  });

  it('porta sem saida válida não recebe indicador (a validação acusa, não o desenho)', () => {
    const m = subarea(3, 3, [{ tipo: 'porta', x: 2, y: 1, dados: { id: 'Q', destino: 'x', spawnDestino: 'Q' } }]);
    expect(indicadoresDaSubarea(m, TELA)).toEqual([]);
  });

  it('a seta sai do campo saida, não da chegada: chegada de lado (perpendicular) não muda a seta', () => {
    // Gatilho (1, 1), saída para a direita; chegada declarada para dentro, em (1, 2), de lado.
    const m = subarea(3, 3, [
      { tipo: 'porta', x: 1, y: 1, dados: { id: 'L', destino: 'x', spawnDestino: 'L', saida: 'direita' } },
      { tipo: 'spawn', x: 1, y: 2, dados: { nome: 'L', direcao: 'cima', chegada: 'L' } },
    ]);
    expect(indicadoresDaSubarea(m, TELA)).toEqual([{ tipo: 'seta-direita', x: 1, y: 1, porta: 'L' }]);
  });

  it('porta fechada recebe seta sobre o próprio tile pelo campo saida (direita ou esquerda; cima não recebe)', () => {
    const m: MapaDoJogo = { ...subarea(3, 3, [{ tipo: 'portaFechada', x: 2, y: 1, dados: { id: 'P3', texto: 'porta.fechada', saida: 'direita' } }]), id: 'sala' };
    expect(indicadoresDaSubarea(m, TELA)).toEqual([{ tipo: 'seta-direita', x: 2, y: 1, porta: 'P3' }]);
    const cima: MapaDoJogo = { ...subarea(3, 3, [{ tipo: 'portaFechada', x: 2, y: 1, dados: { id: 'P4', texto: 'porta.fechada', saida: 'cima' } }]), id: 'quarto' };
    expect(indicadoresDaSubarea(cima, TELA)).toEqual([]);
  });

  it('C24: nenhum indicador na última linha da tela (é a barra)', () => {
    // Tela de 3 linhas e subárea de 3: a última linha da tela é a 2 (local). Gatilho em (0, 2), saída à esquerda.
    const m = subarea(3, 3, [{ tipo: 'porta', x: 0, y: 2, dados: { id: 'L', destino: 'x', spawnDestino: 'L', saida: 'esquerda' } }]);
    expect(indicadoresDaSubarea(m, { colunas: 3, linhas: 3 })).toEqual([]);
  });

  it('C24: nenhum indicador sobre bilhete, árvore ou interruptor', () => {
    const base = (extra: MapaDoJogo['objetos'][number]) =>
      subarea(3, 3, [{ tipo: 'porta', x: 0, y: 0, dados: { id: 'M', destino: 'x', spawnDestino: 'M', saida: 'direita' } }, extra]);
    for (const tipo of ['bilhete', 'arvore', 'interruptor']) {
      expect(indicadoresDaSubarea(base({ tipo, x: 0, y: 0, dados: {} }), { colunas: 3, linhas: 3 })).toEqual([]);
    }
    // Sem o objeto por cima, a seta aparece (controle da regra acima).
    expect(indicadoresDaSubarea(base({ tipo: 'examinavel', x: 2, y: 2, dados: {} }), { colunas: 3, linhas: 3 })).toHaveLength(1);
  });

  it('vão de saída para baixo fora da caixa da tela não recebe tapete', () => {
    // Tela 3×3, subárea 3×3. Gatilho (1, 2), saída para baixo: vão em (1, 3), abaixo da tela.
    const m = subarea(3, 3, [{ tipo: 'porta', x: 1, y: 2, dados: { id: 'V', destino: 'x', spawnDestino: 'V', saida: 'baixo' } }]);
    expect(indicadoresDaSubarea(m, { colunas: 3, linhas: 3 })).toEqual([]);
  });

  it('vão de saída para baixo na última linha da tela (a barra) não recebe tapete', () => {
    // Tela 3×4: a última linha é a 3. Com desl. 0, o vão (1, 3) cai na barra.
    const m = subarea(3, 3, [{ tipo: 'porta', x: 1, y: 2, dados: { id: 'V', destino: 'x', spawnDestino: 'V', saida: 'baixo' } }]);
    expect(indicadoresDaSubarea(m, { colunas: 3, linhas: 4 })).toEqual([]);
  });

  it('vão de saída para baixo dentro da tela recebe o tapete no vão (G + saída), não no tile de chegada', () => {
    // Tela 3×6: desl. y = 1. Vão local (1, 3) → tela (1, 4): dentro, acima da barra (linha 5).
    const m = subarea(3, 3, [
      { tipo: 'porta', x: 1, y: 2, dados: { id: 'V', destino: 'x', spawnDestino: 'V', saida: 'baixo' } },
      { tipo: 'spawn', x: 1, y: 1, dados: { nome: 'V', direcao: 'baixo' } },
    ]);
    expect(indicadoresDaSubarea(m, { colunas: 3, linhas: 6 })).toEqual([{ tipo: 'tapete', x: 1, y: 3, porta: 'V' }]);
  });

  it('vão com bilhete ou árvore por cima não recebe tapete (C24)', () => {
    for (const tipo of ['bilhete', 'arvore']) {
      const m = subarea(3, 3, [
        { tipo: 'porta', x: 1, y: 2, dados: { id: 'V', destino: 'x', spawnDestino: 'V', saida: 'baixo' } },
        { tipo, x: 1, y: 3, dados: {} },
      ]);
      expect(indicadoresDaSubarea(m, { colunas: 3, linhas: 6 })).toEqual([]);
    }
  });
});
