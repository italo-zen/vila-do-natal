import { describe, expect, it } from 'vitest';
import { carregarConteudoReal } from '../helpers/conteudoReal';
import { montarServicos, type Servicos } from '../../src/application/Servicos';
import type { Conteudo } from '../../src/application/usecases/CarregarConteudo';
import { portaASeguir } from '../../src/application/mundo/nick/portaASeguir';
import { alvoDaFase } from '../../src/application/mundo/nick/missaoDoNick';
import { chaveDaDica } from '../../src/application/mundo/nick/dica';
import { podeAbrirDica, podeFarejar, type ModoDaTela } from '../../src/application/mundo/nick/modoDaTela';
import { IniciarNovoJogo } from '../../src/application/usecases/IniciarNovoJogo';
import { tile } from '../../src/domain/shared/Tile';

/** Partida nova no conteúdo real, com o Lolo, pronta para a fase `porta` (introdução concluída). */
async function novaPartida(): Promise<{ s: Servicos; c: Conteudo }> {
  const c = await carregarConteudoReal();
  const s = montarServicos(c, 'teste');
  new IniciarNovoJogo(s.sessao, c.missoes).executar('lolo');
  return { s, c };
}

/** Conclui as fases em ordem até a fase `alvo` ser a atual (só pelas regras de domínio, como a cena faz). */
function avancarAte(s: Servicos, alvo: string): void {
  while (s.sessao.fase !== alvo) {
    const r = s.sessao.progresso.concluir(s.sessao.fase);
    if (!r.ok) throw new Error(`não foi possível concluir ${s.sessao.fase}`);
    s.sessao.definir(r.valor.progresso);
  }
}

/** Conclui a caixa de enfeite (fase `enfeites`, a última): a partida chega ao fim (ADR-006 seção 1.2). */
function concluirEnfeites(s: Servicos): void {
  const r = s.sessao.progresso.concluir('enfeites');
  if (!r.ok) throw new Error('não foi possível concluir enfeites');
  s.sessao.definir(r.valor.progresso);
}

const concluida = (s: Servicos) => (f: Parameters<Servicos['sessao']['faseConcluida']>[0]) => s.sessao.faseConcluida(f);

describe('Nick no conteúdo real (ADR-005 seções 2.3 e 3.7)', () => {
  it('começa dormindo na Sala, no tile de marco1.nick.dorme, sem ter acordado', async () => {
    const { s } = await novaPartida();
    const n = s.sessao.progresso.nick;
    expect(n.dormindo).toBe(true);
    expect(n.tile).toEqual(tile('sala', 8, 5));
    expect(n.jaAcordouNestaPartida).toBe(false);
  });

  it('o alvo do farejar segue a fase: sala nas luzes e na parte 1, cozinha nas partes 2 e 3, Escritório na fase enfeites', async () => {
    const { s, c } = await novaPartida();
    avancarAte(s, 'luzes');
    expect(alvoDaFase(c.missoes, concluida(s))).toBe('sala');
    avancarAte(s, 'parte1');
    expect(alvoDaFase(c.missoes, concluida(s))).toBe('sala');
    avancarAte(s, 'parte2');
    expect(alvoDaFase(c.missoes, concluida(s))).toBe('cozinha');
    avancarAte(s, 'parte3');
    expect(alvoDaFase(c.missoes, concluida(s))).toBe('cozinha');
    // Fase enfeites (GDD 17.6): o alvo é o Escritório, onde está a caixa (ADR-006 seção 5).
    avancarAte(s, 'enfeites');
    expect(alvoDaFase(c.missoes, concluida(s))).toBe('escritorio');
    // Caixa encaixada: o jogo terminou e não há mais alvo.
    concluirEnfeites(s);
    expect(alvoDaFase(c.missoes, concluida(s))).toBeUndefined();
  });

  it('o Nick dorme em cada fase no tile de conteúdo: cozinha na parte 1, quarto na parte 2, escritório na parte 3', async () => {
    const { s, c } = await novaPartida();
    avancarAte(s, 'parte1');
    const r1 = s.devolverControle.executar();
    expect(r1?.destino).toEqual(tile('cozinha', 5, 3));
    avancarAte(s, 'parte2');
    expect(s.devolverControle.executar()?.destino).toEqual(tile('quarto', 4, 3));
    avancarAte(s, 'parte3');
    expect(s.devolverControle.executar()?.destino).toEqual(tile('escritorio', 6, 1));
    avancarAte(s, 'enfeites');
    expect(s.devolverControle.executar()?.destino).toEqual(tile('sala', 8, 5));
    void c;
  });
});

describe('portaASeguir (ADR-005 seção 4.2; GDD 16.5.3 e F4)', () => {
  const abertasDaParte1 = (id: string) => ['hall', 'sala', 'cozinha', 'quarto', 'escritorio'].includes(id);

  it('Quarto com alvo na Sala: seta para a esquerda sobre a P2 (exemplo do GDD)', async () => {
    const c = await carregarConteudoReal();
    expect(portaASeguir(c.todosOsMapas, abertasDaParte1, 'quarto', 'sala')).toMatchObject({ mapa: 'quarto', id: 'P2', saida: 'esquerda' });
  });

  it('Cozinha com alvo na Sala: seta para a esquerda sobre a P7', async () => {
    const c = await carregarConteudoReal();
    expect(portaASeguir(c.todosOsMapas, abertasDaParte1, 'cozinha', 'sala')).toMatchObject({ id: 'P7', saida: 'esquerda' });
  });

  it('Sala com alvo na Cozinha: seta para a direita sobre a P7', async () => {
    const c = await carregarConteudoReal();
    expect(portaASeguir(c.todosOsMapas, abertasDaParte1, 'sala', 'cozinha')).toMatchObject({ id: 'P7', saida: 'direita' });
  });

  it('Hall com alvo na Sala: seta para cima sobre a P8', async () => {
    const c = await carregarConteudoReal();
    expect(portaASeguir(c.todosOsMapas, abertasDaParte1, 'hall', 'sala')).toMatchObject({ id: 'P8', saida: 'cima' });
  });

  it('Escritório com alvo na Sala: seta para a esquerda sobre a P3', async () => {
    const c = await carregarConteudoReal();
    expect(portaASeguir(c.todosOsMapas, abertasDaParte1, 'escritorio', 'sala')).toMatchObject({ id: 'P3', saida: 'esquerda' });
  });

  it('mesmo cômodo não tem porta; sem caminho, undefined; e a mesma entrada dá sempre a mesma porta', async () => {
    const c = await carregarConteudoReal();
    expect(portaASeguir(c.todosOsMapas, abertasDaParte1, 'sala', 'sala')).toBeUndefined();
    expect(portaASeguir(c.todosOsMapas, (id) => id === 'quarto' || id === 'hall', 'quarto', 'hall')).toBeUndefined();
    const a = portaASeguir(c.todosOsMapas, abertasDaParte1, 'quarto', 'cozinha');
    expect(portaASeguir(c.todosOsMapas, abertasDaParte1, 'quarto', 'cozinha')).toEqual(a);
  });
});

describe('FarejarComNick (ADR-005 seção 4.1)', () => {
  it('dormindo: zzz; acordado no mesmo cômodo: Au!; em outro cômodo: porta, que vira seta de 5 s', async () => {
    const { s } = await novaPartida();
    avancarAte(s, 'luzes');
    expect(s.farejarComNick.executar('sala')).toEqual({ tipo: 'dormindo' });
    s.acordarNick.executar(tile('sala', 7, 5));
    expect(s.farejarComNick.executar('sala')).toEqual({ tipo: 'mesmoComodo' });
    const longe = s.farejarComNick.executar('cozinha');
    expect(longe).toMatchObject({ tipo: 'porta', porta: { id: 'P7', saida: 'esquerda' } });
    expect(s.sessao.farejo.ativo).toBe(true);
    expect(s.sessao.farejo.restanteMs).toBe(5000);
  });

  it('B com a seta já visível devolve a porta de novo e reinicia os 5 s (GDD 16.17 (a), pergunta 35)', async () => {
    const { s } = await novaPartida();
    avancarAte(s, 'luzes');
    s.acordarNick.executar(tile('sala', 7, 5));
    s.farejarComNick.executar('cozinha');
    s.sessao.farejo.avancar(3000);
    const segundo = s.farejarComNick.executar('cozinha');
    expect(segundo).toMatchObject({ tipo: 'porta', porta: { id: 'P7' } });
    expect(s.sessao.farejo.restanteMs).toBe(5000);
  });

  it('na fase enfeites, acordado: a seta da Sala aponta para a P3, rumo ao Escritório (GDD 17.6)', async () => {
    const { s } = await novaPartida();
    avancarAte(s, 'enfeites');
    s.acordarNick.executar(tile('sala', 7, 5));
    expect(s.farejarComNick.executar('sala')).toMatchObject({ tipo: 'porta', porta: { id: 'P3' } });
    expect(s.sessao.farejo.ativo).toBe(true);
  });

  it('depois da caixa (fim do jogo), acordado: sem alvo (abana), sem seta', async () => {
    const { s } = await novaPartida();
    avancarAte(s, 'enfeites');
    concluirEnfeites(s);
    s.acordarNick.executar(tile('sala', 7, 5));
    expect(s.farejarComNick.executar('sala')).toEqual({ tipo: 'semAlvo' });
    expect(s.sessao.farejo.ativo).toBe(false);
  });
});

describe('AcordarNick (ADR-005 seção 3.6)', () => {
  it('acorda uma vez com primeiraVez, e depois só abana', async () => {
    const { s } = await novaPartida();
    expect(s.acordarNick.executar(tile('sala', 7, 5))).toEqual({ tipo: 'acordou', primeiraVez: true });
    expect(s.acordarNick.executar(tile('sala', 7, 5))).toEqual({ tipo: 'abanou' });
  });
});

describe('dica e modo da tela (ADR-005 seções 5 e 1.4)', () => {
  it('chave da dica por fase e estado; a fase enfeites tem a sua dica, e não há `livre` (ADR-006 seção 6)', async () => {
    const c = await carregarConteudoReal();
    expect(chaveDaDica(c.missoes, 'porta', true)).toBe('dica.porta');
    expect(chaveDaDica(c.missoes, 'luzes', true)).toBe('dica.luzes.dormindo');
    expect(chaveDaDica(c.missoes, 'luzes', false)).toBe('dica.luzes.acordado');
    expect(chaveDaDica(c.missoes, 'parte1', false)).toBe('dica.parte1.acordado');
    expect(chaveDaDica(c.missoes, 'parte2', true)).toBe('dica.parte2.dormindo');
    expect(chaveDaDica(c.missoes, 'parte3', true)).toBe('dica.parte3.dormindo');
    expect(chaveDaDica(c.missoes, 'enfeites', true)).toBe('dica.enfeites.dormindo');
    expect(chaveDaDica(c.missoes, 'enfeites', false)).toBe('dica.enfeites.acordado');
    expect(chaveDaDica(c.missoes, 'introducao', true)).toBeUndefined();
  });

  it('só a exploração deixa farejar e abrir a dica', () => {
    const outros: ModoDaTela[] = ['dialogo', 'painel', 'conquista', 'conducao', 'fade', 'dica', 'titulo', 'selecao', 'introducao', 'comoJogar'];
    for (const m of outros) {
      expect(podeFarejar(m)).toBe(false);
      expect(podeAbrirDica(m)).toBe(false);
    }
    expect(podeFarejar('exploracao')).toBe(true);
    expect(podeAbrirDica('exploracao')).toBe(true);
  });
});
