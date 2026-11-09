import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CarregarConteudo, ConteudoInvalidoError } from '../../src/application/usecases/CarregarConteudo';
import { ContentSourceDeArquivos } from '../../src/infrastructure/content/ContentSourceDeArquivos';
import { validarManifesto } from '../../src/application/content/validarManifesto';
import { avisosDeConteudo, validarConteudo } from '../../src/application/content/validarConteudo';
import { interpretarSubarea } from '../../src/application/content/interpretarSubarea';
import { interpretarMissao } from '../../src/application/content/Missao';
import { contextoDaPartida } from '../../src/application/mundo/pecas';
import { bloqueiosDaSubarea, resolverPorta } from '../../src/application/mundo/subarea';
import { interpretarTextos } from '../../src/application/content/Textos';
import { validarPerfilDeArte } from '../../src/application/arte/validarPerfilDeArte';
import type { PerfilDeArte } from '../../src/application/arte/PerfilDeArte';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const CONTENT = join(RAIZ, 'content');
const FIXTURES = join(RAIZ, 'tests', 'fixtures');

/** Lê todos os JSON de content/ do disco (mesmo formato que o Vite embute na build). */
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
/** Erros de um conteúdo inválido (ou [] se carregar). */
async function errosDe(arquivos: Record<string, unknown>): Promise<string[]> {
  try {
    await carregar(arquivos);
    return [];
  } catch (e) {
    return e instanceof ConteudoInvalidoError ? e.erros : [String(e)];
  }
}
/** Altera uma subárea do conteúdo real (cópia) e devolve o conjunto de arquivos. */
function alterarSubarea(id: string, fn: (s: Record<string, any>) => void): Record<string, unknown> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const arquivos = lerConteudo();
  const s = copia(arquivos[`maps/casa-real/${id}.json`]) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  fn(s);
  arquivos[`maps/casa-real/${id}.json`] = s;
  return arquivos;
}

/**
 * Acrescenta uma linha de tiles bloqueados embaixo da subárea (a Sala passa a ter 11 linhas, o tamanho da
 * tela). Só para testar a guarda da linha da barra, que é inativa na Sala girada de 10 linhas (ADR-004 seção 8, item 6).
 */
function comOnzeLinhas(s: Record<string, any>): void { // eslint-disable-line @typescript-eslint/no-explicit-any
  s.altura = 11;
  s.chao.push(...Array(s.largura).fill(0));
  s.colisao.push(...Array(s.largura).fill(1));
}

describe('conteúdo real em content/ (ADR-002 schema 2, ADR-004)', () => {
  it('o manifesto real é válido (schema 2, oito subáreas, missão marco1 abre três)', () => {
    const v = validarManifesto(lerConteudo()['manifest.json']);
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.manifesto.maps.map((m) => m.id)).toEqual(['hall', 'sala', 'cozinha', 'escritorio', 'banheiro_escritorio', 'quarto', 'banheiro_casal', 'suite_casal']);
      expect(v.manifesto.missions[0].maps).toEqual(['hall', 'sala', 'cozinha']);
    }
  });

  it('carrega as subáreas abertas e valida as fechadas; início e condução vêm da missão', async () => {
    const c = await carregar(lerConteudo());
    expect(c.perfil.id).toBe('hd-480x352');
    expect(c.missoes[0].maps).toEqual(['hall', 'sala', 'cozinha']);
    expect(c.todosOsMapas.size).toBe(8);
    expect(c.inicio).toEqual({ mapa: 'hall', spawn: 'elevador', paginas: ['intro.1', 'intro.2', 'intro.3', 'intro.4'] });
    expect(c.missao.conducao.luzes).toEqual({ mapa: 'sala', x: 3, y: 7, direcao: 'baixo' });
    expect(c.missao.conquistas.luzes).toBe('conquista.luzes');
  });

  it('a Sala é escura, o Hall claro, e a Sala cabe na tela 15×11 com o tile do perfil', async () => {
    const c = await carregar(lerConteudo());
    expect(c.todosOsMapas.get('sala')!.escuro).toBe(true);
    expect(c.todosOsMapas.get('hall')!.escuro).toBe(false);
    expect(c.todosOsMapas.get('sala')!.tile).toBe(c.perfil.tile);
    expect(c.todosOsMapas.get('sala')!.largura).toBeLessThanOrEqual(c.perfil.sala.colunas);
    expect(c.todosOsMapas.get('sala')!.altura).toBeLessThanOrEqual(c.perfil.sala.linhas);
  });

  it('a Sala girada tem 10 linhas: a última linha da caixa é a linha 9 da tela, bloqueada desde a pergunta 31 (ADR-005 seção 6)', async () => {
    const c = await carregar(lerConteudo());
    const sala = c.todosOsMapas.get('sala')!;
    expect([sala.largura, sala.altura]).toEqual([11, 10]);
    expect(sala.colisao[9][0]).toBe(true);
    expect(sala.chao[9][0]).not.toBe(0);
  });

  it('bilhete do Hall é tile bloqueado com vizinho livre (GDD 14.10.9, item 040): (2, 0) bloqueado; (2, 1) livre', async () => {
    const c = await carregar(lerConteudo());
    const hall = c.todosOsMapas.get('hall')!;
    expect(hall.objetos.find((o) => o.tipo === 'bilhete')).toMatchObject({ x: 2, y: 0 });
    expect(hall.colisao[0][2]).toBe(true);
    expect(hall.colisao[1][2]).toBe(false);
    expect(hall.chao[1][2]).not.toBe(0);
  });

  it('validarConteudo aceita o conteúdo real', async () => {
    const arquivos = lerConteudo();
    const c = await carregar(arquivos);
    const erros = validarConteudo({
      manifesto: c.manifesto,
      todos: c.todosOsMapas,
      missoes: c.missoes,
      textos: c.textos,
      perfil: arquivos['art-profiles/hd-480x352.json'] as PerfilDeArte,
    });
    expect(erros).toEqual([]);
  });

  it('textos das portas fechadas, da cozinha e do bilhete existem', () => {
    const t = interpretarTextos(lerConteudo()['texts/pt-BR.json']);
    expect(t.t('porta.fechada')).toBe('Essa porta está fechada.\nHoje não dá para entrar.');
    expect(t.t('cozinha.pia')).toBe('A pia está limpinha.\nOs copos já estão secos.');
    expect(t.t('cozinha.fogao')).toBe('O fogão está apagado.\nCheiro de bolo de Natal?');
    expect(t.t('cozinha.geladeira')).toBe('A geladeira está cheia.\nCoisas gostosas para a ceia!');
    expect(t.t('bilhete.pista', { nome: 'LoLô' })).toBe('Dica: os 3 últimos dígitos do ano em que LoLô nasceu.');
  });

  it('o perfil HD real é válido', () => {
    expect(validarPerfilDeArte(lerConteudo()['art-profiles/hd-480x352.json'], 'hd-480x352').ok).toBe(true);
  });
});

describe('novo mapa entra só pelo manifesto (ADR-002, item 013)', () => {
  it('uma subárea de teste adicionada ao manifesto carrega sem alterar o motor, mas fica fechada', async () => {
    const arquivos = lerConteudo();
    const manifesto = copia(arquivos['manifest.json']) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    manifesto.maps.push({ id: 'teste', file: 'maps/casa-real/teste.json', tileset: 'tiles_casa' });
    arquivos['manifest.json'] = manifesto;
    arquivos['maps/casa-real/teste.json'] = JSON.parse(readFileSync(join(FIXTURES, 'subarea-de-teste.json'), 'utf-8'));
    const c = await carregar(arquivos);
    expect(c.todosOsMapas.has('teste')).toBe(true);
    expect(c.missoes[0].maps.includes('teste')).toBe(false);
  });

  it('subárea do manifesto que não bate com o id do arquivo é recusada com mensagem clara', async () => {
    const arquivos = lerConteudo();
    const manifesto = copia(arquivos['manifest.json']) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    manifesto.maps.push({ id: 'outro', file: 'maps/casa-real/teste.json', tileset: 'tiles_casa' });
    arquivos['manifest.json'] = manifesto;
    arquivos['maps/casa-real/teste.json'] = JSON.parse(readFileSync(join(FIXTURES, 'subarea-de-teste.json'), 'utf-8'));
    expect((await errosDe(arquivos)).join(' ')).toMatch(/o id do arquivo é "teste", e o manifesto diz "outro"/);
  });
});

describe('validação do manifesto (schema 2)', () => {
  const base = () => copia(lerConteudo()['manifest.json']) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  it('recusa schema 1 com mensagem de não suportado (sem migração, ADR-002 seção 2.1)', () => {
    const m = base();
    m.schemaVersion = 1;
    const v = validarManifesto(m);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.erros.join(' ')).toMatch(/schemaVersion 1 não é mais suportada/);
  });

  it('recusa startMap, que saiu do schema 2', () => {
    const m = base();
    m.startMap = 'casa';
    const v = validarManifesto(m);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.erros.join(' ')).toMatch(/startMap foi removido/);
  });

  it('recusa missão que abre subárea inexistente', () => {
    const m = base();
    m.missions[0].maps.push('fantasma');
    const v = validarManifesto(m);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.erros.join(' ')).toMatch(/fantasma/);
  });

  it('recusa id de subárea duplicado', () => {
    const m = base();
    m.maps.push({ ...m.maps[0] });
    const v = validarManifesto(m);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.erros.join(' ')).toMatch(/duplicado/);
  });

  it('recusa requires que aponta para missão inexistente e manifesto que não é objeto', () => {
    const m = base();
    m.missions[0].requires = ['fantasma'];
    expect(validarManifesto(m).ok).toBe(false);
    expect(validarManifesto([]).ok).toBe(false);
  });
});

describe('regras de validarConteudo (ADR-004 seção 8), com casos negativos sobre o conteúdo real', () => {
  it('porta sem par é erro', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      s.objetos = s.objetos.filter((o: { id?: string; tipo: string }) => !(o.tipo === 'porta' && o.id === 'P8'));
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/Porta P8: 1 gatilho\(s\)/);
  });

  it('par com destino fechado nesta missão é permitido (ADR-004 seção 3): o conteúdo real carrega, e a P3 age como porta fechada no Marco 1', async () => {
    // O conteúdo real já tem esse caso: P3 (Sala) leva ao Escritório, que só abre no Marco 2.
    const c = await carregar(lerConteudo());
    expect(c.missoes[0].maps.includes('escritorio')).toBe(false);
    const p3 = c.todosOsMapas.get('sala')!.objetos.find((o) => o.tipo === 'porta' && o.dados.id === 'P3')!;
    const ctx = contextoDaPartida(c.missoes, () => false);
    expect(resolverPorta(p3, () => false, ctx)).toEqual({ tipo: 'fechada' });
    const grade = bloqueiosDaSubarea(c.todosOsMapas.get('sala')!, () => false, ctx);
    expect(grade[p3.y][p3.x]).toBe(true);
  });

  it('spawn de chegada que não existe no destino é erro', async () => {
    const arquivos = alterarSubarea('cozinha', (s) => {
      s.objetos = s.objetos.filter((o: { tipo: string; nome?: string }) => !(o.tipo === 'spawn' && o.nome === 'P7'));
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/spawnDestino "P7" não existe em "cozinha"|porta P7/);
  });

  it('interruptor a menos de 3 tiles de um spawn da Sala é erro (regra 11)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      const i = s.objetos.find((o: { tipo: string }) => o.tipo === 'interruptor');
      i.x = 6;
      i.y = 4;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/interruptor em \(6, 4\)/);
  });

  it('objeto na última linha da tela é erro (regra 6)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      comOnzeLinhas(s);
      const i = s.objetos.find((o: { tipo: string }) => o.tipo === 'interruptor');
      i.y = 10;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/última linha da tela/);
  });

  it('objeto fora da caixa da Sala de 10 linhas não chega à linha da barra: é erro de caixa, não da barra', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      const i = s.objetos.find((o: { tipo: string }) => o.tipo === 'interruptor');
      i.y = 10;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/interruptor.*fora da caixa/);
  });

  it('tile da subárea diferente do perfil é erro', async () => {
    const arquivos = alterarSubarea('hall', (s) => {
      s.tile = 16;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/tile 16 é diferente do tile do perfil "hd-480x352" \(32\)/);
  });

  it('caixa maior que a tela é erro', async () => {
    const arquivos = alterarSubarea('hall', (s) => {
      s.largura = 16;
      s.chao = Array(16 * s.altura).fill(1);
      s.colisao = Array(16 * s.altura).fill(0);
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/maior que a tela/);
  });

  it('tipo de tile errado: spawn sobre bloqueio é erro (regra 5)', async () => {
    const arquivos = alterarSubarea('hall', (s) => {
      const sp = s.objetos.find((o: { tipo: string }) => o.tipo === 'spawn');
      s.colisao[sp.y * s.largura + sp.x] = 1;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/precisa estar em piso livre/);
  });

  it('texto citado que não existe é erro', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      const p = s.objetos.find((o: { id?: string }) => o.id === 'P1');
      p.texto = 'chave.fantasma';
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/chave\.fantasma/);
  });

  it('trancadaAte que não é fase é erro (regra 10)', async () => {
    const arquivos = alterarSubarea('hall', (s) => {
      s.objetos.find((o: { tipo: string }) => o.tipo === 'porta').trancadaAte = 'nenhuma';
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/trancadaAte "nenhuma" não é uma fase/);
  });

  it('linha 9 da Sala (tela) está bloqueada na cópia de trabalho: (0, 9) e (1, 9) bloqueados (pergunta 31, Diretor)', async () => {
    const c = await carregar(lerConteudo());
    const sala = c.todosOsMapas.get('sala')!;
    expect(sala.colisao[9][0]).toBe(true);
    expect(sala.colisao[9][1]).toBe(true);
  });

  it('linha da barra com chão andável é erro com a mensagem do ADR (regra 6a)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      comOnzeLinhas(s);
      s.colisao[10 * s.largura + 3] = 0;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/subárea 'sala': chão andável em \(3, 10\) na linha da barra \(tela y 10\)/);
  });

  it('objeto na linha da barra é erro com a mensagem do ADR (regra 6b)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      comOnzeLinhas(s);
      s.objetos.push({ tipo: 'bilhete', x: 4, y: 10, texto: 'bilhete.pista' });
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/subárea 'sala': bilhete em \(4, 10\) na linha da barra \(tela y 10\)/);
  });

  it('bilhete em piso livre é erro: o bilhete é tile bloqueado com vizinho livre (regra 5, item 040)', async () => {
    const arquivos = alterarSubarea('hall', (s) => {
      s.colisao[0 * s.largura + 2] = 0;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/bilhete em \(2, 0\) precisa estar em tile bloqueado com vizinho livre/);
  });

  it('bilhete sem vizinho livre é erro (regra 5, item 040)', async () => {
    const arquivos = alterarSubarea('hall', (s) => {
      // (2, 0) cercado: (2, 1) e (3, 0) bloqueados; (1, 0) já não tem piso.
      s.colisao[1 * s.largura + 2] = 1;
      s.colisao[0 * s.largura + 3] = 1;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/bilhete em \(2, 0\) precisa estar em tile bloqueado com vizinho livre/);
  });

  it('P1 duplicado (dois portaFechada com o mesmo id) é erro (regra 14, item 044)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      // (7, 6) é bloqueado, com vizinho livre (6, 6): é uma segunda marca válida para P1.
      s.objetos.push({ tipo: 'portaFechada', id: 'P1', texto: 'porta.fechada', x: 7, y: 6 });
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/subárea 'sala': portaFechada P1 aparece 2 vezes/);
  });

  it('um id de porta fechada que também é gatilho de porta é erro (regra 14)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      s.objetos.push({ tipo: 'portaFechada', id: 'P8', texto: 'porta.fechada', x: 7, y: 6 });
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/Porta P8: existe como portaFechada e como porta/);
  });

  it('destino da condução bloqueado é erro (regra 12)', async () => {
    const arquivos = lerConteudo();
    const missao = copia(arquivos['missions/marco1.json']) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    missao.conducao.luzes.x = 7;
    missao.conducao.luzes.y = 6;
    arquivos['missions/marco1.json'] = missao;
    expect((await errosDe(arquivos)).join(' ')).toMatch(/conducao\.luzes: destino sala \(7, 6\) não é tile andável/);
  });

  it('destino da condução sem rota a partir do início é erro (regra 12)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      // (3, 7) cercado: vizinhos (2,7), (4,7) e (3,6) bloqueados; o de baixo é a árvore (3, 8).
      s.colisao[7 * s.largura + 2] = 1;
      s.colisao[7 * s.largura + 4] = 1;
      s.colisao[6 * s.largura + 3] = 1;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/conducao\.luzes: destino sala \(3, 7\) sem rota a partir do início \(hall, elevador\)/);
  });

  it('chave de conducao que não é fase é erro (regra 13)', async () => {
    const arquivos = lerConteudo();
    const missao = copia(arquivos['missions/marco1.json']) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    missao.conducao.fantasma = missao.conducao.luzes;
    arquivos['missions/marco1.json'] = missao;
    expect((await errosDe(arquivos)).join(' ')).toMatch(/conducao tem a fase "fantasma"/);
  });

  it('conquista com texto que não existe é erro (regra 13)', async () => {
    const arquivos = lerConteudo();
    const missao = copia(arquivos['missions/marco1.json']) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    missao.conquistas.luzes = 'conquista.nao-existe';
    arquivos['missions/marco1.json'] = missao;
    expect((await errosDe(arquivos)).join(' ')).toMatch(/conquista\.nao-existe/);
  });

  it('missão com o formato antigo (nascimentoPorFase) é recusada com mensagem', () => {
    expect(() => interpretarMissao({ id: 'x', inicio: { mapa: 'a', spawn: 'b', paginas: [] }, conducao: {}, conquistas: {}, nascimentoPorFase: {} })).toThrow(/nascimentoPorFase foi substituído/);
  });

  it('subárea com id que não é o do arquivo gera erro na leitura', () => {
    const decl = { id: 'hall', file: 'x', tileset: 'tiles_casa' };
    expect(() => interpretarSubarea({ id: 'sala' }, decl)).toThrow(/Subárea "hall" inválida/);
  });

  it('missão sem campo inicio é recusada na leitura', () => {
    expect(() => interpretarMissao({ id: 'x' })).toThrow(/Missão inválida/);
  });
});

describe('chegada explícita e saída do par (ADR-004 seção 13; itens 20 a 22 da seção 8)', () => {
  it('a P2 leva ao Quarto com saída do conteúdo: Sala para a direita, Quarto para a esquerda; chegadas (7, 2) e (0, 6)', async () => {
    const c = await carregar(lerConteudo());
    const gSala = c.todosOsMapas.get('sala')!.objetos.find((o) => o.tipo === 'porta' && o.dados.id === 'P2')!;
    const gQuarto = c.todosOsMapas.get('quarto')!.objetos.find((o) => o.tipo === 'porta' && o.dados.id === 'P2')!;
    expect(gSala).toMatchObject({ x: 7, y: 1, dados: { destino: 'quarto', saida: 'direita', spawnDestino: 'P2' } });
    expect(gQuarto).toMatchObject({ x: 0, y: 7, dados: { destino: 'sala', saida: 'esquerda', spawnDestino: 'P2' } });
    const chegadaSala = c.todosOsMapas.get('sala')!.objetos.find((o) => o.tipo === 'spawn' && o.dados.nome === 'P2')!;
    const chegadaQuarto = c.todosOsMapas.get('quarto')!.objetos.find((o) => o.tipo === 'spawn' && o.dados.nome === 'P2')!;
    expect([chegadaSala.x, chegadaSala.y, chegadaSala.dados.direcao]).toEqual([7, 2, 'baixo']);
    expect([chegadaQuarto.x, chegadaQuarto.y, chegadaQuarto.dados.direcao]).toEqual([0, 6, 'cima']);
  });

  it('o conteúdo real passa sem erro; os avisos são só os W027 de pares de fórmula', async () => {
    const c = await carregar(lerConteudo());
    expect(c.avisos.length).toBeGreaterThan(0);
    for (const aviso of c.avisos) expect(aviso).toMatch(/^W027 /);
    expect(avisosDeConteudo({ manifesto: c.manifesto, todos: c.todosOsMapas, missoes: c.missoes, textos: c.textos, perfil: c.perfil })).toEqual(c.avisos);
  });

  it('spawns de nomes diferentes no mesmo tile são aceitos (P2 e P3 em (7, 2), ADR-004 seção 13.9, item 6)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      s.objetos.push({ tipo: 'spawn', x: 7, y: 2, nome: 'TESTE', direcao: 'baixo' });
    });
    expect(await errosDe(arquivos)).toEqual([]);
  });

  it('dois spawns de mesmo nome na mesma subárea continuam erro (spawn repetido)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      s.objetos.push({ tipo: 'spawn', x: 7, y: 2, nome: 'P2', direcao: 'baixo' });
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/spawn "P2" repetido/);
  });

  it('spawn e objeto de outro tipo no mesmo tile continuam erro (E015)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      s.objetos.push({ tipo: 'examinavel', x: 7, y: 2, id: 'X', texto: 'x' });
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/ocupam o mesmo tile/);
  });

  it('item 20: chegada a 2 tiles do gatilho é erro (a passagem deixaria de custar 3 passos)', async () => {
    const arquivos = alterarSubarea('quarto', (s) => {
      const sp = s.objetos.find((o: { tipo: string; nome?: string }) => o.tipo === 'spawn' && o.nome === 'P2');
      sp.y = 5; // (0, 5) é piso livre, mas está a 2 tiles de (0, 7)
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/porta P2 com chegada fora do lado do gatilho/);
  });

  it('item 20 (E028): direção da chegada que não aponta para dentro é erro', async () => {
    const arquivos = alterarSubarea('quarto', (s) => {
      s.objetos.find((o: { tipo: string; nome?: string }) => o.tipo === 'spawn' && o.nome === 'P2').direcao = 'baixo';
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/porta P2: chegada \(0, 6\) com direção "baixo", deveria ser "cima".*E028/);
  });

  it('item 21 (E027): gatilho com 2 vizinhos livres, lado com chegada declarada, é erro', async () => {
    const arquivos = alterarSubarea('quarto', (s) => {
      s.chao[7 * s.largura + 1] = 1; // (1, 7) vira piso livre: o gatilho (0, 7) passa a ter dois vizinhos livres
      s.colisao[7 * s.largura + 1] = 0;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/porta P2 \(quarto, \(0, 7\)\): 2 vizinhos livres \(esperado 1\) \(E027/);
  });

  it('item 21 (W027): gatilho de par de fórmula com 2 vizinhos livres só gera aviso, não erro (P7 da Sala)', async () => {
    const c = await carregar(lerConteudo());
    expect(c.avisos.some((a) => a.includes('porta P7 (sala'))).toBe(true);
    const arquivos = lerConteudo();
    // A P7 da Sala continua de fórmula: nada muda no conteúdo real, e o carregamento segue sem erro.
    expect(await errosDe(arquivos)).toEqual([]);
  });

  it('item 22: saída que aponta para piso livre da própria subárea é erro (porta)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      s.chao[1 * s.largura + 8] = 1; // (8, 1), o vão da P2, vira piso livre
      s.colisao[1 * s.largura + 8] = 0;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/porta P2 \(sala, \(7, 1\)\): saída 'direita' aponta para piso livre \(8, 1\) \(ADR-004 seção 8, item 22\)/);
  });

  it('item 22: porta sem saída válida é erro (o motor não deriva a saída da chegada)', async () => {
    const arquivos = alterarSubarea('quarto', (s) => {
      delete s.objetos.find((o: { tipo: string; id?: string }) => o.tipo === 'porta' && o.id === 'P2').saida;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/porta P2 em \(0, 7\) sem saída válida/);
  });
});

