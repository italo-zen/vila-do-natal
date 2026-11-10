// Verificação de toque emulado (ADR-007 seção 12.2 e 13): abre o build de playtest em aparelhos com toque (contexto
// com hasTouch, isMobile e DPR 2), percorre título, Como jogar, seleção e introdução com toques reais (canvas e DOM),
// tira as capturas, mede os controles em DOM e confere que não há erro de console. Também confere que o computador
// (sem toque) não mostra controles nem aviso, e que girar para retrato mostra o aviso sem recarregar a página.
// Uso: node tools/smoke-toque.mjs <index.html> <pasta-de-capturas>
// Saída: código 1 se houver erro de console, exceção não capturada ou falha de medida.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const [, , arquivoArg, saidaArg] = process.argv;
const arquivo = arquivoArg ?? 'dist-playtest/index.html';
const saida = saidaArg ?? 'dist-playtest/capturas-toque';
mkdirSync(saida, { recursive: true });
const url = pathToFileURL(resolve(arquivo)).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const erros = [];
const medidas = {};
const falhas = [];

const perfil = JSON.parse(readFileSync(join(RAIZ, 'content', 'art-profiles', 'hd-480x352.json'), 'utf-8'));
const T = perfil.toque;
const TELA_JOGO = { largura: perfil.sala.colunas * perfil.tile, altura: perfil.sala.linhas * perfil.tile };
/** Posições do jogo (px de tela de jogo) de cada alvo do canvas usado no roteiro (telas do perfil HD). */
const ALVO = {
  comojogar: { x: TELA_JOGO.largura / 2, y: perfil.telas.titulo.menuY[1] + perfil.botao.altura / 2 },
  comecar: { x: TELA_JOGO.largura / 2, y: perfil.telas.titulo.menuY[0] + perfil.botao.altura / 2 },
  voltarComoJogar: { x: TELA_JOGO.largura / 2, y: perfil.telas.comoJogar.voltarY + perfil.botao.altura / 2 },
  cartaoLoLo: {
    x: (TELA_JOGO.largura - (4 * perfil.telas.selecao.cartaoLargura + 3 * perfil.telas.selecao.espaco)) / 2 + perfil.telas.selecao.cartaoLargura / 2,
    y: perfil.telas.selecao.cartaoTopo + perfil.telas.selecao.cartaoAltura / 2,
  },
};

async function abrir(nome, { largura, altura, toque }) {
  const contexto = await navegador.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: 2, hasTouch: toque, isMobile: toque });
  const page = await contexto.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') erros.push(`[${nome}] console.${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => erros.push(`[${nome}] pageerror: ${e.message}`));
  await page.goto(url);
  await aguardarTitulo(page);
  return { contexto, page };
}

async function aguardarTitulo(page) {
  for (let i = 0; i < 200; i++) {
    const pronto = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      if (!c) return false;
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      for (let i = 0; i < d.length; i += 4) if (d[i] !== 11 || d[i + 1] !== 16 || d[i + 2] !== 48) return true;
      return false;
    });
    if (pronto) break;
    await real(50);
  }
  await real(1200);
}

/** Toque real num ponto da tela de jogo (px do jogo), convertido para CSS px pelo tamanho atual do canvas. */
async function tocarNoJogo(page, p) {
  const r = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const b = c.getBoundingClientRect();
    return { left: b.left, top: b.top, f: b.width / 480 };
  });
  await page.touchscreen.tap(r.left + p.x * r.f, r.top + p.y * r.f);
  await real(900);
}

async function tocarNoControle(page, alvo) {
  await page.locator(`#controles-de-toque [data-alvo="${alvo}"]`).tap();
  await real(400);
}

/** Medidas dos controles em DOM (CSS px) e quantos pontos de cada um caem sobre o canvas (layout B). */
async function medirControles(page) {
  return page.evaluate(() => {
    const cv = document.querySelector('canvas').getBoundingClientRect();
    return [...document.querySelectorAll('#controles-de-toque [data-alvo]')]
      .filter((el) => el.getBoundingClientRect().width > 0)
      .map((el) => {
        const r = el.getBoundingClientRect();
        const sobre = r.left < cv.right && r.right > cv.left && r.top < cv.bottom && r.bottom > cv.top;
        return { alvo: el.dataset.alvo, x: Math.round(r.left), y: Math.round(r.top), largura: Math.round(r.width), altura: Math.round(r.height), sobreATela: sobre, opacidade: getComputedStyle(el).opacity };
      });
  });
}

async function joystickVisivel(page) {
  return page.evaluate(() => {
    const c = document.querySelector('#controles-de-toque [data-alvo="analogico"]');
    return !!c && getComputedStyle(c).display !== 'none';
  });
}

async function sondaDeToque(page) {
  return page.evaluate(() => ({
    maxTouchPoints: navigator.maxTouchPoints,
    ontouchstart: 'ontouchstart' in window,
    pointerGrosso: matchMedia('(any-pointer: coarse)').matches,
    controles: !!document.getElementById('controles-de-toque'),
    aviso: document.getElementById('aviso-de-rotacao') ? getComputedStyle(document.getElementById('aviso-de-rotacao')).display : 'ausente',
  }));
}

async function capturar(page, nome) {
  await page.screenshot({ path: join(saida, `${nome}.png`) });
}

async function roteiroDeToque(nome, largura, altura) {
  const { contexto, page } = await abrir(nome, { largura, altura, toque: true });
  const sonda = await sondaDeToque(page);
  medidas[nome] = { janela: { largura, altura }, sonda, controles: await medirControles(page) };
  if (!sonda.controles) falhas.push(`${nome}: aparelho com toque sem controles em DOM.`);
  if (sonda.maxTouchPoints <= 0 && !sonda.ontouchstart && !sonda.pointerGrosso) falhas.push(`${nome}: sonda de toque zerada no contexto com toque.`);
  await capturar(page, `titulo-${nome}`);
  await tocarNoJogo(page, ALVO.comojogar);
  await capturar(page, `como-jogar-${nome}`);
  await tocarNoJogo(page, ALVO.voltarComoJogar);
  await tocarNoJogo(page, ALVO.comecar);
  await capturar(page, `selecao-${nome}`);
  await tocarNoJogo(page, ALVO.cartaoLoLo);
  await real(1500);
  await capturar(page, `introducao-${nome}`);
  // A avança a introdução e os diálogos seguintes até a exploração (o joystick aparece só nela).
  for (let i = 0; i < 20; i++) {
    if (await joystickVisivel(page)) break;
    await tocarNoControle(page, 'a');
    await real(500);
  }
  if (!(await joystickVisivel(page))) falhas.push(`${nome}: a exploração não apareceu depois dos toques em A (joystick oculto).`);
  await real(1200);
  await capturar(page, `exploracao-${nome}`);
  medidas[nome].exploracao = await medirControles(page);
  await contexto.close();
}

async function rotacao() {
  const { contexto, page } = await abrir('rotacao', { largura: 844, altura: 390, toque: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await real(1200);
  const emRetrato = await page.evaluate(() => getComputedStyle(document.getElementById('aviso-de-rotacao')).display);
  if (emRetrato !== 'flex') falhas.push(`rotação: o aviso não apareceu em retrato (display ${emRetrato}).`);
  const textos = await page.evaluate(() => [...document.querySelectorAll('#aviso-de-rotacao p')].map((p) => p.textContent));
  if (textos[0] !== 'Gire o celular para o lado.' || textos[1] !== 'O jogo fica na horizontal.') falhas.push(`rotação: textos do aviso fora de GDD 18.12 (${JSON.stringify(textos)}).`);
  await capturar(page, 'rotacao-390x844');
  await page.setViewportSize({ width: 844, height: 390 });
  await real(1200);
  const naPaisagem = await page.evaluate(() => getComputedStyle(document.getElementById('aviso-de-rotacao')).display);
  if (naPaisagem !== 'none') falhas.push(`rotação: o aviso não saiu ao girar para paisagem (display ${naPaisagem}).`);
  medidas.rotacao = { emRetrato, naPaisagem, textos };
  await contexto.close();
}

async function computador(nome, largura, altura) {
  const { contexto, page } = await abrir(nome, { largura, altura, toque: false });
  const sonda = await sondaDeToque(page);
  medidas[nome] = { janela: { largura, altura }, sonda };
  if (sonda.controles) falhas.push(`${nome}: computador sem toque mostrou os controles de toque.`);
  if (sonda.aviso !== 'ausente') falhas.push(`${nome}: computador sem toque tem o aviso de rotação (${sonda.aviso}).`);
  await contexto.close();
}

const navegador = await chromium.launch({ channel: 'chrome', headless: true });
try {
  await roteiroDeToque('844x390', 844, 390);
  await roteiroDeToque('667x375', 667, 375);
  await rotacao();
  await computador('computador-390x844', 390, 844);
  await computador('computador-960x640', 960, 640);
} finally {
  await navegador.close();
}

writeFileSync(join(saida, 'medidas-toque.json'), JSON.stringify({ medidas, erros, falhas }, null, 2) + '\n');
const resultado = { erros, falhas };
console.log(JSON.stringify(resultado, null, 2));
if (erros.length > 0 || falhas.length > 0) process.exit(1);
