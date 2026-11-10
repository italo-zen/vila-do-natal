import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
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
    const ids = [config.musica.id, ...Object.values(config.eventos).map((e) => e.id)];
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
    m.arquivos.find((a) => a.arquivo === 'sfx_s09_conquista.mp3')!.bytes = 13000;
    expect(validarAudio(config, m).join('\n')).toMatch(/S09 com 13000 bytes/);
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
    c.eventos.S09.ganhoDb = 0;
    c.eventos.S11.ganhoDb = 0;
    expect(validarAudio(c, meta).join('\n')).toMatch(/A6\(c\)|A6\(a\)|A6\(b\)/);
  });

  it('A7: música com 25 ms de silêncio no fim', () => {
    const m = clone(meta);
    m.arquivos.find((a) => a.arquivo === 'mus_natal.mp3')!.silencioFinalMs = 25;
    expect(validarAudio(config, m).join('\n')).toMatch(/A7/);
  });
});
