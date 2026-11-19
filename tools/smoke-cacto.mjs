// Easter egg do cacto (Sala, (0, 3)): andar contra ele devolve o jogador 1 tile e o cacto pisca ~1 s, sem som nem texto.
// Uso: node tools/smoke-cacto.mjs dist-qa/index.html dist-qa/capturas-cacto   (build:qa, precisa do gancho)
// Saída: código 1 se houver qualquer erro ou aviso de console / exceção não capturada.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const [, , arquivoArg, saidaArg] = process.argv;
const arquivo = arquivoArg ?? 'dist-qa/index.html';
const saida = saidaArg ?? 'dist-qa/capturas-cacto';
mkdirSync(saida, { recursive: true });
// `?plano=referencia`: o gancho de QA usa as posições fixas de antes do sorteio (passos escritos à mão). Só existe no build de QA.
const url = pathToFileURL(resolve(arquivo)).href + '?plano=referencia';
const real = (ms) => new Promise((r) => setTimeout(r, ms));
/** Página atual: o tempo do jogo só anda por `esperar`, dentro da página (relógio virtual abaixo). */
let pagina = null;
const esperar = (ms) => pagina.evaluate((n) => window.__avancar(n), ms);

/**
 * Relógio virtual injetado antes de qualquer script da página. Date, performance.now, setTimeout,
 * setInterval e requestAnimationFrame passam a usar uma fila controlada: o tempo só anda em
 * `__avancar(ms)`, que roda os quadros (16 ms) e os temporizadores vencidos, de forma síncrona.
 * Sem tempo real, as capturas do smoke saem idênticas entre execuções (tween, pisca e pressionado).
 */
const RELOGIO_VIRTUAL = `(() => {
  let agora = 0;
  let seq = 1;
  const temporizadores = new Map();
  let quadros = new Map();
  window.setTimeout = (cb, ms = 0, ...args) => {
    const id = seq++;
    temporizadores.set(id, { vence: agora + Math.max(0, Number(ms) || 0), id, cb, args, intervalo: null });
    return id;
  };
  window.setInterval = (cb, ms = 0, ...args) => {
    const id = seq++;
    const passo = Math.max(1, Number(ms) || 0);
    temporizadores.set(id, { vence: agora + passo, id, cb, args, intervalo: passo });
    return id;
  };
  window.clearTimeout = (id) => temporizadores.delete(id);
  window.clearInterval = (id) => temporizadores.delete(id);
  window.requestAnimationFrame = (cb) => {
    const id = seq++;
    quadros.set(id, cb);
    return id;
  };
  window.cancelAnimationFrame = (id) => quadros.delete(id);
  Date.now = () => agora;
  performance.now = () => agora;
  const dispararVencidos = () => {
    for (;;) {
      let proximo = null;
      for (const t of temporizadores.values()) if (t.vence <= agora && (!proximo || t.vence < proximo.vence || (t.vence === proximo.vence && t.id < proximo.id))) proximo = t;
      if (!proximo) return;
      if (proximo.intervalo === null) temporizadores.delete(proximo.id);
      else proximo.vence += proximo.intervalo;
      proximo.cb(...proximo.args);
    }
  };
  const quadro = () => {
    const fila = quadros;
    quadros = new Map();
    for (const cb of fila.values()) cb(agora);
  };
  window.__avancar = (ms) => {
    const fim = agora + ms;
    while (agora < fim) {
      agora = Math.min(fim, agora + 16);
      dispararVencidos();
      quadro();
    }
  };
})();`;

const erros = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });

/**
 * Boot: espera o jogo ser criado (canvas no DOM, depois das promessas reais de fontes e conteúdo) e roda
 * 300 quadros, com uma pausa real entre eles para as imagens carregarem. Depois confere o título.
 */
async function aguardarTitulo(page) {
  for (let i = 0; i < 400; i++) {
    if (await page.evaluate(() => !!document.querySelector('canvas'))) break;
    await real(15);
  }
  for (let i = 0; i < 300; i++) {
    await esperar(16);
    await real(15);
  }
  const pronto = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    if (!c) return false;
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    for (let i = 0; i < d.length; i += 4) if (d[i] !== 11 || d[i + 1] !== 16 || d[i + 2] !== 48) return true;
    return false;
  });
  if (!pronto) throw new Error('O título não apareceu no canvas.');
}

async function novaPagina(rotulo) {
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  pagina = page;
  await page.addInitScript(RELOGIO_VIRTUAL);
  page.on('console', (m) => {
    if (m.type() === 'error') erros.push(`[${rotulo}] console.error: ${m.text()}`);
    if (m.type() === 'warning') erros.push(`[${rotulo}] console.warning: ${m.text()}`);
  });
  page.on('pageerror', (e) => erros.push(`[${rotulo}] pageerror: ${e.message}`));
  page.on('requestfailed', (r) => erros.push(`[${rotulo}] requestfailed: ${r.url()}`));
  await page.goto(url);
  await aguardarTitulo(page);
  await esperar(2500);
  return page;
}


const page = await novaPagina('cacto');
const estado = () => page.evaluate(() => { const e = window.__estado(); return { mapa: e.mapa, tile: [e.tileX, e.tileY], cx: Math.round(e.centroX), cy: Math.round(e.centroY) }; });
await page.evaluate(() => { window.__partidaConcluida('lolo', false); window.__irPara('Casa', { modo: 'explorar' }); });
await esperar(1500);
await page.evaluate(() => window.__teleportar('sala', 'hall-sala'));
await esperar(500);
// Do spawn da Sala (4, 8): sobe 1 tile, vai para a esquerda até x = 1 e sobe até a linha do cacto (0, 3).
const segurar = async (k, ms) => { await page.keyboard.down(k); await esperar(ms); await page.keyboard.up(k); await esperar(100); };
await segurar('ArrowUp', 250);
await segurar('ArrowLeft', 800);
await segurar('ArrowUp', 1000);
console.log('antes', JSON.stringify(await estado()));
await page.keyboard.down('ArrowLeft');
const cx = [];
let alphas = [];
for (let i = 0; i < 90; i++) {
  await esperar(50);
  const e = await estado();
  cx.push(e.cx);
  if (i === 80) await page.screenshot({ path: `${saida}/cacto-andando.png` });
}
await page.keyboard.up('ArrowLeft');
// Procura um empurrão: salto de ~32 px para a direita de um quadro para outro.
const saltos = cx.map((v, i) => (i ? v - cx[i - 1] : 0)).filter((d) => d > 20);
console.log('saltos para a direita (px):', saltos.join(','), 'x min/max:', Math.min(...cx), Math.max(...cx));
if (saltos.length === 0) erros.push('Nenhum empurrão do cacto foi observado.');
await page.close();
await browser.close();
console.log(JSON.stringify({ erros }, null, 2));
process.exitCode = erros.length > 0 ? 1 : 0;
