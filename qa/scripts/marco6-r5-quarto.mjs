// BUG-M2-05: seta do gatilho do Quarto (P2 (0,7)) com Nick acordado. Captura e leitura de posição. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco6-r3'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'q' });
const p = await abrirJogo(c, url);
const est = async () => { try { return await estado(p); } catch { return null; } };
const z = () => tecla(p, 'z', { ms: 90, pausa: 400 });
await irAteHall(p, 0); await irAtePainel(p); await digitar(p, '017'); await z();
for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
await p.evaluate(() => window.__irParaFase('parte2')); await sleep(400);
await p.evaluate(() => window.__teleportar('quarto', 'P2')); await sleep(700);
for (let i = 0; i < 6; i++) { const q = await est(); if (!q?.travado) break; await z(); }
const q0 = await est();
console.log('quarto chegada', q0?.mapa, q0?.tileX, q0?.tileY, q0?.direcao, 'nick', q0?.nick?.estado, q0?.nick?.tileX, q0?.nick?.tileY);
// acordar Nick: ficar ao lado dele e apertar Z
const nx = q0?.nick?.tileX, ny = q0?.nick?.tileY;
for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) { try { await irPara(p, 'quarto', nx + dx, ny + dy); } catch { continue; } break; }
await tecla(p, 'ArrowUp', { ms: 90, pausa: 250 }); await z(); await sleep(300); for (let i = 0; i < 4; i++) { const q = await est(); if (!q?.travado) break; await z(); }
const qa = await est();
console.log('nick após Z', qa?.nick?.estado);
// farejar (X) com alvo fora do Quarto
let seta = null;
for (let t = 0; t < 3 && !seta; t++) { await tecla(p, 'x', { ms: 90, pausa: 300 }); for (let i = 0; i < 8; i++) { const q = await est(); if (q?.farejo?.ativo) { seta = q.farejo; break; } await sleep(200); } }
console.log('seta', JSON.stringify(seta)?.slice(0, 140));
await p.screenshot({ path: join(EVID, 'BUG-M2-05-quarto-seta.png') });
const fin = await est();
console.log('posição do sobrinho', fin?.tileX, fin?.tileY, 'seta porta', seta?.porta?.id, seta?.porta?.saida);
await c.close(); await b.close();
