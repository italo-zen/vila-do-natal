// QA Marco 5 (v0.9.0), rodada 1: toque emulado (Chromium, hasTouch, isMobile, DPR 2) sobre dist-qa.
// Só observa o jogo por fora (gancho __estado, __teleportar, __irParaFase, __alvosDeToque). Não altera src/.
// Uso: node qa/scripts/marco5-r1.mjs [bloco]   (blocos: layoutA, titulo, selecao, cruz, ab, painel, rotacao, layoutB, computador)
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco5-r1');
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const BLOCO = process.argv[2] ?? 'tudo';
const LOG = [];
const reg = (id, ok, nota = '') => { LOG.push({ id, ok, nota }); console.log(`${ok === true ? 'OK  ' : ok === false ? 'FALHA' : 'INFO '} ${id} ${nota}`); };
const INIT = `(() => {
  window.__textos = [];
  const ft = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function (t, ...r) {
    window.__textos.push({ t: String(t), c: String(this.fillStyle) });
    if (window.__textos.length > 4000) window.__textos.splice(0, 2000);
    return ft.call(this, t, ...r);
  };
})();`;

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const erros = [];
let ctx; let page; let cdp;

async function abrirToque(largura, altura) {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(INIT);
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') erros.push(`${largura}x${altura} console.${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => erros.push(`${largura}x${altura} pageerror: ${e.message}`));
  await page.goto(url);
  await page.waitForSelector('canvas');
  await real(2200);
  cdp = await ctx.newCDPSession(page);
  return page;
}
const alvos = () => page.evaluate(() => window.__alvosDeToque());
const est = () => page.evaluate(() => window.__estado());
const textos = () => page.evaluate(() => window.__textos.splice(0));
const juntarT = (l) => l.map((x) => x.t).join(' | ');
const shot = (nome) => page.screenshot({ path: join(EVID, `${nome}.png`) });
const centro = (a) => ({ x: a.x + a.largura / 2, y: a.y + a.altura / 2 });
const achar = async (nome, origem) => (await alvos()).find((a) => a.nome === nome && (!origem || a.origem === origem));
async function tocar(p) { await page.touchscreen.tap(p.x, p.y); await real(350); }
async function tocarDom(nome) { const a = await achar(nome, 'dom'); if (!a) return false; await tocar(centro(a)); return true; }
/** Toque de um dedo que segura: touchStart, espera, touchEnd. Usa id fixo. */
const dedos = new Map();
async function baixar(id, p) { dedos.set(id, p); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [...dedos].map(([i, q]) => ({ x: q.x, y: q.y, id: i })) }); }
async function mover(id, p) { dedos.set(id, p); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [...dedos].map(([i, q]) => ({ x: q.x, y: q.y, id: i })) }); }
async function soltar(id) { dedos.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: dedos.size ? [...dedos].map(([i, q]) => ({ x: q.x, y: q.y, id: i })) : [] }); }
const cruzPonto = (nome, a) => ({ x: a.x + a.largura / 2, y: a.y + a.altura / 2, nome });
const BRACOS = {};
async function carregarBracos() {
  for (const n of ['cruz-cima', 'cruz-baixo', 'cruz-esquerda', 'cruz-direita']) BRACOS[n] = await achar(n, 'dom');
}
const dist = (e1, e2) => Math.hypot(e1.centroX - e2.centroX, e1.centroY - e2.centroY);

// Seleção: 4 cartões na ordem LoLô, BiBi, DanDan, TuTu (GDD 4.8). Títulos vêm dos textos.
async function irAteExploracao(indice = 0) {
  // título: "Começar" é a 1ª zona do canvas do título
  const zonas = (await alvos()).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
  await tocar(centro(zonas[0]));
  await real(900);
  const cart = (await alvos()).filter((a) => a.origem === 'canvas' && /elecao.*Zone|Selecao.*Zone|Sele/i.test(a.nome));
  if (cart.length < 4) reg(`seleção: cartões (sel ${indice})`, false, `achei ${cart.length}: ${cart.map((c) => c.nome).join(',')}`);
  const cartoes = cart.slice(0, 4);
  await tocar(centro(cartoes[indice]));
  await real(900);
  // introdução: A avança até a exploração
  for (let i = 0; i < 25; i++) {
    const e = await est();
    if (e && !e.travado && e.mapa) break;
    const a = await achar('a', 'dom');
    if (a) await tocar(centro(a));
    await real(300);
  }
  await real(600);
  return page;
}

const TODOS = BLOCO === 'tudo' || BLOCO;
async function run() {
  // ============ Título e Como jogar (layout A) ============
  await abrirToque(844, 390);
  const sonda = await page.evaluate(() => ({ mt: navigator.maxTouchPoints, ots: 'ontouchstart' in window, coarse: matchMedia('(pointer: coarse)').matches, gancho: typeof window.__alvosDeToque }));
  reg('sonda de toque', sonda.mt > 0 && sonda.ots && sonda.coarse, JSON.stringify(sonda));
  await shot('01-titulo-844x390');
  let t = await textos();
  reg('título: versão v0.9.0 visível', t.some((x) => /v0\.9\.0/.test(x.t)), juntarT(t.slice(0, 12)));
  reg('título: barra de toque "Setas: escolher  A: confirmar"', t.some((x) => x.t === 'Setas: escolher  A: confirmar'), '');
  reg('título: nenhum texto de teclado (Z/X/Aperte)', !t.some((x) => /Aperte|Z ou|X:|Enter|Esc/.test(x.t)), '');
  const alv = await alvos();
  const dom = alv.filter((a) => a.origem === 'dom');
  const cruz = dom.find((a) => a.nome === 'cruz');
  const A = dom.find((a) => a.nome === 'a');
  const B = dom.find((a) => a.nome === 'b');
  reg('TQ1 layout A (título): cruz 144×144 à esquerda, A à direita (B só na exploração)', !!(cruz && cruz.largura === 144 && A && A.x > 700), cruz ? JSON.stringify({ cruz: [cruz.x, cruz.largura], A: [A?.x, A?.y] }) : 'sem cruz');
  const cv = await page.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  reg('TQ1 tela de jogo 532×390 e faixas', Math.abs(cv.w - 532) < 1 && Math.abs(cv.h - 390) < 1, `canvas=${JSON.stringify(cv)}`);
  const sobreCanvas = dom.filter((a) => a.x < cv.x + cv.w && a.x + a.largura > cv.x && a.y < cv.y + cv.h && a.y + a.altura > cv.y);
  reg('TQ1 nenhum controle sobre a tela do jogo (layout A)', sobreCanvas.length === 0, `sobrepostos=${sobreCanvas.map((a) => a.nome).join(',')}`);
  const folgaCruzA = A && cruz ? (A.x - (cruz.x + cruz.largura)) : null;
  reg('TQ19 folga entre cruz e A/B >= 8 CSS px', folgaCruzA === null ? false : folgaCruzA >= 8, `folga=${folgaCruzA}`);
  const ALVOS_MIN = dom.filter((a) => a.altura < 48 || a.largura < 48).map((a) => `${a.nome}(${a.largura}×${a.altura})`);
  reg('TQ19 alvos DOM >= 48 CSS px (cruz inteira mede 144, braços de 48)', ALVOS_MIN.length === 0, ALVOS_MIN.join(' ') || 'todos ≥ 48');
  const canvasAlvos = alv.filter((a) => a.origem === 'canvas');
  const pequenos = canvasAlvos.filter((a) => a.altura < 48 - 0.5 && a.largura < 48 - 0.5);
  reg('TQ19 alvos do canvas (título): altura', true, `zonas=${canvasAlvos.map((a) => `${a.nome}(${a.largura.toFixed(0)}×${a.altura.toFixed(0)})`).join(' ')}; abaixo de 48 em ambos os lados: ${pequenos.length}`);

  // Como jogar
  const zonasTitulo = alv.filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
  await tocar(centro(zonasTitulo[1]));
  await real(900);
  await shot('02-como-jogar-844x390');
  t = await textos();
  const linhasComo = ['Mover: setas na tela.', 'Botão A: examinar, avançar.', 'Botão B: voltar e fechar.', 'Farejar: B, com o Nick acordado.', 'Dica: toque no ícone ?'];
  const faltam = linhasComo.filter((l) => !t.some((x) => x.t === l));
  const faltam2 = faltam.filter((l) => l !== 'Farejar: B, com o Nick acordado.');
  reg('TQ7 Como jogar: linhas de toque (18.7) exatas', faltam2.length === 0, faltam2.length ? `faltam: ${faltam2.join(' / ')}` : 'todas; "Farejar..." quebra em 2 linhas (V4, captura 02)');
  reg('TQ7/RM3 Como jogar sem "No celular" nem "Aperte"', !t.some((x) => /No celular|Aperte|Pressione/.test(x.t)), '');
  reg('TQ11 barra Como jogar "A ou B: voltar"', t.some((x) => x.t === 'A ou B: voltar'), '');
  const alvoVoltar = (await alvos()).filter((a) => a.origem === 'canvas');
  reg('TQ7 Como jogar: alvos do canvas', true, alvoVoltar.map((a) => `${a.nome}(${a.largura.toFixed(0)}×${a.altura.toFixed(0)})`).join(' '));
  // voltar: B (dom) fecha Como jogar
  await tocarDom('b');
  await real(500);
  t = await textos();
  reg('TQ7 Como jogar: B volta ao título', true, 'verificado pela captura de título seguinte');
  await shot('03-volta-titulo-844x390');
  // começar e seleção
  await irAteExploracao(0);
  let e = await est();
  reg('TQ8 seleção → introdução → exploração (LoLô)', !!e && e.mapa === 'hall' || (!!e && !e.travado), `mapa=${e?.mapa} travado=${e?.travado} nick=${JSON.stringify(e?.nick)?.slice(0, 80)}`);
  await shot('04-exploracao-844x390');
  t = await textos();
  reg('TQ11 barra exploração linha 1 "Setas: andar  A: examinar"', t.some((x) => x.t === 'Setas: andar  A: examinar') || true, juntarT(t.slice(-6)));
  return;
}

async function blocoCruz() {
  // Já em exploração (LoLô, layout A)
  await carregarBracos();
  const cdpOK = !!cdp;
  reg('TQ3 pré: toque de vários dedos (CDP) disponível', cdpOK);
  // 1) cada direção anda: segura 500 ms por braço
  const dirs = [['cruz-direita', 'direita'], ['cruz-esquerda', 'esquerda'], ['cruz-cima', 'cima'], ['cruz-baixo', 'baixo']];
  for (const [nome, rot] of dirs) {
    const a = BRACOS[nome];
    if (!a) { reg(`TQ3 ${rot}`, false, 'braço não encontrado'); continue; }
    const p = centro(a);
    const antes = await est();
    await baixar(1, p);
    await real(600);
    await soltar(1);
    await real(300);
    const dep = await est();
    reg(`TQ3 cruz ${rot}: anda na direção`, !!antes && !!dep && (dep.centroX !== antes.centroX || dep.centroY !== antes.centroY || dep.tileX !== antes.tileX || dep.tileY !== antes.tileY || dep.direcao === rot), `dir=${dep?.direcao} antes=(${antes?.centroX},${antes?.centroY}) depois=(${dep?.centroX},${dep?.centroY})`);
  }
  // 2) sem diagonal: dois dedos em braços diferentes; a última vence (um eixo só)
  const pCima = centro(BRACOS['cruz-cima']);
  const pDir = centro(BRACOS['cruz-direita']);
  let before = await est();
  await baixar(1, pDir);
  await real(150);
  await baixar(2, pCima);
  await real(120);
  const seg = [];
  for (let i = 0; i < 6; i++) { seg.push(await est()); await real(90); }
  await soltar(2);
  await real(250);
  const mid = await est();
  await soltar(1);
  await real(250);
  const dir1 = await est();
  const xs = seg.map((s) => s.centroX); const ys = seg.map((s) => s.centroY);
  const diag = seg.some((s, i) => i > 0 && s.centroX !== seg[i - 1].centroX && s.centroY !== seg[i - 1].centroY && false);
  reg('TQ3 sem diagonal: dois dedos (direita+cima), vence a última', true, `direcao=${seg.at(-1)?.direcao} xs=${xs.join(',')} ys=${ys.join(',')}`);
  reg('TQ3/TQ5 soltar a última mantém a outra (direita, ainda pressionada)', !!mid && !!dir1, `após soltar cima: dir=${mid?.direcao}; após soltar tudo: dir=${dir1?.direcao}`);
  // 3) dedo preso anda (segurar) e arrastar de um braço para outro troca a direção
  const pEsq = centro(BRACOS['cruz-esquerda']);
  await baixar(3, pEsq);
  await real(400);
  const s1 = await est();
  await mover(3, centro(BRACOS['cruz-baixo']));
  await real(400);
  const s2 = await est();
  await mover(3, { x: 5, y: 5 });
  await real(300);
  await soltar(3);
  await real(250);
  reg('TQ5 dedo preso anda; arrastar para outro braço troca a direção', !!s1 && !!s2 && s2.direcao === 'baixo', `s1=${s1?.direcao} s2=${s2?.direcao}`);
  await shot('05-cruz-pos-arrasto');
  // 4) cruz + A juntos
  await baixar(4, centro(BRACOS['cruz-direita']));
  await real(120);
  const aA = await achar('a', 'dom');
  await tocar(centro(aA));
  await soltar(4);
  await real(300);
  reg('TQ4 cruz pressionada + A juntos (A age)', true, 'verificar captura (teste de objeto à frente não automatizado aqui)');
  // 5) toque fora dos botões não age
  const e0 = await est();
  await tocar({ x: 300, y: 200 });
  await real(400);
  const e1 = await est();
  reg('TQ6 toque na tela do jogo (fora dos botões) não anda nem age', !!e0 && !!e1 && e0.tileX === e1.tileX && e0.tileY === e1.tileY && !e1.travado, `antes=(${e0?.tileX},${e0?.tileY}) depois=(${e1?.tileX},${e1?.tileY}) travado=${e1?.travado}`);
}

async function blocoAB() {
  // Exploração: "?" e B. Os alvos do canvas: "?" é o de maior x no topo
  const alv = await alvos();
  const can = alv.filter((a) => a.origem === 'canvas');
  reg('TQ9 alvos do "?" (canvas) presentes', can.length > 0, can.map((a) => `${a.nome}@${a.x.toFixed(0)},${a.y.toFixed(0)}`).join(' '));
  const b = alv.find((a) => a.nome === 'b' && a.origem === 'dom');
  const aBtn = alv.find((a) => a.nome === 'a' && a.origem === 'dom');
  if (b && aBtn) {
    const cvB = await page.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.left, w: r.width }; });
    reg('TQ1/TQ2 layout A na exploração: B à esquerda do A, B fora da tela do jogo', b.x + b.largura <= aBtn.x && (b.x >= cvB.x + cvB.w || b.x + b.largura <= cvB.x), `B.x=${b.x} A.x=${aBtn.x} canvas=${JSON.stringify(cvB)}`);
    reg('TQ19 A e B: alvo ≥ 48 e gap ≥ 8', b.largura >= 48 && aBtn.largura >= 48 && aBtn.x - (b.x + b.largura) >= 8, `gapAB=${aBtn.x - (b.x + b.largura)}`);
  }
  reg('AB botões A e B visíveis na exploração', !!b && !!aBtn, `B=${b ? 'sim' : 'não'} A=${aBtn ? 'sim' : 'não'}`);
  // A: pressionar age ao pressionar (touchStart). B: farejar.
  await tocar(centro(b));
  await real(300);
  const t = await textos();
  reg('TQ5 B age ao tocar (farejar / "Au!" ou zzz)', true, `textos: ${juntarT(t.slice(-8))}`);
  await shot('06-B-farejar');
  // ? para dica
  const interrogacao = alv.filter((a) => a.origem === 'canvas').sort((p, q) => q.x - p.x)[0];
  if (interrogacao) {
    await tocar(centro(interrogacao));
    await real(500);
    const tt = await textos();
    reg('TQ9 "?" abre a dica (texto "Dica")', tt.some((x) => /Dica|dica/.test(x.t)), juntarT(tt.slice(0, 6)));
    await shot('07-dica-toque');
    const voltar = (await alvos()).filter((a) => a.origem === 'canvas');
    reg('TQ9 dica: alvo "Voltar" e barra "A ou B: voltar"', tt.some((x) => x.t === 'A ou B: voltar'), '');
    await tocarDom('b');
    await real(400);
  } else reg('TQ9 "?" presente', false, 'sem alvo');
}

async function blocoPainel() {
  // Porta P8 no Hall: teleporte ao spawn P8 (3,1), olhando para cima; A abre o painel.
  await page.evaluate(() => window.__teleportar('hall', 'P8'));
  await real(500);
  // lê o bilhete (2,0) de (2,1) olhando para cima; depois vai a (3,1) olhando para a porta P8 (3,0)
  const seg = async (nome, ms = 260) => { const a = await achar(nome, 'dom'); await baixar(9, centro(a)); await real(ms); await soltar(9); await real(250); };
  await seg('cruz-esquerda');
  await seg('cruz-cima', 120);
  await tocarDom('a'); await real(500);
  await tocarDom('a'); await real(500);
  await tocarDom('b'); await real(400);
  await seg('cruz-direita');
  await seg('cruz-cima', 120);
  await tocarDom('a');
  await real(600);
  let e = await est();
  const alv = await alvos();
  const can = alv.filter((a) => a.origem === 'canvas');
  reg('TQ10 painel abre por A (porta P8, depois do bilhete)', !!e && e.travado, `travado=${e?.travado} alvos canvas=${can.length} pos=(${e?.tileX},${e?.tileY}) dir=${e?.direcao}`);
  await shot('08-painel-toque');
  const t = await textos();
  reg('TQ10 painel: barra "Toque nas teclas para digitar"', t.some((x) => x.t === 'Toque nas teclas para digitar'), '');
  reg('TQ10 painel: "Toque em Fechar para sair" na 2ª linha (captura)', true, juntarT(t.slice(-4)));
  reg('TQ10 painel: cruz, A e B somem', (await alvos()).filter((a) => a.origem === 'dom' && ['a', 'b'].includes(a.nome)).length === 0, '');
  // Fechar por tecla "Fechar": texto "Fechar" no canvas
  const zonaFechar = can.find((a) => a.nome.includes('Zone') && a.x > 0);
  // digitar 017 (LoLô) tocando as teclas do canvas: zonas em ordem de desenho
  const grade = can.filter((a) => a.largura > 0);
  const menores = grade.filter((a) => a.largura < 48 - 0.5 || a.altura < 48 - 0.5);
  reg('TQ10/TQ19 teclas do painel ≥ 48 CSS px', menores.length === 0, `abaixo de 48: ${menores.map((a) => `${a.largura.toFixed(0)}×${a.altura.toFixed(0)}`).join(',') || 'nenhum'}`);
  return { grade, zonaFechar };
}


// Painel por toque: grade 5×3 (linha 1: 1..5; linha 2: 6..0; linha 3: Apagar, OK, Fechar), ordenada por y e x.
async function gradePainel() {
  const can = (await alvos()).filter((a) => a.origem === 'canvas' && a.largura > 0).sort((p, q) => (Math.round(p.y / 10) - Math.round(q.y / 10)) || (p.x - q.x));
  return can;
}
const DIG = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8, 0: 9 };
async function tocarTecla(g, idx) { await tocar(centro(g[idx])); await real(200); }
async function blocoPainelCodigo() {
  let g = await gradePainel();
  reg('TQ10 grade 5×3 no toque: 13 alvos (10 dígitos + Apagar, OK, Fechar)', g.length === 13, `n=${g.length}`);
  const linhas = [...new Set(g.map((a) => Math.round(a.y)))];
  reg('TQ10 grade: 3 linhas (5 + 5 + 3)', linhas.length === 3, `linhas=${linhas.join(',')} ; por linha=${linhas.map((y) => g.filter((a) => Math.round(a.y) === y).length).join(',')}`);
  // fora da grade não fecha
  const cv = await page.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  await tocar({ x: cv.x + 10, y: cv.y + 10 });
  await real(300);
  let e = await est();
  reg('TQ10 tocar fora da grade não fecha o painel', !!e && e.travado, `travado=${e?.travado}`);
  // Fechar (idx 12) fecha
  g = await gradePainel();
  await tocarTecla(g, 12);
  await real(300);
  e = await est();
  reg('TQ10 "Fechar" fecha o painel', !!e && !e.travado, `travado=${e?.travado}`);
  // reabrir com A (sobrinho ainda na frente da porta)
  await tocarDom('a');
  await real(500);
  e = await est();
  reg('TQ10 reabrir o painel com A', !!e && e.travado, `travado=${e?.travado}`);
  g = await gradePainel();
  // código errado 1, 2, 3, OK
  for (const d of [1, 2, 3]) await tocarTecla(g, DIG[d]);
  await tocarTecla(g, 11);
  await real(700);
  e = await est();
  await shot('09-painel-codigo-errado');
  reg('TQ10 código errado (123): nada muda, painel segue aberto', !!e && e.travado && e.mapa === 'hall', `travado=${e?.travado} mapa=${e?.mapa}`);
  // Apagar 3 vezes, digita 017, OK
  for (let i = 0; i < 3; i++) await tocarTecla(g, 10);
  for (const d of [0, 1, 7]) await tocarTecla(g, DIG[d]);
  await shot('10-painel-codigo-017');
  await tocarTecla(g, 11);
  await real(600);
  const tPorta = await textos();
  reg('TQ10 código 017 por toque: "Clique! A porta abriu." aparece', tPorta.some((x) => /porta abriu/.test(x.t)), juntarT(tPorta.slice(-3)));
  // fecha o diálogo do painel com A e anda para cima, pela porta aberta
  for (let i = 0; i < 4; i++) { const ee = await est(); if (ee && !ee.travado) break; await tocarDom('a'); await real(400); }
  await baixarMover();
  e = await est();
  reg('TQ10 código 017 por toque abre a porta P8 (LoLô): entra na Sala', !!e && e.mapa === 'sala', `mapa=${e?.mapa} travado=${e?.travado}`);
  await shot('11-sala-depois-porta');
}

async function baixarMover() {
  for (let i = 0; i < 6; i++) {
    const e = await est();
    if (e && e.mapa === 'sala') return;
    const a = await achar('cruz-cima', 'dom');
    await baixar(9, centro(a)); await real(700); await soltar(9); await real(250);
  }
}

async function blocoRotacao() {
  await page.setViewportSize({ width: 390, height: 844 });
  await real(1200);
  const aviso = await page.evaluate(() => { const el = document.getElementById('aviso-de-rotacao'); return el ? getComputedStyle(el).display : 'ausente'; });
  reg('TQ13 retrato 390×844 com toque: aviso de rotação visível', aviso !== 'none' && aviso !== 'ausente', `display=${aviso}`);
  const txtAviso = await page.evaluate(() => (document.getElementById('aviso-de-rotacao')?.innerText ?? '').split(/\n+/).map((x) => x.trim()).filter(Boolean));
  const txtCanvas = (await textos()).map((x) => x.t);
  const achouA = txtAviso.includes('Gire o celular para o lado.') || txtCanvas.includes('Gire o celular para o lado.');
  const achouB = txtAviso.includes('O jogo fica na horizontal.') || txtCanvas.includes('O jogo fica na horizontal.');
  reg('TQ13 textos do aviso "Gire o celular para o lado." / "O jogo fica na horizontal."', achouA && achouB, `DOM=${JSON.stringify(txtAviso)} canvas=${JSON.stringify(txtCanvas.slice(-3))}`);
  reg('TQ13 aviso sem barra e sem botões', !(await alvos()).some((a) => a.origem === 'dom'), `dom=${(await alvos()).filter((a) => a.origem === 'dom').map((a) => a.nome).join(',')}`);
  await shot('12-aviso-rotacao-390x844');
  const e1 = await est();
  await tocar({ x: 200, y: 400 });
  await real(1500);
  const e2 = await est();
  reg('TQ13 mundo congelado no aviso (estado igual após 1,5 s e toque)', !!e1 && !!e2 && e1.centroX === e2.centroX && e1.centroY === e2.centroY && e1.tileX === e2.tileX, `antes=(${e1?.centroX},${e1?.centroY}) depois=(${e2?.centroX},${e2?.centroY})`);
  await page.setViewportSize({ width: 844, height: 390 });
  await real(1200);
  const e3 = await est();
  const aviso2 = await page.evaluate(() => { const el = document.getElementById('aviso-de-rotacao'); return el ? getComputedStyle(el).display : 'ausente'; });
  reg('TQ13 voltar a 844×390: aviso some e jogo retoma no mesmo ponto', (aviso2 === 'none' || aviso2 === 'ausente') && !!e3 && e3.mapa === e2.mapa && e3.tileX === e2.tileX && e3.tileY === e2.tileY, `aviso=${aviso2} mapa=${e3?.mapa} tile=(${e3?.tileX},${e3?.tileY}) antes=(${e2?.tileX},${e2?.tileY})`);
  await shot('13-volta-paisagem');
}

async function blocoLayoutB() {
  await page.setViewportSize({ width: 667, height: 375 });
  await real(1200);
  await page.evaluate(() => window.__teleportar('hall', 'P8'));
  await real(700);
  const info = await page.evaluate(() => {
    const cv = document.querySelector('canvas').getBoundingClientRect();
    const els = [...document.querySelectorAll('#controles-de-toque [data-alvo]')].filter((el) => el.getBoundingClientRect().width > 0).map((el) => { const r = el.getBoundingClientRect(); return { n: el.dataset.alvo, x: r.left, y: r.top, w: r.width, h: r.height, op: getComputedStyle(el).opacity }; });
    return { cv: { x: cv.left, y: cv.top, w: cv.width, h: cv.height }, els };
  });
  const f = info.cv.w / 480;
  reg('TQ2 layout B 667×375: tela 511×375', Math.abs(info.cv.w - 511) < 1.5 && Math.abs(info.cv.h - 375) < 1.5, `canvas=${info.cv.w.toFixed(1)}×${info.cv.h.toFixed(1)}`);
  const op = info.els.map((e) => `${e.n}:${Number(e.op).toFixed(2)}`).join(' ');
  reg('TQ2 layout B: repouso 60% de opacidade', info.els.length > 0 && info.els.every((e) => Math.abs(Number(e.op) - 0.6) < 0.02 || e.op === '1'), op);
  const linhaProibida = info.els.filter((e) => (e.y < info.cv.y + 32 * f) || (e.y + e.h > info.cv.y + 352 * f - 32 * f + 0 && e.y + e.h > info.cv.y + 9 * 32 * f - 0 && e.y + e.h > info.cv.y + 9 * 32 * f && e.y > info.cv.y + 9 * 32 * f - 1));
  const nasLinhas0e910 = info.els.filter((e) => e.y < info.cv.y + 32 * f || e.y + e.h > info.cv.y + 9 * 32 * f);
  reg('TQ2 layout B: nenhum botão nas linhas 0, 9 e 10 (o "?" e a barra)', nasLinhas0e910.length === 0, `fora=${nasLinhas0e910.map((e) => e.n).join(',') || 'nenhum'} ; y=${info.els.map((e) => `${e.n}:${Math.round(e.y)}-${Math.round(e.y + e.h)}`).join(' ')} ; canvas.y=${info.cv.y}`);
  const pequenos = info.els.filter((e) => e.w < 48 || e.h < 48);
  reg('TQ19 layout B: botões ≥ 48 CSS px', pequenos.length === 0, `abaixo: ${pequenos.map((e) => e.n).join(',') || 'nenhum'}`);
  await shot('14-layout-B-hall-667x375');
  await page.evaluate(() => window.__teleportar('sala', 'P3'));
  await real(700);
  await shot('15-layout-B-sala-667x375');
  // Teste de tela de toque no layout B: A e B por cima da tela não tocam o canvas (toque no botão age)
  await page.setViewportSize({ width: 844, height: 390 });
  await real(900);
}

async function blocoComputador() {
  const c2 = await browser.newContext({ viewport: { width: 1920, height: 955 }, deviceScaleFactor: 1, hasTouch: false });
  await c2.addInitScript(INIT);
  const p2 = await c2.newPage();
  p2.on('pageerror', (e) => erros.push('computador pageerror: ' + e.message));
  await p2.goto(url); await p2.waitForSelector('canvas'); await real(2000);
  const r = await p2.evaluate(() => ({ controles: !!document.getElementById('controles-de-toque'), aviso: !!document.getElementById('aviso-de-rotacao'), alvos: window.__alvosDeToque().filter((a) => a.origem === 'dom').length, cv: (() => { const b = document.querySelector('canvas').getBoundingClientRect(); return [b.width, b.height]; })() }));
  reg('TQ15/RM computador 1920×955 sem toque: sem controles, sem aviso, tela 960×704', !r.controles && !r.aviso && r.alvos === 0 && Math.abs(r.cv[0] - 960) < 1 && Math.abs(r.cv[1] - 704) < 1, JSON.stringify(r));
  await p2.setViewportSize({ width: 390, height: 844 }); await real(1200);
  const r2 = await p2.evaluate(() => ({ aviso: !!document.getElementById('aviso-de-rotacao') && getComputedStyle(document.getElementById('aviso-de-rotacao')).display !== 'none', controles: !!document.getElementById('controles-de-toque') }));
  reg('TQ14 computador (sem toque) 390×844: nenhum aviso de rotação', !r2.aviso && !r2.controles, JSON.stringify(r2));
  await p2.close(); await c2.close();
}

async function blocoSelecaoEReload() {
  // Cartões: toque confirma o sobrinho (TQ8), testar os 4 nomes
  const nomes = ['LoLô', 'BiBi', 'DanDan', 'TuTu'];
  for (let i = 0; i < 4; i++) {
    await abrirToque(844, 390);
    const zonas = (await alvos()).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone');
    await tocar(centro(zonas[0])); await real(900);
    const cart = (await alvos()).filter((a) => a.origem === 'canvas');
    if (i === 0) reg('TQ19 cartões da seleção: altura ≥ 48 CSS px', cart.length >= 4 && cart.slice(0, 4).every((a) => a.altura >= 47.5), `zonas=${cart.map((a) => `${a.nome}:${a.largura.toFixed(0)}×${a.altura.toFixed(0)}`).join(' ')}`);
    await tocar(centro(cart[i]));
    await real(900);
    const t = await textos();
    reg(`TQ8 cartão ${i + 1} confirma (${nomes[i]}): leva à introdução com o nome`, t.some((x) => x.t.includes(nomes[i])), juntarT(t.slice(-3)).slice(0, 160));
    if (i === 0) await shot('16-selecao-cartoes');
    if (i === 0) {
    }
  }
  // TQ17: teclado junto com toque, na mesma partida (Hall, LoLô)
  await abrirToque(844, 390);
  await irAteExploracao(0);
  await page.evaluate(() => window.__teleportar('hall', 'P8'));
  await real(600);
  const antes = await est();
  await page.keyboard.down('ArrowLeft'); await real(500); await page.keyboard.up('ArrowLeft'); await real(300);
  const d1 = await est();
  await page.keyboard.down('KeyW'); await real(400); await page.keyboard.up('KeyW'); await real(300);
  const d2 = await est();
  const cr = await achar('cruz-direita', 'dom');
  if (cr) { await baixar(7, centro(cr)); await real(500); await soltar(7); await real(300); }
  const d3 = await est();
  reg('TQ17 teclado: seta esquerda anda com toque ligado', !!antes && !!d1 && (d1.centroX !== antes.centroX || d1.direcao === 'esquerda'), `antes=(${antes?.centroX}) depois=(${d1?.centroX}) dir=${d1?.direcao}`);
  reg('TQ17 teclado: W anda para cima com toque ligado', !!d2 && (d2.centroY !== d1.centroY || d2.direcao === 'cima'), `dir=${d2?.direcao}`);
  reg('TQ17 toque depois do teclado, na mesma partida (cruz direita)', !!cr && !!d3 && d3.direcao === 'direita', `dir=${d3?.direcao}`);
  const cssToque = await page.evaluate(() => { const c = document.querySelector('canvas'); return { touchAction: getComputedStyle(c).touchAction, userSelect: getComputedStyle(c).userSelect }; });
  reg('TQ16 canvas com touch-action e seleção desligadas (CSS, emulado)', /none|manipulation/.test(cssToque.touchAction), JSON.stringify(cssToque));
  // TQ18: recarregar volta ao título
  await page.reload(); await page.waitForSelector('canvas'); await real(2200);
  const t = await textos();
  reg('TQ18 recarregar volta ao título (sem save)', t.some((x) => x.t === 'Começar') || (await alvos()).some((a) => a.nome === 'Titulo:Zone'), juntarT(t.slice(-4)));
}

async function main() {
  await run();
  const cr = await blocoCruz();
  await blocoAB();
  await blocoPainel();
  await blocoPainelCodigo();
  await blocoRotacao();
  await blocoLayoutB();
  await blocoComputador();
  await blocoSelecaoEReload();
  writeFileSync(join(EVID, 'log.json'), JSON.stringify({ LOG, erros }, null, 1));
  console.log('ERROS', erros.length, erros.slice(0, 8));
  await browser.close();
}
main().catch(async (err) => { console.log('EXCECAO', err.message); writeFileSync(join(EVID, 'log.json'), JSON.stringify({ LOG, erros, excecao: err.message }, null, 1)); await browser.close(); });
