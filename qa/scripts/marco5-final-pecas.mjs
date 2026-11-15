// Rodada final: RM2-d (aviso da peça 1) e RM2-e (aviso da peça 2) jogados de verdade no teclado, com luzes pelo teclado. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, lerTextos, sleep, irAteHall, irAtePainel, digitar } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco5-final'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const reg = (id, ok, nota = '') => console.log(`${ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`);
const b = await lancar();
for (const s of [{ nome: 'LoLô', idx: 0, codigo: '017' }, { nome: 'BiBi', idx: 1, codigo: '020' }]) {
  const c = await novoContexto(b, { url, origem: url, rotulo: s.nome });
  const p = await abrirJogo(c, url);
  const est = async () => { try { return await estado(p); } catch { return null; } };
  const z = (pa = 400) => tecla(p, 'z', { ms: 90, pausa: pa });
  const T = async () => (await lerTextos(p)).map((t) => t.t).join(' ').replace(/\s+/g, ' ');
  const fechar = async () => { for (let i = 0; i < 14; i++) { const q = await est(); if (!q || !q.travado) return; await z(); } };
  const pronto = async () => { for (let i = 0; i < 40; i++) { const q = await est(); if (q && !q.travado && !q.emConducao) return q; await sleep(250); } return await est(); };
  await irAteHall(p, s.idx); await irAtePainel(p); await digitar(p, s.codigo); await z();
  for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
  await fechar();
  // luzes pelo teclado (interruptor (5,3), de (5,4) olhando para cima)
  await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(600); await fechar();
  try { await irPara(p, 'sala', 5, 4); } catch (e) { console.log('rota luzes', e.message.slice(0, 80)); }
  await tecla(p, 'ArrowUp', { ms: 260, pausa: 200 });
  await T(); await z(); let tl = ''; for (let i = 0; i < 6; i++) { tl += ' ' + await T(); if (/acender as luzes/.test(tl)) break; await z(); }
  reg(`RM2-c ${s.nome} luzes`, /acender as luzes/.test(tl), '');
  await z(600); // Continuar da conquista das luzes -> condução automática
  await p.screenshot({ path: join(EVID, `${s.nome}-dbg-pos-luzes.png`) });
  console.log('dbg foco', JSON.stringify(await p.evaluate(() => window.__focoDoMenu?.() ?? null)), 'estado', JSON.stringify(await est()).slice(0, 120));
  // condução automática até a árvore, depois a sala livre
  for (let i = 0; i < 60; i++) { const q = await est(); if (q && !q.travado && !q.emConducao) break; if (q?.travado) await z(); else await sleep(250); }
  await sleep(600);
  // RM2-d: peça 1 de (2,4) olhando para a esquerda
  let q = await est(); console.log('dbg antes da rota p1', q?.mapa, q?.tileX, q?.tileY, q?.travado, q?.emConducao, q?.fase);
  await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(600); await fechar();
  q = await est(); console.log('dbg pós-teleport', q?.mapa, q?.tileX, q?.tileY, q?.travado, q?.fase);
  try { await irPara(p, 'sala', 2, 4); } catch (e) { console.log('rota p1', e.message.slice(0, 120)); }
  await tecla(p, 'ArrowLeft', { ms: 260, pausa: 200 });
  await T(); await z(400); let t1 = await T(); await z(400); t1 += ' ' + await T();
  reg(`RM2-d ${s.nome} conquista da peça 1`, /primeira parte/.test(t1), t1.slice(0, 80));
  await p.screenshot({ path: join(EVID, `${s.nome}-RM2d-conquista-p1.png`) });
  await T(); await tecla(p, 'x', { ms: 90, pausa: 400 }); const tX = await T();
  reg(`F8 ${s.nome} X na conquista da peça 1: sem Au!/farejar (texto)`, !/Au!|farejando|zzz/.test(tX), tX.slice(0, 80));
  await T(); await z(400);
  let t1b = ''; for (let i = 0; i < 12; i++) { const qq = await est(); if (qq && !qq.travado && !qq.emConducao && i > 3) break; t1b += ' ' + await T(); await z(350); }
  reg(`RM2-d ${s.nome} aviso "Agora a árvore tem 1 parte. Faltam 2 partes!"`, /Faltam 2 partes/.test(t1b), t1b.slice(-100));
  await p.screenshot({ path: join(EVID, `${s.nome}-RM2d-aviso-1-parte.png`) });
  await fechar();
  // RM2-e: peça 2 (Cozinha (4,1) de (4,2) olhando para cima)
  await p.evaluate(() => window.__teleportar('cozinha', 'P7')); await sleep(600); await fechar();
  try { await irPara(p, 'cozinha', 3, 1); } catch (e) { console.log('rota p2', e.message.slice(0, 120)); }
  await tecla(p, 'ArrowRight', { ms: 260, pausa: 200 });
  await T(); await z(400); let t2 = await T(); await z(400); t2 += ' ' + await T();
  for (let i = 0; i < 12; i++) { const qq = await est(); if (qq && !qq.travado && !qq.emConducao && i > 3) break; t2 += ' ' + await T(); await z(350); }
  reg(`RM2-e ${s.nome} aviso da peça 2 "Agora a árvore tem 2 partes. Falta 1 parte!"`, /Falta 1 parte/.test(t2), t2.slice(-110));
  await p.screenshot({ path: join(EVID, `${s.nome}-RM2e-aviso-2-partes.png`) });
  await fechar();
  // F9 com a seta visível: andar sobre o gatilho (P8 na Sala, alvo peça 2 na Cozinha): ver seta e atravessar
  await c.close();
}
await b.close();
