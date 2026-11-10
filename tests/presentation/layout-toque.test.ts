import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { escolherLayout, posicoesDoLayoutA, posicoesDoLayoutB, telaNaArea, caixaDoVoltarDaSelecao, cursoDaBolinha, deslocamentoDaBolinha, zonaDoVoltarDaSelecao } from '../../src/presentation/ui/toque/layout';
import { fatorDeEscala } from '../../src/presentation/ui/escala';
import type { PerfilDeArte } from '../../src/application/arte/PerfilDeArte';

/** ADR-007 seções 4, 8.2 e 12.1: escolha de layout, posições em CSS px, painel 5 × 3 e casos de V1 e V5. */
const hd: PerfilDeArte = JSON.parse(readFileSync(join(__dirname, '..', '..', 'content', 'art-profiles', 'hd-480x352.json'), 'utf-8'));
const toque = hd.toque!;
const base = { largura: 480, altura: 352 };

function geometria(janela: { largura: number; altura: number }, comToque = true) {
  const f = fatorDeEscala(hd.escala, base, janela);
  const tela = telaNaArea(janela, base, f);
  return { f, tela, layout: escolherLayout(tela, janela, comToque, toque.faixaMinimaCss) };
}

describe('escolha do layout (ADR-007 4.1; GDD 18.2)', () => {
  it.each([
    [844, 390, 'A'],
    [932, 430, 'A'],
    [667, 375, 'B'],
    [1024, 768, 'B'],
    [1920, 955, 'A'],
  ])('janela %i×%i com toque: layout %s', (w, h, esperado) => {
    expect(geometria({ largura: w, altura: h }).layout).toBe(esperado);
  });

  it('sem toque, nenhum layout (computador não mostra controles)', () => {
    expect(geometria({ largura: 1920, altura: 955 }, false).layout).toBeNull();
  });

  it('faixa de 144 CSS px vai para A; 143,9 vai para B', () => {
    const tela = { x: 144, y: 0, largura: 480, altura: 352 };
    expect(escolherLayout(tela, { largura: 768, altura: 352 }, true, 144)).toBe('A');
    expect(escolherLayout({ ...tela, x: 143.95 }, { largura: 767.9, altura: 352 }, true, 144)).toBe('B');
  });
});

describe('posições do layout A (ADR-007 4.2; TQ1)', () => {
  it('844×390: base de 120 com a borda esquerda a 8 px da janela, e tudo a 8 px da base inferior (TQ1)', () => {
    const area = { largura: 844, altura: 390 };
    const { tela } = geometria(area);
    const p = posicoesDoLayoutA(area, tela, toque);
    expect(tela.largura).toBeCloseTo(532, 0);
    expect(p.analogico.largura).toBe(120);
    expect(p.analogico.x).toBe(8);
    expect(p.analogico.y + p.analogico.altura).toBeCloseTo(390 - 8, 0);
    expect(p.a.y + p.a.altura).toBeCloseTo(390 - 8, 0);
    expect(p.b.y + p.b.altura).toBeCloseTo(390 - 8, 0);
    expect(p.analogico.x + p.analogico.largura).toBeLessThanOrEqual(tela.x);
  });

  it('844×390: A e B à direita da tela, nenhum sobre a tela do jogo; B à esquerda de A com 8 px', () => {
    const area = { largura: 844, altura: 390 };
    const { tela } = geometria(area);
    const p = posicoesDoLayoutA(area, tela, toque);
    expect(p.b.x).toBeGreaterThanOrEqual(tela.x + tela.largura);
    expect(p.b.x + p.b.largura + toque.espacoEntreControlesCss).toBeCloseTo(p.a.x, 0);
    expect(p.analogico.x + p.analogico.largura).toBeLessThanOrEqual(tela.x);
  });
});

describe('posições do layout B (ADR-007 4.3; TQ2)', () => {
  it('667×375: base e par dentro das linhas 2 a 8, sem tocar as linhas 0, 9 e 10 (TQ2)', () => {
    const area = { largura: 667, altura: 375 };
    const { tela, f } = geometria(area);
    const p = posicoesDoLayoutB(tela, hd.tile, f, toque);
    const topoDaLinha2 = tela.y + 2 * hd.tile * f;
    const baseDaLinha8 = tela.y + 9 * hd.tile * f;
    for (const c of [p.analogico, p.a, p.b]) {
      expect(c.y).toBeGreaterThanOrEqual(topoDaLinha2 - 0.001);
      expect(c.y + c.altura).toBeLessThanOrEqual(baseDaLinha8 + 0.001);
    }
    expect(p.analogico.x).toBeGreaterThanOrEqual(tela.x);
    expect(p.analogico.x).toBeCloseTo(tela.x + 8, 3);
    expect(p.a.x + p.a.largura).toBeLessThanOrEqual(tela.x + tela.largura + 0.001);
  });
});

describe('joystick: curso da bolinha (GDD 18.19.3 e 18.19.6)', () => {
  it('curso = base/2 − bolinha/2: 120 e 48 dão 36', () => {
    expect(cursoDaBolinha(120, 48)).toBe(36);
    expect(cursoDaBolinha(toque.analogico.baseCss, toque.analogico.bolinhaCss)).toBe(36);
  });

  it('dentro do curso, a bolinha segue o dedo', () => {
    expect(deslocamentoDaBolinha(10, 0, 36)).toEqual({ dx: 10, dy: 0 });
  });

  it('fora do curso, a bolinha fica presa na borda, na direção do dedo', () => {
    const p = deslocamentoDaBolinha(60, 0, 36);
    expect(p.dx).toBeCloseTo(36, 6);
    expect(p.dy).toBeCloseTo(0, 6);
    const q = deslocamentoDaBolinha(30, 40, 36);
    expect(Math.hypot(q.dx, q.dy)).toBeCloseTo(36, 6);
    expect(q.dx / q.dy).toBeCloseTo(30 / 40, 6);
  });

  it('sem deslocamento, a bolinha fica no centro', () => {
    expect(deslocamentoDaBolinha(0, 0, 36)).toEqual({ dx: 0, dy: 0 });
  });
});

describe('geometria do painel no toque (ADR-007 8.2; V5)', () => {
  const p = toque.painel;
  const barraDeDuas = hd.barra.alturaPorLinhas['2'];
  const limite = hd.sala.linhas * hd.tile - barraDeDuas;

  it('5 colunas × 3 linhas cabem acima da barra de 2 linhas, em 667×375', () => {
    const linhas = Math.ceil(13 / p.colunas);
    expect(linhas).toBe(3);
    expect(p.topo + (linhas - 1) * p.passoY + p.alturaTecla).toBeLessThanOrEqual(limite);
  });

  it('passos com 8 CSS px de folga no fator de referência', () => {
    const f = 375 / 352;
    expect((p.passoX - p.larguraTecla) * f).toBeGreaterThanOrEqual(8);
    expect((p.passoY - p.alturaTecla) * f).toBeGreaterThanOrEqual(8);
    expect(p.alturaTecla * f).toBeGreaterThanOrEqual(48);
  });

  it('prova negativa (V5): a grade de 3 colunas × 4 linhas, com as teclas do toque, não cabe', () => {
    // Teclas de 48 CSS px com 8 entre elas: passo de 54 px de jogo e 4 linhas (ADR-007 8.2). Termina em 340 > 296.
    const fundo = p.topo + (4 - 1) * p.passoY + p.alturaTecla;
    expect(fundo).toBe(340);
    expect(fundo).toBeGreaterThan(limite);
  });
});

/** Layout B com caixa de diálogo reservada (pedido de 2026-11-09): A e B fora da caixa de texto. */
describe('layout B com caixa de diálogo reservada', () => {
  const janela = { largura: 667, altura: 375 };
  const { tela, f } = geometria(janela);
  const caixaDeBaixo = { topo: 352 - 128, fundo: 352 };
  const caixaDeCima = { topo: 0, fundo: 128 };

  it('caixa na base: A e B ficam acima do topo da caixa, sem cobri-la', () => {
    const p = posicoesDoLayoutB(tela, hd.tile, f, toque, caixaDeBaixo);
    const topoDaCaixa = tela.y + caixaDeBaixo.topo * f;
    expect(p.a.y + p.a.altura).toBeLessThanOrEqual(topoDaCaixa + 0.001);
    expect(p.b.y + p.b.altura).toBeLessThanOrEqual(topoDaCaixa + 0.001);
    expect(p.a.y).toBeGreaterThanOrEqual(tela.y + 2 * hd.tile * f - 0.001);
  });

  it('caixa no topo: A e B ficam abaixo da caixa, sem cobri-la', () => {
    const p = posicoesDoLayoutB(tela, hd.tile, f, toque, caixaDeCima);
    const fundoDaCaixa = tela.y + caixaDeCima.fundo * f;
    expect(p.a.y).toBeGreaterThanOrEqual(fundoDaCaixa - 0.001);
    expect(p.b.y).toBeGreaterThanOrEqual(fundoDaCaixa - 0.001);
  });

  it('sem reserva, A e B seguem centrados na faixa (exploração, pergunta 38)', () => {
    const p = posicoesDoLayoutB(tela, hd.tile, f, toque);
    const topo = tela.y + 2 * hd.tile * f;
    const fundo = tela.y + 9 * hd.tile * f;
    expect(p.a.y).toBeCloseTo(topo + (fundo - topo - toque.botaoCss) / 2, 3);
  });
});


/** Botão "Voltar ao título" da seleção em layout B (pergunta 42): fora dos cartões e do texto da barra. */
describe('botão Voltar ao título da seleção (layout B)', () => {
  const cartaoFundo = hd.telas.selecao.cartaoTopo + hd.telas.selecao.cartaoAltura; // 264
  const barraTopo = hd.sala.linhas * hd.tile - hd.barra.margemInferior - hd.barra.entreLinhas - hd.fonte.corpo; // 308
  const largura = hd.botao.largura;
  const altura = hd.fonte.corpo + hd.espaco.medio;
  const caixa = caixaDoVoltarDaSelecao(hd.sala.colunas * hd.tile, cartaoFundo, barraTopo, largura, altura);

  it('fica inteiro entre a linha de baixo dos cartões e o texto da barra', () => {
    expect(caixa.y).toBeGreaterThanOrEqual(cartaoFundo);
    expect(caixa.y + caixa.altura).toBeLessThanOrEqual(barraTopo);
  });

  it('centrado na largura da tela', () => {
    expect(caixa.x).toBeCloseTo((hd.sala.colunas * hd.tile - largura) / 2, 3);
  });

  it('o rótulo "Voltar ao título" (16 caracteres de 16 px) cabe na caixa', () => {
    expect(16 * hd.fonte.corpo).toBeLessThanOrEqual(largura);
  });

  it('a zona de toque (48 CSS px no mínimo) cabe na faixa livre, a menos de 1 px dos cartões', () => {
    const f = fatorDeEscala(hd.escala, base, { largura: 667, altura: 375 });
    const zona = Math.max(altura, Math.ceil(48 / f));
    const centro = caixa.y + caixa.altura / 2;
    expect(centro - zona / 2).toBeGreaterThanOrEqual(cartaoFundo - 1);
    expect(centro + zona / 2).toBeLessThanOrEqual(barraTopo + 1);
  });
});

/** Backlog 138 (PO3, P1 do GDD 19.4.1 item 6): a zona do "Voltar ao título" da seleção não toca nem sobrepõe um cartão. */
describe('zona do Voltar ao título da seleção (PO3)', () => {
  const cartaoFundo = hd.telas.selecao.cartaoTopo + hd.telas.selecao.cartaoAltura; // 264
  const barraTopo = hd.sala.linhas * hd.tile - hd.barra.margemInferior - hd.barra.entreLinhas - hd.fonte.corpo; // 308
  const altura = hd.fonte.corpo + hd.espaco.medio; // 32, o desenho não muda

  it.each([
    ['667×375', 667, 375],
    ['960×640', 960, 640],
  ])('%s: começa na linha de baixo dos cartões (não sobrepõe)', (_nome, w, h) => {
    const f = fatorDeEscala(hd.escala, base, { largura: w, altura: h });
    const z = zonaDoVoltarDaSelecao(cartaoFundo, altura, f, 48);
    expect(z.y).toBeGreaterThanOrEqual(cartaoFundo);
  });

  it.each([
    ['667×375', 667, 375],
    ['960×640', 960, 640],
  ])('%s: tem pelo menos 48 CSS px de altura', (_nome, w, h) => {
    const f = fatorDeEscala(hd.escala, base, { largura: w, altura: h });
    const z = zonaDoVoltarDaSelecao(cartaoFundo, altura, f, 48);
    expect(z.altura * f).toBeGreaterThanOrEqual(48);
  });

  it('o desenho não muda: a zona nunca é menor que o botão', () => {
    const z = zonaDoVoltarDaSelecao(cartaoFundo, altura, 1, 48);
    expect(z.altura).toBeGreaterThanOrEqual(altura);
  });

  it('a zona fica sobre a barra só na margem de 2 px (o texto da barra começa em 308)', () => {
    const f = 375 / 352;
    const z = zonaDoVoltarDaSelecao(cartaoFundo, altura, f, 48);
    expect(z.y + z.altura - barraTopo).toBeLessThanOrEqual(2);
  });
});
