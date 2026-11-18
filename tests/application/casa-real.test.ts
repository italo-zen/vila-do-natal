import { expect, it, describe } from 'vitest';
import { areasReais, entradaReal } from '../helpers/areasReais';
import { missoesReais } from '../helpers/missoesReais';
import { ColisaoDoMapa, geometriaDoSobrinho, mover, posicaoCentralizadaNoTile } from '../../src/application/mundo/movimento';
import { bloqueiosDaSubarea, deslocamentoDaSubarea, estadoDaPorta, resolverPorta } from '../../src/application/mundo/subarea';
import { contextoDaPartida } from '../../src/application/mundo/pecas';
import { portaContraAoAndar } from '../../src/application/mundo/travessia';
import { validarConteudo } from '../../src/application/content/validarConteudo';
import type { PerfilDeArte } from '../../src/application/arte/PerfilDeArte';
import type { Fase } from '../../src/domain/progresso/Fase';

/**
 * A casa real da 1.1.0 (ADR-011; GDD 21.4 e 21.9, PL1 e PL2): estrutura das 9 áreas e das 9 portas geradas pelo conversor.
 * Não depende das peças, da caixa nem das coordenadas das missões (itens 164 e 174): só da forma do conteúdo.
 */
const { manifesto, todos } = areasReais();

/** Tiles de piso por área (ADR-011 seção 1, regra 6). */
const PISO: Record<string, number> = { hall: 8, sala: 70, cozinha: 30, quarto: 13, escritorio: 17, quarto_casal: 24, banheiro1: 12, banheiro_escritorio: 4, quartinho: 6 };

/** As 9 portas e as duas áreas de cada uma (GDD 21.4; ADR-011 seção 4). */
const PORTAS: Record<string, [string, string]> = {
  'hall-sala': ['hall', 'sala'],
  'cozinha-sala': ['cozinha', 'sala'],
  'escritorio-sala': ['escritorio', 'sala'],
  'quarto-sala': ['quarto', 'sala'],
  'quarto_casal-sala': ['quarto_casal', 'sala'],
  'banheiro1-quarto': ['banheiro1', 'quarto'],
  'banheiro_escritorio-escritorio': ['banheiro_escritorio', 'escritorio'],
  'banheiro1-quarto_casal': ['banheiro1', 'quarto_casal'],
  'cozinha-quartinho': ['cozinha', 'quartinho'],
};

describe('casa real 1.1.0: as áreas (PL1)', () => {
  it('o manifesto lista as 9 áreas, e todas são schema 3 com a máscara de paredes', () => {
    expect(manifesto.schemaVersion).toBe(3);
    expect(manifesto.maps.map((m) => m.id).sort()).toEqual(Object.keys(PISO).sort());
    for (const m of todos.values()) expect(m.paredes).toHaveLength(m.altura);
  });

  it.each(Object.entries(PISO))('%s tem %i tiles de piso', (id, n) => {
    const m = todos.get(id)!;
    expect(m.chao.flat().filter((g) => g !== 0)).toHaveLength(n);
  });

  it('a Sala é 11×10 e nenhuma caixa é maior que a tela 15×11', () => {
    const sala = todos.get('sala')!;
    expect([sala.largura, sala.altura]).toEqual([11, 10]);
    for (const m of todos.values()) {
      expect(m.largura).toBeLessThanOrEqual(15);
      expect(m.altura).toBeLessThanOrEqual(11);
    }
  });

  it('as arestas de forma (itens 4′, 23 a 26 e 28) passam em todas as áreas', () => {
    const erros = validarConteudo(entradaReal()).filter((e) => /item (4′|23|24|25|26|28)/.test(e));
    expect(erros).toEqual([]);
  });
});

describe('casa real 1.1.0: as portas (PL2)', () => {
  it('há 9 portas, 18 objetos `porta`, e cada uma está nas duas áreas, com a chegada na outra', () => {
    const objetos = [...todos.values()].flatMap((m) => m.objetos.filter((o) => o.tipo === 'porta').map((o) => ({ area: m.id, o })));
    expect(objetos).toHaveLength(18);
    for (const [id, [a, b]] of Object.entries(PORTAS)) {
      const nas = objetos.filter((x) => x.o.dados.id === id).map((x) => x.area).sort();
      expect(nas, id).toEqual([a, b].sort());
      for (const area of [a, b]) {
        const chegada = todos.get(area)!.objetos.find((o) => o.tipo === 'spawn' && o.dados.nome === id);
        const porta = todos.get(area)!.objetos.find((o) => o.tipo === 'porta' && o.dados.id === id)!;
        expect(chegada, `${area}/${id}`).toMatchObject({ x: porta.x, y: porta.y });
      }
    }
  });

  it('só a `hall-sala` tem código (trancadaAte porta), nos dois lados', () => {
    const trancadas = [...todos.values()].flatMap((m) => m.objetos.filter((o) => o.tipo === 'porta' && o.dados.trancadaAte !== undefined).map((o) => `${m.id}/${String(o.dados.id)}/${String(o.dados.trancadaAte)}`));
    expect(trancadas.sort()).toEqual(['hall/hall-sala/porta', 'sala/hall-sala/porta']);
  });

  it('as quatro áreas fechadas ficam fora de todo `missions[].maps`', () => {
    const abertas = new Set(manifesto.missions.flatMap((m) => m.maps));
    for (const id of ['quarto_casal', 'banheiro1', 'banheiro_escritorio', 'quartinho']) expect(abertas.has(id), id).toBe(false);
    for (const id of ['hall', 'sala', 'cozinha', 'quarto', 'escritorio']) expect(abertas.has(id), id).toBe(true);
  });

  it('o motor decide o estado pela missão: quarto_casal-sala, banheiro1-quarto, banheiro_escritorio-escritorio e cozinha-quartinho (lado aberto) são sempre fechadas; hall-sala tem código até a fase `porta`', () => {
    const missoes = missoesReais();
    // Parte 1 em andamento: a introdução, a porta e as luzes já foram concluídas.
    const concluida = (f: Fase) => f === 'introducao' || f === 'porta' || f === 'luzes';
    const ctx = contextoDaPartida(missoes, concluida);
    const estado = (area: string, id: string) => estadoDaPorta(todos.get(area)!.objetos.find((o) => o.tipo === 'porta' && o.dados.id === id)!, concluida, ctx);
    expect(estado('sala', 'quarto_casal-sala')).toBe('fechada');
    expect(estado('quarto', 'banheiro1-quarto')).toBe('fechada');
    expect(estado('escritorio', 'banheiro_escritorio-escritorio')).toBe('fechada');
    expect(estado('cozinha', 'cozinha-quartinho')).toBe('fechada');
    expect(estado('sala', 'cozinha-sala')).toBe('aberta');
    expect(estado('sala', 'escritorio-sala')).toBe('aberta');
    expect(estado('sala', 'quarto-sala')).toBe('aberta');
    expect(estado('sala', 'hall-sala')).toBe('aberta');
    // No começo (nada concluído) só Hall, Sala e Cozinha estão abertos, e a hall-sala tem código.
    const ctx0 = contextoDaPartida(missoes, () => false);
    const estado0 = (area: string, id: string) => estadoDaPorta(todos.get(area)!.objetos.find((o) => o.tipo === 'porta' && o.dados.id === id)!, () => false, ctx0);
    expect(estado0('sala', 'hall-sala')).toBe('trancada');
    expect(estado0('hall', 'hall-sala')).toBe('trancada');
    expect(estado0('sala', 'escritorio-sala')).toBe('fechada');
  });
});

describe('casa real 1.1.0: andar contra a porta do Hall (ADR-011 seção 3.4)', () => {
  const perfil = JSON.parse(JSON.stringify(entradaReal().perfil)) as PerfilDeArte;
  const g = geometriaDoSobrinho(perfil);
  const hall = todos.get('hall')!;
  const d = deslocamentoDaSubarea(hall, perfil.sala);
  const colisao = new ColisaoDoMapa(bloqueiosDaSubarea(hall, () => true), hall.paredes);
  const bloqueado = (tx: number, ty: number) => colisao.bloqueado(tx - d.x, ty - d.y);
  const parede = (tx: number, ty: number, lado: 'cima' | 'baixo' | 'esquerda' | 'direita') => colisao.parede(tx - d.x, ty - d.y, lado);
  const porta = hall.objetos.find((o) => o.tipo === 'porta')!;
  const portaNaTela = { x: porta.x + d.x, y: porta.y + d.y, lado: 'cima' as const, objeto: porta };

  it('na chegada (spawn do Hall, centralizado no tile da porta) o sobrinho está a 8 px da linha e não dispara; empurrando para cima, encosta e dispara', () => {
    const p = posicaoCentralizadaNoTile(porta.x + d.x, porta.y + d.y, g);
    expect(portaContraAoAndar(p, 'cima', [portaNaTela], g)).toBeUndefined();
    const encostado = mover(p, 'cima', 100, bloqueado, g, parede);
    expect(encostado.y).toBeLessThan(p.y);
    expect(portaContraAoAndar(encostado, 'cima', [portaNaTela], g)).toBe(portaNaTela);
  });

  it('com código a porta só para; com a fase `porta` concluída, leva à Sala no spawn hall-sala', () => {
    const ctx = contextoDaPartida(missoesReais(), () => false);
    expect(resolverPorta(porta, () => false, ctx)).toEqual({ tipo: 'trancada' });
    expect(resolverPorta(porta, (f) => f === 'porta', ctx)).toEqual({ tipo: 'entrar', mapa: 'sala', spawn: 'hall-sala' });
  });
});
