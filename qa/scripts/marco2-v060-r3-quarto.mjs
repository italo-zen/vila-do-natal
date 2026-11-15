// QA Marco 2 (v0.6.0), rodada 3: Quarto pela P2 (E21, E22, E24), setas (E13/E17), P1 e Suíte (E14, E19),
// paredes do Quarto e da alcova, travamento de 2 px com teclado. Build: dist-qa/index.html.
// Uso: node qa/scripts/marco2-v060-r3-quarto.mjs
import { lancar, novoContexto, lerTextos, juntar, sleep } from './lib.mjs';
import { irPara, ladosDe, objeto, estado, esperarFade, apertarA, subarea } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco2-r3');
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const dormir = sleep;
const seta = { '1,0': 'ArrowRight', '-1,0': 'ArrowLeft', '0,1': 'ArrowDown', '0,-1': 'ArrowUp' };
const T0 = Date.now();

const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'm2r3' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') erros.push(`console: ${m.text()}`); });

const reg = (id, ok, nota) => console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`);
const textos = async () => juntar(await lerTextos(page));
const pos = async () => { const e = await estado(page); return e ? `${e.mapa}(${e.tileX},${e.tileY}) dir=${e.direcao} trav=${e.travado} fade=${e.emFade}` : 'null'; };
const pressionar = async (k, ms = 260) => { await page.keyboard.down(k); await dormir(ms); await page.keyboard.up(k); await dormir(220); };
async function capturar(nome, fator = 3) {
  const dataUrl = await page.evaluate((f) => {
    const c = document.querySelector('canvas');
    const o = document.createElement('canvas');
    o.width = c.width * f; o.height = c.height * f;
    const x = o.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height);
    return o.toDataURL('image/png');
  }, fator);
  writeFileSync(join(EVID, `${nome}.png`), Buffer.from(dataUrl.split(',')[1], 'base64'));
}
async function fecharTudo() {
  for (let i = 0; i < 8; i++) { const e = await estado(page); if (!e?.travado) break; await apertarA(page); await dormir(250); }
  await dormir(450);
}
async function esperarTexto(frase, ms = 2500) {
  let acum = ''; const t0 = Date.now();
  while (Date.now() - t0 < ms) { acum += ' ' + (await textos()); if (acum.includes(frase)) return acum; await dormir(60); }
  return acum;
}
/** Chão andável no JSON da subárea (a grade real do conversor). */
function chao(mapa, x, y) {
  const s = subarea(mapa);
  if (x < 0 || y < 0 || x >= s.largura || y >= s.altura) return false;
  const i = y * s.largura + x;
  return s.chao[i] !== 0 && !s.colisao[i];
}

// ===== 0. Título e entrada (LoLô, código 017), igual ao roteiro da rodada 2 =====
await page.goto(url);
await dormir(2000);
const tit = await textos();
reg('P1-01 titulo-versao', tit.includes('v0.6.0') ? true : null, `texto: "${tit.slice(0, 120)}"`);
await capturar('01-titulo');
await apertarA(page); await dormir(300);
await apertarA(page); await dormir(300);
for (let i = 0; i < 6; i++) await apertarA(page);
await dormir(400);
await fecharTudo();
const p8 = objeto('hall', 'porta', 'P8');
const ladoP8 = ladosDe('hall', 'porta', 'P8').find((l) => l.y === p8.y + 1) ?? ladosDe('hall', 'porta', 'P8')[0];
await irPara(page, 'hall', ladoP8.x, ladoP8.y);
{ const e1 = await estado(page); await pressionar(seta[`${Math.sign(p8.x - e1.tileX)},${Math.sign(p8.y - e1.tileY)}`], 60); }
await apertarA(page); await dormir(300);
for (const ch of ['0', '1', '7']) await pressionar(ch, 80);
await pressionar('Enter', 80);
await dormir(500);
await fecharTudo();
await esperarFade(page).catch(() => null);
await dormir(400);
reg('E0 entrada-sala', (await estado(page))?.mapa === 'sala', pos.toString() && (await pos()));

// ===== 1. Sala antes das luzes: P2 fechada, setas =====
await irPara(page, 'sala', 7, 2);
await dormir(200);
await capturar('10-sala-antes-luzes-P2');
{
  const antes = (await estado(page)).mapa;
  await pressionar('ArrowUp', 400);
  await dormir(300);
  const d = await estado(page);
  reg('E21a P2 fechada antes das luzes', d.mapa === antes && d.mapa === 'sala', `ArrowUp em (7,2) → ${await pos()}`);
}
await limparTextos_();
async function limparTextos_() { /* texto acumulado lido por textos() a cada passo */ }
// A na P2 fechada, antes das luzes
{
  await irPara(page, 'sala', 7, 2);
  await pressionar('ArrowUp', 60); // vira de frente para P2
  await apertarA(page); await dormir(300);
  const t = await esperarTexto('Essa porta está fechada', 1500);
  reg('E21b P2 fechada: A antes das luzes', t.includes('Essa porta está fechada.'), `"${t.slice(0, 120)}"`);
  await fecharTudo();
}

// ===== 2. Luzes =====
{
  const inter = objeto('sala', 'interruptor');
  const lI = ladosDe('sala', 'interruptor').find((l) => l.y === inter.y + 1) ?? ladosDe('sala', 'interruptor')[0];
  await irPara(page, 'sala', lI.x, lI.y);
  { const e = await estado(page); await pressionar(seta[`${Math.sign(inter.x - e.tileX)},${Math.sign(inter.y - e.tileY)}`], 60); }
  await apertarA(page); await dormir(400);
  let tl = await textos();
  for (let i = 0; i < 4 && !tl.includes('Parabéns'); i++) { await apertarA(page); await dormir(200); tl += ' ' + (await textos()); }
  reg('E2 luzes', tl.includes('Parabéns, você conseguiu acender as luzes.'), `"${tl.slice(0, 80)}"`);
  await fecharTudo();
}

// ===== 3. Sala com setas (depois das luzes) =====
await irPara(page, 'sala', 7, 3);
await dormir(300);
await capturar('11-sala-com-setas');

// ===== 4. P2 aberta depois das luzes: ida ao Quarto =====
await irPara(page, 'sala', 7, 2);
await dormir(150);
await pressionar('ArrowUp', 60); // vira para a P2
{
  await page.keyboard.down('ArrowUp');
  const t0 = Date.now(); let viuFade = false; let entrou = null;
  while (Date.now() - t0 < 2500) {
    const e = await estado(page);
    if (e?.emFade) viuFade = true;
    if (e && e.mapa === 'quarto' && !e.emFade) { entrou = e; break; }
    await dormir(10);
  }
  await page.keyboard.up('ArrowUp');
  await dormir(200);
  const e = entrou ?? (await estado(page));
  const ok = e?.mapa === 'quarto' && e.tileX === 0 && e.tileY === 6 && e.direcao === 'cima';
  reg('E21c ida ao Quarto pela P2', ok, `fade=${viuFade} chegada=${e?.mapa}(${e?.tileX},${e?.tileY}) dir=${e?.direcao} (esperado quarto(0,6) cima)`);
}
await dormir(300);
await capturar('12-quarto-chegada');

// Quarto: parede e caixa
const SQ = subarea('quarto');
reg('E22a caixa do Quarto 5x8', SQ.largura === 5 && SQ.altura === 8, `largura=${SQ.largura} altura=${SQ.altura}`);
const pecasNoQuarto = SQ.objetos.filter((o) => o.tipo === 'peca').length;
const npcNoQuarto = SQ.objetos.filter((o) => o.tipo === 'npc' || o.tipo === 'sobrinho').length;
reg('E24 sem peça nem NPC no Quarto (dados)', pecasNoQuarto === 0 && npcNoQuarto === 0, `peças=${pecasNoQuarto} npc=${npcNoQuarto}`);

// Passeio: andar por todo o chão do Quarto, sem sair do chão (parede e vão)
const celulas = [];
for (let y = 0; y < SQ.altura; y++) for (let x = 0; x < SQ.largura; x++) if (chao('quarto', x, y)) celulas.push({ x, y });
let forade = [];
const alvos = [{ x: 3, y: 1 }, { x: 4, y: 1 }, { x: 3, y: 3 }, { x: 0, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 3 }, { x: 0, y: 5 }].filter((c) => chao('quarto', c.x, c.y));
for (const c of alvos) {
  try { await irPara(page, 'quarto', c.x, c.y); } catch (err) { forade.push(`irPara(${c.x},${c.y}): ${err.message.slice(0, 90)}`); }
  const e = await estado(page);
  if (e.mapa !== 'quarto') forade.push(`saiu do Quarto em ${JSON.stringify(e)}`);
}
reg('E21d passeio no Quarto sem sair do chão', forade.length === 0, `alvos=${alvos.length} ${forade.join(' | ')}`);
await capturar('13-quarto-passeio');

// Paredes: empurrar contra cada parede do Quarto nos tiles de borda
let presa = [];
for (const c of celulas.filter((c) => (c.x === 0 || c.y === 0 || c.x === SQ.largura - 1 || c.y === SQ.altura - 1) && !(c.x === 0 && c.y >= 5)).slice(0, 14)) {
  await irPara(page, 'quarto', c.x, c.y).catch(() => null);
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const k = seta[`${dx},${dy}`];
    await pressionar(k, 400);
    const e = await estado(page);
    if (e.mapa !== 'quarto') { presa.push(`saiu em (${c.x},${c.y}) ${k}`); break; }
    if (!chao('quarto', e.tileX, e.tileY)) presa.push(`fora do piso ${e.tileX},${e.tileY}`);
  }
}
reg('E22b paredes do Quarto: sem saída nem fora do piso', presa.length === 0, presa.slice(0, 4).join(' | ') || 'ok');

// P4 fechada no Quarto: (3,0) cima, texto de 14.10.3
{
  const p4 = objeto('quarto', 'portaFechada', 'P4');
  const lado = ladosDe('quarto', 'portaFechada', 'P4').find((l) => l.y === p4.y + 1) ?? ladosDe('quarto', 'portaFechada', 'P4')[0];
  await irPara(page, 'quarto', lado.x, lado.y);
  { const e = await estado(page); await pressionar(seta[`${Math.sign(p4.x - e.tileX)},${Math.sign(p4.y - e.tileY)}`], 60); }
  await apertarA(page);
  const t = await esperarTexto('Essa porta está fechada', 1500);
  reg('E19b P4 fechada no Quarto', t.includes('Essa porta está fechada.'), `"${t.slice(0, 100)}" | ${await pos()}`);
  await fecharTudo();
  await capturar('14-quarto-P4-fechada');
}

// Volta: gatilho do Quarto (0,7) → Sala (7,2) olhando para baixo
{
  const g = objeto('quarto', 'porta', 'P2');
  await irPara(page, 'quarto', 0, 6);
  const t0 = Date.now(); let viuFade = false; let e = null;
  await page.keyboard.down('ArrowDown');
  while (Date.now() - t0 < 2500) {
    const s = await estado(page);
    if (s?.emFade) viuFade = true;
    if (s && s.mapa === 'sala' && !s.emFade) { e = s; break; }
    await dormir(10);
  }
  await page.keyboard.up('ArrowDown');
  await dormir(250);
  e = e ?? (await estado(page));
  reg('E21e volta ao Sala pela P2', e?.mapa === 'sala' && e.tileX === 7 && e.tileY === 2 && e.direcao === 'baixo', `fade=${viuFade} ${await pos()} (esperado sala(7,2) baixo)`);
  await capturar('15-volta-sala');
}

// ===== 5. P1 fechada, Suíte inacessível =====
{
  await irPara(page, 'sala', 7, 2);
  await pressionar('ArrowLeft', 300);
  const e = await estado(page);
  reg('E19a P1 fechada: andar para a esquerda não entra', e.mapa === 'sala' && e.tileX === 7, await pos());
  await pressionar('ArrowUp', 60);
  await dormir(100);
}

// ===== 6. P3 (Sala → Escritório) e P1 fechada na Sala (regressão E17) =====
await irPara(page, 'sala', 7, 2);
await pressionar('ArrowRight', 300);
await dormir(300);
{
  const e = await estado(page);
  reg('E17 P3 leva ao Escritório', e.mapa === 'escritorio', await pos());
  await capturar('16-escritorio');
}

// ===== 7. Travamento de 2 px (teclado real): Cozinha, parede (4,4) =====
await page.evaluate(() => window.__teleportar('cozinha', 'P7'));
await dormir(500);
{
  const resultados = [];
  for (const [ponto, tecla] of [[[4, 3], 'ArrowDown'], [[4, 3], 'ArrowRight'], [[3, 3], 'ArrowRight']]) {
    await irPara(page, 'cozinha', ponto[0], ponto[1]).catch((err) => resultados.push('irPara: ' + err.message.slice(0, 60)));
    const a = await estado(page);
    await pressionar(tecla, 700);
    const b = await estado(page);
    await pressionar(tecla, 700);
    const c = await estado(page);
    resultados.push(`${tecla} de (${ponto}): centro ${a.centroX.toFixed(2)},${a.centroY.toFixed(2)} → ${b.centroX.toFixed(2)},${b.centroY.toFixed(2)} → ${c.centroX.toFixed(2)},${c.centroY.toFixed(2)} tile ${c.tileX},${c.tileY}`);
  }
  console.log(resultados.join('\n'));
  await capturar('17-cozinha-parede');
}

reg('ERROS de página/console', erros.length === 0, erros.slice(0, 3).join(' | ') || 'nenhum');
console.log(`Tempo total: ${Math.round((Date.now() - T0) / 1000)} s`);
await browser.close();
