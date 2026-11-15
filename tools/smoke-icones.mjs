// Roteiro dos ícones de pausa e de som (GDD 19.3.2; ADR-008 7.2 e 9.3; backlog 126): toque e mouse nos ícones do canto
// superior esquerdo, no título e na exploração, em 844×390 (layout A) e 667×375 (layout B). Confere a sobreposição com
// os controles de toque e captura o som ligado, o desligado e a pausa aberta pelo ícone.
// Uso: npm run build:qa && node tools/smoke-icones.mjs dist-qa/index.html <pasta-de-capturas>
// Saída: código 1 se houver erro de console, exceção ou falha de conferência.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [, , arquivoArg, saidaArg] = process.argv;
const url = pathToFileURL(resolve(arquivoArg ?? 'dist-qa/index.html')).href;
const saida = resolve(saidaArg ?? 'dist-qa/capturas-icones');
mkdirSync(saida, { recursive: true });
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const erros = [];
const falhas = [];
const medidas = {};
const conferir = (nome, obtido, esperado) => {
  if (JSON.stringify(obtido) !== JSON.stringify(esperado)) falhas.push(`${nome}: obtido ${JSON.stringify(obtido)}, esperado ${JSON.stringify(esperado)}.`);
};

const alvos = (page) => page.evaluate(() => window.__alvosDeToque());
const centro = (a) => ({ x: a.x + a.largura / 2, y: a.y + a.altura / 2 });
const achar = async (page, nome, origem) => (await alvos(page)).find((a) => a.nome === nome && (!origem || a.origem === origem));
async function tocarAlvo(page, nome, origem) {
  const a = await achar(page, nome, origem);
  if (!a) {
    falhas.push(`alvo "${nome}" não está visível agora.`);
    return false;
  }
  const c = centro(a);
  await page.touchscreen.tap(c.x, c.y);
  await real(400);
  return true;
}
/** Sobreposição (área > 0) entre dois retângulos em CSS px. */
const sobrepoe = (a, b) => a.x < b.x + b.largura && a.x + a.largura > b.x && a.y < b.y + b.altura && a.y + a.altura > b.y;

const navegador = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const [largura, altura, layout] of [[844, 390, 'A'], [667, 375, 'B']]) {
    const nome = `${largura}x${altura}`;
    const contexto = await navegador.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    const page = await contexto.newPage();
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') erros.push(`[${nome}] console.${m.type()}: ${m.text()}`);
    });
    page.on('pageerror', (e) => erros.push(`[${nome}] pageerror: ${e.message}`));
    await page.goto(url);
    await page.waitForSelector('canvas');
    await real(2200);

    // Título: o ícone de som aparece, no canto superior esquerdo, com o som ligado.
    await page.touchscreen.tap(5, 5);
    await real(500);
    const noTitulo = await achar(page, 'icone-som', 'canvas');
    conferir(`${nome}: o ícone de som aparece no título`, !!noTitulo, true);
    await page.screenshot({ path: join(saida, `${nome}-titulo-som-ligado.png`) });
    await tocarAlvo(page, 'icone-som', 'canvas');
    conferir(`${nome}: tocar o som no título desliga (gancho)`, (await page.evaluate(() => window.__estado()?.audio?.mudo)), true);
    await page.screenshot({ path: join(saida, `${nome}-titulo-som-desligado.png`) });
    await tocarAlvo(page, 'icone-som', 'canvas');
    conferir(`${nome}: tocar de novo liga`, (await page.evaluate(() => window.__estado()?.audio?.mudo)), false);

    // Entra na exploração por toque (A na seleção e na introdução; no layout B, o cartão do canvas).
    await tocarAlvo(page, 'Titulo:Zone', 'canvas');
    await real(900);
    for (let i = 0; i < 40; i++) {
      if (await achar(page, 'icone-pausa', 'canvas')) break;
      const ha = await achar(page, 'a', 'dom');
      if (ha) await tocarAlvo(page, 'a', 'dom');
      else if (await achar(page, 'Selecao:Zone', 'canvas')) await tocarAlvo(page, 'Selecao:Zone', 'canvas');
      await real(500);
    }
    await real(600);
    const pausaVisivel = await achar(page, 'icone-pausa', 'canvas');
    const somVisivel = await achar(page, 'icone-som', 'canvas');
    conferir(`${nome}: na exploração, o II e o som aparecem`, [!!pausaVisivel, !!somVisivel], [true, true]);

    // Sobreposição com os controles de toque e com o "?" (ADR-008 7.4; GDD 16.8.1): nada se cobre.
    const dom = (await alvos(page)).filter((a) => a.origem === 'dom');
    const icones = [pausaVisivel, somVisivel].filter(Boolean);
    const cobertos = icones.flatMap((i) => dom.filter((d) => sobrepoe(i, d)).map((d) => `${i.nome} x ${d.nome}`));
    conferir(`${nome}: ícones sem sobreposição com joystick, A e B`, cobertos, []);
    medidas[nome] = { layout, icones: icones.map((i) => ({ nome: i.nome, x: Math.round(i.x), y: Math.round(i.y), largura: Math.round(i.largura), altura: Math.round(i.altura) })), controlesDom: dom.map((d) => d.nome) };

    await page.screenshot({ path: join(saida, `${nome}-exploracao-som-ligado.png`) });
    await tocarAlvo(page, 'icone-som', 'canvas');
    await page.screenshot({ path: join(saida, `${nome}-exploracao-som-desligado.png`) });
    await tocarAlvo(page, 'icone-som', 'canvas');

    // II abre a pausa pelo toque (PS2); o gancho confirma a visão e o foco.
    await tocarAlvo(page, 'icone-pausa', 'canvas');
    await real(300);
    const pausa = await page.evaluate(() => window.__estado()?.pausa);
    conferir(`${nome}: o II abre a pausa (PS2)`, [pausa?.aberta, pausa?.visao], [true, 'pausa']);
    await page.screenshot({ path: join(saida, `${nome}-pausa-pelo-icone.png`) });

    await contexto.close();
  }
} catch (erro) {
  falhas.push(`exceção: ${erro.message}`);
} finally {
  await navegador.close();
}
writeFileSync(join(saida, 'medidas-icones.json'), JSON.stringify({ medidas, erros, falhas }, null, 2) + '\n');
console.log(JSON.stringify({ erros, falhas }, null, 2));
if (erros.length > 0 || falhas.length > 0) process.exit(1);
