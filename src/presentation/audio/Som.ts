/**
 * Serviço de som do jogo (ADR-008 1, 2, 3, 4 e 5). Um só ponto de entrada para as cenas: `tocar(evento, tela)`.
 * Liberação no primeiro gesto, música em laço, mudo em memória, limite de três efeitos e política por tela.
 * Sem armazenamento local nem de sessão (ADR-002 seção 3). Não usa a API do navegador: quem a usa é o motor (`motorWebAudio.ts`).
 */
import type { EventoDeAudio } from '../../application/audio/eventosDeAudio';
import { LiberacaoDoSom } from './liberacao';
import { Vozes } from './vozes';
import { efeitoPermitidoNaTela, type TelaDoSom } from './politicaDeSom';
import { idDoEvento, ganhoLinear, type ConfigDoCatalogo } from './catalogo';
import { intervaloDoLaco, type InfoDoLaco } from './laco';
import type { EstadoDoMotor, MotorDeAudio, VozDeAudio } from './motorDeAudio';

export interface EntradaDeAudio {
  config: ConfigDoCatalogo & { musica: { id: string; ganhoDb: number } };
  /** Metadados do laço da música (ADR-008 1.4), lidos de audio-meta.json. */
  laco: InfoDoLaco;
  /** Bytes de cada arquivo, por id (base64 dentro do HTML; ADR-008 1.6). */
  bytes: Record<string, ArrayBuffer>;
}

export interface EstadoDoSom {
  liberado: boolean;
  contexto: EstadoDoMotor;
  decodificado: boolean;
  /** Quantos dos 14 arquivos estão decodificados (diagnóstico de iOS). */
  decodificados: number;
  /** Arquivo e motivo de cada falha de decodificação ainda pendente. */
  erros: string[];
  /** Contagem de efeitos descartados, por motivo. */
  descartados: { semLiberacao: number; mudo: number; semBuffer: number; politica: number };
  /** Erros de execução capturados (resume recusado etc.). */
  errosDeExecucao: string[];
  musicaComContextoAtivo: boolean;
  tempoDecodeMs: number;
  musica: 'tocando' | 'pendente' | 'parada';
  vozes: number;
  mudo: boolean;
  ultimosEventos: { evento: string; instante: number }[];
}

const MAXIMO_DE_EVENTOS_GUARDADOS = 20;

export class Som {
  private readonly liberacao = new LiberacaoDoSom();
  private readonly buffers = new Map<string, unknown>();
  private decodificado = false;
  private tempoDecodeMs = 0;
  private musicaVoz: VozDeAudio | null = null;
  private musicaPendente = false;
  private musicaComContextoAtivo = false;
  private readonly vozes = new Vozes<{ voz: VozDeAudio | null }>();
  private mudo = false;
  private readonly ouvintes: ((mudo: boolean) => void)[] = [];
  private ultimos: { evento: string; instante: number }[] = [];
  private readonly erros = new Map<string, string>();
  /** Quantas vezes um efeito foi descartado, e por quê (diagnóstico: nada some sem motivo). */
  private readonly descartados = { semLiberacao: 0, mudo: 0, semBuffer: 0, politica: 0 };
  /** Erros de tempo de execução (ex.: resume recusado pelo iOS), sem engolir: aparecem em `estado().errosDeExecucao`. */
  private readonly errosDeExecucao: string[] = [];

  constructor(
    private readonly motor: MotorDeAudio,
    private readonly entrada: EntradaDeAudio,
    private readonly relogio: () => number = () => Date.now(),
  ) {}

  /** Ids de todos os arquivos (trilha e os 13 efeitos). */
  private idsDeAudio(): string[] {
    return [this.entrada.config.musica.id, ...Object.values(this.entrada.config.eventos).map((e) => e.id)];
  }

  /**
   * Decodifica os arquivos no boot, sem gesto (ADR-008 2.2). Cada arquivo é decodificado sozinho: uma falha não derruba
   * os outros (em WebKit, um MP3 que não decodifica deixava o jogo mudo). O que falhar fica em `erros` e é tentado de
   * novo no primeiro gesto, com o contexto real (`redecodificarFaltantes`).
   */
  async decodificarTudo(): Promise<void> {
    const t0 = this.relogio();
    for (const id of this.idsDeAudio()) {
      const bytes = this.entrada.bytes[id];
      if (!bytes) {
        this.erros.set(id, 'não está embutido no build');
        continue;
      }
      try {
        this.buffers.set(id, await this.motor.decodificar(bytes));
        this.erros.delete(id);
      } catch (erro) {
        this.erros.set(id, mensagemDe(erro));
      }
    }
    this.decodificado = this.buffers.size > 0;
    this.tempoDecodeMs = this.relogio() - t0;
    if (this.musicaPendente) this.tocarMusica();
  }

  /** Tenta de novo os arquivos que falharam, agora com o contexto real (depois do gesto). Não bloqueia nada. */
  private async redecodificarFaltantes(): Promise<void> {
    for (const id of this.idsDeAudio()) {
      if (this.buffers.has(id) || !this.entrada.bytes[id]) continue;
      try {
        this.buffers.set(id, await this.motor.decodificar(this.entrada.bytes[id], true));
        this.erros.delete(id);
      } catch (erro) {
        this.erros.set(id, mensagemDe(erro));
      }
    }
    this.decodificado = this.buffers.size > 0;
    if (this.musicaPendente) this.tocarMusica();
  }

  /** Recebe cada gesto da janela. O primeiro que libera abre o contexto e começa a música (ADR-008 2.1). */
  gesto(tipo: string, tecla?: string): void {
    const primeiro = this.liberacao.tentar(tipo, tecla);
    // iOS: a destrava só vale dentro do gesto. Enquanto o contexto não estiver "running", cada gesto tenta de novo.
    if (primeiro || (this.liberacao.estaLiberado() && this.motor.estado() !== 'ativo')) {
      this.motor.iniciar();
      this.motor.definirMestre(this.mudo ? 0 : this.entrada.config.mestre);
    }
    if (primeiro) {
      if (this.buffers.has(this.entrada.config.musica.id)) this.tocarMusica();
      else this.musicaPendente = true;
      void this.redecodificarFaltantes();
    }
    if (this.liberacao.estaLiberado() && this.motor.estado() !== 'ativo') {
      this.motor
        .retomar()
        .then(() => this.garantirMusicaAtiva())
        .catch((erro: unknown) => this.registrarErro('retomar', erro));
    }
  }

  /** Se a música começou com o contexto suspenso e agora ele está ativo, recomeça a música do zero (uma vez). */
  private registrarErro(origem: string, erro: unknown): void {
    this.errosDeExecucao.push(`${origem}: ${mensagemDe(erro)}`);
    if (this.errosDeExecucao.length > 20) this.errosDeExecucao.shift();
  }

  private garantirMusicaAtiva(): void {
    if (!this.musicaVoz || this.musicaComContextoAtivo || this.motor.estado() !== 'ativo') return;
    this.musicaVoz.parar();
    this.musicaVoz = null;
    this.tocarMusica();
  }

  /** Um efeito. Antes da liberação ou da decodificação, é descartado (ADR-008 2.3). */
  tocar(evento: EventoDeAudio, tela: TelaDoSom): void {
    if (!this.liberacao.estaLiberado()) {
      this.descartados.semLiberacao++;
      return;
    }
    if (this.mudo) {
      this.descartados.mudo++;
      return;
    }
    if (!efeitoPermitidoNaTela(tela, evento)) {
      this.descartados.politica++;
      return;
    }
    if (this.motor.estado() !== 'ativo') {
      this.motor.retomar().catch((erro: unknown) => this.registrarErro('retomar (efeito)', erro));
    }
    const buffer = this.buffers.get(idDoEvento(this.entrada.config, evento));
    if (buffer === undefined) {
      this.descartados.semBuffer++;
      return;
    }
    const entrada: { voz: VozDeAudio | null } = { voz: null };
    entrada.voz = this.motor.tocar(buffer, {
      ganho: ganhoLinear(this.entrada.config.eventos[evento].ganhoDb),
      loop: false,
      aoTerminar: () => this.vozes.remover(entrada),
    });
    for (const parada of this.vozes.registrar(entrada)) parada.voz?.parar(10);
    this.ultimos.push({ evento, instante: this.relogio() });
    if (this.ultimos.length > MAXIMO_DE_EVENTOS_GUARDADOS) this.ultimos.shift();
  }

  /** M, o ícone e o item da pausa. Desligar não toca nada; ligar toca S12 (ADR-008 R6). A música segue. */
  alternarMudo(tela: TelaDoSom): boolean {
    this.mudo = !this.mudo;
    this.motor.definirMestre(this.mudo ? 0 : this.entrada.config.mestre);
    for (const o of this.ouvintes) o(this.mudo);
    if (!this.mudo) this.tocar('S12', tela);
    return this.mudo;
  }

  get estaMudo(): boolean {
    return this.mudo;
  }

  aoMudar(ouvinte: (mudo: boolean) => void): void {
    this.ouvintes.push(ouvinte);
  }

  /** Estado para o gancho de QA (`__estado().audio`, ADR-008 2.6). */
  estado(): EstadoDoSom {
    return {
      liberado: this.liberacao.estaLiberado(),
      contexto: this.motor.estado(),
      decodificado: this.decodificado,
      tempoDecodeMs: this.tempoDecodeMs,
      musica: this.musicaVoz ? 'tocando' : this.musicaPendente ? 'pendente' : 'parada',
      vozes: this.vozes.total(),
      mudo: this.mudo,
      ultimosEventos: [...this.ultimos],
      decodificados: this.buffers.size,
      erros: [...this.erros].map(([id, msg]) => `${id}: ${msg}`),
      descartados: { ...this.descartados },
      errosDeExecucao: [...this.errosDeExecucao],
      musicaComContextoAtivo: this.musicaComContextoAtivo,
    };
  }

  private tocarMusica(): void {
    if (this.musicaVoz) return;
    this.musicaPendente = false;
    const id = this.entrada.config.musica.id;
    const buffer = this.buffers.get(id);
    if (buffer === undefined) {
      this.musicaPendente = true;
      return;
    }
    const { inicio, fim } = intervaloDoLaco(this.motor.comprimento(buffer), this.motor.taxaDoBuffer(buffer), this.entrada.laco);
    // Iniciada com o contexto ainda não "running": refeita quando ele ficar ativo (iOS pode descartar o que começou suspenso).
    this.musicaComContextoAtivo = this.motor.estado() === 'ativo';
    this.musicaVoz = this.motor.tocar(buffer, { ganho: ganhoLinear(this.entrada.config.musica.ganhoDb), loop: true, inicio, fim });
  }
}

function mensagemDe(erro: unknown): string {
  if (erro instanceof Error) return erro.message || erro.name;
  if (typeof erro === 'object' && erro !== null && 'message' in erro) return String((erro as { message: unknown }).message);
  return String(erro) || 'erro desconhecido';
}
