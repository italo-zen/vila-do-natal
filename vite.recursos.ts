import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { idsDeAudioParaEmbutir, type ConfigDeAudioParaEmbutir } from './vite.audio.ts';

/**
 * Recursos de tela e de áudio por modo de build (ADR-009 1, 2 e 8). Módulo virtual `virtual:recursos`:
 * - `embutido` (playtest, HTML único): as imagens de tela viram data URL no módulo; o áudio vai no `virtual:audio`.
 * - `externo` (release, Pages): nenhum byte no HTML. O módulo lista os arquivos com nome por hash (`audio/` e `imagens/`)
 *   na ordem de carga (ADR-009 4.1), e o `writeBundle` copia cada um para a pasta de saída e grava `recursos.json`.
 */
const RAIZ = dirname(fileURLToPath(import.meta.url));
const VIRTUAL = 'virtual:recursos';
const RESOLVIDO = `\0${VIRTUAL}`;

/** Imagens de tela (chave do jogo → arquivo do perfil hd-480x352). Nativas 480×352 (GDD 20.3). */
export const IMAGENS_DE_TELA: Record<string, string> = {
  titulo: 'tela_titulo.png',
  fim: 'tela_fim.png',
};

/** Nome com hash (ADR-009 2): `<base>.<8 primeiros caracteres do SHA-256><ext>`. Imutável. Função pura. */
export function nomeComHash(base: string, ext: string, bytes: Uint8Array): string {
  const h = createHash('sha256').update(bytes).digest('hex').slice(0, 8);
  return `${base}.${h}${ext}`;
}

export interface ItemDeCarga {
  tipo: 'imagem' | 'audio';
  id: string;
  /** Caminho relativo à raiz da release (ex.: `audio/mus_natal.1a2b3c4d.mp3`). */
  arquivo: string;
  bytes: number;
  sha256: string;
  /** Origem no repositório (para copiar). Não vai ao módulo virtual. */
  origem: string;
}

/**
 * Ordem de carga da release (ADR-009 4.1): (1) imagem do título; (2) trilha; (3) efeitos; (4) jingles de conquista e JC;
 * (5) imagem de fim. Função pura sobre os arquivos já lidos.
 */
export function ordemDeCarga(config: ConfigDeAudioParaEmbutir, arquivos: Record<string, { bytes: Uint8Array; origem: string }>, nomes: Record<string, string>): ItemDeCarga[] {
  const itens: ItemDeCarga[] = [];
  const audio = (id: string) => {
    const a = arquivos[`audio:${id}`];
    if (!a) throw new Error(`Áudio "${id}" sem arquivo na release.`);
    return { tipo: 'audio' as const, id, arquivo: nomes[`audio:${id}`], bytes: a.bytes.length, sha256: createHash('sha256').update(a.bytes).digest('hex'), origem: a.origem };
  };
  const imagem = (id: string) => {
    const a = arquivos[`imagem:${id}`];
    return { tipo: 'imagem' as const, id, arquivo: nomes[`imagem:${id}`], bytes: a.bytes.length, sha256: createHash('sha256').update(a.bytes).digest('hex'), origem: a.origem };
  };
  itens.push(imagem('titulo'));
  itens.push(audio(config.musica.id));
  for (const e of Object.values(config.eventos)) if (e.id) itens.push(audio(e.id));
  for (const c of Object.values(config.conquistas ?? {})) itens.push(audio(c.id));
  if (config.creditos) itens.push(audio(config.creditos.id));
  itens.push(imagem('fim'));
  return itens;
}

export function recursosEmbutidos(): Plugin {
  return {
    name: 'recursos-embutidos',
    resolveId(id) {
      return id === VIRTUAL ? RESOLVIDO : undefined;
    },
    load(id) {
      if (id !== RESOLVIDO) return undefined;
      const imagens: Record<string, string> = {};
      for (const [chave, arquivo] of Object.entries(IMAGENS_DE_TELA)) {
        const caminho = join(RAIZ, 'assets', 'hd-480x352', arquivo);
        if (!existsSync(caminho)) this.error(`Imagem de tela "${arquivo}" não existe em assets/hd-480x352/.`);
        this.addWatchFile(caminho);
        imagens[chave] = `data:image/png;base64,${readFileSync(caminho).toString('base64')}`;
      }
      return [`export const modo = 'embutido';`, `export const imagens = ${JSON.stringify(imagens)};`, `export const ordem = [];`].join('\n');
    },
  };
}

/** Plugin da release (ADR-009 8): arquivos com nome por hash fora do HTML, e `recursos.json` para o Generalista (159). */
export function recursosExternos(): Plugin {
  let dirSaida = '';
  let itens: ItemDeCarga[] = [];
  const carregar = (): ItemDeCarga[] => {
    const config = JSON.parse(readFileSync(join(RAIZ, 'content', 'audio.json'), 'utf-8')) as ConfigDeAudioParaEmbutir;
    const arquivos: Record<string, { bytes: Uint8Array; origem: string }> = {};
    const nomes: Record<string, string> = {};
    for (const id of idsDeAudioParaEmbutir(config)) {
      const origem = join(RAIZ, 'assets', 'audio', `${id}.mp3`);
      if (!existsSync(origem)) throw new Error(`Arquivo de áudio "${id}.mp3" não existe em assets/audio/.`);
      const bytes = readFileSync(origem);
      arquivos[`audio:${id}`] = { bytes, origem };
      nomes[`audio:${id}`] = `audio/${nomeComHash(id, '.mp3', bytes).slice(0)}`;
    }
    for (const [chave, arquivo] of Object.entries(IMAGENS_DE_TELA)) {
      const origem = join(RAIZ, 'assets', 'hd-480x352', arquivo);
      if (!existsSync(origem)) throw new Error(`Imagem de tela "${arquivo}" não existe em assets/hd-480x352/.`);
      const bytes = readFileSync(origem);
      arquivos[`imagem:${chave}`] = { bytes, origem };
      nomes[`imagem:${chave}`] = `imagens/${nomeComHash(chave, '.png', bytes)}`;
    }
    return ordemDeCarga(config, arquivos, nomes);
  };
  return {
    name: 'recursos-externos',
    resolveId(id) {
      return id === VIRTUAL ? RESOLVIDO : undefined;
    },
    load(id) {
      if (id !== RESOLVIDO) return undefined;
      itens = carregar();
      const audio: Record<string, string> = {};
      const imagens: Record<string, string> = {};
      for (const it of itens) {
        if (it.tipo === 'audio') audio[it.id] = it.arquivo;
        else imagens[it.id] = it.arquivo;
      }
      const ordem = itens.map(({ tipo, id, arquivo }) => ({ tipo, id, arquivo }));
      return [`export const modo = 'externo';`, `export const imagens = ${JSON.stringify(imagens)};`, `export const audio = ${JSON.stringify(audio)};`, `export const ordem = ${JSON.stringify(ordem)};`].join('\n');
    },
    configResolved(config) {
      dirSaida = config.build.outDir;
    },
    writeBundle(opcoes) {
      const destino = opcoes.dir ?? dirSaida;
      if (itens.length === 0) itens = carregar();
      for (const it of itens) {
        const alvo = join(destino, it.arquivo);
        mkdirSync(dirname(alvo), { recursive: true });
        copyFileSync(it.origem, alvo);
      }
      const manifesto = {
        versao: JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf-8')).version,
        modo: 'externo',
        ordemDeCarga: itens.map(({ tipo, id, arquivo, bytes, sha256 }) => ({ tipo, id, arquivo, bytes, sha256 })),
        totalBytes: itens.reduce((s, it) => s + it.bytes, 0),
      };
      writeFileSync(join(destino, 'recursos.json'), JSON.stringify(manifesto, null, 2) + '\n');
    },
  };
}
