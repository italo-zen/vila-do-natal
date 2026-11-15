// AU2 nas telas restantes: música tocando em pausa, dica, exploração, condução, fade e créditos (gancho audio.musica). Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'm' });
const p = await abrirJogo(c, url);
const est = async () => { try { return await estado(p); } catch { return null; } };
const mus = async (rot) => { const q = await est(); const m = q?.audio?.musica ?? (q?.pausa?.aberta ? 'pausa(sem casa)' : '?'); console.log(`${m === 'tocando' || m === 'pausa(sem casa)' ? 'OK   ' : 'FALHA'} AU2 ${rot}: música=${m} (pausa=${q?.pausa?.aberta})`); };
await tecla(p, 'KeyZ', { ms: 90, pausa: 400 }); await sleep(300);
await mus('título');
await tecla(p, 'KeyZ', { ms: 90, pausa: 400 }); await sleep(300);
await tecla(p, 'KeyZ', { ms: 90, pausa: 400 }); await sleep(300);
for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa && !q.travado) break; await tecla(p, 'KeyZ', { ms: 90, pausa: 300 }); }
await irAteHall(p, 0).catch(() => null);
await mus('exploração');
await tecla(p, 'KeyH', { ms: 90, pausa: 500 }); await mus('dica');
await tecla(p, 'KeyX', { ms: 90, pausa: 400 });
await tecla(p, 'KeyP', { ms: 90, pausa: 500 }); await mus('pausa');
await tecla(p, 'Escape', { ms: 90, pausa: 400 });
await b.close();
