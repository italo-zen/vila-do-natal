// Utilitários de teste de QA (Marco 1). Não altera src/: só observa o jogo por fora.
// - Textos: intercepta CanvasRenderingContext2D.fillText (Phaser desenha cada Text nesse canvas) e
//   guarda o texto e a cor de preenchimento. Assim dá para conferir a grafia exata e qual botão tem foco
//   (o botão em foco é redesenhado na cor de destaque).
// - Pixels: lê o canvas do jogo (240×160) para conferir foco de cartões e do painel e a penumbra.
// - Rede e armazenamento: registra requisições e qualquer escrita em localStorage/sessionStorage/cookies.
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const EVID = join(RAIZ, 'qa', 'evidencias', 'marco1');
mkdirSync(EVID, { recursive: true });

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const VERSAO = JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf8')).version;

const INIT_BASE = `(() => {
  const T = (window.__textos = []);
  window.__storage = [];
  const ft = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function (t, ...r) {
    T.push({ t: String(t), c: String(this.fillStyle) });
    if (T.length > 4000) T.splice(0, 2000);
    return ft.call(this, t, ...r);
  };
  for (const m of ['setItem', 'removeItem', 'clear']) {
    const o = Storage.prototype[m];
    Storage.prototype[m] = function (...a) { window.__storage.push(m + ':' + String(a[0] ?? '')); return o.apply(this, a); };
  }
  const cookieDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
  Object.defineProperty(document, 'cookie', {
    get() { return cookieDesc.get.call(document); },
    set(v) { window.__storage.push('cookie:' + String(v)); return cookieDesc.set.call(document, v); },
  });
})();`;

// Bloqueio de armazenamento (A-11): acessar window.localStorage lança erro, como um navegador que bloqueia dados.
const INIT_STORAGE_BLOQUEADO = `Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('bloqueado', 'SecurityError'); } });
Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('bloqueado', 'SecurityError'); } });`;

export async function lancar() {
  return chromium.launch({ channel: 'chrome', headless: true });
}

/** Servidor HTTP local para a pasta dist/ (build normal). Porta livre. */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.json': 'application/json', '.webp': 'image/webp' };
export function servirPasta(pasta) {
  const srv = createServer((req, res) => {
    const caminho = decodeURIComponent(req.url.split('?')[0]);
    if (caminho === '/favicon.ico') { res.writeHead(204); return res.end(); }
    const alvo = join(pasta, caminho === '/' ? 'index.html' : caminho);
    if (!alvo.startsWith(pasta) || !existsSync(alvo) || statSync(alvo).isDirectory()) { res.writeHead(404); return res.end('nao encontrado'); }
    res.writeHead(200, { 'content-type': MIME[extname(alvo)] ?? 'application/octet-stream' });
    res.end(readFileSync(alvo));
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok({ srv, url: `http://127.0.0.1:${srv.address().port}/`, origem: `http://127.0.0.1:${srv.address().port}` })));
}

/** Coletor único do roteiro: erros de console, exceções, requisições e destinos externos de todos os contextos. */
export const COLETOR = { erros: [], requisicoes: [], externas: [] };

/** Cria contexto isolado (sem storage compartilhado), com instrumentação. */
export async function novoContexto(browser, { url, origem, bloquearStorage = false, offline = false, rotulo = 'ctx' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 960, height: 640 }, offline });
  await ctx.addInitScript(INIT_BASE);
  if (bloquearStorage) await ctx.addInitScript(INIT_STORAGE_BLOQUEADO);
  if (origem) {
    // Só o próprio jogo pode ser requisitado; qualquer outro destino é registrado e abortado.
    await ctx.route('**/*', (route) => {
      const u = route.request().url();
      if (u.startsWith(origem) || u.startsWith('file:') || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
      COLETOR.externas.push(u);
      return route.abort();
    });
  }
  ctx.on('page', (p) => instrumentar(p, rotulo));
  ctx.__url = url;
  return ctx;
}

function instrumentar(page, rotulo) {
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') COLETOR.erros.push(`[${rotulo}] console.${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => COLETOR.erros.push(`[${rotulo}] pageerror: ${e.message}`));
  page.on('requestfailed', (r) => COLETOR.erros.push(`[${rotulo}] requestfailed: ${r.url()} ${r.failure()?.errorText ?? ''}`));
  page.on('request', (r) => COLETOR.requisicoes.push(r.url()));
}

/** Abre o jogo numa nova aba do contexto e espera o título. */
export async function abrirJogo(ctx, url = ctx.__url, esperar = 2200) {
  const page = await ctx.newPage();
  await page.goto(url);
  await page.waitForSelector('canvas');
  await sleep(esperar);
  return page;
}

// ---------- Teclado ----------
export async function tecla(page, k, { ms = 90, pausa = 190 } = {}) {
  await page.keyboard.down(k);
  await sleep(ms);
  await page.keyboard.up(k);
  await sleep(pausa);
}
export async function segurar(page, k, ms) {
  await page.keyboard.down(k);
  await sleep(ms);
  await page.keyboard.up(k);
  await sleep(200);
}
export async function digitar(page, s) {
  for (const ch of s) await tecla(page, ch, { ms: 60, pausa: 150 });
}

// ---------- Textos ----------
export async function lerTextos(page) {
  return page.evaluate(() => window.__textos.splice(0));
}
export async function limparTextos(page) {
  await page.evaluate(() => { window.__textos.length = 0; });
}
export const normalizar = (s) => s.replace(/\s+/g, ' ').trim();
/** Texto contínuo (Phaser quebra linhas em pedaços; juntamos para comparar a frase inteira). */
export const juntar = (lista) => normalizar(lista.map((x) => x.t).join(' '));
export const contemFrase = (lista, frase) => juntar(lista).includes(normalizar(frase));
/** Comparação exata de uma linha desenhada de uma vez (ex.: barras, com 2 espaços entre ações). */
export const contemLinha = (lista, linha) => lista.some((x) => x.t === linha);
/** Textos da lista que estão na cor de destaque (#f4d35e), i.e. o item em foco de um menu. */
export function emDestaque(lista, candidatos) {
  const ultimo = new Map();
  for (const x of lista) if (candidatos.includes(x.t)) ultimo.set(x.t, x.c.toLowerCase());
  return [...ultimo].filter(([, c]) => c === '#f4d35e').map(([t]) => t);
}

// ---------- Pixels ----------
export async function pixel(page, x, y) {
  return page.evaluate(([x, y]) => Array.from(document.querySelector('canvas').getContext('2d').getImageData(x, y, 1, 1).data.slice(0, 3)), [x, y]);
}
/** Retângulo (bbox) dos pixels de destaque amarelo na região do teclado do painel. */
export async function bboxDestaque(page, { y0 = 60, y1 = 130, x0 = 30, x1 = 215 } = {}) {
  return page.evaluate(([y0, y1, x0, x1]) => {
    const d = document.querySelector('canvas').getContext('2d').getImageData(0, 0, 240, 160).data;
    let mnx = 999, mny = 999, mxx = -1, mxy = -1;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const i = (y * 240 + x) * 4;
      if (Math.abs(d[i] - 244) < 10 && Math.abs(d[i + 1] - 211) < 10 && Math.abs(d[i + 2] - 94) < 10) {
        mnx = Math.min(mnx, x); mny = Math.min(mny, y); mxx = Math.max(mxx, x); mxy = Math.max(mxy, y);
      }
    }
    return mxx < 0 ? null : { x0: mnx, y0: mny, x1: mxx, y1: mxy };
  }, [y0, y1, x0, x1]);
}
/** Tecla do painel em foco, pela posição do destaque (grade: 3 colunas em x=36+56c; 4 linhas em y=66+16l). */
export function teclaDoBbox(b) {
  if (!b) return null;
  const col = Math.round((b.x0 - 35) / 56);
  const lin = Math.round((b.y0 + 1 - 66) / 16);
  const rotulos = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Apagar', '0', 'OK'];
  return rotulos[lin * 3 + col] ?? `?(${col},${lin})`;
}
/** Painel da porta está aberto? (cor de fundo da tecla 0x1b2452 no canto da tecla "1") */
export async function painelAberto(page) {
  const [r, g, b] = await pixel(page, 38, 68);
  return r === 0x1b && g === 0x24 && b === 0x52;
}
/** Captura do canvas em PNG com 3× (nítido). */
export async function capturar(page, nome, fator = 3) {
  const dataUrl = await page.evaluate((f) => {
    const c = document.querySelector('canvas');
    const o = document.createElement('canvas');
    o.width = c.width * f;
    o.height = c.height * f;
    const x = o.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height);
    return o.toDataURL('image/png');
  }, fator);
  const arq = join(EVID, `${nome}.png`);
  writeFileSync(arq, Buffer.from(dataUrl.split(',')[1], 'base64'));
  return arq;
}
/** Chaves de armazenamento gravadas pelo jogo (esperado: nenhuma). */
export async function gravacoes(page) {
  return page.evaluate(() => ({
    gravacoes: window.__storage.slice(),
    local: (() => { try { return localStorage.length; } catch (e) { return 'bloqueado'; } })(),
    sessao: (() => { try { return sessionStorage.length; } catch (e) { return 'bloqueado'; } })(),
    cookies: document.cookie,
  }));
}

// ---------- Relatório ----------
export function criarRelatorio(nome) {
  const casos = [];
  const extras = [];
  return {
    nome,
    /** Registra o resultado de um caso: status = 'OK' | 'FALHOU' | 'N/T', com nota curta. */
    caso(id, status, nota = '') {
      casos.push({ id, status, nota });
      const marca = status === 'OK' ? 'OK    ' : status === 'FALHOU' ? 'FALHOU' : 'N/T   ';
      console.log(`${marca} ${id} ${nota}`);
    },
    /** Dado extra (ex.: lista de mensagens do ciclo de erros, contagens). */
    dado(chave, valor) { extras.push({ chave, valor }); },
    salvar() {
      const saida = join(EVID, `resultados-${nome}.json`);
      const requisicoesExternas = COLETOR.requisicoes.filter((u) => !u.startsWith('file:') && !u.startsWith('data:') && !u.startsWith('blob:') && !u.startsWith('http://127.0.0.1'));
      writeFileSync(saida, JSON.stringify({ casos, extras, erros: COLETOR.erros, externas: COLETOR.externas, requisicoesExternas, totalRequisicoes: COLETOR.requisicoes.length }, null, 2));
      console.log(`--> ${saida}`);
      console.log(`erros de console/exceções: ${COLETOR.erros.length}; requisições externas: ${requisicoesExternas.length}`);
    },
  };
}

/** Garante que um bloco que pode lançar não derrube o script inteiro: registra como FALHOU. */
export async function caso(rel, id, fn) {
  try {
    await fn();
  } catch (e) {
    rel.caso(id, 'FALHOU', `exceção de teste: ${e.message.split('\n')[0]}`);
  }
}

// ---------- Fluxos reutilizáveis (caminhos do roteiro de QA; mapa em content/maps/casa.json) ----------
export const NOMES = ['LoLô', 'BiBi', 'DanDan', 'TuTu'];
export const CODIGOS = { 'LoLô': '017', 'BiBi': '020', 'DanDan': '023', 'TuTu': '024' };

/** Índice do cartão da seleção com a borda amarela (linha y=50, cartões em x=7+58i). */
export async function cartaoFocado(page) {
  const achados = [];
  for (let i = 0; i < 4; i++) {
    const [r, g, b] = await pixel(page, 7 + i * 58 + 26, 50);
    if (r > 200 && g > 180 && b < 130) achados.push(i);
  }
  return achados.length === 1 ? achados[0] : achados;
}

/** Do título (foco em Começar) até a introdução do sobrinho i (página 1). */
export async function irAteIntro(page, i) {
  await tecla(page, 'z');
  for (let k = 0; k < i; k++) await tecla(page, 'ArrowRight');
  await tecla(page, 'z');
  await sleep(350);
}
/** Introdução inteira (4 Z) até o hall, com o jogador no controle. */
export async function irAteHall(page, i) {
  await irAteIntro(page, i);
  for (let k = 0; k < 4; k++) await tecla(page, 'z');
  await sleep(300);
  // Marco 1.1 (item 016): o diálogo de orientação do hall ainda pede Z depois da introdução.
  for (let k = 0; k < 4; k++) await tecla(page, "z");
  await sleep(300);
}
/** No hall, de frente para o bilhete (13,3), com o bilhete fechado. Caminho validado no smoke. */
export async function irAteBilhete(page) {
  await segurar(page, 'ArrowDown', 200);
  await segurar(page, 'ArrowUp', 200);
  await segurar(page, 'ArrowRight', 500);
  await segurar(page, 'ArrowLeft', 200);
  await segurar(page, 'ArrowRight', 200);
  await tecla(page, 'ArrowUp', 60);
}
/** No hall, com o painel da porta aberto (jogador em (13,4) virado para a porta). */
export async function irAtePainel(page) {
  await irAteBilhete(page);
  await tecla(page, 'z');
  await tecla(page, 'x');
  await tecla(page, 'ArrowRight', 60);
  await tecla(page, 'z');
  await sleep(250);
}

/** Caixa de diálogo aberta? Borda superior da caixa (y=96) em #f4e9c8; fechada, a cena aparece (ex.: 125,133,144). */
export async function dialogoAberto(page) {
  const [r, g, b] = await pixel(page, 120, 96);
  return r === 244 && g === 233 && b === 200;
}
/** Tecla de numpad com NumLock ligado: evento sintético (o Playwright sem NumLock envia 'End'). */
export async function numpad(page, digito) {
  await page.evaluate((d) => {
    const opt = { key: d, code: `Numpad${d}`, keyCode: 96 + Number(d), bubbles: true };
    window.dispatchEvent(new KeyboardEvent('keydown', opt));
    window.dispatchEvent(new KeyboardEvent('keyup', opt));
  }, digito);
  await sleep(120);
}
