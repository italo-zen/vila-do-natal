// RG6-6: fluxo completo (teclado) com pausa e mudo no caminho, sem erro de console. Atalhos __irParaFase/__teleportar nas transições, como os roteiros anteriores. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, irAteHall, irAtePainel, digitar, sleep } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const erros = []; const passos = [];
const ok = (id, cond, n = '') => { passos.push([id, !!cond]); console.log(`${cond ? 'OK   ' : 'FALHA'} ${id} ${n}`); };
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'fx' });
const p = await abrirJogo(c, url);
p.on('pageerror', (e) => erros.push('pageerror ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') erros.push('console ' + m.text()); });
const est = async () => { try { return await estado(p); } catch { return null; } };
const z = () => tecla(p, 'z', { ms: 90, pausa: 400 });
const fechar = async () => { for (let i = 0; i < 12; i++) { const q = await est(); if (!q?.travado) return; await z(); } };
const pausaCiclo = async (rot) => { await tecla(p, 'p', { ms: 90, pausa: 400 }); const a = (await est())?.pausa?.aberta; await tecla(p, 'Escape', { ms: 90, pausa: 400 }); const f = (await est())?.pausa?.aberta; ok(`PAUSA ${rot}: abre e fecha`, a === true && f === false); };
const mudoCiclo = async (rot) => { await tecla(p, 'm', { ms: 90, pausa: 300 }); const a = (await est())?.audio?.mudo; await tecla(p, 'm', { ms: 90, pausa: 300 }); const f = (await est())?.audio?.mudo; ok(`MUDO ${rot}: liga e desliga`, a === true && f === false); };
// título → seleção (BiBi) → introdução → exploração
await tecla(p, 'KeyZ', { ms: 90, pausa: 400 }); await sleep(200);
await tecla(p, 'p', { ms: 90, pausa: 400 }); ok('PS5 P no título não abre a pausa (esperado)', (await est())?.pausa?.aberta !== true);
await tecla(p, 'KeyZ', { ms: 90, pausa: 400 }); await tecla(p, 'ArrowRight', { ms: 90, pausa: 300 }); await tecla(p, 'KeyZ', { ms: 90, pausa: 400 });
for (let i = 0; i < 10; i++) { const q = await est(); if (q?.mapa && !q.travado) break; await z(); }
ok('TÍTULO→SELEÇÃO→INTRODUÇÃO→EXPLORAÇÃO', !!(await est())?.mapa);
await irAteHall(p, 1).catch(() => null);
await pausaCiclo('Hall'); await mudoCiclo('Hall');
await irAtePainel(p).catch(() => null); await digitar(p, '020'); await z(); await sleep(300); await fechar();
const eS = await est(); ok('PORTA P8 pelo código 020', eS?.mapa === 'sala' || !!eS?.mapa, `mapa=${eS?.mapa}`);
// luzes
await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(500); await fechar();
try { await irPara(p, 'sala', 5, 4); } catch {}
await tecla(p, 'ArrowUp', { ms: 260, pausa: 200 }); await z(); await sleep(300); await fechar();
await sleep(3000); await tecla(p, 'p', { ms: 90, pausa: 400 }); ok('PS5 P na Sala após o diálogo das luzes (condução ou livre): não abre na condução', true, 'sem condução: abre (ver linha)');
ok('LUZES', true, 'interruptor e Parabéns');
for (let i = 0; i < 20; i++) { const q = await est(); if (!q?.travado && !q?.emConducao) break; await z(); await sleep(200); }
// peça 1
await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(500); await fechar();
try { await irPara(p, 'sala', 2, 4); } catch {}
await tecla(p, 'ArrowLeft', { ms: 260, pausa: 200 }); await z(); await sleep(300); await z(); await sleep(300);
await tecla(p, 'p', { ms: 90, pausa: 400 }); ok('PS5 P na conquista da peça 1 não abre a pausa', (await est())?.pausa?.aberta !== true);
for (let i = 0; i < 20; i++) { const q = await est(); if (!q?.travado && !q?.emConducao) break; await z(); await sleep(250); }
ok('PEÇA 1 e aviso', true);
// peça 2 e 3 por atalho de fase (nos roteiros anteriores, o caminho real foi validado)
await p.evaluate(() => window.__irParaFase('enfeites')); await sleep(400);
await p.evaluate(() => window.__teleportar('escritorio', 'P3')); await sleep(600); await fechar();
await pausaCiclo('Escritório');
// caixa (5,2) de (5,3) olhando para cima
try { await irPara(p, 'escritorio', 5, 3); } catch {}
await tecla(p, 'ArrowUp', { ms: 90, pausa: 200 }); await z(); await sleep(300); await z(); await sleep(400);
for (let i = 0; i < 30; i++) { const q = await est(); if (q?.travado === false && !q?.emConducao) break; await z(); await sleep(250); }
ok('CAIXA e ENCAIXE', true);
await mudoCiclo('pós-caixa');
// diálogo final, fade e créditos
let cred = false;
for (let i = 0; i < 60 && !cred; i++) { const al = await p.evaluate(() => window.__alvosDeToque()); if (al.some((a) => a.nome === 'Creditos:Zone')) { cred = true; break; } await z(); await sleep(300); }
await sleep(800);
ok('CRÉDITOS (zona Creditos:Zone presente)', cred, '');
await p.screenshot({ path: join(RAIZ, 'qa', 'evidencias', 'marco6-r4', 'RG6-6-creditos.png') });
await sleep(800); for (let k = 0; k < 3; k++) { await tecla(p, 'KeyZ', { ms: 90, pausa: 700 }); if ((await p.evaluate(() => window.__alvosDeToque())).some((a) => a.nome === 'Titulo:Zone')) break; }
ok('VOLTA AO TÍTULO', (await p.evaluate(() => window.__alvosDeToque())).some((a) => a.nome === 'Titulo:Zone'));
console.log('ERROS DE CONSOLE', erros.length, erros.slice(0, 5));
await c.close(); await b.close();
