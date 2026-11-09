import { describe, expect, it } from 'vitest';
import { direcaoDoAnalogico, LIMIAR_CSS, ZONA_MORTA_CSS, type Direcao } from '../../src/presentation/input/direcaoDoAnalogico';
import { LIMIAR_DO_CURSO_CSS } from '../../src/application/arte/validarToque';

/** GDD 18.19.4 e ADR-007 1.3 e 12.1: zona morta, limiar, histerese, eixo dominante e empate. Função pura. */
const polar = (graus: number, d: number) => ({ dx: d * Math.cos((graus * Math.PI) / 180), dy: d * Math.sin((graus * Math.PI) / 180) });

describe('direcaoDoAnalogico: zona morta e limiar (TQ25)', () => {
  it('constantes: zona morta 12 e engajamento 20', () => {
    expect(ZONA_MORTA_CSS).toBe(12);
    expect(LIMIAR_CSS).toBe(20);
  });

  it('em repouso, 0, 8 e 16 CSS px (no eixo) não dão direção', () => {
    expect(direcaoDoAnalogico(0, 0, null)).toBeNull();
    expect(direcaoDoAnalogico(8, 0, null)).toBeNull();
    expect(direcaoDoAnalogico(16, 0, null)).toBeNull();
  });

  it('(14, 14) tem distância ≈ 19,8 (menor que 20): nada', () => {
    expect(direcaoDoAnalogico(14, 14, null)).toBeNull();
  });

  it('(16, 12) tem distância exatamente 20: engaja para a direita', () => {
    expect(direcaoDoAnalogico(16, 12, null)).toBe('direita');
  });

  it('com a direção engajada, 16 continua (histerese) e 12 solta', () => {
    expect(direcaoDoAnalogico(16, 0, 'direita')).toBe('direita');
    expect(direcaoDoAnalogico(12, 0, 'direita')).toBeNull();
    expect(direcaoDoAnalogico(0, 12, 'baixo')).toBeNull();
  });

  it('distância ≤ 12 solta mesmo com direção anterior', () => {
    expect(direcaoDoAnalogico(0, 0, 'cima')).toBeNull();
    expect(direcaoDoAnalogico(7, 7, 'cima')).toBeNull();
  });

  it('a constante de código bate com o limiar copiado em validarToque (ADR-007 5.2)', () => {
    expect(LIMIAR_DO_CURSO_CSS).toBe(LIMIAR_CSS);
  });
});

describe('direcaoDoAnalogico: eixo dominante (TQ24)', () => {
  it.each([
    [0, 'direita'],
    [90, 'baixo'],
    [180, 'esquerda'],
    [270, 'cima'],
  ] as const)('ângulo %i° com 30 px: %s', (graus, esperado) => {
    const { dx, dy } = polar(graus, 30);
    expect(direcaoDoAnalogico(dx, dy, null)).toBe(esperado);
  });

  it.each([40, 45, 50])('ângulo %i° (perto de 45°) dá só um eixo: o dominante', (graus) => {
    const { dx, dy } = polar(graus, 30);
    const esperado: Direcao = Math.abs(dx) > Math.abs(dy) ? 'direita' : 'baixo';
    expect(direcaoDoAnalogico(dx, dy, null)).toBe(esperado);
  });

  it('um ponto (30, −29) dá direita, nunca diagonal', () => {
    expect(direcaoDoAnalogico(30, -29, null)).toBe('direita');
  });

  it('1000 ângulos aleatórios: sempre uma direção ou nenhuma, nunca diagonal', () => {
    let semente = 20261109;
    const aleatorio = () => {
      semente = (semente * 1103515245 + 12345) & 0x7fffffff;
      return semente / 0x7fffffff;
    };
    const dirs = new Set(['cima', 'baixo', 'esquerda', 'direita', null]);
    for (let i = 0; i < 1000; i++) {
      const { dx, dy } = polar(aleatorio() * 360, 5 + aleatorio() * 35);
      const r = direcaoDoAnalogico(dx, dy, null);
      expect(dirs.has(r)).toBe(true);
    }
  });
});

describe('direcaoDoAnalogico: empate exato (passo 3 de 1.3)', () => {
  it('(20, 20) sem direção anterior: nenhuma', () => {
    expect(direcaoDoAnalogico(20, 20, null)).toBeNull();
  });

  it('(20, 20) com anterior: mantém a anterior', () => {
    expect(direcaoDoAnalogico(20, 20, 'baixo')).toBe('baixo');
    expect(direcaoDoAnalogico(-20, -20, 'esquerda')).toBe('esquerda');
  });

  it('(−20, 20) com anterior cima: mantém cima (empate não troca)', () => {
    expect(direcaoDoAnalogico(-20, 20, 'cima')).toBe('cima');
  });
});

describe('direcaoDoAnalogico: sinais e troca de eixo', () => {
  it('sinal de dx e dy escolhe o lado do eixo dominante', () => {
    expect(direcaoDoAnalogico(-30, 4, null)).toBe('esquerda');
    expect(direcaoDoAnalogico(4, -30, null)).toBe('cima');
  });

  it('com a direção engajada, passar de um eixo para o outro muda a direção (sem parar)', () => {
    expect(direcaoDoAnalogico(30, 0, null)).toBe('direita');
    expect(direcaoDoAnalogico(10, 30, 'direita')).toBe('baixo');
  });
});
