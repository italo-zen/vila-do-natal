/**
 * Recursos da build (ADR-009 4.6). Uma só interface para a apresentação; o modo vem do módulo virtual `virtual:recursos`:
 * - `embutido` (playtest, HTML único): tudo já está no HTML. Nada espera; as imagens vêm de data URL.
 * - `externo` (release): a carga começa quando o título está desenhado (`iniciar`), na ordem de `ordem` (ADR-009 4.1).
 */
import { CarregadorDeRecursos, type EstadoDoRecurso, type ItemDeRecurso } from './carregador';
import { urlDoRecurso } from './url';

export interface Recursos {
  readonly modo: 'embutido' | 'externo';
  /** Começa a carga externa (uma vez). No playtest não faz nada. */
  iniciar(): void;
  estado(id: string): EstadoDoRecurso;
  todos(): Record<string, EstadoDoRecurso>;
  /** Chama `fn` com os bytes quando o recurso estiver pronto (agora, se já estiver). Falha: nunca chama. */
  aoChegar(id: string, fn: (bytes: ArrayBuffer) => void): void;
  /** Chama `fn` para cada recurso que chegar pela carga externa (o áudio é decodificado aqui). */
  aoReceberTodos(fn: (item: ItemDeRecurso, bytes: ArrayBuffer) => void): void;
  falhas(): string[];
}

/** Data URL de imagem (modo embutido) para bytes. */
export function bytesDaDataUrl(dataUrl: string): ArrayBuffer {
  const texto = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const bin = atob(texto);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

const esperar = (ms: number) => new Promise<void>((resolver) => setTimeout(resolver, ms));

/**
 * Cria os recursos a partir de um 'deploy' (o que o módulo virtual `virtual:recursos` traz). Função sem leitura de módulo
 * virtual: os testes passam o deploy, a base e o `buscar`. No jogo, ver `recursosDaBuild.ts`.
 */
export function criarRecursos(
  deploy: { modo: 'embutido' | 'externo'; imagens: Record<string, string>; ordem: { tipo: 'imagem' | 'audio'; id: string; arquivo: string }[] },
  base: string,
  buscar: (url: string) => Promise<ArrayBuffer>,
): Recursos {
  if (deploy.modo === 'embutido') {
    const bytesDasImagens = new Map<string, ArrayBuffer>();
    return {
      modo: 'embutido',
      iniciar: () => undefined,
      estado: () => 'pronta',
      todos: () => Object.fromEntries(Object.keys(deploy.imagens).map((id) => [id, 'pronta' as const])),
      aoChegar(id, fn) {
        const dados = deploy.imagens[id];
        if (!dados) return;
        let b = bytesDasImagens.get(id);
        if (!b) {
          b = bytesDaDataUrl(dados);
          bytesDasImagens.set(id, b);
        }
        fn(b);
      },
      aoReceberTodos: () => undefined,
      falhas: () => [],
    };
  }

  const carregador = new CarregadorDeRecursos({ buscar, esperar });
  let iniciado = false;
  return {
    modo: 'externo',
    iniciar() {
      if (iniciado) return;
      iniciado = true;
      carregador.enfileirar(deploy.ordem.map((it) => ({ tipo: it.tipo, id: it.id, url: urlDoRecurso(it.arquivo, base) })));
    },
    estado: (id) => carregador.estado(id),
    todos: () => carregador.todos(),
    aoChegar: (id, fn) => carregador.aoChegar(id, fn),
    aoReceberTodos: (fn) => carregador.aoReceberTodos(fn),
    falhas: () => carregador.falhas(),
  };
}
