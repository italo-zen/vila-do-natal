/**
 * Ponte entre o áudio embutido (módulo virtual `virtual:audio`, ADR-008 1.6) e o `Som`. Valida o conteúdo com
 * `validarAudio` antes de tocar qualquer coisa e converte o base64 em bytes. Só a apresentação lê o módulo virtual.
 */
import { validarAudio, type ConfigDeAudio, type MetaDeAudio } from '../../application/audio/validarAudio';
import type { InfoDoLaco } from './laco';
import type { EntradaDeAudio } from './Som';
import { config, meta, base64 } from 'virtual:audio';

export function base64ParaBytes(dataUrl: string): ArrayBuffer {
  const texto = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const bin = atob(texto);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

/** Monta a entrada do `Som` a partir do conteúdo embutido. Lança erro se o conteúdo violar ADR-008 8.2. */
export function entradaDeAudio(): EntradaDeAudio {
  const cfg = config as ConfigDeAudio;
  const m = meta as MetaDeAudio & { arquivos: (MetaDeAudio['arquivos'][number] & InfoDoLaco)[] };
  const erros = validarAudio(cfg, m, { release: false });
  if (erros.length > 0) throw new Error(`Áudio inválido:\n- ${erros.join('\n- ')}`);
  const musica = m.arquivos.find((a) => a.arquivo === `${cfg.musica.id}.mp3`);
  if (!musica) throw new Error('audio-meta.json sem a música.');
  const laco: InfoDoLaco = {
    atrasoInicial: (musica as unknown as InfoDoLaco).atrasoInicial,
    preenchimentoFinal: (musica as unknown as InfoDoLaco).preenchimentoFinal,
    amostrasNoArquivo: (musica as unknown as InfoDoLaco).amostrasNoArquivo,
    amostras: (musica as unknown as InfoDoLaco).amostras,
  };
  const bytes: Record<string, ArrayBuffer> = {};
  for (const [id, texto] of Object.entries(base64)) bytes[id] = base64ParaBytes(texto);
  return { config: cfg, laco, bytes };
}
