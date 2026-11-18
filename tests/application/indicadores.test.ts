import { describe, expect, it } from 'vitest';
import { indicadoresDaSubarea } from '../../src/application/mundo/indicadores';
import { carregarConteudoReal } from '../helpers/conteudoReal';
import { descreverComConteudoNovo } from '../helpers/conteudoNovo';
import { mapaDeTexto, porta } from '../helpers/mapasDeArestas';

/**
 * Indicadores de porta (GDD 14.10.10, C20 a C24; ADR-011 seção 3.4). A direção vem do campo `lado` da `porta`: seta lateral
 * se `lado` é esquerda ou direita, tapete se baixo, nada se cima, sempre no tile da porta. O desenho do indicador não muda o
 * estado da porta (aberta, fechada ou com código).
 */

/** Tela do perfil HD (perfil.sala = 15×11). */
const TELA = { colunas: 15, linhas: 11 };

/** Área 3×3 só de piso livre, sem parede interna. */
const GRADE_3X3 = [
  '+-+-+-+',
  '|. . .|',
  '+ + + +',
  '|. . .|',
  '+ + + +',
  '|. . .|',
  '+-+-+-+',
];
const area = (objetos: Parameters<typeof mapaDeTexto>[2]) => mapaDeTexto('teste', GRADE_3X3, objetos);

descreverComConteudoNovo('indicadores de porta no conteúdo real (GDD 14.10.10; C20 a C22)', () => {
  it('toda porta com lado esquerda, direita ou baixo tem indicador no próprio tile; lado cima não tem', async () => {
    const c = await carregarConteudoReal();
    for (const mapa of c.todosOsMapas.values()) {
      const portas = mapa.objetos.filter((o) => o.tipo === 'porta');
      const indicadores = indicadoresDaSubarea(mapa, TELA);
      for (const p of portas) {
        const lado = String(p.dados.lado);
        const ind = indicadores.find((i) => i.porta === p.dados.id);
        if (lado === 'cima') expect(ind, `${mapa.id}/${String(p.dados.id)}`).toBeUndefined();
        else if (ind) expect({ x: ind.x, y: ind.y }).toEqual({ x: p.x, y: p.y });
      }
    }
  });
});

describe('indicadores: regra (direção = campo lado da porta)', () => {
  it('lado cima não tem indicador', () => {
    expect(indicadoresDaSubarea(area([porta('z-x', 1, 0, 'cima', 'x')]), TELA)).toEqual([]);
  });

  it('porta sem lado válido não recebe indicador (a validação acusa, não o desenho)', () => {
    const m = area([{ tipo: 'porta', x: 2, y: 1, dados: { id: 'q', destino: 'x', spawnDestino: 'q' } }]);
    expect(indicadoresDaSubarea(m, TELA)).toEqual([]);
  });

  it('lado esquerda e direita: seta sobre o tile da porta; lado baixo: tapete no tile da porta (não no vão)', () => {
    expect(indicadoresDaSubarea(area([porta('a-b', 0, 1, 'esquerda', 'b')]), TELA)).toEqual([{ tipo: 'seta-esquerda', x: 0, y: 1, porta: 'a-b' }]);
    expect(indicadoresDaSubarea(area([porta('a-b', 2, 1, 'direita', 'b')]), TELA)).toEqual([{ tipo: 'seta-direita', x: 2, y: 1, porta: 'a-b' }]);
    expect(indicadoresDaSubarea(area([porta('a-b', 1, 2, 'baixo', 'b')]), TELA)).toEqual([{ tipo: 'tapete', x: 1, y: 2, porta: 'a-b' }]);
  });

  it('o indicador é o mesmo com a porta aberta, fechada ou com código (só desenho)', () => {
    const base = area([porta('a-b', 2, 1, 'direita', 'b', { trancadaAte: 'porta' })]);
    expect(indicadoresDaSubarea(base, TELA)).toHaveLength(1);
  });

  it('C24: nenhum indicador na última linha da tela (é a barra)', () => {
    const m = area([porta('a-b', 0, 2, 'esquerda', 'b')]);
    // Tela de 3 linhas e área de 3: a última linha da tela é a 2 (local).
    expect(indicadoresDaSubarea(m, { colunas: 3, linhas: 3 })).toEqual([]);
  });

  it('C24: nenhum indicador sobre bilhete, árvore ou interruptor', () => {
    const base = (tipo: string) => area([porta('m-x', 0, 0, 'direita', 'x'), { tipo, x: 0, y: 0, dados: {} }]);
    for (const tipo of ['bilhete', 'arvore', 'interruptor']) {
      expect(indicadoresDaSubarea(base(tipo), { colunas: 3, linhas: 4 })).toEqual([]);
    }
    // Sem o objeto por cima, a seta aparece (controle da regra acima).
    expect(indicadoresDaSubarea(area([porta('m-x', 0, 0, 'direita', 'x'), { tipo: 'examinavel', x: 2, y: 2, dados: {} }]), { colunas: 3, linhas: 4 })).toHaveLength(1);
  });

  it('tapete na linha da barra (a última da tela) não é desenhado; acima dela, é', () => {
    expect(indicadoresDaSubarea(area([porta('a-b', 1, 2, 'baixo', 'b')]), { colunas: 3, linhas: 3 })).toEqual([]);
    expect(indicadoresDaSubarea(area([porta('a-b', 1, 2, 'baixo', 'b')]), { colunas: 3, linhas: 4 })).toEqual([{ tipo: 'tapete', x: 1, y: 2, porta: 'a-b' }]);
  });
});
