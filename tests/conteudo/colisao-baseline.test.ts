import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, it } from 'vitest';
import { descreverComConteudoNovo } from '../helpers/conteudoNovo';

/**
 * EN1 (ADR-010 3.3 e 9): colisão, gatilhos, portas, spawns e objetos das subáreas são iguais ao 0.12.0. Compara o hash de
 * cada `content/maps/**` (exceto `decoracao/`, que é a camada nova) com `tests/fixtures/colisao-0.12.0.json`. Mudança de
 * mapa precisa de nova versão da linha de base e de decisão registrada (decisions.md).
 */
const RAIZ = join(__dirname, '..', '..');
// V4 (ADR-011 seção 8): a linha de base é a da planta nova. O `colisao-0.12.0.json` saiu de uso (o histórico fica no git).
// Gere o arquivo novo com `node tools/gerar-linha-de-base.mjs` quando o conteúdo gerado pela Arte estiver completo e o Diretor aprovar.
const CAMINHO_DA_BASE = join(RAIZ, 'tests', 'fixtures', 'colisao-1.4.0.json');
const base = (existsSync(CAMINHO_DA_BASE) ? JSON.parse(readFileSync(CAMINHO_DA_BASE, 'utf-8')) : { mapas: {} }) as { mapas: Record<string, string> };

function listar(pasta: string): string[] {
  return readdirSync(pasta).flatMap((n) => {
    const c = join(pasta, n);
    return statSync(c).isDirectory() ? listar(c) : [c];
  });
}

descreverComConteudoNovo('EN1: colisão, paredes e objetos iguais à linha de base 1.1.0 (V4)', () => {
  const atuais: Record<string, string> = {};
  for (const f of listar(join(RAIZ, 'content', 'maps')).filter((n) => n.endsWith('.json') && !n.includes(`${join('maps', 'decoracao')}`) && !/[\\/]decoracao[\\/]/.test(n)).sort()) {
    const rel = relative(join(RAIZ, 'content'), f);
    atuais[rel] = createHash('sha256').update(readFileSync(f)).digest('hex');
  }

  it('a linha de base 1.1.0 existe (node tools/gerar-linha-de-base.mjs)', () => {
    expect(existsSync(CAMINHO_DA_BASE)).toBe(true);
  });

  it('há os mesmos mapas da linha de base', () => {
    expect(Object.keys(atuais).sort()).toEqual(Object.keys(base.mapas).sort());
  });

  for (const [arquivo, hash] of Object.entries(base.mapas)) {
    it(`${arquivo} não mudou`, () => {
      expect(atuais[arquivo], arquivo).toBe(hash);
    });
  }
});
