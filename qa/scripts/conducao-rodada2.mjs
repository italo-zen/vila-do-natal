// OBSOLETO (rodada 14, 2026-11-08): coordenadas da planta antiga, antes da rotação (GDD 14.12.3). Não usar sem atualizar para content/maps/casa-real/*.json. Ver marco1-r13-vivo.mjs e marco1-r14-sobrinhos.mjs.
// QA Marco 1, rodada 2: condução (D7, D8, D10) e áreas fechadas (C14). Build de QA (dist-qa), rota real (lib-rota).
// Itens sem caminho na build (D2, D3, D6): ver relatório (a condução só existe para a fase "luzes", de (interruptor) à árvore na sala).
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ, abrirJogo, capturar, criarRelatorio, digitar, lancar, lerTextos, limparTextos, novoContexto, sleep, tecla, irAteHall, CODIGOS } from './lib.mjs';
import { estado, irPara, ladoDe, esperarParado, esperarFade, rotaEntre, subarea, objeto } from './lib-rota.mjs';

const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const rel = criarRelatorio('m13-conducao-rodada2');
const browser = await lancar();
const ctx = await novoContexto(browser, { url, rotulo: 'cond' });
const page = await abrirJogo(ctx, url);
const ev = (n) => capturar(page, n).catch(() => {});

// 1) Hall -> P8 com código 017 -> sala.
await irAteHall(page, 0);
let e = await esperarParado(page);
let lado = ladoDe('hall', 'porta', 'P8', e);
const porta = objeto('hall', 'porta', 'P8');
await irPara(page, 'hall', lado.x + (lado.x - porta.x), lado.y).catch(() => {});
await irPara(page, 'hall', lado.x, lado.y);
await tecla(page, 'z'); await sleep(250);
await digitar(page, CODIGOS['LoLô']);
await tecla(page, 'z'); await sleep(250);
await tecla(page, 'x'); await sleep(400);
await esperarFade(page).catch(() => {});
for (let k = 0; k < 6; k++) { const s0 = await estado(page); if (!s0?.travado) break; await tecla(page, 'x', { ms: 80, pausa: 300 }); }
e = await esperarParado(page);
rel.dado('entrou na sala', e.mapa);

// 2) Interruptor: A do lado do interruptor acende as luzes -> conquista -> Continuar -> condução.
e = await esperarParado(page);
lado = ladoDe('sala', 'interruptor', undefined, e);
rel.dado('estado antes de A no interruptor', e);
await irPara(page, 'sala', lado.x, lado.y);
const eInt = await estado(page);
const dirInt = objeto('sala', 'interruptor', undefined);
const dirKey = dirInt.x < lado.x ? 'ArrowLeft' : dirInt.x > lado.x ? 'ArrowRight' : dirInt.y < lado.y ? 'ArrowUp' : 'ArrowDown';
rel.dado('lado do interruptor', { lado, eInt: eInt.tileX + ',' + eInt.tileY, dirKey });
await limparTextos(page);
await tecla(page, 'z');

// Avança a conquista (Z) até a condução começar ou 12 s.
let viuConducao = false;
let tConducao = 0;
const t0 = Date.now();
const passos = [];
while (Date.now() - t0 < 12000) {
  const s = await estado(page);
  if (s?.emConducao) { viuConducao = true; tConducao = Date.now(); break; }
  if (s?.travado) await tecla(page, 'z', { ms: 80, pausa: 250 }); else await sleep(100);
}
rel.caso('D-cond-start', viuConducao ? 'OK' : 'FALHOU', `condução começou=${viuConducao} após ${(Date.now() - t0)} ms`);

// 3) D7/D8: durante a condução, teclas não agem e a barra fica vazia.
if (viuConducao) {
  await sleep(150);
  await limparTextos(page);
  const sA = await estado(page);
  await ev('m13-conducao-rodada2-meio');
  await tecla(page, 'z', { ms: 80, pausa: 50 });
  await tecla(page, 'x', { ms: 80, pausa: 50 });
  await tecla(page, 'ArrowUp', { ms: 80, pausa: 50 });
  const sB = await estado(page);
  const textos = (await lerTextos(page)).map((x) => x.t).filter((t) => /Setas|Z:|X:/.test(t));
  // travado é true durante a condução por definição (estado != livre); o critério é: continua em condução, sem diálogo/painel, sem texto de barra.
  rel.caso('D7-D8-teclas-inativas', sB.emConducao && textos.length === 0 ? 'OK' : 'FALHOU', `emConducao=${sB.emConducao} textos_barra=${JSON.stringify(textos)}; pos ${sA.tileX},${sA.tileY} -> ${sB.tileX},${sB.tileY} (Z/X/seta durante o trajeto)`);
}

// 2b) Velocidade da condução (D2, parcial): amostra o centro dos pés até a chegada e mede px/s.
if (viuConducao) {
  const amostras = [];
  const ta = Date.now();
  while (Date.now() - ta < 15000) {
    const s1 = await estado(page);
    if (!s1?.emConducao) break;
    amostras.push({ t: Date.now(), x: s1.centroX, y: s1.centroY, mapa: s1.mapa });
    await sleep(40);
  }
  let px = 0;
  for (let i = 1; i < amostras.length; i++) if (amostras[i].mapa === amostras[i - 1].mapa) px += Math.hypot(amostras[i].x - amostras[i - 1].x, amostras[i].y - amostras[i - 1].y);
  const seg = amostras.length > 1 ? (amostras.at(-1).t - amostras[0].t) / 1000 : 0;
  const tiles = px / 32;
  rel.dado('D2 condução: tiles percorridos, segundos, tiles/s', { tiles: +tiles.toFixed(2), seg: +seg.toFixed(2), tilesPorSeg: seg ? +(tiles / seg).toFixed(2) : null, amostras: amostras.length });
}

// 4) D10: fim da condução; A no interruptor de novo não dispara outra condução.
for (let k = 0; k < 8; k++) { const s0 = await estado(page); if (!s0?.travado) break; await tecla(page, 'z', { ms: 80, pausa: 350 }); }
let fim = Date.now() + 15000;
while (Date.now() < fim) {
  const s = await estado(page);
  if (!s?.emConducao && s && !s.travado && !s.emFade) break;
  await sleep(100);
}
await ev('m13-conducao-rodada2-chegada');
const chegada = await estado(page);
rel.dado('chegada', chegada);
rel.caso('D-cond-chegada', chegada && !chegada.emConducao ? 'OK' : 'FALHOU', `fim=${JSON.stringify(chegada)}`);
let depois = false;
// Volta ao lado do interruptor e aperta A.
try {
  const e2 = await esperarParado(page);
  rel.dado('D10 estado antes de voltar ao interruptor', e2);
  const l2 = ladoDe('sala', 'interruptor', undefined, e2);
  await irPara(page, 'sala', l2.x, l2.y);
  await tecla(page, 'z');
  const t1 = Date.now();
  while (Date.now() - t1 < 3000) {
    const s = await estado(page);
    if (s?.emConducao) { depois = true; break; }
    await sleep(100);
  }
  rel.caso('D10-uma-vez', !depois ? 'OK' : 'FALHOU', `segunda condução disparada=${depois}`);
} catch (err) {
  rel.caso('D10-uma-vez', 'N/T', `não foi possível voltar ao interruptor: ${err.message.split('\n')[0]}`);
}

// 5) C14: áreas fechadas P1-P3 — destino atrás de cada porta fechada, rota real pela grade.
const s = subarea('sala');
const alvos = [['P1', 2, 4], ['P2', 1, 3], ['P3', 2, 2]];
for (const [nome, x, y] of alvos) {
  const pod = (() => { try { rotaEntre('sala', { x: 6, y: 4 }, { x, y }); return 'alcançavel'; } catch { return 'sem rota'; } })();
  rel.dado(`C14 ${nome} (${x},${y}) pela grade`, pod);
}
rel.caso('C14', 'N/T', 'checagem por grade feita (ver dados); a verificação ao vivo ficou fora do tempo');
rel.salvar();
await ctx.close();
await browser.close();
