import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CarregarConteudo } from '../../src/application/usecases/CarregarConteudo';
import { ContentSourceDeArquivos } from '../../src/infrastructure/content/ContentSourceDeArquivos';
import { AtravessarPorta } from '../../src/application/usecases/AtravessarPorta';
import { calcularRotaDeConducao } from '../../src/application/mundo/conducao';
import { fatorDaConducao } from '../../src/domain/progresso/Conducao';
import { SessaoDeJogo } from '../../src/application/SessaoDeJogo';
import { IniciarNovoJogo } from '../../src/application/usecases/IniciarNovoJogo';
import { ConcluirFase } from '../../src/application/usecases/ConcluirFase';
import { bloqueiosDaSubarea, deslocamentoDaSubarea, ladoDaPorta, objetosNaTela, vaoDaPorta } from '../../src/application/mundo/subarea';
import { ColisaoDoMapa, alvoDaInteracao, geometriaDoSobrinho, mover, posicaoDoTile, centroDosPes, type Direcao } from '../../src/application/mundo/movimento';
import { objetosDoTipo, type MapaDoJogo, type ObjetoDoMapa } from '../../src/application/content/Mapa';

/**
 * Percurso da casa real no Marco 1 (ADR-004 seções 3, 9 e 10; GDD 14.10.5): o personagem anda em px com
 * `mover` (a mesma regra do jogo), tile a tile, e as portas são resolvidas pela regra do domínio.
 * Coordenadas da planta girada (GDD 14.12.3, ADR-004 seção 12).
 */
const CONTENT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content');
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

async function cenario(fase: 'porta' | 'introducao') {
  const c = await new CarregarConteudo(new ContentSourceDeArquivos(lerConteudo())).executar();
  const sessao = new SessaoDeJogo();
  new IniciarNovoJogo(sessao).executar('lolo');
  if (fase === 'porta') new ConcluirFase(sessao).executar('introducao');
  const g = geometriaDoSobrinho(c.perfil);
  return { c, sessao, g, tile: c.perfil.tile };
}

/** Estado de uma subárea em tela: offset, grade de bloqueio global e objetos. */
function estado(c: Awaited<ReturnType<typeof cenario>>['c'], id: string, sessao: SessaoDeJogo) {
  const mapa: MapaDoJogo = c.todosOsMapas.get(id)!;
  const d = deslocamentoDaSubarea(mapa, c.perfil.sala);
  const grade = bloqueiosDaSubarea(mapa, (f) => sessao.faseConcluida(f));
  const col = new ColisaoDoMapa(grade);
  return { mapa, d, col, bloqueado: (tx: number, ty: number) => col.bloqueado(tx - d.x, ty - d.y) };
}

/** Posição do sprite com os pés no tile LOCAL (x, y) da subárea. */
const pos = (e: ReturnType<typeof estado>, g: ReturnType<typeof geometriaDoSobrinho>, lx: number, ly: number) =>
  posicaoDoTile(lx + e.d.x, ly + e.d.y, g);
/** Tile (local) onde está o centro dos pés. */
const tileLocal = (e: ReturnType<typeof estado>, g: ReturnType<typeof geometriaDoSobrinho>, p: { x: number; y: number }) => {
  const c = centroDosPes(p, g);
  return { x: Math.floor(c.x / g.tile) - e.d.x, y: Math.floor(c.y / g.tile) - e.d.y };
};
const DIR: Record<string, Direcao> = { '1,0': 'direita', '-1,0': 'esquerda', '0,1': 'baixo', '0,-1': 'cima' };

/** Anda de um tile a outro (vizinho) com `mover` em px; devolve a nova posição. */
function passo(e: ReturnType<typeof estado>, g: ReturnType<typeof geometriaDoSobrinho>, p: { x: number; y: number }, dx: number, dy: number) {
  return mover(p, DIR[`${dx},${dy}`], g.tile, e.bloqueado, g);
}

/**
 * Giro de 90° para a direita de uma subárea de altura `alturaAntes` (ADR-004 seção 12.1): (x, y) vai para
 * (alturaAntes − 1 − y, x). Usado para comparar a planta girada com os pontos de antes (GDD 14.12.3).
 */
const girar = (p: { x: number; y: number }, alturaAntes: number) => ({ x: alturaAntes - 1 - p.y, y: p.x });

const sem = () => true;

describe('condução da fase das luzes (GDD 14.11; ADR-004 seção 11)', () => {
  it('da frente de baixo do interruptor (5,4) até (3,7) são 5 passos: velocidade normal', async () => {
    const { c } = await cenario('porta');
    const r = calcularRotaDeConducao(c.todosOsMapas, { mapa: 'sala', x: 5, y: 4 }, c.missao.conducao.luzes, sem);
    expect(r?.passos).toBe(5);
    expect(fatorDaConducao(r!.passos)).toBe(1);
  });
  it('da frente de cima do interruptor (5,2) até (3,7) são 7 passos: velocidade normal (não 2×)', async () => {
    const { c } = await cenario('porta');
    const r = calcularRotaDeConducao(c.todosOsMapas, { mapa: 'sala', x: 5, y: 2 }, c.missao.conducao.luzes, sem);
    expect(r?.passos).toBe(7);
    expect(fatorDaConducao(r!.passos)).toBe(1);
  });
  it('do início (Elevador) até (3,7) são 11 passos, com a porta P8: passa de 10, então 2×', async () => {
    const { c } = await cenario('porta');
    // Na fase das luzes a porta já foi concluída: a P8 é passagem (a condução só começa depois dela).
    const r = calcularRotaDeConducao(c.todosOsMapas, { mapa: 'hall', x: 0, y: 1 }, c.missao.conducao.luzes, () => true);
    expect(r?.passos).toBe(11);
    expect(r!.nos.some((n) => n.mapa === 'sala' && n.spawn === 'P8')).toBe(true);
    expect(fatorDaConducao(r!.passos)).toBe(2);
  });
  it('a rota nunca passa por parede, porta fechada, árvore ou vão: cada nó é tile andável', async () => {
    const { c } = await cenario('porta');
    const r = calcularRotaDeConducao(c.todosOsMapas, { mapa: 'hall', x: 0, y: 1 }, c.missao.conducao.luzes, () => true)!;
    for (const n of r.nos) {
      const m = c.todosOsMapas.get(n.mapa)!;
      expect(m.colisao[n.y][n.x], `${n.mapa} (${n.x},${n.y})`).toBe(false);
      expect(m.objetos.some((o) => o.tipo === 'portaFechada' && o.x === n.x && o.y === n.y)).toBe(false);
    }
  });
  it('R6: o destino é a árvore girada, de frente para ela (baixo), e a rota tem o mesmo número de passos de antes', async () => {
    const { c } = await cenario('porta');
    const arvore = objetosDoTipo(c.todosOsMapas.get('sala')!, 'arvore')[0];
    // Antes da rotação (planta de 2026-11-07, Sala com 11 linhas): frente do interruptor (3,5) até (7,7) eram 6 passos.
    const antes = { origem: { x: 3, y: 5 }, destino: { x: 7, y: 7 }, alturaAntes: 11 };
    expect(girar(antes.destino, antes.alturaAntes)).toEqual({ x: 3, y: 7 });
    expect(girar({ x: 8, y: 7 }, antes.alturaAntes)).toEqual({ x: arvore.x, y: arvore.y });
    expect(c.missao.conducao.luzes).toEqual({ mapa: 'sala', x: 3, y: 7, direcao: 'baixo' });
    expect(arvore.y - c.missao.conducao.luzes.y).toBe(1);
    expect(arvore.x).toBe(c.missao.conducao.luzes.x);
    const r = calcularRotaDeConducao(c.todosOsMapas, { mapa: 'sala', ...girar(antes.origem, antes.alturaAntes) }, c.missao.conducao.luzes, sem);
    expect(r?.passos).toBe(6);
  });
});

describe('casa real no Marco 1 (perfil HD, tile 32)', () => {
  it('a P8 trancada não deixa passar antes da fase porta; a porta é um gatilho depois', async () => {
    const { c, sessao, g } = await cenario('introducao');
    const hall = estado(c, 'hall', sessao);
    const gatilho = objetosDoTipo(hall.mapa, 'porta')[0] as ObjetoDoMapa;
    expect(gatilho).toMatchObject({ x: 3, y: 0 });
    expect(hall.bloqueado(gatilho.x + hall.d.x, gatilho.y + hall.d.y)).toBe(true);
    expect(new AtravessarPorta(sessao).executar(gatilho)).toEqual({ tipo: 'trancada' });
    // Do spawn P8 (3, 1), subir em direção ao gatilho não o atravessa (a trava segura o personagem).
    let p = pos(hall, g, 3, 1);
    p = mover(p, 'cima', 2 * g.tile, hall.bloqueado, g);
    expect(tileLocal(hall, g, p)).toEqual({ x: 3, y: 1 });
    // Com a fase porta concluída, o mesmo gatilho leva à Sala, ao spawn de chegada P8.
    new ConcluirFase(sessao).executar('introducao');
    new (await import('../../src/application/usecases/TentarCodigoDaPorta')).TentarCodigoDaPorta(sessao).executar('017');
    expect(new AtravessarPorta(sessao).executar(gatilho)).toEqual({ tipo: 'entrar', mapa: 'sala', spawn: 'P8' });
  });

  it('o vão da P8 fica no lado de saída do conteúdo (porta.saida, ADR-004 seção 13.18) e não é andável', async () => {
    const { c, sessao } = await cenario('porta');
    const hall = estado(c, 'hall', sessao);
    const sala = estado(c, 'sala', sessao);
    const gHall = objetosDoTipo(hall.mapa, 'porta')[0] as ObjetoDoMapa;
    const gSala = objetosDoTipo(sala.mapa, 'porta').find((o) => o.dados.id === 'P8')!;
    // Hall: gatilho (3, 0), saída para cima: vão em (3, −1), fora da caixa do Hall.
    expect(ladoDaPorta(gHall)).toBe('cima');
    expect(vaoDaPorta(gHall, 'cima')).toEqual({ x: 3, y: -1 });
    expect(hall.bloqueado(3 + hall.d.x, -1 + hall.d.y)).toBe(true);
    // Sala: gatilho (6, 7), saída para baixo: vão em (6, 8), que não tem piso.
    expect(ladoDaPorta(gSala)).toBe('baixo');
    expect(vaoDaPorta(gSala, 'baixo')).toEqual({ x: 6, y: 8 });
    expect(c.todosOsMapas.get('sala')!.colisao[8][6]).toBe(true);
    expect(c.todosOsMapas.get('sala')!.chao[8][6]).toBe(0);
  });

  it('andar do Elevador ao gatilho P8 (com a porta aberta), entrar na Sala no spawn P8 e ir à P7', async () => {
    const { c, sessao, g } = await cenario('porta');
    new (await import('../../src/application/usecases/TentarCodigoDaPorta')).TentarCodigoDaPorta(sessao).executar('017');
    const hall = estado(c, 'hall', sessao);
    const sala = estado(c, 'sala', sessao);
    // Hall: do spawn "elevador" (0, 1) vai à direita até (3, 1) e sobe no gatilho (3, 0).
    let p = pos(hall, g, 0, 1);
    for (let i = 0; i < 3; i++) p = passo(hall, g, p, 1, 0);
    expect(tileLocal(hall, g, p)).toEqual({ x: 3, y: 1 });
    p = passo(hall, g, p, 0, -1);
    const gatilho = objetosDoTipo(hall.mapa, 'porta')[0] as ObjetoDoMapa;
    expect(tileLocal(hall, g, p)).toEqual({ x: gatilho.x, y: gatilho.y });
    const destino = new AtravessarPorta(sessao).executar(gatilho);
    expect(destino).toEqual({ tipo: 'entrar', mapa: 'sala', spawn: 'P8' });

    // Sala: spawn P8 em (6, 6), de frente para cima. Sobe a (6, 5), vai à direita até o spawn P7 (9, 5) e
    // entra no gatilho P7 (10, 5).
    let q = pos(sala, g, 6, 6);
    q = passo(sala, g, q, 0, -1); // (6, 5)
    for (let i = 0; i < 3; i++) q = passo(sala, g, q, 1, 0); // (9, 5)
    expect(tileLocal(sala, g, q)).toEqual({ x: 9, y: 5 });
    q = passo(sala, g, q, 1, 0); // (10, 5): gatilho P7
    const p7 = objetosDoTipo(sala.mapa, 'porta').find((o) => o.dados.id === 'P7')!;
    expect(p7).toMatchObject({ x: 10, y: 5 });
    expect(tileLocal(sala, g, q)).toEqual({ x: p7.x, y: p7.y });
    expect(new AtravessarPorta(sessao).executar(p7)).toEqual({ tipo: 'entrar', mapa: 'cozinha', spawn: 'P7' });
  });

  it('a Sala (11×10) cabe centralizada na tela 15×11 e o Hall (4×3) e a Cozinha (6×7) também', async () => {
    const { c } = await cenario('porta');
    expect(deslocamentoDaSubarea(c.todosOsMapas.get('sala')!, c.perfil.sala)).toEqual({ x: 2, y: 0 });
    expect(deslocamentoDaSubarea(c.todosOsMapas.get('hall')!, c.perfil.sala)).toEqual({ x: 5, y: 4 });
    expect(deslocamentoDaSubarea(c.todosOsMapas.get('cozinha')!, c.perfil.sala)).toEqual({ x: 4, y: 2 });
    expect([c.todosOsMapas.get('sala')!.largura, c.todosOsMapas.get('sala')!.altura]).toEqual([11, 10]);
  });

  it('P1 é porta fechada: bloqueia, não tem destino; é um só objeto (ADR-004 seção 8, item 14); o interruptor fica na Sala', async () => {
    const { c, sessao } = await cenario('porta');
    const sala = estado(c, 'sala', sessao);
    const p1 = objetosDoTipo(sala.mapa, 'portaFechada').find((o) => o.dados.id === 'P1')!;
    expect(p1).toMatchObject({ x: 6, y: 2 });
    expect(sala.bloqueado(p1.x + sala.d.x, p1.y + sala.d.y)).toBe(true);
    expect(p1.dados.destino).toBeUndefined();
    const todos = [...c.todosOsMapas.values()].flatMap((m) => m.objetos);
    expect(todos.filter((o) => o.tipo === 'portaFechada' && o.dados.id === 'P1')).toHaveLength(1);
    expect(todos.filter((o) => o.tipo === 'porta' && o.dados.id === 'P1')).toHaveLength(0);
    expect(objetosDoTipo(sala.mapa, 'interruptor')).toEqual([expect.objectContaining({ x: 5, y: 3 })]);
  });

  it('o bilhete é tile bloqueado com vizinho livre, e A no vizinho (2, 1) lê o bilhete (GDD 14.9.2)', async () => {
    const { c, sessao, g } = await cenario('porta');
    const hall = estado(c, 'hall', sessao);
    const bilhete = objetosDoTipo(hall.mapa, 'bilhete')[0];
    expect(bilhete).toMatchObject({ x: 2, y: 0 });
    expect(hall.bloqueado(bilhete.x + hall.d.x, bilhete.y + hall.d.y)).toBe(true);
    expect(hall.mapa.chao[1][2]).not.toBe(0);
    expect(hall.mapa.colisao[1][2]).toBe(false);
    // Do vizinho de baixo, virado para cima, o alvo da ação A é o bilhete.
    const emTela = objetosNaTela(hall.mapa, hall.d);
    const alvo = alvoDaInteracao(emTela, pos(hall, g, 2, 1), 'cima', g);
    expect(alvo?.tipo).toBe('bilhete');
  });

  it('a árvore fica na Sala (3, 8), bloqueia o tile e é o bloco da 4ª coluna, 2ª linha de baixo (GDD 14.12.3)', async () => {
    const { c, sessao } = await cenario('porta');
    const sala = estado(c, 'sala', sessao);
    const arvore = objetosDoTipo(sala.mapa, 'arvore')[0];
    expect(arvore).toMatchObject({ x: 3, y: 8 });
    expect(sala.bloqueado(arvore.x + sala.d.x, arvore.y + sala.d.y)).toBe(true);
  });

  it('cozinha: os três examináveis estão em tiles bloqueados com vizinho livre (GDD 14.10.4)', async () => {
    const { c, sessao } = await cenario('porta');
    const cozinha = estado(c, 'cozinha', sessao);
    const ex = objetosDoTipo(cozinha.mapa, 'examinavel');
    expect(ex.map((o) => o.dados.texto).sort()).toEqual(['cozinha.fogao', 'cozinha.geladeira', 'cozinha.pia'].sort());
    for (const o of ex) expect(cozinha.bloqueado(o.x + cozinha.d.x, o.y + cozinha.d.y)).toBe(true);
  });

  it('R5: os pontos do Marco 1 batem com GDD 14.12.3 (planta antes da rotação girada pela fórmula)', async () => {
    const { c } = await cenario('porta');
    const pontos: Array<{ mapa: string; alturaAntes: number; tipo: string; chave: string; antes: { x: number; y: number }; depois: { x: number; y: number } }> = [
      { mapa: 'sala', alturaAntes: 11, tipo: 'porta', chave: 'P8', antes: { x: 7, y: 4 }, depois: { x: 6, y: 7 } },
      { mapa: 'sala', alturaAntes: 11, tipo: 'spawn', chave: 'P8', antes: { x: 6, y: 4 }, depois: { x: 6, y: 6 } },
      { mapa: 'sala', alturaAntes: 11, tipo: 'porta', chave: 'P7', antes: { x: 5, y: 0 }, depois: { x: 10, y: 5 } },
      { mapa: 'sala', alturaAntes: 11, tipo: 'spawn', chave: 'P7', antes: { x: 5, y: 1 }, depois: { x: 9, y: 5 } },
      { mapa: 'sala', alturaAntes: 11, tipo: 'portaFechada', chave: 'P1', antes: { x: 2, y: 4 }, depois: { x: 6, y: 2 } },
      { mapa: 'sala', alturaAntes: 11, tipo: 'porta', chave: 'P2', antes: { x: 1, y: 3 }, depois: { x: 7, y: 1 } },
      { mapa: 'sala', alturaAntes: 11, tipo: 'porta', chave: 'P3', antes: { x: 2, y: 2 }, depois: { x: 8, y: 2 } },
      { mapa: 'sala', alturaAntes: 11, tipo: 'arvore', chave: '', antes: { x: 8, y: 7 }, depois: { x: 3, y: 8 } },
      { mapa: 'hall', alturaAntes: 4, tipo: 'porta', chave: 'P8', antes: { x: 0, y: 0 }, depois: { x: 3, y: 0 } },
      { mapa: 'hall', alturaAntes: 4, tipo: 'spawn', chave: 'P8', antes: { x: 1, y: 0 }, depois: { x: 3, y: 1 } },
      { mapa: 'hall', alturaAntes: 4, tipo: 'spawn', chave: 'elevador', antes: { x: 1, y: 3 }, depois: { x: 0, y: 1 } },
      { mapa: 'hall', alturaAntes: 4, tipo: 'bilhete', chave: 'bilhete.pista', antes: { x: 0, y: 1 }, depois: { x: 2, y: 0 } },
      { mapa: 'cozinha', alturaAntes: 6, tipo: 'porta', chave: 'P7', antes: { x: 0, y: 5 }, depois: { x: 0, y: 0 } },
      { mapa: 'cozinha', alturaAntes: 6, tipo: 'spawn', chave: 'P7', antes: { x: 0, y: 4 }, depois: { x: 1, y: 0 } },
    ];
    for (const p of pontos) {
      expect(girar(p.antes, p.alturaAntes), `${p.mapa} ${p.tipo} ${p.chave}`).toEqual(p.depois);
      const achado = c.todosOsMapas.get(p.mapa)!.objetos.find((o) => {
        const chave = String(o.dados.id ?? o.dados.nome ?? o.dados.texto ?? '');
        return o.tipo === p.tipo && (p.chave === '' || chave === p.chave);
      });
      expect(achado, `${p.mapa} ${p.tipo} ${p.chave}`).toBeDefined();
      expect({ x: achado!.x, y: achado!.y }, `${p.mapa} ${p.tipo} ${p.chave}`).toEqual(p.depois);
    }
  });
});

export type { MapaDoJogo };
void mover;
