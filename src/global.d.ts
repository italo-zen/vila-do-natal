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
