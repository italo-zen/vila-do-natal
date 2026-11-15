// QA Marco 3 (v0.7.0), rodada 5: reação do Nick na conquista (N8), Nick dormindo na chegada (sem reação),
// fumacinha ao dormir (N9) e F7 ao vivo. Caminho real: código da P8, luzes, peça 1. Build: dist-qa.
// Variáveis: IDX (0 LoLô, 1 BiBi, 2 DanDan, 3 TuTu), WAKE (1 = acordar o Nick antes; 0 = Nick dorme na chegada).
// Uso: IDX=0 WAKE=1 node qa/scripts/marco3-r5-reacao.mjs
import { lancar, novoContexto, lerTextos, limparTextos, juntar, sleep, tecla, digitar, irAteHall, irAtePainel } from './lib.mjs';
import { irPara, estado, apertarA } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const IDX = Number(process.env.IDX ?? 0);
const WAKE = process.env.WAKE !== '0';
const CODIGO = ['017', '020', '023', '024'][IDX];
const NOME = ['LoLô', 'BiBi', 'DanDan', 'TuTu'][IDX];
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco3-r5', `${NOME}-${WAKE ? 'acordado' : 'dormindo'}`);
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const resultados = [];
const reg = (id, ok, nota) => { resultados.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`); };
const T0 = Date.now();
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'r5' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(e.message));
const est = () => estado(page);
const ver = () => page.evaluate(() => window.__textos.map((x) => x.t).join(' '));
const textos = async () => juntar(await lerTextos(page));
const press = async (k, ms = 260) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); await sleep(220); };
const fechar = async () => { for (let i = 0; i < 14; i++) { const q = await est(); if (!q?.travado) return; await tecla(page, 'z', { ms: 90, pausa: 400 }); } };
async function capturar(nome) {
  const d = await page.evaluate(() => { const c = document.querySelector('canvas'); const o = document.createElement('canvas'); o.width = c.width * 3; o.height = c.height * 3; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height); return o.toDataURL('image/png'); });
  writeFileSync(join(EVID, `${nome}.png`), Buffer.from(d.split(',')[1], 'base64'));
}

await page.goto(url);
await page.waitForSelector('canvas');
await sleep(2000);
await tecla(page, 'z'); await sleep(300); await tecla(page, 'z'); await sleep(300);
await irAteHall(page, IDX);
await sleep(800);

// Entrada na Sala pelo código
await irAtePainel(page);
await digitar(page, CODIGO);
await tecla(page, 'z');
let mapa = null;
for (let i = 0; i < 40; i++) { await sleep(200); mapa = (await est())?.mapa; if (mapa === 'sala') break; if (i === 15) await press('x', 300); }
if (mapa !== 'sala') { await fechar(); for (let i = 0; i < 20; i++) { mapa = (await est())?.mapa; if (mapa === 'sala') break; await press('ArrowUp', 400); await sleep(200); } }
await fechar();
let e = await est();
reg(`${NOME} entrada na Sala com o código ${CODIGO}`, e?.mapa === 'sala', `mapa=${e?.mapa}`);

if (WAKE) {
  let wakeDir = null;
  for (const [ax, ay, dir] of [[8, 6, 'ArrowUp'], [9, 5, 'ArrowLeft'], [8, 4, 'ArrowDown'], [7, 5, 'ArrowRight']]) {
    try { await irPara(page, 'sala', ax, ay); } catch (er) { continue; }
    await press(dir, 300);
    const q = await est();
    if (q?.tileX === ax && q?.tileY === ay) { wakeDir = dir; break; }
  }
  if (!wakeDir) console.log('AVISO: nenhum vizinho do Nick alcançado');
  await limparTextos(page);
  await apertarA(page); await sleep(1500);
  await fechar();
  await sleep(300);
  e = await est();
  reg(`${NOME} Nick acordado (pré-condição)`, e?.nick?.estado === 'acordado', `nick=${JSON.stringify(e?.nick)}`);
}

// Limpa o buffer (o "Au!" de acordar não pode contar como reação da chegada)
await limparTextos(page);
// Luzes: interruptor (5,3) de (5,4)
await irPara(page, 'sala', 5, 4).catch((er) => console.log('irPara 5,4:', er.message.slice(0, 100)));
await press('ArrowUp', 260);
for (let i = 0; i < 30; i++) { if ((await est())?.emConducao) break; await tecla(page, 'z', { ms: 90, pausa: 350 }); }
// Espera a condução terminar, guardando o buffer sem consumir
let framesFeitos = 0; let chegouT = null; let auT = null; let dialogoT = null; const t1 = Date.now(); let viuConducao = false;
while (Date.now() - t1 < 30000) {
  const q = await est();
  if (q?.emConducao) viuConducao = true;
  if (viuConducao && !q?.emConducao && chegouT === null) chegouT = Date.now();
  const b = await ver();
  if (b.includes('Au!') && auT === null && chegouT !== null) auT = Date.now();
  if (chegouT !== null && dialogoT === null && /Parabéns|Agora|árvore/.test(b.replace(/Au!/g, '')) && b.length > 0) {
    if (!/Natal na Casa/.test(b)) dialogoT = Date.now();
  }
  if (chegouT !== null && framesFeitos < 6 && Date.now() - chegouT >= framesFeitos * 400) { await capturar(`chegada-${framesFeitos}`); framesFeitos++; }
  if (chegouT !== null && Date.now() - chegouT > 2500) break;
  await sleep(30);
}
const rel = (t) => (t === null ? 'nunca' : `${t - chegouT} ms`);
if (WAKE) {
  reg(`N8 ${NOME} luzes: "Au!" na chegada`, auT !== null, `Au! em ${rel(auT)} após a chegada; diálogo em ${rel(dialogoT)}`);
  reg(`N8 ${NOME} luzes: diálogo começa sem esperar a animação (< 1600 ms)`, dialogoT !== null && dialogoT - chegouT < 1600, `diálogo em ${rel(dialogoT)}`);
} else {
  reg(`N8 ${NOME} luzes com Nick dormindo: nenhuma reação ("Au!")`, auT === null, `Au! ${rel(auT)}`);
}
// Captura em seis quadros a cada 400 ms a partir da chegada
await fechar();
await sleep(200);
// N9: fumacinha ao sair da Sala (dormir na próxima fase), captura curta logo após o controle voltar
e = await est();
if (WAKE) {
  await capturar('fumaca-0');
  await sleep(120); await capturar('fumaca-1');
  await sleep(120); await capturar('fumaca-2');
  reg(`N9 ${NOME}: Nick sai da Sala e dorme no destino (fumacinha em captura: ver fumaca-0..2)`, e?.nick?.mapa !== 'sala', `nick=${JSON.stringify(e?.nick)}`);
}

// F7 ao vivo: com a peça 1 ainda não encaixada, B na Cozinha aponta para a P7 (alvo é a Sala, nunca a peça 2)
reg(`${NOME} F7 ao vivo`, null, 'não executado nesta rodada (peça 1 já encaixada no fluxo; teste da peça escondida fica para a rodada 6)');

console.log(`\nTempo: ${((Date.now() - T0) / 1000).toFixed(0)} s`);
console.log('Erros:', erros.length ? erros : 'nenhum');
writeFileSync(join(EVID, 'resultados.json'), JSON.stringify({ resultados, erros }, null, 2));
await browser.close();
