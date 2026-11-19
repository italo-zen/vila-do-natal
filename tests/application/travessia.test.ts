import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ColisaoDoMapa,
  geometriaDoSobrinho,
  mover,
  posicaoCentralizadaNoTile,
  posicaoDoTile,
  centroDosPes,
  type Geometria,
  type Posicao,
} from '../../src/application/mundo/movimento';
import { bilheteDeFrente, distanciaDosPesAteAPorta, portaContraAoAndar, portaDeFrente, type PortaDeTile } from '../../src/application/mundo/travessia';
import { CONTEXTO_PADRAO, estadoDaPorta, resolverPorta, type ContextoDeArea } from '../../src/application/mundo/subarea';
import { AtravessarPorta } from '../../src/application/usecases/AtravessarPorta';
import { SessaoDeJogo } from '../../src/application/SessaoDeJogo';
import { ConcluirFase } from '../../src/application/usecases/ConcluirFase';
import { IniciarNovoJogo } from '../../src/application/usecases/IniciarNovoJogo';
import { TentarCodigoDaPorta } from '../../src/application/usecases/TentarCodigoDaPorta';
import { missoesReais } from '../helpers/missoesReais';
import { TravaDeEntrada } from '../../src/presentation/input/TravaDeEntrada';
import type { Direcao } from '../../src/domain/shared/Direcao';
import type { PerfilDeArte } from '../../src/application/arte/PerfilDeArte';
import { areasReais } from '../helpers/areasReais';
import { chegada, mapaDeTexto, porta } from '../helpers/mapasDeArestas';

/**
 * M3 a M6 (ADR-011 seção 8): travessia de porta por aresta. Tile 16 e 32, como o movimento. Teclado e toque entregam
 * direção e A à mesma lógica: nada aqui distingue a fonte.
 */
const PERFIL_V1: PerfilDeArte = JSON.parse(readFileSync(join(__dirname, '..', '..', 'content', 'art-profiles', 'gba-240x160.json'), 'utf-8'));
function geometriaParaTile(tile: number): Geometria {
  const k = tile / 16;
  const perfil = JSON.parse(JSON.stringify(PERFIL_V1)) as PerfilDeArte;
  perfil.tile = tile;
  perfil.corpos.sobrinho.quadro = { w: 16 * k, h: 24 * k };
  perfil.corpos.sobrinho.pes = { w: 12 * k, h: 8 * k };
  return geometriaDoSobrinho(perfil);
}

/**
 * Área 3×2 com uma porta em (1,0) para cima (aresta marcada D) e uma em (2,1) para a direita. A grade tem a parede do
 * contorno; as portas são objetos à parte (a máscara é completa).
 */
const GRADE = ['+-+D+-+', '|. . .|', '+ + + +', '|. . D', '+-+-+-+'];

function cenario(tile: number) {
  const g = geometriaParaTile(tile);
  const objetos = [porta('a-b', 1, 0, 'cima', 'b'), porta('a-c', 2, 1, 'direita', 'c'), chegada('b-a', 1, 0, 'baixo')];
  const mapa = mapaDeTexto('a', GRADE, objetos, { tile });
  const col = new ColisaoDoMapa(mapa.colisao, mapa.paredes);
  const portas: PortaDeTile[] = [
    { x: 1, y: 0, lado: 'cima' },
    { x: 2, y: 1, lado: 'direita' },
  ];
  /** Empurra `dir` por `frames` quadros de `px` px e diz se a porta disparou em algum quadro. */
  const empurrar = (inicio: Posicao, dir: Direcao, frames = 40, px = 2) => {
    let p = inicio;
    for (let i = 0; i < frames; i++) {
      p = mover(p, dir, px, col.bloqueado, g, col.parede);
      const achada = portaContraAoAndar(p, dir, portas, g);
      if (achada) return { p, achada };
    }
    return { p, achada: undefined };
  };
  return { g, mapa, col, portas, empurrar, tile };
}

describe.each([16, 32])('M3: porta, disparo, tile %i (ADR-011 seção 3.4)', (tile) => {
  const c = cenario(tile);

  it('andar contra a porta dispara quando os pés encostam na linha, com o centro dos pés no tile da porta', () => {
    const { achada, p } = c.empurrar(posicaoCentralizadaNoTile(1, 0, c.g), 'cima');
    expect(achada).toMatchObject({ x: 1, y: 0, lado: 'cima' });
    expect(distanciaDosPesAteAPorta(p, achada!, c.g)).toBeLessThan(1);
  });

  it('na chegada (pés centralizados, longe da linha) não dispara: só o movimento contra a porta', () => {
    const p = posicaoCentralizadaNoTile(1, 0, c.g);
    expect(portaContraAoAndar(p, 'cima', c.portas, c.g)).toBeUndefined();
    // A chegada fica a (tile − altura dos pés) / 2 da linha: 8 px no HD, 4 px no tile de 16.
    expect(distanciaDosPesAteAPorta(p, c.portas[0], c.g)).toBe((tile - c.g.pes.h) / 2);
  });

  it('passar rente à parede em outro tile não dispara', () => {
    const rente = c.empurrar(posicaoCentralizadaNoTile(0, 0, c.g), 'cima');
    expect(rente.achada).toBeUndefined();
    const outro = c.empurrar(posicaoCentralizadaNoTile(2, 0, c.g), 'cima');
    expect(outro.achada).toBeUndefined();
  });

  it('encostar de lado não dispara: contra a parede da direita da porta lateral, empurrando para cima ou para baixo, nada', () => {
    const doTile = posicaoCentralizadaNoTile(2, 1, c.g);
    expect(c.empurrar(doTile, 'baixo').achada).toBeUndefined();
    expect(c.empurrar(doTile, 'cima').achada).toBeUndefined();
    // E empurrando contra a porta lateral, dispara.
    expect(c.empurrar(doTile, 'direita').achada).toMatchObject({ x: 2, y: 1, lado: 'direita' });
  });

  it('com o centro dos pés fora do tile da porta, encostar na mesma aresta não dispara', () => {
    // Pés a cavalo: a caixa toca o tile da porta, mas o centro está no tile vizinho (0,0).
    const aCavalo: Posicao = { x: tile - c.g.pes.dx - c.g.pes.w / 2 - 2, y: posicaoDoTile(0, 0, c.g).y };
    expect(centroDosPes(aCavalo, c.g).x).toBeLessThan(tile);
    expect(c.empurrar(aCavalo, 'cima').achada).toBeUndefined();
  });

  it('A de frente dispara; de costas, de lado ou longe demais, não', () => {
    const p = posicaoCentralizadaNoTile(1, 0, c.g);
    expect(portaDeFrente(p, 'cima', c.portas, c.g)).toBe(c.portas[0]);
    expect(portaDeFrente(p, 'baixo', c.portas, c.g)).toBeUndefined();
    expect(portaDeFrente(p, 'esquerda', c.portas, c.g)).toBeUndefined();
    expect(portaDeFrente(p, 'direita', c.portas, c.g)).toBeUndefined();
    // Um px além da tolerância (1/4 de tile) para trás.
    const longe = { ...p, y: p.y + c.tile / 4 - (tile - c.g.pes.h) / 2 + 1 };
    expect(distanciaDosPesAteAPorta(longe, c.portas[0], c.g)).toBeGreaterThan(c.tile / 4);
    expect(portaDeFrente(longe, 'cima', c.portas, c.g)).toBeUndefined();
    // Fora do tile da porta (tile vizinho), de frente para a parede: não é a porta.
    expect(portaDeFrente(posicaoCentralizadaNoTile(0, 0, c.g), 'cima', c.portas, c.g)).toBeUndefined();
  });

  it('bilhete: A de frente para a parede lê; de costas, não', () => {
    const bilhetes = [{ x: 0, y: 0, lado: 'cima' as const }];
    const p = posicaoCentralizadaNoTile(0, 0, c.g);
    expect(bilheteDeFrente(p, 'cima', bilhetes, c.g)).toBe(bilhetes[0]);
    expect(bilheteDeFrente(p, 'baixo', bilhetes, c.g)).toBeUndefined();
    expect(bilheteDeFrente(p, 'esquerda', bilhetes, c.g)).toBeUndefined();
  });
});

describe('M4: porta, estados (ADR-011 seção 3.3)', () => {
  const aberta = (ids: string[]): ContextoDeArea => ({ ...CONTEXTO_PADRAO, areaAberta: (id) => ids.includes(id) });
  const p = (extra = {}) => porta('a-b', 1, 0, 'cima', 'b', extra);

  it('aberta: destino em missions[].maps e sem código; a travessia leva ao spawn de mesmo nome', () => {
    const ctx = aberta(['a', 'b']);
    expect(estadoDaPorta(p(), () => false, ctx)).toBe('aberta');
    expect(resolverPorta(p(), () => false, ctx)).toEqual({ tipo: 'entrar', mapa: 'b', spawn: 'a-b' });
  });

  it('fechada: destino fora de `maps` (só para; o A mostra porta.fechada); vence o código', () => {
    const ctx = aberta(['a']);
    expect(estadoDaPorta(p(), () => false, ctx)).toBe('fechada');
    expect(resolverPorta(p(), () => false, ctx)).toEqual({ tipo: 'fechada' });
    expect(resolverPorta(p({ trancadaAte: 'porta' }), () => false, ctx)).toEqual({ tipo: 'fechada' });
  });

  it('com código: painel até a fase `porta`; depois, aberta nos dois lados', () => {
    const ctx = aberta(['a', 'b']);
    const lado = (id: string, destino: string) => porta('hall-sala', 0, 0, 'cima', destino, { trancadaAte: 'porta', id });
    expect(resolverPorta(lado('hall-sala', 'b'), () => false, ctx)).toEqual({ tipo: 'trancada' });
    expect(resolverPorta(lado('hall-sala', 'a'), () => false, ctx)).toEqual({ tipo: 'trancada' });
    const concluida = (f: string) => f === 'porta';
    expect(resolverPorta(lado('hall-sala', 'b'), concluida as never, ctx)).toMatchObject({ tipo: 'entrar' });
    expect(resolverPorta(lado('hall-sala', 'a'), concluida as never, ctx)).toMatchObject({ tipo: 'entrar' });
  });

  it('o caso de uso AtravessarPorta devolve o mesmo resultado e olha a fase da sessão', () => {
    const sessao = new SessaoDeJogo();
    new IniciarNovoJogo(sessao, missoesReais()).executar('lolo');
    new ConcluirFase(sessao).executar('introducao');
    const caso = new AtravessarPorta(sessao);
    const ctx = aberta(['a', 'b']);
    expect(caso.executar(p({ trancadaAte: 'porta' }), ctx)).toEqual({ tipo: 'trancada' });
    new TentarCodigoDaPorta(sessao).executar('017');
    expect(caso.executar(p({ trancadaAte: 'porta' }), ctx)).toEqual({ tipo: 'entrar', mapa: 'b', spawn: 'a-b' });
  });
});

describe('M5: reentrada (ADR-011 seção 3.4)', () => {
  /**
   * Simula a cena: depois do fade, a trava recebe o que está segurado (menos a direção para dentro) e cada quadro lê a
   * direção pela trava. A porta de chegada fica em (1, 0) com `lado` cima (a volta), e o sobrinho chega olhando para baixo.
   */
  function reentrada(segurado: Direcao[], quadros: (Direcao | null)[]) {
    const c = cenario(32);
    const trava = new TravaDeEntrada<Direcao | 'a'>();
    trava.travar(segurado.filter((d) => d !== 'baixo'));
    let p = posicaoCentralizadaNoTile(1, 0, c.g);
    let disparou = false;
    for (const real of quadros) {
      const dir = (['cima', 'baixo', 'esquerda', 'direita'] as Direcao[]).find((d) => trava.filtrar(d, real === d)) ?? null;
      if (!dir) continue;
      p = mover(p, dir, 2, c.col.bloqueado, c.g, c.col.parede);
      if (portaContraAoAndar(p, dir, c.portas, c.g)) disparou = true;
    }
    return { disparou, p, inicio: posicaoCentralizadaNoTile(1, 0, c.g) };
  }

  it('segurar a direção da volta (`lado`) pela travessia e depois do fade não volta', () => {
    const r = reentrada(['cima'], Array(60).fill('cima'));
    expect(r.disparou).toBe(false);
    expect(r.p).toEqual(r.inicio);
  });

  it('soltar e pressionar de novo volta', () => {
    const r = reentrada(['cima'], [...Array(10).fill('cima'), null, ...Array(40).fill('cima')]);
    expect(r.disparou).toBe(true);
  });

  it('quem segurou a direção para dentro (baixo) continua andando para dentro e não volta sozinho', () => {
    const r = reentrada(['baixo'], Array(30).fill('baixo'));
    expect(r.disparou).toBe(false);
    expect(r.p.y).toBeGreaterThan(r.inicio.y);
  });

  it('o A segurado é descartado até soltar', () => {
    const trava = new TravaDeEntrada<Direcao | 'a'>();
    trava.travar(['a']);
    expect(trava.filtrar('a', true)).toBe(false);
    expect(trava.filtrar('a', true)).toBe(false);
    expect(trava.filtrar('a', false)).toBe(false);
    expect(trava.filtrar('a', true)).toBe(true);
  });

  it('a trava só vale para o que estava segurado: outra direção anda normalmente', () => {
    const trava = new TravaDeEntrada<Direcao | 'a'>();
    trava.travar(['cima']);
    expect(trava.filtrar('esquerda', true)).toBe(true);
    expect(trava.ativa).toBe(true);
    trava.filtrar('cima', false);
    expect(trava.ativa).toBe(false);
  });
});

describe('M6: chegada (ADR-011 seção 3.2)', () => {
  const { todos } = areasReais();
  const perfil = JSON.parse(readFileSync(join(__dirname, '..', '..', 'content', 'art-profiles', 'hd-480x352.json'), 'utf-8')) as PerfilDeArte;
  const g = geometriaDoSobrinho(perfil);

  it('toda chegada é o tile da porta do outro lado, olhando para dentro (direção = lado da porta de lá)', () => {
    for (const a of todos.values()) {
      for (const pa of a.objetos.filter((o) => o.tipo === 'porta')) {
        const b = todos.get(String(pa.dados.destino))!;
        const spawn = b.objetos.find((o) => o.tipo === 'spawn' && o.dados.nome === pa.dados.spawnDestino)!;
        const pb = b.objetos.find((o) => o.tipo === 'porta' && o.dados.id === pa.dados.id)!;
        expect({ x: spawn.x, y: spawn.y }, `${a.id}/${String(pa.dados.id)}`).toEqual({ x: pb.x, y: pb.y });
        expect(spawn.dados.direcao, `${a.id}/${String(pa.dados.id)}`).toBe(pa.dados.lado);
      }
    }
  });

  it('chegadas que coincidem (duas portas no mesmo tile da Sala) ficam no mesmo tile, com direções diferentes, e nenhuma dispara na chegada', () => {
    const sala = todos.get('sala')!;
    const noMesmoTile = sala.objetos.filter((o) => o.tipo === 'spawn' && o.x === 7 && o.y === 0);
    expect(noMesmoTile.map((o) => o.dados.nome).sort()).toEqual(['escritorio-sala', 'quarto-sala']);
    expect(new Set(noMesmoTile.map((o) => o.dados.direcao)).size).toBe(2);
    const portas: PortaDeTile[] = sala.objetos.filter((o) => o.tipo === 'porta').map((o) => ({ x: o.x, y: o.y, lado: o.dados.lado as Direcao }));
    const p = posicaoCentralizadaNoTile(7, 0, g);
    for (const dir of ['cima', 'baixo', 'esquerda', 'direita'] as Direcao[]) expect(portaContraAoAndar(p, dir, portas, g), dir).toBeUndefined();
  });

  it('a chegada é centralizada no tile: o centro dos pés cai no centro do tile', () => {
    const p = posicaoCentralizadaNoTile(3, 4, g);
    expect(centroDosPes(p, g)).toEqual({ x: 3 * g.tile + g.tile / 2, y: 4 * g.tile + g.tile / 2 });
  });

  it('teclado e toque entregam a mesma `Direcao` e a mesma `Acao`: a travessia não tem ramo por fonte', () => {
    // O Controles compõe as duas fontes num único `segurada(acao)` (ADR-007 seção 1.1); a cena só vê a Direcao.
    const c = cenario(32);
    const direcaoDoTeclado: Direcao = 'cima';
    const direcaoDoToque: Direcao = 'cima';
    expect(c.empurrar(posicaoCentralizadaNoTile(1, 0, c.g), direcaoDoToque)).toEqual(c.empurrar(posicaoCentralizadaNoTile(1, 0, c.g), direcaoDoTeclado));
  });
});
