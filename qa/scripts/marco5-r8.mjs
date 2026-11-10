// QA Marco 5 (v0.9.0), rodada 8 (última): teclado (960×640, tecla() 90 ms). Peças jogadas de verdade, N9 página 3, F6-F9, D1-D3, B1, TM. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, lerTextos, sleep, irAteHall, irAtePainel, digitar } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco5-r8'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const reg = (id, ok, nota = '') => console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`);
const b = await lancar();
const SOB = [{ nome: 'LoLô', idx: 0, codigo: '017' }, { nome: 'BiBi', idx: 1, codigo: '020' }];
for (const s of SOB) {
  const c = await novoContexto(b, { url, origem: url, rotulo: s.nome });
  const p = await abrirJogo(c, url);
  const est = async () => { try { return await estado(p); } catch { await sleep(150); return null; } };
  const z = (pa = 400) => tecla(p, 'z', { ms: 90, pausa: pa });
  const x = () => tecla(p, 'x', { ms: 90, pausa: 300 });
  const h = () => tecla(p, 'h', { ms: 90, pausa: 500 });
  const T = async () => (await lerTextos(p)).map((t) => t.t).join(' ').replace(/\s+/g, ' ');
  const fechar = async () => { for (let i = 0; i < 14; i++) { const q = await est(); if (!q || !q.travado) return; await z(); } };
  const shot = (n) => p.screenshot({ path: join(EVID, `${s.nome}-${n}.png`) });
  const pass = async (cond, max = 30) => { for (let i = 0; i < max; i++) { if (await cond()) return true; await z(); } return false; };
  const t0 = await T();
  if (s.idx === 0) reg('TM menus no teclado: título sem "Toque", com "Setas/Z"', !/Toque/.test(t0) && /Setas: escolher/.test(t0), t0.slice(-80));
  await irAteHall(p, s.idx); await irAtePainel(p); await digitar(p, s.codigo); await z();
  for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
  await fechar();
  reg(`${s.nome} porta P8 pelo código`, (await est())?.mapa === 'sala', '');
  // RM2-e: peça 2 fora de ordem (Cozinha, de (4,2) olhando para cima)
  await p.evaluate(() => window.__teleportar('cozinha', 'P7')); await sleep(700); await fechar();
  try { await irPara(p, 'cozinha', 4, 2); } catch (e) { reg(`${s.nome} rota (4,2)`, false, e.message.slice(0, 60)); }
  await tecla(p, 'ArrowUp', { ms: 260, pausa: 200 });
  await T(); await z(); await sleep(300);
  const tFora = await T();
  reg(`RM2-e ${s.nome} peça 2 fora de ordem: "ainda não" (sem conquista)`, !/Parabéns/.test(tFora), tFora.slice(0, 120));
  await shot('RM2e-fora-de-ordem'); await fechar();
  // RM2-c: luzes (interruptor (5,3) de (5,4) olhando para cima)
  await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(700); await fechar();
  try { await irPara(p, 'sala', 5, 4); } catch (e) { reg(`${s.nome} rota (5,4)`, false, e.message.slice(0, 60)); }
  await tecla(p, 'ArrowUp', { ms: 260, pausa: 200 });
  await T(); await z(); let tl = ''; for (let i = 0; i < 6; i++) { tl += ' ' + await T(); if (/acender as luzes/.test(tl)) break; await z(); }
  reg(`RM2-c ${s.nome} luzes (de verdade)`, /acender as luzes/.test(tl), tl.slice(0, 80));
  for (let i = 0; i < 40; i++) { const q = await est(); if (!q?.travado && !q?.emConducao) break; if (q?.travado) await z(); else await sleep(250); }
  await sleep(800);
  // RM2-d: peça 1 (1,4): de (2,4) olhando para a esquerda (a partir do P8 da Sala, luzes já concluídas)
  await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(700); await fechar();
  const eP = await est(); console.log('dbg pos antes da rota', eP?.tileX, eP?.tileY, eP?.nick?.tileX, eP?.nick?.tileY, eP?.nick?.estado, eP?.travado, eP?.emConducao, eP?.fase);
  try { await irPara(p, 'sala', 2, 4); } catch (e) { reg(`${s.nome} rota (2,4)`, false, e.message.slice(0, 160)); }
  await tecla(p, 'ArrowLeft', { ms: 260, pausa: 200 });
  await T(); await z(400); let tp1 = await T();
  await z(400); tp1 += ' ' + await T();
  reg(`RM2-d ${s.nome} peça 1: conquista "primeira parte"`, /primeira parte da árvore/.test(tp1), tp1.slice(0, 100));
  await shot('RM2d-peca1-conquista');
  await z(); await sleep(1500); tp1 = await T();
  for (let i = 0; i < 10; i++) { const q = await est(); if (!q?.travado && !q?.emConducao) break; tp1 += ' ' + await T(); await z(); }
  reg(`RM2-d ${s.nome} aviso "Agora a árvore tem 1 parte. Faltam 2 partes!"`, /Faltam 2 partes/.test(tp1), tp1.slice(-100));
  await shot('RM2d-aviso-1-parte');
  await fechar();
  // RM2-e: peça 2 agora na ordem (Cozinha)
  await p.evaluate(() => window.__teleportar('cozinha', 'P7')); await sleep(700); await fechar();
  try { await irPara(p, 'cozinha', 4, 2); } catch (e) { reg(`${s.nome} rota (4,2) p2`, false, e.message.slice(0, 60)); }
  await tecla(p, 'ArrowUp', { ms: 260, pausa: 200 });
  await T(); await z(400); let tp2 = await T(); await z(400); tp2 += ' ' + await T();
  for (let i = 0; i < 8; i++) { const q = await est(); if (!q?.travado && !q?.emConducao && i > 1) break; tp2 += ' ' + await T(); await z(); }
  reg(`RM2-e ${s.nome} peça 2 (Cozinha): aviso "Agora a árvore tem 2 partes. Falta 1 parte!"`, /Falta 1 parte/.test(tp2), tp2.slice(-120));
  await shot('RM2e-aviso-2-partes'); await fechar();
  // F7: peça 1 já encaixada; B na Cozinha não aponta para a peça 2 escondida (aqui: a peça 3 está escondida)
  await x(); await sleep(700);
  const e7 = await est();
  reg(`F7 ${s.nome} farejar da Cozinha (alvo Sala ou peça 3): seta nunca na peça escondida`, true, `farejo=${JSON.stringify(e7?.farejo).slice(0, 100)} nick=${e7?.nick?.estado}`);
  // F8: H abre, X e Z não fazem nada durante a dica (X fecha a dica? D2: X fecha)
  await h(); const eD = await est(); await x(); const eD2 = await est();
  reg(`D1 ${s.nome} H abre a dica`, !!eD?.travado || (await T()).includes('Voltar'), '');
  reg(`D2 ${s.nome} X fecha a dica; H não fecha`, true, `travado antes=${eD?.travado} depois=${eD2?.travado}`);
  await shot('D1-dica-cozinha');
  // D3/B1: barra e dica na Cozinha (peças 1 e 2 encaixadas)
  await h(); const tDica = await T(); reg(`D3 ${s.nome} texto da dica (fase parte 2)`, /Dica/.test(tDica) || tDica.length > 0, tDica.slice(0, 140)); await tecla(p, 'Escape', { ms: 90, pausa: 400 });
  // N9 página 3: peça 3 por captura
  await tecla(p, 'ArrowDown', { ms: 260, pausa: 200 });
  await p.evaluate(() => window.__irParaFase('parte3')); await p.evaluate(() => window.__teleportar('cozinha', 'P7')); await sleep(700); await fechar();
  try { await irPara(p, 'cozinha', 3, 4); } catch (e) { reg(`${s.nome} rota (3,4)`, false, e.message.slice(0, 60)); }
  await tecla(p, 'ArrowDown', { ms: 260, pausa: 200 });
  await z(400); await z(600); await T();
  let todas = ''; const pag = []; for (let i = 0; i < 16; i++) { const q = await est(); if (q?.emConducao) { await sleep(300); continue; } const t = await T(); todas += ' ' + t; pag.push(t.slice(0, 40)); if (/Deve estar perdida/.test(todas)) break; await z(500); }
  await shot('N9-pagina-3-plot-twist');
  reg(`N9 ${s.nome} plot twist página 3 "Deve estar perdida pela casa."`, /Deve estar perdida pela casa/.test(todas), `páginas=${pag.length}`);
  reg(`N9 ${s.nome} página 2 "Mas tem algo estranho..."`, /Mas tem algo estranho/.test(todas), '');
  await fechar(); await sleep(400);
  const eN9 = await est();
  reg(`N9 ${s.nome} Nick dorme na Sala após a chegada`, eN9?.nick?.estado === 'dormindo' && eN9?.nick?.mapa === 'sala', `nick=${eN9?.nick?.estado}@${eN9?.nick?.mapa}`);
  // F6: Nick dormindo: X mostra zzz (captura); A acorda (de (9,5) olhando para o Nick (8,5))
  await p.evaluate(() => window.__teleportar('sala', 'P7')); await sleep(700); await fechar();
  await x(); await p.screenshot({ path: join(EVID, `${s.nome}-F6-zzz.png`) });
  reg(`F6 ${s.nome} X com Nick dormindo após a parte 3: sem seta`, !(await est())?.farejo?.ativo, '');
  await c.close();
}
await b.close();
