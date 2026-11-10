import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

/**
 * Plugin do áudio (ADR-008 1.6). Lê `content/audio.json` e `assets/audio/audio-meta.json` e embute, no módulo virtual
 * `virtual:audio`, só os MP3 que o JSON aponta (música e os 13 efeitos), em base64. Nada mais entra no HTML.
 */
const RAIZ = dirname(fileURLToPath(import.meta.url));
const VIRTUAL = 'virtual:audio';
const RESOLVIDO = `\0${VIRTUAL}`;

export function audioEmbutido(): Plugin {
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
      const config = JSON.parse(readFileSync(configPath, 'utf-8')) as { musica: { id: string }; eventos: Record<string, { id: string }> };
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8')) as Record<string, unknown>;
      this.addWatchFile(configPath);
      this.addWatchFile(metaPath);
      const ids = [config.musica.id, ...Object.values(config.eventos).map((e) => e.id)];
      const bytes: Record<string, string> = {};
      for (const id of ids) {
        const arquivo = join(RAIZ, 'assets', 'audio', `${id}.mp3`);
        if (!existsSync(arquivo)) this.error(`Arquivo de áudio "${id}.mp3" não existe em assets/audio/.`);
        // Forma do ADR-008 1.6: data URL de áudio (o verificar:tamanho conta essas URLs).
        bytes[id] = `data:audio/mpeg;base64,${readFileSync(arquivo).toString('base64')}`;
      }
      return [
        `export const config = ${JSON.stringify(config)};`,
        `export const meta = ${JSON.stringify(meta)};`,
        `export const base64 = ${JSON.stringify(bytes)};`,
      ].join('\n');
    },
  };
}
