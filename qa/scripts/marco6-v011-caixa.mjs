// Caixa das diferenças (pixels) entre as capturas atuais e a baseline, para confirmar que só o texto da versão mudou. Só observa.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodificarPng } from '../../tools/png.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const A = join(RAIZ, 'dist-playtest', 'capturas'), B = join(RAIZ, 'qa', 'baseline-0100', 'capturas');
for (const f of ['titulo.png', 'lolo-CR1-creditos-entrada.png', 'lolo-CR2-creditos-foco-voltar-ao-titulo.png', 'lolo-CR2-depois-de-voltar-titulo.png', 'lolo-CR4-creditos-30s-sem-mudanca.png']) {
  const a = decodificarPng(readFileSync(join(A, f))), b = decodificarPng(readFileSync(join(B, f)));
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0;
  for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) { const i = (y * a.w + x) * 4; if (a.rgba[i] !== b.rgba[i] || a.rgba[i + 1] !== b.rgba[i + 1] || a.rgba[i + 2] !== b.rgba[i + 2]) { n++; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
  console.log(`${f}: ${n} px, caixa x=${x0}..${x1} y=${y0}..${y1} (imagem ${a.w}x${a.h})`);
}
