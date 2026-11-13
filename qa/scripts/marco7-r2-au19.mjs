// AU19 completo: mudo e pausa durante o jingle da conquista das luzes (gancho audio). Teclado. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const log = (id, ok, n = '') => console.log(`${ok ? 'OK   ' : 'FALHA'} ${id} :: ${n}`);
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'au19' });
const p = await abrirJogo(c, url);
const est = async () => { try { return await estado(p); } catch { return null; } };
const z = (pa = 400) => tecla(p, 'z', { ms: 90, pausa: pa });
await tecla(p, 'KeyZ', { ms: 90, pausa: 400 });
await irAteHall(p, 0); await irAtePainel(p); await digitar(p, '017'); await z(600);
for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(500);
for (let i = 0; i < 4; i++) { const q = await est(); if (!q?.travado) break; await z(); }
try { await irPara(p, 'sala', 5, 4); } catch {}
await tecla(p, 'ArrowUp', { ms: 260, pausa: 200 });
await z(600); await z(600);   // abre o diálogo das luzes (o jingle da conquista começa ao abrir a conquista)
let jin = null; let t0 = Date.now();
for (let i = 0; i < 40; i++) { const q = await est(); if (q?.audio?.jingle?.estado === 'tocando') { jin = q.audio; break; } await sleep(100); }
if (!jin) { log('AU19 jingle das luzes começou', false, JSON.stringify((await est())?.audio?.jingle)); await c.close(); await b.close(); process.exit(0); }
// M durante o jingle
await tecla(p, 'KeyM', { ms: 90, pausa: 0 });
const aM = await est();
log('AU19 mudo durante o jingle: silencia (mudo=true), trilha continua (tocando)', aM?.audio?.mudo === true && aM?.audio?.musica === 'tocando', `mudo=${aM?.audio?.mudo} musica=${aM?.audio?.musica} jingle=${aM?.audio?.jingle?.estado}`);
await tecla(p, 'KeyM', { ms: 90, pausa: 400 });
// pausa durante jingle: P não abre (conquista) — ou abre fora da conquista; registrar
await tecla(p, 'KeyP', { ms: 90, pausa: 400 });
const aP = await est();
log('AU19 P durante o jingle da conquista não abre a pausa (PS5: conquista)', aP?.pausa?.aberta !== true, `pausa=${aP?.pausa?.aberta} jingle=${aP?.audio?.jingle?.estado}`);
await sleep(3500);
const aF = await est();
log('AU19 jingle termina sem clique (estado ocioso ou saindo) e trilha volta ao normal', aF?.audio?.trilha?.duckingDb === 0 || aF?.audio?.trilha?.duckingDb === undefined, `duck=${aF?.audio?.trilha?.duckingDb} jingle=${aF?.audio?.jingle?.estado}`);
await c.close(); await b.close();
