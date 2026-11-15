/** Contrato do motor de som (ADR-008 1.8 e 5.2). Os testes usam um motor falso; o real é `motorWebAudio.ts`. */
export type EstadoDoMotor = 'nenhum' | 'suspenso' | 'ativo' | 'interrompido';

/** Nó de ganho do motor (opaco para a apresentação: só o motor sabe o que é). */
export type NoDeAudio = unknown;

export interface VozDeAudio {
  /** Para a voz (com rampa opcional, em ms, para não estalar). */
  parar(rampaMs?: number): void;
  /** Instante, no relógio do motor (segundos), em que a voz termina (`Infinity` se tem laço). */
  readonly fimEm: number;
  /** Para a voz no instante dado, com rampa linear de `rampaS` segundos até zero (0 corta; ADR-008 5.2). */
  pararEm(instante: number, rampaS?: number): void;
}

export interface OpcoesDeToque {
  ganho: number;
  loop: boolean;
  inicio?: number;
  fim?: number;
  /** Barramento de destino (ex.: a trilha, para o ducking). Sem ele, a saída é o mestre. */
  barramento?: NoDeAudio;
  /** Instante do relógio do motor em que a voz começa (sem ele, começa agora). */
  inicioEm?: number;
  /** Chamado quando a voz termina sozinha (não quando é parada). */
  aoTerminar?: () => void;
}

export interface MotorDeAudio {
  /** Cria o contexto de áudio (chamado no primeiro gesto). */
  iniciar(): void;
  /** Decodifica os bytes do MP3 (sem gesto; o contexto offline não precisa de liberação). */
  decodificar(bytes: ArrayBuffer, aoVivo?: boolean): Promise<unknown>;
  /** Número de amostras de um buffer decodificado. */
  comprimento(buffer: unknown): number;
  /** Taxa de amostragem do buffer (Hz). Pode diferir da do contexto e da do arquivo. */
  taxaDoBuffer(buffer: unknown): number;
  tocar(buffer: unknown, opcoes: OpcoesDeToque): VozDeAudio;
  definirMestre(ganho: number): void;
  /** Barramento da trilha (entre o laço e o mestre), para o ducking. Nulo antes do contexto existir. */
  barramentoDaTrilha(): NoDeAudio | null;
  /** Relógio do motor, em segundos. Zero antes do contexto existir. */
  agora(): number;
  /** Rampa linear de ganho de um nó, começando em `inicioEm` e durando `duracaoS`; cancela automação futura do nó. */
  rampaGanho(no: NoDeAudio, alvo: number, duracaoS: number, inicioEm: number): void;
  estado(): EstadoDoMotor;
  retomar(): Promise<void>;
}
