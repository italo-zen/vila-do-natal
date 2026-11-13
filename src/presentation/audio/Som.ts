/**
 * Serviço de som do jogo (ADR-008 1 a 5 e 5.2). Um só ponto de entrada para as cenas: `tocar(evento, tela)`,
 * `tocarConquista(chave, tela)` e `tocarCreditos(tela)`. Liberação no primeiro gesto, música em laço com ducking, mudo em
 * memória, limite de três efeitos e política por tela. Sem armazenamento local nem de sessão (ADR-002 seção 3). Não usa a
 * API do navegador: quem a usa é o motor (`motorWebAudio.ts`).
 */
import { EVENTO_EM_FAMILIA, JINGLE_DE_CONQUISTA, type EventoDeAudio } from '../../application/audio/eventosDeAudio';
import { LiberacaoDoSom } from './liberacao';
import { Vozes } from './vozes';
import { efeitoPermitidoNaTela, type TelaDoSom } from './politicaDeSom';
import { idDoEvento, ganhoLinear, type ConfigDoCatalogo } from './catalogo';
import { intervaloDoLaco, type InfoDoLaco } from './laco';
import type { EstadoDoMotor, MotorDeAudio, VozDeAudio } from './motorDeAudio';
import {
  DUCKING_CONQUISTA_DB,
  DUCKING_CREDITOS_DB,
  ENTRADA_CONQUISTA_S,
  ENTRADA_CREDITOS_S,
  RAMPA_DE_CORTE_S,
  SAIDA_CONQUISTA_S,
  SAIDA_CREDITOS_S,
  estadoDoJingle,
  planejarConquista,
  type EstadoDoJingle,
} from './jingle';

export interface EntradaDeAudio {
  config: ConfigDoCatalogo & { musica: { id: string; ganhoDb: number } };
  /** Metadados do laço da música (ADR-008 1.4), lidos de audio-meta.json. */
  laco: InfoDoLaco;
  /** Bytes de cada arquivo, por id (base64 dentro do HTML; ADR-008 1.6). Na release, vazio: os arquivos chegam (`receberArquivo`). */
  bytes: Record<string, ArrayBuffer>;
  /** true na release (ADR-009): arquivo ausente não é erro; ele ainda vai chegar. */
  externo?: boolean;
}

/** Rampa de ganho da trilha, para o gancho de QA (ADR-008 9.5). */
export interface RampaDaTrilha {
  tipo: 'duck' | 'volta' | 'corte';
  ms: number;
  emS: number;
}

export interface EstadoDoSom {
  liberado: boolean;
  contexto: EstadoDoMotor;
  decodificado: boolean;
  /** Quantos dos arquivos (trilha, efeitos, jingles de conquista e de créditos) estão decodificados. */
  decodificados: number;
  /** Arquivo e motivo de cada falha de decodificação ainda pendente. */
  erros: string[];
  /** Contagem de efeitos e jingles descartados, por motivo. */
  descartados: { semLiberacao: number; mudo: number; semBuffer: number; politica: number; ocupado: number };
  /** Erros de execução capturados (resume recusado etc.). */
  errosDeExecucao: string[];
  musicaComContextoAtivo: boolean;
  tempoDecodeMs: number;
  musica: 'tocando' | 'pendente' | 'parada';
  vozes: number;
  mudo: boolean;
  ultimosEventos: { evento: string; instante: number; variante?: string }[];
  trilha: { ganhoDb: number; duckingDb: number; tempoS: number };
  jingle: { estado: EstadoDoJingle; variante: string | null; inicioEmS: number | null; fimEmS: number | null };
  rampas: RampaDaTrilha[];
}

const MAXIMO_DE_EVENTOS_GUARDADOS = 20;
const MAXIMO_DE_RAMPAS_GUARDADAS = 10;
/** Efeitos que a espera do jingle de conquista respeita (ADR-008 5.2). */
const EFEITOS_QUE_A_CONQUISTA_ESPERA: EventoDeAudio[] = ['S04', 'S05', 'S06'];

/** Jingle em curso (conquista ou créditos). Só um por vez (ADR-008 5.2). */
interface JingleAtivo {
  tipo: 'conquista' | 'creditos';
  variante: string;
  voz: VozDeAudio;
  inicioEm: number;
  fimEm: number;
  saidaS: number;
  duckDb: number;
  cortadoEm: number | null;
}

export class Som {
  private readonly liberacao = new LiberacaoDoSom();
  private readonly buffers = new Map<string, unknown>();
  private decodificado = false;
  private tempoDecodeMs = 0;
  private musicaVoz: VozDeAudio | null = null;
  private musicaPendente = false;
  private musicaComContextoAtivo = false;
  private trilhaInicioEm: number | null = null;
  private readonly vozes = new Vozes<{ voz: VozDeAudio | null }>();
  private readonly efeitosRecentes: { evento: EventoDeAudio; fimEm: number }[] = [];
  private jingle: JingleAtivo | null = null;
  private readonly rampas: RampaDaTrilha[] = [];
  private mudo = false;
  private readonly ouvintes: ((mudo: boolean) => void)[] = [];
  private ultimos: { evento: string; instante: number; variante?: string }[] = [];
  private readonly erros = new Map<string, string>();
  /** Quantas vezes um efeito ou jingle foi descartado, e por quê (diagnóstico: nada some sem motivo). */
  private readonly descartados = { semLiberacao: 0, mudo: 0, semBuffer: 0, politica: 0, ocupado: 0 };
  /** Erros de tempo de execução (ex.: resume recusado pelo iOS), sem engolir: aparecem em `estado().errosDeExecucao`. */
  private readonly errosDeExecucao: string[] = [];

  constructor(
    private readonly motor: MotorDeAudio,
    private readonly entrada: EntradaDeAudio,
    private readonly relogio: () => number = () => Date.now(),
  ) {}

  /** Ids de todos os arquivos: trilha, efeitos com id, jingles de conquista e o de créditos (ADR-008 8.1). */
  private idsDeAudio(): string[] {
    const c = this.entrada.config;
    const ids = [c.musica.id];
    for (const e of Object.values(c.eventos)) if (e.id) ids.push(e.id);
    for (const k of Object.values(c.conquistas ?? {})) ids.push(k.id);
    if (c.creditos) ids.push(c.creditos.id);
    return ids;
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
        // Release (ADR-009 4.3): o arquivo chega depois, por `receberArquivo`. Não é erro.
        if (!this.entrada.externo) this.erros.set(id, 'não está embutido no build');
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

  /**
   * Release (ADR-009 4.3): um arquivo chegou pela carga. Decodifica sem gesto (contexto offline). Se a música já estava
   * pedida e liberada, toca agora. Falha de decodificação fica em `erros` (silencioso). Efeito e jingle que chegam tarde
   * não tocam: quem pediu antes já foi descartado (ADR-008 2.3).
   */
  async receberArquivo(id: string, bytes: ArrayBuffer): Promise<void> {
    if (this.buffers.has(id)) return;
    try {
      this.buffers.set(id, await this.motor.decodificar(bytes));
      this.erros.delete(id);
      this.decodificado = true;
    } catch (erro) {
      this.erros.set(id, mensagemDe(erro));
      return;
    }
    if (id === this.entrada.config.musica.id && this.musicaPendente && this.liberacao.estaLiberado()) this.tocarMusica();
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

  private registrarErro(origem: string, erro: unknown): void {
    this.errosDeExecucao.push(`${origem}: ${mensagemDe(erro)}`);
    if (this.errosDeExecucao.length > 20) this.errosDeExecucao.shift();
  }

  /** Se a música começou com o contexto suspenso e agora ele está ativo, recomeça a música do zero (uma vez). */
  private garantirMusicaAtiva(): void {
    if (!this.musicaVoz || this.musicaComContextoAtivo || this.motor.estado() !== 'ativo') return;
    this.musicaVoz.parar();
    this.musicaVoz = null;
    this.tocarMusica();
  }

  /** Um efeito. Antes da liberação ou da decodificação, é descartado (ADR-008 2.3). S09 não é efeito: é `tocarConquista`. */
  tocar(evento: EventoDeAudio, tela: TelaDoSom, inicioEm?: number): void {
    if (evento === EVENTO_EM_FAMILIA) throw new Error('S09 é a família de jingles: use tocarConquista(chave, tela) (ADR-008 5.1).');
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
      ganho: ganhoLinear(this.entrada.config.eventos[evento].ganhoDb ?? 0),
      loop: false,
      inicioEm,
      aoTerminar: () => this.vozes.remover(entrada),
    });
    for (const parada of this.vozes.registrar(entrada)) parada.voz?.parar(10);
    if (entrada.voz) this.efeitosRecentes.push({ evento, fimEm: entrada.voz.fimEm });
    if (this.efeitosRecentes.length > MAXIMO_DE_EVENTOS_GUARDADOS) this.efeitosRecentes.shift();
    this.registrarUltimo(evento);
  }

  /**
   * Jingle de conquista (ADR-008 5.1 e 5.2; GDD 19.2.7 a e b). Toca só na tela de conquista. Se um efeito S04, S05 ou S06
   * está tocando, espera o fim dele (teto de 1,5 s). A trilha baixa 8 dB na entrada e volta 0,5 s depois do fim. Mudo não
   * corta: o jingle segue no tempo, em silêncio.
   */
  tocarConquista(chave: string, tela: TelaDoSom): void {
    const variante = JINGLE_DE_CONQUISTA[chave]?.variante;
    const cfg = this.entrada.config.conquistas?.[chave];
    if (!variante || !cfg) throw new Error(`Conquista sem jingle em content/audio.json: ${chave}.`);
    if (!this.liberacao.estaLiberado()) {
      this.descartados.semLiberacao++;
      return;
    }
    if (tela !== 'conquista') {
      this.descartados.politica++;
      return;
    }
    const agora = this.motor.agora();
    if (this.jingle && estadoDoJingle(this.jingle, agora) !== 'ocioso') {
      this.descartados.ocupado++;
      return;
    }
    const buffer = this.buffers.get(cfg.id);
    if (buffer === undefined) {
      this.descartados.semBuffer++;
      return;
    }
    if (this.motor.estado() !== 'ativo') {
      this.motor.retomar().catch((erro: unknown) => this.registrarErro('retomar (jingle)', erro));
    }
    const duracaoS = this.motor.comprimento(buffer) / this.motor.taxaDoBuffer(buffer);
    const { inicioEm } = planejarConquista(duracaoS, agora, this.efeitoEmCursoDaEspera(agora));
    this.iniciarJingle({ tipo: 'conquista', variante, buffer, ganho: ganhoLinear(cfg.ganhoDb), inicioEm, saidaS: SAIDA_CONQUISTA_S, entradaS: ENTRADA_CONQUISTA_S, duckDb: DUCKING_CONQUISTA_DB });
    this.registrarUltimo('S09', variante);
  }

  /**
   * Interrompe o jingle de conquista (ADR-008 5.2). `continuar`: corta com rampa de 30 ms e toca S12 no fim da rampa, para
   * que os dois não toquem juntos (GDD 19.2.7 b). `saida` (X ou B): corta, sem S12 (R2).
   */
  pararConquista(tela: TelaDoSom, saida: 'continuar' | 'saida'): void {
    const agora = this.motor.agora();
    const j = this.jingle;
    let cortou = false;
    if (j && j.tipo === 'conquista' && estadoDoJingle(j, agora) !== 'ocioso') {
      this.cortar(j, agora);
      cortou = true;
    }
    if (saida === 'continuar') this.tocar('S12', tela, cortou ? agora + RAMPA_DE_CORTE_S : undefined);
  }

  /** Jingle de créditos JC (ADR-008 5.1 e 5.2; GDD 19.2.7 c): uma vez, sem laço, com ducking de 10 dB. */
  tocarCreditos(): void {
    const cfg = this.entrada.config.creditos;
    if (!cfg) throw new Error('audio.json sem creditos (schema 2, ADR-008 8.1).');
    if (!this.liberacao.estaLiberado()) {
      this.descartados.semLiberacao++;
      return;
    }
    const agora = this.motor.agora();
    if (this.jingle && estadoDoJingle(this.jingle, agora) !== 'ocioso') {
      this.descartados.ocupado++;
      return;
    }
    const buffer = this.buffers.get(cfg.id);
    if (buffer === undefined) {
      this.descartados.semBuffer++;
      return;
    }
    if (this.motor.estado() !== 'ativo') {
      this.motor.retomar().catch((erro: unknown) => this.registrarErro('retomar (créditos)', erro));
    }
    this.iniciarJingle({ tipo: 'creditos', variante: 'JC', buffer, ganho: ganhoLinear(cfg.ganhoDb), inicioEm: agora, saidaS: SAIDA_CREDITOS_S, entradaS: ENTRADA_CREDITOS_S, duckDb: DUCKING_CREDITOS_DB });
    this.registrarUltimo('JC');
  }

  /** Sair dos créditos: corta o JC com rampa de 30 ms e a trilha volta ao nível normal (ADR-008 5.2). */
  pararCreditos(): void {
    const j = this.jingle;
    if (!j || j.tipo !== 'creditos') return;
    const agora = this.motor.agora();
    if (estadoDoJingle(j, agora) !== 'ocioso') this.cortar(j, agora);
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

  /** Estado para o gancho de QA (`__estado().audio`, ADR-008 2.6 e 9.5). */
  estado(): EstadoDoSom {
    const agora = this.motor.agora();
    const j = this.jingle;
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
      trilha: {
        ganhoDb: this.entrada.config.musica.ganhoDb,
        duckingDb: this.duckingEm(agora),
        tempoS: this.trilhaInicioEm === null ? 0 : agora - this.trilhaInicioEm,
      },
      jingle: {
        estado: j ? estadoDoJingle(j, agora) : 'ocioso',
        variante: j ? j.variante : null,
        inicioEmS: j ? j.inicioEm : null,
        fimEmS: j ? j.fimEm : null,
      },
      rampas: [...this.rampas],
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
    this.trilhaInicioEm = this.motor.agora();
    this.musicaVoz = this.motor.tocar(buffer, {
      ganho: ganhoLinear(this.entrada.config.musica.ganhoDb),
      loop: true,
      inicio,
      fim,
      barramento: this.motor.barramentoDaTrilha() ?? undefined,
    });
  }

  /** Começa um jingle: a voz, o estado e o ducking da trilha (rampa de entrada no início e volta no fim previsto). */
  private iniciarJingle(p: {
    tipo: 'conquista' | 'creditos';
    variante: string;
    buffer: unknown;
    ganho: number;
    inicioEm: number;
    saidaS: number;
    entradaS: number;
    duckDb: number;
  }): void {
    const voz = this.motor.tocar(p.buffer, { ganho: p.ganho, loop: false, inicioEm: p.inicioEm });
    this.jingle = { tipo: p.tipo, variante: p.variante, voz, inicioEm: p.inicioEm, fimEm: voz.fimEm, saidaS: p.saidaS, duckDb: p.duckDb, cortadoEm: null };
    this.rampar('duck', p.duckDb, p.entradaS, p.inicioEm);
    this.rampar('volta', 0, p.saidaS, voz.fimEm);
  }

  /** Corte com rampa de 30 ms (ou imediato, se o jingle ainda estava em espera), e a trilha volta em `saidaS`. */
  private cortar(j: JingleAtivo, agora: number): void {
    j.cortadoEm = agora;
    const esperando = agora < j.inicioEm;
    j.voz.pararEm(agora, esperando ? 0 : RAMPA_DE_CORTE_S);
    this.rampar('corte', 0, esperando ? 0 : RAMPA_DE_CORTE_S, agora);
    this.rampar('volta', 0, j.saidaS, agora);
  }

  /** Rampa da trilha até o ganho de `alvoDb` (0 dB é o normal). Cancela a automação futura do barramento. */
  private rampar(tipo: RampaDaTrilha['tipo'], alvoDb: number, duracaoS: number, emS: number): void {
    const trilha = this.motor.barramentoDaTrilha();
    if (trilha) this.motor.rampaGanho(trilha, ganhoLinear(alvoDb), duracaoS, emS);
    this.rampas.push({ tipo, ms: Math.round(duracaoS * 1000), emS });
    if (this.rampas.length > MAXIMO_DE_RAMPAS_GUARDADAS) this.rampas.shift();
  }

  /** Ducking atual da trilha, em dB: só entre o início e o fim (ou o corte) do jingle. */
  private duckingEm(agora: number): number {
    const j = this.jingle;
    if (!j) return 0;
    const fim = j.cortadoEm ?? j.fimEm;
    return agora >= j.inicioEm && agora < fim ? j.duckDb : 0;
  }

  /** O efeito de espera (S04, S05 ou S06) que ainda está tocando, com o instante em que termina. */
  private efeitoEmCursoDaEspera(agora: number): { fimEm: number } | null {
    let maior: { fimEm: number } | null = null;
    for (const e of this.efeitosRecentes) {
      if (!EFEITOS_QUE_A_CONQUISTA_ESPERA.includes(e.evento) || e.fimEm <= agora) continue;
      if (!maior || e.fimEm > maior.fimEm) maior = { fimEm: e.fimEm };
    }
    return maior;
  }

  private registrarUltimo(evento: string, variante?: string): void {
    this.ultimos.push({ evento, instante: this.relogio(), ...(variante ? { variante } : {}) });
    if (this.ultimos.length > MAXIMO_DE_EVENTOS_GUARDADOS) this.ultimos.shift();
  }
}

function mensagemDe(erro: unknown): string {
  if (erro instanceof Error) return erro.message || erro.name;
  if (typeof erro === 'object' && erro !== null && 'message' in erro) return String((erro as { message: unknown }).message);
  return String(erro) || 'erro desconhecido';
}

