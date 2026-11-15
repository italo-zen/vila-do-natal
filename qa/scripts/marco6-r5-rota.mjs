// PO5 / item 133: passos da condução E7 (peça 2) e E20 (peça 3) medidos pela troca de tile em __estado, 4 sobrinhos. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const SOB = [['LoLô', 0, '017'], ['BiBi', 1, '020'], ['DanDan', 2, '023'], ['TuTu', 3, '024']];
for (const [nome, idx, cod] of SOB) {
  const c = await novoContexto(b, { url, origem: url, rotulo: nome });
  const p = await abrirJogo(c, url);
  const est = async () => { try { return await estado(p); } catch { return null; } };
  const z = () => tecla(p, 'z', { ms: 90, pausa: 400 });
  await irAteHall(p, idx); await irAtePainel(p); await digitar(p, cod); await z();
  for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
  // peça 1 (luzes) para liberar a Cozinha: __irParaFase('parte1') conclui luzes
  for (const [rot, cozX, cozY, dirKey, fim] of [['E7 peça 2', 3, 1, 'ArrowRight', null], ['E20 peça 3', 3, 4, 'ArrowDown', null]]) {
    await p.evaluate((f) => window.__irParaFase(f), rot.startsWith('E20') ? 'parte3' : 'parte2'); await sleep(400);
    await p.evaluate(() => window.__teleportar('cozinha', 'P7')); await sleep(700);
    for (let i = 0; i < 4; i++) { const q = await est(); if (!q?.travado) break; await z(); }
    try { await irPara(p, 'cozinha', cozX, cozY); } catch (e) { console.log(nome, rot, 'rota', e.message.slice(0, 60)); }
    await tecla(p, dirKey, { ms: 260, pausa: 200 });
    await z(); await sleep(300); // conquista
    await z(); await sleep(200); // Continuar -> condução
    const tiles = []; let passos = 0; let last = null; let cond = false;
    let fora = 0; for (let i = 0; i < 300; i++) { const q = await est(); if (q?.emConducao || q?.emFade) { cond = true; fora = 0; if (q.mapa) { const t = `${q.tileX},${q.tileY},${q.mapa}`; if (t !== last) { passos++; last = t; } } } else if (cond) { fora++; if (fora > 16) break; } await sleep(60); }
    console.log(`${cond ? 'OK   ' : 'FALHA'} ${nome} ${rot}: passos (trocas de tile na condução) = ${passos} (cond=${cond})`);
    for (let i = 0; i < 6; i++) { const q = await est(); if (!q?.travado && !q?.emConducao) break; await z(); await sleep(200); }
  }
  await c.close();
}
await b.close();
