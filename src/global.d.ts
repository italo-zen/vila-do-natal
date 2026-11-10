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
  export const config: unknown;
  export const meta: unknown;
  export const base64: Record<string, string>;
}
