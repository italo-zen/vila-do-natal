// QA Marco 3 (v0.7.0), rodada 7: peça 1 com Nick acordado (MODO=acordado) e com Nick dormindo (MODO=dormindo),
// F7 ao vivo (MODO=acordado), fumacinha a cada 100 ms. ATALHO: __irParaFase('parte1') (luzes concluídas). Build: dist-qa.
// Uso: MODO=dormindo node qa/scripts/marco3-r7.mjs   |   MODO=acordado node qa/scripts/marco3-r7.mjs
import { lancar, novoContexto, lerTextos, limparTextos, juntar, sleep, tecla, irAteHall } from './lib.mjs';
import { irPara, estado, apertarA } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const MODO = process.env.MODO ?? 'acordado';
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco3-r7', MODO);
mkdirSync(join(EVID, 'fumaca'), { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const resultados = [];
const reg = (id, ok, nota) => { resultados.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`); };
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'r7' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(e.message));
const est = async () => { try { return await estado(page); } catch { await sleep(150); return null; } };
const ver = () => page.evaluate(() => window.__textos.map((x) => x.t).join(' '));
const press = async (k, ms = 260) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); await sleep(220); };
const fechar = async () => { for (let i = 0; i < 14; i++) { const q = await est(); if (!q?.travado) return; await tecla(page, 'z', { ms: 90, pausa: 400 }); } };
async function capturar(dir, nome) {
  const d = await page.evaluate(() => { const c = document.querySelector('canvas'); const o = document.createElement('canvas'); o.width = c.width * 3; o.height = c.height * 3; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height); return o.toDataURL('image/png'); });
  writeFileSync(join(dir, `${nome}.png`), Buffer.from(d.split(',')[1], 'base64'));
}
async function medirChegada(rotulo) {
  let chegouT = null; let auT = null; let dialogoT = null; const anim = []; let viu = false; const t1 = Date.now(); let q6 = 0;
  while (Date.now() - t1 < 30000) {
    const q = await est();
    if (q?.emConducao) viu = true;
    if (viu && !q?.emConducao && chegouT === null) chegouT = Date.now();
    if (chegouT !== null) {
      anim.push(`${q?.animacaoDoNick ?? '?'}${q?.animandoNick ? '*' : ''}@${Date.now() - chegouT}`);
      const b = await ver();
      if (b.includes('Au!') && auT === null) auT = Date.now();
      if (dialogoT === null && /árvore|Parabéns|Agora/.test(b.replace(/Natal na Casa[^]*/, ''))) dialogoT = Date.now();
      if (q6 < 6) { await capturar(EVID, `${rotulo}-${q6}`); q6++; }
      if (Date.now() - chegouT > 2600) break;
    }
    await sleep(100);
  }
  return { chegouT, auT, dialogoT, anim };
}
const rel = (t, c) => (t === null || c === null ? 'nunca' : `${t - c} ms`);

await page.goto(url); await page.waitForSelector('canvas'); await sleep(2000);
await tecla(page, 'z'); await sleep(300); await tecla(page, 'z'); await sleep(300);
await irAteHall(page, 0); await sleep(800);
const fa = await page.evaluate(() => window.__irParaFase('parte1'));
await page.evaluate(() => window.__teleportar('cozinha', 'P7'));
await sleep(600); await fechar();
reg('setup __irParaFase(parte1)', fa === 'parte1', `retorno=${fa}; nick=${JSON.stringify((await est())?.nick)}`);

if (MODO === 'acordado') {
  await irPara(page, 'cozinha', 4, 3).catch(() => {});
  await press('ArrowRight', 260);
  await apertarA(page); await sleep(1500); await fechar(); await sleep(200);
  reg('pré-condição: Nick acordado na Cozinha', (await est())?.nick?.estado === 'acordado', `nick=${JSON.stringify((await est())?.nick)}`);
  // F7 ao vivo: alvo da peça 1 é a Sala; a seta é a P7, e a peça 2 (escondida, Cozinha (4,1)) não aparece
  await press('x', 260); await sleep(1600);
  const f = await est();
  reg('F7 ao vivo: seta na P7 (alvo Sala), nunca na peça 2 escondida', f?.farejo?.porta?.id === 'P7' && f?.farejo?.porta?.saida === 'esquerda', `farejo=${JSON.stringify(f?.farejo)}`);
  await capturar(EVID, 'f7-seta-P7');
  await irPara(page, 'cozinha', 1, 0).catch(() => {});
  await press('ArrowLeft', 900); await sleep(600); await fechar();
  reg('Nick acordado acompanha a troca para a Sala', (await est())?.nick?.mapa === 'sala', `nick=${JSON.stringify((await est())?.nick)}`);
  await irPara(page, 'sala', 2, 4).catch((er) => console.log('irPara 2,4:', er.message.slice(0, 160)));
  await press('ArrowLeft', 260);
} else {
  await page.evaluate(() => window.__teleportar('sala', 'P7')); await sleep(600); await fechar();
  reg('pré-condição: Nick dorme (Cozinha (5,3)) e está na Sala com o sobrinho', (await est())?.nick?.estado === 'dormindo', `nick=${JSON.stringify((await est())?.nick)}`);
  await irPara(page, 'sala', 2, 4).catch((er) => console.log('irPara 2,4:', er.message.slice(0, 160)));
  await press('ArrowLeft', 260);
}
await apertarA(page); await sleep(500);
const conq = await ver();
reg('pré: conquista da peça 1 aberta (A na peça)', /primeira parte/.test(conq), `buffer="${conq.slice(0, 90)}" estado=${JSON.stringify({ t: (await est())?.travado, c: (await est())?.emConducao, p: (await est())?.tileX + ',' + (await est())?.tileY })}`);
await limparTextos(page);
await apertarA(page);
const P = await medirChegada(MODO === 'acordado' ? 'peca1-acordado' : 'peca1-dormindo');
if (MODO === 'acordado') {
  reg('(1) peça 1, Nick acordado: "Au!" uma vez na chegada', P.auT !== null, `Au! ${rel(P.auT, P.chegouT)}; diálogo ${rel(P.dialogoT, P.chegouT)}`);
  reg('(1) peça 1: animação "feliz" (nick-feliz) tocando', P.anim.some((a) => a.startsWith('nick-feliz')), `sequência: ${P.anim.slice(0, 8).join(' ')}`);
  reg('(1) peça 1: diálogo sem esperar a animação (< 1000 ms)', P.dialogoT !== null && P.dialogoT - P.chegouT < 1000, `diálogo ${rel(P.dialogoT, P.chegouT)}`);
} else {
  reg('(2) peça 1, Nick dormindo: nenhum "Au!" e nenhuma animação feliz', P.auT === null && !P.anim.some((a) => a.startsWith('nick-feliz')), `Au! ${rel(P.auT, P.chegouT)}; sequência: ${P.anim.slice(0, 6).join(' ')}`);
}
// (4) fumacinha ao devolver o controle: quadros a cada 100 ms
await limparTextos(page);
let k = 0;
// Fecha o diálogo (é aí que o controle volta e a fumacinha nasce) e fotografa a cada ~100 ms por 1,2 s
for (let i = 0; i < 14; i++) { const q = await est(); if (!q?.travado) break; await tecla(page, 'z', { ms: 90, pausa: 60 }); }
for (let i = 0; i < 12; i++) { await capturar(join(EVID, 'fumaca'), `f-${String(k++).padStart(2, '0')}`); await sleep(60); }
await fechar();
const dep = await est();
reg('(4) fumacinha: quadros em fumaca/ (leitura visual)', null, `nick depois=${JSON.stringify(dep?.nick)}; ${k} quadros`);
console.log('Erros:', erros.length ? erros : 'nenhum');
writeFileSync(join(EVID, 'resultados.json'), JSON.stringify({ resultados, erros }, null, 2));
await browser.close();
