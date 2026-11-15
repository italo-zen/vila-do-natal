import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CarregarConteudo } from '../../src/application/usecases/CarregarConteudo';
import { ContentSourceDeArquivos } from '../../src/infrastructure/content/ContentSourceDeArquivos';
import { AcenderLuzes } from '../../src/application/usecases/AcenderLuzes';
import { IniciarNovoJogo } from '../../src/application/usecases/IniciarNovoJogo';
import { ConcluirFase } from '../../src/application/usecases/ConcluirFase';
import { SessaoDeJogo } from '../../src/application/SessaoDeJogo';
import { TentarCodigoDaPorta } from '../../src/application/usecases/TentarCodigoDaPorta';
import { CHAVE_EXAMINADA, CHAVES_DA_CHEGADA, deveAbrirChegada, haloDaArvoreVisivel } from '../../src/application/mundo/chegadaDaArvore';
import { missoesReais } from '../helpers/missoesReais';

/**
 * Chegada da condução à árvore (GDD 14.9.3, 14.11.1 e casos D11 a D14 de 14.11.6). Decisão do Diretor no PT2b
 * (2026-11-08): o diálogo automático começa sozinho ao chegar, uma vez por partida; o pisca para só no primeiro
 * A do jogador na frente da árvore (o diálogo automático não conta como exame).
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
const carregar = () => new CarregarConteudo(new ContentSourceDeArquivos(lerConteudo())).executar();

/** Partida até as luzes acesas (fase "luzes"), como o jogador chega à condução. */
function partidaComLuzes(): SessaoDeJogo {
  const sessao = new SessaoDeJogo();
  new IniciarNovoJogo(sessao, missoesReais()).executar('lolo');
  new ConcluirFase(sessao).executar('introducao');
  new TentarCodigoDaPorta(sessao).executar('017');
  expect(new AcenderLuzes(sessao).executar()).toBe(true);
  return sessao;
}

describe('chegada à árvore: diálogo automático (GDD 14.9.3; D11, D12)', () => {
  it('são duas páginas exatas, as de 14.9.3', async () => {
    const c = await carregar();
    expect(CHAVES_DA_CHEGADA).toEqual(['arvore.nascer.1', 'arvore.nascer.2']);
    expect(c.textos.t('arvore.nascer.1')).toBe('A árvore ainda está desmontada.');
    expect(c.textos.t('arvore.nascer.2')).toBe('Ela precisa de 3 partes. Examine a árvore!');
  });

  it('o A na árvore continua mostrando o texto de exame (uma página, GDD 14.9.3)', async () => {
    const c = await carregar();
    expect(c.textos.t('arvore.desmontada')).toBe('A árvore ainda está desmontada. Ela precisa de 3 partes.');
  });

  it('o destino da condução fica logo acima da árvore e a direção de chegada olha para ela (baixo)', async () => {
    const c = await carregar();
    const destino = c.missao.conducao['luzes'];
    const arvore = c.todosOsMapas.get(destino.mapa)!.objetos.find((o) => o.tipo === 'arvore')!;
    expect(destino.direcao).toBe('baixo');
    expect(arvore.x).toBe(destino.x);
    expect(arvore.y - destino.y).toBe(1);
  });
});

describe('chegada à árvore: uma vez por partida (D14)', () => {
  it('o diálogo automático abre na primeira chegada e não abre de novo na mesma partida', () => {
    const sessao = partidaComLuzes();
    expect(deveAbrirChegada(sessao)).toBe(true);
    expect(deveAbrirChegada(sessao)).toBe(false);
  });

  it('nova partida ("Começar") abre o diálogo automático de novo (D9)', () => {
    const sessao = partidaComLuzes();
    deveAbrirChegada(sessao);
    new IniciarNovoJogo(sessao, missoesReais()).executar('lolo');
    new ConcluirFase(sessao).executar('introducao');
    new TentarCodigoDaPorta(sessao).executar('017');
    new AcenderLuzes(sessao).executar();
    expect(deveAbrirChegada(sessao)).toBe(true);
    expect(haloDaArvoreVisivel(sessao)).toBe(true);
  });
});

describe('chegada à árvore: halo (GDD 14.9.3, "Para"; D13)', () => {
  it('não pisca antes das luzes', () => {
    const sessao = new SessaoDeJogo();
    new IniciarNovoJogo(sessao, missoesReais()).executar('lolo');
    new ConcluirFase(sessao).executar('introducao');
    new TentarCodigoDaPorta(sessao).executar('017');
    expect(haloDaArvoreVisivel(sessao)).toBe(false);
  });

  it('pisca depois das luzes, durante o diálogo automático', () => {
    const sessao = partidaComLuzes();
    deveAbrirChegada(sessao);
    expect(haloDaArvoreVisivel(sessao)).toBe(true);
  });

  it('não para quando o diálogo automático termina: só o primeiro A do jogador na frente da árvore para', () => {
    const sessao = partidaComLuzes();
    deveAbrirChegada(sessao);
    // Fim do diálogo automático: nada marca a árvore como examinada.
    expect(sessao.foiVisto(CHAVE_EXAMINADA)).toBe(false);
    expect(haloDaArvoreVisivel(sessao)).toBe(true);
    // Primeiro A na frente da árvore (a cena marca com primeiraVez): o halo para.
    expect(sessao.primeiraVez(CHAVE_EXAMINADA)).toBe(true);
    expect(haloDaArvoreVisivel(sessao)).toBe(false);
  });

  it('a marca de exame não afeta a chegada: o diálogo automático continua contado à parte', () => {
    const sessao = partidaComLuzes();
    sessao.primeiraVez(CHAVE_EXAMINADA);
    expect(deveAbrirChegada(sessao)).toBe(true);
  });
});
