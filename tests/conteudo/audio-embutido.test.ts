import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { idsDeAudioParaEmbutir, type ConfigDeAudioParaEmbutir } from '../../vite.audio';

/** ADR-008 1.6 e revisão 2 (8.4): o plugin embute os 19 arquivos do schema 2, e S09 (variante) não pede arquivo. */
const RAIZ = join(__dirname, '..', '..');
const config: ConfigDeAudioParaEmbutir = JSON.parse(readFileSync(join(RAIZ, 'content', 'audio.json'), 'utf-8'));

describe('plugin de áudio: ids embutidos (schema 2)', () => {
  it('embute 19 arquivos: trilha, 12 efeitos, 5 jingles de conquista e JC', () => {
    const ids = idsDeAudioParaEmbutir(config);
    expect(ids).toHaveLength(19);
    expect(ids).toContain('mus_natal');
    expect(ids).toContain('jin_jc_natal');
    for (const c of ['jin_j01_luzes', 'jin_j02_parte1', 'jin_j03_parte2', 'jin_j04_parte3', 'jin_j05_enfeites']) expect(ids).toContain(c);
  });

  it('S09 com variante não gera id nem arquivo próprio', () => {
    const ids = idsDeAudioParaEmbutir(config);
    expect(ids.some((id) => id.includes('s09'))).toBe(false);
    expect(config.eventos.S09.id).toBeUndefined();
  });

  it('todo id embutido existe em assets/audio', () => {
    for (const id of idsDeAudioParaEmbutir(config)) expect(existsSync(join(RAIZ, 'assets', 'audio', `${id}.mp3`)), id).toBe(true);
  });

  it('não repete id quando dois lugares apontam para o mesmo arquivo', () => {
    const ids = idsDeAudioParaEmbutir({
      musica: { id: 'a' },
      eventos: { S01: { id: 'x' }, S02: { id: 'x' }, S09: { variante: 'conquistas' } },
      conquistas: { 'conquista.luzes': { id: 'j1' } },
      creditos: { id: 'jc' },
    });
    expect(ids).toEqual(['a', 'x', 'j1', 'jc']);
  });

  it('schema 1 (sem conquistas nem créditos) continua funcionando', () => {
    expect(idsDeAudioParaEmbutir({ musica: { id: 'm' }, eventos: { S01: { id: 'e' } } })).toEqual(['m', 'e']);
  });
});
