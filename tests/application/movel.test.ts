import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CarregarConteudo, ConteudoInvalidoError } from '../../src/application/usecases/CarregarConteudo';
import { ContentSourceDeArquivos } from '../../src/infrastructure/content/ContentSourceDeArquivos';
import { interpretarSubarea } from '../../src/application/content/interpretarSubarea';
import { bloqueiosDaSubarea } from '../../src/application/mundo/subarea';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const CONTENT = join(RAIZ, 'content');

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
async function errosDe(arquivos: Record<string, unknown>): Promise<string[]> {
  try {
    await carregar(arquivos);
    return [];
  } catch (e) {
    return e instanceof ConteudoInvalidoError ? e.erros : [String(e)];
  }
}
/** Acrescenta objetos a uma subárea do conteúdo real (cópia) e devolve o conjunto de arquivos. */
function comObjetos(id: string, objetos: Record<string, unknown>[], fn?: (s: Record<string, any>) => void): Record<string, unknown> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const arquivos = lerConteudo();
  const s = copia(arquivos[`maps/casa-real/${id}.json`]) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  fn?.(s);
  s.objetos.push(...objetos);
  arquivos[`maps/casa-real/${id}.json`] = s;
  return arquivos;
}
/** Móvel de teste: rótulo e id são obrigatórios; x, y, w, h vêm de cada caso. */
const movel = (x: number, y: number, w: number, h: number, extra: Record<string, unknown> = {}) => ({
  tipo: 'movel',
  id: 'sofa',
  nome: 'Sofá',
  x,
  y,
  w,
  h,
  ...extra,
});
/** Acrescenta uma linha de tiles bloqueados embaixo da sala (11 linhas, como a tela): a linha da barra fica na caixa. */
function comOnzeLinhas(s: Record<string, any>): void { // eslint-disable-line @typescript-eslint/no-explicit-any
  s.altura = 11;
  s.chao.push(...Array(s.largura).fill(0));
  s.colisao.push(...Array(s.largura).fill(1));
}

/**
 * Hall real (4×3): linha 0 é "###." (tiles 0 a 2 bloqueados, 3 livre); linha 1 é livre.
 * Os casos abaixo usam esses tiles (ADR-004 seção 8 e contrato do móvel).
 */
describe('móvel: validação (contrato da Arte com o Desenvolvedor)', () => {
  it('válido: retângulo que cobre só tiles bloqueados passa, sem erro', async () => {
    const erros = await errosDe(comObjetos('hall', [movel(0, 0, 2, 1)]));
    expect(erros).toEqual([]);
  });

  it('fora da caixa: x + w passa da largura da subárea é erro', async () => {
    const erros = await errosDe(comObjetos('hall', [movel(3, 0, 2, 1)]));
    expect(erros.join(' ')).toMatch(/Sofá.*sai da caixa da subárea \(4×3\)/);
  });

  it('fora da caixa: y + h passa da altura da subárea é erro', async () => {
    const erros = await errosDe(comObjetos('hall', [movel(0, 2, 1, 2)]));
    expect(erros.join(' ')).toMatch(/sai da caixa da subárea/);
  });

  it('sobre piso livre: cobrir um tile andável é erro (móvel só cobre tiles bloqueados)', async () => {
    const erros = await errosDe(comObjetos('hall', [movel(3, 0, 1, 1)]));
    expect(erros.join(' ')).toMatch(/cobre tile livre em \(3, 0\)/);
  });

  it('sobre piso livre: um retângulo que mistura bloqueado e livre também é erro', async () => {
    const erros = await errosDe(comObjetos('hall', [movel(2, 0, 2, 1)]));
    expect(erros.join(' ')).toMatch(/cobre tile livre em \(3, 0\)/);
  });

  it('w < 1 é erro, e h < 1 também', async () => {
    expect((await errosDe(comObjetos('hall', [movel(0, 0, 0, 1)]))).join(' ')).toMatch(/w e h precisam ser ≥ 1 \(w=0, h=1\)/);
    expect((await errosDe(comObjetos('hall', [movel(0, 0, 1, 0)]))).join(' ')).toMatch(/w e h precisam ser ≥ 1 \(w=1, h=0\)/);
  });

  it('x ou y negativos são erro (x, y inteiros ≥ 0)', async () => {
    const erros = await errosDe(comObjetos('hall', [movel(-1, 0, 1, 1)]));
    expect(erros.join(' ')).toMatch(/x e y precisam ser inteiros ≥ 0/);
  });

  it('móvel sem nome ou sem id é erro', async () => {
    expect((await errosDe(comObjetos('hall', [movel(0, 0, 1, 1, { nome: '' })]))).join(' ')).toMatch(/móvel sem "nome"/);
    expect((await errosDe(comObjetos('hall', [movel(0, 0, 1, 1, { id: undefined })]))).join(' ')).toMatch(/móvel sem "id"/);
  });

  it('o tipo "movel" é conhecido: nenhum erro de tipo desconhecido', async () => {
    const erros = await errosDe(comObjetos('hall', [movel(0, 0, 2, 1)]));
    expect(erros.join(' ')).not.toMatch(/tipo de objeto "movel" desconhecido/);
  });

  it('linha da barra: móvel nela não é erro (não conta para a regra da barra), mas um bilhete continua sendo', async () => {
    const arquivos = comObjetos('sala', [movel(0, 10, 2, 1)], comOnzeLinhas);
    const erros = await errosDe(arquivos);
    expect(erros.filter((e) => /linha da barra/.test(e) && /Sofá|movel/.test(e))).toEqual([]);
    const comBilhete = comObjetos('sala', [movel(0, 10, 2, 1), { tipo: 'bilhete', x: 4, y: 10, texto: 'bilhete.pista' }], comOnzeLinhas);
    expect((await errosDe(comBilhete)).join(' ')).toMatch(/bilhete em \(4, 10\) na linha da barra/);
  });

  it('a leitura (interpretarSubarea) recusa w ou h que não são inteiros', () => {
    const bruto = {
      id: 'hall',
      tile: 32,
      largura: 4,
      altura: 3,
      escuro: false,
      chao: Array(12).fill(1),
      colisao: Array(12).fill(0),
      objetos: [{ tipo: 'movel', id: 'sofa', nome: 'Sofá', x: 0, y: 0, w: 1.5, h: 1 }],
    };
    expect(() => interpretarSubarea(bruto, { id: 'hall', file: 'maps/casa-real/hall.json', tileset: 'tiles_casa' })).toThrow(/w e h inteiros/);
  });

  it('a leitura guarda w, h, id e nome do móvel em dados, e x, y como coordenadas locais', async () => {
    const c = await carregar(comObjetos('hall', [movel(1, 0, 2, 1)]));
    const m = c.todosOsMapas.get('hall')!.objetos.find((o) => o.tipo === 'movel');
    expect(m).toMatchObject({ tipo: 'movel', x: 1, y: 0, dados: { id: 'sofa', nome: 'Sofá', w: 2, h: 1 } });
  });
});

describe('móvel: não altera a colisão', () => {
  it('a grade de bloqueios da subárea é a mesma com e sem móvel, tile a tile', async () => {
    const semMovel = await carregar(lerConteudo());
    const comMovel = await carregar(comObjetos('hall', [movel(0, 0, 2, 1)]));
    const hallSem = semMovel.todosOsMapas.get('hall')!;
    const hallCom = comMovel.todosOsMapas.get('hall')!;
    const noIgual = () => false;
    expect(bloqueiosDaSubarea(hallCom, noIgual)).toEqual(bloqueiosDaSubarea(hallSem, noIgual));
    expect(hallCom.colisao).toEqual(hallSem.colisao);
  });

  it('o móvel não bloqueia por si: o tile de piso livre continua andável mesmo com um móvel ao lado', async () => {
    const c = await carregar(comObjetos('hall', [movel(0, 0, 2, 1)]));
    const hall = c.todosOsMapas.get('hall')!;
    const grade = bloqueiosDaSubarea(hall, () => false);
    expect(grade[1][0]).toBe(false);
    expect(grade[1][1]).toBe(false);
    // Os tiles do próprio móvel continuam bloqueados pelo conversor, não pelo móvel.
    expect(grade[0][0]).toBe(true);
  });
});
