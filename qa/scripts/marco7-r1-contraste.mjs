// TI1: contraste do texto do título sobre a caixa (medidor sobre captura) e do botão. Só observa.
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodificarPng } from '../../tools/png.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const lum = (r, g, b) => { const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const x = lum(...a), y = lum(...b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const img = decodificarPng(readFileSync(join(RAIZ, 'qa/evidencias/marco7-r1/titulo-m7.png')));
const { w, rgba } = img;
const px = (x, y) => { const i = (y * w + x) * 4; return [rgba[i], rgba[i + 1], rgba[i + 2]]; };
const regiao = (x0, y0, x1, y1) => { const cont = new Map(); let best = null, bl = -1; for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const q = px(x, y); cont.set(q.join(','), (cont.get(q.join(',')) || 0) + 1); const L = lum(...q); if (L > bl) { bl = L; best = q; } } const fundo = [...cont.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number); return { texto: best, fundo, r: ratio(best, fundo) }; };
const t = regiao(80, 70, 450, 225);
const botao = regiao(105, 365, 425, 430);
console.log(`${t.r >= 4.5 ? 'OK   ' : 'FALHA'} TI1 contraste do título (caixa): ${t.r.toFixed(2)}:1 (texto ${t.texto} sobre ${t.fundo})`);
console.log(`${botao.r >= 3 ? 'OK   ' : 'FALHA'} TI1 contraste do botão (texto claro sobre caixa): ${botao.r.toFixed(2)}:1 (≥ 3 para caixa)`);
