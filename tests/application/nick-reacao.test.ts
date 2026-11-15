import { describe, expect, it } from 'vitest';
import { Nick } from '../../src/domain/nick/Nick';
import { tile } from '../../src/domain/shared/Tile';
import { reacaoDoNickNaConquista } from '../../src/application/mundo/nick/reacaoConquista';

/** GDD 16.7 e N8: na chegada com conquista, Nick acordado faz "feliz" e "Au!"; dormindo não reage. */
describe('reação do Nick à conquista (GDD 16.7)', () => {
  it('acordado: feliz e Au! uma vez', () => {
    const n = Nick.dormindoEm(tile('sala', 8, 5), 'baixo');
    n.acordar(tile('sala', 7, 5));
    expect(reacaoDoNickNaConquista(n)).toBe('feliz-e-au');
  });

  it('dormindo: nenhuma reação (a fumacinha é a única animação)', () => {
    const n = Nick.dormindoEm(tile('sala', 8, 5), 'baixo');
    expect(reacaoDoNickNaConquista(n)).toBe('nenhuma');
  });
});
