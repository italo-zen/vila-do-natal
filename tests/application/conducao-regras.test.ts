import { lerConteudoDoDisco } from '../helpers/conteudoReal';
import { describe, expect, it } from 'vitest';
import { calcularRotaDeConducao, CUSTO_DA_PORTA } from '../../src/application/mundo/conducao';
import { fatorDaConducao } from '../../src/domain/progresso/Conducao';
import { CarregarConteudo } from '../../src/application/usecases/CarregarConteudo';
import { ContentSourceDeArquivos } from '../../src/infrastructure/content/ContentSourceDeArquivos';
import { AcenderLuzes } from '../../src/application/usecases/AcenderLuzes';
import { ConcluirFase } from '../../src/application/usecases/ConcluirFase';
import { SessaoDeJogo } from '../../src/application/SessaoDeJogo';
import { TentarCodigoDaPorta } from '../../src/application/usecases/TentarCodigoDaPorta';
import type { MapaDoJogo } from '../../src/application/content/Mapa';
import { descreverComConteudoNovo } from '../helpers/conteudoNovo';
import { chegada, mapaDeTexto, porta } from '../helpers/mapasDeArestas';
import { iniciarComReferencia } from '../helpers/planoDeReferencia';

/** Mapa de teste: corredor horizontal de `n` tiles de piso livre, com objetos extras opcionais. */
function corredor(id: string, n: number, objetos: MapaDoJogo['objetos'] = []): MapaDoJogo {
  const meio = '|' + '. '.repeat(n - 1) + '.|';
  const cima = '+' + '-+'.repeat(n);
  return mapaDeTexto(id, [cima, meio, cima], objetos);
}

describe('condução: limite de velocidade pela rota (GDD 14.11.3; ADR-004 11.3)', () => {
  const sem = () => true;
  it('rota de 10 passos é normal; de 11 passos é 2×', () => {
    const r10 = calcularRotaDeConducao(new Map([['a', corredor('a', 11)]]), { mapa: 'a', x: 0, y: 0 }, { mapa: 'a', x: 10, y: 0 }, sem);
    const r11 = calcularRotaDeConducao(new Map([['a', corredor('a', 12)]]), { mapa: 'a', x: 0, y: 0 }, { mapa: 'a', x: 11, y: 0 }, sem);
    expect(r10?.passos).toBe(10);
    expect(fatorDaConducao(r10!.passos)).toBe(1);
    expect(r11?.passos).toBe(11);
    expect(fatorDaConducao(r11!.passos)).toBe(2);
  });
});

describe('condução entre áreas: porta com fade (ADR-011 seções 3.4 e 5.3)', () => {
  // Área A: piso de 4 tiles, porta a-b em (3,0) com lado direita. Área B: piso de 5 tiles, porta a-b em (0,0) com lado
  // esquerda, e a chegada a-b nesse tile. A rota passa pela porta: 3 passos até o tile da porta, 1 da porta (CUSTO_DA_PORTA)
  // e 4 até o destino em B (4, 0) = 8 passos.
  const A = corredor('a', 4, [porta('a-b', 3, 0, 'direita', 'b'), chegada('b-a', 3, 0, 'esquerda')]);
  const B = corredor('b', 5, [porta('a-b', 0, 0, 'esquerda', 'a', { destino: 'a', spawnDestino: 'b-a' }), chegada('a-b', 0, 0, 'direita')]);
  const mapas = new Map([['a', A], ['b', B]]);

  it('o trajeto de A a (4,0) de B atravessa a porta: custo 8, e o nó de chegada é o spawn a-b no tile da porta de B', () => {
    const r = calcularRotaDeConducao(mapas, { mapa: 'a', x: 0, y: 0 }, { mapa: 'b', x: 4, y: 0 }, () => true);
    expect(r?.passos).toBe(8);
    expect(CUSTO_DA_PORTA).toBe(1);
    const i = r!.nos.findIndex((n) => n.mapa === 'b' && n.spawn === 'a-b');
    expect(i).toBeGreaterThan(0);
    expect(r!.nos[i - 1]).toEqual({ mapa: 'a', x: 3, y: 0 });
    expect(r!.nos[i]).toMatchObject({ mapa: 'b', x: 0, y: 0 });
    expect(r!.nos.slice(0, i).every((n) => n.mapa === 'a')).toBe(true);
  });

  it('porta com código (fase ainda não concluída) não é usada: sem rota', () => {
    const Atr = corredor('a', 4, [porta('a-b', 3, 0, 'direita', 'b', { trancadaAte: 'porta' })]);
    const r = calcularRotaDeConducao(new Map([['a', Atr], ['b', B]]), { mapa: 'a', x: 0, y: 0 }, { mapa: 'b', x: 4, y: 0 }, () => false);
    expect(r).toBeNull();
  });
});

describe('condução uma vez por partida (GDD 14.11.3, "Uma vez por partida")', () => {
  it('a luz (e portanto a condução que a segue) só acontece uma vez por partida', () => {
    const sessao = new SessaoDeJogo();
    iniciarComReferencia(sessao).executar('lolo');
    new ConcluirFase(sessao).executar('introducao');
    new TentarCodigoDaPorta(sessao).executar('017');
    const acender = new AcenderLuzes(sessao);
    expect(acender.executar()).toBe(true);
    expect(acender.executar()).toBe(false);
  });

  it('nova partida ("Começar") pode ter a condução de novo', () => {
    const sessao = new SessaoDeJogo();
    iniciarComReferencia(sessao).executar('lolo');
    new ConcluirFase(sessao).executar('introducao');
    new TentarCodigoDaPorta(sessao).executar('017');
    new AcenderLuzes(sessao).executar();
    iniciarComReferencia(sessao).executar('lolo');
    expect(sessao.luzesAcesas()).toBe(false);
  });
});

descreverComConteudoNovo('cozinha: Fogão, Pia e Geladeira como examináveis em tiles bloqueados (planta 1.1.0)', () => {
  it('os três examináveis ficam Fogão (4,0), Pia (5,1) e Geladeira (2,2), nos móveis novos, bloqueados', async () => {
    const c = await new CarregarConteudo(new ContentSourceDeArquivos(lerConteudoDoDisco())).executar();
    const coz = c.todosOsMapas.get('cozinha')!;
    const em = (texto: string) => coz.objetos.find((o) => o.tipo === 'examinavel' && o.dados.texto === texto);
    expect(em('cozinha.fogao')).toMatchObject({ x: 4, y: 0 });
    expect(em('cozinha.pia')).toMatchObject({ x: 5, y: 1 });
    expect(em('cozinha.geladeira')).toMatchObject({ x: 2, y: 2 });
    // Cada examinável está sobre o móvel de mesmo nome (fogao, pia 1×3, geladeira), e o tile é bloqueado.
    for (const [x, y, movel] of [[4, 0, 'fogao'], [5, 1, 'pia'], [2, 2, 'geladeira']] as const) {
      expect(coz.colisao[y][x], `${x},${y}`).toBe(true);
      const m = coz.objetos.find((o) => o.tipo === 'movel' && o.dados.id === movel)!;
      expect(x >= m.x && x < m.x + Number(m.dados.w) && y >= m.y && y < m.y + Number(m.dados.h), movel).toBe(true);
    }
  });
});
