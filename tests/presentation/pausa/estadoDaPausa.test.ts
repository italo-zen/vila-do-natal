import { describe, expect, it } from 'vitest';
import { confirmarItem, estadoInicialDaPausa, ITEM, moverFoco, voltarDaPausa } from '../../../src/presentation/ui/pausa/estadoDaPausa';

/** GDD 19.3.3 e 19.3.4; ADR-008 6.3 e 9.1; PS6 e PS7; ADR-007 M5 (sem volta nos limites). */
describe('estado da pausa (ADR-008 6.3)', () => {
  it('abre na visão da pausa com foco em "Continuar"', () => {
    expect(estadoInicialDaPausa()).toEqual({ visao: 'pausa', foco: ITEM.continuar });
  });

  it('foco para nos limites, sem volta', () => {
    let e = estadoInicialDaPausa();
    e = moverFoco(e, -1);
    expect(e.foco).toBe(0);
    for (let i = 0; i < 10; i++) e = moverFoco(e, 1);
    expect(e.foco).toBe(3);
    e = moverFoco(e, 1);
    expect(e.foco).toBe(3);
  });

  it('"Continuar" fecha a pausa; "Som" alterna e fica na pausa', () => {
    expect(confirmarItem(estadoInicialDaPausa()).acao).toEqual({ tipo: 'continuar' });
    const som = confirmarItem({ visao: 'pausa', foco: ITEM.som });
    expect(som.acao).toEqual({ tipo: 'som' });
    expect(som.estado).toEqual({ visao: 'pausa', foco: ITEM.som });
  });

  it('PS6: "Como jogar" abre a lista na pausa, e "Voltar" volta à pausa com foco em "Como jogar", não ao título', () => {
    const abre = confirmarItem({ visao: 'pausa', foco: ITEM.comoJogar });
    expect(abre.estado).toEqual({ visao: 'comoJogar', foco: 0 });
    const volta = confirmarItem(abre.estado);
    expect(volta.estado).toEqual({ visao: 'pausa', foco: ITEM.comoJogar });
    expect(volta.acao.tipo).toBe('nenhuma');
  });

  it('X, Esc ou P na lista de Como jogar voltam à pausa com o mesmo foco', () => {
    expect(voltarDaPausa({ visao: 'comoJogar', foco: 0 }).estado).toEqual({ visao: 'pausa', foco: ITEM.comoJogar });
  });

  it('"Voltar ao título" pede confirmação com "Não" em foco (PS7)', () => {
    const r = confirmarItem({ visao: 'pausa', foco: ITEM.sair });
    expect(r.estado).toEqual({ visao: 'confirmacao', foco: ITEM.nao });
  });

  it('PS7: "Não" volta à pausa com foco em "Voltar ao título"', () => {
    const r = confirmarItem({ visao: 'confirmacao', foco: ITEM.nao });
    expect(r.estado).toEqual({ visao: 'pausa', foco: ITEM.sair });
    expect(r.acao.tipo).toBe('nenhuma');
  });

  it('PS7: "Sim" vai ao título', () => {
    expect(confirmarItem({ visao: 'confirmacao', foco: ITEM.sim }).acao).toEqual({ tipo: 'sair' });
  });

  it('na confirmação, esquerda e direita trocam entre Sim e Não, sem volta', () => {
    const e = { visao: 'confirmacao' as const, foco: ITEM.nao };
    expect(moverFoco(e, 1).foco).toBe(1);
    expect(moverFoco(e, -1).foco).toBe(0);
    expect(moverFoco({ visao: 'confirmacao', foco: 0 }, -1).foco).toBe(0);
  });

  it('X ou P na pausa continua o jogo; na confirmação, volta à pausa com "Voltar ao título" em foco', () => {
    expect(voltarDaPausa(estadoInicialDaPausa()).acao).toEqual({ tipo: 'continuar' });
    expect(voltarDaPausa({ visao: 'confirmacao', foco: ITEM.sim }).estado).toEqual({ visao: 'pausa', foco: ITEM.sair });
  });
});
