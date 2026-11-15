// OBSOLETO (rodada 14, 2026-11-08): coordenadas da planta antiga, antes da rotação (GDD 14.12.3). Não usar sem atualizar para content/maps/casa-real/*.json. Ver marco1-r13-vivo.mjs e marco1-r14-sobrinhos.mjs.
// QA Marco 1.3 ao vivo (dist-qa): condução automática (GDD 14.11). Teclas só enquanto emConducao=true,
// temporização por __estado. Capturas sem teclas durante a condução. Um por vez.
import { lancar, novoContexto, lerTextos, limparTextos, juntar, capturar } from './lib.mjs';
import { irPara, ladoDe, estado, apertarA, objeto, esperarFade } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(join(AQUI, '..', '..', 'dist-qa', 'index.html')).href;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'casa13b' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
let falhas = 0;
const reg = (id, ok, nota) => { if (!ok) falhas++; console.log(`${ok ? 'OK    ' : 'FALHOU'} ${id} ${nota}`); };
const pos = async () => { const e = await estado(page); return e ? `${e.mapa}(${e.tileX},${e.tileY}) dir=${e.direcao} cond=${e.emConducao} trav=${e.travado} fase=${e.fase}` : 'null'; };
const textos = async () => juntar(await lerTextos(page));
const pressionar = async (k, ms) => { await page.keyboard.down(k); await dormir(ms); await page.keyboard.up(k); };
const tele = async (m, s) => { await page.evaluate(([a, b]) => window.__teleportar(a, b), [m, s]); await dormir(300); };
async function fecharTudo() { for (let i = 0; i < 8; i++) { const e = await estado(page); if (!e || (!e.travado && !e.emConducao)) return; if (e.emConducao) { await dormir(100); continue; } await apertarA(page); await dormir(150); } }
async function esperarCondicao(alvo, limite = 8000) { const fim = Date.now() + limite; for (;;) { const e = await estado(page); if (e && e.emConducao === alvo) return e; if (Date.now() > fim) return e; await dormir(20); } }

// Início: título -> seleção -> introdução -> orientação -> P8 (017) -> Sala.
await page.goto(url); await dormir(2000);
await apertarA(page); await apertarA(page); await dormir(300);
for (let i = 0; i < 4; i++) await apertarA(page);
for (let i = 0; i < 2; i++) await apertarA(page);
await dormir(400);
const lado8 = ladoDe('hall', 'porta', 'P8', await estado(page));
await irPara(page, 'hall', lado8.x, lado8.y);
await pressionar('ArrowLeft', 90); await apertarA(page); await dormir(300);
for (const ch of '017') { await pressionar(ch, 80); await dormir(120); }
await pressionar('Enter', 80); await dormir(500); await fecharTudo(); await esperarFade(page);
reg('C3', (await estado(page))?.mapa === 'sala', `código 017 leva à Sala | ${await pos()}`);

// Interruptor: A acende as luzes (uma vez).
const ladoI = ladoDe('sala', 'interruptor', undefined, await estado(page));
await irPara(page, 'sala', ladoI.x, ladoI.y);
const obj = objeto('sala', 'interruptor', undefined);
const dx = Math.sign(obj.x - ladoI.x), dy = Math.sign(obj.y - ladoI.y);
await pressionar(dx === 1 ? 'ArrowRight' : dx === -1 ? 'ArrowLeft' : dy === 1 ? 'ArrowDown' : 'ArrowUp', 90);
await limparTextos(page);
await apertarA(page); await dormir(500);
// "Continuar" da conquista 1: o A seguinte, até a condução começar.
let cond = null;
for (let i = 0; i < 60 && !cond; i++) { await apertarA(page); await dormir(120); const e = await estado(page); if (e?.emConducao) cond = e; }
reg('D0', !!cond, `após "Continuar" começa a condução | ${await pos()}`);
// Captura SEM teclas, durante emConducao=true (barra e halo).
const inicioCond = Date.now();
await limparTextos(page);
await capturar(page, 'm13b-conducao-sem-teclas', 2);
const estadoCap = await estado(page);
reg('D5a', estadoCap?.emConducao === true, `captura tirada com emConducao=true | ${JSON.stringify({ c: estadoCap?.emConducao, t: [estadoCap?.tileX, estadoCap?.tileY] })}`);
const txtCond = await textos();
reg('D5b', !/Setas|Z: examinar|Z: avançar|Aguarde/.test(txtCond), `textos desenhados durante a condução sem barra (${txtCond.slice(0, 80) || 'nenhum'})`);

// D1: teclas só enquanto emConducao=true; registrar se a condução para antes do destino.
const teclas = ['ArrowLeft', 'ArrowDown', 'ArrowUp', 'z', 'x', 'Enter', 'Escape'];
let k = 0; let parou = false; const passos = [];
let ult = null; let tUlt = Date.now(); const movimentos = [];
let textoCedo = false; let textoAcum = '';
while (true) {
  const e = await estado(page);
  if (!e) break;
  if (!e.emConducao) break;
  if (!ult || e.tileX !== ult.tileX || e.tileY !== ult.tileY) { movimentos.push({ t: Date.now(), x: e.tileX, y: e.tileY }); ult = e; }
  const tl = await textos(); if (/árvore/.test(tl)) textoCedo = true; textoAcum += ' ' + tl;
  await pressionar(teclas[k % teclas.length], 80);
  k++;
  if (Date.now() - inicioCond > 20000) break;
}
const fimCond = await estado(page);
reg('D1', fimCond && fimCond.tileX === 7 && fimCond.tileY === 7 && !fimCond.emConducao, `teclas enviadas durante a condução (${k} toques) não param o trajeto; chegou em (7,7) | ${await pos()}`);

// D4b: diálogo só depois de emConducao=false
let txtFim = await textos();
for (let i = 0; i < 20 && !/árvore/.test(textoAcum + txtFim); i++) { await dormir(100); txtFim += ' ' + await textos(); }
const achouFim = /árvore/.test(textoAcum + txtFim);
reg('D4b', achouFim && !textoCedo && !!fimCond && !fimCond.emConducao, `texto da árvore só depois da chegada: aparecido durante a condução=${textoCedo}; depois=${achouFim} (texto=${(textoAcum + txtFim).slice(0, 70)})`);
await capturar(page, 'm13b-conducao-chegada', 2);

// D2: tempo por tile no trajeto (movimentos do D1 com timestamps)
const passosTot = movimentos.length - 1;
const dur = movimentos.length > 1 ? (movimentos.at(-1).t - movimentos[0].t) / 1000 : 0;
console.log(`D2 medido: ${passosTot} passos em ${dur.toFixed(2)} s (${(dur / Math.max(1, passosTot)).toFixed(3)} s/tile; normal = 0,25 s/tile, 2× = 0,125 s/tile)`);

await fecharTudo();
reg('D4c', !(await estado(page)).travado, `controle volta após o diálogo | ${await pos()}`);

// D9: acender as luzes de novo não repete a condução nem a conquista
await tele('sala', 'P8'); await dormir(200); await fecharTudo();
const ladoI2 = ladoDe('sala', 'interruptor', undefined, await estado(page));
await irPara(page, 'sala', ladoI2.x, ladoI2.y);
await pressionar(dx === 1 ? 'ArrowRight' : dx === -1 ? 'ArrowLeft' : dy === 1 ? 'ArrowDown' : 'ArrowUp', 90);
await apertarA(page); await dormir(800);
const repetiu = (await estado(page))?.emConducao === true;
reg('D9', !repetiu, `A no interruptor de novo não inicia outra condução | ${await pos()}`);

reg('ERROS', erros.length === 0, `erros de página/console: ${erros.length}`);
console.log(`TOTAL FALHAS: ${falhas}`);
await browser.close(); process.exit(falhas ? 1 : 0);
