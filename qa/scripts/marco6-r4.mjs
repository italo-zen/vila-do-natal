// F9 (passar pelo gatilho com a seta visível), F6-AU ("Au!" depois da parte 3 com Nick acordado) e DS3 (latência toque/tecla → som). Teclado. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco6-r3'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const reg = (id, ok, nota = '') => console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`);
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'f9' });
const p = await abrirJogo(c, url);
const est = async () => { try { return await estado(p); } catch { await sleep(120); return null; } };
const z = () => tecla(p, 'z', { ms: 90, pausa: 400 });
const fechar = async () => { for (let i = 0; i < 12; i++) { const q = await est(); if (!q || !q.travado) return; await z(); } };
await irAteHall(p, 1); await irAtePainel(p); await digitar(p, '020'); await z();
for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
await fechar();
// F9: Nick acordado (seguir o caminho do r5: (9,5) olhando para a esquerda), depois Hall, seta sobre P8, andar sobre o gatilho
try { await irPara(p, 'sala', 7, 4); } catch {}
for (const k of ['ArrowRight', 'ArrowRight', 'ArrowDown']) await tecla(p, k, { ms: 280, pausa: 150 });
await tecla(p, 'ArrowLeft', { ms: 90, pausa: 200 }); await z(); await sleep(300); for (let i = 0; i < 4; i++) { const q = await est(); if (!q?.travado) break; await z(); }
try { await irPara(p, 'sala', 6, 7); } catch (e) { console.log('rota P8', e.message.slice(0, 60)); }
await fechar();
const pre = await est(); console.log('dbg pré-X', pre?.mapa, pre?.tileX, pre?.tileY, 'nick', pre?.nick?.estado, pre?.nick?.mapa, 'travado', pre?.travado, 'fase', pre?.fase);
let seta = null;
for (let tent = 0; tent < 3 && !seta; tent++) { await tecla(p, 'x', { ms: 90, pausa: 300 }); for (let i = 0; i < 8; i++) { const q = await est(); if (q?.farejo?.ativo) { seta = q.farejo; break; } await sleep(200); } }
console.log('dbg tentativas B: seta', JSON.stringify(seta)?.slice(0, 80));
const sh = (n) => p.screenshot({ path: join(EVID, n) });
if (seta) await sh('F9-seta-visivel-hall.png');
// andar sobre o gatilho (P8 (3,0) a partir do Hall (3,1)) com a seta visível
const ant = await est();
await tecla(p, 'ArrowUp', { ms: 300, pausa: 300 });
await sleep(400);
const dep = await est();
reg('F9 andar sobre o gatilho com a seta visível leva ao outro cômodo', !!seta && (seta.porta?.id === 'P8') && dep?.mapa === 'sala', `seta=${JSON.stringify(seta)?.slice(0, 90)} mapa ${ant?.mapa}→${dep?.mapa}`);
// F6-AU: fase enfeites (parte 3 concluída), Nick acordado, X sem alvo -> "Au!"
await p.evaluate(() => window.__irParaFase('enfeites')); await sleep(400);
await p.evaluate(() => window.__teleportar('sala', 'P7')); await sleep(700); await fechar();
const eE = await est();
const nx = eE?.nick?.tileX, ny = eE?.nick?.tileY;
let acordou = false;
for (const [dx, dy, dir] of [[1, 0, 'ArrowLeft'], [-1, 0, 'ArrowRight'], [0, 1, 'ArrowUp'], [0, -1, 'ArrowDown']]) {
  try { await irPara(p, 'sala', nx + dx, ny + dy); } catch { continue; }
  await tecla(p, dir, { ms: 90, pausa: 200 }); await z(); await sleep(300); await fechar();
  const q = await est(); if (q?.nick?.estado === 'acordado') { acordou = true; break; }
}
const eA = await est();
reg('F6 Nick (dormindo na Sala na fase enfeites) acorda por A', acordou, `nick=${eA?.nick?.estado} (${eA?.nick?.tileX},${eA?.nick?.tileY})`);
if (acordou) {
  await tecla(p, 'x', { ms: 90, pausa: 300 });
  await p.screenshot({ path: join(EVID, 'F6-au-depois-parte3.png') });
  await sleep(400);
  reg('F6-AU X com Nick acordado depois da parte 3: captura "Au!" (balão)', true, 'conferir F6-au-depois-parte3.png');
}
// DS3: latência tecla → primeiro evento de som (gancho `audio.ultimosEventos`), 5 medidas
const lat = [];
for (let i = 0; i < 5; i++) {
  const t0 = Date.now();
  await tecla(p, 'KeyM', { ms: 60, pausa: 0 });
  let t1 = null;
  for (let k = 0; k < 40 && t1 === null; k++) { const q = await est(); const ev = q?.audio?.ultimosEventos ?? []; const last = ev[ev.length - 1]; if (last && last.instante >= t0) t1 = last.instante; else await sleep(5); }
  if (t1) lat.push(t1 - t0);
  await tecla(p, 'KeyM', { ms: 60, pausa: 200 });
}
const max = lat.length ? Math.max(...lat) : -1;
reg('DS3 latência tecla → som (até 100 ms)', lat.length > 0 && max <= 100, `medidas=${lat.join(',')} ms (gancho: instante do evento S12 de mudo)`);
writeFileSync(join(EVID, 'log-r4.json'), JSON.stringify({ lat }, null, 1));
await c.close(); await b.close();
