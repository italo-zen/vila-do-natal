import { describe, expect, it } from 'vitest';
import { gestoLibera, LiberacaoDoSom } from '../../../src/presentation/audio/liberacao';

/** ADR-008 2.1 e 9.1 (AU1): sem gesto, nada libera; cada tipo de gesto libera; Esc não; libera uma vez. */
describe('liberação do áudio no primeiro gesto (AU1)', () => {
  it.each(['pointerdown', 'pointerup', 'touchend', 'mousedown', 'click', 'keydown'])('o gesto %s libera', (tipo) => {
    expect(gestoLibera(tipo, 'Z')).toBe(true);
  });

  it('Esc não libera (o navegador não o trata como gesto)', () => {
    expect(gestoLibera('keydown', 'Escape')).toBe(false);
  });

  it('redimensionar e rolar não liberam', () => {
    expect(gestoLibera('resize')).toBe(false);
    expect(gestoLibera('scroll')).toBe(false);
    expect(gestoLibera('pointermove')).toBe(false);
  });

  it('libera uma vez só', () => {
    const l = new LiberacaoDoSom();
    expect(l.estaLiberado()).toBe(false);
    expect(l.tentar('pointermove')).toBe(false);
    expect(l.tentar('click')).toBe(true);
    expect(l.tentar('click')).toBe(false);
    expect(l.estaLiberado()).toBe(true);
  });
});
