import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as { version: string };

/** Versão do jogo vem só do package.json (ADR-002). */
export const defineVersao = { __APP_VERSION__: JSON.stringify(pkg.version) };
