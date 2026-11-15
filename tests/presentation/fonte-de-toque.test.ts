import { describe, expect, it } from 'vitest';
import { FonteDeToque } from '../../src/presentation/input/FonteDeToque';
import { direcaoDoAnalogico, type Direcao } from '../../src/presentation/input/direcaoDoAnalogico';

/** ADR-007 seções 1.3, 1.5 e 7.1 (contrato de menu M1 a M6); GDD 18.19.5 a 18.19.8 e 18.19.6. */

/** Empurra o dono até um ponto e devolve as bordas geradas no quadro. */
function empurrar(f: FonteDeToque, id: number, dx: number, dy: number): string[] {
  f.moverBase(id, dx, dy);
  return [...f.consumir()];
}

describe('FonteDeToque: dono e captura (GDD 18.19.5 e 18.19.6)', () => {
  it('só o primeiro dedo que começa na base comanda; o segundo não muda nada', () => {
    const f = new FonteDeToque();
    expect(f.pressionarBase(1, 30, 0)).toBe(true);
    expect(f.pressionarBase(2, -30, 0)).toBe(false);
    expect(f.direcaoAtual()).toBe('direita');
    f.moverBase(2, 0, 30);
    expect(f.direcaoAtual()).toBe('direita');
    expect(f.donoAtual()).toBe(1);
  });

  it('soltar o dono zera a direção e não gera borda', () => {
    const f = new FonteDeToque();
    f.definirBordas(true);
    f.pressionarBase(1, 0, 30);
    f.consumir();
    f.soltarBase(1);
    expect(f.direcaoAtual()).toBeNull();
    expect(f.consumir().size).toBe(0);
    expect(f.donoAtual()).toBeNull();
  });

  it('soltar com outro id não faz nada', () => {
    const f = new FonteDeToque();
    f.pressionarBase(1, 30, 0);
    f.soltarBase(2);
    expect(f.direcaoAtual()).toBe('direita');
    expect(f.donoAtual()).toBe(1);
  });

  it('depois de soltar, outro dedo pode assumir a base', () => {
    const f = new FonteDeToque();
    f.pressionarBase(1, 0, 30);
    f.soltarBase(1);
    expect(f.pressionarBase(3, 0, -30)).toBe(true);
    expect(f.direcaoAtual()).toBe('cima');
  });

  it('o dono sai da base (deslizar para fora): a direção segue o lado do dedo, sem soltar', () => {
    const f = new FonteDeToque();
    f.pressionarBase(1, 0, 30);
    f.moverBase(1, 0, 90);
    expect(f.direcaoAtual()).toBe('baixo');
    expect(f.donoAtual()).toBe(1);
  });
});

describe('FonteDeToque: borda de menu só no engajamento a partir do repouso (ADR-007 7.1)', () => {
  it('engajar uma direção gera uma borda; segurar não repete (M2)', () => {
    const f = new FonteDeToque();
    f.definirBordas(true);
    f.pressionarBase(1, 0, 30);
    expect([...f.consumir()]).toEqual(['baixo']);
    const quadros: string[] = [];
    for (let q = 0; q < 90; q++) quadros.push(...empurrar(f, 1, 0, 30));
    expect(quadros).toEqual([]);
    expect(f.segurada('baixo')).toBe(true);
  });

  it('trocar de direção sem voltar à zona morta não gera borda (M3)', () => {
    const f = new FonteDeToque();
    f.definirBordas(true);
    f.pressionarBase(1, 0, -30);
    f.consumir();
    expect(empurrar(f, 1, 30, 0)).toEqual([]);
    expect(f.direcaoAtual()).toBe('direita');
  });

  it('voltar à zona morta e engajar de novo gera outra borda', () => {
    const f = new FonteDeToque();
    f.definirBordas(true);
    f.pressionarBase(1, 0, 30);
    f.consumir();
    expect(empurrar(f, 1, 0, 5)).toEqual([]);
    expect(f.direcaoAtual()).toBeNull();
    expect(empurrar(f, 1, 0, 30)).toEqual(['baixo']);
  });

  it('dentro da histerese (16) a direção continua sem borda nova', () => {
    const f = new FonteDeToque();
    f.definirBordas(true);
    f.pressionarBase(1, 0, 30);
    f.consumir();
    expect(empurrar(f, 1, 0, 16)).toEqual([]);
    expect(f.direcaoAtual()).toBe('baixo');
  });

  it('fora dos menus (bordas desligadas) o joystick só segura: exploração sem borda', () => {
    const f = new FonteDeToque();
    f.pressionarBase(1, 0, 30);
    expect(f.consumir().size).toBe(0);
    expect(f.segurada('baixo')).toBe(true);
  });

  it('descartar limpa as bordas pendentes, mas o dono e a direção continuam', () => {
    const f = new FonteDeToque();
    f.definirBordas(true);
    f.pressionarBase(1, 0, 30);
    f.descartar();
    expect(f.consumir().size).toBe(0);
    expect(f.segurada('baixo')).toBe(true);
  });

  it('propriedade (ADR-007 7.1 e 12.1): 1000 trajetórias aleatórias; cada borda vem de repouso e com distância ≥ 20', () => {
    let semente = 20261110;
    const aleatorio = () => {
      semente = (semente * 1103515245 + 12345) & 0x7fffffff;
      return semente / 0x7fffffff;
    };
    for (let rodada = 0; rodada < 1000; rodada++) {
      const f = new FonteDeToque();
      f.definirBordas(true);
      const x0 = (aleatorio() - 0.5) * 120;
      const y0 = (aleatorio() - 0.5) * 120;
      f.pressionarBase(1, x0, y0);
      // Toque que começa já engajado gera a borda no próprio toque (ADR-007 P16): mesma regra, distância ≥ 20.
      const noToque = [...f.consumir()];
      if (noToque.length > 0) expect(Math.hypot(x0, y0)).toBeGreaterThanOrEqual(20);
      let anterior: Direcao | null = f.direcaoAtual();
      for (let passo = 0; passo < 40; passo++) {
        const dx = (aleatorio() - 0.5) * 100;
        const dy = (aleatorio() - 0.5) * 100;
        const repousoAntes = anterior === null;
        f.moverBase(1, dx, dy);
        const bordas = [...f.consumir()];
        if (bordas.length > 0) {
          // Engajamento a partir do repouso: sem direção antes, distância atual ≥ 20, e a borda é a direção pura.
          expect(repousoAntes).toBe(true);
          expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(20);
          expect(bordas).toEqual([direcaoDoAnalogico(dx, dy, null)]);
        }
        anterior = f.direcaoAtual();
      }
    }
  });
});

describe('FonteDeToque: bloqueio e soltar (ADR-007 10.3 e 1.5)', () => {
  it('bloqueada (aviso de rotação): a base não captura, e a direção e as bordas somem', () => {
    const f = new FonteDeToque();
    f.definirBordas(true);
    f.pressionarBase(1, 0, 30);
    f.bloquear(true);
    expect(f.direcaoAtual()).toBeNull();
    expect(f.donoAtual()).toBeNull();
    expect(f.pressionarBase(2, 0, 30)).toBe(false);
    f.pressionarBotao('a');
    expect([...f.consumir()]).toEqual([]);
    f.bloquear(false);
    f.pressionarBotao('a');
    expect([...f.consumir()]).toEqual(['a']);
  });

  it('soltarTudo zera o dono e a direção, sem borda', () => {
    const f = new FonteDeToque();
    f.definirBordas(true);
    f.pressionarBase(1, 0, 30);
    f.consumir();
    f.soltarTudo();
    expect(f.direcaoAtual()).toBeNull();
    expect(f.donoAtual()).toBeNull();
    expect(f.consumir().size).toBe(0);
  });
});

describe('FonteDeToque: A e B (ADR-007 1.4)', () => {
  it('A e B geram uma borda por toque; consumir esvazia a fila', () => {
    const f = new FonteDeToque();
    f.pressionarBotao('a');
    expect([...f.consumir()]).toEqual(['a']);
    expect(f.consumir().size).toBe(0);
  });

  it('A junto com o joystick (dedos diferentes): ambos valem no mesmo quadro (TQ30)', () => {
    const f = new FonteDeToque();
    f.pressionarBase(1, 30, 0);
    f.pressionarBotao('a');
    expect(f.segurada('direita')).toBe(true);
    expect([...f.consumir()]).toEqual(['a']);
  });
});
