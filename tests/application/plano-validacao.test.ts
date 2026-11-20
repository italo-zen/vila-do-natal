import { describe, expect, it } from 'vitest';
import { carregarConteudoPuro } from '../helpers/conteudoReal';
import { validarSorteio } from '../../src/application/content/validarSorteio';

/** Uma fixture por código S001 a S008 (ADR-013 seção 6): cada uma quebra só a regra do código. */
const c = await carregarConteudoPuro();
const copia = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const real = () => copia(c.sorteio) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
const rodar = (bruto: unknown, todos = c.todosOsMapas, pecaFixaEAviso = false) => validarSorteio({ bruto, manifesto: c.manifesto, todos, missoes: c.missoes, perfil: c.perfil, pecaFixaEAviso });
const codigos = (erros: string[]) => [...new Set(erros.map((x) => x.slice(0, 4)))];

describe('validarSorteio: o conteúdo real', () => {
  it('passa sem erro e sem aviso (os mapas não têm peça)', () => {
    expect(rodar(c.sorteio)).toEqual({ erros: [], avisos: [] });
  });
});

describe('validarSorteio: S001 a S008', () => {
  it('S001: arquivo ausente, schemaVersion errado ou forma errada', () => {
    expect(codigos(rodar(undefined).erros)).toEqual(['S001']);
    const s = real();
    s.schemaVersion = 2;
    expect(codigos(rodar(s).erros)).toEqual(['S001']);
    const t = real();
    delete t.nick;
    expect(codigos(rodar(t).erros)).toEqual(['S001']);
  });

  it('S002: quantidade diferente de 3, ou menos áreas que peças', () => {
    const s = real();
    s.pecas.quantidade = 4;
    expect(codigos(rodar(s).erros)).toEqual(['S002']);
    const t = real();
    t.pecas.areas = t.pecas.areas.slice(0, 2);
    expect(codigos(rodar(t).erros)).toContain('S002');
  });

  it('S002: sem área sobrando para a caixa (3 áreas para 3 peças) é erro', () => {
    const s = real();
    s.pecas.areas = s.pecas.areas.slice(0, 3);
    expect(rodar(s).erros.some((x) => x.startsWith('S002') && x.includes('caixa'))).toBe(true);
  });

  it('S006: foraDaAreaDaCaixa fora da missão da caixa é erro', () => {
    const s = real();
    s.nick.parte1.foraDaAreaDaCaixa = true;
    expect(rodar(s).erros.some((x) => x.startsWith('S006') && x.includes('caixa'))).toBe(true);
  });

  it('S003: área proibida, mapa inexistente ou retângulos que se sobrepõem', () => {
    const proibida = real();
    proibida.pecas.areas.push({ id: 'sala', minimo: 1, comodos: [{ id: 'sala', mapa: 'sala' }] });
    expect(rodar(proibida).erros.some((x) => x.startsWith('S003'))).toBe(true);
    const semMapa = real();
    semMapa.pecas.areas[1].comodos[0].mapa = 'nao_existe';
    expect(rodar(semMapa).erros.some((x) => x.startsWith('S003'))).toBe(true);
    const sobrepoe = real();
    sobrepoe.pecas.areas[0].comodos[1].retangulo = { x: 0, y: 2, w: 6, h: 3 };
    expect(rodar(sobrepoe).erros.some((x) => x.startsWith('S003') && x.includes('sobrepõem'))).toBe(true);
  });

  it('S004: candidatos abaixo do mínimo da área', () => {
    const s = real();
    s.pecas.areas[2].minimo = 99; // escritório
    expect(codigos(rodar(s).erros)).toEqual(['S004']);
  });

  it('S005: chave que não é missão, área fechada na missão, hall, ou área sem porta para a Sala', () => {
    const chave = real();
    chave.nick.nao_existe = { areas: ['sala'], direcao: 'baixo' };
    expect(rodar(chave).erros.some((x) => x.startsWith('S005'))).toBe(true);
    const hall = real();
    hall.nick.parte1.areas = ['hall'];
    expect(rodar(hall).erros.some((x) => x.startsWith('S005') && x.includes('hall'))).toBe(true);
    const fechada = real();
    fechada.nick.marco1.areas = ['quarto']; // marco1 só abre hall, sala e cozinha
    expect(rodar(fechada).erros.some((x) => x.startsWith('S005') && x.includes('fechada'))).toBe(true);
    const semRegra = real();
    delete semRegra.nick.parte2;
    expect(rodar(semRegra).erros.some((x) => x.startsWith('S005') && x.includes('sem regra'))).toBe(true);
  });

  it('S006: foraDaAreaDaPeca fora de 1 a 3, ou numa missão sem essa peça', () => {
    const s = real();
    s.nick.parte2.foraDaAreaDaPeca = 7;
    expect(codigos(rodar(s).erros)).toEqual(['S006']);
    const t = real();
    t.nick.enfeites.foraDaAreaDaPeca = 2;
    expect(codigos(rodar(t).erros)).toEqual(['S006']);
  });

  it('S007: Nick com menos tiles que o mínimo, ou sem nenhum', () => {
    const s = real();
    s.nick.parte1.minimo = 999;
    expect(codigos(rodar(s).erros)).toEqual(['S007']);
    const t = real();
    t.nick.enfeites.areas = ['cozinha'];
    t.nick.enfeites.dentroDaLuzDeEntrada = { mapa: 'sala', spawn: 'hall-sala' };
    // cozinha tem tiles; para zerar, exige o mínimo impossível numa área pequena
    t.nick.enfeites.minimo = 50;
    expect(codigos(rodar(t).erros)).toEqual(['S007']);
  });

  it('S008: mapa cru com objeto `peca` é erro (ou aviso, enquanto a Arte regera os mapas)', () => {
    const todos = new Map(c.todosOsMapas);
    const sala = c.todosOsMapas.get('sala')!;
    todos.set('sala', { ...sala, objetos: [...sala.objetos, { tipo: 'peca', x: 0, y: 5, dados: { id: 'peca1', ordem: 1, estadoInicial: 'visivel' } }] });
    const erro = rodar(c.sorteio, todos);
    expect(codigos(erro.erros)).toEqual(['S008']);
    const aviso = rodar(c.sorteio, todos, true);
    expect(aviso.erros).toEqual([]);
    expect(codigos(aviso.avisos)).toEqual(['S008']);
  });
});
