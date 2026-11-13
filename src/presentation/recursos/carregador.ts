/**
 * Carregador de recursos fora do HTML (ADR-009 4). Função de estado com E/S injetada: `buscar` (rede) e `esperar`
 * (tempo), para o teste controlar os dois. Regras: no máximo `simultaneos` downloads; cada recurso tem até três tentativas
 * (0 s, 0,5 s e 1,5 s depois da falha anterior), e cada tentativa tem `timeoutMs`; depois da última, fica `falhou` e não
 * tenta mais. Nenhuma mensagem vai ao console: a falha só aparece em `falhas()`, que o gancho de QA lê (ADR-009 4.4).
 */
export type EstadoDoRecurso = 'pendente' | 'pronta' | 'falhou';

export interface ItemDeRecurso {
  tipo: 'imagem' | 'audio';
  id: string;
  /** URL absoluta, já montada com `urlDoRecurso`. */
  url: string;
}

export interface OpcoesDoCarregador {
  buscar(url: string): Promise<ArrayBuffer>;
  esperar(ms: number): Promise<void>;
  simultaneos?: number;
  /** Espera antes de cada tentativa: a primeira agora, a segunda após 0,5 s, a terceira após 1,5 s (ADR-009 4.4). */
  esperasEntreTentativasMs?: number[];
  timeoutMs?: number;
}

const SIMULTANEOS_PADRAO = 4;
const ESPERAS_PADRAO = [0, 500, 1500];
const TIMEOUT_PADRAO_MS = 15_000;

export class CarregadorDeRecursos {
  private readonly fila: ItemDeRecurso[] = [];
  private emAndamento = 0;
  private readonly estados = new Map<string, EstadoDoRecurso>();
  private readonly bytes = new Map<string, ArrayBuffer>();
  private readonly ouvintes = new Map<string, ((bytes: ArrayBuffer) => void)[]>();
  private readonly ouvintesGerais: ((item: ItemDeRecurso, bytes: ArrayBuffer) => void)[] = [];
  private readonly falhasLista: string[] = [];
  private readonly simultaneos: number;
  private readonly esperas: number[];
  private readonly timeoutMs: number;

  constructor(private readonly o: OpcoesDoCarregador) {
    this.simultaneos = o.simultaneos ?? SIMULTANEOS_PADRAO;
    this.esperas = o.esperasEntreTentativasMs ?? ESPERAS_PADRAO;
    this.timeoutMs = o.timeoutMs ?? TIMEOUT_PADRAO_MS;
  }

  /** Põe itens na fila, na ordem dada, e começa a baixar até o limite de simultâneos. */
  enfileirar(itens: ItemDeRecurso[]): void {
    for (const it of itens) {
      if (this.estados.has(it.id)) continue;
      this.estados.set(it.id, 'pendente');
      this.fila.push(it);
    }
    this.proximo();
  }

  estado(id: string): EstadoDoRecurso {
    return this.estados.get(id) ?? 'pendente';
  }

  /** Todos os estados conhecidos (para o gancho de QA). */
  todos(): Record<string, EstadoDoRecurso> {
    return Object.fromEntries(this.estados);
  }

  bytesDe(id: string): ArrayBuffer | null {
    return this.bytes.get(id) ?? null;
  }

  /** Chama `fn` quando o recurso chegar. Se já chegou, chama agora. Se falhar, não chama nunca (falha silenciosa). */
  aoChegar(id: string, fn: (bytes: ArrayBuffer) => void): void {
    const pronto = this.bytes.get(id);
    if (pronto) {
      fn(pronto);
      return;
    }
    const lista = this.ouvintes.get(id) ?? [];
    lista.push(fn);
    this.ouvintes.set(id, lista);
  }

  /** Chama `fn` para todo recurso que chegar (o jogo liga o áudio aqui). */
  aoReceberTodos(fn: (item: ItemDeRecurso, bytes: ArrayBuffer) => void): void {
    this.ouvintesGerais.push(fn);
  }

  falhas(): string[] {
    return [...this.falhasLista];
  }

  private proximo(): void {
    while (this.emAndamento < this.simultaneos && this.fila.length > 0) {
      const item = this.fila.shift()!;
      this.emAndamento++;
      void this.baixar(item).finally(() => {
        this.emAndamento--;
        this.proximo();
      });
    }
  }

  private async baixar(item: ItemDeRecurso): Promise<void> {
    let motivo = 'sem tentativa';
    for (const espera of this.esperas) {
      if (espera > 0) await this.o.esperar(espera);
      try {
        const bytes = await this.comTimeout(this.o.buscar(item.url));
        this.bytes.set(item.id, bytes);
        this.estados.set(item.id, 'pronta');
        for (const fn of this.ouvintes.get(item.id) ?? []) fn(bytes);
        for (const fn of this.ouvintesGerais) fn(item, bytes);
        return;
      } catch (erro) {
        motivo = erro instanceof Error ? erro.message : String(erro);
      }
    }
    this.estados.set(item.id, 'falhou');
    this.falhasLista.push(`${item.id}: ${motivo}`);
  }

  private comTimeout<T>(promessa: Promise<T>): Promise<T> {
    return Promise.race([promessa, this.o.esperar(this.timeoutMs).then(() => Promise.reject(new Error('tempo esgotado')))]);
  }
}
