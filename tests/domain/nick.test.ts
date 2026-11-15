import { describe, expect, it } from 'vitest';
import { FilaDoSobrinho } from '../../src/domain/nick/FilaDoSobrinho';
import { Nick } from '../../src/domain/nick/Nick';
import { Farejo } from '../../src/domain/nick/Farejo';
import { CASAS_ATRAS_DO_NICK, DURACAO_DA_SETA_MS } from '../../src/domain/nick/constantes';
import { tile, type Tile } from '../../src/domain/shared/Tile';
import { estadoDaArvore, FASE_DA_PECA } from '../../src/domain/progresso/arvore';
import { Progresso } from '../../src/domain/progresso/Progresso';
import { sobrinhoPorId } from '../../src/domain/personagem/sobrinhos';
import { nickInicial } from '../helpers/missoesReais';

const S = 'sala';
const t = (x: number, y: number): Tile => tile(S, x, y);

describe('constantes do Nick (PT3, 2026-11-09: 1 tile atrás; GDD 16.5.3)', () => {
  it('o Nick fica 1 tile atrás (encostado) e a seta dura 5 s', () => {
    expect(CASAS_ATRAS_DO_NICK).toBe(1);
    expect(DURACAO_DA_SETA_MS).toBe(5000);
  });
});

describe('FilaDoSobrinho', () => {
  it('guarda no máximo CASAS + 1 entradas; alvo é a mais antiga quando a fila está cheia', () => {
    let f = FilaDoSobrinho.vazia().comSemente(t(1, 1));
    f = f.comPasso(t(2, 1));
    expect(f.entradas.length).toBe(1);
    expect(f.alvo()).toEqual(t(1, 1)); // semente, fila ainda curta
    f = f.comPasso(t(3, 1));
    expect(f.entradas.length).toBe(CASAS_ATRAS_DO_NICK + 1);
    expect(f.alvo()).toEqual(t(2, 1));
  });

  it('comSemente zera a fila', () => {
    const f = FilaDoSobrinho.vazia().comSemente(t(1, 1)).comPasso(t(2, 1)).comSemente(t(9, 9));
    expect(f.entradas).toEqual([]);
    expect(f.alvo()).toEqual(t(9, 9));
  });
});

describe('Nick: acordar, dormir e bloqueio (ADR-005 seções 1.2, 3.4, 3.5)', () => {
  it('dormindo bloqueia só o próprio tile; acordado não bloqueia', () => {
    const n = Nick.dormindoEm(t(8, 5), 'baixo');
    expect(n.bloqueia(t(8, 5))).toBe(true);
    expect(n.bloqueia(t(8, 4))).toBe(false);
    n.acordar(t(7, 5));
    expect(n.bloqueia(t(8, 5))).toBe(false);
  });

  it('acordar uma vez mostra primeiraVez; acordado só abana, sem efeito de estado', () => {
    const n = Nick.dormindoEm(t(8, 5), 'baixo');
    expect(n.acordar(t(7, 5))).toEqual({ tipo: 'acordou', primeiraVez: true });
    expect(n.acordar(t(7, 5))).toEqual({ tipo: 'abanou' });
    n.dormirEm(t(5, 3), 'baixo');
    expect(n.acordar(t(4, 3))).toEqual({ tipo: 'acordou', primeiraVez: false });
  });

  it('dormirEm zera a fila e volta a dormir no tile novo', () => {
    const n = Nick.dormindoEm(t(8, 5), 'baixo');
    n.acordar(t(7, 5));
    n.registrarPasso(t(6, 5), 'esquerda');
    n.dormirEm(t(5, 3), 'baixo');
    expect(n.dormindo).toBe(true);
    expect(n.tile).toEqual(t(5, 3));
    expect(n.fila.entradas).toEqual([]);
  });

  it('dormindo não muda de lugar na entrada de área e não anda com passos', () => {
    const n = Nick.dormindoEm(t(8, 5), 'baixo');
    n.entrarNaArea(t(9, 5), 'esquerda');
    expect(n.tile).toEqual(t(8, 5));
    expect(n.registrarPasso(t(9, 5), 'esquerda')).toEqual({ tipo: 'parou' });
  });
});

describe('Nick acordado segue 1 tile atrás, encostado (PT3, 2026-11-09)', () => {
  /** Nick acordado na Sala, dormindo em (4,5), com o sobrinho ao lado em (5,5). */
  function acordadoAoLado(): Nick {
    const n = Nick.dormindoEm(t(4, 5), 'baixo');
    n.acordar(t(5, 5));
    return n;
  }

  it('em linha reta, fica 1 tile atrás do sobrinho a cada passo', () => {
    const n = acordadoAoLado();
    // Sobrinho anda para a direita: (6,5), (7,5), (8,5).
    expect(n.registrarPasso(t(6, 5), 'direita')).toEqual({ tipo: 'andou', direcao: 'direita', para: t(5, 5) });
    expect(n.tile).toEqual(t(5, 5));
    expect(n.registrarPasso(t(7, 5), 'direita')).toEqual({ tipo: 'andou', direcao: 'direita', para: t(6, 5) });
    expect(n.tile).toEqual(t(6, 5));
    expect(n.registrarPasso(t(8, 5), 'direita')).toEqual({ tipo: 'andou', direcao: 'direita', para: t(7, 5) });
  });

  it('parado: o sobrinho para e o Nick para no tile anterior, sem andar mais', () => {
    const n = acordadoAoLado();
    n.registrarPasso(t(6, 5), 'direita');
    n.registrarPasso(t(7, 5), 'direita');
    const antes = n.tile;
    expect(n.tile).toEqual(antes);
  });

  it('ida e volta: quando o sobrinho volta, o Nick vai para o tile de onde ele veio (atrás, nunca à frente)', () => {
    const n = acordadoAoLado();
    n.registrarPasso(t(6, 5), 'direita'); // Nick em (5,5)
    n.registrarPasso(t(7, 5), 'direita'); // Nick em (6,5)
    n.registrarPasso(t(6, 5), 'esquerda'); // sobrinho volta para (6,5); Nick vai para (7,5), atrás dele no novo sentido
    expect(n.tile).toEqual(t(7, 5));
    expect(n.tile).not.toEqual(t(6, 5));
  });

  it('o Nick nunca bloqueia o sobrinho, mesmo com o tile na frente dele', () => {
    const n = acordadoAoLado();
    expect(n.bloqueia(t(5, 5))).toBe(false);
  });
});

describe('entrada numa área pela porta (PT3, 2026-11-09: sem semente vizinha)', () => {
  it('acordado: vai para o tile da chegada, oculto, e a fila começa com a chegada', () => {
    const n = Nick.dormindoEm(t(8, 5), 'baixo');
    n.acordar(t(7, 5));
    n.entrarNaArea(t(9, 5), 'esquerda');
    expect(n.tile).toEqual(t(9, 5));
    expect(n.oculto).toBe(true);
    expect(n.fila.entradas).toEqual([t(9, 5)]);
  });

  it('antes do primeiro passo do sobrinho, o Nick não se move e segue oculto', () => {
    const n = Nick.dormindoEm(t(8, 5), 'baixo');
    n.acordar(t(7, 5));
    n.entrarNaArea(t(9, 5), 'esquerda');
    expect(n.oculto).toBe(true);
    expect(n.tile).toEqual(t(9, 5));
  });

  it('no primeiro passo do sobrinho (o offset de 1 tile) o Nick aparece na chegada, sem sair dela', () => {
    const n = Nick.dormindoEm(t(8, 5), 'baixo');
    n.acordar(t(7, 5));
    n.entrarNaArea(t(9, 5), 'esquerda');
    const mov = n.registrarPasso(t(8, 5), 'esquerda');
    expect(mov.tipo).toBe('saltou');
    expect(n.oculto).toBe(false);
    expect(n.tile).toEqual(t(9, 5));
  });

  it('depois de aparecer, o Nick segue 1 tile atrás do sobrinho', () => {
    const n = Nick.dormindoEm(t(8, 5), 'baixo');
    n.acordar(t(7, 5));
    n.entrarNaArea(t(9, 5), 'esquerda');
    n.registrarPasso(t(8, 5), 'esquerda'); // aparece em (9,5)
    expect(n.registrarPasso(t(7, 5), 'esquerda')).toEqual({ tipo: 'andou', direcao: 'esquerda', para: t(8, 5) });
  });
});

describe('Farejo (ADR-005 seção 4.5; GDD 16.5.3)', () => {
  const porta = { mapa: S, id: 'P8', gatilho: { x: 6, y: 7 }, saida: 'cima' as const };

  it('dura 5 s; passa o tempo e some', () => {
    const f = new Farejo();
    f.mostrar(porta);
    expect(f.ativo).toBe(true);
    f.avancar(4999);
    expect(f.ativo).toBe(true);
    f.avancar(1);
    expect(f.ativo).toBe(false);
    expect(f.porta).toBeUndefined();
  });

  it('mostrar de novo reinicia os 5 s (F2)', () => {
    const f = new Farejo();
    f.mostrar(porta);
    f.avancar(4000);
    f.mostrar(porta);
    expect(f.restanteMs).toBe(DURACAO_DA_SETA_MS);
  });

  it('sem avancar (pausa da dica ou farejar em animação), o tempo não corre', () => {
    const f = new Farejo();
    f.mostrar(porta);
    expect(f.restanteMs).toBe(DURACAO_DA_SETA_MS);
  });

  it('cancelar apaga a seta (trocar de subárea, 16.5.3)', () => {
    const f = new Farejo();
    f.mostrar(porta);
    f.cancelar();
    expect(f.ativo).toBe(false);
  });
});

describe('árvore e Progresso (ADR-005 seção 1.3 e 1.2)', () => {
  it('estado da árvore conta peças encaixadas, de 0 a 3, e 4 só com a caixa de enfeite (ADR-006 seção 3)', () => {
    expect(estadoDaArvore(() => false)).toBe(0);
    expect(estadoDaArvore((f) => f === FASE_DA_PECA[2])).toBe(1);
    // As três peças, sem a caixa: estado 3 (regressão do Marco 2).
    expect(estadoDaArvore((f) => f !== 'enfeites')).toBe(3);
    // Com a caixa encaixada: estado 4.
    expect(estadoDaArvore(() => true)).toBe(4);
  });

  it('Progresso guarda o Nick e o mantém ao concluir fases', () => {
    const nick = nickInicial();
    const p = Progresso.novo(sobrinhoPorId('lolo'), nick);
    expect(p.nick).toBe(nick);
    const r = p.concluir('introducao');
    expect(r.ok && r.valor.progresso.nick).toBe(nick);
  });
});
