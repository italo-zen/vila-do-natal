// Capturas REAIS do jogo (build de QA, sem montagem) da Sala na visão 3/4 (ADR-012 E3): em 960×704, 667×375 e 844×390, com o sobrinho ao
// norte e ao sul do sofá, ao lado e ao sul do cacto, e o cacto empurrando. Saída: tools-arte/preview/areas-3-4/.
// Uso: npm run build:qa && node tools/captura-areas.mjs
// Saída: código 1 se houver qualquer erro ou aviso de console / exceção não capturada.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const [, , arquivoArg, saidaArg] = process.argv;
const arquivo = arquivoArg ?? 'dist-qa/index.html';
const saida = saidaArg ?? 'tools-arte/preview/areas-3-4';
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

async function novaPagina(rotulo, viewport = { width: 960, height: 640 }, toque = false) {
  const page = await (await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: toque, isMobile: toque })).newPage();
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



const TELAS = [
  { nome: '960x704', viewport: { width: 960, height: 704 }, toque: false },
  { nome: '667x375', viewport: { width: 667, height: 375 }, toque: true },
  { nome: '844x390', viewport: { width: 844, height: 390 }, toque: true },
];
for (const tela of TELAS) {
  const page = await novaPagina(`sala-${tela.nome}`, tela.viewport, tela.toque);
  const foto = (nome) => page.screenshot({ path: `${saida}/sala-${tela.nome}-${nome}.png` });
  const em = async (tx, ty, dir = 'baixo') => {
    await page.evaluate(([x, y, d]) => window.__posicionar(x, y, d), [tx, ty, dir]);
    await esperar(200);
  };
  await page.evaluate(() => { window.__partidaConcluida('lolo', false); window.__irPara('Casa', { modo: 'explorar' }); });
  await esperar(1500);
  await page.evaluate(() => window.__teleportar('sala', 'hall-sala'));
  await esperar(600);
  // Visão geral, com o sobrinho na entrada (4, 8).
  await foto('geral');
  // Ao norte e ao sul do sofá (3, 3), 2×2: o sobrinho atrás (norte) e na frente (sul).
  await em(4, 2, 'baixo');
  await foto('sofa-norte');
  await em(4, 5, 'cima');
  await foto('sofa-sul');
  // O cacto (0, 3) tem parede ao norte (não há piso para ficar atrás dele): ao lado (1, 3) e ao sul (0, 4).
  await em(1, 3, 'esquerda');
  await foto('cacto-leste');
  await em(0, 4, 'cima');
  await foto('cacto-sul');
  // Rack (2..5, 1), mesa de jantar (6..8, 5..6) e cômoda (10, 5..7): o sobrinho ao lado de cada um.
  await em(4, 2, 'cima');
  await foto('rack-sul');
  await em(5, 6, 'direita');
  await foto('mesa-oeste');
  await em(9, 6, 'direita');
  await foto('comoda-oeste');
  // Vidro da Sala (parede oeste, x = 0, linhas 3 a 8): o sobrinho encostado nele.
  await em(1, 6, 'esquerda');
  await foto('vidro-oeste');
  // Mural de fotos (face norte do tile (9, 4), ao lado da porta cozinha-sala).
  await em(9, 4, 'cima');
  await foto('mural');
  // Portas da alcova: no meio da alcova (7, 1), olhando para cima.
  await em(7, 1, 'cima');
  await foto('alcova-portas');
  // Cacto empurrando: encosta nele por baixo e para a esquerda; cinco quadros a cada 60 ms em volta do empurrão.
  await em(1, 3, 'esquerda');
  await page.keyboard.down('ArrowLeft');
  let n = 0;
  for (let i = 0; i < 40 && n < 6; i++) {
    await esperar(60);
    if (i >= 6) await foto(`cacto-empurrando-${n++}`);
  }
  await page.keyboard.up('ArrowLeft');
  // Cozinha e Lavanderia (lote 2): chegada pela cozinha-sala (0, 0) e os móveis principais.
  await page.evaluate(() => window.__teleportar('cozinha', 'cozinha-sala'));
  await esperar(600);
  await foto('cozinha-geral');
  await em(2, 1, 'baixo');
  await foto('cozinha-geladeira-norte');
  await em(2, 3, 'cima');
  await foto('cozinha-geladeira-sul');
  await em(4, 1, 'direita');
  await foto('cozinha-pia-fogao');
  await em(1, 3, 'esquerda');
  await foto('cozinha-armarios-oeste');
  await em(4, 3, 'baixo');
  await foto('lavanderia-lava-roupas-norte');
  await em(3, 3, 'direita');
  await foto('lavanderia-tanque-oeste');
  // Outras áreas (as fechadas só abrem com o gancho de QA): Quarto da Oli, Quarto do casal, Escritório e os pequenos.
  await page.evaluate(() => window.__abrirTodasAsAreas());
  const area = async (id, spawn, rotulo, tiles) => {
    await page.evaluate(([a, sp]) => window.__teleportar(a, sp), [id, spawn]);
    await esperar(600);
    await foto(`${rotulo}-geral`);
    for (const [nome, tx, ty, dir] of tiles) {
      await em(tx, ty, dir);
      await foto(`${rotulo}-${nome}`);
    }
  };
  await area('quarto', 'quarto-sala', 'quarto-da-oli', [['cama-sul', 1, 2, 'cima'], ['comoda', 2, 1, 'direita']]);
  await area('quarto_casal', 'quarto_casal-sala', 'quarto-do-casal', [['cama-sul', 2, 3, 'cima'], ['armario-norte', 2, 3, 'baixo'], ['porta-sala', 5, 4, 'direita'], ['porta-banheiro', 3, 1, 'direita']]);
  await area('escritorio', 'escritorio-sala', 'escritorio', [['mesa-sul', 5, 1, 'cima'], ['cama-oeste', 4, 2, 'direita']]);
  await area('banheiro1', 'banheiro1-quarto', 'banheiro-1', [['porta-quarto', 3, 2, 'baixo'], ['porta-quarto-casal', 0, 1, 'esquerda']]);
  await area('banheiro_escritorio', 'banheiro_escritorio-escritorio', 'banheiro-do-escritorio', [['porta', 0, 0, 'esquerda']]);
  await area('quartinho', 'cozinha-quartinho', 'quartinho', []);
  await area('hall', 'hall-sala', 'hall', [['bilhete', 2, 0, 'cima']]);
  // Setas de farejar (amarelas) nas portas de cada lado, e os indicadores de direção das portas.
  for (const [areaId, spawn, porta, rotulo] of [['quarto', 'quarto-sala', 'quarto-sala', 'quarto-sala-baixo'], ['sala', 'hall-sala', 'quarto-sala', 'sala-quarto-cima'], ['sala', 'hall-sala', 'cozinha-sala', 'sala-cozinha-direita'], ['cozinha', 'cozinha-sala', 'cozinha-sala', 'cozinha-sala-esquerda'], ['hall', 'hall-sala', 'hall-sala', 'hall-sala-cima']]) {
    await page.evaluate(([a, b]) => window.__teleportar(a, b), [areaId, spawn]);
    await esperar(500);
    await page.evaluate((p) => window.__seta(p), porta);
    await esperar(1600);
    await foto(`seta-farejar-${rotulo}`);
  }
  // Modo explorar (enfeites de Natal, com `elevacao` sobre os móveis): as 5 áreas do modo.
  await page.evaluate(() => { window.__partidaConcluida('lolo', true); window.__irPara('Casa', { modo: 'explorar' }); });
  await esperar(1500);
  for (const [id, sp] of [['sala', 'hall-sala'], ['cozinha', 'cozinha-sala'], ['escritorio', 'escritorio-sala'], ['quarto', 'quarto-sala'], ['hall', 'hall-sala'], ['quarto_casal', 'quarto_casal-sala'], ['banheiro1', 'banheiro1-quarto'], ['banheiro_escritorio', 'banheiro_escritorio-escritorio']]) {
    await page.evaluate(([a, b]) => window.__teleportar(a, b), [id, sp]);
    await esperar(600);
    await foto(`explorar-${id}`);
  }
  // Interruptor de parede: do tile em frente (6, 4), olhando para cima (brilho na placa).
  await page.evaluate(() => window.__teleportar('sala', 'hall-sala'));
  await esperar(600);
  await em(6, 4, 'cima');
  await foto('interruptor-de-frente');
  // Interruptor apagado e aceso, e a árvore em todos os estados (partida nova, fase a fase).
  await page.evaluate(() => { window.__novaPartida('lolo'); window.__irPara('Casa', { modo: 'intro' }); });
  await esperar(1500);
  await page.evaluate(() => window.__irParaFase('parte1'));
  await page.evaluate(() => window.__teleportar('sala', 'hall-sala'));
  await esperar(600);
  await em(5, 4, 'direita');
  await foto('arvore-0-desmontada');
  for (const [fase, n] of [['parte2', 1], ['parte3', 2], ['enfeites', 3]]) {
    await page.evaluate((f) => window.__irParaFase(f), fase);
    await page.evaluate(() => window.__teleportar('sala', 'hall-sala'));
    await esperar(600);
    await foto(`arvore-${n}`);
  }
  await page.evaluate(() => { window.__partidaConcluida('lolo', false); window.__irPara('Casa', { modo: 'explorar' }); });
  await esperar(1500);
  await page.evaluate(() => window.__teleportar('sala', 'hall-sala'));
  await esperar(600);
  await foto('arvore-4-enfeitada');
  await page.evaluate(() => { window.__novaPartida('lolo'); window.__irPara('Casa', { modo: 'intro' }); });
  await esperar(1500);
  await page.evaluate(() => window.__irParaFase('luzes'));
  await page.evaluate(() => window.__teleportar('sala', 'hall-sala'));
  await esperar(600);
  await esperar(900);
  // Fecha o aviso "Está tudo escuro!" (primeira entrada) e espera a pausa de entrada.
  await page.keyboard.down('z');
  await esperar(80);
  await page.keyboard.up('z');
  await esperar(700);
  await em(5, 4, 'direita');
  await esperar(400);
  await foto('interruptor-apagado');
  await page.keyboard.down('z');
  await esperar(80);
  await page.keyboard.up('z');
  await esperar(250);
  await foto('interruptor-aceso');
  await page.close();
  console.log(`${tela.nome}: capturas da Sala gravadas`);
}
await browser.close();
console.log(JSON.stringify({ erros }, null, 2));
process.exitCode = erros.length > 0 ? 1 : 0;
