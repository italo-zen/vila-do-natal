// BUG-M2-02: texto de P1 (portaFechada) e P2 (porta da Sala para o Quarto) ao apertar Z. Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { tecla, sleep, irAteHall, irAtePainel, digitar } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { lancar, novoContexto, abrirJogo, lerTextos } from './lib.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'm2' });
const p = await abrirJogo(c, url);
const est = async () => { try { return await estado(p); } catch { return null; } };
const z = () => tecla(p, 'z', { ms: 90, pausa: 400 });
const T = async () => (await lerTextos(p)).map((t) => t.t).join(' ').replace(/\s+/g, ' ');
await irAteHall(p, 0); await irAtePainel(p); await digitar(p, '017'); await z();
for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
for (let i = 0; i < 6; i++) { const q = await est(); if (!q?.travado) break; await z(); }
await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(600);
for (let i = 0; i < 6; i++) { const q = await est(); if (!q?.travado) break; await z(); }
const cases = [['P1 (6,2) de (5,2)', 5, 2, 'ArrowRight'], ['P2 (7,1) de (7,2)', 7, 2, 'ArrowUp']];
for (const [nome, x, y, dir] of cases) {
  try { await irPara(p, 'sala', x, y); } catch (e) { console.log('rota', nome, e.message.slice(0, 60)); }
  await tecla(p, dir, { ms: 90, pausa: 200 });
  await lerTextos(p);
  await z(); await sleep(400);
  const t1 = await T();
  await z(); await sleep(300);
  const t2 = await T();
  console.log(`${t1 + t2 ? 'OK   ' : 'FALHA'} BUG-M2-02 ${nome}: texto ao Z :: "${(t1 + ' | ' + t2).slice(0, 160)}"`);
  for (let i = 0; i < 4; i++) { const q = await est(); if (!q?.travado) break; await z(); }
}
await c.close(); await b.close();
