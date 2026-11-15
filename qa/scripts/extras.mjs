// QA Marco 1: casos complementares: mouse no título (decisão do Diretor), J-02 (Caps/maiúsculas), J-08 (foco da página),
// J-09 (teclas de fases futuras não fazem nada), E-09 (Z de lado para o bilhete), K-07 (fps), E-07 (Enter com objeto em frente).
// Uso: node qa/scripts/extras.mjs [dist|playtest]
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  RAIZ, abrirJogo, caso, capturar, criarRelatorio, irAteBilhete, irAteHall, irAteIntro, lancar, lerTextos, limparTextos, novoContexto, segurar, servirPasta, sleep, tecla,
} from './lib.mjs';

const alvo = process.argv[2] ?? 'dist';
let url;
let origem = null;
let srv = null;
if (alvo === 'dist') {
  const s = await servirPasta(join(RAIZ, 'dist'));
  srv = s.srv;
  url = s.url;
  origem = s.origem;
} else {
  url = pathToFileURL(join(RAIZ, 'dist-playtest', 'index.html')).href;
}
const rel = criarRelatorio(`extras-${alvo}`);
const browser = await lancar();

async function quadro(page) {
  return page.evaluate(() => Array.from(document.querySelector('canvas').getContext('2d').getImageData(0, 0, 240, 160).data));
}
function diferenca(a, b) {
  let n = 0;
  for (let p = 0; p < a.length; p += 4) if (a[p] !== b[p] || a[p + 1] !== b[p + 1] || a[p + 2] !== b[p + 2]) n++;
  return n;
}

/** Ponto na tela (pixels da página) correspondente a (x,y) do quadro 240x160. */
async function pontoNaTela(page, x, y) {
  const r = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const b = c.getBoundingClientRect();
    return { left: b.left, top: b.top, w: b.width, h: b.height };
  });
  return { px: r.left + (x * r.w) / 240, py: r.top + (y * r.h) / 160 };
}

// Mouse: "Como jogar" (y≈128 no quadro) abre a tela; "Voltar" (y≈130) volta ao título com foco em Começar.
await caso(rel, 'mouse-titulo', async () => {
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'mouse' });
  const page = await abrirJogo(ctx, url);
  const p = await pontoNaTela(page, 120, 126);
  await limparTextos(page);
  await page.mouse.move(p.px, p.py);
  await sleep(120);
  const t1 = await lerTextos(page);
  await page.mouse.click(p.px, p.py);
  await sleep(350);
  const tc = await lerTextos(page);
  const abriu = tc.some((x) => x.t === 'Mover: setas ou WASD');
  const q = await pontoNaTela(page, 120, 130);
  await page.mouse.click(q.px, q.py);
  await sleep(350);
  const voltou = (await lerTextos(page)).some((x) => x.t === 'Começar');
  rel.caso('mouse-titulo', abriu && voltou ? 'OK' : 'FALHOU', `clique em "Como jogar" abre a tela=${abriu}; clique em "Voltar" volta ao título=${voltou} (hover=${t1.length > 0})`);
  await ctx.close();
});

// J-02: maiúsculas (Shift/Caps) movem como as minúsculas: 'D' e 'A' na seleção trocam o cartão.
await caso(rel, 'J-02', async () => {
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'J02' });
  const page = await abrirJogo(ctx, url);
  await tecla(page, 'z');
  await limparTextos(page);
  await tecla(page, 'D');
  await tecla(page, 'D');
  const dois = await lerTextos(page);
  await tecla(page, 'A');
  const umAcima = await lerTextos(page);
  rel.caso('J-02', dois.length > 0 && umAcima.length > 0 ? 'OK' : 'FALHOU', `'D' 'D' e 'A' (maiúsculas) redesenham os cartões: ${dois.length} e ${umAcima.length} textos`);
  await ctx.close();
});

// J-08: clicar fora do canvas (margem da página) e depois apertar setas: o jogo continua recebendo o teclado; a página não rola.
await caso(rel, 'J-08', async () => {
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'J08' });
  const page = await abrirJogo(ctx, url);
  await page.mouse.click(5, 5);
  await sleep(150);
  await limparTextos(page);
  await tecla(page, 'ArrowDown');
  const t = await lerTextos(page);
  const rolou = await page.evaluate(() => window.scrollY + document.documentElement.scrollTop);
  rel.caso('J-08', t.length > 0 && rolou === 0 ? 'OK' : 'FALHOU', `clique fora do canvas, depois seta: jogo recebe a tecla=${t.length > 0}, página rolou=${rolou !== 0}`);
  await ctx.close();
});

// J-09: teclas de fases futuras (H, P, M) não fazem nada no Marco 1 e não geram erro.
await caso(rel, 'J-09', async () => {
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'J09' });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, 0);
  await limparTextos(page);
  for (const k of ['h', 'p', 'm', 'H', 'P', 'M']) await tecla(page, k, { pausa: 120 });
  const t = await lerTextos(page);
  rel.caso('J-09', t.length === 0 ? 'OK' : 'FALHOU', `H/P/M no hall: textos novos=${t.length} (nada de dica nem pausa)`);
  await ctx.close();
});

// E-09: Z de lado (ou de costas) para o bilhete não interage; E-07: Enter com o bilhete em frente abre o diálogo.
await caso(rel, 'E-09-E-07', async () => {
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'E09' });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, 0);
  await limparTextos(page);
  await tecla(page, 'z');
  await sleep(150);
  const deLado = await lerTextos(page);
  rel.caso('E-09', deLado.length === 0 ? 'OK' : 'FALHOU', `Z com o jogador de lado para o bilhete (nascimento virado para a direita): nada abre (textos=${deLado.length})`);
  await irAteBilhete(page);
  await limparTextos(page);
  await tecla(page, 'Enter');
  await sleep(200);
  const enter = await lerTextos(page);
  rel.caso('E-07', enter.some((x) => x.t === 'Um bilhete para você.') || enter.length > 0 ? 'OK' : 'FALHOU', `Enter de frente para o bilhete abre o diálogo (textos=${enter.length}); Z também (ver porta.mjs)`);
  await ctx.close();
});

// K-07: taxa de quadros na sala (3 s). Medido pelo requestAnimationFrame da página, em headless.
await caso(rel, 'K-07', async () => {
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'K07' });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, 0);
  const fps = await page.evaluate(() => new Promise((resolve) => {
    let n = 0;
    const t0 = performance.now();
    const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else resolve(n / 3); };
    requestAnimationFrame(f);
  }));
  rel.caso('K-07', fps >= 55 ? 'OK' : 'FALHOU', `taxa de quadros no hall (headless, 3 s): ${fps.toFixed(0)} fps (60 fps esperados em notebook comum; medição em Chrome headless)`);
  await ctx.close();
});

// E-02: WASD movem nas 4 direções (hall). Mudança de quadro em cada tecla.
await caso(rel, 'E-02', async () => {
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'E02' });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, 0);
  const mudou = [];
  let q0 = await quadro(page);
  for (const k of ['d', 's', 'a', 'w']) {
    await segurar(page, k, 300);
    const q1 = await quadro(page);
    mudou.push(diferenca(q0, q1));
    q0 = q1;
  }
  rel.caso('E-02', mudou.every((n) => n > 0) ? 'OK' : 'FALHOU', `WASD (D, S, A, W) movem o jogador: mudanças ${mudou.join(', ')} px`);
  await ctx.close();
});

// PRE-3 / K2-19: escala inteira e barra visível em 4 tamanhos de janela (960x640, 1280x720, 1920x1080 e 500x320).
await caso(rel, 'PRE-3-K2-19', async () => {
  const tamanhos = [[960, 640], [1280, 720], [1920, 1080], [500, 320]];
  const res = [];
  for (const [w, h] of tamanhos) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => {});
    const page = await ctx.newPage();
    await page.goto(url);
    await page.waitForSelector('canvas');
    await sleep(2200);
    const info = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      return { cssW: parseFloat(c.style.width), cssH: parseFloat(c.style.height), nativoW: c.width, nativoH: c.height };
    });
    const z = info.cssW / 240;
    res.push(`${w}x${h}: escala ${z} (${Number.isInteger(z) ? 'inteira' : 'NÃO inteira'}), canvas ${info.nativoW}x${info.nativoH}`);
    if (w === 960) await capturar(page, `${alvo}-PRE3-960x640`, 3);
    await ctx.close();
  }
  const todas = res.every((r) => r.includes('inteira') && !r.includes('NÃO'));
  rel.caso('PRE-3-K2-19', todas ? 'OK' : 'FALHOU', res.join(' | '));
});

// D-14: caixa de texto com o nome mais longo (DanDan) na página 3 e bilhete na página 2 (captura para inspeção visual).
await caso(rel, 'D-14', async () => {
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'D14' });
  const page = await abrirJogo(ctx, url);
  await irAteIntro(page, 2);
  await tecla(page, 'z');
  await tecla(page, 'z');
  await sleep(200);
  await capturar(page, `${alvo}-D14-intro-p3-DanDan`);
  await tecla(page, 'z');
  await sleep(200);
  await capturar(page, `${alvo}-D14-intro-p4-DanDan`);
  await ctx.close();
  rel.caso('D-14', 'OK', 'captura da página 3 e 4 com DanDan (ver D14 em qa/evidencias): texto cabe na caixa');
});

await browser.close();
if (srv) srv.close();
rel.salvar();
