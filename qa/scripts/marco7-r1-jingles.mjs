// Marco 7 (0.13.0), rodada 1: jingles de conquista (AU15 a AU19) por conquista, pelo gancho `audio`; captura de cada tela. Teclado (tecla 90 ms). Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco7-r1'); 
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'j' });
const p = await abrirJogo(c, url);
const est = async () => { try { return await estado(p); } catch { return null; } };
const aud = async () => (await est())?.audio;
const z = (pa = 400) => tecla(p, 'z', { ms: 90, pausa: pa });
const log = (id, ok, nota = '') => console.log(`${ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`);
const ev = (a) => (a?.ultimosEventos ?? []).map((e) => `${e.evento}${e.variante ? '/' + e.variante : ''}`).join(' ');
await tecla(p, 'KeyZ', { ms: 90, pausa: 400 }); await sleep(200);
const aTit = await aud(); log('AU15 pré: título sem jingle (ultimosEventos sem S09)', !ev(aTit).includes('S09'), ev(aTit).slice(0, 80));
await irAteHall(p, 0); await irAtePainel(p); await digitar(p, '017'); await z(600);
for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
const casos = [
  ['luzes', async () => { await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(500); for (let i = 0; i < 4; i++) { if (!(await est())?.travado) break; await z(); } try { await irPara(p, 'sala', 5, 4); } catch {} await tecla(p, 'ArrowUp', { ms: 260, pausa: 200 }); await z(600); await z(600); }],
  ['parte1', async () => { await p.evaluate(() => window.__irParaFase('parte1')); await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(500); for (let i = 0; i < 4; i++) { if (!(await est())?.travado) break; await z(); } try { await irPara(p, 'sala', 2, 4); } catch {} await tecla(p, 'ArrowLeft', { ms: 260, pausa: 200 }); await z(600); }],
  ['parte2', async () => { await p.evaluate(() => window.__irParaFase('parte2')); await p.evaluate(() => window.__teleportar('cozinha', 'P7')); await sleep(500); for (let i = 0; i < 4; i++) { if (!(await est())?.travado) break; await z(); } try { await irPara(p, 'cozinha', 3, 1); } catch {} await tecla(p, 'ArrowRight', { ms: 260, pausa: 200 }); await z(600); }],
  ['parte3', async () => { await p.evaluate(() => window.__irParaFase('parte3')); await p.evaluate(() => window.__teleportar('cozinha', 'P7')); await sleep(500); for (let i = 0; i < 4; i++) { if (!(await est())?.travado) break; await z(); } try { await irPara(p, 'cozinha', 3, 4); } catch {} await tecla(p, 'ArrowDown', { ms: 260, pausa: 200 }); await z(600); }],
  ['enfeites', async () => { await p.evaluate(() => window.__irParaFase('enfeites')); await p.evaluate(() => window.__teleportar('escritorio', 'P3')); await sleep(500); for (let i = 0; i < 4; i++) { if (!(await est())?.travado) break; await z(); } try { await irPara(p, 'escritorio', 5, 3); } catch {} await tecla(p, 'ArrowUp', { ms: 90, pausa: 200 }); await z(600); }],
];
for (const [nome, abrir] of casos) {
  await abrir();
  await sleep(150);
  const a = await aud();
  const s09 = (a?.ultimosEventos ?? []).filter((e) => e.evento === 'S09');
  log(`AU15 ${nome}: S09 com variante da conquista`, s09.length >= 1, `S09=${s09.map((e) => e.variante).join(',') || '-'} ; jingle=${JSON.stringify(a?.jingle)}`);
  const duck = a?.trilha?.duckingDb;
  log(`AU16 ${nome}: ducking da trilha durante o jingle (esperado −8 dB)`, duck === -8 || (a?.jingle?.estado === 'tocando' && duck <= -7), `duckingDb=${duck} estado=${a?.jingle?.estado}`);
  await p.screenshot({ path: join(EVID, `${nome}-conquista.png`) });
  await z(500); await sleep(120);
  const a2 = await aud();
  const dep = (a2?.ultimosEventos ?? []).filter((e) => e.evento === 'S12').length;
  log(`AU18 ${nome}: Continuar corta o jingle (rampa 30 ms no gancho) e S12 só em Continuar`, dep >= 1 && (a2?.trilha?.duckingDb ?? 0) >= -1, `S12=${dep} duck=${a2?.trilha?.duckingDb} jingle=${JSON.stringify(a2?.jingle).slice(0, 80)}`);
  await sleep(1200);
  for (let i = 0; i < 10; i++) { const q = await est(); if (!q?.travado && !q?.emConducao) break; await z(300); await sleep(200); }
}
await c.close(); await b.close();
