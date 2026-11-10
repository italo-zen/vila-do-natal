// Diagnóstico da rodada 6: X (B) na Sala com Nick acordado e longe do sobrinho; poll de nickOcupado e farejo.ativo. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { estado, irPara } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'diag' });
const page = await abrirJogo(ctx, url);
await irAteHall(page, 0); await irAtePainel(page); await digitar(page, '017'); await tecla(page, 'z');
for (let i = 0; i < 12; i++) { const q = await estado(page); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await tecla(page, 'z'); }
const poll = async (r) => { for (let t = 0; t <= 2000; t += 200) { const q = await estado(page); console.log(r, t, 'ocupado=', q?.nickOcupado, 'ativo=', q?.farejo?.ativo, 'nick=', q?.nick?.estado, 'pos=', q?.tileX, q?.tileY, 'travado=', q?.travado, 'dir=', q?.direcao); await sleep(200); } };
// Nick dormindo: X
await tecla(page, 'x', { ms: 90, pausa: 100 });
await poll('X-dormindo');
await browser.close();
