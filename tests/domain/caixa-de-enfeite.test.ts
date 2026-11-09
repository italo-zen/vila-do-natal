import { describe, expect, it } from 'vitest';
import { Progresso } from '../../src/domain/progresso/Progresso';
import { sobrinhoPorId } from '../../src/domain/personagem/sobrinhos';
import { estadoDaArvore, FASE_DA_PECA, FASE_DO_ENFEITE } from '../../src/domain/progresso/arvore';
import { estadoDoEnfeite } from '../../src/domain/progresso/enfeite';
import type { Fase } from '../../src/domain/progresso/Fase';
import { nickInicial } from '../helpers/missoesReais';

/** Progresso com as fases dadas concluídas, na ordem (o agregado só conclui a atual). */
function ateFases(fases: Fase[]): Progresso {
  let p = Progresso.novo(sobrinhoPorId('lolo'), nickInicial());
  for (const f of fases) {
    const r = p.concluir(f);
    if (!r.ok) throw new Error(`setup: não concluiu ${f}`);
    p = r.valor.progresso;
  }
  return p;
}

const ATE_PARTE3: Fase[] = ['introducao', 'porta', 'luzes', 'parte1', 'parte2', 'parte3'];

describe('fase enfeites como última fase (ADR-006 seção 1.2)', () => {
  it('concluir a última fase a deixa como atual e a põe em fasesConcluidas', () => {
    const p = ateFases([...ATE_PARTE3, 'enfeites']);
    expect(p.faseAtual).toBe('enfeites');
    expect(p.concluidaFase('enfeites')).toBe(true);
    expect(p.fasesConcluidas).toContain('enfeites');
  });

  it('concluir enfeites de novo é erro fase_invalida', () => {
    const p = ateFases([...ATE_PARTE3, 'enfeites']);
    const r = p.concluir('enfeites');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erro.codigo).toBe('fase_invalida');
  });

  it('a partida nova não tem a caixa liberada (ADR-006 seção 2.4)', () => {
    expect(Progresso.novo(sobrinhoPorId('lolo'), nickInicial()).caixaLiberada).toBe(false);
  });
});

describe('caixa liberada (ADR-006 seção 2.4)', () => {
  it('falso depois do encaixe da parte 3 e antes do DevolverControle', () => {
    const p = ateFases(ATE_PARTE3);
    expect(p.caixaLiberada).toBe(false);
    expect(p.liberarCaixa().caixaLiberada).toBe(true);
  });

  it('não libera antes da parte 3 concluída: devolve o mesmo estado', () => {
    const p = ateFases(['introducao', 'porta', 'luzes', 'parte1']);
    expect(p.liberarCaixa()).toBe(p);
  });

  it('depois de liberada, não volta a falso e não muda de novo na partida', () => {
    const liberada = ateFases(ATE_PARTE3).liberarCaixa();
    expect(liberada.liberarCaixa()).toBe(liberada);
    const r = liberada.concluir('enfeites');
    if (!r.ok) throw new Error('setup');
    expect(r.valor.progresso.caixaLiberada).toBe(true);
  });
});

describe('estado da caixa (ADR-006 seção 2.4)', () => {
  const nada = () => false;
  const ate = (fases: Fase[]) => (f: Fase) => fases.includes(f);

  it('escondida até a caixa ser liberada', () => {
    expect(estadoDoEnfeite(nada, false)).toBe('escondida');
  });

  it('visível depois de liberada e antes do encaixe', () => {
    expect(estadoDoEnfeite(nada, true)).toBe('visivel');
  });

  it('encaixada quando a fase enfeites está concluída, mesmo que a liberação tenha sido antes', () => {
    expect(estadoDoEnfeite(ate(['enfeites']), true)).toBe('encaixada');
  });
});

describe('estado 4 da árvore (ADR-006 seção 3)', () => {
  it('as três peças sem a caixa: estado 3 (regressão do Marco 2)', () => {
    const concluida = (f: Fase) => ['parte1', 'parte2', 'parte3'].includes(f);
    expect(estadoDaArvore(concluida)).toBe(3);
  });

  it('a caixa encaixada com as três peças: estado 4', () => {
    const concluida = (f: Fase) => ['parte1', 'parte2', 'parte3', 'enfeites'].includes(f);
    expect(estadoDaArvore(concluida)).toBe(4);
  });

  it('a caixa sem as três peças não conta: só o número de peças', () => {
    expect(estadoDaArvore((f) => f === 'enfeites')).toBe(0);
    expect(FASE_DA_PECA[3]).toBe('parte3');
    expect(FASE_DO_ENFEITE).toBe('enfeites');
  });
});
