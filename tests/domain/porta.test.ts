import { describe, expect, it } from 'vitest';
import { CodigoDaPorta } from '../../src/domain/porta/CodigoDaPorta';
import { PERSONAGEM_IDS } from '../../src/domain/personagem/PersonagemId';
import { SOBRINHOS, sobrinhoPorId } from '../../src/domain/personagem/sobrinhos';
import { Progresso } from '../../src/domain/progresso/Progresso';

const ESPERADOS = { lolo: '017', bibi: '020', dandan: '023', tutu: '024' } as const;

describe('código da porta por sobrinho (GDD 4.2)', () => {
  it.each(Object.entries(ESPERADOS))('%s abre com o próprio código %s', (id, codigo) => {
    const p = Progresso.novo(sobrinhoPorId(id as keyof typeof ESPERADOS));
    const avancada = p.concluir('introducao');
    expect(avancada.ok).toBe(true);
    if (!avancada.ok) return;
    const r = avancada.valor.progresso.tentarPorta(codigo);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.valor.avaliacao).toBe('certo');
    expect(r.valor.progresso.faseAtual).toBe('luzes');
  });

  it.each(PERSONAGEM_IDS)('%s rejeita os códigos dos outros três sobrinhos', (id) => {
    const sobrinho = sobrinhoPorId(id);
    const outros = SOBRINHOS.filter((s) => s.id !== id).map((s) => s.codigoDaPorta.valor);
    for (const codigo of outros) {
      expect(sobrinho.codigoDaPorta.confere(codigo)).toBe(false);
      expect(sobrinho.codigoDaPorta.avaliar(codigo)).toBe('errado');
    }
  });

  it('cada sobrinho tem o código exato do GDD', () => {
    for (const s of SOBRINHOS) expect(s.codigoDaPorta.valor).toBe(ESPERADOS[s.id]);
  });

  it('avalia menos de 3 dígitos como incompleto e aceita só 3 dígitos', () => {
    const c = sobrinhoPorId('lolo').codigoDaPorta;
    expect(c.avaliar('')).toBe('incompleto');
    expect(c.avaliar('01')).toBe('incompleto');
    expect(c.avaliar('0171')).toBe('errado');
    expect(() => CodigoDaPorta.criar('17')).toThrow();
    expect(() => CodigoDaPorta.criar('01a')).toThrow();
  });

  it('não tem limite de tentativas: 20 erros seguidos não mudam o estado', () => {
    const p0 = Progresso.novo(sobrinhoPorId('bibi')).concluir('introducao');
    if (!p0.ok) throw new Error('setup');
    let p = p0.valor.progresso;
    for (let i = 0; i < 20; i++) {
      const r = p.tentarPorta('999');
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      expect(r.valor.avaliacao).toBe('errado');
      p = r.valor.progresso;
    }
    expect(p.faseAtual).toBe('porta');
    const certo = p.tentarPorta('020');
    expect(certo.ok && certo.valor.avaliacao).toBe('certo');
  });
});
