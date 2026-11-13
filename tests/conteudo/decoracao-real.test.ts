import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validarDecoracao, SUBAREAS_DA_DECORACAO, TOTAL_DE_ENFEITES } from '../../src/application/content/decoracao';
import { interpretarSubarea } from '../../src/application/content/interpretarSubarea';
import { tilesProibidosDaSubarea } from '../../src/application/usecases/CarregarConteudo';

/**
 * ADR-010 8.2 (E1 a E9) sobre o conteúdo real: `content/maps/decoracao/<subarea>.json` contra o mapa, a missão `enfeites`,
 * os sprites e os textos da build. Se a Arte ainda não entregou a tabela de uma subárea, o teste avisa (não reprova): a
 * entrega é o item 153, e o modo explorar só mostra enfeites das subáreas que têm tabela.
 */
const RAIZ = join(__dirname, '..', '..');
const ler = (c: string) => JSON.parse(readFileSync(join(RAIZ, 'content', c), 'utf-8'));
const manifesto = ler('manifest.json');
const textos = ler(manifesto.texts[0].file) as Record<string, unknown>;
const sprites = (JSON.parse(readFileSync(join(RAIZ, 'assets', 'hd-480x352', 'sprites.json'), 'utf-8')) as { imagens: { arquivo: string; quadros?: number }[] }).imagens;
const registroDeSprites = Object.fromEntries(sprites.map((i) => [i.arquivo.replace(/\.png$/, ''), { quadros: i.quadros }]));
const missaoEnfeites = manifesto.missions.find((m: { id: string }) => m.id === 'enfeites');

describe('decoração real (ADR-010 8.2)', () => {
  it('a missão enfeites existe e é a final (ADR-006)', () => {
    expect(missaoEnfeites).toBeDefined();
    expect(missaoEnfeites.final).toBe(true);
  });

  const pasta = join(RAIZ, 'content', 'maps', 'decoracao');
  const presentes = existsSync(pasta) ? readdirSync(pasta).filter((n) => n.endsWith('.json')) : [];
  const faltam = SUBAREAS_DA_DECORACAO.filter((s) => !presentes.includes(`${s}.json`));
  if (faltam.length > 0) console.warn(`decoração: sem tabela para ${faltam.join(', ')} (item 153 da Arte). Total esperado: ${TOTAL_DE_ENFEITES}.`);

  for (const arquivo of presentes) {
    it(`${arquivo} passa em E1 a E9`, () => {
      const bruta = JSON.parse(readFileSync(join(pasta, arquivo), 'utf-8'));
      const decl = manifesto.maps.find((m: { id: string }) => m.id === bruta.subarea);
      expect(decl, 'subárea sem entrada no manifesto').toBeDefined();
      const mapa = interpretarSubarea(ler(decl.file), decl);
      const proibidos = tilesProibidosDaSubarea(mapa, ler('art-profiles/hd-480x352.json').sala);
      const erros = validarDecoracao(bruta, {
        subareasDoModo: missaoEnfeites.maps,
        largura: mapa.largura,
        altura: mapa.altura,
        bloqueado: (x, y) => mapa.colisao[y]?.[x] === true,
        proibido: (x, y) => proibidos.has(`${x},${y}`),
        sprites: registroDeSprites,
        chavesDeTexto: Object.keys(textos),
      });
      expect(erros).toEqual([]);
    });
  }
});
