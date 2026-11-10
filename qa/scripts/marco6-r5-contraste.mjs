// AC1 por medidor sobre captura: fundo = cor mais frequente da região; texto = cor mais clara (de texto) da região; contraste WCAG. Só observa.
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodificarPng } from '../../tools/png.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const lum = (r, g, bl) => { const c = [r, g, bl].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const x = lum(...a), y = lum(...b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const alvos = [
  ['título 844 (barra)', join(RAIZ, 'qa/evidencias/marco5-r7/844x390_t_tulo.png')],
  ['seleção 667 (barra)', join(RAIZ, 'qa/evidencias/marco6-r3/po2-selecao-667-danDan.png')],
  ['pausa 667 (menu)', join(RAIZ, 'qa/evidencias/marco6-r2/08-pausa-667.png')],
  ['pausa 844 (menu)', join(RAIZ, 'qa/evidencias/marco6-r2/03-pausa-como-jogar.png')],
  ['pausa 844 (som desligado)', join(RAIZ, 'qa/evidencias/marco6-r2/02-pausa-som-desligado.png')],
];
for (const [nome, arq] of alvos) {
  let img;
  try { img = decodificarPng(readFileSync(arq)); } catch (e) { console.log(`N/T  AC1 ${nome}: captura não lida (${e.message.slice(0, 60)})`); continue; }
  const { w, h, rgba: pixels } = img;
  const cont = new Map(); let ymin = Math.floor(h * 0.78);
  const px = (x, y) => { const i = (y * w + x) * 4; return [pixels[i], pixels[i + 1], pixels[i + 2]]; };
  const bg = new Map(); let best = null, bestL = -1;
  for (let y = ymin; y < h; y++) for (let x = 0; x < w; x++) { const q = px(x, y); const k = q.join(','); bg.set(k, (bg.get(k) || 0) + 1); const L = lum(...q); if (L > bestL) { bestL = L; best = q; } }
  const fundo = [...bg.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number);
  const r = ratio(best, fundo);
  console.log(`${r >= 4.5 ? 'OK   ' : 'FALHA'} AC1 ${nome}: texto ${best.join(',')} sobre fundo ${fundo.join(',')} = ${r.toFixed(2)}:1 (≥ 4,5)`);
}
