import { describe, expect, it } from 'vitest';
import { carregarConteudoReal } from '../helpers/conteudoReal';
import { validarNick } from '../../src/application/content/validarNick';
import { entradaComMapa, entradaComMissao, entradaComTextos } from '../helpers/fixturesNick';
import { validarConteudo } from '../../src/application/content/validarConteudo';
import type { Conteudo } from '../../src/application/usecases/CarregarConteudo';

/** Códigos N do resultado, sem repetição, na ordem. */
const codigos = (erros: string[]) => [...new Set(erros.filter((e) => /^N\d{3} /.test(e)).map((e) => e.slice(0, 4)))];

let c: Conteudo;
const carregar = async () => {
  if (!c) c = await carregarConteudoReal();
  return c;
};

describe('validarNick sobre o conteúdo real (ADR-005 seção 2.6)', () => {
  it('o conteúdo real, com os tiles da Arte, não tem erro N001 a N014', async () => {
    const x = await carregar();
    expect(validarNick({ todos: x.todosOsMapas, missoes: x.missoes, textos: x.textos, perfil: x.perfil })).toEqual([]);
  });

  it('o conteúdo real passa em validarConteudo (sem N e sem erro novo)', async () => {
    const x = await carregar();
    const erros = validarConteudo({ manifesto: x.manifesto, todos: x.todosOsMapas, missoes: x.missoes, textos: x.textos, perfil: x.perfil });
    expect(erros).toEqual([]);
  });
});

/**
 * Uma fixture por código: cada uma quebra só a regra do código (ADR-005 seção 2.6). `esperado` é o único código que
 * pode aparecer. Os tiles foram escolhidos no conteúdo real pela varredura de N004 a N009 (ver relatório).
 */
describe('uma fixture por código N001 a N014 (falha só nele)', () => {
  const casos: [string, () => Promise<string[]>][] = [
    ['N001', async () => validarNick(entradaComMissao(await carregar(), 'parte1', (m) => { m.nick.dorme.x = null; }))],
    ['N002', async () => validarNick(entradaComMissao(await carregar(), 'parte2', (m) => { m.nick.dorme = { mapa: 'suite_casal', x: 8, y: 5, direcao: 'baixo' }; }))],
    ['N003', async () => validarNick(entradaComMissao(await carregar(), 'marco1', (m) => { m.nick.dorme = { mapa: 'hall', x: 3, y: 2, direcao: 'baixo' }; }))],
    ['N004', async () => validarNick(entradaComMissao(await carregar(), 'parte1', (m) => { m.nick.dorme = { mapa: 'sala', x: 2, y: 0, direcao: 'baixo' }; }))],
    ['N005', async () => validarNick(entradaComMissao(await carregar(), 'parte1', (m) => { m.nick.dorme = { mapa: 'sala', x: 5, y: 3, direcao: 'baixo' }; }))],
    // Com a pergunta 31 respondida, a linha 9 da Sala está bloqueada: a fixture libera (0, 9) e (1, 9) só na cópia.
    ['N006', async () => {
      const x = await carregar();
      const e = entradaComMapa(x, 'sala', (mp) => { mp.colisao[9][0] = false; mp.colisao[9][1] = false; });
      return validarNick({ ...e, missoes: entradaComMissao(x, 'parte1', (m) => { m.nick.dorme = { mapa: 'sala', x: 0, y: 9, direcao: 'baixo' }; }).missoes });
    }],
    ['N007', async () => validarNick(entradaComMissao(await carregar(), 'parte1', (m) => { m.nick.dorme = { mapa: 'sala', x: 2, y: 4, direcao: 'baixo' }; }))],
    // N008 (ADR-006 seção 6): `depois` foi removido; a fixture o devolve à parte 3 e a validação acusa.
    ['N008', async () => validarNick(entradaComMissao(await carregar(), 'parte3', (m) => { m.nick.depois = { mapa: 'sala', x: 8, y: 5, direcao: 'baixo' }; }))],
    ['N009', async () => validarNick(entradaComMissao(await carregar(), 'parte2', (m) => { m.nick.dorme = { mapa: 'cozinha', x: 2, y: 1, direcao: 'baixo' }; }))],
    ['N010', async () => validarNick(entradaComMissao(await carregar(), 'parte2', (m) => { m.nick.alvo = 'suite_casal'; }))],
    ['N011', async () => validarNick(entradaComMissao(await carregar(), 'parte3', (m) => { m.nick.alvo = 'sala'; }))],
    // N012 com a fixture do Escritório sem portas: a caixa de enfeite fica sem rota até a Sala, e o N009 da fase enfeites
    // acusa isso. Mesma falha vista de dois ângulos (ADR-006 seção 9); o caso abaixo confere os dois códigos.
    ['N012', async () => validarNick(entradaComMapa(await carregar(), 'escritorio', (mp) => { mp.objetos = mp.objetos.filter((o) => o.tipo !== 'porta'); }))],
    ['N013', async () => validarNick(entradaComTextos(await carregar(), (d) => { delete d['dica.parte1.acordado']; }))],
    ['N014', async () => validarNick(entradaComMissao(await carregar(), 'parte2', (m) => { delete m.dica.parte2.acordado; }))],
  ];

  // Exceção documentada: a fixture de N012 também corta a rota da caixa de enfeite (N009 da fase enfeites), consequência
  // da mesma fixture. Os dois códigos são os únicos esperados para ela; os demais falham só no próprio código.
  const ESPERADOS: Record<string, string[]> = { N012: ['N012', 'N009'] };

  for (const [codigo, rodar] of casos) {
    it(`${codigo}: a fixture acusa ${codigo} e nenhum outro código N`, async () => {
      expect(codigos(await rodar())).toEqual(ESPERADOS[codigo] ?? [codigo]);
    });
  }
});

describe('N013: texto longo demais (teto de 84 caracteres, GDD 16.11)', () => {
  it('uma dica com mais de 84 caracteres é N013', async () => {
    const x = await carregar();
    const erros = validarNick(entradaComTextos(x, (d) => { d['dica.parte1.acordado'] = ['x'.repeat(50), 'y'.repeat(50)]; }));
    expect(codigos(erros)).toEqual(['N013']);
  });
});
