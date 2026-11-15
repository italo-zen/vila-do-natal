// QA Marco 4 (v0.8.0), rodada 3: EN12 (H e B durante conquista e condução e encaixe), EN9 (nova partida depois
// dos créditos: fase inicial, caixa escondida, Nick dormindo). Teclado, TuTu (IDX 3). Build: dist-qa.
import { lancar, novoContexto, sleep, tecla } from './lib.mjs';
import { irPara } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco4-r3'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const T0 = Date.now();
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'm4r3' });
const page = await ctx.newPage();
const erros = []; page.on('pageerror', (e) => erros.push(e.message));
const est = async () => { for (let i = 0; i < 4; i++) { try { return await page.evaluate(() => window.__estado()); } catch { await sleep(150); } } return null; };
const ver = async () => page.evaluate(() => window.__textos.map((x) => x.t).join(' ').replace(/\s+/g, ' '));
const limpar = () => page.evaluate(() => { window.__textos.length = 0; });
const fechar = async () => { for (let i = 0; i < 12; i++) { const q = await est(); if (!q?.travado) return; await tecla(page, 'z', { ms: 90, pausa: 400 }); } };
const esperar = async (f, lim = 8000) => { const t0 = Date.now(); while (Date.now() - t0 < lim) { if ((await ver()).includes(f)) return true; await sleep(100); } return false; };
const capt = async (nome) => {
  const d = await page.evaluate(() => { const c = document.querySelector('canvas'); const o = document.createElement('canvas'); o.width = c.width * 3; o.height = c.height * 3; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height); return o.toDataURL('image/png'); });
  writeFileSync(join(EVID, `${nome}.png`), Buffer.from(d.split(',')[1], 'base64'));
};
const reg = (id, ok, nota) => console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`);
const iniciar = async () => {
  await tecla(page, 'z'); await sleep(300);
  for (let k = 0; k < 3; k++) await tecla(page, 'ArrowRight');
  await tecla(page, 'z'); await sleep(900);
  for (let k = 0; k < 4; k++) await tecla(page, 'z'); await sleep(600);
  for (let k = 0; k < 4; k++) await tecla(page, 'z'); await sleep(600);
};
await page.goto(url); await page.waitForSelector('canvas'); await sleep(1500);
await iniciar();
await page.evaluate(() => window.__irParaFase('enfeites'));
await page.evaluate(() => window.__teleportar('escritorio', 'P3')); await sleep(900); await fechar();
await irPara(page, 'escritorio', 5, 3);
// EN12 na conquista: H, B (X) não fazem nada
await limpar(); await tecla(page, 'z', { ms: 90, pausa: 400 }); await sleep(200);
let t = await ver();
const conq = await ver(); await capt('EN12-conquista');
reg('EN3 conquista (A)', conq.includes('Parabéns, você conseguiu encontrar a caixa'), conq.slice(0, 90));
// Dentro da conquista: H e X antes do Continuar
await limpar(); await tecla(page, 'h', { ms: 90, pausa: 300 }); await capt('EN12-conquista-H'); await tecla(page, 'x', { ms: 90, pausa: 300 }); await capt('EN12-conquista-X');
t = await ver();
reg('EN12 H e B na conquista: sem "Dica" nem "zzz"', !t.includes('Dica') && !t.includes('zzz'), `texto=${t.slice(0, 80)}`);
await limpar(); await tecla(page, 'z', { ms: 90, pausa: 100 });
// Condução: H e X durante o trajeto
const pos = []; let ult = null;
for (let i = 0; i < 80; i++) {
  await sleep(90);
  const q = await est(); if (!q) continue;
  const p = `${q.mapa}:${q.tileX},${q.tileY}`; if (p !== ult) { pos.push(p); ult = p; }
  if (i === 6) { await limpar(); await tecla(page, 'h', { ms: 80, pausa: 200 }); await tecla(page, 'x', { ms: 80, pausa: 200 }); }
  if (i === 6) { await capt('EN12-conducao-HX'); const tx = await ver(); reg('EN12 H e B na condução: sem efeito', !tx.includes('Dica') && !tx.includes('zzz') && !tx.includes('Au!'), `texto=${tx.slice(0, 80)} pos=${pos.length}`); }
  if (q.mapa === 'sala' && q.tileX === 3 && q.tileY === 7) break;
}
reg('EN4 condução sem toque: trechos', pos.length > 5, `trechos=${pos.length - 1} (ver rodada 2 para o tempo)`);
// Encaixe e diálogo final: H e X durante o encaixe (até o diálogo final)
await limpar(); await tecla(page, 'h', { ms: 80, pausa: 200 }); await tecla(page, 'x', { ms: 80, pausa: 200 });
const fin = await esperar('Agora a árvore está toda enfeitada!', 6000);
reg('EN12 H e B no encaixe e diálogo final: sem "Dica"', fin && !(await ver()).includes('Dica'), 'diálogo final apareceu');
// Medir encaixe: quadros por polling de __estado (travado) e tempo até o diálogo final
const tE = Date.now(); let fim = 0;
await fechar();
// ... o diálogo final já está fechado pelo fechar(); próximo passo: créditos
await sleep(300);
// Créditos: Z volta ao título (CR2) e nova partida (EN9)
const cr = await esperar('Voltar ao título', 12000);
reg('créditos alcançados', cr, '');
if (cr) { await tecla(page, 'z', { ms: 90, pausa: 500 }); await sleep(300); }
await limpar(); await tecla(page, 'z', { ms: 90, pausa: 400 });
// EN9: nova partida: fase inicial, Nick e caixa escondida
await iniciar(); const fase0 = (await est())?.fase;
await page.evaluate(() => window.__irParaFase('parte3'));
await page.evaluate(() => window.__teleportar('escritorio', 'P3')); await sleep(900); await fechar();
await irPara(page, 'escritorio', 5, 3);
await limpar(); await tecla(page, 'z', { ms: 90, pausa: 400 }); await sleep(250);
const nova = await ver();
reg('EN9 nova partida: caixa escondida no Escritório antes da parte 3 (A mostra "Ainda não!")', nova.includes('Ainda não!'), `fase após voltar=${fase0} texto=${nova.slice(0, 80)}`);
await capt('EN9-nova-partida-escondida');
console.log(`TEMPO: ${((Date.now() - T0) / 1000).toFixed(0)} s; ERROS: ${erros.length} ${erros.slice(0, 3).join(' || ')}`);
await browser.close();
