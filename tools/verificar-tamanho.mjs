// Limites e conteúdo do HTML de build (GDD 19.2.6 e 19.2.7; ADR-008 revisão 2, seções 5.1 e 8.4; itens 136 e 147).
// Sai com 1 se reprovar.
// Uso: node tools/verificar-tamanho.mjs [caminho.html]   (padrão: dist-release/index.html)
//      npm run verificar:tamanho -- dist-playtest/index.html
// KB = 1000 bytes e MB = 1 000 000 bytes (o limite mais estrito).
//
// Áudio: os ids vêm de content/audio.json, e só eles entram no orçamento e no embutimento. Aceita o schema 1
// (13 eventos, até a 0.11.0) e o schema 2 (conquistas e créditos, com S09 substituído pelos jingles). A ferramenta
// diz qual detectou. Prefixos (ADR-008 revisão 2): `mus_` trilha; `sfx_` efeitos; `jin_j0*` jingles de conquista;
// `jin_jc*` créditos.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { RAIZ, executadoDiretamente, kb } from './comum.mjs';

export const PASTA_AUDIO = join(RAIZ, 'assets', 'audio');

export const LIMITES = {
  html: 2_500_000,
  avisoHtmlSemAudio: 2_000_000,
  trilha: 160_000, // mus_, uma trilha
  efeito: 12_000, // sfx_, cada um
  efeitosTotal: 160_000, // sfx_, somados
  jingle: 16_000, // jin_j0*, cada um
  jinglesTotal: 64_000, // jin_j0*, somados
  creditos: 64_000, // jin_jc*
  audioTotal: 320_000,
};

const DATA_AUDIO = /data:audio\/mpeg;base64,[A-Za-z0-9+/=]*/g;

/** Classe do arquivo pelo prefixo (ADR-008 revisão 2). Nome sem prefixo reconhecido devolve null. */
export function classeDoArquivo(id) {
  if (id.startsWith('mus_')) return 'trilha';
  if (id.startsWith('sfx_')) return 'efeito';
  if (id.startsWith('jin_jc')) return 'creditos';
  if (id.startsWith('jin_j0')) return 'jingle';
  return null;
}

/** Lista os arquivos de áudio da pasta (mp3 e m4a). Lista vazia se a pasta não existe. */
export function lerAudios(pasta = PASTA_AUDIO) {
  if (!existsSync(pasta)) return [];
  return readdirSync(pasta)
    .filter((n) => /\.(mp3|m4a)$/i.test(n))
    .map((nome) => ({ nome, bytes: statSync(join(pasta, nome)).size }));
}

/**
 * Lê content/audio.json e devolve os ids que o HTML tem de embutir, sem repetição.
 * Schema 1: musica + 13 eventos. Schema 2: também `conquistas` (5 jingles) e `creditos` (JC).
 * Aceita `{ id, ganhoDb }` ou só a string com o id, em cada entrada.
 */
export function lerConfigDeAudio(raiz = RAIZ) {
  const config = JSON.parse(readFileSync(join(raiz, 'content', 'audio.json'), 'utf-8'));
  const schema2 = config.schemaVersion === 2 || 'conquistas' in config || 'creditos' in config;
  const idDe = (v) => (typeof v === 'string' ? v : v?.id);
  const ids = [config.musica.id];
  for (const e of Object.values(config.eventos ?? {})) ids.push(idDe(e));
  if (schema2) {
    for (const v of Object.values(config.conquistas ?? {})) ids.push(idDe(v));
    const cred = config.creditos;
    if (cred && typeof cred === 'object' && !('id' in cred)) for (const v of Object.values(cred)) ids.push(idDe(v));
    else if (cred) ids.push(idDe(cred));
  }
  const unicos = [...new Set(ids.filter(Boolean))];
  return {
    schema: schema2 ? 2 : 1,
    descricao: schema2 ? 'schema 2 (conquistas e créditos)' : 'schema 1 (13 eventos)',
    ids: unicos,
  };
}

/** Ids que o HTML tem de embutir (compatível com a versão anterior do módulo). */
export function lerIdsDeAudio(raiz = RAIZ) {
  return lerConfigDeAudio(raiz).ids;
}

/** Bytes de áudio já embutidos no HTML (as data URLs), para o aviso de "HTML sem o áudio". */
export function bytesDeAudioNoHtml(html) {
  return [...html.matchAll(DATA_AUDIO)].reduce((s, m) => s + Buffer.byteLength(m[0]), 0);
}

/**
 * Confere os limites de tamanho sobre os arquivos referenciados. Função pura.
 * `audios`: [{ nome, bytes, classe }], só os arquivos que content/audio.json referencia.
 */
export function verificarTamanhos({ htmlBytes, htmlSemAudioBytes = htmlBytes, audios = [] }) {
  const erros = [];
  const avisos = [];

  if (htmlBytes > LIMITES.html) {
    erros.push(`HTML com ${kb(htmlBytes)} (${htmlBytes} bytes): limite de 2.500 KB (2.500.000 bytes), GDD 19.2.6.`);
  }
  if (htmlSemAudioBytes > LIMITES.avisoHtmlSemAudio) {
    avisos.push(
      `HTML sem o áudio com ${kb(htmlSemAudioBytes)} (${htmlSemAudioBytes} bytes): acima de 2.000 KB (2.000.000 bytes). Avisar o Produto (GDD 19.2.6); o aviso não reprova.`,
    );
  }

  const soma = (classe) => audios.filter((a) => a.classe === classe).reduce((s, a) => s + a.bytes, 0);
  const trilha = soma('trilha');
  const efeitos = audios.filter((a) => a.classe === 'efeito');
  const jingles = audios.filter((a) => a.classe === 'jingle');
  const creditos = soma('creditos');
  const efeitosBytes = soma('efeito');
  const jinglesBytes = soma('jingle');
  const audioBytes = audios.reduce((s, a) => s + a.bytes, 0);

  if (trilha > LIMITES.trilha) {
    erros.push(`trilha com ${kb(trilha)} (${trilha} bytes): limite de 160 KB (160.000 bytes), GDD 19.2.6.`);
  }
  for (const e of efeitos) {
    if (e.bytes > LIMITES.efeito) {
      erros.push(`efeito ${e.nome} com ${kb(e.bytes)} (${e.bytes} bytes): limite de 12 KB (12.000 bytes) por efeito.`);
    }
  }
  if (efeitosBytes > LIMITES.efeitosTotal) {
    erros.push(`efeitos somam ${kb(efeitosBytes)} (${efeitosBytes} bytes): limite de 160 KB (160.000 bytes) no total.`);
  }
  for (const j of jingles) {
    if (j.bytes > LIMITES.jingle) {
      erros.push(`jingle de conquista ${j.nome} com ${kb(j.bytes)} (${j.bytes} bytes): limite de 16 KB (16.000 bytes) por jingle.`);
    }
  }
  if (jinglesBytes > LIMITES.jinglesTotal) {
    erros.push(`jingles de conquista somam ${kb(jinglesBytes)} (${jinglesBytes} bytes): limite de 64 KB (64.000 bytes) no total.`);
  }
  if (creditos > LIMITES.creditos) {
    erros.push(`créditos (jin_jc) com ${kb(creditos)} (${creditos} bytes): limite de 64 KB (64.000 bytes).`);
  }
  if (audioBytes > LIMITES.audioTotal) {
    erros.push(`áudio soma ${kb(audioBytes)} (${audioBytes} bytes): limite de 320 KB (320.000 bytes) no total.`);
  }

  return {
    erros,
    avisos,
    htmlBytes,
    htmlSemAudioBytes,
    audioBytes,
    porClasse: { trilha, efeitos: efeitosBytes, jingles: jinglesBytes, creditos },
  };
}

/**
 * Mede o áudio do build a partir de content/audio.json e de assets/audio/. Faltar um arquivo referenciado é erro;
 * arquivo na pasta que o JSON não referencia é aviso (não é embutido e não entra no orçamento).
 */
export function medirAudio({ raiz = RAIZ, htmlBytes = 0, htmlSemAudioBytes, pasta } = {}) {
  const diretorio = pasta ?? join(raiz, 'assets', 'audio');
  const config = lerConfigDeAudio(raiz);
  const presentes = lerAudios(diretorio);
  const porNome = new Map(presentes.map((a) => [a.nome, a]));
  const erros = [];
  const avisos = [];
  const referenciados = [];

  for (const id of config.ids) {
    const arquivo = porNome.get(`${id}.mp3`);
    const classe = classeDoArquivo(id);
    if (!classe) {
      erros.push(`id "${id}" com prefixo desconhecido: esperado mus_, sfx_, jin_j0* (jingles) ou jin_jc* (créditos).`);
    } else if (!arquivo) {
      erros.push(`arquivo ausente: ${id}.mp3 está em content/audio.json (${config.descricao}), mas não existe em assets/audio/.`);
    } else {
      referenciados.push({ nome: arquivo.nome, bytes: arquivo.bytes, classe });
    }
  }

  const idsReferenciados = new Set(config.ids);
  const orfaos = presentes.map((a) => a.nome).filter((n) => !idsReferenciados.has(n.replace(/\.(mp3|m4a)$/i, '')));
  if (orfaos.length > 0) {
    avisos.push(`fora de content/audio.json, não embutido e fora do orçamento: ${orfaos.join(', ')}.`);
  }

  const r = verificarTamanhos({ htmlBytes, htmlSemAudioBytes, audios: referenciados });
  return {
    ...r,
    erros: [...erros, ...r.erros],
    avisos: [...avisos, ...r.avisos],
    config,
    referenciados,
    orfaos,
  };
}

/** Confere o conteúdo do HTML final (ADR-008 8.4): áudio embutido, sem caminho de arquivo .mp3, sem rede e sem rascunho. */
export function verificarConteudoDoHtml({ html, ids }) {
  const erros = [];

  // Áudio embutido: uma data URL por arquivo referenciado (ADR-008 1.6 e 8.4).
  const embutidos = (html.match(/data:audio\/mpeg;base64,/g) || []).length;
  if (embutidos !== ids.length) {
    erros.push(`áudio embutido: ${embutidos} data URL(s) no HTML, esperado ${ids.length} (um por arquivo de content/audio.json).`);
  }

  // Nenhuma referência a arquivo .mp3 como caminho. Exceções: o campo "arquivo" do meta embutido, e nomes montados
  // em código (`${id}.mp3`), usados só para casar com o meta e nunca carregados pelo navegador.
  const caminhos = [...html.matchAll(/[`"'][^`"'\s]*\.mp3[`"']/g)].filter(
    (m) => html.slice(m.index - 8, m.index) !== 'arquivo:' && !m[0].includes('${'),
  );
  if (caminhos.length > 0) {
    erros.push(`${caminhos.length} referência(s) a arquivo .mp3 como caminho no HTML (o áudio tem de estar embutido, ADR-008 8.4).`);
  }

  // Meta de rascunho no build de release (A2, ADR-008 8.2).
  if (/rascunho:(!0|true)/.test(html)) {
    erros.push('o meta de áudio está marcado como rascunho (rascunho: true) no build; o release reprova (ADR-008 8.2, A2).');
  }

  // Ausência de rede: atributos src/href com http(s) (exceto o namespace do SVG) e url() externos.
  const enderecos = [...html.matchAll(/(?:src|href)\s*=\s*["'`]?(https?:\/\/[^"'`\s>]*)/gi)]
    .map((m) => m[1])
    .filter((u) => !u.startsWith('http://www.w3.org/'));
  const urlsCss = (html.match(/url\(\s*["']?https?:\/\//gi) || []).length;
  if (enderecos.length + urlsCss > 0) {
    erros.push(`${enderecos.length + urlsCss} endereço(s) http(s) em src, href ou url() no HTML: o jogo não pode depender de rede (ADR-008 8.4).`);
  }

  // Chamadas de rede proibidas. Fetch, XHR e importScripts têm as exceções documentadas abaixo.
  // - `fetch(x.href, y)`: polyfill de pré-carregamento que o Vite põe em todo build.
  // - `XMLHttpRequest`: carregador do Phaser, usado só para URLs que não são `data:` (1 ocorrência).
  // - `importScripts`: só a detecção (`typeof importScripts`).
  // O uso real de rede é coberto pelo smoke sem rede (ADR-008 8.5).
  const fetches = (html.match(/\bfetch\(/g) || []).length;
  const fetchesDoVite = (html.match(/fetch\(\w+\.href,\w+\)/g) || []).length;
  if (fetches > fetchesDoVite) {
    erros.push(`${fetches - fetchesDoVite} chamada(s) fetch( fora do polyfill do Vite: o jogo não pode buscar nada pela rede (ADR-008 8.4).`);
  }
  const xhr = (html.match(/XMLHttpRequest/g) || []).length;
  if (xhr > 1) {
    erros.push(`${xhr} uso(s) de XMLHttpRequest, esperado no máximo 1 (carregador do Phaser; ADR-008 8.4).`);
  }
  const scripts = (html.match(/importScripts/g) || []).length;
  const scriptsDetectados = (html.match(/typeof importScripts/g) || []).length;
  if (scripts > scriptsDetectados) {
    erros.push(`${scripts - scriptsDetectados} chamada(s) a importScripts: só a detecção é aceita (ADR-008 8.4).`);
  }
  for (const [nome, re] of [
    ['sendBeacon', /sendBeacon/g],
    ['WebSocket', /WebSocket/g],
    ['import() dinâmico', /\bimport\(/g],
  ]) {
    const n = (html.match(re) || []).length;
    if (n > 0) erros.push(`${n} uso(s) de ${nome} no HTML: proibido (ADR-008 8.4).`);
  }

  return { erros, embutidos };
}

function main(argv) {
  const arquivo = argv[0] ? resolve(argv[0]) : join(RAIZ, 'dist-release', 'index.html');
  if (!existsSync(arquivo)) {
    console.error(`${arquivo} não existe: rode o build antes.`);
    return 1;
  }
  const html = readFileSync(arquivo, 'utf-8');
  const htmlBytes = statSync(arquivo).size;
  const medida = medirAudio({ raiz: RAIZ, htmlBytes, htmlSemAudioBytes: htmlBytes - bytesDeAudioNoHtml(html) });
  const conteudo = verificarConteudoDoHtml({ html, ids: medida.config.ids });
  for (const a of medida.avisos) console.warn(`Aviso: ${a}`);
  const erros = [...medida.erros, ...conteudo.erros];
  if (erros.length > 0) {
    for (const e of erros) console.error(`Reprovado: ${e}`);
    return 1;
  }
  const p = medida.porClasse;
  console.log(`Schema detectado: ${medida.config.descricao}.`);
  console.log(
    `Áudio: ${conteudo.embutidos} arquivos embutidos (esperado ${medida.config.ids.length}); trilha ${kb(p.trilha)}, efeitos ${kb(p.efeitos)}, jingles ${kb(p.jingles)}, créditos ${kb(p.creditos)}; total ${kb(medida.audioBytes)} (limite 320 KB).`,
  );
  console.log(`Tamanho e conteúdo dentro do limite: HTML ${kb(htmlBytes)} (limite 2.500 KB).`);
  return 0;
}

if (executadoDiretamente(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
