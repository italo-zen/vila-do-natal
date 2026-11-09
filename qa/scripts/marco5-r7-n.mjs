// QA Marco 5 rodada 7: N10 (cômodo do Nick por fase, leitura de estado após cada fase) e N9 (chegada da parte 3, 3 páginas, Nick dorme). Teclado. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, lerTextos, sleep, irAteHall } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco5-r7'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'n' });
const p = await abrirJogo(c, url);
const est = async () => { try { return await estado(p); } catch { await sleep(150); return null; } };
const z = () => tecla(p, 'z', { ms: 90, pausa: 400 });
const txt = async () => (await lerTextos(p)).map((x) => x.t).join(' ').replace(/\s+/g, ' ');
const reg = (id, ok, nota = '') => console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`);
// N10: nick por fase
await irAteHall(p, 0);
await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(600);
const fases = ['luzes', 'parte1', 'parte2', 'parte3'];
const esperado = { luzes: 'sala', parte1: 'cozinha', parte2: 'quarto', parte3: 'escritorio' };
for (const f of fases) {
  await p.evaluate((ff) => window.__irParaFase(ff), f);
  await sleep(500);
  const q = await est();
  reg(`N10 nick ao chegar à fase "${f}"`, q?.nick?.mapa === esperado[f] && q?.nick?.estado === 'dormindo', `nick=${q?.nick?.estado}@${q?.nick?.mapa} (${q?.nick?.tileX},${q?.nick?.tileY}) esperado=${esperado[f]}`);
  await p.screenshot({ path: join(EVID, `N10-nick-${f}.png`) });
}
// N9: chegada da parte 3 pela peça 3 (Cozinha), 3 páginas do plot twist
await p.evaluate(() => window.__teleportar('cozinha', 'P7')); await sleep(700);
for (let i = 0; i < 4; i++) { const q = await est(); if (!q?.travado) break; await z(); }
try { await irPara(p, 'cozinha', 3, 4); } catch (e) { console.log('rota', e.message.slice(0, 80)); }
await tecla(p, 'ArrowDown', { ms: 90, pausa: 200 });
await lerTextos(p);
await z(); await sleep(300); await z(); await sleep(300);
let tt = ''; let pag = 0;
for (let i = 0; i < 12; i++) { const q = await est(); tt += ' ' + await txt(); if (q && !q.travado && !q.emConducao && pag > 0) break; if (q?.emConducao) { await sleep(300); continue; } await z(); pag++; await sleep(300); }
reg('N9 peça 3: chegada "A árvore está montada! Que linda!"', tt.includes('A árvore está montada'), tt.slice(0, 80));
reg('N9 plot twist página 2: "Mas tem algo estranho... Ainda falta alguma coisa."', tt.includes('Mas tem algo estranho'), '');
reg('N9 plot twist página 3: "Deve estar perdida pela casa."', tt.includes('Deve estar perdida pela casa'), '');
for (let i = 0; i < 6; i++) { const q = await est(); if (!q?.travado) break; await z(); }
const q9 = await est();
reg('N9 Nick dorme na Sala (tile da fase enfeites) após o diálogo de chegada', q9?.nick?.estado === 'dormindo' && q9?.nick?.mapa === 'sala', `nick=${q9?.nick?.estado}@${q9?.nick?.mapa} (${q9?.nick?.tileX},${q9?.nick?.tileY}) fase=${q9?.fase}`);
await p.screenshot({ path: join(EVID, 'N9-nick-dormindo-sala.png') });
await b.close();
