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

  it('src/ inteiro não usa localStorage nem sessionStorage (ADR-002 seção 3; ADR-007 12.1)', () => {
    const problemas: string[] = [];
    for (const f of arquivos(SRC)) {
      const texto = readFileSync(f, 'utf-8');
      if (/\blocalStorage\b|\bsessionStorage\b/.test(texto)) problemas.push(f);
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

/** ADR-007 12.1 (0.10.0): a direção do joystick é função pura; a pilha da cruz saiu do código. */
describe('joystick (ADR-007 1.3 e 12.1)', () => {
  it('direcaoDoAnalogico.ts não usa DOM nem Phaser', () => {
    const codigo = readFileSync(join(SRC, 'presentation', 'input', 'direcaoDoAnalogico.ts'), 'utf-8');
    expect(codigo).not.toMatch(/from\s+['"]phaser['"]/);
    expect(codigo).not.toMatch(/\bwindow\b|\bdocument\b|\bnavigator\b/);
  });

  it('pilhaDaCruz.ts não existe mais no código', () => {
    expect(() => statSync(join(SRC, 'presentation', 'input', 'pilhaDaCruz.ts'))).toThrow();
  });
});

/** Backlog 130, 131 e 129 e BUG-R13-03 (0.11.0, polimento): regras que o código não pode quebrar sem teste. */
describe('polimento do Marco 6 (backlog 129 a 131; BUG-R13-03)', () => {
  it('nenhum texto da apresentação usa fonte.grade (8 px, abaixo do piso de 12); o grade é só grade nativa', () => {
    const achados = arquivos(join(SRC, 'presentation'))
      .filter((f) => /fonte\.grade/.test(readFileSync(f, 'utf-8')))
      .map((f) => f.slice(SRC.length));
    expect(achados).toEqual([]);
  });

  it('o painel da senha tem fundo sólido (não usa alfaCaixa)', () => {
    const codigo = readFileSync(join(SRC, 'presentation', 'ui', 'PainelDeCodigo.ts'), 'utf-8');
    expect(codigo).not.toMatch(/alfaCaixa/);
  });

  it('as mensagens do painel saem só pela regra de limpaMensagemDoPainel (não por outro caminho)', () => {
    const codigo = readFileSync(join(SRC, 'presentation', 'ui', 'PainelDeCodigo.ts'), 'utf-8');
    expect(codigo.match(/limparMensagem\(\)/g)?.length).toBeGreaterThanOrEqual(2);
  });
});

/** ADR-008 9.1 (Marco 6): a API de som fica na apresentação; só o motor usa Web Audio; o domínio e a aplicação não sabem de som. */
describe('áudio e pausa (ADR-008 1.7 e 9.1)', () => {
  const emAudio = arquivos(join(SRC, 'presentation', 'audio'));

  it('só motorWebAudio.ts e o motor tocam a API Web Audio (AudioContext, OfflineAudioContext)', () => {
    const achados = emAudio
      .filter((f) => !f.endsWith('motorWebAudio.ts'))
      .filter((f) => /\bAudioContext\b|\bOfflineAudioContext\b|webkitAudioContext/.test(readFileSync(f, 'utf-8')))
      .map((f) => f.slice(SRC.length));
    expect(achados).toEqual([]);
  });

  it('o domínio e a aplicação não usam AudioContext, Audio nem window', () => {
    for (const pasta of ['domain', 'application']) {
      for (const f of arquivos(join(SRC, pasta))) {
        expect(readFileSync(f, 'utf-8'), f).not.toMatch(/\bAudioContext\b|new Audio\(|\bwindow\b/);
      }
    }
  });

  it('presentation/audio não importa infrastructure', () => {
    for (const f of emAudio) expect(readFileSync(f, 'utf-8'), f).not.toMatch(/from\s+['"][^'"]*infrastructure/);
  });

  it('a pausa (estado puro) não depende de Phaser nem de som', () => {
    const codigo = readFileSync(join(SRC, 'presentation', 'ui', 'pausa', 'estadoDaPausa.ts'), 'utf-8');
    expect(codigo).not.toMatch(/from\s+['"]phaser['"]|tocarSom|somDaCena/);
  });
});
