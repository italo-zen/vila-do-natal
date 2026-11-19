import { expect, it } from 'vitest';
import { descreverComConteudoNovo } from '../helpers/conteudoNovo';
import { carregarConteudoReal } from '../helpers/conteudoReal';
import { validarNick } from '../../src/application/content/validarNick';
import { entradaComMissao, entradaComTextos } from '../helpers/fixturesNick';
import { validarConteudo } from '../../src/application/content/validarConteudo';
import type { Conteudo } from '../../src/application/usecases/CarregarConteudo';

/** Códigos N do resultado, sem repetição, na ordem. */
const codigos = (erros: string[]) => [...new Set(erros.filter((e) => /^N\d{3} /.test(e)).map((e) => e.slice(0, 4)))];

let c: Conteudo;
const carregar = async () => {
  if (!c) c = await carregarConteudoReal();
  return c;
};

descreverComConteudoNovo('validarNick sobre o conteúdo real (ADR-005 seção 2.6)', () => {
  it('o conteúdo real, com os tiles da Arte, não tem erro N001 a N015', async () => {
    const x = await carregar();
    expect(validarNick({ todos: x.todosOsMapas, missoes: x.missoes, textos: x.textos, perfil: x.perfil })).toEqual([]);
  });

  it('o conteúdo real passa em validarConteudo (sem N e sem erro novo)', async () => {
    const x = await carregar();
    const erros = validarConteudo({ manifesto: x.manifesto, todos: x.todosOsMapas, missoes: x.missoes, textos: x.textos, perfil: x.perfil, sorteio: x.sorteio });
    expect(erros).toEqual([]);
  });
});

/**
 * Uma fixture por código (ADR-005 seção 2.6, como mudou no ADR-013): N001 (dica), N008, N013, N014 e N015 seguem em `validarNick`.
 * N002 a N007, N009 a N012 passaram ao sorteio: S005 e S007 (plano-validacao.test.ts) e a enumeração (plano-enumeracao.test.ts).
 */
descreverComConteudoNovo('uma fixture por código N001, N013, N014 e N015 (falha só nele)', () => {
  const casos: [string, () => Promise<string[]>][] = [
    ['N001', async () => validarNick(entradaComMissao(await carregar(), 'parte1', (m) => { delete m.dica; }))],
    ['N013', async () => validarNick(entradaComTextos(await carregar(), (d) => { delete d['dica.parte1.acordado']; }))],
    ['N014', async () => validarNick(entradaComMissao(await carregar(), 'parte2', (m) => { delete m.dica.parte2.acordado; }))],
    // N015 (ADR-013): `nick.dorme` e `nick.alvo` não existem mais nas missões.
    ['N015', async () => validarNick(entradaComMissao(await carregar(), 'parte1', (m) => { m.nick = { dorme: { mapa: 'sala', x: 1, y: 1, direcao: 'baixo' }, alvo: 'sala' }; }))],
  ];
  for (const [codigo, rodar] of casos) {
    it(`${codigo}: a fixture acusa ${codigo} e nenhum outro código N`, async () => {
      expect(codigos(await rodar())).toEqual([codigo]);
    });
  }
});

descreverComConteudoNovo('N013: texto longo demais (teto de 84 caracteres, GDD 16.11)', () => {
  it('uma dica com mais de 84 caracteres é N013', async () => {
    const x = await carregar();
    const erros = validarNick(entradaComTextos(x, (d) => { d['dica.parte1.acordado'] = ['x'.repeat(50), 'y'.repeat(50)]; }));
    expect(codigos(erros)).toEqual(['N013']);
  });
});
