import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/** O gancho de QA (window.__estado, window.__teleportar) só existe no build de QA (tools/build-qa.md). */
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ler = (c: string) => readFileSync(join(RAIZ, c), 'utf-8');
const PROIBIDOS = ['__estado', '__teleportar', '__irParaFase', '__focoDoMenu', '__alvosDeToque', '__analogico', 'ganchoQa', 'Gancho de QA'];

describe('gancho de QA fora dos builds que não são de QA', () => {
  it('playtest, build normal e release definem __QA__ como false', () => {
    expect(ler('vite.playtest.config.ts')).toContain("__QA__: 'false'");
    expect(ler('vite.config.ts')).toContain("__QA__: 'false'");
  });

  it('só o build de QA define __QA__ como true', () => {
    expect(ler('vite.qa.config.ts')).toContain("__QA__: 'true'");
  });

  it('main.ts importa o gancho só dentro do ramo __QA__', () => {
    const main = ler('src/main.ts');
    const guarda = main.indexOf('if (__QA__) {');
    const importa = main.indexOf("import('./presentation/qa/ganchoQa')");
    expect(guarda).toBeGreaterThan(-1);
    expect(importa).toBeGreaterThan(guarda);
  });

  it('dist-playtest/index.html não contém símbolo do gancho (rode npm run build:playtest antes)', () => {
    const arquivo = join(RAIZ, 'dist-playtest', 'index.html');
    if (!existsSync(arquivo)) {
      expect.fail('dist-playtest/index.html não existe: rode npm run build:playtest antes de npm test.');
    }
    const html = readFileSync(arquivo, 'utf-8');
    for (const p of PROIBIDOS) expect(html.includes(p), `símbolo "${p}" no playtest`).toBe(false);
  });
});

describe('gancho de QA do sorteio e do PL27 (ADR-013 seção 8)', () => {
  const gancho = readFileSync(join(RAIZ, 'src', 'presentation', 'qa', 'ganchoQa.ts'), 'utf-8');
  it('expõe __semente, __plano, __irAPeca, __coletarPeca e __passosDaConducao', () => {
    for (const nome of ['__semente', '__plano', '__irAPeca', '__irACaixa', '__coletarPeca', '__passosDaConducao', '__estadoDaPartida']) expect(gancho).toContain(`janela.${nome} =`);
  });
  it('nenhum deles existe fora do gancho (que só entra sob __QA__)', () => {
    for (const f of ['CasaScene.ts', 'SelecaoScene.ts']) {
      const t = readFileSync(join(RAIZ, 'src', 'presentation', 'scenes', f), 'utf-8');
      expect(t).not.toMatch(/__irAPeca|__coletarPeca|__passosDaConducao/);
    }
  });
});
