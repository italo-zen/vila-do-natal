// Linha de base 0.10.0 (item 121): capturas de teclado de Título, Como jogar, Seleção e Introdução (4 páginas) em 960×640.
// Uso (na raiz do repositório): VIEWPORT=960x640 node qa/scripts/baseline-0100-menus-teclado.mjs dist-playtest/index.html qa/baseline-0100/menus-teclado-960x640
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, join } from 'node:path';

const [, , arquivoArg, saidaArg] = process.argv;
const arquivo = arquivoArg ?? 'dist-playtest/index.html';
const saida = saidaArg ?? 'qa/baseline-0100/menus-teclado-960x640';
const [VW, VH] = (process.env.VIEWPORT ?? '960x640').split('x').map(Number);
mkdirSync(saida, { recursive: true });
const url = pathToFileURL(resolve(arquivo)).href;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const erros = [];

const navegador = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await navegador.newPage({ viewport: { width: VW, height: VH } });
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') erros.push(`console.${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`));
  await page.goto(url);
  await esperar(3000);
  await page.screenshot({ path: join(saida, '01-titulo.png') });
  await page.keyboard.press('ArrowDown');
  await esperar(300);
  await page.keyboard.press('z');
  await esperar(1200);
  await page.screenshot({ path: join(saida, '02-como-jogar.png') });
  await page.keyboard.press('x');
  await esperar(800);
  await page.keyboard.press('ArrowUp');
  await esperar(300);
  await page.keyboard.press('z');
  await esperar(1200);
  await page.screenshot({ path: join(saida, '03-selecao.png') });
  await page.keyboard.press('z');
  await esperar(1500);
  await page.screenshot({ path: join(saida, '04-introducao-pagina-1.png') });
  for (let i = 2; i <= 4; i++) {
    await page.keyboard.press('z');
    await esperar(900);
    await page.screenshot({ path: join(saida, `04-introducao-pagina-${i}.png`) });
  }
  console.log(JSON.stringify({ saida, erros }, null, 2));
} finally {
  await navegador.close();
}
