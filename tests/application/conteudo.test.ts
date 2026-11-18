import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { lerConteudoDoDisco } from '../helpers/conteudoReal';
import { descreverComConteudoNovo } from '../helpers/conteudoNovo';
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
const FIXTURES = join(RAIZ, 'tests', 'fixtures');

const lerConteudo = lerConteudoDoDisco;

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
  s.paredes.push(...Array(s.largura).fill(0));
}

descreverComConteudoNovo('conteúdo real em content/ (ADR-002 schema 3, ADR-011)', () => {
  it('o manifesto real é válido (schema 3, nove áreas, missão marco1 abre três)', () => {
    const v = validarManifesto(lerConteudo()['manifest.json']);
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.manifesto.maps.map((m) => m.id)).toEqual(['hall', 'sala', 'cozinha', 'escritorio', 'banheiro_escritorio', 'quarto', 'banheiro1', 'quartinho', 'quarto_casal']);
      expect(v.manifesto.missions[0].maps).toEqual(['hall', 'sala', 'cozinha']);
    }
  });

  it('carrega as subáreas abertas e valida as fechadas; início e condução vêm da missão', async () => {
    const c = await carregar(lerConteudo());
    expect(c.perfil.id).toBe('hd-480x352');
    expect(c.missoes[0].maps).toEqual(['hall', 'sala', 'cozinha']);
    expect(c.todosOsMapas.size).toBe(9);
    expect(c.inicio).toEqual({ mapa: 'hall', spawn: 'elevador', paginas: ['intro.1', 'intro.2', 'intro.3', 'intro.4'] });
    expect(c.missao.conducao.luzes).toEqual({ mapa: 'sala', x: 2, y: 7, direcao: 'baixo' });
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

  it('a Sala girada tem 10 linhas: a linha 9 da tela (guarda de 2 linhas, ADR-005 seção 6) não tem chão andável', async () => {
    const c = await carregar(lerConteudo());
    const sala = c.todosOsMapas.get('sala')!;
    expect([sala.largura, sala.altura]).toEqual([11, 10]);
    for (let x = 0; x < sala.largura; x++) expect(sala.chao[9][x] !== 0 && !sala.colisao[9][x], `(${x}, 9)`).toBe(false);
  });

  it('bilhete do Hall é de parede (ADR-011 seção 3.2): tile livre (2, 0), `lado` para uma aresta de parede', async () => {
    const c = await carregar(lerConteudo());
    const hall = c.todosOsMapas.get('hall')!;
    const bilhete = hall.objetos.find((o) => o.tipo === 'bilhete')!;
    expect(bilhete).toMatchObject({ x: 2, y: 0 });
    expect(hall.colisao[0][2]).toBe(false);
    expect(hall.chao[0][2]).not.toBe(0);
    const bit = { cima: 1, direita: 2, baixo: 4, esquerda: 8 }[String(bilhete.dados.lado) as 'cima'];
    expect(hall.paredes[0][2] & bit).toBe(bit);
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

descreverComConteudoNovo('novo mapa entra só pelo manifesto (ADR-002, item 013)', () => {
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

describe('validação do manifesto (schema 3)', () => {
  const base = () => copia(lerConteudo()['manifest.json']) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  it('recusa schema 1 com mensagem de não suportado (sem migração, ADR-002 seção 2.1)', () => {
    const m = base();
    m.schemaVersion = 1;
    const v = validarManifesto(m);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.erros.join(' ')).toMatch(/schemaVersion 1 não é mais suportada/);
  });

  it('recusa schema 2 (conteúdo de planta antiga) e schema mais novo que o suportado (ADR-011 seção 4)', () => {
    const antiga = base();
    antiga.schemaVersion = 2;
    const v2 = validarManifesto(antiga);
    expect(v2.ok).toBe(false);
    if (!v2.ok) expect(v2.erros.join(' ')).toMatch(/schemaVersion 2 não é mais suportada.*planta antiga/);
    const nova = base();
    nova.schemaVersion = 4;
    const v4 = validarManifesto(nova);
    expect(v4.ok).toBe(false);
    if (!v4.ok) expect(v4.erros.join(' ')).toMatch(/schemaVersion 4 é mais nova/);
    expect(validarManifesto(base()).ok).toBe(true);
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

descreverComConteudoNovo('regras de validarConteudo (ADR-004 seção 8), com casos negativos sobre o conteúdo real', () => {
  it('porta sem a simétrica na outra área é erro (item 4′)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      s.objetos = s.objetos.filter((o: { id?: string; tipo: string }) => !(o.tipo === 'porta' && o.id === 'hall-sala'));
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/Porta hall-sala \(hall\): não há porta de mesmo id em "sala"/);
  });

  it('porta para área fechada nesta missão é permitida (ADR-011 seção 3.3): o conteúdo real carrega, e a escritorio-sala age como porta fechada no Marco 1', async () => {
    const c = await carregar(lerConteudo());
    expect(c.missoes[0].maps.includes('escritorio')).toBe(false);
    const p3 = c.todosOsMapas.get('sala')!.objetos.find((o) => o.tipo === 'porta' && o.dados.id === 'escritorio-sala')!;
    const ctx = contextoDaPartida(c.missoes, () => false);
    expect(resolverPorta(p3, () => false, ctx)).toEqual({ tipo: 'fechada' });
    // A porta não bloqueia tile; a aresta é parede.
    const grade = bloqueiosDaSubarea(c.todosOsMapas.get('sala')!, () => false, ctx);
    expect(grade[p3.y][p3.x]).toBe(false);
  });

  it('spawn de chegada que não existe no destino é erro', async () => {
    const arquivos = alterarSubarea('cozinha', (s) => {
      s.objetos = s.objetos.filter((o: { tipo: string; nome?: string }) => !(o.tipo === 'spawn' && o.nome === 'cozinha-sala'));
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/spawnDestino "cozinha-sala" não existe em "cozinha"/);
  });

  it('interruptor a menos de 3 tiles do spawn hall-sala da Sala é erro (regra 11)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      const i = s.objetos.find((o: { tipo: string }) => o.tipo === 'interruptor');
      i.x = 4;
      i.y = 6;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/interruptor em \(4, 6\)/);
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
      s.paredes = Array(16 * s.altura).fill(0);
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
      const p = s.objetos.find((o: { tipo: string }) => o.tipo === 'interruptor');
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

  it('linha 9 da Sala (tela) não tem chão andável em (0, 9) e (1, 9) (pergunta 31, Diretor)', async () => {
    const c = await carregar(lerConteudo());
    const sala = c.todosOsMapas.get('sala')!;
    expect(sala.colisao[9][0] || sala.chao[9][0] === 0).toBe(true);
    expect(sala.colisao[9][1] || sala.chao[9][1] === 0).toBe(true);
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

  it('bilhete: o lado precisa apontar para uma aresta de parede, e o tile é livre (item 27)', async () => {
    const semParede = alterarSubarea('hall', (s) => {
      s.objetos.find((o: { tipo: string }) => o.tipo === 'bilhete').lado = 'baixo';
    });
    expect((await errosDe(semParede)).join(' ')).toMatch(/bilhete em \(2, 0\) com lado "baixo" para uma aresta sem parede/);
    const bloqueado = alterarSubarea('hall', (s) => {
      s.colisao[0 * s.largura + 2] = 1;
    });
    expect((await errosDe(bloqueado)).join(' ')).toMatch(/bilhete.*precisa estar em piso livre/);
  });

  it('um id de porta repetido na mesma área é erro (item 26)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      const p = s.objetos.find((o: { tipo: string; id?: string }) => o.tipo === 'porta' && o.id === 'cozinha-sala');
      s.objetos.push({ ...p, lado: 'cima' });
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/id de porta "cozinha-sala" repetido/);
  });

  it('destino da condução bloqueado é erro (regra 12)', async () => {
    const arquivos = lerConteudo();
    const missao = copia(arquivos['missions/marco1.json']) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    // (0, 0) da Sala é vazio (sem piso, bloqueado): destino que não é tile andável.
    missao.conducao.luzes.x = 0;
    missao.conducao.luzes.y = 0;
    arquivos['missions/marco1.json'] = missao;
    expect((await errosDe(arquivos)).join(' ')).toMatch(/conducao\.luzes: destino sala \(0, 0\) não é tile andável/);
  });

  it('destino da condução sem rota a partir do início é erro (regra 12)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      // (2, 7) cercado: vizinhos (1,7), (3,7) e (2,6) bloqueados; o de baixo é a árvore (2, 8).
      s.colisao[7 * s.largura + 1] = 1;
      s.colisao[7 * s.largura + 3] = 1;
      s.colisao[6 * s.largura + 2] = 1;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/conducao\.luzes: destino sala \(2, 7\) sem rota a partir do início \(hall, elevador\)/);
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

descreverComConteudoNovo('chegada e lado da porta (ADR-011 seções 3.2 e 7; item 4′ e 26)', () => {
  it('a quarto-sala liga a Sala ao Quarto: lados cima (Sala) e baixo (Quarto); chegadas nos tiles das portas (7, 0) e (0, 3)', async () => {
    const c = await carregar(lerConteudo());
    const gSala = c.todosOsMapas.get('sala')!.objetos.find((o) => o.tipo === 'porta' && o.dados.id === 'quarto-sala')!;
    const gQuarto = c.todosOsMapas.get('quarto')!.objetos.find((o) => o.tipo === 'porta' && o.dados.id === 'quarto-sala')!;
    expect(gSala).toMatchObject({ x: 7, y: 0, dados: { destino: 'quarto', lado: 'cima', spawnDestino: 'quarto-sala' } });
    expect(gQuarto).toMatchObject({ x: 0, y: 3, dados: { destino: 'sala', lado: 'baixo', spawnDestino: 'quarto-sala' } });
    const chegadaSala = c.todosOsMapas.get('sala')!.objetos.find((o) => o.tipo === 'spawn' && o.dados.nome === 'quarto-sala')!;
    const chegadaQuarto = c.todosOsMapas.get('quarto')!.objetos.find((o) => o.tipo === 'spawn' && o.dados.nome === 'quarto-sala')!;
    expect([chegadaSala.x, chegadaSala.y, chegadaSala.dados.direcao]).toEqual([7, 0, 'baixo']);
    expect([chegadaQuarto.x, chegadaQuarto.y, chegadaQuarto.dados.direcao]).toEqual([0, 3, 'cima']);
  });

  it('o conteúdo real passa sem erro e sem avisos (o W027 de pares de fórmula não existe mais)', async () => {
    const c = await carregar(lerConteudo());
    expect(c.avisos).toEqual([]);
    expect(avisosDeConteudo({ manifesto: c.manifesto, todos: c.todosOsMapas, missoes: c.missoes, textos: c.textos, perfil: c.perfil })).toEqual([]);
  });

  it('spawns de nomes diferentes no mesmo tile são aceitos (quarto-sala e escritorio-sala em (7, 0))', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      s.objetos.push({ tipo: 'spawn', x: 7, y: 0, nome: 'TESTE', direcao: 'baixo' });
    });
    expect(await errosDe(arquivos)).toEqual([]);
  });

  it('dois spawns de mesmo nome na mesma área continuam erro (spawn repetido)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      s.objetos.push({ tipo: 'spawn', x: 7, y: 0, nome: 'quarto-sala', direcao: 'baixo' });
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/spawn "quarto-sala" repetido/);
  });

  it('spawn e objeto de outro tipo (que não é porta) no mesmo tile continuam erro (E015)', async () => {
    const arquivos = alterarSubarea('sala', (s) => {
      s.objetos.push({ tipo: 'examinavel', x: 7, y: 0, id: 'X', texto: 'x' });
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/ocupam o mesmo tile/);
  });

  it('item 4′: chegada fora do tile da porta do outro lado é erro', async () => {
    const arquivos = alterarSubarea('quarto', (s) => {
      const sp = s.objetos.find((o: { tipo: string; nome?: string }) => o.tipo === 'spawn' && o.nome === 'quarto-sala');
      sp.y = 2;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/Porta quarto-sala: a chegada "quarto-sala" em "quarto" \(0, 2\) precisa estar no tile da porta/);
  });

  it('item 4′: direção da chegada que não olha para dentro é erro', async () => {
    const arquivos = alterarSubarea('quarto', (s) => {
      s.objetos.find((o: { tipo: string; nome?: string }) => o.tipo === 'spawn' && o.nome === 'quarto-sala').direcao = 'baixo';
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/a chegada "quarto-sala" em "quarto" olha para "baixo", deveria olhar para "cima"/);
  });

  it('item 26: porta sem lado válido é erro (o motor não deriva o lado da chegada)', async () => {
    const arquivos = alterarSubarea('quarto', (s) => {
      delete s.objetos.find((o: { tipo: string; id?: string }) => o.tipo === 'porta' && o.id === 'quarto-sala').lado;
    });
    expect((await errosDe(arquivos)).join(' ')).toMatch(/porta quarto-sala em \(0, 3\) sem lado válido/);
  });
});
