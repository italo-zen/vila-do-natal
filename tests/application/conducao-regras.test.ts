import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { calcularRotaDeConducao } from '../../src/application/mundo/conducao';
import { fatorDaConducao } from '../../src/domain/progresso/Conducao';
import { CarregarConteudo } from '../../src/application/usecases/CarregarConteudo';
import { ContentSourceDeArquivos } from '../../src/infrastructure/content/ContentSourceDeArquivos';
import { AcenderLuzes } from '../../src/application/usecases/AcenderLuzes';
import { IniciarNovoJogo } from '../../src/application/usecases/IniciarNovoJogo';
import { ConcluirFase } from '../../src/application/usecases/ConcluirFase';
import { SessaoDeJogo } from '../../src/application/SessaoDeJogo';
import { TentarCodigoDaPorta } from '../../src/application/usecases/TentarCodigoDaPorta';
import type { MapaDoJogo } from '../../src/application/content/Mapa';

/** Mapa de teste: corredor horizontal de `n` tiles de piso livre, com objetos extras opcionais. */
function corredor(id: string, n: number, objetos: MapaDoJogo['objetos'] = []): MapaDoJogo {
  return { id, tileset: 'tiles_casa', tile: 32, largura: n, altura: 1, escuro: false, chao: [Array(n).fill(1)], colisao: [Array(n).fill(false)], objetos };
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

describe('condução entre subáreas: porta com fade (ADR-004 seção 11.4)', () => {
  // Subárea A: piso de 4 tiles, gatilho P1 em (3,0) levando a B, spawn de chegada P1 em B.
  // Subárea B: piso de 5 tiles, spawn de chegada P1 em (1,0). A rota passa pela porta: 3 (até o gatilho)
  // + 3 (vão, gatilho de chegada, spawn) + 3 (até o destino em B) = 9 passos.
  const A = corredor('a', 4, [{ tipo: 'porta', x: 3, y: 0, dados: { id: 'P1', destino: 'b', spawnDestino: 'P1' } }]);
  const B = corredor('b', 5, [{ tipo: 'spawn', x: 1, y: 0, dados: { nome: 'P1', direcao: 'direita' } }]);
  const mapas = new Map([['a', A], ['b', B]]);

  it('o trajeto de A a (4,0) de B atravessa a porta: custo 9, e o nó de chegada é o spawn P1', () => {
    const r = calcularRotaDeConducao(mapas, { mapa: 'a', x: 0, y: 0 }, { mapa: 'b', x: 4, y: 0 }, () => true);
    expect(r?.passos).toBe(9);
    const i = r!.nos.findIndex((n) => n.mapa === 'b' && n.spawn === 'P1');
    expect(i).toBeGreaterThan(0);
    // O gatilho é o último tile de A antes da porta: nada anda por cima dele sem sair por ela.
    expect(r!.nos[i - 1]).toEqual({ mapa: 'a', x: 3, y: 0 });
    expect(r!.nos.slice(0, i).every((n) => n.mapa === 'a')).toBe(true);
  });

  it('porta trancada (fase ainda não concluída) não é usada: sem rota', () => {
    const Atr = corredor('a', 4, [{ tipo: 'porta', x: 3, y: 0, dados: { id: 'P1', destino: 'b', spawnDestino: 'P1', trancadaAte: 'porta' } }]);
    const r = calcularRotaDeConducao(new Map([['a', Atr], ['b', B]]), { mapa: 'a', x: 0, y: 0 }, { mapa: 'b', x: 4, y: 0 }, () => false);
    expect(r).toBeNull();
  });
});

describe('condução uma vez por partida (GDD 14.11.3, "Uma vez por partida")', () => {
  it('a luz (e portanto a condução que a segue) só acontece uma vez por partida', () => {
    const sessao = new SessaoDeJogo();
    new IniciarNovoJogo(sessao).executar('lolo');
    new ConcluirFase(sessao).executar('introducao');
    new TentarCodigoDaPorta(sessao).executar('017');
    const acender = new AcenderLuzes(sessao);
    expect(acender.executar()).toBe(true);
    expect(acender.executar()).toBe(false);
  });

  it('nova partida ("Começar") pode ter a condução de novo', () => {
    const sessao = new SessaoDeJogo();
    new IniciarNovoJogo(sessao).executar('lolo');
    new ConcluirFase(sessao).executar('introducao');
    new TentarCodigoDaPorta(sessao).executar('017');
    new AcenderLuzes(sessao).executar();
    new IniciarNovoJogo(sessao).executar('lolo');
    expect(sessao.luzesAcesas()).toBe(false);
  });
});

describe('cozinha: Geladeira e Forno como colisão, na planta girada (planta: objeto 84, "Forno e Geladeira")', () => {
  const CONTENT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content');
  const lerConteudo = (): Record<string, unknown> => {
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
  };
  // Cozinha girada (6×7, GDD 14.12.2). Pela fórmula (x, y) → (alturaAntes − 1 − y, x), com alturaAntes = 6:
  // Geladeira antes em (2,3) → agora (2,2); Forno antes em (3,3) → agora (2,3); Fogão antes em (0,2) → (3,0).
  // Verificado em content/maps/casa-real/cozinha.json.
  it('a Geladeira é o examinável em (2,2), bloqueado; a colisão antiga (2,2)+(2,3) vira (3,2)+(2,2)', async () => {
    const c = await new CarregarConteudo(new ContentSourceDeArquivos(lerConteudo())).executar();
    const coz = c.todosOsMapas.get('cozinha')!;
    expect(coz.objetos.find((o) => o.tipo === 'examinavel' && o.dados.texto === 'cozinha.geladeira')).toMatchObject({ x: 2, y: 2 });
    expect(coz.colisao[2][2]).toBe(true);
    expect(coz.colisao[2][3]).toBe(true);
  });
  it('o Forno (sem objeto próprio) é colisão em (2,3), girado de (3,3); o Fogão examinável fica em (3,0)', async () => {
    const c = await new CarregarConteudo(new ContentSourceDeArquivos(lerConteudo())).executar();
    const coz = c.todosOsMapas.get('cozinha')!;
    expect(coz.colisao[3][2]).toBe(true);
    expect(coz.objetos.some((o) => o.x === 2 && o.y === 3)).toBe(false);
    expect(coz.objetos.find((o) => o.tipo === 'examinavel' && o.dados.texto === 'cozinha.fogao')).toMatchObject({ x: 3, y: 0 });
  });
});
