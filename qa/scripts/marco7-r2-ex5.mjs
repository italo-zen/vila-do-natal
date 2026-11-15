// EX5 (exploração livre de 5 min): andar pelas áreas, colar em enfeites, pausa, som, farejar; trava, erro de console, capturas a cada 30 s. Teclado. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, sleep } from './lib.mjs';
import { estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { writeFileSync } from 'node:fs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco7-r2', 'ex5');
import { mkdirSync } from 'node:fs'; mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'ex5' });
const erros = [];
const p = await abrirJogo(c, url);
p.on('pageerror', (e) => erros.push('pageerror ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
const est = async () => { try { return await estado(p); } catch { return null; } };
await tecla(p, 'KeyZ', { ms: 90, pausa: 400 });
await p.evaluate(() => window.__partidaConcluida('lolo', false));
await p.evaluate(() => window.__irPara('Fim', {})); await sleep(3000);
await tecla(p, 'KeyZ', { ms: 90, pausa: 900 }); await tecla(p, 'ArrowDown', { ms: 90, pausa: 400 }); await tecla(p, 'KeyZ', { ms: 90, pausa: 1500 });
const t0 = Date.now(); let n = 0; const visitas = new Set(); const trav = []; let pausas = 0; let mudos = 0; let farejos = 0; let ultimo = null;
const dirs = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
while (Date.now() - t0 < 300000) {
  n++;
  const d = dirs[Math.floor(Math.random() * 4)];
  await p.keyboard.down(d); await sleep(180 + Math.floor(Math.random() * 500)); await p.keyboard.up(d); await sleep(120);
  const q = await est();
  if (q?.mapa) visitas.add(q.mapa);
  if (q?.mapa && ultimo && q.mapa === ultimo.mapa && q.tileX === ultimo.tileX && q.tileY === ultimo.tileY && q.travado === false && n % 12 === 0) trav.push(`${q.mapa}:${q.tileX},${q.tileY} @${Math.round((Date.now() - t0) / 1000)}s`);
  ultimo = q;
  if (n % 15 === 0) { await tecla(p, 'KeyP', { ms: 90, pausa: 500 }); pausas++; await tecla(p, 'Escape', { ms: 90, pausa: 400 }); }
  if (n % 20 === 0) { await tecla(p, 'KeyM', { ms: 90, pausa: 300 }); mudos++; await tecla(p, 'KeyM', { ms: 90, pausa: 300 }); }
  if (n % 9 === 0) { await tecla(p, 'KeyX', { ms: 90, pausa: 300 }); farejos++; }
  if (n % 25 === 0) { await tecla(p, 'KeyZ', { ms: 90, pausa: 300 }); }
  if (n % 40 === 0) { await p.screenshot({ path: join(EVID, `t${Math.round((Date.now() - t0) / 1000)}s.png`) }); }
}
const fim = await est();
const res = { minutos: ((Date.now() - t0) / 60000).toFixed(2), passos: n, areasVisitadas: [...visitas], pausas, mudos, farejos, travamentosSuspeitos: trav.slice(0, 10), erros: erros.slice(0, 10), estadoFinal: fim?.mapa };
writeFileSync(join(RAIZ, 'qa', 'evidencias', 'marco7-r2', 'ex5-resultado.json'), JSON.stringify(res, null, 1));
console.log(JSON.stringify(res));
await c.close(); await b.close();
