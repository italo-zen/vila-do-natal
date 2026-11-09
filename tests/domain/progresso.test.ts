import { describe, expect, it } from 'vitest';
import { FASES, proximaFase, type Fase } from '../../src/domain/progresso/Fase';
import { Progresso } from '../../src/domain/progresso/Progresso';
import { sobrinhoPorId } from '../../src/domain/personagem/sobrinhos';
import { PERSONAGEM_IDS } from '../../src/domain/personagem/PersonagemId';
import { HABILIDADES_DOS_SOBRINHOS, Sobrinho } from '../../src/domain/personagem/Sobrinho';
import { parsePersonagemId } from '../../src/domain/personagem/PersonagemId';
import { nickInicial } from '../helpers/missoesReais';

const novo = () => Progresso.novo(sobrinhoPorId('lolo'), nickInicial());

describe('ordem das fases (GDD 3)', () => {
  it('segue a ordem da tabela do GDD, com sete fases e sem créditos (ADR-006 seção 1.1)', () => {
    expect(FASES).toEqual(['introducao', 'porta', 'luzes', 'parte1', 'parte2', 'parte3', 'enfeites']);
    expect(proximaFase('introducao')).toBe('porta');
    expect(proximaFase('parte3')).toBe('enfeites');
    expect(proximaFase('enfeites')).toBeNull();
    expect((FASES as readonly string[]).includes('creditos')).toBe(false);
  });

  it('começa em introdução, sem fases concluídas', () => {
    const p = novo();
    expect(p.faseAtual).toBe('introducao');
    expect(p.fasesConcluidas).toEqual([]);
  });

  it('só conclui a fase atual; concluir outra fase é recusado', () => {
    const p = novo();
    const r = p.concluir('porta');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erro.codigo).toBe('fase_invalida');
  });

  it('a porta só pode ser tentada na fase "porta"', () => {
    const r = novo().tentarPorta('017');
    expect(r.ok).toBe(false);
  });

  it('luzes só acendem na fase "luzes" (depois da porta)', () => {
    expect(novo().acenderLuzes().ok).toBe(false);
    const naPorta = novo().concluir('introducao');
    if (!naPorta.ok) throw new Error('setup');
    expect(naPorta.valor.progresso.acenderLuzes().ok).toBe(false);
    const aposPorta = naPorta.valor.progresso.tentarPorta('017');
    if (!aposPorta.ok) throw new Error('setup');
    expect(aposPorta.valor.progresso.faseAtual).toBe('luzes');
    const luz = aposPorta.valor.progresso.acenderLuzes();
    expect(luz.ok).toBe(true);
    if (luz.ok) {
      expect(luz.valor.progresso.faseAtual).toBe('parte1');
      expect(luz.valor.eventos).toEqual([{ tipo: 'FaseConcluida', fase: 'luzes' }]);
    }
  });

  it('o agregado é imutável: concluir devolve um novo estado', () => {
    const p = novo();
    const r = p.concluir('introducao');
    if (!r.ok) throw new Error('setup');
    expect(p.faseAtual).toBe('introducao');
    expect(r.valor.progresso.faseAtual).toBe('porta');
    expect(r.valor.progresso.fasesConcluidas).toEqual(['introducao'] as Fase[]);
  });
});

describe('sobrinhos (GDD 4.8)', () => {
  it('os 4 têm exatamente as mesmas habilidades (escolha cosmética)', () => {
    const refs = PERSONAGEM_IDS.map((id) => sobrinhoPorId(id).habilidades);
    for (const h of refs) expect(h).toBe(HABILIDADES_DOS_SOBRINHOS);
  });

  it('nomes e gêneros da tabela do GDD', () => {
    expect(sobrinhoPorId('lolo').nome).toBe('LoLô');
    expect(sobrinhoPorId('bibi').genero).toBe('menina');
    expect(sobrinhoPorId('dandan').genero).toBe('menino');
    expect(sobrinhoPorId('tutu').nome).toBe('TuTu');
  });

  it('rejeita id de personagem desconhecido', () => {
    expect(parsePersonagemId('zezinho').ok).toBe(false);
    expect(parsePersonagemId('lolo').ok).toBe(true);
    expect(new Sobrinho('lolo', 'LoLô', 'menina', sobrinhoPorId('lolo').codigoDaPorta).id).toBe('lolo');
  });
});
