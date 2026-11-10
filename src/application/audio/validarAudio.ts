/**
 * Validação do conteúdo de áudio (ADR-008 seção 8.2; GDD 19.2.4 e 19.9 AU8 a AU11). Função pura: recebe o
 * `content/audio.json` e o `assets/audio/audio-meta.json` já lidos, e devolve os erros em português, sem parar no primeiro.
 */
import { DURACAO_MAXIMA_S, EVENTOS_DE_AUDIO, MIXAGEM, ORCAMENTO_AUDIO, type EventoDeAudio } from './eventosDeAudio';

export interface ConfigDeAudio {
  mestre: number;
  musica: { id: string; ganhoDb: number; loop: boolean };
  eventos: Record<string, { id: string; ganhoDb: number }>;
}

export interface ArquivoDoMeta {
  arquivo: string;
  evento: string | null;
  rascunho?: boolean;
  bytes: number;
  duracaoS: number;
  picoDbfs: number;
  rmsDbfs: number;
  silencioInicialMs: number;
  silencioFinalMs: number;
  canais?: number;
  taxaHz?: number;
  bitRate?: number;
}

export interface MetaDeAudio {
  rascunho?: boolean;
  arquivos: ArquivoDoMeta[];
}

const db = (linear: number) => 20 * Math.log10(linear);
const linear = (dbfs: number) => Math.pow(10, dbfs / 20);
const ehNumero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Nível efetivo (GDD 19.2.4): o do arquivo, mais o ganho da config, mais o mestre. Em dBFS. */
export function nivelEfetivo(nivelDoArquivo: number, ganhoDb: number, mestre: number): number {
  return nivelDoArquivo + ganhoDb + db(mestre);
}

export function validarAudio(config: ConfigDeAudio, meta: MetaDeAudio, opcoes: { release?: boolean } = {}): string[] {
  const erros: string[] = [];
  const cfg = config as unknown as Record<string, unknown>;

  // A1: 13 eventos, S01 a S13, cada um com id; música em loop; nenhuma chave extra.
  for (const chave of Object.keys(cfg)) {
    if (!['mestre', 'musica', 'eventos'].includes(chave)) erros.push(`A1: chave "${chave}" não existe em audio.json.`);
  }
  const eventos = config.eventos ?? {};
  const ids = Object.keys(eventos);
  if (ids.length !== EVENTOS_DE_AUDIO.length || EVENTOS_DE_AUDIO.some((e) => !ids.includes(e))) {
    erros.push(`A1: audio.json precisa de exatamente os 13 eventos S01 a S13 (encontrou ${ids.length}).`);
  }
  if (!config.musica || config.musica.loop !== true) erros.push('A1: musica.loop precisa ser true.');

  // A3: ganhos em [−40, 0]; mestre em (0, 1].
  if (!ehNumero(config.mestre) || config.mestre <= 0 || config.mestre > 1) erros.push(`A3: mestre (${config.mestre}) precisa estar em (0, 1].`);
  const ganhos: [string, unknown][] = [['musica', config.musica?.ganhoDb], ...ids.map((e) => [e, eventos[e]?.ganhoDb] as [string, unknown])];
  for (const [nome, g] of ganhos) {
    if (!ehNumero(g) || g < MIXAGEM.ganhoMinimoDb || g > 0) erros.push(`A3: ganhoDb de ${nome} (${g}) precisa estar em [${MIXAGEM.ganhoMinimoDb}, 0].`);
  }

  // A2: cada id existe no meta, como MP3 mono, 22.050 Hz, 32 kbps; rascunho não vai ao release.
  const porArquivo = new Map(meta.arquivos.map((a) => [a.arquivo.replace(/\.mp3$/, ''), a]));
  if (opcoes.release && meta.rascunho) erros.push('A2: audio-meta.json marcado como rascunho no build de release.');
  const usados: [string, string][] = [['musica', config.musica?.id], ...ids.map((e) => [e, eventos[e]?.id] as [string, string])];
  for (const [nome, id] of usados) {
    const a = id ? porArquivo.get(id) : undefined;
    if (!a) {
      erros.push(`A2: ${nome} aponta para "${id}", que não existe em audio-meta.json.`);
      continue;
    }
    if (a.canais !== 1 || a.taxaHz !== 22050 || a.bitRate !== 32000) erros.push(`A2: ${id} precisa ser MP3 mono, 22.050 Hz, 32 kbps.`);
    if (opcoes.release && a.rascunho) erros.push(`A2: ${id} é rascunho no build de release.`);
  }

  // A4: duração e bytes. Música de 30 a 40 s e até 160 000 bytes; efeitos até a duração e 12 000 bytes; soma até 160 000.
  const musica = porArquivo.get(config.musica?.id ?? '');
  if (musica) {
    if (musica.duracaoS < ORCAMENTO_AUDIO.musicaDuracaoMinS || musica.duracaoS > ORCAMENTO_AUDIO.musicaDuracaoMaxS) {
      erros.push(`A4: música com ${musica.duracaoS} s: a faixa vai de 30 a 40 s.`);
    }
    if (musica.bytes > ORCAMENTO_AUDIO.musicaBytes) erros.push(`A4: música com ${musica.bytes} bytes: limite de ${ORCAMENTO_AUDIO.musicaBytes}.`);
  }
  let somaEfeitos = 0;
  for (const e of EVENTOS_DE_AUDIO) {
    const a = porArquivo.get(eventos[e]?.id ?? '');
    if (!a) continue;
    somaEfeitos += a.bytes;
    if (a.bytes > ORCAMENTO_AUDIO.efeitoBytes) erros.push(`A4: ${e} com ${a.bytes} bytes: limite de ${ORCAMENTO_AUDIO.efeitoBytes} por efeito.`);
    if (a.duracaoS > DURACAO_MAXIMA_S[e as EventoDeAudio]) erros.push(`A4: ${e} com ${a.duracaoS} s: máximo de ${DURACAO_MAXIMA_S[e as EventoDeAudio]} s.`);
  }
  if (somaEfeitos > ORCAMENTO_AUDIO.efeitosSomadosBytes) erros.push(`A4: efeitos somam ${somaEfeitos} bytes: limite de ${ORCAMENTO_AUDIO.efeitosSomadosBytes}.`);

  // A5: pico do arquivo em −3 dBFS ou menos.
  for (const a of meta.arquivos) {
    if (ehNumero(a.picoDbfs) && a.picoDbfs > MIXAGEM.picoMaximoDbfs) erros.push(`A5: ${a.arquivo} com pico de ${a.picoDbfs} dBFS: máximo ${MIXAGEM.picoMaximoDbfs}.`);
  }

  // A6: (a) música 7 a 13 dB abaixo da média dos efeitos (RMS efetivo); (b) ordem; (c) soma de picos ≤ 1,0.
  if (!ids.length || !musica) return erros;
  const mestre = config.mestre;
  const rmsEfetivo = new Map<string, number>();
  const picoEfetivo = new Map<string, number>();
  for (const e of EVENTOS_DE_AUDIO) {
    const a = porArquivo.get(eventos[e]?.id ?? '');
    const g = eventos[e]?.ganhoDb ?? 0;
    if (!a) continue;
    rmsEfetivo.set(e, nivelEfetivo(a.rmsDbfs, g, mestre));
    picoEfetivo.set(e, nivelEfetivo(a.picoDbfs, g, mestre));
  }
  const rmsMusica = nivelEfetivo(musica.rmsDbfs, config.musica.ganhoDb, mestre);
  const picoMusica = nivelEfetivo(musica.picoDbfs, config.musica.ganhoDb, mestre);
  if (rmsEfetivo.size === EVENTOS_DE_AUDIO.length) {
    const media = [...rmsEfetivo.values()].reduce((s, v) => s + v, 0) / rmsEfetivo.size;
    const diferenca = media - rmsMusica;
    if (diferenca < MIXAGEM.diferencaMusicaMinDb || diferenca > MIXAGEM.diferencaMusicaMaxDb) {
      erros.push(`A6(a): música ${diferenca.toFixed(1)} dB abaixo da média dos efeitos; a faixa é de 7 a 13 dB.`);
    }
    const ordem = [...rmsEfetivo.entries()].sort((x, y) => x[1] - y[1]).map(([e]) => e);
    const menores = new Set(ordem.slice(0, 2));
    const maiores = new Set(ordem.slice(-2));
    if (!(menores.has('S01') && menores.has('S10'))) erros.push('A6(b): os dois efeitos mais baixos precisam ser S01 (passos) e S10 (diálogo).');
    if (!(maiores.has('S07') && maiores.has('S09'))) erros.push('A6(b): os dois efeitos mais altos precisam ser S07 (Au!) e S09 (conquista).');
  }
  if (picoEfetivo.size === EVENTOS_DE_AUDIO.length) {
    const tresMaiores = [...picoEfetivo.values()].map((v) => linear(v)).sort((x, y) => y - x).slice(0, 3);
    const soma = tresMaiores.reduce((s, v) => s + v, 0) + linear(picoMusica);
    if (soma > MIXAGEM.somaDePicosMaxima) erros.push(`A6(c): soma dos três picos mais altos com a música é ${soma.toFixed(3)}: máximo 1,0.`);
  }

  // A7: silêncio nas pontas da música ≤ 20 ms (laço sem buraco).
  if (musica.silencioInicialMs > MIXAGEM.silencioNasPontasMaxMs || musica.silencioFinalMs > MIXAGEM.silencioNasPontasMaxMs) {
    erros.push(`A7: música com ${musica.silencioInicialMs} ms no início e ${musica.silencioFinalMs} ms no fim: máximo ${MIXAGEM.silencioNasPontasMaxMs} ms.`);
  }

  return erros;
}
