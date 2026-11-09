// QA Marco 3 (v0.7.0), rodada 2: Como jogar, ícone "?" (clique), dica por fase, Nick nas áreas de cada fase,
// seta e farejar, regressão do Marco 1 (código, luzes, condução). Build: dist-qa. Perfil HD 480x352. Teclado e mouse.
// Uso: node qa/scripts/marco3-r2.mjs
// Regra: depois de __teleportar, fecha o estado travado com X antes de agir (Dev deve confirmar).
import { lancar, novoContexto, lerTextos, limparTextos, juntar, sleep, tecla, digitar, irAteHall, irAtePainel } from './lib.mjs';
import { irPara, estado, apertarA, subarea } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco3-r2');
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;

const resultados = [];
const reg = (id, ok, nota) => { resultados.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`); };
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'm3r2' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') erros.push(`console: ${m.text()}`); });

const textos = async () => juntar(await lerTextos(page));
const est = () => estado(page);
const press = async (k, ms = 260) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); await sleep(220); };
const teleportar = async (m, s) => { await page.evaluate(([a, b]) => window.__teleportar(a, b), [m, s]); await sleep(500); };
const fecharTravado = async () => { for (let i = 0; i < 12; i++) { const q = await est(); if (!q?.travado) return true; await press('x', 300); await sleep(300); } return false; };
async function capturar(nome) {
  const dataUrl = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const o = document.createElement('canvas');
    o.width = c.width * 3; o.height = c.height * 3;
    const x = o.getContext('2d'); x.imageSmoothingEnabled = false;
    x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height);
    return o.toDataURL('image/png');
  });
  writeFileSync(join(EVID, `${nome}.png`), Buffer.from(dataUrl.split(',')[1], 'base64'));
}
const seguro = async (rotulo, fn) => { try { await fn(); } catch (err) { reg(rotulo, false, `exceção: ${err.message.slice(0, 160)}`); } };

await page.goto(url);
await page.waitForSelector('canvas');
await sleep(2000);

// (1) Como jogar: 7 linhas, Voltar visível, sem corte
await seguro('B5/B4 Como jogar', async () => {
  await limparTextos(page);
  await press('ArrowDown', 200);
  await tecla(page, 'z');
  await sleep(700);
  const t = await textos();
  await capturar('01-como-jogar');
  const linhas = ['Mover: setas ou WASD', 'Botão A: Z ou Enter.', 'Botão B: X ou Esc.', 'Farejar: X, com o Nick acordado.', 'Dica: H, ou clique no ícone ?'];
  const faltam = linhas.filter((l) => !t.includes(l));
  reg('B5 Como jogar: linhas novas (farejar, dica) aparecem', faltam.length === 0, faltam.length ? `faltam: ${faltam.join(' | ')}` : `texto: "${t.slice(0, 200)}"`);
  reg('B5 Como jogar: "Voltar" e "Z ou X: voltar" presentes', t.includes('Voltar') && t.includes('Z ou X: voltar'), `trecho: "${t.slice(-80)}"`);
  await limparTextos(page);
  await press('x', 300);
  await sleep(700);
  const volta = await textos();
  reg('B5 X volta ao título', volta.includes('Começar'), `texto após X: "${volta.slice(0, 80)}"`);
});
// Volta ao título, se o menu saiu do título: Como jogar deve estar fechado
await seguro('title-reset', async () => {
  await page.keyboard.press('Escape'); await sleep(300);
  await page.reload(); await page.waitForSelector('canvas'); await sleep(2000);
});

// (2) Ícone "?" com clique do mouse: abre a dica
await seguro('D1 clique no ícone', async () => {
  await tecla(page, 'z'); // Começar
  await sleep(300);
  await tecla(page, 'z'); // LoLô
  await sleep(300);
  for (let k = 0; k < 4; k++) await tecla(page, 'z');
  await sleep(300);
  for (let k = 0; k < 4; k++) await tecla(page, 'z');
  await sleep(600);
  await fecharTravado();
  const rect = await page.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; });
  // Ícone 32x32 no canto superior direito: canvas (440..472, 8..40); centro (456,24)
  const cx = rect.l + (456 / 480) * rect.w;
  const cy = rect.t + (24 / 352) * rect.h;
  await page.mouse.click(cx, cy);
  await sleep(400);
  const e = await est();
  reg('D1b clique no ícone "?" abre a dica', e?.dicaAberta === true, `dicaAberta=${e?.dicaAberta}; clique em (${cx.toFixed(0)},${cy.toFixed(0)})`);
  await capturar('02-dica-mouse');
  await press('z', 260);
  reg('D2c Z fecha a dica aberta pelo mouse', (await est())?.dicaAberta === false, 'fechou');
});

// (3) Marco 1: código da P8, luzes, condução (regressão), depois Nick na Cozinha
await seguro('regressao Marco 1 (porta)', async () => {
  await irAtePainel(page);
  await digitar(page, '017');
  await tecla(page, 'z');
  for (let i = 0; i < 20; i++) { const q = await est(); if (q?.mapa === 'sala' && !q?.emFade && !q?.travado) break; await sleep(250); }
  reg('M1 porta: código 017 abre a P8 (troca de área, mapa sala)', (await est())?.mapa === 'sala', `mapa=${(await est())?.mapa} (leitura após até 5 s)`);
});
await seguro('regressao Marco 1 (luzes)', async () => {
  await fecharTravado();
  await irPara(page, 'sala', 5, 4).catch((e) => console.log('irPara interruptor:', e.message.slice(0, 80)));
  await press('ArrowUp', 260);
  for (let i = 0; i < 25; i++) {
    const e = await est();
    if (e?.emConducao) break;
    await tecla(page, 'z', { ms: 90, pausa: 350 });
  }
  const t0 = Date.now();
  while (Date.now() - t0 < 25000) {
    const e = await est();
    if (e?.emConducao) break;
    await tecla(page, 'z', { ms: 90, pausa: 300 });
  }
  const passou = await new Promise(async (ok) => {
    const t1 = Date.now(); let viu = false;
    while (Date.now() - t1 < 15000) { const e = await est(); if (e?.emConducao) viu = true; if (viu && !e?.emConducao) return ok(true); await sleep(150); }
    ok(false);
  });
  reg('M1 luzes e condução até a árvore', passou, `conducao concluída=${passou}`);
});
await seguro('regressao Marco 1 (chegada e devolve controle)', async () => {
  for (let i = 0; i < 20; i++) { const q = await est(); if (!q?.travado) break; await tecla(page, 'z', { ms: 90, pausa: 400 }); }
  await sleep(900);
  const e = await est();
  reg('M1 após a chegada: controle devolvido', e && !e.travado, `mapa=${e?.mapa} tile=(${e?.tileX},${e?.tileY}) travado=${e?.travado} nick=${JSON.stringify(e?.nick)}`);
  await capturar('03-depois-luzes');
});

// (4) Nick dormindo em cada área da fase 1 (parte1: Cozinha (5,3))
await seguro('N Cozinha parte1', async () => {
  await fecharTravado();
  const e0 = await est();
  // Vai à Cozinha pela P7 (Sala (10,5)): anda até (9,5) e segue à direita
  await irPara(page, 'sala', 9, 5).catch((e) => console.log('irPara p7:', e.message.slice(0, 80)));
  await press('ArrowRight', 1100);
  await sleep(700);
  const e1 = await est();
  reg('N-cozinha (fase 1) Nick dorme em (5,3) da Cozinha, na chegada', e1?.nick?.mapa === 'cozinha' && e1?.nick?.tileX === 5 && e1?.nick?.tileY === 3 && e1?.nick?.estado === 'dormindo', `jogador=${e1?.mapa}(${e1?.tileX},${e1?.tileY}) nick=${JSON.stringify(e1?.nick)}`);
  await capturar('04-cozinha-nick-dormindo');
  await irPara(page, 'cozinha', 4, 3).catch((e) => console.log('irPara 4,3:', e.message.slice(0, 120)));
  await press('ArrowRight', 260);
  const bloq = await est();
  reg('N11 Nick dormindo bloqueia (5,3) na Cozinha (andar contra ele)', bloq?.tileX === 4 && bloq?.tileY === 3, `jogador=(${bloq?.tileX},${bloq?.tileY})`);
  await apertarA(page);
  await sleep(1500);
  const acord = await est();
  reg('N-cozinha A de (4,3) acorda o Nick (beco)', acord?.nick?.estado === 'acordado', `nick=${JSON.stringify(acord?.nick)}`);
  await capturar('05-cozinha-acordou');
});

// (5) Setas F4 e farejar
await seguro('F1 seta (Cozinha, alvo na Sala)', async () => {
  await fecharTravado();
  await limparTextos(page);
  await press('x', 260);
  await sleep(1400);
  const e = await est();
  reg('F4 seta da Cozinha para a Sala (P7, saída esquerda)', e?.farejo?.porta?.id === 'P7' && e?.farejo?.porta?.saida === 'esquerda', `farejo=${JSON.stringify(e?.farejo)}`);
  await capturar('06-seta-cozinha');
  await sleep(5200);
  const f = await est();
  reg('F1 seta some em 5 s', f?.farejo?.ativo === false, 'sumiu');
});
await seguro('F5 zzz com Nick dormindo', async () => {
  // Nick dormindo: é o tile (5,3). Acorda só depois, então o zzz é testado com outro Nick dormindo: fase 1 ainda dorme? N/A
  reg('F5 zzz com Nick dormindo (fora da Cozinha)', null, 'não repetido nesta rodada: Nick acordou na Cozinha; teste em outra fase fica para a próxima rodada');
});

// (6) Dica: textos da fase atual e do Nick, 3 linhas, sem direção
await seguro('D3 textos da dica', async () => {
  await limparTextos(page);
  await press('h', 300);
  await sleep(400);
  const t = await textos();
  const e = await est();
  const esperado = ['Procure uma parte da árvore.', 'Aperte X e o Nick fareja.'];
  const achou = esperado.every((x) => t.includes(x));
  reg('D3 dica parte1 acordado: textos exatos', achou, `texto: "${t.slice(0, 180)}"`);
  reg('D8 dica sem direção/cômodo', !/\b(cima|baixo|esquerda|direita|Sala|Cozinha|Quarto|Escritório)\b/.test(t), 'verificado no texto');
  await capturar('07-dica-parte1');
  await press('z', 260);
  reg('D2 Z fecha a dica', (await est())?.dicaAberta === false, 'fechou');
});

// Textos das demais fases: conferidos no JSON (captura de cada fase depende de progressão)
reg('D3 textos das demais fases', null, 'conferidos no content/texts/pt-BR.json (sem cima/baixo, <=28 caracteres por linha); leitura ao vivo não feita');

console.log('\nErros:', erros.length ? erros : 'nenhum');
writeFileSync(join(EVID, 'resultados.json'), JSON.stringify({ resultados, erros }, null, 2));
await browser.close();
