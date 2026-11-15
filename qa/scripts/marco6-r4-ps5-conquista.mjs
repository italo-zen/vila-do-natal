// PS5 na conquista e na condução (teclado): P não abre a pausa. Lê estado antes e depois do P. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'ps5' });
const p = await abrirJogo(c, url);
const est = async () => { try { return await estado(p); } catch { return null; } };
const z = () => tecla(p, 'z', { ms: 90, pausa: 400 });
await irAteHall(p, 0); await irAtePainel(p); await digitar(p, '017'); await z();
for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
await p.evaluate(() => window.__irParaFase('parte1')); await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(600);
for (let i = 0; i < 6; i++) { const q = await est(); if (!q?.travado) break; await z(); }
try { await irPara(p, 'sala', 2, 4); } catch (e) { console.log('rota', e.message.slice(0, 60)); }
await tecla(p, 'ArrowLeft', { ms: 260, pausa: 200 });
await z(); await sleep(400);
const s1 = await est();
console.log('após A na peça 1: mapa', s1?.mapa, 'travado', s1?.travado, 'emConducao', s1?.emConducao, 'pausa', JSON.stringify(s1?.pausa));
await tecla(p, 'p', { ms: 90, pausa: 500 });
const s2 = await est();
console.log(`${s2?.pausa?.aberta ? 'FALHA' : 'OK   '} PS5 P logo após o A da peça 1 (conquista/diálogo): pausa aberta=${s2?.pausa?.aberta} mapa=${s2?.mapa} travado=${s2?.travado} emConducao=${s2?.emConducao}`);
await p.screenshot({ path: join(RAIZ, 'qa', 'evidencias', 'marco6-r4', 'PS5-P-na-conquista.png') });
await c.close(); await b.close();
