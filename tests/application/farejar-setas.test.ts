import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { areasReais } from '../helpers/areasReais';
import { missoesReais } from '../helpers/missoesReais';
import { portaASeguir } from '../../src/application/mundo/nick/portaASeguir';
import { SETA_FAREJAR_DO_LADO } from '../../src/presentation/assets/registro';

/**
 * Farejar do Nick (GDD 16.5): a seta aponta a porta certa, na área certa, para cada missão (peça e fase) e cada área aberta. Fecha o
 * relato do Diretor de que "as setas amarelas não funcionam mais" (1.3.0): a seta de uma porta de lado baixo (como a `quarto-sala`)
 * não tinha imagem e nunca aparecia.
 */
const { todos } = areasReais();
const missoes = missoesReais();
const imagens = new Set((JSON.parse(readFileSync(join(__dirname, '..', '..', 'assets', 'hd-480x352', 'sprites.json'), 'utf-8')) as { imagens: { arquivo: string }[] }).imagens.map((i) => i.arquivo));

describe('seta de farejar por lado da porta', () => {
  it.each(['cima', 'baixo', 'esquerda', 'direita'] as const)('lado %s: a imagem existe (baixo usa a de cima virada)', (lado) => {
    const { chave, flipY } = SETA_FAREJAR_DO_LADO(lado);
    expect(imagens.has(`${chave}.png`), chave).toBe(true);
    expect(flipY).toBe(lado === 'baixo');
  });
});

// O alvo do farejar vem do plano (ADR-013): a Sala nas luzes, a área da peça N na parte N (qualquer das 4 sorteáveis), o Escritório (caixa) nos enfeites.
const AREAS_DE_PECA = (JSON.parse(readFileSync(join(__dirname, '..', '..', 'content', 'sorteio.json'), 'utf-8')) as { pecas: { areas: { id: string }[] } }).pecas.areas.map((a) => a.id);
const ALVOS_POR_MISSAO = (id: string): string[] => (id === 'marco1' ? ['sala'] : id === 'enfeites' ? ['escritorio'] : AREAS_DE_PECA);

describe('farejar: da cada área aberta até o alvo da missão, seguindo as setas', () => {
  for (const m of missoes) for (const alvo of ALVOS_POR_MISSAO(m.id)) {
    it(`missão ${m.id} (alvo ${alvo}): de toda área aberta há uma seta, na porta certa, e seguir as setas chega ao alvo`, () => {
      const aberta = (id: string) => m.maps.includes(id);
      for (const origem of m.maps) {
        if (origem === alvo) {
          expect(portaASeguir(todos, aberta, origem, alvo)).toBeUndefined();
          continue;
        }
        let atual: string = origem;
        const vistos = new Set<string>();
        while (atual !== alvo) {
          expect(vistos.has(atual), `ciclo em ${atual} (origem ${origem})`).toBe(false);
          vistos.add(atual);
          const p = portaASeguir(todos, aberta, atual, alvo);
          expect(p, `${m.id}: sem seta em ${atual} (origem ${origem})`).toBeDefined();
          // A seta fica no tile da porta, na área em que o sobrinho está, com o lado da porta.
          const objeto = todos.get(atual)!.objetos.find((o) => o.tipo === 'porta' && o.dados.id === p!.id)!;
          expect(objeto, `${atual}/${p!.id}`).toBeDefined();
          expect({ mapa: p!.mapa, x: p!.tile.x, y: p!.tile.y, lado: p!.lado }).toEqual({ mapa: atual, x: objeto.x, y: objeto.y, lado: objeto.dados.lado });
          expect(imagens.has(`${SETA_FAREJAR_DO_LADO(p!.lado).chave}.png`)).toBe(true);
          atual = String(objeto.dados.destino);
          expect(m.maps.includes(atual), `a seta leva a uma área fechada (${atual})`).toBe(true);
        }
      }
    });
  }

  it('do Quarto da Oli para a Sala, a seta fica na `quarto-sala` (lado baixo) e é a de cima virada', () => {
    const p = portaASeguir(todos, () => true, 'quarto', 'sala')!;
    expect(p).toMatchObject({ id: 'quarto-sala', lado: 'baixo' });
    expect(SETA_FAREJAR_DO_LADO(p.lado).flipY).toBe(true);
  });
});
