/** Contrato do motor de som (ADR-008 1.8). Os testes usam um motor falso; o real é `motorWebAudio.ts`. */
export type EstadoDoMotor = 'nenhum' | 'suspenso' | 'ativo' | 'interrompido';

export interface VozDeAudio {
  /** Para a voz (com rampa opcional, em ms, para não estalar). */
  parar(rampaMs?: number): void;
}

export interface OpcoesDeToque {
  ganho: number;
  loop: boolean;
  inicio?: number;
  fim?: number;
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
  estado(): EstadoDoMotor;
  retomar(): Promise<void>;
}
