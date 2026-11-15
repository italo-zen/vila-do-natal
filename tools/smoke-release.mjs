// Smoke da release (ADR-009 9 e 10; GDD 20.9 DS1b e RG7): serve dist-release em subcaminho (/vila-do-natal/) e na raiz, com
// gzip, e mede com Fast 4G emulado (1,6 Mbps, 150 ms) quando o título fica desenhado (pixel da caixa do nome, #1b2452) e
// quando cada arquivo de áudio e de imagem chega. Confere: título antes da imagem do título acabar de chegar; música só
// depois de o título estar desenhado; os 21 arquivos (19 áudios e 2 imagens) respondem 200; nenhuma mensagem de console.
// Uso: node tools/smoke-release.mjs [pasta=dist-release]   (npm run smoke:release)
// Saída: código 1 se houver falha. Não usa gancho de QA (a release não tem).
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import { gzipSync, inflateSync } from 'node:zlib';

const pasta = resolve(process.argv[2] ?? 'dist-release');
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.mp3': 'audio/mpeg', '.png': 'image/png' };
const TEXTO = new Set(['.html', '.js', '.css', '.json']);
const falhas = [];
const erros = [];
const medidas = {};

/** Servidor estático: aceita `/` e `/vila-do-natal/` (subcaminho do Pages). Comprime texto com gzip como um servidor de Pages. */
function servir() {
  return createServer((req, res) => {
    let caminho = decodeURIComponent((req.url ?? '/').split('?')[0]);
    if (caminho.startsWith('/vila-do-natal/')) caminho = caminho.slice('/vila-do-natal'.length);
    if (caminho === '/' || caminho === '') caminho = '/index.html';
    const arquivo = join(pasta, caminho);
    if (!arquivo.startsWith(pasta) || !existsSync(arquivo) || !statSync(arquivo).isFile()) {
      res.writeHead(404).end();
      return;
    }
    const ext = extname(arquivo);
    let corpo = readFileSync(arquivo);
    const headers = { 'Content-Type': TIPOS[ext] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' };
    if (TEXTO.has(ext) && String(req.headers['accept-encoding'] ?? '').includes('gzip')) {
      corpo = gzipSync(corpo, { level: 6 });
      headers['Content-Encoding'] = 'gzip';
    }
    res.writeHead(200, headers).end(corpo);
  });
}

/** RGB do pixel de um PNG de 1×1 (8 bits). Na primeira linha, o filtro não altera o valor bruto, então o byte 0 é o filtro. */
function pixelDoPng(png) {
  const idat = [];
  let i = 8;
  while (i < png.length) {
    const tam = png.readUInt32BE(i);
    const tipo = png.toString("ascii", i + 4, i + 8);
    if (tipo === "IDAT") idat.push(png.subarray(i + 8, i + 8 + tam));
    i += 12 + tam;
  }
  const bruto = inflateSync(Buffer.concat(idat));
  return [bruto[1], bruto[2], bruto[3]];
}

const ALVO_DO_TITULO = [27, 36, 82]; // #1b2452: caixa do nome do jogo, desenhada só com o título.

async function rodarEm(navegador, base) {
  const contexto = await navegador.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, hasTouch: false });
  const page = await contexto.newPage();
  const rede = [];
  const cdp = await contexto.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (0.75 * 1024 * 1024) / 8 });
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') erros.push(`${base} console.${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => erros.push(`${base} pageerror: ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400) erros.push(`${base} HTTP ${r.status()}: ${r.url()}`);
  });
  page.on('requestfinished', async (req) => {
    const url = req.url();
    if (!url.includes('/audio/') && !url.includes('/imagens/')) return;
    rede.push({ url, fim: Date.now() - t0, inicio: Date.now() - t0 });
  });
  const t0 = Date.now();
  await page.goto(base);
  // Título desenhado: pixel da caixa do nome (30, 60) em coordenadas do jogo (480×352). Lido por captura de 1 pixel.
  let desenhadoEm = null;
  const deadline = t0 + 20000;
  while (Date.now() < deadline && desenhadoEm === null) {
    const medida = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      if (!c) return null;
      const r = c.getBoundingClientRect();
      return { x: r.left + ((30 + 0.5) * r.width) / 480, y: r.top + ((60 + 0.5) * r.height) / 352 };
    });
    if (medida) {
      const png = await page.screenshot({ clip: { x: medida.x, y: medida.y, width: 1, height: 1 } });
      const [r, g, b] = pixelDoPng(png);
      if (Math.abs(r - ALVO_DO_TITULO[0]) < 10 && Math.abs(g - ALVO_DO_TITULO[1]) < 10 && Math.abs(b - ALVO_DO_TITULO[2]) < 10) desenhadoEm = Date.now() - t0;
    }
    if (desenhadoEm === null) await new Promise((r) => setTimeout(r, 50));
  }
  // Espera os recursos da release (até 20 s).
  await page.waitForTimeout(8000);
  // Imagem do título na release (P1 da 1.0.0): pontos da árvore e do chão fora do fundo e da caixa do nome.
  const cores = [];
  const rectCanvas = await page.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; });
  for (const [x, y] of [[330, 120], [380, 170], [300, 230], [420, 260], [360, 300], [250, 320]]) {
    const png = await page.screenshot({ clip: { x: rectCanvas.l + ((x + 0.5) * rectCanvas.w) / 480, y: rectCanvas.t + ((y + 0.5) * rectCanvas.h) / 352, width: 1, height: 1 } });
    cores.push(pixelDoPng(png));
  }
  const foraDoFundo = cores.filter((c) => !(Math.abs(c[0] - 11) < 12 && Math.abs(c[1] - 16) < 12 && Math.abs(c[2] - 48) < 12) && !(Math.abs(c[0] - 27) < 12 && Math.abs(c[1] - 36) < 12 && Math.abs(c[2] - 82) < 12)).length;
  if (foraDoFundo < 4) falhas.push(`${base}: imagem do título ausente (${foraDoFundo}/6 pontos fora do fundo)`);
  const audio = rede.filter((x) => x.url.includes('/audio/'));
  const imagens = rede.filter((x) => x.url.includes('/imagens/'));
  const imagemTitulo = imagens.find((x) => x.url.includes('/imagens/titulo.'));
  const primeiraMusica = audio.find((x) => x.url.includes('/audio/mus_natal.'));
  medidas[base] = { tituloDesenhadoMs: desenhadoEm, imagemTituloMs: imagemTitulo?.fim ?? null, musicaMs: primeiraMusica?.fim ?? null, arquivos: rede.length };
  if (desenhadoEm === null) falhas.push(`${base}: título não ficou desenhado em 20 s`);
  else if (desenhadoEm > 3500) falhas.push(`${base}: título desenhado em ${desenhadoEm} ms (limite 3500 ms; requisito DS2 é 4 s, com folga)`);
  if (imagemTitulo && desenhadoEm !== null && desenhadoEm > imagemTitulo.fim) falhas.push(`${base}: título só desenhou depois da imagem do título chegar`);
  if (primeiraMusica && desenhadoEm !== null && primeiraMusica.fim < desenhadoEm) falhas.push(`${base}: a trilha chegou antes do título desenhado`);
  if (rede.length !== 21) falhas.push(`${base}: ${rede.length} arquivos de áudio e imagem responderam; esperados 21 (19 áudios e 2 imagens)`);
  await contexto.close();
}

const servidor = servir();
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const porta = servidor.address().port;
const navegador = await chromium.launch({ channel: 'chrome', headless: true });
try {
  await rodarEm(navegador, `http://127.0.0.1:${porta}/vila-do-natal/`);
  await rodarEm(navegador, `http://127.0.0.1:${porta}/`);
} finally {
  await navegador.close();
  servidor.close();
}

console.log(JSON.stringify({ medidas, erros, falhas }, null, 2));
if (erros.length > 0 || falhas.length > 0) process.exit(1);
