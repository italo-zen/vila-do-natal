// Smoke da imagem de tela (P1 da 1.0.0): mede pixels do canvas do título (e do fim, no build de QA) fora do fundo #0b1030.
// Se a árvore não aparece, a maioria dos pontos da amostra fica no fundo e o smoke reprova.
// Uso: node tools/smoke-imagem-de-tela.mjs <index.html | dist-qa/index.html> [--com-fim]
// Só lê pixels (captura de 1 px); não usa o gancho de QA, exceto para ir ao fim com --com-fim (build de QA).
import { chromium } from 'playwright-core';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { inflateSync } from 'node:zlib';

const arquivo = resolve(process.argv[2] ?? 'dist-playtest/index.html');
const comFim = process.argv.includes('--com-fim');
const FUNDO = [11, 16, 48]; // #0b1030
const CAIXA = [27, 36, 82]; // #1b2452
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const perto = (a, b, t = 12) => Math.abs(a[0] - b[0]) < t && Math.abs(a[1] - b[1]) < t && Math.abs(a[2] - b[2]) < t;

/** RGB de um PNG de 1×1 (8 bits): o filtro da primeira linha não altera o valor bruto. */
function pixelDoPng(png) {
  const idat = [];
  let i = 8;
  while (i < png.length) {
    const tam = png.readUInt32BE(i);
    if (png.toString('ascii', i + 4, i + 8) === 'IDAT') idat.push(png.subarray(i + 8, i + 8 + tam));
    i += 12 + tam;
  }
  const b = inflateSync(Buffer.concat(idat));
  return [b[1], b[2], b[3]];
}

/** Amostra pontos da área da imagem (fora da caixa do nome e dos botões), em coordenadas do jogo 480×352. */
async function amostrar(page, pontos) {
  const rect = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { l: r.left, t: r.top, w: r.width, h: r.height };
  });
  if (!rect) return null;
  const cores = [];
  for (const [x, y] of pontos) {
    const png = await page.screenshot({ clip: { x: rect.l + ((x + 0.5) * rect.w) / 480, y: rect.t + ((y + 0.5) * rect.h) / 352, width: 1, height: 1 } });
    cores.push(pixelDoPng(png));
  }
  return cores;
}

// Pontos da árvore e do chão do título (lado direito, fora das caixas do nome e dos botões).
const PONTOS_TITULO = [
  [330, 120], [380, 170], [300, 230], [420, 260], [360, 300], [250, 320],
];
// Pontos da família na tela de fim (fora da caixa do texto, no topo).
const PONTOS_FIM = [
  [240, 200], [400, 260], [120, 240], [330, 330], [180, 300], [440, 150],
];

function avaliar(nome, cores) {
  if (!cores) return `${nome}: canvas não encontrado`;
  const fora = cores.filter((c) => !perto(c, FUNDO) && !perto(c, CAIXA)).length;
  return { nome, fora, total: cores.length };
}

const navegador = await chromium.launch({ channel: 'chrome', headless: true });
const falhas = [];
const resultados = [];
try {
  const page = await (await navegador.newContext({ viewport: { width: 844, height: 390 } })).newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  await page.goto(pathToFileURL(arquivo).href);
  await page.waitForSelector('canvas');
  await real(3500);
  const titulo = avaliar('titulo', await amostrar(page, PONTOS_TITULO));
  resultados.push(titulo);
  if (titulo.fora < 4) falhas.push(`título sem imagem: ${titulo.fora}/${titulo.total} pontos fora do fundo (mínimo 4)`);
  if (comFim) {
    await page.evaluate(() => { window.__partidaConcluida('lolo', false); window.__irPara('Fim'); });
    await real(2000);
    const fim = avaliar('fim', await amostrar(page, PONTOS_FIM));
    resultados.push(fim);
    if (fim.fora < 4) falhas.push(`fim sem imagem: ${fim.fora}/${fim.total} pontos fora do fundo (mínimo 4)`);
  }
  if (erros.length) falhas.push(`erros de página: ${erros.join(' | ')}`);
} finally {
  await navegador.close();
}
console.log(JSON.stringify({ arquivo, resultados, falhas }, null, 2));
if (falhas.length) process.exit(1);
