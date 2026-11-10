// PS5 nas telas de conquista e condução: P e II não abrem; II some. Teclado. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'p5' });
const p = await abrirJogo(c, url);
const est = async () => { try { return await estado(p); } catch { return null; } };
const z = () => tecla(p, 'z', { ms: 90, pausa: 400 });
await irAteHall(p, 0); await irAtePainel(p); await digitar(p, '017'); await z();
for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
for (let i = 0; i < 6; i++) { const q = await est(); if (!q?.travado) break; await z(); }
await p.evaluate(() => window.__irParaFase('luzes')); await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(600);
for (let i = 0; i < 6; i++) { const q = await est(); if (!q?.travado) break; await z(); }
try { await irPara(p, 'sala', 5, 4); } catch {}
await tecla(p, 'ArrowUp', { ms: 260, pausa: 200 });
await z(); await sleep(300); // abre o diálogo das luzes
// conquista/diálogo: P não abre
await tecla(p, 'p', { ms: 90, pausa: 400 });
const d1 = await est();
console.log(`${d1?.pausa?.aberta === false ? 'OK   ' : 'FALHA'} PS5 P no diálogo das luzes não abre a pausa (aberta=${d1?.pausa?.aberta})`);
await p.screenshot({ path: join(RAIZ, 'qa', 'evidencias', 'marco6-r3', 'PS5-dialogo-luzes-sem-II.png') });
// avança até a condução (Continuar + condução automática)
let viuCond = false; let pNaCond = null;
for (let i = 0; i < 30; i++) { const q = await est(); if (q?.emConducao) { viuCond = true; await tecla(p, 'p', { ms: 90, pausa: 200 }); const q2 = await est(); pNaCond = q2?.pausa?.aberta; break; } await z(); await sleep(250); }
console.log(`${viuCond && pNaCond === false ? 'OK   ' : viuCond ? 'FALHA' : 'N/T  '} PS5 P na condução não abre a pausa (condução vista=${viuCond}, aberta=${pNaCond})`);
await c.close(); await b.close();
