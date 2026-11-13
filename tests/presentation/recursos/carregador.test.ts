import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CarregadorDeRecursos, type ItemDeRecurso } from '../../../src/presentation/recursos/carregador';
import { urlDoRecurso } from '../../../src/presentation/recursos/url';

/** ADR-009 4.3 e 4.4 e 9: fila de até 4 downloads, 3 tentativas (0, 0,5 s, 1,5 s), timeout de 15 s, falha silenciosa. */
const BASE = 'https://exemplo.test/vila-do-natal/';
const item = (id: string, tipo: 'imagem' | 'audio' = 'audio'): ItemDeRecurso => ({ tipo, id, url: urlDoRecurso(`audio/${id}.abc.mp3`, BASE) });
const bytes = (n: number) => new Uint8Array([n]).buffer;

/** Relógio de teste: `esperar` usa o relógio falso do vitest, e `agora` lê o tempo simulado. */
function montar(buscar: (url: string) => Promise<ArrayBuffer>, extra: { simultaneos?: number } = {}) {
  let agora = 0;
  const chamadas: { url: string; em: number }[] = [];
  const carregador = new CarregadorDeRecursos({
    buscar: (url) => {
      chamadas.push({ url, em: agora });
      return buscar(url);
    },
    esperar: (ms) => new Promise<void>((r) => setTimeout(r, ms)),
    ...extra,
  });
  const avancar = async (ms: number) => {
    for (let i = 0; i < ms; i += 100) {
      agora += 100;
      await vi.advanceTimersByTimeAsync(100);
    }
  };
  return { carregador, chamadas, avancar, agora: () => agora };
}

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('carga: tentativas, timeout e falha (ADR-009 4.4)', () => {
  it('tenta três vezes: agora, após 0,5 s e após mais 1,5 s; depois fica falhou sem nova tentativa', async () => {
    const { carregador, chamadas, avancar } = montar(() => Promise.reject(new Error('rede caiu')));
    carregador.enfileirar([item('mus_natal')]);
    await avancar(3000);
    expect(chamadas.map((c) => c.em)).toEqual([0, 500, 2000]);
    expect(carregador.estado('mus_natal')).toBe('falhou');
    expect(carregador.falhas()).toEqual(['mus_natal: rede caiu']);
    await avancar(20000);
    expect(chamadas).toHaveLength(3);
  });

  it('uma falha e depois sucesso: fica pronta e entrega os bytes', async () => {
    let n = 0;
    const { carregador, avancar } = montar(() => (++n === 1 ? Promise.reject(new Error('instável')) : Promise.resolve(bytes(7))));
    carregador.enfileirar([item('sfx_s01_passo')]);
    await avancar(1000);
    expect(carregador.estado('sfx_s01_passo')).toBe('pronta');
    expect(new Uint8Array(carregador.bytesDe('sfx_s01_passo')!)[0]).toBe(7);
    expect(carregador.falhas()).toEqual([]);
  });

  it('timeout de 15 s conta como falha; a terceira tentativa com timeout deixa o recurso falhou', async () => {
    const { carregador, chamadas, avancar } = montar(() => new Promise<ArrayBuffer>(() => undefined));
    carregador.enfileirar([item('jin_jc_natal')]);
    // Cada tentativa dura 15 s até o timeout; a próxima começa depois da espera (0,5 s, depois 1,5 s).
    await avancar(47_000 + 200);
    expect(chamadas.map((c) => c.em)).toEqual([0, 15_500, 32_000]);
    expect(carregador.estado('jin_jc_natal')).toBe('falhou');
    expect(carregador.falhas()[0]).toMatch(/jin_jc_natal: tempo esgotado/);
  });

  it('chegada depois da falha de uma tentativa com timeout ainda conta como pronta (sem ir além da terceira)', async () => {
    let n = 0;
    const { carregador, avancar } = montar(() => (++n < 2 ? new Promise<ArrayBuffer>(() => undefined) : Promise.resolve(bytes(1))));
    carregador.enfileirar([item('jin_j01_luzes')]);
    await avancar(16_000);
    expect(carregador.estado('jin_j01_luzes')).toBe('pronta');
  });

  it('a falha não escreve no console (release sem ruído, ADR-009 4.4)', async () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { carregador, avancar } = montar(() => Promise.reject(new Error('x')));
    carregador.enfileirar([item('sfx_s02_porta')]);
    await avancar(3000);
    expect(erro).not.toHaveBeenCalled();
    expect(aviso).not.toHaveBeenCalled();
    erro.mockRestore();
    aviso.mockRestore();
  });
});

describe('carga: fila, simultâneos e ordem (ADR-009 4.1 e 4.3)', () => {
  it('no máximo 4 downloads ao mesmo tempo', async () => {
    const resolvers: ((v: ArrayBuffer) => void)[] = [];
    let emVoo = 0;
    let maximo = 0;
    const { carregador, avancar } = montar(
      () =>
        new Promise<ArrayBuffer>((r) => {
          emVoo++;
          maximo = Math.max(maximo, emVoo);
          resolvers.push((v) => {
            emVoo--;
            r(v);
          });
        }),
    );
    carregador.enfileirar(Array.from({ length: 10 }, (_, i) => item(`sfx_${i}`)));
    await avancar(100);
    expect(maximo).toBe(4);
    // Libera os quatro que estão em voo; entram mais quatro, sem passar de quatro.
    while (resolvers.length) {
      resolvers.shift()!(bytes(0));
      await avancar(100);
    }
    expect(maximo).toBe(4);
    expect(Object.values(carregador.todos()).every((e) => e === 'pronta')).toBe(true);
  });

  it('pede na ordem da fila (prioridade da release: título, trilha, efeitos, jingles, fim)', async () => {
    const pedidos: string[] = [];
    const { carregador, avancar } = montar((url) => {
      pedidos.push(url);
      return Promise.resolve(bytes(0));
    }, { simultaneos: 1 });
    carregador.enfileirar([item('a'), item('b'), item('c')]);
    await avancar(500);
    expect(pedidos.map((u) => u.split('/').pop())).toEqual(['a.abc.mp3', 'b.abc.mp3', 'c.abc.mp3']);
  });

  it('aoChegar chama quando chega, e nunca chama se falhou', async () => {
    let n = 0;
    const { carregador, avancar } = montar((url) => (url.includes('ruim') || ++n > 3 ? Promise.reject(new Error('x')) : Promise.resolve(bytes(9))));
    const chegou: string[] = [];
    carregador.aoChegar('bom', () => chegou.push('bom'));
    carregador.aoChegar('ruim', () => chegou.push('ruim'));
    carregador.enfileirar([{ tipo: 'audio', id: 'bom', url: BASE + 'bom.mp3' }, { tipo: 'audio', id: 'ruim', url: BASE + 'ruim.mp3' }]);
    await avancar(5000);
    expect(chegou).toEqual(['bom']);
    expect(carregador.estado('ruim')).toBe('falhou');
  });
});

describe('URLs relativas (ADR-009 3)', () => {
  it('monta a URL sem barra inicial, na raiz e em subcaminho', () => {
    expect(urlDoRecurso('imagens/titulo.abc12345.png', 'https://italo-zen.github.io/vila-do-natal/')).toBe('https://italo-zen.github.io/vila-do-natal/imagens/titulo.abc12345.png');
    expect(urlDoRecurso('imagens/titulo.abc12345.png', 'https://exemplo.test/')).toBe('https://exemplo.test/imagens/titulo.abc12345.png');
    expect(urlDoRecurso('audio/mus_natal.1.mp3', 'https://italo-zen.github.io/vila-do-natal/index.html')).toBe('https://italo-zen.github.io/vila-do-natal/audio/mus_natal.1.mp3');
  });
});
