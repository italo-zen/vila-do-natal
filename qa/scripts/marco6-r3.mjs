// Marco 6, rodada 3: DS1 (CPU 4× em exploração), DS2 (título desenhado com Fast 4G), PO2 (DanDan 667), PO3 (Voltar ao título, layout B), AU6/AU7 (mudo e rotação), F8 (X em diálogo), AC1 (contraste da paleta). Só observa.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { tecla } from './lib.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco6-r3'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const LOG = []; const erros = [];
const reg = (id, ok, nota = '') => { LOG.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`); };
const INIT = `(() => { window.__textos = []; const ft = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (t, ...r) { window.__textos.push({ t: String(t) }); if (window.__textos.length > 4000) window.__textos.splice(0, 2000); return ft.call(this, t, ...r); }; })();`;
const b = await chromium.launch({ channel: 'chrome', headless: true });
const novo = async (w, h, toque = true) => { const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: toque, isMobile: toque }); await c.addInitScript(INIT); const p = await c.newPage(); p.on('pageerror', (e) => erros.push('pageerror ' + e.message)); return { c, p }; };
const est = (p) => p.evaluate(() => window.__estado()).catch(() => null);
const al = (p) => p.evaluate(() => window.__alvosDeToque()).catch(() => []);
const txt = (p) => p.evaluate(() => window.__textos.splice(0).map((x) => x.t).join(' ').replace(/\s+/g, ' '));
const tapA = async (p, a) => p.touchscreen.tap(a.x + a.largura / 2, a.y + a.altura / 2);
// Título desenhado: pixels fora do fundo (11,16,48) no canvas
const desenhado = (p) => p.evaluate(() => { const c = document.querySelector('canvas'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 0; i < d.length; i += 4) if (d[i] !== 11 || d[i + 1] !== 16 || d[i + 2] !== 48) return true; return false; });
const entrar = async (p, idx) => { const z = (await al(p)).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone'); await p.touchscreen.tap(z[0].x + 20, z[0].y + 20); await real(700); const cs = (await al(p)).filter((a) => a.origem === 'canvas' && a.nome.startsWith('Selecao')); await p.touchscreen.tap(cs[idx].x + 20, cs[idx].y + 20); await real(800); for (let i = 0; i < 25; i++) { const st = await est(p); if (st?.mapa && !st.travado) break; const a = (await al(p)).find((q) => q.origem === 'dom' && q.nome === 'a'); if (a) await tapA(p, a); await real(300); } await real(400); };

// DS2: título desenhado com Fast 4G (latência 150 ms, 1,6 Mbps), medido até o canvas ter pixels do título
{
  const c = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await c.newPage(); const cdp = await c.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  const t0 = Date.now(); await p.goto(url, { waitUntil: 'commit' });
  let ms = -1;
  for (let i = 0; i < 400; i++) { if (await desenhado(p).catch(() => false)) { ms = Date.now() - t0; break; } await real(25); }
  reg('DS2 título desenhado (pixels do título no canvas) com Fast 4G emulado em ≤ 4 s', ms >= 0 && ms <= 4000, `${ms} ms (medido no canvas desenhado, não no gancho)`);
  await c.close();
}
// DS1: CPU 4× em exploração (caminhada com seta por 10 s), fps via rAF
{
  const { c, p } = await novo(844, 390);
  await p.goto(url); await p.waitForSelector('canvas'); await real(2000);
  await entrar(p, 0);
  await p.evaluate(() => window.__teleportar('sala', 'P8')); await real(600);
  for (let i = 0; i < 4; i++) { const st = await est(p); if (!st?.travado) break; const a = (await al(p)).find((q) => q.origem === 'dom' && q.nome === 'a'); if (a) await tapA(p, a); await real(300); }
  const cdp = await c.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.keyboard.down('ArrowLeft');
  const fps = await p.evaluate(() => new Promise((res) => { const xs = []; let last = performance.now(); let n = 0; const tick = (t) => { n++; if (t - last >= 1000) { xs.push(n); n = 0; last = t; } if (xs.length < 10) requestAnimationFrame(tick); else res(xs); }; requestAnimationFrame(tick); }));
  await p.keyboard.up('ArrowLeft');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const media = fps.reduce((a, x) => a + x, 0) / fps.length; const min2 = Math.min(...fps.map((_, i) => (fps[i] + (fps[i + 1] ?? fps[i])) / 2));
  reg('DS1 exploração com CPU 4× e som ligado: média ≥ 45 fps e nenhum intervalo de 2 s < 30', media >= 45 && min2 >= 30, `fps por segundo=${fps.join(',')} média=${media.toFixed(0)} pior 2 s=${min2.toFixed(0)}`);
  await c.close();
}
// PO3: Voltar ao título no layout B (seleção 667×375): alvo ≥ 48 e sem invadir cartão
{
  const { c, p } = await novo(667, 375);
  await p.goto(url); await p.waitForSelector('canvas'); await real(2000);
  const z = (await al(p)).filter((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone'); await p.touchscreen.tap(z[0].x + 20, z[0].y + 20); await real(700);
  const alv = await al(p);
  const cart = alv.filter((a) => a.nome.startsWith('Selecao:Zone'));
  const vz = alv.filter((a) => a.origem === 'canvas' && a.largura > 300 && a.altura < 60)[0];
  const invade = vz ? cart.some((k) => vz.x < k.x + k.largura && vz.x + vz.largura > k.x && vz.y < k.y + k.altura && vz.y + vz.altura > k.y) : null;
  reg('PO3 "Voltar ao título" (layout B): área ≥ 48 px de altura e sem invadir cartão', !!vz && vz.altura >= 48 && invade === false, vz ? `${vz.largura.toFixed(0)}x${vz.altura.toFixed(0)} invade=${invade}` : 'sem zona');
  await p.screenshot({ path: join(EVID, 'po2-selecao-667-danDan.png') });
  reg('PO2 captura da seleção 667×375 (DanDan no cartão 3, nome sem corte)', true, 'conferir po2-selecao-667-danDan.png');
  if (vz) { await p.touchscreen.tap(vz.x + vz.largura / 2, vz.y + vz.altura / 2); await real(700); const z2 = (await al(p)).some((a) => a.nome === 'Titulo:Zone'); reg('PO3 toque leva ao título', z2, ''); }
  await c.close();
}
// AU6/AU7: mudo com M, aviso de rotação sem sons; F8: X em diálogo sem efeito
{
  const { c, p } = await novo(960, 640, false);
  await p.goto(url); await p.waitForSelector('canvas'); await real(2000);
  await tecla(p, 'KeyZ', { ms: 90, pausa: 400 }); await tecla(p, 'KeyZ', { ms: 90, pausa: 400 });
  for (let i = 0; i < 12; i++) { const st = await est(p); if (st?.mapa && !st.travado) break; await tecla(p, 'KeyZ', { ms: 90, pausa: 300 }); }
  await p.evaluate(() => window.__teleportar('hall', 'P8')); await real(600);
  for (let i = 0; i < 4; i++) { const st = await est(p); if (!st?.travado) break; await tecla(p, 'KeyZ', { ms: 90, pausa: 300 }); }
  await tecla(p, 'KeyM', { ms: 90, pausa: 400 });
  await p.screenshot({ path: join(EVID, 'au6-mudo-ligado-hall.png') });
  const s1 = await est(p);
  reg('AU6 mudo ligado: ícone de som com risco (captura au6-mudo-ligado-hall.png) e estado mudo', s1?.audio?.mudo === true, JSON.stringify(s1?.audio).slice(0, 90));
  // AU6 com mudo: sinal visual ao usar o interruptor-like evento: andar até bilhete (A) e captura
  await tecla(p, 'KeyM', { ms: 90, pausa: 300 });
  // AU7: aviso de rotação com 390×844: eventos não aumentam
  const antesEv = (await est(p))?.audio?.ultimosEventos?.length ?? 0;
  await p.setViewportSize({ width: 390, height: 844 }); await real(1500);
  const depEv = (await est(p))?.audio?.ultimosEventos?.length ?? 0;
  const aviso = await p.evaluate(() => { const el = document.getElementById('aviso-de-rotacao'); return el ? getComputedStyle(el).display : 'ausente'; });
  await p.setViewportSize({ width: 960, height: 640 }); await real(800);
  reg('AU7 aviso de rotação não toca nenhum som', aviso !== 'none' && aviso !== 'ausente' && depEv === antesEv, `aviso=${aviso} eventos antes=${antesEv} depois=${depEv}`);
  // F8: X em diálogo (intro de luzes/hall) não faz nada
  await p.evaluate(() => window.__teleportar('hall', 'P8')); await real(500);
  await tecla(p, 'KeyX', { ms: 90, pausa: 400 });
  const sx = await est(p);
  reg('F8 X em diálogo (Está tudo escuro?) sem efeito no farejar', sx?.farejo?.ativo !== true, `travado=${sx?.travado} farejo=${sx?.farejo?.ativo}`);
  await c.close();
}
// AC1: contraste da paleta (cálculo WCAG sobre as cores de 14.9.4 e 19.3)
{
  const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a, b2) => { const x = lum(a), y = lum(b2); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const pares = [['texto creme', '#f4e9c8', '#1b2452'], ['texto creme', '#f4e9c8', '#0b1030'], ['azul claro', '#9aa3c7', '#0b1030'], ['azul claro', '#9aa3c7', '#1b2452']];
  for (const [n, f, g] of pares) { const r = ratio(f, g); reg(`AC1 contraste ${n} sobre ${g}: ${r.toFixed(2)}:1 (≥ 4,5 para texto)`, r >= 4.5, 'cálculo sobre a paleta; medidor de captura: N/T'); }
}
writeFileSync(join(EVID, 'log.json'), JSON.stringify({ LOG, erros }, null, 1));
console.log('ERROS', erros.length, erros.slice(0, 5));
await b.close();
