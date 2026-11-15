import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { interpretarTextos } from '../../src/application/content/Textos';
import { TETO_DE_CARACTERES_DA_DICA } from '../../src/application/content/validarNick';

/** Textos do Marco 3 (GDD 16.11, ADR-005 seção 2.4): chaves e texto exato. Lidos do arquivo que a build embute. */
const ARQUIVO = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content', 'texts', 'pt-BR.json');
const bruto = JSON.parse(readFileSync(ARQUIVO, 'utf-8')) as Record<string, string | string[]>;
const t = interpretarTextos(bruto);
const paginas = (chave: string) => t.paginas(chave);

describe('chaves e textos do Marco 3 (GDD 16.11)', () => {
  it.each([
    ['barra.casa', ['Setas: andar  Z: examinar']],
    ['barra.casa2', ['X: farejar  H: dica']],
    ['barra.dica', ['Z ou X: voltar']],
    ['comojogar.farejar', ['Farejar: X, com o Nick acordado.']],
    ['comojogar.dica', ['Dica: H, ou clique no ícone ?']],
    ['dica.titulo', ['Dica']],
    ['dica.voltar', ['Voltar']],
    ['dica.porta', ['Leia o bilhete na parede.', 'Ele tem a pista da senha.']],
    ['dica.luzes.dormindo', ['A casa está escura.', 'Procure o interruptor.', 'O Nick está dormindo.']],
    ['dica.luzes.acordado', ['A casa está escura.', 'Procure o interruptor.', 'Aperte X e o Nick fareja.']],
    ['dica.parte1.dormindo', ['Procure uma parte da árvore.', 'O Nick ainda está dormindo.']],
    ['dica.parte1.acordado', ['Procure uma parte da árvore.', 'Aperte X e o Nick fareja.']],
    ['dica.parte2.dormindo', ['Procure a parte do meio.', 'O Nick ainda está dormindo.']],
    ['dica.parte2.acordado', ['Procure a parte do meio.', 'Aperte X e o Nick fareja.']],
    ['dica.parte3.dormindo', ['Procure em outro cômodo.', 'O Nick ainda está dormindo.']],
    ['dica.parte3.acordado', ['Procure em outro cômodo.', 'Aperte X e o Nick fareja.']],
    ['dica.enfeites.dormindo', ['Procure a caixa de enfeites.', 'O Nick ainda está dormindo.']],
    ['dica.enfeites.acordado', ['Procure a caixa de enfeites.', 'Aperte X e o Nick fareja.']],
    ['nick.acordou', ['O Nick acordou! Ele vai seguir você.', 'Aperte X para farejar.']],
    ['nick.latido', ['Au!']],
  ])('%s tem o texto do GDD 16.11', (chave, esperado) => {
    expect(t.tem(chave)).toBe(true);
    expect(paginas(chave)).toEqual(esperado);
  });

  it('nick.acordou tem 2 páginas (16.3) e a dica tem até 3 linhas', () => {
    expect(t.quantasPaginas('nick.acordou')).toBe(2);
    for (const k of Object.keys(bruto).filter((k) => k.startsWith('dica.'))) {
      expect(paginas(k).length, k).toBeLessThanOrEqual(3);
      expect(paginas(k).join('').length, k).toBeLessThanOrEqual(TETO_DE_CARACTERES_DA_DICA);
    }
  });

  it('nenhuma linha de dica passa de 28 caracteres (D7, teste de medida)', () => {
    for (const k of Object.keys(bruto).filter((k) => k.startsWith('dica.'))) {
      for (const linha of paginas(k)) expect(linha.length, `${k}: "${linha}"`).toBeLessThanOrEqual(28);
    }
  });
});

describe('regras de texto (GDD 16.8.8, D8; item 034)', () => {
  const dicas = Object.keys(bruto).filter((k) => k.startsWith('dica.'));

  it('nenhuma dica cita cômodo, nem esquerda, direita ou baixo (D8)', () => {
    const proibidas = /\b(Sala|Cozinha|Lavanderia|Quarto|Escritório|Suíte|Hall|esquerda|direita|baixo)\b/i;
    for (const k of dicas) expect(proibidas.test(paginas(k).join(' ')), k).toBe(false);
  });

  it('nenhuma dica dá direção (D8): nem "cima", "baixo", "esquerda" ou "direita" (decisão do Diretor sobre a parte 3)', () => {
    for (const k of dicas) expect(/\b(cima|baixo)\b/i.test(paginas(k).join(' ')), k).toBe(false);
  });

  it('os botões de Como jogar cabem em uma linha (até 27 caracteres, GDD 16.10)', () => {
    expect(paginas('comojogar.botaoA')[0].length).toBeLessThanOrEqual(27);
    expect(paginas('comojogar.botaoB')[0].length).toBeLessThanOrEqual(27);
  });

  it('nenhum texto cita nome de pessoa da família (item 034)', () => {
    for (const chave of Object.keys(bruto)) {
      if (!/^(dica|nick|barra\.casa2|comojogar)/.test(chave)) continue;
      expect(/Ítalo|Nath|Lolo|BiBi|DanDan|TuTu/.test(paginas(chave).join(' ')), chave).toBe(false);
    }
  });
});
