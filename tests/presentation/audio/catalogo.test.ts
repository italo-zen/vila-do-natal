import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EVENTOS_DE_AUDIO, DURACAO_MAXIMA_S, JINGLE_DE_CONQUISTA } from '../../../src/application/audio/eventosDeAudio';
import { ganhoLinear, idDoEvento } from '../../../src/presentation/audio/catalogo';

/** ADR-008 5 e 9.1; AU8: os 13 eventos têm arquivo, e cada um tem duração máxima. */
const config = JSON.parse(readFileSync(join(__dirname, '..', '..', '..', 'content', 'audio.json'), 'utf-8'));

describe('catálogo de sons (AU8)', () => {
  it('são 13 eventos, S01 a S13', () => {
    expect(EVENTOS_DE_AUDIO).toHaveLength(13);
    expect(EVENTOS_DE_AUDIO[0]).toBe('S01');
    expect(EVENTOS_DE_AUDIO[12]).toBe('S13');
  });

  it('cada efeito resolve a um arquivo em content/audio.json; S09 é família (variante), sem arquivo', () => {
    for (const e of EVENTOS_DE_AUDIO) {
      if (e === 'S09') {
        expect(config.eventos.S09.variante).toBe('conquistas');
        expect(() => idDoEvento(config, e)).toThrow(/S09/);
        continue;
      }
      expect(idDoEvento(config, e), e).toMatch(/^sfx_s\d\d_/);
    }
  });

  it('as cinco conquistas têm jingle, e cada chave corresponde a uma variante J01 a J05 (ADR-008 5.1)', () => {
    expect(Object.keys(JINGLE_DE_CONQUISTA)).toHaveLength(5);
    for (const [chave, v] of Object.entries(JINGLE_DE_CONQUISTA)) expect(config.conquistas[chave].id, chave).toMatch(new RegExp(`^${v.prefixo}_`));
  });

  it('cada evento tem duração máxima da tabela do ADR-008', () => {
    expect(Object.keys(DURACAO_MAXIMA_S)).toHaveLength(12);
    expect(DURACAO_MAXIMA_S.S10).toBe(0.2);
  });

  it('ganho em dB só atenua (0 dB é 1; −6 dB é cerca de 0,5)', () => {
    expect(ganhoLinear(0)).toBe(1);
    expect(ganhoLinear(-6)).toBeCloseTo(0.501, 2);
  });
});
