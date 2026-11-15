// Diagnóstico da pegada da peça 2 (Cozinha (4,1)): estado após __irParaFase('parte1') e teleporte. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'd' });
const p = await abrirJogo(c, url);
const est = async () => { try { return await estado(p); } catch { return null; } };
const z = () => tecla(p, 'z', { ms: 90, pausa: 400 });
await irAteHall(p, 0); await irAtePainel(p); await digitar(p, '017'); await z();
for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
await p.evaluate(() => window.__irParaFase('parte1')); await sleep(400);
await p.evaluate(() => window.__teleportar('cozinha', 'P7')); await sleep(700);
for (let i = 0; i < 4; i++) { const q = await est(); if (!q?.travado) break; await z(); }
const q = await est(); console.log('cozinha', q?.mapa, q?.tileX, q?.tileY, q?.travado, q?.fase);
try { await irPara(p, 'cozinha', 3, 1); console.log('ok (3,1)'); } catch (e) { console.log('erro', e.message.slice(0, 150)); }
const q2 = await est(); console.log('depois', q2?.mapa, q2?.tileX, q2?.tileY, q2?.direcao);
await c.close(); await b.close();
