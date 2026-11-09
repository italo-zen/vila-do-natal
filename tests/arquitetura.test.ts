import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/** ADR-001: domínio e aplicação não podem depender de Phaser, DOM, rede, aleatório, relógio nem storage. */
const AQUI = dirname(fileURLToPath(import.meta.url));
const SRC = join(AQUI, '..', 'src');
const PROIBIDOS = [
  /from\s+['"]phaser['"]/,
  /\bwindow\b/,
  /\bdocument\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bfetch\s*\(/,
  /Math\.random/,
  /Date\.now/,
  /new\s+Date\(/,
];

function arquivos(dir: string): string[] {
  const out: string[] = [];
  for (const nome of readdirSync(dir)) {
    const cam = join(dir, nome);
    if (statSync(cam).isDirectory()) out.push(...arquivos(cam));
    else if (nome.endsWith('.ts')) out.push(cam);
  }
  return out;
}

describe('regras de arquitetura (ADR-001)', () => {
  for (const camada of ['domain', 'application']) {
    it(`${camada}/ não usa Phaser, window, document, storage, fetch, Math.random nem Date.now`, () => {
      const problemas: string[] = [];
      for (const f of arquivos(join(SRC, camada))) {
        const texto = readFileSync(f, 'utf-8');
        for (const re of PROIBIDOS) if (re.test(texto)) problemas.push(`${f}: ${re}`);
      }
      expect(problemas).toEqual([]);
    });
  }

  it('domínio só importa de si mesmo (sem import de application, infrastructure ou presentation)', () => {
    const problemas: string[] = [];
    for (const f of arquivos(join(SRC, 'domain'))) {
      const texto = readFileSync(f, 'utf-8');
      if (/from\s+['"](\.\.\/)+(application|infrastructure|presentation)/.test(texto)) problemas.push(f);
    }
    expect(problemas).toEqual([]);
  });

  it('aplicação não importa infraestrutura nem apresentação', () => {
    const problemas: string[] = [];
    for (const f of arquivos(join(SRC, 'application'))) {
      const texto = readFileSync(f, 'utf-8');
      if (/from\s+['"](\.\.\/)+(infrastructure|presentation)/.test(texto)) problemas.push(f);
    }
    expect(problemas).toEqual([]);
  });
});
