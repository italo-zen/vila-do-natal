import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TECLAS, acaoDaTecla, teclaDoPainel, type Acao } from '../../src/presentation/input/mapaDeTeclas';

/** Mapa de teclas (GDD 5 e 14.8): função pura, sem Phaser. O painel da porta usa as mesmas ações do jogo. */

describe('mapa de teclas do jogo', () => {
  it.each([
    ['ArrowUp', 'cima'],
    ['ArrowDown', 'baixo'],
    ['ArrowLeft', 'esquerda'],
    ['ArrowRight', 'direita'],
    ['w', 'cima'],
    ['s', 'baixo'],
    ['a', 'esquerda'],
    ['d', 'direita'],
    ['W', 'cima'],
    ['S', 'baixo'],
    ['A', 'esquerda'],
    ['D', 'direita'],
    ['z', 'a'],
    ['Z', 'a'],
    ['Enter', 'a'],
    ['x', 'b'],
    ['X', 'b'],
    ['Escape', 'b'],
  ] as [string, Acao][])('%s é a ação %s', (tecla, acao) => {
    expect(acaoDaTecla(tecla)).toBe(acao);
  });

  it('dígitos e Backspace não são ação do jogo', () => {
    for (const t of ['0', '5', '9', 'Backspace', 'Shift', 'q']) expect(acaoDaTecla(t)).toBeNull();
  });

  it('nenhuma tecla do Phaser está em duas ações', () => {
    const vistas = new Map<string, Acao>();
    for (const acao of Object.keys(TECLAS) as Acao[]) {
      for (const nome of TECLAS[acao]) {
        expect(vistas.has(nome), `${nome} em ${vistas.get(nome)} e em ${acao}`).toBe(false);
        vistas.set(nome, acao);
      }
    }
  });
});

describe('painel da porta: teclas (GDD 14.1 e 14.8)', () => {
  it.each([
    ['ArrowUp', 'cima'],
    ['ArrowDown', 'baixo'],
    ['ArrowLeft', 'esquerda'],
    ['ArrowRight', 'direita'],
    ['w', 'cima'],
    ['a', 'esquerda'],
    ['s', 'baixo'],
    ['d', 'direita'],
    ['W', 'cima'],
    ['A', 'esquerda'],
    ['S', 'baixo'],
    ['D', 'direita'],
  ] as [string, 'cima' | 'baixo' | 'esquerda' | 'direita'][])('%s move o foco (%s), igual às setas', (tecla, acao) => {
    expect(teclaDoPainel(tecla, false)).toEqual({ tipo: 'mover', acao });
  });

  it('movimento repete ao segurar a tecla (setas e WASD)', () => {
    expect(teclaDoPainel('a', true)).toEqual({ tipo: 'mover', acao: 'esquerda' });
    expect(teclaDoPainel('ArrowDown', true)).toEqual({ tipo: 'mover', acao: 'baixo' });
  });

  it('dígitos 0 a 9 digitam; A, S, D, W não digitam (não viram número)', () => {
    for (let n = 0; n <= 9; n++) expect(teclaDoPainel(String(n), false)).toEqual({ tipo: 'digito', valor: String(n) });
    for (const t of ['a', 's', 'd', 'w', 'A', 'S', 'D', 'W']) expect(teclaDoPainel(t, false)?.tipo).toBe('mover');
  });

  it('Z e Enter apertam; X e Backspace apagam', () => {
    expect(teclaDoPainel('z', false)).toEqual({ tipo: 'apertar' });
    expect(teclaDoPainel('Enter', false)).toEqual({ tipo: 'apertar' });
    expect(teclaDoPainel('x', false)).toEqual({ tipo: 'apagar' });
    expect(teclaDoPainel('X', false)).toEqual({ tipo: 'apagar' });
    expect(teclaDoPainel('Backspace', false)).toEqual({ tipo: 'apagar' });
  });

  it('só Esc fecha', () => {
    expect(teclaDoPainel('Escape', false)).toEqual({ tipo: 'fechar' });
    for (const t of ['z', 'x', 'Enter', 'Backspace', 'Shift', 'q', 'a']) {
      expect(teclaDoPainel(t, false)?.tipo).not.toBe('fechar');
    }
  });

  it('teclas repetidas não digitam, não apertam nem apagam; Esc fecha mesmo repetida', () => {
    expect(teclaDoPainel('5', true)).toBeNull();
    expect(teclaDoPainel('z', true)).toBeNull();
    expect(teclaDoPainel('x', true)).toBeNull();
    expect(teclaDoPainel('Enter', true)).toBeNull();
    expect(teclaDoPainel('Escape', true)).toEqual({ tipo: 'fechar' });
  });

  it('tecla sem efeito no painel devolve null', () => {
    expect(teclaDoPainel('q', false)).toBeNull();
    expect(teclaDoPainel('Shift', false)).toBeNull();
  });
});

describe('textos do painel da porta (sem dica)', () => {
  const textos: Record<string, string> = JSON.parse(
    readFileSync(join(__dirname, '..', '..', 'content', 'texts', 'pt-BR.json'), 'utf-8'),
  );
  const chavesDoPainel = Object.keys(textos).filter((k) => k.startsWith('porta.') || k.startsWith('painel.') || k.startsWith('barra.painel'));

  it('a pergunta e as mensagens de erro continuam', () => {
    expect(textos['porta.pergunta']).toBe('Senha');
    expect(textos['porta.faltam']).toBe('Faltam números.');
    expect(textos['porta.erro.1']).toBe('Quase! Leia o bilhete de novo.');
    expect(textos['porta.erro.2']).toBe('Hmm, esse não é. Tente outra vez!');
    expect(textos['porta.erro.3']).toBe('Sem pressa. Você consegue!');
  });

  it('nenhum texto do painel repete a dica do bilhete (3 últimos dígitos do ano)', () => {
    for (const k of chavesDoPainel) expect(textos[k], k).not.toMatch(/dígitos|Dica/i);
  });

  it('a chave da dica não existe mais no conteúdo (o bilhete usa bilhete.pista)', () => {
    expect(textos['bilhete.2']).toBeUndefined();
    expect(textos['bilhete.pista']).toBe('Dica: os 3 últimos dígitos do ano em que {nome} nasceu.');
  });
});
