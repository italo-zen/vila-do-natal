/**
 * Validação do conteúdo de áudio (ADR-008 seção 8.2 e revisão 2; GDD 19.2.4, 19.2.7 e 19.9 AU8 a AU11). Função pura:
 * recebe o `content/audio.json` e o `assets/audio/audio-meta.json` já lidos, e devolve os erros em português, sem parar
 * no primeiro. Schema 2: S09 é a família de jingles de conquista (`variante`), com `conquistas` e `creditos` (ADR-008 8.1).
 */
import {
  DURACAO_MAXIMA_S,
  EVENTOS_DE_AUDIO,
  EVENTO_EM_FAMILIA,
  JINGLE_DE_CONQUISTA,
  MIXAGEM,
  ORCAMENTO_AUDIO,
  type EventoDeAudio,
} from './eventosDeAudio';

export interface ConfigDeAudio {
  schemaVersion?: number;
  mestre: number;
  musica: { id: string; ganhoDb: number; loop: boolean };
  eventos: Record<string, { id?: string; ganhoDb?: number; variante?: string }>;
  conquistas?: Record<string, { id: string; ganhoDb: number }>;
  creditos?: { id: string; ganhoDb: number };
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

export interface OpcoesDeValidacao {
  release?: boolean;
  /** Chaves de conquista que as missões usam (content/missions). Se dado, A1 confere que são as mesmas de `conquistas`. */
  chavesDeConquista?: string[];
}

const CHAVES_PERMITIDAS = ['schemaVersion', 'mestre', 'musica', 'eventos', 'conquistas', 'creditos'];
const db = (linear: number) => 20 * Math.log10(linear);
const linear = (dbfs: number) => Math.pow(10, dbfs / 20);
const ehNumero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Nível efetivo (GDD 19.2.4): o do arquivo, mais o ganho da config, mais o mestre. Em dBFS. */
export function nivelEfetivo(nivelDoArquivo: number, ganhoDb: number, mestre: number): number {
  return nivelDoArquivo + ganhoDb + db(mestre);
}

export function validarAudio(config: ConfigDeAudio, meta: MetaDeAudio, opcoes: OpcoesDeValidacao = {}): string[] {
  const erros: string[] = [];
  const cfg = config as unknown as Record<string, unknown>;

  // A1: schema 2; chaves permitidas; 13 eventos (S09 só como variante); música em loop; conquistas e créditos.
  for (const chave of Object.keys(cfg)) {
    if (!CHAVES_PERMITIDAS.includes(chave)) erros.push(`A1: chave "${chave}" não existe em audio.json.`);
  }
  if (config.schemaVersion !== 2) erros.push(`A1: schemaVersion precisa ser 2 (encontrou ${config.schemaVersion}).`);
  const eventos = config.eventos ?? {};
  const ids = Object.keys(eventos);
  if (ids.length !== EVENTOS_DE_AUDIO.length || EVENTOS_DE_AUDIO.some((e) => !ids.includes(e))) {
    erros.push(`A1: audio.json precisa de exatamente os 13 eventos S01 a S13 (encontrou ${ids.length}).`);
  }
  for (const e of EVENTOS_DE_AUDIO) {
    const ev = eventos[e];
    if (!ev) continue;
    if (e === EVENTO_EM_FAMILIA) {
      if (ev.variante !== 'conquistas') erros.push('A1: S09 precisa de "variante": "conquistas".');
      if (ev.id !== undefined) erros.push('A1: S09 não pode ter "id" (a família é J01 a J05 em conquistas).');
    } else {
      if (!ev.id) erros.push(`A1: ${e} precisa de "id".`);
      if (ev.variante !== undefined) erros.push(`A1: ${e} não aceita "variante".`);
    }
  }
  if (!config.musica || config.musica.loop !== true) erros.push('A1: musica.loop precisa ser true.');
  const conquistas = config.conquistas ?? {};
  const chavesConquista = Object.keys(conquistas);
  const chavesEsperadas = Object.keys(JINGLE_DE_CONQUISTA);
  if (chavesConquista.length !== chavesEsperadas.length || chavesEsperadas.some((c) => !chavesConquista.includes(c))) {
    erros.push(`A1: conquistas precisa das cinco chaves ${chavesEsperadas.join(', ')} (encontrou ${chavesConquista.length}).`);
  }
  for (const chave of chavesConquista) {
    const prefixo = JINGLE_DE_CONQUISTA[chave]?.prefixo;
    if (prefixo && !conquistas[chave]?.id?.startsWith(prefixo)) erros.push(`A1: ${chave} precisa do jingle ${prefixo}_*.`);
  }
  if (opcoes.chavesDeConquista) {
    const missoes = [...opcoes.chavesDeConquista].sort().join(',');
    if (missoes !== [...chavesConquista].sort().join(',')) erros.push('A1: as chaves de conquista de audio.json não são as das missões (content/missions).');
  }
  if (!config.creditos?.id?.startsWith('jin_jc')) erros.push('A1: creditos precisa do jingle jin_jc_*.');

  // A3: ganhos em [−40, 0]; mestre em (0, 1].
  if (!ehNumero(config.mestre) || config.mestre <= 0 || config.mestre > 1) erros.push(`A3: mestre (${config.mestre}) precisa estar em (0, 1].`);
  const ganhos: [string, unknown][] = [['musica', config.musica?.ganhoDb]];
  for (const e of ids) if (e !== EVENTO_EM_FAMILIA) ganhos.push([e, eventos[e]?.ganhoDb]);
  for (const c of chavesConquista) ganhos.push([c, conquistas[c]?.ganhoDb]);
  if (config.creditos) ganhos.push(['creditos', config.creditos.ganhoDb]);
  for (const [nome, g] of ganhos) {
    if (!ehNumero(g) || g < MIXAGEM.ganhoMinimoDb || g > 0) erros.push(`A3: ganhoDb de ${nome} (${g}) precisa estar em [${MIXAGEM.ganhoMinimoDb}, 0].`);
  }

  // A2: cada id existe no meta, como MP3 mono, 22.050 Hz, 32 kbps; rascunho não vai ao release.
  const porArquivo = new Map(meta.arquivos.map((a) => [a.arquivo.replace(/\.mp3$/, ''), a]));
  if (opcoes.release && meta.rascunho) erros.push('A2: audio-meta.json marcado como rascunho no build de release.');
  const usados: [string, string | undefined][] = [['musica', config.musica?.id]];
  for (const e of ids) if (e !== EVENTO_EM_FAMILIA) usados.push([e, eventos[e]?.id]);
  for (const c of chavesConquista) usados.push([c, conquistas[c]?.id]);
  if (config.creditos) usados.push(['creditos', config.creditos.id]);
  for (const [nome, id] of usados) {
    const a = id ? porArquivo.get(id) : undefined;
    if (!a) {
      erros.push(`A2: ${nome} aponta para "${id}", que não existe em audio-meta.json.`);
      continue;
    }
    if (a.canais !== 1 || a.taxaHz !== 22050 || a.bitRate !== 32000) erros.push(`A2: ${id} precisa ser MP3 mono, 22.050 Hz, 32 kbps.`);
    if (opcoes.release && a.rascunho) erros.push(`A2: ${id} é rascunho no build de release.`);
  }

  // A4: música de 30 a 40 s e até 160 000 bytes; efeitos com duração e bytes; jingles e créditos (19.2.7 e).
  const musica = porArquivo.get(config.musica?.id ?? '');
  if (musica) {
    if (musica.duracaoS < ORCAMENTO_AUDIO.musicaDuracaoMinS || musica.duracaoS > ORCAMENTO_AUDIO.musicaDuracaoMaxS) {
      erros.push(`A4: música com ${musica.duracaoS} s: a faixa vai de 30 a 40 s.`);
    }
    if (musica.bytes > ORCAMENTO_AUDIO.musicaBytes) erros.push(`A4: música com ${musica.bytes} bytes: limite de ${ORCAMENTO_AUDIO.musicaBytes}.`);
  }
  let somaEfeitos = 0;
  for (const e of EVENTOS_DE_AUDIO) {
    if (e === EVENTO_EM_FAMILIA) continue;
    const a = porArquivo.get(eventos[e]?.id ?? '');
    if (!a) continue;
    somaEfeitos += a.bytes;
    if (a.bytes > ORCAMENTO_AUDIO.efeitoBytes) erros.push(`A4: ${e} com ${a.bytes} bytes: limite de ${ORCAMENTO_AUDIO.efeitoBytes} por efeito.`);
    if (a.duracaoS > DURACAO_MAXIMA_S[e]) erros.push(`A4: ${e} com ${a.duracaoS} s: máximo de ${DURACAO_MAXIMA_S[e]} s.`);
  }
  if (somaEfeitos > ORCAMENTO_AUDIO.efeitosSomadosBytes) erros.push(`A4: efeitos somam ${somaEfeitos} bytes: limite de ${ORCAMENTO_AUDIO.efeitosSomadosBytes}.`);
  let somaJingles = 0;
  for (const c of chavesConquista) {
    const a = porArquivo.get(conquistas[c]?.id ?? '');
    if (!a) continue;
    somaJingles += a.bytes;
    if (a.bytes > ORCAMENTO_AUDIO.jingleBytes) erros.push(`A4: jingle ${a.arquivo} com ${a.bytes} bytes: limite de ${ORCAMENTO_AUDIO.jingleBytes} por jingle.`);
  }
  if (somaJingles > ORCAMENTO_AUDIO.jinglesSomadosBytes) erros.push(`A4: jingles de conquista somam ${somaJingles} bytes: limite de ${ORCAMENTO_AUDIO.jinglesSomadosBytes}.`);
  const creditos = porArquivo.get(config.creditos?.id ?? '');
  if (creditos) {
    if (creditos.bytes > ORCAMENTO_AUDIO.creditosBytes) erros.push(`A4: jingle de créditos com ${creditos.bytes} bytes: limite de ${ORCAMENTO_AUDIO.creditosBytes}.`);
    if (creditos.duracaoS < ORCAMENTO_AUDIO.creditosDuracaoMinS || creditos.duracaoS > ORCAMENTO_AUDIO.creditosDuracaoMaxS) {
      erros.push(`A4: jingle de créditos com ${creditos.duracaoS} s: a faixa vai de 12 a 16 s.`);
    }
  }
  const total = (musica?.bytes ?? 0) + somaEfeitos + somaJingles + (creditos?.bytes ?? 0);
  if (total > ORCAMENTO_AUDIO.totalBytes) erros.push(`A4: áudio total com ${total} bytes: limite de ${ORCAMENTO_AUDIO.totalBytes}.`);

  // A5: pico do arquivo em −3 dBFS ou menos.
  for (const a of meta.arquivos) {
    if (ehNumero(a.picoDbfs) && a.picoDbfs > MIXAGEM.picoMaximoDbfs) erros.push(`A5: ${a.arquivo} com pico de ${a.picoDbfs} dBFS: máximo ${MIXAGEM.picoMaximoDbfs}.`);
  }

  // A6: (a) música 7 a 13 dB abaixo da média dos 13 eventos (S09 = média das variantes); (b) ordem; (c) soma de picos
  // com os jingles como efeitos e a trilha sem ducking; (c2) JC mais a trilha.
  if (!musica) return erros;
  const mestre = config.mestre;
  const rmsEfetivo = new Map<string, number>();
  const rmsDasVariantes: number[] = [];
  const picosEfeitos: number[] = [];
  for (const e of EVENTOS_DE_AUDIO) {
    if (e === EVENTO_EM_FAMILIA) continue;
    const a = porArquivo.get(eventos[e]?.id ?? '');
    if (!a) continue;
    const g = eventos[e]?.ganhoDb ?? 0;
    rmsEfetivo.set(e, nivelEfetivo(a.rmsDbfs, g, mestre));
    picosEfeitos.push(linear(nivelEfetivo(a.picoDbfs, g, mestre)));
  }
  for (const c of chavesConquista) {
    const a = porArquivo.get(conquistas[c]?.id ?? '');
    if (!a) continue;
    const g = conquistas[c]?.ganhoDb ?? 0;
    rmsDasVariantes.push(nivelEfetivo(a.rmsDbfs, g, mestre));
    picosEfeitos.push(linear(nivelEfetivo(a.picoDbfs, g, mestre)));
  }
  if (rmsDasVariantes.length === chavesEsperadas.length) {
    rmsEfetivo.set(EVENTO_EM_FAMILIA, rmsDasVariantes.reduce((s, v) => s + v, 0) / rmsDasVariantes.length);
  }
  const rmsMusica = nivelEfetivo(musica.rmsDbfs, config.musica.ganhoDb, mestre);
  const picoMusica = linear(nivelEfetivo(musica.picoDbfs, config.musica.ganhoDb, mestre));
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
  if (picosEfeitos.length === EVENTOS_DE_AUDIO.length - 1 + chavesEsperadas.length) {
    const tresMaiores = [...picosEfeitos].sort((x, y) => y - x).slice(0, 3);
    const soma = tresMaiores.reduce((s, v) => s + v, 0) + picoMusica;
    if (soma > MIXAGEM.somaDePicosMaxima) erros.push(`A6(c): soma dos três picos mais altos com a música é ${soma.toFixed(3)}: máximo 1,0.`);
  }
  if (creditos) {
    const picoJc = linear(nivelEfetivo(creditos.picoDbfs, config.creditos?.ganhoDb ?? 0, mestre));
    const soma = picoJc + picoMusica;
    if (soma > MIXAGEM.somaDePicosMaxima) erros.push(`A6(c2): pico do jingle de créditos mais a trilha é ${soma.toFixed(3)}: máximo 1,0.`);
  }

  // A7: silêncio nas pontas da música ≤ 20 ms (laço sem buraco).
  if (musica.silencioInicialMs > MIXAGEM.silencioNasPontasMaxMs || musica.silencioFinalMs > MIXAGEM.silencioNasPontasMaxMs) {
    erros.push(`A7: música com ${musica.silencioInicialMs} ms no início e ${musica.silencioFinalMs} ms no fim: máximo ${MIXAGEM.silencioNasPontasMaxMs} ms.`);
  }

  return erros;
}

export type { EventoDeAudio };
