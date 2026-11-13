import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

/**
 * Plugin do áudio (ADR-008 1.6 e revisão 2; ADR-009 8). Lê `content/audio.json` e `assets/audio/audio-meta.json` e expõe,
 * no módulo virtual `virtual:audio`, a configuração e o modo de build. Modo `embutido` (playtest): os MP3 que o JSON aponta
 * entram em base64. Modo `externo` (release): nenhum byte entra no HTML; os arquivos vão para `audio/` com nome por hash
 * (`vite.recursos.ts`). A trilha, os efeitos com `id`, os jingles de conquista e o de créditos entram nos dois modos.
 */
const RAIZ = dirname(fileURLToPath(import.meta.url));
const VIRTUAL = 'virtual:audio';
const RESOLVIDO = `\0${VIRTUAL}`;

export type ModoDeAudio = 'embutido' | 'externo';

/** Forma mínima do `content/audio.json` que o plugin lê (schema 1 e 2). */
export interface ConfigDeAudioParaEmbutir {
  musica: { id: string };
  eventos: Record<string, { id?: string; variante?: string }>;
  conquistas?: Record<string, { id: string }>;
  creditos?: { id: string };
}

/**
 * Ids de arquivo do áudio: trilha, cada evento que tem `id` (eventos com `variante` não têm arquivo próprio), cada jingle de
 * conquista e o de créditos. Sem repetição. Função pura.
 */
export function idsDeAudioParaEmbutir(config: ConfigDeAudioParaEmbutir): string[] {
  const ids = [config.musica.id];
  for (const evento of Object.values(config.eventos)) if (evento.id) ids.push(evento.id);
  for (const conquista of Object.values(config.conquistas ?? {})) ids.push(conquista.id);
  if (config.creditos) ids.push(config.creditos.id);
  return [...new Set(ids)];
}

export function audioEmbutido(modo: ModoDeAudio = 'embutido'): Plugin {
  return {
    name: 'audio-embutido',
    resolveId(id) {
      return id === VIRTUAL ? RESOLVIDO : undefined;
    },
    load(id) {
      if (id !== RESOLVIDO) return undefined;
      const configPath = join(RAIZ, 'content', 'audio.json');
      const metaPath = join(RAIZ, 'assets', 'audio', 'audio-meta.json');
      if (!existsSync(configPath) || !existsSync(metaPath)) this.error('content/audio.json ou assets/audio/audio-meta.json ausente (ADR-008).');
      const config = JSON.parse(readFileSync(configPath, 'utf-8')) as ConfigDeAudioParaEmbutir;
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8')) as Record<string, unknown>;
      this.addWatchFile(configPath);
      this.addWatchFile(metaPath);
      const bytes: Record<string, string> = {};
      if (modo === 'embutido') {
        for (const id of idsDeAudioParaEmbutir(config)) {
          const arquivo = join(RAIZ, 'assets', 'audio', `${id}.mp3`);
          if (!existsSync(arquivo)) this.error(`Arquivo de áudio "${id}.mp3" não existe em assets/audio/.`);
          // Forma do ADR-008 1.6: data URL de áudio (o verificar:tamanho conta essas URLs).
          bytes[id] = `data:audio/mpeg;base64,${readFileSync(arquivo).toString('base64')}`;
        }
      }
      return [
        `export const modo = ${JSON.stringify(modo)};`,
        `export const config = ${JSON.stringify(config)};`,
        `export const meta = ${JSON.stringify(meta)};`,
        `export const base64 = ${JSON.stringify(bytes)};`,
      ].join('\n');
    },
  };
}
