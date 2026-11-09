import { describe, expect, it } from 'vitest';
import {
  ColisaoDoMapa,
  alvoDaInteracao,
  centroDosPes,
  geometriaDoSobrinho,
  mover,
  posicaoDoTile,
  type Geometria,
  type Posicao,
} from '../../src/application/mundo/movimento';
import { SessaoDeJogo } from '../../src/application/SessaoDeJogo';
import { ConcluirFase } from '../../src/application/usecases/ConcluirFase';
import { IniciarNovoJogo } from '../../src/application/usecases/IniciarNovoJogo';
import { TentarCodigoDaPorta } from '../../src/application/usecases/TentarCodigoDaPorta';
import { AcenderLuzes } from '../../src/application/usecases/AcenderLuzes';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PerfilDeArte } from '../../src/application/arte/PerfilDeArte';

/**
 * Movimento (ADR-003 seções 4 e 5): a geometria vem do perfil. Os testes rodam para tile 16 (v1) e 32 (2×):
 * as posições são em tiles, então o resultado em tiles tem de ser o mesmo nos dois.
 */
const PERFIL_V1: PerfilDeArte = JSON.parse(readFileSync(join(__dirname, '..', '..', 'content', 'art-profiles', 'gba-240x160.json'), 'utf-8'));

/** Geometria do Sobrinho para um tile qualquer: o quadro e a caixa dos pés escalam com o tile (k = tile / 16). */
function geometriaParaTile(tile: number): Geometria {
  const k = tile / 16;
  const perfil = JSON.parse(JSON.stringify(PERFIL_V1)) as PerfilDeArte;
  perfil.tile = tile;
  perfil.corpos.sobrinho.quadro = { w: 16 * k, h: 24 * k };
  perfil.corpos.sobrinho.pes = { w: 12 * k, h: 8 * k };
  return geometriaDoSobrinho(perfil);
}

describe.each([16, 32])('movimento com colisão, tile %i (ADR-001, GDD 4.1)', (tile) => {
  const g = geometriaParaTile(tile);
  // Grade 6×4 com parede na coluna 4 (tiles x=4, todas as linhas) e a linha 0 fechada.
  const grade = Array.from({ length: 4 }, (_, y) => Array.from({ length: 6 }, (_, x) => x === 4 || y === 0));
  const colisao = new ColisaoDoMapa(grade);
  /** Direita da caixa dos pés, em px, no sprite posicionado: x + dx + w. */
  const bordaDireita = (p: Posicao) => p.x + g.pes.dx + g.pes.w;

  it('anda no eixo pedido e para diante da parede, sem atravessar', () => {
    const inicio = posicaoDoTile(1, 2, g);
    const p = mover(inicio, 'direita', 1000, colisao.bloqueado, g);
    expect(bordaDireita(p)).toBeLessThanOrEqual(4 * tile);
    expect(p.x).toBeGreaterThan(inicio.x);
  });

  it('não move para dentro de parede', () => {
    const inicio = posicaoDoTile(3, 2, g);
    const p = mover(inicio, 'direita', 100 * tile, colisao.bloqueado, g);
    expect(bordaDireita(p)).toBeLessThanOrEqual(4 * tile);
    expect(p.y).toBe(inicio.y);
  });

  it('distância zero não se move', () => {
    const inicio = posicaoDoTile(2, 2, g);
    expect(mover(inicio, 'baixo', 0, colisao.bloqueado, g)).toEqual(inicio);
  });

  it('libera tiles da porta quando liberados (porta aberta)', () => {
    const c = new ColisaoDoMapa(grade);
    expect(c.bloqueado(4, 2)).toBe(true);
    c.liberarRetangulo(4, 2, 1, 2);
    expect(c.bloqueado(4, 2)).toBe(false);
    expect(c.bloqueado(4, 3)).toBe(false);
    expect(c.bloqueado(4, 1)).toBe(true);
  });

  it('fora do mapa conta como bloqueado', () => {
    expect(colisao.bloqueado(-1, 0)).toBe(true);
    expect(colisao.bloqueado(99, 0)).toBe(true);
  });

  it('pés na linha do tile e centro dos pés na fórmula do ADR (v1: +8 e +20 px)', () => {
    const p = posicaoDoTile(2, 3, g);
    expect(p.y + g.pes.dy + g.pes.h).toBe(4 * tile - 0); // base da caixa dos pés cai no fim da linha 3
    const c = centroDosPes(p, g);
    expect(c.x - p.x).toBe(8 * (tile / 16));
    expect(c.y - p.y).toBe(20 * (tile / 16));
  });
});

/** Objeto interativo de teste, em tiles (fração permitida: os 2,25 vêm de px não alinhados). */
/** Objeto de jogo de 1 tile (ADR-004 seção 6); `nome` vai em dados. */
const obj = (nome: string, tx: number, ty: number) => ({ tipo: 'bilhete', x: tx, y: ty, dados: { nome } });

describe.each([16, 32])('interação tolerante (GDD 14.9.2, casos Q1 a Q9), tile %i', (tile) => {
  const g = geometriaParaTile(tile);
  /** Posição do sprite (pés no tile tx,ty), como no jogo. */
  const em = (tx: number, ty: number): Posicao => posicaoDoTile(tx, ty, g);

  it('Q1: de frente, no tile colado ao objeto, centrado: aciona', () => {
    expect(alvoDaInteracao([obj('interruptor', 3, 2)], em(2, 2), 'direita', g)?.dados.nome).toBe('interruptor');
  });

  it('Q2: de frente, no tile colado, desalinhado 1 tile para baixo: aciona', () => {
    expect(alvoDaInteracao([obj('interruptor', 3, 3)], em(2, 2), 'direita', g)?.dados.nome).toBe('interruptor');
  });

  it('Q3: de frente, com um tile vazio entre: não aciona', () => {
    expect(alvoDaInteracao([obj('interruptor', 4, 2)], em(2, 2), 'direita', g)).toBeUndefined();
  });

  it('Q4: encostado de lado, olhando para o lado oposto: aciona', () => {
    expect(alvoDaInteracao([obj('bilhete', 1, 2)], em(2, 2), 'direita', g)?.dados.nome).toBe('bilhete');
  });

  it('Q5: só na diagonal (canto): não aciona', () => {
    expect(alvoDaInteracao([obj('bilhete', 3, 1)], em(2, 2), 'direita', g)).toBeUndefined();
  });

  it('Q6: porta e bilhete juntos no hall: o da frente vence', () => {
    // Hall (GDD 14.2): bilhete no tile (13,3), porta no tile (14,4) de 1×2 tiles. Jogador em (13,4).
    const hall = [obj('bilhete_porta', 13, 3), obj('porta_casa', 14, 4)];
    expect(alvoDaInteracao(hall, em(13, 4), 'direita', g)?.dados.nome).toBe('porta_casa');
    expect(alvoDaInteracao(hall, em(13, 4), 'cima', g)?.dados.nome).toBe('bilhete_porta');
  });

  it('Q6b: sem nenhum na frente, vence o encostado mais próximo', () => {
    // Jogador em (2,2) olhando para cima. Esquerda: folga de 2 px (1/8 de tile). Direita: folga de 4 px (1/4 de tile).
    const pos = em(2, 2);
    const esquerda = obj('esquerda', 1, 2.25);
    const direita = obj('direita_perto', 3.125, 2.25);
    expect(alvoDaInteracao([direita, esquerda], pos, 'cima', g)?.dados.nome).toBe('esquerda');
  });

  it('Q7: spawn ao lado da árvore, de frente para ela: aciona na primeira tentativa', () => {
    // Árvore em (22,5), 1 tile; spawn em (21,5) olhando para a direita.
    expect(alvoDaInteracao([obj('arvore', 22, 5)], em(21, 5), 'direita', g)?.dados.nome).toBe('arvore');
  });

  it('Q8 e Q9 são tratados fora do alvo: a regra geométrica não sabe de estado', () => {
    expect(alvoDaInteracao([obj('porta_casa', 14, 4)], em(13, 4), 'direita', g)?.dados.nome).toBe('porta_casa');
  });

  it('desempate na frente: o objeto mais próximo do centro do quadrado vence', () => {
    const perto = obj('perto', 3, 2.25);
    const longe = obj('longe', 3, 2.75);
    expect(alvoDaInteracao([longe, perto], em(2, 2), 'direita', g)?.dados.nome).toBe('perto');
  });

  it('empate: vence o primeiro da lista', () => {
    const a = obj('primeiro', 3, 2.5);
    const b = obj('segundo', 3, 2.5);
    expect(alvoDaInteracao([a, b], em(2, 2), 'direita', g)?.dados.nome).toBe('primeiro');
  });
});

describe('fluxo de sessão: casos de uso sem persistência', () => {
  it('porta com código certo avança a fase; certo de outro sobrinho é errado', () => {
    const sessao = new SessaoDeJogo();
    new IniciarNovoJogo(sessao).executar('bibi');
    new ConcluirFase(sessao).executar('introducao');
    const tentar = new TentarCodigoDaPorta(sessao);
    expect(tentar.executar('017')).toEqual({ tipo: 'errado', mensagem: 0 });
    expect(tentar.executar('020')).toEqual({ tipo: 'certo' });
    expect(sessao.fase).toBe('luzes');
    expect(sessao.portaAberta()).toBe(true);
    expect(tentar.executar('020')).toEqual({ tipo: 'ja_aberta' });
  });

  it('mensagens de erro alternam 0, 1, 2 e voltam a 0 (GDD 14.1)', () => {
    const sessao = new SessaoDeJogo();
    new IniciarNovoJogo(sessao).executar('lolo');
    new ConcluirFase(sessao).executar('introducao');
    const tentar = new TentarCodigoDaPorta(sessao);
    const ordem = [0, 1, 2, 0, 1].map(() => tentar.executar('999'));
    expect(ordem.map((r) => (r.tipo === 'errado' ? r.mensagem : -1))).toEqual([0, 1, 2, 0, 1]);
  });

  it('código incompleto não conta erro para a mensagem', () => {
    const sessao = new SessaoDeJogo();
    new IniciarNovoJogo(sessao).executar('lolo');
    new ConcluirFase(sessao).executar('introducao');
    expect(new TentarCodigoDaPorta(sessao).executar('01')).toEqual({ tipo: 'incompleto' });
  });

  it('interruptor só acende na fase luzes e uma vez', () => {
    const sessao = new SessaoDeJogo();
    new IniciarNovoJogo(sessao).executar('tutu');
    const acender = new AcenderLuzes(sessao);
    expect(acender.executar()).toBe(false);
    new ConcluirFase(sessao).executar('introducao');
    new TentarCodigoDaPorta(sessao).executar('024');
    expect(sessao.luzesAcesas()).toBe(false);
    expect(acender.executar()).toBe(true);
    expect(sessao.luzesAcesas()).toBe(true);
    expect(acender.executar()).toBe(false);
  });

  it('primeiraVez marca o aviso só uma vez por partida', () => {
    const sessao = new SessaoDeJogo();
    new IniciarNovoJogo(sessao).executar('lolo');
    expect(sessao.primeiraVez('escuro')).toBe(true);
    expect(sessao.primeiraVez('escuro')).toBe(false);
    new IniciarNovoJogo(sessao).executar('lolo');
    expect(sessao.primeiraVez('escuro')).toBe(true);
  });
});
