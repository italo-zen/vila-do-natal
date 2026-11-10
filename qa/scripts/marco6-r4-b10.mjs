// P3 (rodada 4): o primeiro B logo depois do diálogo de entrada na Hall é ignorado? 10 tentativas. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'b10' });
const p = await abrirJogo(c, url);
const est = async () => { try { return await estado(p); } catch { return null; } };
const z = () => tecla(p, 'z', { ms: 90, pausa: 400 });
await irAteHall(p, 1); await irAtePainel(p); await digitar(p, '020'); await z();
for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
await p.evaluate(() => window.__teleportar('sala', 'P7')); await sleep(700);
for (let i = 0; i < 4; i++) { const q = await est(); if (!q?.travado) break; await z(); }
await tecla(p, 'ArrowLeft', { ms: 280, pausa: 150 }); await tecla(p, 'ArrowLeft', { ms: 90, pausa: 200 }); await z(); await sleep(300);
for (let i = 0; i < 4; i++) { const q = await est(); if (!q?.travado) break; await z(); }
const res = [];
for (let t = 1; t <= 10; t++) {
  await p.evaluate(() => window.__teleportar('hall', 'P8')); await sleep(700);
  let dlg = 0; for (let i = 0; i < 4; i++) { const q = await est(); if (!q?.travado) break; await z(); dlg++; }
  await sleep(200);
  const pre = await est();
  await tecla(p, 'x', { ms: 90, pausa: 0 });
  let ativo = false; for (let i = 0; i < 6; i++) { const q = await est(); if (q?.farejo?.ativo) { ativo = true; break; } await sleep(100); }
  res.push(`t${t}:${ativo ? 'sim' : 'NAO'}(nick=${pre?.nick?.estado},dlg=${dlg})`);
  await sleep(2500);
}
const nao = res.filter((r) => r.includes(':NAO')).length;
console.log(`${nao === 0 ? 'OK   ' : 'INFO '} P3 primeiro B após diálogo na Hall: ${nao} de 10 ignorados :: ${res.join(' ')}`);
await c.close(); await b.close();
