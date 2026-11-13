import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validarDecoracao, quadroDoPisca, QUANTIDADE_DE_ENFEITES, type ContextoDaDecoracao, type EnfeiteBruto } from '../../src/application/content/decoracao';

/** ADR-010 3 e 8.2 (E1 a E9) e 3.5 (pisca). Fixtures pequenas; cada regra falha com uma violação e passa com o caso certo. */
const TEXTOS = JSON.parse(readFileSync(join(__dirname, '..', '..', 'content', 'texts', 'pt-BR.json'), 'utf-8'));

function contexto(over: Partial<ContextoDaDecoracao> = {}): ContextoDaDecoracao {
  return {
    subareasDoModo: ['hall', 'sala', 'cozinha', 'quarto', 'escritorio'],
    largura: 12,
    altura: 9,
    // Parede: as bordas. Móvel: o tile (5, 3). O resto é chão andável.
    bloqueado: (x, y) => x === 0 || y === 0 || (x === 5 && y === 3),
    proibido: (x, y) => x === 11 && y === 4,
    sprites: { dec_guirlanda: {}, dec_luz: { quadros: 2 }, dec_vela: { quadros: 2 }, dec_cortina: {}, dec_pano: {}, dec_meias: {} },
    chavesDeTexto: Object.keys(TEXTOS),
    ...over,
  };
}

/** Enfeites do hall (4 exigidos): 2 de parede (bloqueado), 2 de chão. */
function hall(extra: Partial<EnfeiteBruto>[] = []): unknown {
  const base: EnfeiteBruto[] = [
    { id: 'h1', sprite: 'dec_guirlanda', x: 0, y: 2, pisca: false, examinar: 'enfeite.guirlanda' },
    { id: 'h2', sprite: 'dec_luz', x: 0, y: 4, pisca: true, examinar: 'enfeite.pisca' },
    { id: 'h3', sprite: 'dec_meias', x: 2, y: 2, pisca: false, examinar: null },
    { id: 'h4', sprite: 'dec_luz', x: 3, y: 5, pisca: true, examinar: null },
  ];
  base.forEach((e, i) => Object.assign(e, extra[i] ?? {}));
  return { schemaVersion: 2, subarea: 'hall', enfeites: base };
}

/** Recalcula o `hall` válido, mas com chave e tile de exemplo: a regra falha sobre o enfeite indicado. */
function comEnfeite(i: number, mudar: Partial<EnfeiteBruto>, sub = 'hall'): unknown {
  const d = hall() as { enfeites: EnfeiteBruto[]; subarea: string };
  d.enfeites[i] = { ...d.enfeites[i], ...mudar };
  d.subarea = sub;
  return d;
}

describe('decoração: caso válido (ADR-010 8.2)', () => {
  it('um hall com 4 enfeites bem colocados passa em todas as regras', () => {
    expect(validarDecoracao(hall(), contexto())).toEqual([]);
  });

  it('a contagem exigida por subárea está na tabela de 20.6 (total 25)', () => {
    const soma = Object.values(QUANTIDADE_DE_ENFEITES).reduce((s, n) => s + n, 0);
    expect(soma).toBe(25);
    expect(QUANTIDADE_DE_ENFEITES).toEqual({ hall: 4, sala: 8, cozinha: 6, quarto: 4, escritorio: 3 });
  });
});

describe('E1: schema e chaves', () => {
  it('schemaVersion diferente de 2 é erro', () => {
    expect(validarDecoracao({ ...(hall() as object), schemaVersion: 1 }, contexto()).join('\n')).toMatch(/E1: schemaVersion precisa ser 2/);
  });
  it('chave desconhecida no enfeite é erro', () => {
    expect(validarDecoracao(comEnfeite(0, { extra: 1 } as Partial<EnfeiteBruto>), contexto()).join('\n')).toMatch(/E1: .* chave "extra"/);
  });
  it('id repetido é erro', () => {
    expect(validarDecoracao(comEnfeite(1, { id: 'h1' }), contexto()).join('\n')).toMatch(/E1: id "h1" repetido/);
  });
});

describe('E2: subárea do modo explorar', () => {
  it('subárea fora de missions[enfeites].maps é erro (Suíte fechada, EX3)', () => {
    expect(validarDecoracao(hall(), contexto({ subareasDoModo: ['sala'] })).join('\n')).toMatch(/E2: subárea "hall" não está em missions/);
  });
  it('subárea que não é do modo é erro', () => {
    expect(validarDecoracao(comEnfeite(0, {}, 'suite'), contexto()).join('\n')).toMatch(/E2: subárea "suite" não é do modo explorar/);
  });
});

describe('E3: contagem exata', () => {
  it('hall com 3 enfeites em vez de 4 é erro', () => {
    const d = hall() as { enfeites: EnfeiteBruto[] };
    d.enfeites.pop();
    expect(validarDecoracao(d, contexto()).join('\n')).toMatch(/E3: hall tem 3 enfeites; a tabela pede 4/);
  });
});

describe('E4: tile dentro da subárea e fora dos proibidos', () => {
  it('tile fora da caixa é erro', () => {
    expect(validarDecoracao(comEnfeite(3, { x: 99 }), contexto()).join('\n')).toMatch(/E4: .* fora da subárea/);
  });
  it('tile proibido (passagem, interruptor, barra) é erro', () => {
    expect(validarDecoracao(comEnfeite(3, { x: 11, y: 4 }), contexto()).join('\n')).toMatch(/E4: .* tile proibido/);
  });
});

describe('E5: tile andável', () => {
  it('andável com examinar é erro (enfeite de chão é só visual)', () => {
    expect(validarDecoracao(comEnfeite(2, { examinar: 'enfeite.meias' }), contexto()).join('\n')).toMatch(/E5: .* não pode ter "examinar"/);
  });
  it('andável que pisca sem ser luz ou vela é erro', () => {
    expect(validarDecoracao(comEnfeite(2, { pisca: true }), contexto()).join('\n')).toMatch(/E5: .* só luz ou vela piscam/);
  });
});

describe('E6: tile bloqueado', () => {
  it('examinar fora da lista de 3.4 é erro', () => {
    expect(validarDecoracao(comEnfeite(0, { examinar: 'enfeite.inventado' }), contexto()).join('\n')).toMatch(/E6: .* "enfeite.inventado"/);
  });
  it('cortina e pano de prato não respondem ao A', () => {
    const d = { schemaVersion: 2, subarea: 'hall', enfeites: [
      { id: 'c1', sprite: 'dec_cortina', x: 0, y: 6, pisca: false, examinar: 'enfeite.guirlanda' },
      { id: 'h2', sprite: 'dec_luz', x: 0, y: 4, pisca: true, examinar: 'enfeite.pisca' },
      { id: 'h3', sprite: 'dec_meias', x: 2, y: 2, pisca: false, examinar: null },
      { id: 'h4', sprite: 'dec_luz', x: 3, y: 5, pisca: true, examinar: null },
    ] };
    expect(validarDecoracao(d, contexto()).join('\n')).toMatch(/E6: .* \(dec_cortina\) não responde ao A/);
  });
});

describe('E7: sprite registrado e pisca em 2 quadros', () => {
  it('sprite fora do prefixo dec_ é erro', () => {
    expect(validarDecoracao(comEnfeite(2, { sprite: 'spr_arvore' }), contexto()).join('\n')).toMatch(/E7: .* fora do prefixo dec_/);
  });
  it('sprite que não está em sprites.json é erro', () => {
    expect(validarDecoracao(comEnfeite(2, { sprite: 'dec_inexistente' }), contexto()).join('\n')).toMatch(/E7: sprite "dec_inexistente" não está em sprites.json/);
  });
  it('pisca em sprite de 1 quadro é erro (luz pisca em folha de 2)', () => {
    expect(validarDecoracao(comEnfeite(1, { sprite: 'dec_guirlanda', pisca: true }), contexto()).join('\n')).toMatch(/E7: .* pisca, e o sprite não tem 2 quadros/);
  });
});

describe('E9: textos de examinar existem', () => {
  it('chave de examinar que não está em pt-BR.json é erro', () => {
    expect(validarDecoracao(comEnfeite(0, { examinar: 'enfeite.guirlanda' }), contexto({ chavesDeTexto: ['outra'] })).join('\n')).toMatch(/E9: chave "enfeite.guirlanda" não existe/);
  });
});

describe('pisca de 1 Hz (ADR-010 3.5; EN3, AC4)', () => {
  it('quadro 0 nos primeiros 500 ms e quadro 1 nos 500 ms seguintes', () => {
    expect(quadroDoPisca(0)).toBe(0);
    expect(quadroDoPisca(499)).toBe(0);
    expect(quadroDoPisca(500)).toBe(1);
    expect(quadroDoPisca(999)).toBe(1);
    expect(quadroDoPisca(1000)).toBe(0);
  });
  it('nunca mais de 3 ciclos por segundo: um ciclo a cada 1000 ms', () => {
    let trocas = 0;
    let anterior = quadroDoPisca(0);
    for (let t = 1; t <= 10_000; t++) {
      const q = quadroDoPisca(t);
      if (q !== anterior) trocas++;
      anterior = q;
    }
    // 10 s com 1 ciclo por segundo: 20 trocas de quadro (ida e volta), nunca mais de 3 por segundo.
    expect(trocas).toBe(20);
  });
});
