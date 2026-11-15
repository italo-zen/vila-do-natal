import { describe, expect, it } from 'vitest';
import { carregarConteudoReal } from '../helpers/conteudoReal';
import { montarServicos, type Servicos } from '../../src/application/Servicos';
import type { Conteudo } from '../../src/application/usecases/CarregarConteudo';
import type { Fase } from '../../src/domain/progresso/Fase';
import { bloqueiosDaSubarea, CONTEXTO_PADRAO } from '../../src/application/mundo/subarea';
import { contextoDaPartida, pecaRetiradaNaConducao, situacaoDaFase } from '../../src/application/mundo/pecas';
import { CHAVE_DO_AVISO_DO_ENFEITE, CHAVE_DA_CHEGADA_FINAL } from '../../src/application/mundo/enfeite';
import { destinoDoNick } from '../../src/application/mundo/nick/missaoDoNick';
import { dicaDaFase, chaveDaDica } from '../../src/application/mundo/nick/dica';
import { podeAbrirDica, podeFarejar } from '../../src/application/mundo/nick/modoDaTela';
import { jogoTerminou, missaoAtiva, missaoDaFase } from '../../src/application/mundo/missoes';
import { pontosDaCaixa } from '../../src/application/content/pontosDePartida';
import { interpretarTextos } from '../../src/application/content/Textos';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * A caixa de enfeite e o fim do jogo na aplicação, com o conteúdo real (GDD 17; ADR-006 seções 2, 4, 5 e 6). Sem Phaser:
 * a cena só chama estes casos de uso e estas regras.
 */

let c: Conteudo;
const carregar = async () => {
  if (!c) c = await carregarConteudoReal();
  return c;
};

async function novaPartida(): Promise<{ s: Servicos; c: Conteudo }> {
  const x = await carregar();
  const s = montarServicos(x, 'teste');
  s.iniciarNovoJogo.executar('lolo');
  return { s, c: x };
}

/** Conclui as fases pela regra do domínio, na ordem, até `alvo` (a atual). */
function avancarAte(s: Servicos, alvo: Fase): void {
  while (s.sessao.fase !== alvo) {
    const r = s.sessao.progresso.concluir(s.sessao.fase);
    if (!r.ok) throw new Error(`não foi possível concluir ${s.sessao.fase}`);
    s.sessao.definir(r.valor.progresso);
  }
}

const concluida = (s: Servicos) => (f: Fase) => s.sessao.faseConcluida(f);

/** Conclui a fase atual da partida pela regra do domínio, ou falha o teste com a causa. */
function concluirAtual(s: Servicos): void {
  const r = s.sessao.progresso.concluir(s.sessao.fase);
  if (!r.ok) throw new Error(`setup: não concluiu ${s.sessao.fase}: ${r.erro.codigo}`);
  s.sessao.definir(r.valor.progresso);
}

describe('caixa de enfeite: escondida, liberada e encaixada (GDD 17.3; ADR-006 seção 2.4)', () => {
  it('antes do diálogo de chegada da parte 3, a caixa está escondida e não bloqueia o tile', async () => {
    const { s, c: x } = await novaPartida();
    avancarAte(s, 'parte3');
    const escritorio = x.todosOsMapas.get('escritorio')!;
    const ctx = contextoDaPartida(x.missoes, concluida(s), { caixaLiberada: s.sessao.progresso.caixaLiberada });
    expect(ctx.estadoDoEnfeite()).toBe('escondida');
    expect(bloqueiosDaSubarea(escritorio, concluida(s), ctx)[2][5]).toBe(false);
  });

  it('o DevolverControle da parte 3 libera a caixa: visível e bloqueia o tile (5, 2) do Escritório', async () => {
    const { s, c: x } = await novaPartida();
    avancarAte(s, 'parte3');
    concluirAtual(s);
    expect(s.sessao.progresso.caixaLiberada).toBe(false);
    s.devolverControle.executar();
    expect(s.sessao.progresso.caixaLiberada).toBe(true);
    const escritorio = x.todosOsMapas.get('escritorio')!;
    const ctx = contextoDaPartida(x.missoes, concluida(s), { caixaLiberada: s.sessao.progresso.caixaLiberada });
    expect(ctx.estadoDoEnfeite()).toBe('visivel');
    expect(bloqueiosDaSubarea(escritorio, concluida(s), ctx)[2][5]).toBe(true);
  });

  it('o DevolverControle da parte 3 põe o Nick para dormir na Sala, (8, 5) (GDD 17.6)', async () => {
    const { s } = await novaPartida();
    avancarAte(s, 'parte3');
    concluirAtual(s);
    s.devolverControle.executar();
    expect(s.sessao.progresso.nick.tile).toEqual({ mapa: 'sala', x: 8, y: 5 });
    expect(s.sessao.progresso.nick.dormindo).toBe(true);
  });

  it('0.8.1: o encaixe da parte 3 não libera a caixa nem manda o Nick dormir; só o fim do diálogo de duas páginas (DevolverControle) faz isso', async () => {
    const { s, c: x } = await novaPartida();
    avancarAte(s, 'parte3');
    const nickAntes = { ...s.sessao.progresso.nick.tile };
    const dormindoAntes = s.sessao.progresso.nick.dormindo;
    // O encaixe conclui a fase, mas o diálogo `arvore.chegada.3` (3 páginas) ainda está aberto: nada de caixa, nada do Nick.
    concluirAtual(s);
    expect(s.sessao.faseConcluida('parte3')).toBe(true);
    expect(s.sessao.progresso.caixaLiberada).toBe(false);
    expect(s.sessao.progresso.nick.tile).toEqual(nickAntes);
    expect(s.sessao.progresso.nick.dormindo).toBe(dormindoAntes);
    const escritorio = x.todosOsMapas.get('escritorio')!;
    const ctxAntes = contextoDaPartida(x.missoes, concluida(s), { caixaLiberada: s.sessao.progresso.caixaLiberada });
    expect(ctxAntes.estadoDoEnfeite()).toBe('escondida');
    expect(bloqueiosDaSubarea(escritorio, concluida(s), ctxAntes)[2][5]).toBe(false);
    // Fim do diálogo, depois da página 3 (a cena chama o DevolverControle no aoFim da última página): aí sim.
    s.devolverControle.executar();
    expect(s.sessao.progresso.caixaLiberada).toBe(true);
    expect(s.sessao.progresso.nick.tile).toEqual({ mapa: 'sala', x: 8, y: 5 });
    expect(s.sessao.progresso.nick.dormindo).toBe(true);
  });

  it('depois do encaixe da caixa, ela sai do chão: encaixada e sem bloqueio', async () => {
    const { s, c: x } = await novaPartida();
    avancarAte(s, 'enfeites');
    s.sessao.definir(s.sessao.progresso.liberarCaixa());
    expect(concluida(s)('enfeites')).toBe(false);
    concluirAtual(s);
    const escritorio = x.todosOsMapas.get('escritorio')!;
    const ctx = contextoDaPartida(x.missoes, concluida(s), { caixaLiberada: true });
    expect(ctx.estadoDoEnfeite()).toBe('encaixada');
    expect(bloqueiosDaSubarea(escritorio, concluida(s), ctx)[2][5]).toBe(false);
  });

  it('a condução da caixa tira a caixa do chão: encaixada durante o trajeto (ADR-006 seção 2.6)', async () => {
    const { s, c: x } = await novaPartida();
    avancarAte(s, 'enfeites');
    const retirada = pecaRetiradaNaConducao('enfeites');
    expect(retirada).toEqual({ tipo: 'enfeite' });
    const ctx = contextoDaPartida(x.missoes, concluida(s), { retirada, caixaLiberada: true });
    expect(ctx.estadoDoEnfeite()).toBe('encaixada');
  });

  it('a situação da fase enfeites trata a caixa como retirada na condução', async () => {
    const { s, c: x } = await novaPartida();
    avancarAte(s, 'enfeites');
    const { ctx } = situacaoDaFase(x.missoes, 'enfeites');
    expect(ctx.estadoDoEnfeite()).toBe('encaixada');
    const outra = situacaoDaFase(x.missoes, 'parte3').ctx;
    expect(outra.estadoDoEnfeite()).toBe('escondida');
  });

  it('o padrão do contexto não bloqueia com a caixa escondida', () => {
    expect(CONTEXTO_PADRAO.estadoDoEnfeite()).toBe('escondida');
  });
});

describe('retirada na condução (ADR-006 seção 2.6)', () => {
  it('pecaRetiradaNaConducao devolve a caixa em enfeites; as partes, a sua peça; luzes e porta, nada', () => {
    expect(pecaRetiradaNaConducao('enfeites')).toEqual({ tipo: 'enfeite' });
    expect(pecaRetiradaNaConducao('parte1')).toEqual({ tipo: 'peca', ordem: 1 });
    expect(pecaRetiradaNaConducao('parte2')).toEqual({ tipo: 'peca', ordem: 2 });
    expect(pecaRetiradaNaConducao('parte3')).toEqual({ tipo: 'peca', ordem: 3 });
    expect(pecaRetiradaNaConducao('luzes')).toBeUndefined();
    expect(pecaRetiradaNaConducao('porta')).toBeUndefined();
  });
});

describe('ponto de partida e rota da caixa (ADR-006 seção 2.5)', () => {
  it('a condução da caixa parte dos vizinhos livres dela, no Escritório', async () => {
    const { c: x } = await novaPartida();
    const pontos = pontosDaCaixa(x.todosOsMapas);
    expect(pontos.length).toBeGreaterThanOrEqual(2);
    expect(pontos.every((p) => p.mapa === 'escritorio')).toBe(true);
    expect(pontos.map((p) => `${p.x},${p.y}`).sort()).toEqual(['5,1', '5,3']);
  });

  it('a missão de enfeites conduz à Sala, (3, 7), de frente para a árvore; o Nick dorme em (8, 5) e farejar aponta ao Escritório', async () => {
    const { c: x } = await novaPartida();
    const m = x.missoes.find((z) => z.id === 'enfeites')!;
    expect(m.missao.conducao.enfeites).toEqual({ mapa: 'sala', x: 3, y: 7, direcao: 'baixo' });
    expect(m.missao.conquistas.enfeites).toBe('conquista.enfeites');
    expect(m.missao.nick).toEqual({ dorme: { mapa: 'sala', x: 8, y: 5, direcao: 'baixo' }, alvo: 'escritorio' });
    expect(m.missao.dica).toEqual({ enfeites: { dormindo: 'dica.enfeites.dormindo', acordado: 'dica.enfeites.acordado' } });
  });
});

describe('fim do jogo: missão final e destino do Nick (ADR-006 seções 1.4 e 5)', () => {
  it('a missão final é enfeites; jogoTerminou é falso antes da caixa e verdadeiro depois', async () => {
    const { s, c: x } = await novaPartida();
    avancarAte(s, 'enfeites');
    expect(missaoDaFase(x.missoes, 'enfeites')!.final).toBe(true);
    expect(jogoTerminou(x.missoes, concluida(s))).toBe(false);
    concluirAtual(s);
    expect(jogoTerminou(x.missoes, concluida(s))).toBe(true);
  });

  it('depois da parte 3, a missão ativa é enfeites, e o Nick vai ao seu dorme (Sala, (8, 5))', async () => {
    const { s, c: x } = await novaPartida();
    avancarAte(s, 'parte3');
    concluirAtual(s);
    expect(missaoAtiva(x.missoes, concluida(s)).id).toBe('enfeites');
    expect(destinoDoNick(x.missoes, concluida(s))).toEqual({ mapa: 'sala', x: 8, y: 5, direcao: 'baixo' });
  });

  it('depois da missão final, não há destino: o Nick não se move', async () => {
    const { s, c: x } = await novaPartida();
    avancarAte(s, 'enfeites');
    concluirAtual(s);
    expect(destinoDoNick(x.missoes, concluida(s))).toBeUndefined();
  });

  it('o diálogo final é arvore.chegada.4 (duas páginas, Z e X)', () => {
    expect(CHAVE_DA_CHEGADA_FINAL).toBe('arvore.chegada.4');
  });
});

describe('dica e farejar na fase enfeites (GDD 17.10; ADR-006 seções 3.3, 5 e 6)', () => {
  it('a dica da fase enfeites usa a chave própria, por estado, e nunca `livre`', async () => {
    const { c: x } = await novaPartida();
    expect(chaveDaDica(x.missoes, 'enfeites', true)).toBe('dica.enfeites.dormindo');
    expect(chaveDaDica(x.missoes, 'enfeites', false)).toBe('dica.enfeites.acordado');
    expect(chaveDaDica(x.missoes, 'parte3', false)).toBe('dica.parte3.acordado');
  });

  it('a árvore na dica nunca passa do estado 3: a imagem da fase enfeites é a do estado 3 (ADR-006 seção 3.3)', async () => {
    const { c: x } = await novaPartida();
    expect(dicaDaFase(x.missoes, 'enfeites', true, 4)!.estadoDaArvore).toBe(3);
    expect(dicaDaFase(x.missoes, 'enfeites', true, 3)!.estadoDaArvore).toBe(3);
    expect(dicaDaFase(x.missoes, 'enfeites', false, 0)!.estadoDaArvore).toBe(0);
  });

  it('a tela de créditos não abre dica nem farejar (ModoDaTela, ADR-006 seção 7.4)', () => {
    expect(podeFarejar('creditos')).toBe(false);
    expect(podeAbrirDica('creditos')).toBe(false);
    expect(podeFarejar('exploracao')).toBe(true);
  });
});

describe('textos da caixa e do aviso (GDD 17.8; ADR-006 seção 8.5)', () => {
  it('o aviso da caixa é aviso.enfeite.antes3, com duas páginas, e o texto de conquista existe', async () => {
    const dir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content', 'texts', 'pt-BR.json');
    const t = interpretarTextos(JSON.parse(readFileSync(dir, 'utf-8')));
    expect(CHAVE_DO_AVISO_DO_ENFEITE).toBe('aviso.enfeite.antes3');
    expect(t.quantasPaginas('aviso.enfeite.antes3')).toBe(2);
    expect(t.tem('conquista.enfeites')).toBe(true);
  });
});
