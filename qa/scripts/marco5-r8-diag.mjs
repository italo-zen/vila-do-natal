// Diagnóstico da rota até a peça 1 (Sala (1,4)) depois das luzes. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { irPara, estado, rotaEntre } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar(); const c = await novoContexto(b, { url, origem: url, rotulo: 'd' }); const p = await abrirJogo(c, url);
const est = () => estado(p);
const z = () => tecla(p, 'z', { ms: 90, pausa: 400 });
await irAteHall(p, 0); await irAtePainel(p); await digitar(p, '017'); await z();
for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
await p.evaluate(() => window.__irParaFase('luzes')); await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(700);
for (let i = 0; i < 10; i++) { const q = await est(); if (!q.travado) break; await z(); }
let q = await est(); console.log('antes', q.tileX, q.tileY, q.travado, q.emConducao, q.fase, q.mapa);
try { console.log('rota', JSON.stringify(rotaEntre('sala', { x: q.tileX, y: q.tileY }, { x: 2, y: 4 })).slice(0, 200)); } catch (e) { console.log('rotaEntre err', e.message); }
try { await irPara(p, 'sala', 2, 4); console.log('ok 2,4'); } catch (e) { console.log('err', e.message.slice(0, 200)); }
q = await est(); console.log('depois', q.tileX, q.tileY, q.travado, q.emConducao, q.direcao);
await b.close();
