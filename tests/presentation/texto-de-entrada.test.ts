import { describe, expect, it } from 'vitest';
import { chaveDeEntrada } from '../../src/presentation/ui/textoDeEntrada';

/** ADR-007 seção 9.1 e 12.1: `chaveDeEntrada` devolve `.toque` só com toque, e cai na base sem versão. */
describe('chaveDeEntrada (ADR-007 9.1)', () => {
  const existe = (c: string) => ['barra.casa.toque', 'comojogar.mover.toque'].includes(c);

  it('com toque e com versão `.toque`, usa a versão', () => {
    expect(chaveDeEntrada('barra.casa', true, existe)).toBe('barra.casa.toque');
  });

  it('com toque e sem versão, cai na chave base', () => {
    expect(chaveDeEntrada('barra.titulo', true, existe)).toBe('barra.titulo');
  });

  it('sem toque, nunca usa a versão `.toque`', () => {
    expect(chaveDeEntrada('barra.casa', false, existe)).toBe('barra.casa');
    expect(chaveDeEntrada('comojogar.mover', false, existe)).toBe('comojogar.mover');
  });
});

/** Sem nenhum botão na tela (layout B nos menus, pedido de 2026-11-09): a chave `.toque.menu` tem prioridade. */
describe('chaveDeEntrada sem botões (.toque.menu)', () => {
  const existeMenu = (c: string) => ['barra.titulo.toque.menu', 'barra.titulo.toque'].includes(c);

  it('sem botões e com toque: usa `.toque.menu` quando existe', () => {
    expect(chaveDeEntrada('barra.titulo', true, existeMenu, true)).toBe('barra.titulo.toque.menu');
  });

  it('com botões visíveis, a versão `.toque` continua valendo (menu não entra)', () => {
    expect(chaveDeEntrada('barra.titulo', true, existeMenu, false)).toBe('barra.titulo.toque');
  });

  it('sem botões mas sem versão `.menu`, cai na `.toque`', () => {
    expect(chaveDeEntrada('barra.casa', true, (c) => c === 'barra.casa.toque', true)).toBe('barra.casa.toque');
  });

  it('sem toque, a versão de menu nunca entra', () => {
    expect(chaveDeEntrada('barra.titulo', false, existeMenu, true)).toBe('barra.titulo');
  });
});
