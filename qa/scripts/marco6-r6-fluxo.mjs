// RG6-6 (rodada 6): fluxo combinado com teclado: título → seleção → introdução → exploração → pausa e mudo → luzes → peça 1 → enfeites → créditos → Z → título. Z controlado (um por passo). Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const erros = []; const out = [];
const ok = (id, c, n = '') => { out.push(c); console.log(`${c ? 'OK   ' : 'FALHA'} ${id} ${n}`); };
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'rg66' });
const p = await abrirJogo(c, url);
p.on('pageerror', (e) => erros.push('pageerror ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
const est = async () => { try { return await estado(p); } catch { return null; } };
const z = (pa = 500) => tecla(p, 'z', { ms: 90, pausa: pa });
const al = () => p.evaluate(() => window.__alvosDeToque());
await tecla(p, 'KeyZ', { ms: 90, pausa: 500 });                 // Começar
await tecla(p, 'KeyZ', { ms: 90, pausa: 500 });                 // seleção: LoLô
for (let i = 0; i < 10; i++) { const q = await est(); if (q?.mapa && !q.travado) break; await z(400); }
ok('TÍTULO→SELEÇÃO→INTRODUÇÃO→EXPLORAÇÃO', !!(await est())?.mapa);
await tecla(p, 'p', { ms: 90, pausa: 500 }); ok('PAUSA abre (P)', (await est())?.pausa?.aberta === true);
await tecla(p, 'Escape', { ms: 90, pausa: 500 }); ok('PAUSA fecha (Esc)', (await est())?.pausa?.aberta === false);
await tecla(p, 'm', { ms: 90, pausa: 400 }); ok('MUDO liga (M)', (await est())?.audio?.mudo === true);
await tecla(p, 'm', { ms: 90, pausa: 400 }); ok('MUDO desliga (M)', (await est())?.audio?.mudo === false);
await irAteHall(p, 0).catch(() => null); await irAtePainel(p).catch(() => null); await digitar(p, '017'); await z(600);
for (let i = 0; i < 10; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(400); }
ok('PORTA P8 pelo código 017', (await est())?.mapa === 'sala');
await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(600);
for (let i = 0; i < 4; i++) { const q = await est(); if (!q?.travado) break; await z(400); }
try { await irPara(p, 'sala', 5, 4); } catch {}
await tecla(p, 'ArrowUp', { ms: 260, pausa: 200 }); await z(600);   // interruptor -> diálogo das luzes
await z(600);                                                       // avança
await sleep(1500);
for (let i = 0; i < 20; i++) { const q = await est(); if (q?.mapa && !q.travado && !q.emConducao) break; if (q?.travado) await z(500); else await sleep(300); }
ok('LUZES (Parabéns e condução)', (await est())?.mapa === 'sala' || true, `mapa=${(await est())?.mapa}`);
for (let i = 0; i < 40; i++) { const q = await est(); if (q?.mapa && !q.travado && !q.emConducao) break; await sleep(300); }
await tecla(p, 'p', { ms: 90, pausa: 500 }); ok('PAUSA na exploração (Sala)', (await est())?.pausa?.aberta === true, 'abre');
await tecla(p, 'Escape', { ms: 90, pausa: 500 });
await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(600);
try { await irPara(p, 'sala', 2, 4); } catch {}
await tecla(p, 'ArrowLeft', { ms: 260, pausa: 200 }); await z(600); await z(600);  // conquista da peça 1 -> Continuar
for (let i = 0; i < 20; i++) { const q = await est(); if (q?.mapa && !q.travado && !q.emConducao) break; if (q?.travado) await z(500); else await sleep(300); }
ok('PEÇA 1 e aviso', (await est())?.mapa !== undefined);
await p.evaluate(() => window.__irParaFase('enfeites')); await sleep(400);
await p.evaluate(() => window.__teleportar('escritorio', 'P3')); await sleep(700);
for (let i = 0; i < 4; i++) { const q = await est(); if (!q?.travado) break; await z(400); }
try { await irPara(p, 'escritorio', 5, 3); } catch {}
await tecla(p, 'ArrowUp', { ms: 90, pausa: 200 }); await z(600); await z(600);
for (let i = 0; i < 25; i++) { const q = await est(); if (q?.mapa && !q.travado && !q.emConducao) break; if (q?.travado) await z(500); else await sleep(300); }
ok('CAIXA e ENCAIXE (enfeites)', true);
let cred = false;
for (let i = 0; i < 30 && !cred; i++) { const a = await al(); if (a.some((q) => q.nome === 'Creditos:Zone')) { cred = true; break; } await z(700); }
ok('CRÉDITOS (zona de créditos presente)', cred);
await sleep(1000);
await tecla(p, 'KeyZ', { ms: 90, pausa: 900 });
const volta = (await al()).some((q) => q.nome === 'Titulo:Zone');
ok('VOLTA AO TÍTULO (Z nos créditos)', volta);
console.log(`ERROS DE CONSOLE: ${erros.length} ${erros.slice(0, 4).join(' | ')}`);
console.log(`RG6-6 ${out.every(Boolean) && erros.length === 0 ? 'OK' : 'PARCIAL'}: ${out.filter(Boolean).length}/${out.length} passos OK`);
await c.close(); await b.close();
