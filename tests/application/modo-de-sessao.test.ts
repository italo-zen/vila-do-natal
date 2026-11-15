import { describe, expect, it } from 'vitest';
import { SessaoDeJogo } from '../../src/application/SessaoDeJogo';
import { IniciarNovoJogo } from '../../src/application/usecases/IniciarNovoJogo';
import { podeAbrirDica } from '../../src/application/mundo/nick/modoDaTela';
import { FASES } from '../../src/domain/progresso/Fase';
import { Nick } from '../../src/domain/nick/Nick';
import { tile } from '../../src/domain/shared/Tile';
import { missoesReais } from '../helpers/missoesReais';
import { podeAbrirPausa } from '../../src/presentation/ui/pausa/podeAbrirPausa';
import type { ModoDaTela } from '../../src/application/mundo/nick/modoDaTela';

/** ADR-010 1 (modo de sessão), 2 (dica e pausa) e 9 (testes de domínio). */

function partidaConcluida(): SessaoDeJogo {
  const s = new SessaoDeJogo();
  new IniciarNovoJogo(s, missoesReais()).executar('lolo');
  for (const fase of FASES) {
    const r = s.progresso.concluir(fase);
    if (!r.ok) break;
    s.definir(r.valor.progresso);
  }
  return s;
}

describe('modo de sessão (ADR-010 1.1 e 1.2)', () => {
  it('começa em historia e só em memória', () => {
    const s = new SessaoDeJogo();
    new IniciarNovoJogo(s, missoesReais()).executar('lolo');
    expect(s.modo).toBe('historia');
  });

  it('entrar no modo explorar sem partida concluída falha (pré-condição, ADR-010 1.2)', () => {
    const s = new SessaoDeJogo();
    new IniciarNovoJogo(s, missoesReais()).executar('lolo');
    expect(() => s.entrarNoModoExplorar()).toThrow(/depois da partida concluída/);
    expect(s.modo).toBe('historia');
  });

  it('com a partida concluída, entra no modo explorar', () => {
    const s = partidaConcluida();
    s.entrarNoModoExplorar();
    expect(s.modo).toBe('explorar');
  });

  it('entrar no modo não altera o Progresso: fases e conquistas são as mesmas (ADR-010 9)', () => {
    const s = partidaConcluida();
    const antes = JSON.stringify(s.progresso);
    s.entrarNoModoExplorar();
    expect(JSON.stringify(s.progresso)).toBe(antes);
  });

  it('uma nova partida volta a historia (o modo não passa de uma partida para outra)', () => {
    const s = partidaConcluida();
    s.entrarNoModoExplorar();
    new IniciarNovoJogo(s, missoesReais()).executar('bibi');
    expect(s.modo).toBe('historia');
  });
});

describe('dica e pausa por modo (ADR-010 2)', () => {
  const modos: ModoDaTela[] = ['exploracao', 'dialogo', 'painel', 'conquista', 'conducao', 'fade', 'dica', 'titulo', 'selecao', 'introducao', 'comoJogar', 'creditos'];

  it('a dica abre só na exploração de historia', () => {
    expect(podeAbrirDica('exploracao', 'historia')).toBe(true);
    expect(podeAbrirDica('exploracao', 'explorar')).toBe(false);
    for (const m of modos.filter((x) => x !== 'exploracao')) expect(podeAbrirDica(m, 'historia'), m).toBe(false);
  });

  it('a pausa é igual à dica em historia, para os 12 modos (ADR-010 9)', () => {
    for (const m of modos) expect(podeAbrirPausa(m), m).toBe(podeAbrirDica(m, 'historia'));
  });

  it('a pausa abre na exploração do modo explorar (EX4)', () => {
    expect(podeAbrirPausa('exploracao')).toBe(true);
  });
});

describe('Nick no modo explorar (ADR-010 1.2, EX1)', () => {
  it('nasce acordado, no tile dado, seguindo o sobrinho, sem marcar a primeira vez', () => {
    const nick = Nick.dormindoEm(tile('sala', 8, 5), 'baixo');
    nick.posicionarNoModoExplorar({ mapa: 'sala', x: 3, y: 6 }, 'baixo');
    expect(nick.acordado).toBe(true);
    expect(nick.dormindo).toBe(false);
    expect(nick.tile).toEqual({ mapa: 'sala', x: 3, y: 6 });
    expect(nick.oculto).toBe(false);
  });
});
