// Diagnóstico: P no Escritório (fase enfeites, após atalho) não abre a pausa? Lê travado/fase/mapa antes do P. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar(); const c = await novoContexto(b, { url, origem: url, rotulo: 'pe' }); const p = await abrirJogo(c, url);
const est = async () => { try { return await estado(p); } catch { return null; } };
const z = () => tecla(p, 'z', { ms: 90, pausa: 400 });
await irAteHall(p, 0); await irAtePainel(p); await digitar(p, '017'); await z();
for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
await p.evaluate(() => window.__irParaFase('enfeites')); await sleep(400);
await p.evaluate(() => window.__teleportar('escritorio', 'P3')); await sleep(700);
const a = await est(); console.log('antes do P: mapa', a?.mapa, 'travado', a?.travado, 'fase', a?.fase, 'emFade', a?.emFade, 'emConducao', a?.emConducao);
for (let i = 0; i < 6; i++) { const q = await est(); if (!q?.travado) break; await z(); }
await tecla(p, 'p', { ms: 90, pausa: 500 }); const d = await est();
console.log(`${d?.pausa?.aberta ? 'OK   ' : 'INFO '} P no Escritório após o atalho: pausa aberta=${d?.pausa?.aberta} (travado ${d?.travado}, mapa ${d?.mapa})`);
await c.close(); await b.close();
