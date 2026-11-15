/** Versão do jogo, injetada pelo Vite a partir do package.json (ADR-002, seção 1). */
declare const __APP_VERSION__: string;

/** true só no build de QA (npm run build:qa): liga o gancho de QA. Nos outros builds é false. */
declare const __QA__: boolean;

/** Perfil de arte ativo, embutido pelo plugin `vite.perfil.ts` (ADR-003 seção 10). */
declare module 'virtual:perfil-de-arte' {
  export const idDoPerfil: string;
  export const perfil: unknown;
  export const sprites: unknown;
  export const urls: Record<string, string>;
}

/** Áudio embutido pelo plugin `vite.audio.ts` (ADR-008 1.6): config, meta e MP3 em base64, só os que o JSON aponta. */
declare module 'virtual:audio' {
  /** `embutido` (playtest, bytes em base64) ou `externo` (release: bytes fora do HTML, ADR-009). */
  export const modo: 'embutido' | 'externo';
  export const config: unknown;
  export const meta: unknown;
  export const base64: Record<string, string>;
}

/** Imagens de tela (ADR-009; GDD 20.3 e 20.4), pelo plugin `vite.recursos.ts`. `modo` é `embutido` no playtest. */
declare module 'virtual:recursos' {
  export const modo: 'embutido' | 'externo';
  /** Embutido: data URL de cada imagem. Externo: caminho relativo (`imagens/<nome>.<hash>.png`). */
  export const imagens: Record<string, string>;
  /** Só externo: caminho relativo de cada áudio (`audio/<id>.<hash>.mp3`). */
  export const audio: Record<string, string> | undefined;
  /** Ordem de carga da release (ADR-009 4.1). Vazia no embutido. */
  export const ordem: { tipo: 'imagem' | 'audio'; id: string; arquivo: string }[];
}
