// Triagem BUG-R13-03: resto de cena atrás do painel da senha. Captura o painel e mede se o fundo entre as teclas é só #0b1030 (sólido). Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { mkdirSync, readFileSync } from 'node:fs';
import { decodificarPng } from '../../tools/png.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'triagem-r1'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'pn' });
const p = await abrirJogo(c, url);
await tecla(p, 'KeyZ', { ms: 90, pausa: 400 });
await irAteHall(p, 0); await irAtePainel(p); await sleep(400);
await p.screenshot({ path: join(EVID, 'painel-r13-03.png') });
await c.close(); await b.close();
const img = decodificarPng(readFileSync(join(EVID, 'painel-r13-03.png')));
const { w, h, rgba } = img;
// amostra: faixa estreita acima da grade (entre a caixa dos campos e as teclas), para ver se há resto de cena
const cont = new Map();
for (let y = Math.floor(h * 0.42); y < Math.floor(h * 0.6); y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; const k = `${rgba[i]},${rgba[i + 1]},${rgba[i + 2]}`; cont.set(k, (cont.get(k) || 0) + 1); }
const top = [...cont.entries()].sort((a, b2) => b2[1] - a[1]).slice(0, 4);
console.log(`cores mais frequentes na faixa do painel (42%–60% da altura): ${top.map(([k, n]) => `${k} (${n})`).join(' | ')}`);
console.log(`${top[0][0] === '11,16,48' ? 'OK   ' : 'INFO '} fundo do painel = #0b1030 na faixa (sólido)`);
