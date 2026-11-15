// PO5 diagnóstico: o que o gancho mostra durante a passagem (fade) da condução da peça 2 e 3. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar(); const c = await novoContexto(b, { url, origem: url, rotulo: 'pas' }); const p = await abrirJogo(c, url);
const est = async () => { try { return await estado(p); } catch { return null; } };
const z = () => tecla(p, 'z', { ms: 90, pausa: 400 });
await irAteHall(p, 0); await irAtePainel(p); await digitar(p, '017'); await z();
for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
await p.evaluate(() => window.__irParaFase('parte2')); await p.evaluate(() => window.__teleportar('cozinha', 'P7')); await sleep(700);
for (let i = 0; i < 4; i++) { const q = await est(); if (!q?.travado) break; await z(); }
try { await irPara(p, 'cozinha', 3, 1); } catch {}
await tecla(p, 'ArrowRight', { ms: 260, pausa: 200 });
const lin0 = []; const pre = async () => { const q = await est(); lin0.push(`${q?.mapa ?? 'null'}:${q?.tileX ?? '-'},${q?.tileY ?? '-'}${q?.emConducao ? 'C' : ''}${q?.emFade ? 'F' : ''}`); };
await pre(); await z(); await pre(); await sleep(150); await pre(); await z(); await pre(); await sleep(150);
const linhas = [];
for (let i = 0; i < 160; i++) { const q = await est(); linhas.push(`${q?.mapa ?? 'null'}:${q?.tileX ?? '-'},${q?.tileY ?? '-'}${q?.emFade ? 'F' : ''}${q?.emConducao ? 'C' : ''}`); await sleep(60); }
console.log('desde o pegar:', lin0.join(' '));
console.log('depois:', linhas.filter((l, i) => i === 0 || l !== linhas[i - 1]).join(' '));
await c.close(); await b.close();
