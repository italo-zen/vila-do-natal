// Roteiro do joystick virtual (GDD 18.19; ADR-007 seção 13 e 7.1): o empurrão no título (cima e baixo) e na seleção
// (esquerda e direita) anda um item por empurrão, sem repetir ao segurar; a exploração anda pelo eixo dominante nas 4
// direções; redimensionar não solta o dedo, e trocar de layout solta. Arrasto por CDP (Input.dispatchTouchEvent).
// Usa o build de QA (ganchos `window.__analogico`, `window.__focoDoMenu` e `window.__estado`), que nunca vai ao público.
// Uso: npm run build:qa && node tools/smoke-toque-menus.mjs dist-qa/index.html <pasta-de-capturas>
// Saída: código 1 se houver erro de console, exceção ou falha de medida.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [, , arquivoArg, saidaArg] = process.argv;
const arquivo = arquivoArg ?? 'dist-qa/index.html';
const saida = saidaArg ?? 'dist-qa/capturas-menus';
mkdirSync(saida, { recursive: true });
const url = pathToFileURL(resolve(arquivo)).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const erros = [];
const falhas = [];
const medidas = {};

async function abrir(largura, altura) {
  const contexto = await navegador.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await contexto.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') erros.push(`console.${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`));
  await page.goto(url);
  for (let i = 0; i < 200; i++) {
    const pronto = await page.evaluate(() => !!document.querySelector('canvas') && typeof window.__focoDoMenu === 'function' && window.__focoDoMenu() !== null);
    if (pronto) break;
    await real(50);
  }
  await real(1000);
  const cdp = await contexto.newCDPSession(page);
  return { contexto, page, cdp };
}

/** Centro da base do joystick, em CSS px da janela (o alvo DOM `analogico`). Null se a base está oculta. */
async function centroDaBase(page) {
  return page.evaluate(() => {
    const el = document.querySelector('#controles-de-toque [data-alvo="analogico"]');
    if (!el || getComputedStyle(el).display === 'none') return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, raio: r.width / 2 };
  });
}

const analogico = (page) => page.evaluate(() => window.__analogico());
const foco = (page) => page.evaluate(() => window.__focoDoMenu());
const estado = (page) => page.evaluate(() => window.__estado());

/**
 * Empurra o joystick: o dedo começa no centro da base, anda até (dx, dy) do centro em `passos` movimentos e segura
 * `ms` antes de soltar. `intermediarios`: pontos por onde o dedo passa antes do destino (trocar de direção).
 */
async function empurrar(page, cdp, { dx = 0, dy = 0, ms = 350, intermediarios = [], id = 1, aoSegurar } = {}) {
  const c = await centroDaBase(page);
  if (!c) {
    falhas.push('base do joystick oculta (empurrar).');
    return;
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id }] });
  await real(60);
  for (const [px, py] of [...intermediarios, [dx, dy]]) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: c.x + px, y: c.y + py, id }] });
    await real(60);
  }
  if (aoSegurar) await aoSegurar();
  await real(ms);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await real(350);
}

/** Toque de um dedo num alvo DOM (A, B). */
async function tocarDom(page, nome) {
  const alvo = await page.evaluate((n) => window.__alvosDeToque().find((a) => a.origem === 'dom' && a.nome === n) ?? null, nome);
  if (!alvo) {
    falhas.push(`alvo "${nome}" não está visível agora.`);
    return;
  }
  await page.touchscreen.tap(alvo.x + alvo.largura / 2, alvo.y + alvo.altura / 2);
  await real(350);
}

function conferir(nome, obtido, esperado) {
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado);
  if (!ok) falhas.push(`${nome}: obtido ${JSON.stringify(obtido)}, esperado ${JSON.stringify(esperado)}.`);
  return ok;
}

/** Recorte da base e da área em volta, em CSS px (close-up do joystick, T7). */
async function fotoDaBase(page, nome) {
  const c = await centroDaBase(page);
  if (!c) return;
  const m = c.raio + 12;
  await page.screenshot({ path: join(saida, nome), clip: { x: Math.max(0, c.x - m), y: Math.max(0, c.y - m), width: 2 * m, height: 2 * m } });
}

async function roteiroDoTitulo(page, cdp) {
  conferir('título: cena e foco inicial', (await foco(page))?.foco, 0);
  const base = await centroDaBase(page);
  conferir('título: base do joystick visível no layout A', base !== null, true);
  await page.screenshot({ path: join(saida, '844-titulo-repouso.png') });
  await fotoDaBase(page, '844-titulo-base-repouso.png');

  await empurrar(page, cdp, { dy: 30, ms: 1500, aoSegurar: async () => {
    await page.screenshot({ path: join(saida, '844-titulo-empurrando-baixo.png') });
  } });
  conferir('título: empurrar e segurar para baixo dá um passo só (TQ26)', (await foco(page))?.foco, 1);

  await empurrar(page, cdp, { dy: -30 });
  conferir('título: empurrar para cima volta a Começar', (await foco(page))?.foco, 0);

  await empurrar(page, cdp, { dx: -30 });
  conferir('título: esquerda não aceita no título (M4)', (await foco(page))?.foco, 0);

  await empurrar(page, cdp, { dy: 30 });
  await tocarDom(page, 'a');
  await real(600);
  conferir('título: A em Como jogar abre a tela', (await foco(page))?.cena, 'ComoJogar');
  conferir('Como jogar: sem joystick', await centroDaBase(page), null);
  await page.screenshot({ path: join(saida, '844-como-jogar.png') });
  await tocarDom(page, 'b');
  await real(600);
  conferir('Como jogar: B volta ao título', (await foco(page))?.cena, 'Titulo');
  conferir('título: foco zerado ao voltar', (await foco(page))?.foco, 0);
}

async function roteiroDaSelecao(page, cdp) {
  await tocarDom(page, 'a');
  await real(900);
  conferir('seleção: A em Começar abre a seleção', (await foco(page))?.cena, 'Selecao');
  await page.screenshot({ path: join(saida, '844-selecao-repouso.png') });

  await empurrar(page, cdp, { dx: 30, ms: 1500, aoSegurar: async () => {
    await page.screenshot({ path: join(saida, '844-selecao-empurrando-direita.png') });
  } });
  conferir('seleção: empurrar para a direita move o cartão uma vez (segurar não repete)', (await foco(page))?.foco, 1);

  await empurrar(page, cdp, { dx: -30 });
  conferir('seleção: empurrar para a esquerda volta o cartão', (await foco(page))?.foco, 0);
  await empurrar(page, cdp, { dx: -30 });
  conferir('seleção: esquerda no primeiro cartão para (sem volta)', (await foco(page))?.foco, 0);

  await empurrar(page, cdp, { dy: -30 });
  conferir('seleção: cima não aceita na seleção (M4)', (await foco(page))?.foco, 0);

  // M3: engaja para a direita (passo), depois troca para cima sem passar pela zona morta: nenhum passo.
  await empurrar(page, cdp, { dx: 0, dy: -30, intermediarios: [[30, 0]], ms: 500 });
  conferir('seleção: direita e depois cima sem zona morta: um passo só (M3)', (await foco(page))?.foco, 1);
  await empurrar(page, cdp, { dx: -30 });
  await empurrar(page, cdp, { dx: 30 });
  conferir('seleção: voltar à zona morta e empurrar de novo dá outro passo', (await foco(page))?.foco, 1);
  await empurrar(page, cdp, { dx: -30 });
  conferir('seleção: foco de volta ao primeiro cartão para o próximo passo', (await foco(page))?.foco, 0);
}

/**
 * Leva a partida até a exploração por toque: A quando há botão de A na tela; sem botão (layout B nos menus), toca o
 * item do canvas (Título, depois o cartão da seleção). Depois, A na introdução e nos diálogos até a base aparecer.
 */
async function avancarAteExploracao(page) {
  for (let i = 0; i < 60; i++) {
    // A base também aparece na seleção (esquerda e direita): só conta a exploração, com a casa carregada e livre.
    const e = await estado(page);
    if (e && !e.travado && (await centroDaBase(page))) return;
    const ha = await page.evaluate(() => window.__alvosDeToque().some((a) => a.origem === 'dom' && a.nome === 'a'));
    if (ha) {
      await tocarDom(page, 'a');
    } else {
      const zona = await page.evaluate(() => {
        const z = window.__alvosDeToque().find((a) => a.origem === 'canvas' && /^(Titulo|Selecao):Zone$/.test(a.nome));
        return z ? { x: z.x + z.largura / 2, y: z.y + z.altura / 2 } : null;
      });
      if (zona) await page.touchscreen.tap(zona.x, zona.y);
    }
    await real(600);
  }
}

async function roteiroDaExploracao(page, cdp, largura) {
  await avancarAteExploracao(page);
  await real(800);
  const antes = await estado(page);
  if (!antes) falhas.push(`exploração ${largura}: __estado nulo (a casa não carregou).`);
  await page.screenshot({ path: join(saida, `${largura}-exploracao-repouso.png`) });
  await fotoDaBase(page, `${largura}-exploracao-base-repouso.png`);

  // Quatro direções, uma de cada vez: a direção engajada tem de ser a do empurrão, e o sobrinho tem de andar.
  // Ordem: cima e depois baixo (volta ao ponto de partida, que é livre), depois direita e esquerda.
  const direcoes = [
    ['cima', { dy: -30 }],
    ['baixo', { dy: 30 }],
    ['direita', { dx: 30 }],
    ['esquerda', { dx: -30 }],
  ];
  const medidasDaExploracao = {};
  for (const [nome, vetor] of direcoes) {
    const ini = await estado(page);
    await empurrar(page, cdp, { ...vetor, ms: 700, aoSegurar: async () => {
      const a = await analogico(page);
      conferir(`exploração ${largura}: direção engajada ao empurrar ${nome}`, a?.direcao, nome);
      await page.screenshot({ path: join(saida, `${largura}-exploracao-empurrando-${nome}.png`) });
      await fotoDaBase(page, `${largura}-exploracao-base-${nome}.png`);
    } });
    const fim = await estado(page);
    const andou = !!ini && !!fim && (ini.tileX !== fim.tileX || ini.tileY !== fim.tileY || ini.centroX !== fim.centroX || ini.centroY !== fim.centroY);
    medidasDaExploracao[nome] = { andou, direcaoFinal: fim?.direcao ?? null };
    if (!andou) falhas.push(`exploração ${largura}: empurrar ${nome} não andou (sobrinho parado).`);
  }
  medidas[`exploracao-${largura}`] = medidasDaExploracao;

  // Diagonal: o eixo dominante vale (20 em x e 12 em y → direita).
  await empurrar(page, cdp, { dx: 30, dy: 20, ms: 400, aoSegurar: async () => {
    conferir(`exploração ${largura}: diagonal dá um eixo só (dominante)`, (await analogico(page))?.direcao, 'direita');
  } });

  // Redimensionar com o dedo na base não solta; trocar de layout solta (ADR-007 10.5; GDD 18.19.6).
  const c = await centroDaBase(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 7 }] });
  await real(60);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: c.x + 30, y: c.y, id: 7 }] });
  await real(150);
  await page.setViewportSize({ width: largura, height: largura === 844 ? 388 : 373 });
  await real(500);
  const aposResize = await analogico(page);
  conferir(`exploração ${largura}: redimensionar com o dedo na base não solta (10.5)`, [aposResize?.dono, aposResize?.direcao], [true, 'direita']);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await real(300);
  await page.setViewportSize({ width: largura, height: largura === 844 ? 390 : 375 });
  await real(800);
  const emTroca = await analogico(page);
  conferir(`exploração ${largura}: sem dedo, o joystick volta ao repouso`, emTroca?.dono, false);
}

async function layoutBTrocaSolta(page, cdp) {
  // Dedo na base em 844×390 (A), troca para 667×375 (B) com o dedo ainda apoiado: o joystick solta (ADR-007 10.5).
  const c = await centroDaBase(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 8 }] });
  await real(60);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: c.x + 30, y: c.y, id: 8 }] });
  await real(150);
  await page.setViewportSize({ width: 667, height: 375 });
  await real(800);
  const depois = await analogico(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await real(300);
  conferir('troca para o layout B solta o joystick (GDD 18.19.6)', depois?.dono, false);
  medidas.trocaDeLayout = { dono: depois?.dono ?? null };
}

async function layoutBExploracao(page, cdp) {
  // 667×375 (layout B): a base fica na tela do jogo, e a exploração tem o joystick com as 4 direções (pergunta 38).
  await page.setViewportSize({ width: 667, height: 375 });
  await real(800);
  const base = await centroDaBase(page);
  conferir('exploração 667 (B): base do joystick visível', base !== null, true);
  await empurrar(page, cdp, { dx: 30, ms: 600, aoSegurar: async () => {
    await page.screenshot({ path: join(saida, '667-exploracao-empurrando-direita.png') });
  } });
  await page.screenshot({ path: join(saida, '667-exploracao-repouso.png') });
}

async function roteiroDoTituloB(page) {
  await page.setViewportSize({ width: 667, height: 375 });
  await real(800);
  conferir('título em layout B: sem joystick (decisão 38)', await centroDaBase(page), null);
}

const navegador = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const { contexto, page, cdp } = await abrir(844, 390);
  const alvosDom = await page.evaluate(() => window.__alvosDeToque().filter((a) => a.origem === 'dom').map((a) => a.nome));
  conferir('alvos de toque: sem braços da cruz; base "analogico" presente', alvosDom.filter((n) => n.startsWith('cruz')).length + (alvosDom.includes('analogico') ? 0 : 1), 0);
  await roteiroDoTitulo(page, cdp);
  await roteiroDaSelecao(page, cdp);
  await roteiroDaExploracao(page, cdp, 844);
  await layoutBTrocaSolta(page, cdp);
  await contexto.close();

  const b = await abrir(667, 375);
  await roteiroDoTituloB(b.page);
  await roteiroDaExploracao(b.page, b.cdp, 667).catch((e) => falhas.push(`exploração 667: ${e.message}`));
  await layoutBExploracao(b.page, b.cdp);
  await b.contexto.close();
} finally {
  await navegador.close();
}

writeFileSync(join(saida, 'medidas-joystick.json'), JSON.stringify({ medidas, erros, falhas }, null, 2) + '\n');
console.log(JSON.stringify({ erros, falhas }, null, 2));
if (erros.length > 0 || falhas.length > 0) process.exit(1);
