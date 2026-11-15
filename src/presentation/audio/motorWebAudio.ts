/**
 * Motor de som real (ADR-008 1.8, 2.2, 5.2 e 10). Único arquivo de apresentação que usa a API Web Audio. Só toca buffers
 * decodificados; não sintetiza nada.
 *
 * Destrava no iOS (WebKit): `resume()` e o buffer de uma amostra só valem dentro de um gesto. Por isso `iniciar()` roda
 * a cada gesto enquanto o contexto não estiver "running". O jogo respeita a chave de silencioso do aparelho: não há
 * caminho de mídia que a contorne. Decodificação: forma com callback e promessa, sobre cópia dos bytes.
 *
 * Grafo: fonte → ganho da voz → barramento (a trilha tem o seu, para o ducking) → mestre → saída.
 */
import type { EstadoDoMotor, MotorDeAudio, NoDeAudio, OpcoesDeToque, VozDeAudio } from './motorDeAudio';

type ContextoComPrefixo = typeof AudioContext;

/** Decodifica com a forma de callback e a de promessa (WebKit antigo só tem a primeira). Copia os bytes: o WebKit os transfere. */
export function decodificarComCallbacks(ctx: BaseAudioContext, bytes: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise<AudioBuffer>((resolve, reject) => {
    const copia = bytes.slice(0);
    const falha = (erro: unknown) => reject(erro ?? new Error('decodeAudioData falhou'));
    const retorno = (ctx as BaseAudioContext & { decodeAudioData(d: ArrayBuffer, ok?: (b: AudioBuffer) => void, err?: (e: unknown) => void): Promise<AudioBuffer> | undefined }).decodeAudioData(
      copia,
      resolve,
      falha,
    );
    if (retorno && typeof (retorno as Promise<AudioBuffer>).then === 'function') (retorno as Promise<AudioBuffer>).then(resolve, falha);
  });
}

export class MotorWebAudio implements MotorDeAudio {
  private contexto: AudioContext | null = null;
  private mestre: GainNode | null = null;
  private trilha: GainNode | null = null;

  iniciar(): void {
    if (!this.contexto) {
      const Ctor: ContextoComPrefixo | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: ContextoComPrefixo }).webkitAudioContext;
      if (!Ctor) return;
      this.contexto = new Ctor();
      this.mestre = this.contexto.createGain();
      this.mestre.connect(this.contexto.destination);
      this.trilha = this.contexto.createGain();
      this.trilha.connect(this.mestre);
    }
    this.tocarSilencioDoGesto();
  }

  /** No gesto: um buffer de uma amostra destrava a saída do Web Audio (iOS). Não toca som audível. */
  private tocarSilencioDoGesto(): void {
    const ctx = this.contexto;
    if (!ctx || !this.mestre) return;
    const fonte = ctx.createBufferSource();
    fonte.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    fonte.connect(this.mestre);
    fonte.start(0);
  }

  async decodificar(bytes: ArrayBuffer, aoVivo = false): Promise<unknown> {
    // No boot, contexto offline (não precisa de gesto). Depois do gesto, o contexto real, se houver.
    if (aoVivo && this.contexto) return decodificarComCallbacks(this.contexto, bytes);
    const Ctor = window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
    if (!Ctor) throw new Error('Este navegador não tem Web Audio.');
    return decodificarComCallbacks(new Ctor(1, 1, 44100), bytes);
  }

  comprimento(buffer: unknown): number {
    return (buffer as AudioBuffer).length;
  }

  taxaDoBuffer(buffer: unknown): number {
    return (buffer as AudioBuffer).sampleRate;
  }

  tocar(buffer: unknown, opcoes: OpcoesDeToque): VozDeAudio {
    const ctx = this.contexto;
    if (!ctx || !this.mestre) return { fimEm: 0, parar: () => undefined, pararEm: () => undefined };
    const audio = buffer as AudioBuffer;
    const fonte = ctx.createBufferSource();
    fonte.buffer = audio;
    fonte.loop = opcoes.loop;
    if (opcoes.loop && opcoes.inicio !== undefined && opcoes.fim !== undefined) {
      fonte.loopStart = opcoes.inicio / audio.sampleRate;
      fonte.loopEnd = opcoes.fim / audio.sampleRate;
    }
    const ganho = ctx.createGain();
    ganho.gain.value = opcoes.ganho;
    const destino = (opcoes.barramento as AudioNode | undefined) ?? this.mestre;
    fonte.connect(ganho).connect(destino);
    fonte.onended = () => opcoes.aoTerminar?.();
    const inicio = Math.max(ctx.currentTime, opcoes.inicioEm ?? 0);
    fonte.start(inicio);
    const fimEm = opcoes.loop ? Infinity : inicio + audio.duration;
    return {
      fimEm,
      parar: (rampaMs = 0) => {
        if (rampaMs <= 0) {
          fonte.stop();
          return;
        }
        const agora = ctx.currentTime;
        ganho.gain.setTargetAtTime(0, agora, rampaMs / 3000);
        fonte.stop(agora + rampaMs / 1000);
      },
      pararEm: (instante: number, rampaS = 0) => {
        if (rampaS <= 0) {
          fonte.stop(Math.max(0, instante));
          return;
        }
        ganho.gain.cancelScheduledValues(instante);
        ganho.gain.setValueAtTime(ganho.gain.value, instante);
        ganho.gain.linearRampToValueAtTime(0, instante + rampaS);
        fonte.stop(instante + rampaS);
      },
    };
  }

  definirMestre(ganho: number): void {
    if (!this.contexto || !this.mestre) return;
    this.mestre.gain.setTargetAtTime(ganho, this.contexto.currentTime, 0.02);
  }

  barramentoDaTrilha(): NoDeAudio | null {
    return this.trilha;
  }

  agora(): number {
    return this.contexto ? this.contexto.currentTime : 0;
  }

  rampaGanho(no: NoDeAudio, alvo: number, duracaoS: number, inicioEm: number): void {
    const g = no as GainNode | null;
    if (!g) return;
    g.gain.cancelScheduledValues(inicioEm);
    g.gain.setValueAtTime(g.gain.value, inicioEm);
    g.gain.linearRampToValueAtTime(alvo, inicioEm + duracaoS);
  }

  estado(): EstadoDoMotor {
    if (!this.contexto) return 'nenhum';
    const s = this.contexto.state as string;
    if (s === 'running') return 'ativo';
    if (s === 'interrupted') return 'interrompido';
    return 'suspenso';
  }

  async retomar(): Promise<void> {
    if (this.contexto && this.contexto.state !== 'running') await this.contexto.resume();
  }
}
