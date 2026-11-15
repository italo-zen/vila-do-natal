// Verificação da release (GDD 19.7.2, itens 3, 4, 8 e 9; ADR-002 seção 1). Não publica nada.
//   npm run verificar:release -- --tag v1.0.0   (no workflow, com a tag; confere tag = package.json)
//   npm run verificar:release                    (sem tag: confere package.json, CHANGELOG e build)
// Pré-requisito: npm run build:release (gera dist-release/index.html). Sai com 1 se alguma checagem falhar.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, executadoDiretamente } from './comum.mjs';
import { secaoDaVersao } from './changelog.mjs';
import { acharGancho } from './verificar-sem-gancho.mjs';
import { bytesDeAudioNoHtml, medirAudio, modoDaPasta, verificarConteudoDoHtml, verificarReleaseExterna } from './verificar-tamanho.mjs';

/**
 * Nomes de pessoas da família que não podem aparecer no jogo (GDD 10, item 034; docs/mapa-casa-real.md, 1.2).
 * Lista a completar pelo Diretor (ver docs/checklist-release.md). Mensagens de erro não repetem os nomes.
 */
export const NOMES_DA_FAMILIA = ['Olivia'];

const SEMVER = /^\d+\.\d+\.\d+$/;

/**
 * ADR-002 seção 3: o jogo não grava nada no navegador. O Phaser só DETECTA localStorage (localStorage.getItem
 * em Device), então no build a regra é "nenhuma escrita"; no código-fonte, nenhuma menção.
 */
const ESCRITA_EM_LOCALSTORAGE = /localStorage\s*(\.\s*(setItem|removeItem|clear)\b|\[)/;

function arquivosDe(pasta, extensoes) {
  if (!existsSync(pasta)) return [];
  return readdirSync(pasta, { withFileTypes: true }).flatMap((e) => {
    const caminho = join(pasta, e.name);
    if (e.isDirectory()) return arquivosDe(caminho, extensoes);
    return extensoes.some((x) => e.name.endsWith(x)) ? [caminho] : [];
  });
}

/** Versão entre aspas (simples, dupla ou crase), como o minificador grava o valor injetado (ADR-002 seção 1). */
function temVersaoNoBuild(texto, versao) {
  const escapada = versao.replace(/\./g, '\\.');
  return new RegExp(`["'\`]${escapada}["'\`]`).test(texto);
}

/**
 * Roda as checagens sobre a raiz indicada. Devolve { erros, avisos, ok }.
 * `tag` é null quando a execução não é de uma tag (ensaio manual).
 */
export function verificarRelease({ raiz = RAIZ, tag = null } = {}) {
  const erros = [];
  const avisos = [];
  const ok = [];

  // 1. Versão do package.json e tag (GDD 19.7.1).
  const pkg = JSON.parse(readFileSync(join(raiz, 'package.json'), 'utf-8'));
  const versao = pkg.version;
  if (!SEMVER.test(versao)) {
    erros.push(`package.json com versão "${versao}": use X.Y.Z, sem sufixo de pré-lançamento.`);
  } else {
    ok.push(`package.json com versão ${versao}`);
  }
  if (tag !== null) {
    const m = /^v(\d+\.\d+\.\d+)$/.exec(tag);
    if (!m) {
      erros.push(`tag "${tag}" fora do padrão vX.Y.Z.`);
    } else if (m[1] !== versao) {
      erros.push(`a tag ${tag} não bate com package.json (${versao}). Ajuste a versão ou a tag antes de publicar.`);
    } else {
      ok.push(`tag ${tag} igual ao package.json`);
    }
  } else {
    avisos.push('sem tag: a versão do package.json foi conferida, mas nenhuma tag.');
  }

  // 2. CHANGELOG com a seção da versão (GDD 19.7.2, item 4).
  const arquivoChangelog = join(raiz, 'CHANGELOG.md');
  if (!existsSync(arquivoChangelog)) {
    erros.push('CHANGELOG.md não existe na raiz.');
  } else if (secaoDaVersao(readFileSync(arquivoChangelog, 'utf-8'), versao) === null) {
    erros.push(`CHANGELOG.md sem seção "## [${versao}] - AAAA-MM-DD" (com data).`);
  } else {
    ok.push(`CHANGELOG.md com a seção ${versao}`);
  }

  // 3. Código-fonte: nenhuma menção a localStorage (ADR-002 seção 3).
  const fontes = arquivosDe(join(raiz, 'src'), ['.ts', '.tsx', '.js', '.mjs']);
  const comLocalStorage = fontes.filter((f) => readFileSync(f, 'utf-8').includes('localStorage'));
  if (comLocalStorage.length > 0) {
    erros.push(`código-fonte menciona localStorage (proibido: ADR-002 seção 3): ${comLocalStorage.map((f) => f.slice(raiz.length + 1)).join(', ')}.`);
  } else {
    ok.push('código-fonte sem localStorage');
  }

  // 4. Build de release: gancho, escrita em localStorage, nomes, versão visível, tamanho (GDD 19.7.2, itens 3 e 8).
  const html = join(raiz, 'dist-release', 'index.html');
  if (!existsSync(html)) {
    erros.push('dist-release/index.html não existe: rode npm run build:release.');
  } else {
    const texto = readFileSync(html, 'utf-8');

    const gancho = acharGancho(texto);
    if (gancho.length > 0) erros.push(`build de release com gancho de QA: ${gancho.join(', ')}.`);
    else ok.push('build sem gancho de QA');

    if (ESCRITA_EM_LOCALSTORAGE.test(texto)) erros.push('build de release grava em localStorage (proibido: ADR-002 seção 3).');
    else ok.push('build sem escrita em localStorage');

    const nomesEncontrados = NOMES_DA_FAMILIA.filter((n) => texto.toLowerCase().includes(n.toLowerCase()));
    if (nomesEncontrados.length > 0) {
      erros.push(`build cita nome de pessoa da família (GDD 10, item 034): ${nomesEncontrados.length} nome(s) da lista em tools/verificar-release.mjs.`);
    } else {
      ok.push('build sem nome de pessoa da família');
    }

    // Título e créditos leem a versão do package.json (ADR-002 seção 1): ela tem de estar no bundle.
    if (temVersaoNoBuild(texto, versao)) ok.push(`versão ${versao} injetada no build`);
    else erros.push(`a versão ${versao} não aparece no build (título e créditos leem o package.json).`);

    if (modoDaPasta(join(raiz, 'dist-release')) === 'externo') {
      // Release externa (ADR-009 seção 5): lista, hashes, órfãos, áudio e imagens fora do HTML, gzip, rede e rascunho.
      const ext = verificarReleaseExterna({ pasta: join(raiz, 'dist-release'), raiz });
      erros.push(...ext.erros);
      avisos.push(...ext.avisos);
      if (ext.erros.length === 0) {
        ok.push(`release externa (ADR-009): HTML gzip ${ext.resumo.htmlGzip} B, ${ext.resumo.audioArquivos} áudios e ${ext.resumo.imagens.length} imagens conferidos com a lista`);
      }
    } else {
      // Playtest (HTML único, tudo embutido): áudio referenciado por content/audio.json, tamanho e conteúdo.
      const htmlBytes = statSync(html).size;
      const medida = medirAudio({ raiz, htmlBytes, htmlSemAudioBytes: htmlBytes - bytesDeAudioNoHtml(texto) });
      erros.push(...medida.erros);
      avisos.push(...medida.avisos);
      if (medida.erros.length === 0) ok.push(`tamanho dentro do GDD 19.2.6 (${medida.config.descricao})`);

      const c = verificarConteudoDoHtml({ html: texto, ids: medida.config.ids });
      erros.push(...c.erros);
      if (c.erros.length === 0) ok.push(`áudio embutido (${c.embutidos} arquivos), sem caminho .mp3 e sem rede no HTML`);
    }
  }

  // 6. Meta de áudio sem rascunho (ADR-008 8.2, A2; item 136, critério 10).
  const meta = join(raiz, 'assets', 'audio', 'audio-meta.json');
  if (existsSync(meta)) {
    const m = JSON.parse(readFileSync(meta, 'utf-8'));
    const rascunhos = [m.rascunho === true ? 'meta geral' : null, ...(m.arquivos ?? []).filter((a) => a.rascunho === true).map((a) => a.arquivo)].filter(Boolean);
    if (rascunhos.length > 0) erros.push(`áudio em rascunho no build de release (A2): ${rascunhos.join(', ')}. Gere a versão final sem --rascunho.`);
    else ok.push('áudio sem rascunho (meta)');
  }

  // 5. Licenças do áudio, quando há áudio (GDD 19.2.5, item 9).
  if (existsSync(join(raiz, 'assets', 'audio')) && !existsSync(join(raiz, 'docs', 'audio-licencas.md'))) {
    erros.push('há áudio em assets/audio, mas falta docs/audio-licencas.md (GDD 19.2.5).');
  }

  return { erros, avisos, ok, versao };
}

function lerTag(argv) {
  const i = argv.indexOf('--tag');
  if (i >= 0) return argv[i + 1] ?? null;
  const junto = argv.find((a) => a.startsWith('--tag='));
  return junto ? junto.slice('--tag='.length) : null;
}

function main(argv) {
  const tag = lerTag(argv);
  if (tag === null && argv.includes('--tag')) {
    console.error('Uso: npm run verificar:release -- --tag vX.Y.Z');
    return 2;
  }
  const r = verificarRelease({ tag });
  for (const linha of r.ok) console.log(`OK: ${linha}`);
  for (const linha of r.avisos) console.warn(`Aviso: ${linha}`);
  if (r.erros.length > 0) {
    for (const linha of r.erros) console.error(`Release reprovada: ${linha}`);
    return 1;
  }
  console.log(`Release ${r.versao} verificada.`);
  return 0;
}

if (executadoDiretamente(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
