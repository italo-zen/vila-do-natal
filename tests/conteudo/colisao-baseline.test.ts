import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * EN1 (ADR-010 3.3 e 9): colisão, gatilhos, portas, spawns e objetos das subáreas são iguais ao 0.12.0. Compara o hash de
 * cada `content/maps/**` (exceto `decoracao/`, que é a camada nova) com `tests/fixtures/colisao-0.12.0.json`. Mudança de
 * mapa precisa de nova versão da linha de base e de decisão registrada (decisions.md).
 */
const RAIZ = join(__dirname, '..', '..');
const base = JSON.parse(readFileSync(join(RAIZ, 'tests', 'fixtures', 'colisao-0.12.0.json'), 'utf-8')) as { mapas: Record<string, string> };

function listar(pasta: string): string[] {
  return readdirSync(pasta).flatMap((n) => {
    const c = join(pasta, n);
    return statSync(c).isDirectory() ? listar(c) : [c];
  });
}

describe('EN1: colisão e objetos iguais ao 0.12.0', () => {
  const atuais: Record<string, string> = {};
  for (const f of listar(join(RAIZ, 'content', 'maps')).filter((n) => n.endsWith('.json') && !n.includes(`${join('maps', 'decoracao')}`) && !/[\\/]decoracao[\\/]/.test(n)).sort()) {
    const rel = relative(join(RAIZ, 'content'), f);
    atuais[rel] = createHash('sha256').update(readFileSync(f)).digest('hex');
  }

  it('há os mesmos mapas da linha de base', () => {
    expect(Object.keys(atuais).sort()).toEqual(Object.keys(base.mapas).sort());
  });

  for (const [arquivo, hash] of Object.entries(base.mapas)) {
    it(`${arquivo} não mudou`, () => {
      expect(atuais[arquivo], arquivo).toBe(hash);
    });
  }
});
