import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validarToque, validarSpritesDeControle, SPRITES_DE_CONTROLE } from '../../src/application/arte/validarToque';
import { validarPerfilDeArte } from '../../src/application/arte/validarPerfilDeArte';

/** ADR-007 seção 5.2, 5.3 e 12.1: o bloco de referência passa; cada limite falha quando violado. */
const bruto = JSON.parse(readFileSync(join(__dirname, '..', '..', 'content', 'art-profiles', 'hd-480x352.json'), 'utf-8'));
const clone = () => JSON.parse(JSON.stringify(bruto));

describe('validarToque (ADR-007 5.3; joystick, GDD 18.19)', () => {
  it('o bloco de referência do HD passa', () => {
    expect(validarToque(bruto.toque, bruto)).toEqual([]);
  });

  it('base de 95 CSS px falha (faixa de 96 a 120)', () => {
    const t = clone().toque;
    t.analogico.baseCss = 95;
    expect(validarToque(t, bruto).join('\n')).toMatch(/baseCss \(95\)/);
  });

  it('base de 121 CSS px falha (faixa de 96 a 120)', () => {
    const t = clone().toque;
    t.analogico.baseCss = 121;
    expect(validarToque(t, bruto).join('\n')).toMatch(/baseCss \(121\)/);
  });

  it('bolinha de 39 CSS px falha (mínimo de 40)', () => {
    const t = clone().toque;
    t.analogico.bolinhaCss = 39;
    expect(validarToque(t, bruto).join('\n')).toMatch(/bolinhaCss \(39\)/);
  });

  it('bolinha de 120 CSS px falha (precisa ser menor que a base)', () => {
    const t = clone().toque;
    t.analogico.bolinhaCss = 120;
    expect(validarToque(t, bruto).join('\n')).toMatch(/menor que baseCss/);
  });

  it('curso de 19 CSS px falha (o engajamento de 20 não cabe)', () => {
    const t = clone().toque;
    t.analogico.baseCss = 96;
    t.analogico.bolinhaCss = 58; // curso = 48 − 29 = 19
    expect(validarToque(t, bruto).join('\n')).toMatch(/curso da bolinha \(19\)/);
  });

  it('faixa de 135 falha no layout A (base 120 + 2 × margem 8 = 136)', () => {
    const t = clone().toque;
    t.faixaMinimaCss = 135;
    expect(validarToque(t, bruto).join('\n')).toMatch(/layout A: base/);
  });

  it('botão de 47 px falha', () => {
    const t = clone().toque;
    t.botaoCss = 47;
    expect(validarToque(t, bruto).join('\n')).toMatch(/botaoCss \(47\)/);
  });

  it('espaço entre controles de 7 px falha (mínimo de 8)', () => {
    const t = clone().toque;
    t.espacoEntreControlesCss = 7;
    expect(validarToque(t, bruto).join('\n')).toMatch(/espacoEntreControlesCss \(7\)/);
  });

  it('cruzCss presente no bloco falha (campo removido, ADR-007 5.1)', () => {
    const t = clone().toque;
    t.cruzCss = 48;
    expect(validarToque(t, bruto).join('\n')).toMatch(/cruzCss: campo removido/);
  });

  it('cursoCss presente no bloco falha (é derivado, não entra no perfil)', () => {
    const t = clone().toque;
    t.cursoCss = 36;
    expect(validarToque(t, bruto).join('\n')).toMatch(/cursoCss: campo removido/);
  });

  it('sem o bloco analogico falha', () => {
    const t = clone().toque;
    delete t.analogico;
    expect(validarToque(t, bruto).join('\n')).toMatch(/toque\.analogico/);
  });

  it('opacidade fora de (0, 1] falha', () => {
    const t = clone().toque;
    t.opacidade.layoutB = 0;
    expect(validarToque(t, bruto).join('\n')).toMatch(/opacidade\.layoutB/);
  });

  it('layoutB que chega à barra (linha além de sala.linhas − 3) falha', () => {
    const t = clone().toque;
    t.layoutB.linhaAte = 9;
    expect(validarToque(t, bruto).join('\n')).toMatch(/linhaAte/);
  });

  it('passo de 7 px entre colunas do painel falha (8 CSS px)', () => {
    const t = clone().toque;
    t.painel.passoX = t.painel.larguraTecla + 7 / (375 / 352);
    expect(validarToque(t, bruto).join('\n')).toMatch(/espaço entre colunas/);
  });

  it('tecla do painel com altura que não chega a 48 CSS px falha', () => {
    const t = clone().toque;
    t.painel.alturaTecla = 44;
    expect(validarToque(t, bruto).join('\n')).toMatch(/alturaTecla/);
  });

  it('grade de 4 linhas no toque (V5 sem 5 colunas) não cabe e falha', () => {
    const t = clone().toque;
    t.painel.colunas = 3;
    expect(validarToque(t, bruto).join('\n')).toMatch(/barra/);
  });

  it('bloco ausente é erro quando a validação pede (perfil ativo)', () => {
    expect(validarToque(undefined, bruto).length).toBeGreaterThan(0);
  });
});

describe('validarPerfilDeArte com o bloco toque (ADR-007 5.3)', () => {
  it('o perfil ativo sem toque falha', () => {
    const p = clone();
    delete p.toque;
    const r = validarPerfilDeArte(p, 'hd-480x352', { ativo: true });
    expect(r.ok).toBe(false);
  });

  it('o v1 (não ativo) pode não ter toque', () => {
    const p = clone();
    delete p.toque;
    const r = validarPerfilDeArte(p, 'hd-480x352', { ativo: false });
    expect(r.ok).toBe(true);
  });

  it('o bloco de referência passa como perfil ativo', () => {
    expect(validarPerfilDeArte(clone(), 'hd-480x352', { ativo: true }).ok).toBe(true);
  });
});

describe('sprites de controle (ADR-007 5.5)', () => {
  it('a lista tem 12 arquivos (joystick 7: base, bolinha, bolinha pressionada, 4 setores; botões 4; celular)', () => {
    expect(SPRITES_DE_CONTROLE).toHaveLength(12);
    expect(SPRITES_DE_CONTROLE.some((a) => a.startsWith('ctl_cruz_'))).toBe(false);
  });

  it('o sprites.json do HD tem todos os sprites de controle', () => {
    const sprites = JSON.parse(readFileSync(join(__dirname, '..', '..', 'assets', 'hd-480x352', 'sprites.json'), 'utf-8'));
    expect(validarSpritesDeControle(sprites.imagens.map((i: { arquivo: string }) => i.arquivo))).toEqual([]);
  });

  it('falta de um sprite de controle é erro', () => {
    const faltando = SPRITES_DE_CONTROLE.filter((a) => a !== 'ctl_celular.png');
    expect(validarSpritesDeControle(faltando).join('\n')).toMatch(/ctl_celular\.png/);
  });
});
