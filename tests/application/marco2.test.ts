import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CarregarConteudo, ConteudoInvalidoError } from '../../src/application/usecases/CarregarConteudo';
import { ContentSourceDeArquivos } from '../../src/infrastructure/content/ContentSourceDeArquivos';
import { calcularRotaDeConducao } from '../../src/application/mundo/conducao';
import { fatorDaConducao } from '../../src/domain/progresso/Conducao';
import { missaoAtiva, conducaoDaFase } from '../../src/application/mundo/missoes';
import { CONTEXTO_PADRAO, bloqueiosDaSubarea, resolverPorta } from '../../src/application/mundo/subarea';
import {
  chaveDaChegada,
  chaveDoAviso,
  chaveDoEstadoDaArvore,
  contextoDaPartida,
  estadoDaArvore,
  estadoDaPeca,
  situacaoDaFase,
} from '../../src/application/mundo/pecas';
import { haloDaArvoreVisivel } from '../../src/application/mundo/chegadaDaArvore';
import { interpretarTextos } from '../../src/application/content/Textos';
import type { SessaoDeJogo } from '../../src/application/SessaoDeJogo';
import type { Fase } from '../../src/domain/progresso/Fase';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const CONTENT = join(RAIZ, 'content');

function lerConteudo(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const varrer = (dir: string) => {
    for (const nome of readdirSync(dir)) {
      const cam = join(dir, nome);
      if (statSync(cam).isDirectory()) varrer(cam);
      else if (nome.endsWith('.json')) out[relative(CONTENT, cam).split('\\').join('/')] = JSON.parse(readFileSync(cam, 'utf-8'));
    }
  };
  varrer(CONTENT);
  return out;
}

const copia = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const carregar = (arquivos: Record<string, unknown>) => new CarregarConteudo(new ContentSourceDeArquivos(arquivos)).executar();
async function errosDe(arquivos: Record<string, unknown>): Promise<string[]> {
  try {
    await carregar(arquivos);
    return [];
  } catch (e) {
    return e instanceof ConteudoInvalidoError ? e.erros : [String(e)];
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Solto = Record<string, any>;
/** Altera uma subárea do conteúdo real (cópia). */
function alterarSubarea(id: string, fn: (s: Solto) => void): Record<string, unknown> {
  const arquivos = lerConteudo();
  const s = copia(arquivos[`maps/casa-real/${id}.json`]) as Solto;
  fn(s);
  arquivos[`maps/casa-real/${id}.json`] = s;
  return arquivos;
}
/** Altera a lista de objetos de uma subárea (cópia). */
function alterarObjetos(id: string, fn: (objetos: Solto[], s: Solto) => void): Record<string, unknown> {
  return alterarSubarea(id, (s) => fn(s.objetos as Solto[], s));
}

/** Quebra um texto em linhas de até `largura` caracteres, por palavras (medida do limite de 15.5 e 15.6). */
function linhasDe(texto: string, largura: number): number {
  let linhas = 1;
  let atual = 0;
  for (const palavra of texto.split(/\s+/)) {
    const tam = palavra.length;
    if (atual === 0) atual = tam;
    else if (atual + 1 + tam <= largura) atual += 1 + tam;
    else {
      linhas += 1;
      atual = tam;
    }
  }
  return linhas;
}

describe('Marco 2: textos exatos (GDD 15.8; backlog 051, critério 3)', () => {
  const t = interpretarTextos(lerConteudo()['texts/pt-BR.json']);
  const esperado: Record<string, string | string[]> = {
    'conquista.parte1': 'Parabéns, você conseguiu encontrar a primeira parte da árvore de Natal.',
    'conquista.parte2': 'Parabéns, você conseguiu encontrar a segunda parte da árvore de Natal.',
    'conquista.parte3': 'Parabéns, você conseguiu encontrar a última parte da árvore de Natal!',
    'arvore.estado.1': 'Ela já tem 1 parte. Faltam 2 partes.',
    'arvore.estado.2': 'Ela já tem 2 partes. Falta 1 parte.',
    'arvore.estado.3': 'A árvore está montada! Que linda!',
    'arvore.chegada.1': 'Agora a árvore tem 1 parte. Faltam 2 partes!',
    'arvore.chegada.2': 'Agora a árvore tem 2 partes. Falta 1 parte!',
    'arvore.chegada.3': 'A árvore está montada! Que linda!',
    'aviso.peca2.antes1': ['Ainda não!', 'Essa é a parte do meio. Encontre a base antes.'],
    'aviso.peca3.antes1': ['Ainda não!', 'Essa é a parte de cima. Encontre as outras antes.'],
    'aviso.peca3.antes2': ['Ainda não!', 'Essa é a parte de cima. Encontre a do meio antes.'],
  };
  for (const [chave, texto] of Object.entries(esperado)) {
    it(`${chave} tem o texto do GDD 15.8, página por página`, () => {
      expect(t.paginas(chave)).toEqual(Array.isArray(texto) ? texto : [texto]);
    });
  }

  it('cada página de diálogo cabe em 2 linhas de 28 caracteres, e a conquista em 3 (GDD 15.5, 15.6.5)', () => {
    for (const chave of Object.keys(esperado)) {
      for (const pagina of t.paginas(chave)) {
        const limite = chave.startsWith('conquista.') ? 3 : 2;
        expect(linhasDe(pagina, 28), `${chave}: "${pagina}"`).toBeLessThanOrEqual(limite);
      }
    }
  });

  it('nenhum texto do jogo cita nome de pessoa da família (backlog 034)', () => {
    const todo = JSON.stringify(lerConteudo()['texts/pt-BR.json']);
    expect(todo).not.toMatch(/LoLô|BiBi|DanDan|TuTu/);
  });
});

describe('Marco 2: missões e manifesto (ADR-002 seção 2.2; backlog 051)', () => {
  it('manifesto: marco1, parte1, parte2 e parte3 com requires encadeado e maps da opção B', async () => {
    const c = await carregar(lerConteudo());
    expect(c.missoes.map((m) => m.id)).toEqual(['marco1', 'parte1', 'parte2', 'parte3']);
    expect(c.missoes.map((m) => m.requires)).toEqual([[], ['marco1'], ['parte1'], ['parte2']]);
    expect(c.missoes[0].maps).toEqual(['hall', 'sala', 'cozinha']);
    for (const m of c.missoes.slice(1)) {
      // Quarto (P2) e Escritório (P3) abrem depois das luzes; a Suíte segue fechada (pergunta 30; ADR-004 seção 9.1).
      expect(m.maps, m.id).toEqual(['hall', 'sala', 'cozinha', 'quarto', 'escritorio']);
    }
  });

  it('cada parte tem conducao.parteN (Sala, (3, 7), baixo) e conquistas.parteN (chave de texto existente)', async () => {
    const c = await carregar(lerConteudo());
    for (const n of [1, 2, 3]) {
      const m = c.missoes.find((x) => x.id === `parte${n}`)!.missao;
      expect(m.conducao[`parte${n}`]).toEqual({ mapa: 'sala', x: 3, y: 7, direcao: 'baixo' });
      expect(m.conquistas[`parte${n}`]).toBe(`conquista.parte${n}`);
      expect(m.inicio).toBeUndefined();
    }
    expect(conducaoDaFase(c.missoes, 'parte2' as Fase)).toEqual({ mapa: 'sala', x: 3, y: 7, direcao: 'baixo' });
  });

  it('missão ativa: marco1, depois parte1, parte2 e parte3; depois de tudo, a última (jogo livre, GDD 15.6.8)', async () => {
    const c = await carregar(lerConteudo());
    const ativa = (concluidas: Fase[]) => missaoAtiva(c.missoes, (f) => concluidas.includes(f)).id;
    expect(ativa([])).toBe('marco1');
    expect(ativa(['porta', 'introducao'])).toBe('marco1');
    expect(ativa(['luzes'])).toBe('parte1');
    expect(ativa(['luzes', 'parte1'])).toBe('parte2');
    expect(ativa(['luzes', 'parte1', 'parte2'])).toBe('parte3');
    expect(ativa(['luzes', 'parte1', 'parte2', 'parte3'])).toBe('parte3');
  });

  it('o contexto da partida abre Quarto (P2) e Escritório (P3) só depois das luzes, e nunca a Suíte nem banheiros', async () => {
    const c = await carregar(lerConteudo());
    const antes = contextoDaPartida(c.missoes, () => false);
    const depois = contextoDaPartida(c.missoes, (f) => f === 'luzes');
    expect(antes.areaAberta('escritorio')).toBe(false);
    expect(antes.areaAberta('quarto')).toBe(false);
    expect(depois.areaAberta('escritorio')).toBe(true);
    expect(depois.areaAberta('quarto')).toBe(true);
    for (const ctx of [antes, depois]) {
      expect(ctx.areaAberta('suite_casal')).toBe(false);
      expect(ctx.areaAberta('banheiro_casal')).toBe(false);
    }
  });
});

describe('Marco 2: peças e árvore (GDD 15.2 a 15.4; ADR-004 seção 6)', () => {
  const nenhuma = () => false;
  const ate = (fases: Fase[]) => (f: Fase) => fases.includes(f);

  it('estado da peça segue a ordem: 1 visível com as luzes; 2 com a 1 encaixada; 3 com a 2 encaixada', () => {
    expect(estadoDaPeca(1, nenhuma)).toBe('escondida');
    expect(estadoDaPeca(1, ate(['luzes']))).toBe('visivel');
    expect(estadoDaPeca(2, ate(['luzes']))).toBe('escondida');
    expect(estadoDaPeca(2, ate(['luzes', 'parte1']))).toBe('visivel');
    expect(estadoDaPeca(3, ate(['luzes', 'parte1']))).toBe('escondida');
    expect(estadoDaPeca(3, ate(['luzes', 'parte1', 'parte2']))).toBe('visivel');
    expect(estadoDaPeca(1, ate(['luzes', 'parte1']))).toBe('encaixada');
  });

  it('aviso "ainda não": peça 2 e peça 3 escolhem a chave pela menor parte ainda não encaixada; peça 1 nunca tem aviso', () => {
    expect(chaveDoAviso(1, nenhuma)).toBeUndefined();
    expect(chaveDoAviso(2, nenhuma)).toBe('aviso.peca2.antes1');
    expect(chaveDoAviso(3, nenhuma)).toBe('aviso.peca3.antes1');
    expect(chaveDoAviso(3, ate(['parte1']))).toBe('aviso.peca3.antes2');
  });

  it('estado da árvore: 0 a 3 pelas peças encaixadas; texto de exame e de chegada por estado (GDD 15.4 e 15.8)', () => {
    expect(estadoDaArvore(nenhuma)).toBe(0);
    expect(estadoDaArvore(ate(['parte1']))).toBe(1);
    expect(estadoDaArvore(ate(['parte1', 'parte2']))).toBe(2);
    expect(estadoDaArvore(ate(['parte1', 'parte2', 'parte3']))).toBe(3);
    expect(chaveDoEstadoDaArvore(0)).toBe('arvore.desmontada');
    expect(chaveDoEstadoDaArvore(2)).toBe('arvore.estado.2');
    expect(chaveDaChegada(3)).toBe('arvore.chegada.3');
  });

  it('halo do pisca só com a árvore desmontada: a primeira peça encaixada apaga o halo (GDD 15.4)', () => {
    const sessao = (fases: Fase[], visto = false) =>
      ({ luzesAcesas: () => fases.includes('luzes'), foiVisto: () => visto, faseConcluida: (f: Fase) => fases.includes(f) }) as unknown as SessaoDeJogo;
    expect(haloDaArvoreVisivel(sessao(['luzes']))).toBe(true);
    expect(haloDaArvoreVisivel(sessao(['luzes', 'parte1']))).toBe(false);
    expect(haloDaArvoreVisivel(sessao(['luzes'], true))).toBe(false);
  });

  it('peça visível bloqueia o tile; escondida e encaixada são chão livre (teste de colisão, backlog 052 critério 1)', async () => {
    const c = await carregar(lerConteudo());
    const sala = c.todosOsMapas.get('sala')!;
    const cozinha = c.todosOsMapas.get('cozinha')!;
    // Antes das luzes: a peça 1 é escondida, com o tile livre.
    expect(bloqueiosDaSubarea(sala, nenhuma, contextoDaPartida(c.missoes, nenhuma))[4][1]).toBe(false);
    // Com as luzes: a peça 1 é visível, bloqueada.
    expect(bloqueiosDaSubarea(sala, ate(['luzes']), contextoDaPartida(c.missoes, ate(['luzes'])))[4][1]).toBe(true);
    // Peça 2 e peça 3 escondidas: livres (o sobrinho anda sobre elas).
    const todas = ate(['luzes']);
    const grade = bloqueiosDaSubarea(cozinha, todas, contextoDaPartida(c.missoes, todas));
    expect(grade[1][4]).toBe(false);
    expect(grade[5][3]).toBe(false);
  });

  it('par com destino fechado age como porta fechada: bloqueia e não tem transição antes das luzes (ADR-004 seção 3)', async () => {
    const c = await carregar(lerConteudo());
    const sala = c.todosOsMapas.get('sala')!;
    const p3 = sala.objetos.find((o) => o.tipo === 'porta' && o.dados.id === 'P3')!;
    const antes = contextoDaPartida(c.missoes, nenhuma);
    expect(resolverPorta(p3, nenhuma, antes)).toEqual({ tipo: 'fechada' });
    expect(bloqueiosDaSubarea(sala, nenhuma, antes)[p3.y][p3.x]).toBe(true);
    const depois = contextoDaPartida(c.missoes, ate(['luzes']));
    expect(resolverPorta(p3, ate(['luzes']), depois)).toEqual({ tipo: 'entrar', mapa: 'escritorio', spawn: 'P3' });
    expect(bloqueiosDaSubarea(sala, ate(['luzes']), depois)[p3.y][p3.x]).toBe(false);
    expect(CONTEXTO_PADRAO.areaAberta('qualquer')).toBe(true);
  });

  it('peças do conteúdo real: uma de cada ordem, com os tiles do GDD 15.2.2 (Sala (1,4), Cozinha (4,1), Lavanderia (3,5))', async () => {
    const c = await carregar(lerConteudo());
    const pecas = [...c.todosOsMapas.values()].flatMap((m) => m.objetos.filter((o) => o.tipo === 'peca').map((o) => ({ m: m.id, o })));
    const porOrdem = Object.fromEntries(pecas.map((p) => [p.o.dados.ordem, { m: p.m, x: p.o.x, y: p.o.y, estado: p.o.dados.estadoInicial }]));
    expect(porOrdem).toEqual({
      1: { m: 'sala', x: 1, y: 4, estado: 'visivel' },
      2: { m: 'cozinha', x: 4, y: 1, estado: 'escondida' },
      3: { m: 'cozinha', x: 3, y: 5, estado: 'escondida' },
    });
  });
});

describe('Marco 2: condução entre peças (GDD 15.3.5 e 15.6.1; backlog 053, critério 2)', () => {
  /** Rota de uma peça, a partir do vizinho livre dela, como a condução faz (ADR-004 seção 11.2). */
  async function rotaDaPeca(ordem: number) {
    const c = await carregar(lerConteudo());
    const fase = `parte${ordem}` as Fase;
    const peca = [...c.todosOsMapas.values()].flatMap((m) => m.objetos.filter((o) => o.tipo === 'peca').map((o) => ({ m: m.id, o }))).find((p) => Number(p.o.dados.ordem) === ordem)!;
    const { concluida, ctx } = situacaoDaFase(c.missoes, fase);
    const destino = conducaoDaFase(c.missoes, fase)!;
    const mapa = c.todosOsMapas.get(peca.m)!;
    // Partida: só vizinhos livres de piso (ADR-004 seção 11.1, a condução começa do tile em frente à peça).
    const vizinhos = [
      { x: peca.o.x + 1, y: peca.o.y },
      { x: peca.o.x - 1, y: peca.o.y },
      { x: peca.o.x, y: peca.o.y + 1 },
      { x: peca.o.x, y: peca.o.y - 1 },
    ].filter((v) => mapa.chao[v.y]?.[v.x] > 0 && !mapa.colisao[v.y][v.x]);
    const rotas = vizinhos
      .map((v) => calcularRotaDeConducao(c.todosOsMapas, { mapa: peca.m, ...v }, destino, concluida, ctx))
      .filter((r): r is NonNullable<typeof r> => r !== null);
    return { rotas, melhor: rotas.reduce((a, b) => (b.passos < a.passos ? b : a)), c };
  }

  it('parte 1 (Sala): 4 a 6 passos, sem passagem, velocidade normal', async () => {
    const { melhor } = await rotaDaPeca(1);
    expect(melhor.passos).toBeGreaterThanOrEqual(4);
    expect(melhor.passos).toBeLessThanOrEqual(6);
    expect(fatorDaConducao(melhor.passos)).toBe(1);
  });

  // Medido com a regra do ADR-004 seção 11.2 (a passagem P7 custa 3 passos: vão, gatilho e chegada). A estimativa do
  // GDD 15.3.5 (12 a 13 e 17 a 18) não contava o custo da passagem. Em qualquer caso a rota passa de 10: é 2×.
  it('parte 2 (Cozinha): passa pela P7, mais de 10 passos, velocidade 2× (medido 15; estimativa do GDD 15.3.5: 12 a 13)', async () => {
    const { melhor, rotas } = await rotaDaPeca(2);
    expect(rotas.length).toBeGreaterThan(0);
    expect(melhor.nos.some((n) => n.mapa === 'sala' && n.spawn === 'P7')).toBe(true);
    expect(melhor.passos).toBe(15);
    expect(fatorDaConducao(melhor.passos)).toBe(2);
  });

  it('parte 3 (Lavanderia): passa pela P7, 2× (medido 20; estimativa do GDD 15.3.5: 17 a 18)', async () => {
    const { melhor } = await rotaDaPeca(3);
    expect(melhor.nos.some((n) => n.mapa === 'sala' && n.spawn === 'P7')).toBe(true);
    expect(melhor.passos).toBe(20);
    expect(fatorDaConducao(melhor.passos)).toBe(2);
  });

  // Tabela por origem (BUG-M2-03): o A dá-se de um vizinho livre da peça. Cada origem tem o seu número de passos. "passos"
  // é o da regra de jogo (ADR-004 11.2): tiles visitados mais 3 da passagem (vão, gatilho de chegada, spawn). Os tiles
  // visitados (sem contar o gatilho de saída) são o que o QA mede no tile: 12 e 14 para a parte 2; 17 e 19 para a parte 3.
  const TABELA: Record<string, Record<string, number>> = {
    parte1: { '2,4': 4, '1,3': 6, '1,5': 4, '0,4': 6 },
    parte2: { '3,1': 15, '4,2': 17 },
    parte3: { '3,4': 20, '4,5': 22 },
  };
  for (const fase of ['parte1', 'parte2', 'parte3'] as const) {
    it(`tabela de origens da ${fase}: cada origem tem o número de passos da tabela, e o fator 2× é o da regra (> 10 passos)`, async () => {
      const c = await carregar(lerConteudo());
      const ordem = Number(fase.slice(-1));
      const peca = [...c.todosOsMapas.values()].flatMap((m) => m.objetos.filter((o) => o.tipo === 'peca').map((o) => ({ m: m.id, o }))).find((p) => Number(p.o.dados.ordem) === ordem)!;
      const mapa = c.todosOsMapas.get(peca.m)!;
      const { concluida, ctx } = situacaoDaFase(c.missoes, fase);
      const achadas: Record<string, number> = {};
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x = peca.o.x + dx;
        const y = peca.o.y + dy;
        if (!(mapa.chao[y]?.[x] > 0 && !mapa.colisao[y][x])) continue;
        const r = calcularRotaDeConducao(c.todosOsMapas, { mapa: peca.m, x, y }, conducaoDaFase(c.missoes, fase)!, concluida, ctx);
        expect(r, `${fase} de (${x},${y})`).not.toBeNull();
        achadas[`${x},${y}`] = r!.passos;
        expect(fatorDaConducao(r!.passos), `${fase} de (${x},${y}): ${r!.passos} passos`).toBe(r!.passos > 10 ? 2 : 1);
      }
      expect(achadas).toEqual(TABELA[fase]);
    });
  }

  it('condução da parte 2 pega de (4,2) tem rota: a peça que sai do chão não bloqueia o próprio trajeto (backlog 052, critério 5)', async () => {
    const c = await carregar(lerConteudo());
    const { concluida, ctx } = situacaoDaFase(c.missoes, 'parte2');
    const r = calcularRotaDeConducao(c.todosOsMapas, { mapa: 'cozinha', x: 4, y: 2 }, conducaoDaFase(c.missoes, 'parte2')!, concluida, ctx);
    expect(r).not.toBeNull();
    expect(r!.nos.some((n) => n.mapa === 'cozinha' && n.x === 4 && n.y === 1)).toBe(true);
  });

  it('a peça de luzes (1) segue no chão: a condução das luzes não a tira', async () => {
    const c = await carregar(lerConteudo());
    expect(situacaoDaFase(c.missoes, 'luzes').ctx.estadoDaPeca(1)).toBe('visivel');
    expect(situacaoDaFase(c.missoes, 'parte1').ctx.estadoDaPeca(1)).toBe('encaixada');
  });

  it('a rota de uma peça nunca passa pela peça própria nem por tiles bloqueados; termina na Sala (3, 7)', async () => {
    for (const ordem of [1, 2, 3]) {
      const { melhor, c } = await rotaDaPeca(ordem);
      expect(melhor.nos[melhor.nos.length - 1]).toMatchObject({ mapa: 'sala', x: 3, y: 7 });
      for (const n of melhor.nos) {
        const m = c.todosOsMapas.get(n.mapa)!;
        expect(m.colisao[n.y][n.x], `${ordem}: ${n.mapa} (${n.x}, ${n.y})`).toBe(false);
      }
    }
  });
});

describe('Marco 2: validação do conteúdo (ADR-004 seção 8, itens 12 e 15 a 19; backlog 056)', () => {
  it('o conteúdo real do Marco 2 é válido (zero erros)', async () => {
    expect(await errosDe(lerConteudo())).toEqual([]);
  });

  it('peça sem vizinho livre é erro (item 16)', async () => {
    // Fecha os 3 vizinhos da peça 1 (1, 4) da Sala: (0,4), (2,4), (1,3) e (1,5).
    const arquivos = alterarSubarea('sala', (s) => {
      for (const [x, y] of [[0, 4], [2, 4], [1, 3], [1, 5]]) s.colisao[y * s.largura + x] = 1;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/peca1|peça 1|sem vizinho livre/);
  });

  it('peça em tile bloqueado é erro (item 16)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      s.colisao[4 * s.largura + 1] = 1;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/piso livre/);
  });

  it('peça fora de ordem (ordem 2 repetida) e peça faltando são erro (item 15)', async () => {
    const repetida = alterarObjetos('cozinha', (objs) => {
      const p = objs.find((o) => o.tipo === 'peca' && o.ordem === 3)!;
      p.ordem = 2;
      p.id = 'peca2';
    });
    expect((await errosDe(repetida)).join(' ')).toMatch(/peça 2 aparece 2 vezes|peça 3 não existe/);
  });

  it('estado inicial errado (peça 2 visível) é erro (item 15)', async () => {
    const arquivos = alterarObjetos('cozinha', (objs) => {
      objs.find((o) => o.tipo === 'peca' && o.ordem === 2)!.estadoInicial = 'visivel';
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/peça 2 com estadoInicial "visivel"/);
  });

  it('peça 1 em tile do interruptor ou encostada nele é erro (item 17)', async () => {
    const arquivos = alterarObjetos('sala', (objs) => {
      const p = objs.find((o) => o.tipo === 'peca')!;
      const i = objs.find((o) => o.tipo === 'interruptor')!;
      p.x = i.x - 1;
      p.y = i.y;
    });
    const erros = (await errosDe(arquivos)).join(' ');
    expect(erros).toMatch(/encostada no interruptor|precisa estar em piso livre/);
  });

  it('vão de passagem com 2 tiles (andável) é erro (item 3 e ADR-004 seção 3)', async () => {
    // Abre o vão da P3 na Sala, (9, 2): vira chão andável, e o vão deixa de ser de 1 tile.
    const arquivos = alterarSubarea('sala', (s) => {
      s.chao[2 * s.largura + 9] = 1;
      s.colisao[2 * s.largura + 9] = 0;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/porta P3 \(sala, \(8, 2\)\): saída 'direita' aponta para piso livre \(9, 2\)/);
  });

  it('chegada de passagem em bloqueio é erro (item 5)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      // A chegada da P3 (7, 2) vira bloqueio: a porta deixa de ter chegada livre.
      s.colisao[2 * s.largura + 7] = 1;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/spawn|piso livre/);
  });

  it('interruptor a 3 tiles ou menos da entrada no escuro (P8, (6, 6)) é erro (item 11)', async () => {
    const arquivos = alterarObjetos('sala', (objs) => {
      objs.find((o) => o.tipo === 'interruptor')!.x = 5;
      objs.find((o) => o.tipo === 'interruptor')!.y = 5;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/interruptor em \(5, 5\).*precisa ser mais de 3/);
  });

  it('regra 11 só vale para a entrada no escuro: a chegada da P3 a 2,24 do interruptor não é erro', async () => {
    expect(await errosDe(lerConteudo())).toEqual([]);
  });

  it('porta fechada sem saída é erro (ADR-004 seção 6)', async () => {
    const arquivos = alterarObjetos('sala', (objs) => {
      delete objs.find((o) => o.tipo === 'portaFechada' && o.id === 'P1')!.saida;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/portaFechada P1 em \(6, 2\) sem saída válida/);
  });

  it('aviso "ainda não" sem as duas páginas é erro (item 19)', async () => {
    const arquivos = lerConteudo();
    const textos = copia(arquivos['texts/pt-BR.json']) as Solto;
    textos['aviso.peca3.antes2'] = 'Ainda não!';
    arquivos['texts/pt-BR.json'] = textos;
    expect((await errosDe(arquivos)).join(' ')).toMatch(/aviso\.peca3\.antes2" precisa ter 2 páginas/);
  });

  it('destino da condução da parte 2 sem rota (bloqueado) é erro (item 12)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      // Fecha a entrada da Sala pelo lado de cima e pela esquerda do destino (3, 7): nenhuma rota chega até ele.
      s.colisao[6 * s.largura + 3] = 1;
      s.colisao[7 * s.largura + 2] = 1;
      s.colisao[7 * s.largura + 4] = 1;
      s.colisao[8 * s.largura + 3] = 1;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/conducao\.parte[123]: destino sala \(3, 7\) sem rota/);
  });
});

describe('Marco 2: exame da árvore em cada estado (GDD 15.4; BUG-M2-04)', () => {
  it('estados 0 a 3 têm texto de exame que existe e cabe em 2 linhas; o estado 3 é o texto exato', () => {
    const t = interpretarTextos(lerConteudo()['texts/pt-BR.json']);
    for (const estado of [0, 1, 2, 3]) {
      const chave = chaveDoEstadoDaArvore(estado);
      expect(t.tem(chave), chave).toBe(true);
      // O estado 0 é o texto do Marco 1 (GDD 14.9.3, já aprovado no PT1): o limite de 2 linhas é o do Marco 2.
      if (estado > 0) for (const pagina of t.paginas(chave)) expect(linhasDe(pagina, 28), `${chave}: "${pagina}"`).toBeLessThanOrEqual(2);
    }
    expect(t.paginas(chaveDoEstadoDaArvore(3))).toEqual(['A árvore está montada! Que linda!']);
  });
});

describe('Marco 2: versão e perfil (backlog 057 e 054)', () => {
  it('package.json está em 0.6.0', () => {
    const pkg = JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf-8')) as { version: string };
    expect(pkg.version).toBe('0.6.0');
  });

  it('o perfil HD tem a posição da tela de conquista da peça (telas.conquista.peca e personagemDaPeca)', () => {
    const perfil = lerConteudo()['art-profiles/hd-480x352.json'] as Solto;
    const conquista = perfil.telas.conquista;
    expect(conquista.peca).toEqual({ x: 168, y: 16, escala: 1 });
    expect(conquista.personagemDaPeca).toEqual({ x: 280, y: 40 });
  });
});
