import { describe, expect, it } from 'vitest';
import { carregarConteudoReal } from '../helpers/conteudoReal';
import { validarManifesto } from '../../src/application/content/validarManifesto';
import { validarConteudo } from '../../src/application/content/validarConteudo';
import type { Conteudo } from '../../src/application/usecases/CarregarConteudo';
import { codigosDeRegra, entradaComManifesto, entradaComMissoes, entradaComSubarea, entradaComTextosDoMarco4, manifestoDe, tileParaCaixa } from '../helpers/fixturesTermino';
import { entradaComMissao } from '../helpers/fixturesNick';

/**
 * Término e caixa de enfeite (ADR-006 seção 9, T001 a T009; N007, N008, N011 e N014 da seção 6). Cada fixture quebra uma
 * regra; o resultado deve trazer o código dela. Quando a regra não pode aparecer sozinha, o teste diz qual é o par e por que.
 */

let c: Conteudo;
const carregar = async () => {
  if (!c) c = await carregarConteudoReal();
  return c;
};

/** Validação completa de um conteúdo alterado (validarConteudo inclui N001 a N014). */
const errosDe = (e: Parameters<typeof validarConteudo>[0]) => validarConteudo(e);

describe('conteúdo real (ADR-006 seção 9)', () => {
  it('o conteúdo real passa em validarManifesto e em validarConteudo, sem erro T', async () => {
    const x = await carregar();
    expect(validarManifesto(manifestoDe(x))).toMatchObject({ ok: true });
    const erros = errosDe({ manifesto: x.manifesto, todos: x.todosOsMapas, missoes: x.missoes, textos: x.textos, perfil: x.perfil });
    expect(erros.filter((e) => /^T\d{3}/.test(e))).toEqual([]);
    expect(erros).toEqual([]);
  });

  it('há exatamente uma missão final, e é `enfeites` (T002, teste sobre o conteúdo real)', async () => {
    const x = await carregar();
    const finais = x.missoes.filter((m) => m.final).map((m) => m.id);
    expect(finais).toEqual(['enfeites']);
    expect(x.manifesto.missions.find((m) => m.id === 'enfeites')?.final).toBe(true);
    // `final` fica no manifesto, não no arquivo da missão (ADR-006 seção 1.3).
    expect('final' in (x.missoes.find((m) => m.id === 'enfeites')!.missao as unknown as unknown as Record<string, unknown>)).toBe(false);
  });
});

describe('validarManifesto: missão final (T001 a T004)', () => {
  it('T001: duas missões com final: true (só T001)', async () => {
    const x = await carregar();
    const v = validarManifesto(entradaComManifesto(x, (m) => (m.missions.find((z) => z.id === 'parte3') as unknown as Record<string, unknown>).final = true).manifesto);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(codigosDeRegra(v.erros)).toEqual(['T001']);
  });

  it('T001: final que não é booleano. O valor inválido deixa zero finais, então T002 aparece junto (consequência, não ruído)', async () => {
    const x = await carregar();
    const v = validarManifesto(entradaComManifesto(x, (m) => ((m.missions.find((z) => z.id === 'enfeites') as unknown as Record<string, unknown>).final = 'sim')).manifesto);
    if (v.ok) throw new Error('setup');
    expect(codigosDeRegra(v.erros)).toEqual(['T001', 'T002']);
    expect(v.erros.some((er) => er.startsWith('T001') && er.includes('precisa ser booleano'))).toBe(true);
  });

  it('T002: nenhuma missão final (zero finais; só T002)', async () => {
    const x = await carregar();
    const v = validarManifesto(entradaComManifesto(x, (m) => delete (m.missions.find((z) => z.id === 'enfeites') as unknown as Record<string, unknown>).final).manifesto);
    if (v.ok) throw new Error('setup');
    expect(codigosDeRegra(v.erros)).toEqual(['T002']);
  });

  it('T003: a final é exigida por outra missão. Vem sempre com T004: quem exige a final não pode ser ancestral dela', async () => {
    const x = await carregar();
    // `final` em parte3, que `enfeites` exige.
    const v = validarManifesto(
      entradaComManifesto(x, (m) => {
        (m.missions.find((z) => z.id === 'parte3') as unknown as Record<string, unknown>).final = true;
        delete (m.missions.find((z) => z.id === 'enfeites') as unknown as Record<string, unknown>).final;
      }).manifesto,
    );
    if (v.ok) throw new Error('setup');
    expect(codigosDeRegra(v.erros)).toEqual(['T003', 'T004']);
  });

  it('T004: missão extra, sem requires e sem sucessora, que não é ancestral da final (só T004)', async () => {
    const x = await carregar();
    const v = validarManifesto(
      entradaComManifesto(x, (m) => {
        (m.missions as unknown[]).push({ id: 'extra', file: 'missions/extra.json', maps: [], requires: [] });
      }).manifesto,
    );
    if (v.ok) throw new Error('setup');
    expect(codigosDeRegra(v.erros)).toEqual(['T004']);
  });
});

describe('validarConteudo: término e caixa (T005 a T009)', () => {
  it('T005: a fase da missão final não é a última de FASES (parte3 como final; só T005)', async () => {
    const x = await carregar();
    const e = entradaComMissoes(x, (ms) => {
      for (const m of ms) m.final = m.id === 'parte3';
    });
    expect(codigosDeRegra(errosDe(e))).toEqual(['T005']);
  });

  it('T006: duas caixas de enfeite (só T006; a segunda cai num tile válido, longe do tile de dormir da parte 3)', async () => {
    const x = await carregar();
    const escritorio = x.todosOsMapas.get('escritorio')!;
    const dormeDaParte3 = x.missoes.find((m) => m.id === 'parte3')!.missao.nick!.dorme;
    const tile = tileParaCaixa(escritorio, [{ x: dormeDaParte3.x!, y: dormeDaParte3.y! }]);
    expect(tile, 'o Escritório tem um tile válido para a segunda caixa').toBeDefined();
    const e = entradaComSubarea(x, 'escritorio', (mp) => {
      mp.objetos.push({ tipo: 'enfeite', x: tile!.x, y: tile!.y, dados: { estadoInicial: 'escondida', id: 'enfeite', ordem: 4 } });
    });
    expect(codigosDeRegra(errosDe(e))).toEqual(['T006']);
  });

  it('T006: caixa com estadoInicial visivel (só T006)', async () => {
    const x = await carregar();
    const e = entradaComSubarea(x, 'escritorio', (mp) => {
      const caixa = mp.objetos.find((o) => o.tipo === 'enfeite')!;
      caixa.dados.estadoInicial = 'visivel';
    });
    expect(codigosDeRegra(errosDe(e))).toEqual(['T006']);
  });

  it('T007: caixa com uma chegada (spawn) como vizinho livre (só T007)', async () => {
    const x = await carregar();
    // Fechar vizinhos quebraria a rota da caixa e o tile de dormir (N009, N007). Por isso a caixa vai para (1, 4), onde o
    // único vizinho livre que não é piso comum é o spawn da P3 em (1, 5): o vizinho (2, 4) é livre e a conta de 2 passa.
    const e = entradaComSubarea(x, 'escritorio', (mp) => {
      mp.objetos = mp.objetos.filter((o) => o.tipo !== 'enfeite');
      mp.objetos.push({ tipo: 'enfeite', x: 1, y: 4, dados: { estadoInicial: 'escondida', id: 'enfeite', ordem: 4 } });
    });
    expect(codigosDeRegra(errosDe(e))).toEqual(['T007']);
    expect(errosDe(e).some((er) => er.startsWith('T007') && er.includes('gatilho, vão, chegada'))).toBe(true);
  });

  it('T008: a caixa fora da subárea alvo do farejar. Vem sempre com N011: alvo sem caixa e caixa fora do alvo são a mesma falha', async () => {
    const x = await carregar();
    // O alvo passa a ser o Quarto, que não tem caixa; a caixa segue no Escritório.
    const e = entradaComMissao(x, 'enfeites', (m) => {
      m.nick.alvo = 'quarto';
    });
    const erros = errosDe({ manifesto: x.manifesto, todos: x.todosOsMapas, missoes: e.missoes, textos: x.textos, perfil: x.perfil });
    expect(codigosDeRegra(erros)).toEqual(['N011', 'T008']);
    expect(erros.some((er) => er.startsWith('T008'))).toBe(true);
  });

  it('T009: aviso.enfeite.antes3 com uma página só (só T009)', async () => {
    const x = await carregar();
    const e = entradaComTextosDoMarco4(x, (d) => {
      d['aviso.enfeite.antes3'] = ['Ainda não!'];
    });
    const erros = errosDe({ manifesto: x.manifesto, todos: x.todosOsMapas, missoes: x.missoes, textos: e.textos, perfil: x.perfil });
    expect(codigosDeRegra(erros)).toEqual(['T009']);
  });

  it('T009: uma página com mais linhas que o teto (diálogo: 2 linhas de 28; só T009)', async () => {
    const x = await carregar();
    const e = entradaComTextosDoMarco4(x, (d) => {
      d['arvore.chegada.4'] = ['Agora a árvore está toda enfeitada, com muito carinho de toda a família e de todos os amigos!', 'Feliz Natal!'];
    });
    const erros = errosDe({ manifesto: x.manifesto, todos: x.todosOsMapas, missoes: x.missoes, textos: e.textos, perfil: x.perfil });
    expect(codigosDeRegra(erros)).toEqual(['T009']);
  });
});

describe('validarNick da caixa e do fim (N007, N008, N011, N014; ADR-006 seção 6 e 9)', () => {
  it('N007: o tile de dormir da fase enfeites encosta na caixa (só N007)', async () => {
    const x = await carregar();
    // Dorme em (5, 1), encostado na caixa (5, 2). O outro vizinho livre da caixa, (5, 3), segue na rota: N009 não dispara.
    const e = entradaComMissao(x, 'enfeites', (m) => {
      m.nick.dorme = { mapa: 'escritorio', x: 5, y: 1, direcao: 'baixo' };
    });
    const erros = errosDe({ manifesto: x.manifesto, todos: x.todosOsMapas, missoes: e.missoes, textos: x.textos, perfil: x.perfil });
    expect(codigosDeRegra(erros)).toEqual(['N007']);
    expect(erros.some((er) => er.startsWith('N007') && er.includes('encostado em peça'))).toBe(true);
  });

  it('N011: o alvo da fase enfeites é a Sala, sem caixa. T008 vem junto: a caixa não está no alvo (mesma falha)', async () => {
    const x = await carregar();
    const e = entradaComMissao(x, 'enfeites', (m) => {
      m.nick.alvo = 'sala';
    });
    const erros = errosDe({ manifesto: x.manifesto, todos: x.todosOsMapas, missoes: e.missoes, textos: x.textos, perfil: x.perfil });
    expect(codigosDeRegra(erros)).toEqual(['N011', 'T008']);
    expect(erros).toContain("N011 nick 'enfeites': alvo 'sala' sem caixa de enfeite");
  });

  it('N014: a dica da parte 3 ainda tem `livre` (só N014)', async () => {
    const x = await carregar();
    const e = entradaComMissao(x, 'parte3', (m) => {
      m.dica.livre = 'dica.parte3.dormindo';
    });
    const erros = errosDe({ manifesto: x.manifesto, todos: x.todosOsMapas, missoes: e.missoes, textos: x.textos, perfil: x.perfil });
    expect(codigosDeRegra(erros)).toEqual(['N014']);
  });

  it('N008: `depois` na parte 3 é erro, com a mensagem do ADR-006 seção 6 (só N008)', async () => {
    const x = await carregar();
    const e = entradaComMissao(x, 'parte3', (m) => {
      m.nick.depois = { mapa: 'sala', x: 8, y: 5, direcao: 'baixo' };
    });
    const erros = errosDe({ manifesto: x.manifesto, todos: x.todosOsMapas, missoes: e.missoes, textos: x.textos, perfil: x.perfil });
    expect(codigosDeRegra(erros)).toEqual(['N008']);
    expect(erros).toContain("N008 nick 'parte3': depois foi removido (ADR-006 seção 6)");
  });
});
