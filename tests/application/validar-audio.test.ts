import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validarAudio, type ConfigDeAudio, type MetaDeAudio } from '../../src/application/audio/validarAudio';

/** ADR-008 seções 4.3 e 8.2 (A1 a A7) e GDD 19.2.4, 19.2.6 e 19.9 (AU8 a AU11). */
const RAIZ = join(__dirname, '..', '..');
const config: ConfigDeAudio = JSON.parse(readFileSync(join(RAIZ, 'content', 'audio.json'), 'utf-8'));
const meta: MetaDeAudio = JSON.parse(readFileSync(join(RAIZ, 'assets', 'audio', 'audio-meta.json'), 'utf-8'));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

describe('validarAudio com o conteúdo entregue', () => {
  it('o áudio atual passa em todas as regras', () => {
    expect(validarAudio(config, meta, { release: true })).toEqual([]);
  });

  it('todo id de audio.json existe em assets/audio', () => {
    const ids = [config.musica.id, ...Object.values(config.eventos).map((e) => e.id).filter((id): id is string => !!id), ...Object.values(config.conquistas!).map((c) => c.id), config.creditos!.id];
    for (const id of ids) expect(existsSync(join(RAIZ, 'assets', 'audio', `${id}.mp3`)), id).toBe(true);
  });

  it('AU8: os 13 eventos têm arquivo e chave em audio.json', () => {
    expect(Object.keys(config.eventos).sort()).toEqual(['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10', 'S11', 'S12', 'S13']);
  });

  it('AU12 e 8.3: o SHA-256 de cada MP3 bate com o meta', () => {
    for (const a of meta.arquivos) {
      const bytes = readFileSync(join(RAIZ, 'assets', 'audio', a.arquivo));
      expect(bytes.length, a.arquivo).toBe(a.bytes);
      expect(createHash('sha256').update(bytes).digest('hex'), a.arquivo).toBe((a as unknown as { sha256Mp3: string }).sha256Mp3);
    }
  });
});

describe('validarAudio: cada regra falha quando violada', () => {
  it('A1: falta um evento', () => {
    const c = clone(config);
    delete c.eventos.S13;
    expect(validarAudio(c, meta).join('\n')).toMatch(/A1/);
  });

  it('A1: música sem loop', () => {
    const c = clone(config);
    c.musica.loop = false;
    expect(validarAudio(c, meta).join('\n')).toMatch(/A1: musica\.loop/);
  });

  it('A2: id que não existe no meta', () => {
    const c = clone(config);
    c.eventos.S05.id = 'sfx_inexistente';
    expect(validarAudio(c, meta).join('\n')).toMatch(/A2: .*sfx_inexistente/);
  });

  it('A2: rascunho no build de release', () => {
    expect(validarAudio(config, { ...meta, rascunho: true }, { release: true }).join('\n')).toMatch(/rascunho/);
  });

  it('A3: ganho acima de 0 dB', () => {
    const c = clone(config);
    c.eventos.S02.ganhoDb = 1;
    expect(validarAudio(c, meta).join('\n')).toMatch(/A3: ganhoDb de S02/);
  });

  it('A4: música de 45 s', () => {
    const m = clone(meta);
    m.arquivos.find((a) => a.arquivo === 'mus_natal.mp3')!.duracaoS = 45;
    expect(validarAudio(config, m).join('\n')).toMatch(/A4: música com 45 s/);
  });

  it('A4: efeito com bytes acima de 12 000', () => {
    const m = clone(meta);
    m.arquivos.find((a) => a.arquivo === 'sfx_s07_au.mp3')!.bytes = 13000;
    expect(validarAudio(config, m).join('\n')).toMatch(/S07 com 13000 bytes/);
  });

  it('A5: pico de −2 dBFS', () => {
    const m = clone(meta);
    m.arquivos.find((a) => a.arquivo === 'sfx_s07_au.mp3')!.picoDbfs = -2;
    expect(validarAudio(config, m).join('\n')).toMatch(/A5: sfx_s07_au\.mp3/);
  });

  it('A6(a): música alta demais (a diferença cai abaixo de 7 dB)', () => {
    const c = clone(config);
    c.musica.ganhoDb = 0;
    expect(validarAudio(c, meta).join('\n')).toMatch(/A6\(a\)/);
  });

  it('A6(b): trocar o passo (S01) para alto, com maiores e menores fora de ordem', () => {
    const c = clone(config);
    c.eventos.S01.ganhoDb = 0;
    expect(validarAudio(c, meta).join('\n')).toMatch(/A6\(b\)/);
  });

  it('A6(c): picos somados passam de 1,0 com volume alto no mestre', () => {
    const c = clone(config);
    c.mestre = 1;
    c.musica.ganhoDb = 0;
    c.eventos.S07.ganhoDb = 0;
    for (const k of Object.keys(c.conquistas!)) c.conquistas![k].ganhoDb = 0;
    c.eventos.S11.ganhoDb = 0;
    expect(validarAudio(c, meta).join('\n')).toMatch(/A6\(c\)|A6\(a\)|A6\(b\)/);
  });

  it('A7: música com 25 ms de silêncio no fim', () => {
    const m = clone(meta);
    m.arquivos.find((a) => a.arquivo === 'mus_natal.mp3')!.silencioFinalMs = 25;
    expect(validarAudio(config, m).join('\n')).toMatch(/A7/);
  });
});

describe('validarAudio, schema 2 (ADR-008 revisão 2, 8.2): conquistas, créditos e família S09', () => {
  const comMeta = (mudar: (m: MetaDeAudio) => void): MetaDeAudio => {
    const m = clone(meta);
    mudar(m);
    return m;
  };
  const ARQ = (m: MetaDeAudio, nome: string) => m.arquivos.find((a) => a.arquivo === nome)!;
  const CINCO = ['jin_j01_luzes', 'jin_j02_parte1', 'jin_j03_parte2', 'jin_j04_parte3', 'jin_j05_enfeites'];

  it('A1: schemaVersion precisa ser 2', () => {
    const c = clone(config);
    c.schemaVersion = 1;
    expect(validarAudio(c, meta).join('\n')).toMatch(/A1: schemaVersion precisa ser 2/);
  });

  it('A1: S09 com id próprio é erro (a família não tem arquivo)', () => {
    const c = clone(config);
    c.eventos.S09.id = 'jin_j01_luzes';
    expect(validarAudio(c, meta).join('\n')).toMatch(/A1: S09 não pode ter "id"/);
  });

  it('A1: efeito comum sem id é erro', () => {
    const c = clone(config);
    delete c.eventos.S02.id;
    expect(validarAudio(c, meta).join('\n')).toMatch(/A1: S02 precisa de "id"/);
  });

  it('A1: falta uma conquista', () => {
    const c = clone(config);
    delete c.conquistas!['conquista.enfeites'];
    expect(validarAudio(c, meta).join('\n')).toMatch(/A1: conquistas precisa das cinco chaves/);
  });

  it('A1: jingle da conquista trocado (luzes aponta para o de parte1)', () => {
    const c = clone(config);
    c.conquistas!['conquista.luzes'].id = 'jin_j02_parte1';
    expect(validarAudio(c, meta).join('\n')).toMatch(/A1: conquista\.luzes precisa do jingle jin_j01/);
  });

  it('A1: chaves de conquista diferentes das missões', () => {
    expect(validarAudio(config, meta, { chavesDeConquista: ['conquista.luzes', 'conquista.outra'] }).join('\n')).toMatch(/não são as das missões/);
  });

  it('A1: as chaves de conquista batem com as missões do jogo', () => {
    const chaves = ['conquista.luzes', 'conquista.parte1', 'conquista.parte2', 'conquista.parte3', 'conquista.enfeites'];
    expect(validarAudio(config, meta, { chavesDeConquista: chaves })).toEqual([]);
  });

  it('A1: créditos sem jingle jin_jc', () => {
    const c = clone(config);
    c.creditos!.id = 'jin_j01_luzes';
    expect(validarAudio(c, meta).join('\n')).toMatch(/A1: creditos precisa do jingle jin_jc/);
  });

  it('A2: jingle de conquista que não está no meta', () => {
    const c = clone(config);
    c.conquistas!['conquista.parte2'].id = 'jin_j03_inexistente';
    expect(validarAudio(c, meta).join('\n')).toMatch(/A2: conquista\.parte2 aponta para "jin_j03_inexistente"/);
  });

  it('A3: ganho de jingle fora de [−40, 0]', () => {
    const c = clone(config);
    c.conquistas!['conquista.luzes'].ganhoDb = 2;
    expect(validarAudio(c, meta).join('\n')).toMatch(/A3: ganhoDb de conquista\.luzes/);
  });

  it('A4: um jingle de conquista acima de 16 000 bytes', () => {
    const m = comMeta((x) => (ARQ(x, 'jin_j05_enfeites.mp3').bytes = 16001));
    expect(validarAudio(config, m).join('\n')).toMatch(/A4: jingle jin_j05_enfeites\.mp3 com 16001 bytes/);
  });

  it('A4: os cinco jingles somados passam de 64 000 bytes', () => {
    const m = comMeta((x) => {
      for (const n of CINCO) ARQ(x, n + '.mp3').bytes = 15900;
    });
    expect(validarAudio(config, m).join('\n')).toMatch(/jingles de conquista somam 79500 bytes: limite de 64000/);
  });

  it('A4: JC acima de 64 000 bytes', () => {
    const m = comMeta((x) => (ARQ(x, 'jin_jc_natal.mp3').bytes = 64001));
    expect(validarAudio(config, m).join('\n')).toMatch(/jingle de créditos com 64001 bytes/);
  });

  it('A4: JC fora da faixa de 12 a 16 s', () => {
    const m = comMeta((x) => (ARQ(x, 'jin_jc_natal.mp3').duracaoS = 17));
    expect(validarAudio(config, m).join('\n')).toMatch(/jingle de créditos com 17 s/);
  });

  it('A4: áudio total acima de 320 000 bytes', () => {
    const m = comMeta((x) => {
      ARQ(x, 'mus_natal.mp3').bytes = 160000;
      ARQ(x, 'jin_jc_natal.mp3').bytes = 64000;
      for (const n of CINCO) ARQ(x, n + '.mp3').bytes = 16000;
    });
    expect(validarAudio(config, m).join('\n')).toMatch(/áudio total com/);
  });

  it('A6(c2): pico do JC mais o da trilha passa de 1,0', () => {
    const c = clone(config);
    c.creditos!.ganhoDb = 0;
    c.musica.ganhoDb = 0;
    c.mestre = 1;
    // Pico em −3 dBFS (o limite de A5): com mestre 1 e ganho 0, JC mais trilha passam de 1,0.
    const m = comMeta((x) => {
      ARQ(x, 'jin_jc_natal.mp3').picoDbfs = -3;
      ARQ(x, 'mus_natal.mp3').picoDbfs = -3;
    });
    expect(validarAudio(c, m).join('\n')).toMatch(/A6\(c2\)/);
  });
});

describe('A1: chaves de conquista lidas de content/missions/*.json (ADR-008 8.2)', () => {
  it('as chaves de audio.json são exatamente as que as missões usam', () => {
    const pasta = join(RAIZ, 'content', 'missions');
    const usadas = new Set<string>();
    for (const nome of readdirSync(pasta).filter((n) => n.endsWith('.json'))) {
      for (const m of readFileSync(join(pasta, nome), 'utf-8').matchAll(/"(conquista\.[a-z0-9]+)"/g)) usadas.add(m[1]);
    }
    expect(usadas.size).toBe(5);
    expect(validarAudio(config, meta, { chavesDeConquista: [...usadas] })).toEqual([]);
  });
});
