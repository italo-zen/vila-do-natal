import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** ADR-007 seção 9 e 12.1; GDD 18.12: chaves, limites de medida, proibições e textos de teclado que não mudam. */
const RAIZ = join(__dirname, '..', '..');
const textos: Record<string, string | string[]> = JSON.parse(readFileSync(join(RAIZ, 'content', 'texts', 'pt-BR.json'), 'utf-8'));
const PROIBIDAS = /\b(Z|X|H|Esc|Enter|Backspace)\b/;
const paginas = (v: string | string[]) => (Array.isArray(v) ? v : [v]);

const CHAVES_DA_LISTA = [
  'barra.titulo.toque', 'barra.comojogar.toque', 'barra.selecao1.toque', 'barra.selecao2.toque', 'barra.intro.toque',
  'barra.dialogo.toque', 'barra.painel1.toque', 'barra.painel2.toque', 'barra.conquista.toque', 'barra.casa.toque',
  'barra.casa2.toque', 'barra.dica.toque', 'barra.creditos.toque', 'comojogar.mover.toque', 'comojogar.botaoA.toque',
  'comojogar.botaoB.toque', 'comojogar.farejar.toque', 'comojogar.dica.toque', 'painel.fechar', 'rotacao.1', 'rotacao.2',
  'dica.luzes.acordado.toque', 'dica.parte1.acordado.toque', 'dica.parte2.acordado.toque', 'dica.parte3.acordado.toque',
  'dica.enfeites.acordado.toque', 'nick.acordou.toque',
];

describe('textos de toque: chaves e textos exatos (GDD 18.12)', () => {
  it.each(CHAVES_DA_LISTA)('a chave %s existe', (chave) => {
    expect(textos[chave]).toBeDefined();
  });

  it('os textos de barra e de Como jogar são exatos', () => {
    expect(textos['barra.titulo.toque']).toBe('Mover: escolher  A: confirmar');
    expect(textos['barra.selecao1.toque']).toBe('Mover: escolher  A: confirmar');
    expect(textos['barra.casa.toque']).toBe('Mover: andar  A: examinar');
    expect(textos['comojogar.mover.toque']).toBe('Mover: controle na tela.');
    expect(textos['barra.painel2.toque']).toBe('Toque em Fechar para sair');
    expect(textos['barra.casa2.toque']).toBe('B: farejar  ?: dica');
    expect(textos['comojogar.farejar.toque']).toBe('Farejar: B, com o Nick acordado.');
    expect(textos['comojogar.dica.toque']).toBe('Dica: toque no ícone ?');
    expect(textos['rotacao.1']).toBe('Gire o celular para o lado.');
    expect(textos['rotacao.2']).toBe('O jogo fica na horizontal.');
    expect(textos['painel.fechar']).toBe('Fechar');
  });

  it('"Toque em B" nas dicas e no aviso de farejar', () => {
    expect(textos['nick.acordou.toque']).toEqual(['O Nick acordou! Ele vai seguir você.', 'Toque em B para farejar.']);
    expect(textos['dica.parte3.acordado.toque']).toEqual(['Procure em outro cômodo.', 'Toque em B e o Nick fareja.']);
  });

  it('comojogar.celular saiu de uso e de texto (GDD 18.7)', () => {
    expect(textos['comojogar.celular']).toBeUndefined();
  });
});

describe('limites de medida (ADR-007 9.4)', () => {
  it.each(CHAVES_DA_LISTA.filter((c) => c.startsWith('barra.')))('barra %s: até 29 caracteres', (chave) => {
    expect(String(textos[chave]).length).toBeLessThanOrEqual(29);
  });

  it.each(CHAVES_DA_LISTA.filter((c) => c.startsWith('comojogar.') && c !== 'comojogar.farejar.toque'))('Como jogar %s: até 27 caracteres', (chave) => {
    expect(String(textos[chave]).length).toBeLessThanOrEqual(27);
  });

  it('Farejar (V4) passa de 27 e quebra em duas linhas, sem cortar (até 54 caracteres)', () => {
    const n = String(textos['comojogar.farejar.toque']).length;
    expect(n).toBeGreaterThan(27);
    expect(n).toBeLessThanOrEqual(54);
  });

  it.each(CHAVES_DA_LISTA.filter((c) => c.startsWith('dica.') || c.startsWith('nick.')))('diálogo %s: cada página cabe em 2 linhas de 28', (chave) => {
    for (const p of paginas(textos[chave])) expect(p.length).toBeLessThanOrEqual(56);
  });
});

describe('proibições e igualdade com o teclado (ADR-007 9.5; RM4)', () => {
  it('nenhum texto de toque cita "setas" nem "cruz" (joystick, GDD 18.19.10; TQ31)', () => {
    const achados = Object.entries(textos)
      .filter(([k]) => k.endsWith('.toque') || k.endsWith('.toque.menu'))
      .filter(([, v]) => paginas(v).some((p) => /setas|cruz/i.test(p)))
      .map(([k]) => k);
    expect(achados).toEqual([]);
  });

  it('as quatro chaves do GDD 18.19.10 saem com o texto novo e os limites de medida', () => {
    const novas = ['barra.titulo.toque', 'barra.selecao1.toque', 'barra.casa.toque', 'comojogar.mover.toque'];
    for (const chave of novas) expect(String(textos[chave]).startsWith('Mover:')).toBe(true);
    expect(String(textos['barra.titulo.toque']).length).toBeLessThanOrEqual(29);
    expect(String(textos['barra.selecao1.toque']).length).toBeLessThanOrEqual(29);
  });

  it('nenhum texto de toque cita Z, X, H, Esc, Enter ou Backspace', () => {
    const achados = Object.entries(textos)
      .filter(([k]) => k.endsWith('.toque'))
      .filter(([, v]) => paginas(v).some((p) => PROIBIDAS.test(p)))
      .map(([k]) => k);
    expect(achados).toEqual([]);
  });

  it('a versão de toque das dicas difere do teclado só na última linha', () => {
    for (const base of ['dica.luzes.acordado', 'dica.parte1.acordado', 'dica.parte2.acordado', 'dica.parte3.acordado', 'dica.enfeites.acordado']) {
      const a = paginas(textos[base]);
      const b = paginas(textos[`${base}.toque`]);
      expect(b.length).toBe(a.length);
      expect(b.slice(0, -1)).toEqual(a.slice(0, -1));
      expect(a[a.length - 1]).toBe('Aperte X e o Nick fareja.');
      expect(b[b.length - 1]).toBe('Toque em B e o Nick fareja.');
    }
  });

  it('os textos de teclado não mudaram (RM4)', () => {
    expect(textos['barra.titulo']).toBe('Setas: escolher  Z: confirmar');
    expect(textos['barra.casa']).toBe('Setas: andar  Z: examinar');
    expect(textos['barra.casa2']).toBe('X: farejar  H: dica');
    expect(textos['comojogar.botaoA']).toBe('Botão A: Z ou Enter.');
    expect(textos['comojogar.farejar']).toBe('Farejar: X, com o Nick acordado.');
    expect(textos['nick.acordou']).toEqual(['O Nick acordou! Ele vai seguir você.', 'Aperte X para farejar.']);
    expect(textos['dica.luzes.acordado']).toEqual(['A casa está escura.', 'Procure o interruptor.', 'Aperte X e o Nick fareja.']);
  });

  it('cada chave .toque tem uma chave base (ou é chave nova do Marco 5)', () => {
    const novas = new Set(['painel.fechar', 'rotacao.1', 'rotacao.2', 'selecao.voltar']);
    for (const chave of Object.keys(textos).filter((c) => c.endsWith('.toque'))) {
      const base = chave.slice(0, -'.toque'.length);
      expect(textos[base] !== undefined || novas.has(base)).toBe(true);
    }
  });
});

/** Layout B sem botões (pedido de 2026-11-09): a barra diz o que tocar, sem citar botão que não existe na tela. */
describe('textos `.toque.menu` (menus em layout B sem botões)', () => {
  const MENUS = [
    'barra.titulo.toque.menu',
    'barra.comojogar.toque.menu',
    'barra.selecao1.toque.menu',
    'barra.selecao2.toque.menu',
    'barra.conquista.toque.menu',
    'barra.dica.toque.menu',
    'barra.creditos.toque.menu',
    'barra.painel1.toque.menu',
    'barra.painel2.toque.menu',
  ];

  it.each(MENUS)('%s existe e tem até 29 caracteres', (chave) => {
    expect(typeof textos[chave]).toBe('string');
    expect(String(textos[chave]).length).toBeLessThanOrEqual(29);
  });

  it.each(MENUS)('%s começa com "Toque" e não cita "Aperte"', (chave) => {
    expect(String(textos[chave]).startsWith('Toque')).toBe(true);
    expect(String(textos[chave])).not.toMatch(/Aperte/);
  });

  it.each(MENUS)('%s não cita tecla do teclado (Z, X, H, Esc, Enter, Backspace)', (chave) => {
    expect(PROIBIDAS.test(String(textos[chave]))).toBe(false);
  });

  it('cada `.toque.menu` tem a barra base correspondente', () => {
    for (const chave of MENUS) {
      const base = chave.slice(0, -'.toque.menu'.length);
      expect(textos[base]).toBeDefined();
    }
  });

  it('as barras de menu não citam "A:" nem "B:" (não há botão A/B nessas telas)', () => {
    for (const chave of MENUS) expect(String(textos[chave])).not.toMatch(/\b[AB]\b/);
  });
});


/** GDD 18.12: os nove textos `.toque.menu` exatos, e o rótulo do botão "Voltar ao título" (pergunta 42). */
describe('textos `.toque.menu` exatos (GDD 18.12, 9 chaves)', () => {
  const EXATOS: [string, string][] = [
    ['barra.titulo.toque.menu', 'Toque para escolher'],
    ['barra.comojogar.toque.menu', 'Toque em Voltar'],
    ['barra.selecao1.toque.menu', 'Toque para escolher'],
    ['barra.selecao2.toque.menu', 'Toque em Voltar ao título'],
    ['barra.conquista.toque.menu', 'Toque em Continuar'],
    ['barra.dica.toque.menu', 'Toque em Voltar'],
    ['barra.creditos.toque.menu', 'Toque em Voltar ao título'],
    ['barra.painel1.toque.menu', 'Toque nas teclas para digitar'],
    ['barra.painel2.toque.menu', 'Toque em Fechar'],
  ];
  it.each(EXATOS)('%s = "%s"', (chave, texto) => {
    expect(textos[chave]).toBe(texto);
  });
  it('são exatamente nove chaves .toque.menu', () => {
    expect(Object.keys(textos).filter((c) => c.endsWith('.toque.menu'))).toHaveLength(9);
  });
  it('rótulo do botão da seleção: "Voltar ao título", até 20 caracteres, sem tecla', () => {
    expect(textos['selecao.voltar.toque']).toBe('Voltar ao título');
    expect(String(textos['selecao.voltar.toque']).length).toBeLessThanOrEqual(20);
  });
});
