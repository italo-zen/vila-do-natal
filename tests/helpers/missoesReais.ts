import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { interpretarMissao } from '../../src/application/content/Missao';
import type { MissaoCarregada } from '../../src/application/mundo/missoes';
import { Nick } from '../../src/domain/nick/Nick';
import { tile } from '../../src/domain/shared/Tile';

/** Missões lidas de content/ (síncrono, para testes que não são async). Mesma forma que CarregarConteudo devolve. */
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const lerJson = (c: string) => JSON.parse(readFileSync(join(RAIZ, 'content', c), 'utf-8'));

export function missoesReais(): MissaoCarregada[] {
  const manifesto = lerJson('manifest.json');
  return manifesto.missions.map((d: { id: string; file: string; requires: string[]; maps: string[] }) => ({
    id: d.id,
    requires: [...d.requires],
    maps: [...d.maps],
    missao: interpretarMissao(lerJson(d.file)),
  }));
}

/** Nick no começo da partida: dormindo na Sala, no tile de `marco1.nick.dorme` (ADR-005 seção 3.7). */
export function nickInicial(): Nick {
  return Nick.dormindoEm(tile('sala', 8, 5), 'baixo');
}
