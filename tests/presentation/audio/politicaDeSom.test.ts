import { describe, expect, it } from 'vitest';
import { EVENTOS_DE_AUDIO, type EventoDeAudio } from '../../../src/application/audio/eventosDeAudio';
import { efeitoPermitidoNaTela, type TelaDoSom } from '../../../src/presentation/audio/politicaDeSom';

/** ADR-008 R8 e 9.1; GDD 19.2.2 e AU7: efeitos por tela. A música não passa por aqui (AU2). */
const permitidos = (tela: TelaDoSom) => EVENTOS_DE_AUDIO.filter((e) => efeitoPermitidoNaTela(tela, e as EventoDeAudio));

describe('política de som por tela (AU7)', () => {
  it('aviso de rotação: nenhum efeito', () => {
    expect(permitidos('rotacao')).toEqual([]);
  });

  it('pausa e confirmação: só S11 (foco) e S12 (confirmar)', () => {
    expect(permitidos('pausa')).toEqual(['S11', 'S12']);
    expect(permitidos('pausaSair')).toEqual(['S11', 'S12']);
    expect(permitidos('pausaComoJogar')).toEqual(['S11', 'S12']);
  });

  it('condução: só S01 (passos)', () => {
    expect(permitidos('conducao')).toEqual(['S01']);
  });

  it('fade: só S02 (porta)', () => {
    expect(permitidos('fade')).toEqual(['S02']);
  });

  it('as demais telas aceitam todos os efeitos', () => {
    for (const t of ['titulo', 'selecao', 'exploracao', 'dialogo', 'painel', 'conquista', 'creditos', 'introducao', 'dica', 'comoJogar'] as TelaDoSom[]) {
      expect(permitidos(t)).toHaveLength(13);
    }
  });
});
