import { describe, expect, it } from 'vitest';
import { carregarConteudoReal } from '../helpers/conteudoReal';
import { candidatosDePeca } from '../../src/application/plano/candidatos';
import { candidatosDeNickDaRegra } from '../../src/application/plano/candidatosDaRegra';

describe('candidatos do sorteio (GDD 21.16.1 e 21.16.4)', async () => {
  const c = await carregarConteudoReal();
  const L = c.perfil.sala.linhas;
  const lista = (id: string, comodo?: string) => {
    const area = c.sorteio.pecas.areas.find((a) => a.id === id)!;
    const co = area.comodos.find((q) => q.id === (comodo ?? id))!;
    return candidatosDePeca(c.todosOsMapas.get(co.mapa)!, L, co.retangulo, area.passagem).map((t) => [t.x, t.y]);
  };
  it('peças e caixa: 24 tiles (os 22 de 21.16.1 mais 2 no Escritório sem a caixa fixa)', () => {
    expect(lista('cozinha', 'cozinha')).toEqual([[2, 0], [3, 0], [1, 1]]);
    expect(lista('cozinha', 'lavanderia')).toEqual([[1, 3], [2, 3], [5, 3], [1, 4]]); // mesmos 4 tiles do GDD, em ordem y, x
    expect(lista('quarto')).toEqual([[2, 0], [3, 0], [2, 1], [1, 2], [2, 2], [3, 2], [2, 3]]);
    // Com a caixa de enfeite fora do mapa (sorteada, GDD 21.16.12), o Escritório ganha (5, 1) e (6, 1): 4 tiles, não 2.
    expect(lista('escritorio')).toEqual([[4, 1], [5, 1], [6, 1], [4, 2]]);
    expect(lista('quarto_casal')).toEqual([[0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3]]);
  });
  it('Nick das luzes na Sala: 7 tiles (Chebyshev 2 ou mais da chegada, dentro do círculo de luz)', () => {
    const r = c.sorteio.nick.marco1;
    const t = candidatosDeNickDaRegra(c.todosOsMapas, c.missoes, 'marco1', r, c.perfil).map((q) => [q.x, q.y]);
    console.log(JSON.stringify(t));
    expect(t.sort()).toEqual([[1, 8], [6, 7], [2, 6], [3, 6], [4, 6], [5, 6], [4, 5]].sort());
  });
});
