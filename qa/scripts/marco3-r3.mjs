// QA Marco 3 (v0.7.0), rodada 3: M1 porta (captura), Nick no Quarto (fase 2) e no Escritório (fase 3),
// zzz, bloqueio, acordar, dica da fase 2/3 ao vivo. Caminho real: código, luzes, peça 1 e peça 2; teleporte só
// para entrar na área (Quarto, Escritório). Build: dist-qa. Teclado. Depois de __teleportar, fecha travado com X.
// Uso: node qa/scripts/marco3-r3.mjs
import { lancar, novoContexto, lerTextos, limparTextos, juntar, sleep, tecla, digitar, irAteHall, irAtePainel } from './lib.mjs';
import { irPara, estado, apertarA } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco3-r3');
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;

const resultados = [];
const reg = (id, ok, nota) => { resultados.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`); };
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'm3r3' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') erros.push(`console: ${m.text()}`); });

const textos = async () => juntar(await lerTextos(page));
const est = () => estado(page);
const press = async (k, ms = 260) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); await sleep(220); };
const teleportar = async (m, s) => { await page.evaluate(([a, b]) => window.__teleportar(a, b), [m, s]); await sleep(600); };
const fecharTravado = async () => { for (let i = 0; i < 12; i++) { const q = await est(); if (!q?.travado) return true; await press('x', 300); await sleep(300); } return false; };
const esperarLivre = async (ms = 8000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const q = await est(); if (q && !q.travado && !q.emConducao) return true; await sleep(150); } return false; };
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
const T0 = Date.now();

await page.goto(url);
await page.waitForSelector('canvas');
await sleep(2000);
await tecla(page, 'z'); await sleep(300);
await tecla(page, 'z'); await sleep(300);
await irAteHall(page, 0);
await sleep(1000);

// M1 porta: código 017, espera de até 8 s pela troca de área, captura
await seguro('M1 porta', async () => {
  await irAtePainel(page);
  await digitar(page, '017');
  await tecla(page, 'z');
  let mapa = null;
  for (let i = 0; i < 32; i++) { await sleep(250); const q = await est(); mapa = q?.mapa; if (mapa === 'sala' && !q.emFade && !q.travado) break; }
  await capturar('01-porta-aberta');
  reg('M1 porta: código 017 abre a P8 e leva à Sala (captura 01-porta-aberta.png)', mapa === 'sala', `mapa=${mapa} após ${(Date.now() - T0) / 1000 | 0} s do início`);
});

// M1 luzes e condução
await seguro('M1 luzes', async () => {
  await fecharTravado();
  await irPara(page, 'sala', 5, 4).catch((e) => console.log('irPara interruptor:', e.message.slice(0, 80)));
  await press('ArrowUp', 260);
  for (let i = 0; i < 40; i++) { const q = await est(); if (q?.emConducao) break; await tecla(page, 'z', { ms: 90, pausa: 350 }); }
  let viu = false; const t1 = Date.now();
  while (Date.now() - t1 < 25000) { const q = await est(); if (q?.emConducao) viu = true; if (viu && !q?.emConducao) break; if (!viu && !q?.emConducao) await tecla(page, 'z', { ms: 90, pausa: 300 }); await sleep(120); }
  for (let i = 0; i < 15; i++) { const q = await est(); if (!q?.travado) break; await tecla(page, 'z', { ms: 90, pausa: 400 }); }
  await sleep(700);
  const q = await est();
  reg('M1 luzes e condução até a árvore', viu && !q?.travado, `mapa=${q?.mapa} (${q?.tileX},${q?.tileY}) nick=${JSON.stringify(q?.nick)}`);
});

// Peça 1 (Sala (1,4)): A de frente (ArrowLeft de (2,4)), conquista, condução, encaixe
await seguro('peça 1', async () => {
  await fecharTravado();
  await irPara(page, 'sala', 2, 4).catch((e) => console.log('irPara peça1:', e.message.slice(0, 80)));
  await press('ArrowLeft', 260);
  await apertarA(page); await sleep(500); // conquista
  await apertarA(page); // Continuar: condução
  for (let i = 0; i < 60; i++) { const q = await est(); if (!q?.travado && !q?.emConducao) break; await sleep(200); }
  for (let i = 0; i < 12; i++) { const q = await est(); if (!q?.travado) break; await tecla(page, 'z', { ms: 90, pausa: 400 }); }
  await sleep(800);
  const q = await est();
  reg('peça 1: encaixe e controle devolvido', !q?.travado, `mapa=${q?.mapa} (${q?.tileX},${q?.tileY}) nick=${JSON.stringify(q?.nick)}`);
  await capturar('02-depois-peca1');
});

// Nick no Quarto (fase 2): o Nick deve estar dormindo em (4,3) do Quarto
await seguro('Quarto', async () => {
  await fecharTravado();
  await teleportar('quarto', 'P2');
  await fecharTravado();
  await sleep(500);
  const q = await est();
  reg('N1/N2 fase 2: Nick dorme no Quarto (4,3)', q?.nick?.mapa === 'quarto' && q?.nick?.tileX === 4 && q?.nick?.tileY === 3 && q?.nick?.estado === 'dormindo', `nick=${JSON.stringify(q?.nick)}`);
  await capturar('03-quarto-nick');
  // F5: B com Nick dormindo -> zzz, sem seta, sem mudança
  await press('x', 260); await sleep(300);
  const f = await est();
  reg('F5 B com Nick dormindo: sem seta, Nick continua dormindo', f?.farejo?.ativo === false && f?.nick?.estado === 'dormindo', `farejo=${JSON.stringify(f?.farejo)} nick=${f?.nick?.estado}`);
  // D3: dica da fase 2 (dormindo): textos esperados
  await limparTextos(page);
  await press('h', 300); await sleep(300);
  const td = await textos();
  reg('D3 dica parte2 dormindo', ['Procure a parte do meio.', 'O Nick ainda está dormindo.'].every((x) => td.includes(x)), `texto: "${td.slice(0, 150)}"`);
  await capturar('04-dica-parte2-dormindo');
  await press('z', 260);
  // N11: bloqueio. Vem de (4,4) virado para cima
  await irPara(page, 'quarto', 4, 4).catch((e) => console.log('irPara quarto 4,4:', e.message.slice(0, 120)));
  await press('ArrowUp', 260);
  const b = await est();
  reg('N11 Nick dormindo bloqueia (4,3) no Quarto', b?.tileX === 4 && b?.tileY === 4, `jogador=(${b?.tileX},${b?.tileY})`);
  await apertarA(page); await sleep(1500);
  const a = await est();
  reg('N2 A de (4,4) acorda o Nick no Quarto', a?.nick?.estado === 'acordado', `nick=${JSON.stringify(a?.nick)}`);
  await capturar('05-quarto-acordou');
  await fecharTravado();
  // F3/F1: alvo é a Cozinha (parte2). Do Quarto a seta é para a P2 (saída direita)
  await press('x', 260); await sleep(1400);
  const s = await est();
  reg('F1/F4 Quarto (alvo Cozinha): seta na P2 saída esquerda (para a Sala)', s?.farejo?.porta?.id === 'P2' && s?.farejo?.porta?.saida === 'esquerda', `farejo=${JSON.stringify(s?.farejo)}`);
  await capturar('06-seta-quarto-P2');
});

// Peça 2 (Cozinha (4,1)): via Sala -> Cozinha pela P7 (com fade real), depois o Nick vai ao Escritório
await seguro('peça 2', async () => {
  await fecharTravado();
  await teleportar('cozinha', 'P7');
  await fecharTravado();
  await irPara(page, 'cozinha', 3, 1).catch((e) => console.log('irPara peça2:', e.message.slice(0, 80)));
  await press('ArrowRight', 300);
  await apertarA(page); await sleep(500);
  await apertarA(page);
  for (let i = 0; i < 60; i++) { const q = await est(); if (!q?.travado && !q?.emConducao) break; await sleep(200); }
  for (let i = 0; i < 12; i++) { const q = await est(); if (!q?.travado) break; await tecla(page, 'z', { ms: 90, pausa: 400 }); }
  await sleep(800);
  const q = await est();
  reg('peça 2: encaixe e controle devolvido', !q?.travado, `mapa=${q?.mapa} (${q?.tileX},${q?.tileY}) nick=${JSON.stringify(q?.nick)}`);
  await capturar('07-depois-peca2');
});

// Escritório (fase 3): Nick dorme em (6,1)
await seguro('Escritório', async () => {
  await fecharTravado();
  await teleportar('escritorio', 'P3');
  await fecharTravado();
  await sleep(400);
  const q = await est();
  reg('N10 fase 3: Nick dorme no Escritório (6,1)', q?.nick?.mapa === 'escritorio' && q?.nick?.tileX === 6 && q?.nick?.tileY === 1 && q?.nick?.estado === 'dormindo', `nick=${JSON.stringify(q?.nick)}`);
  await capturar('08-escritorio-nick');
  await limparTextos(page);
  await press('h', 300); await sleep(300);
  const td = await textos();
  reg('D3 dica parte3 dormindo', ['Procure em outro cômodo.', 'O Nick ainda está dormindo.'].every((x) => td.includes(x)), `texto: "${td.slice(0, 150)}"`);
  await press('z', 260);
});

// Escritório (continuação): acordar, abanar (N12), seta da P3 (F4), F2 e dica acordado (D3)
await seguro('Escritório acordar e seta', async () => {
  await fecharTravado();
  await irPara(page, 'escritorio', 6, 2).catch((e) => console.log('irPara 6,2:', e.message.slice(0, 120)));
  await press('ArrowUp', 260);
  const b = await est();
  reg('N11 Nick dormindo bloqueia (6,1) no Escritório', b?.tileX === 6 && b?.tileY === 2, `jogador=(${b?.tileX},${b?.tileY})`);
  await apertarA(page); await sleep(1500);
  const a = await est();
  reg('N2 A de (6,2) acorda o Nick no Escritório', a?.nick?.estado === 'acordado', `nick=${JSON.stringify(a?.nick)}`);
  await limparTextos(page);
  await apertarA(page); await sleep(300);
  const t = await textos();
  reg('N12 A no Nick acordado (sem outro alvo): sem texto de diálogo', !/Nick acordou/.test(t), `texto: "${t.slice(0, 80)}"`);
  await sleep(900);
  await limparTextos(page);
  await press('x', 260); await sleep(1400);
  const s = await est();
  reg('F4 Escritório (alvo Cozinha): seta na P3', s?.farejo?.porta?.id === 'P3', `farejo=${JSON.stringify(s?.farejo)}`);
  await capturar('10-seta-escritorio-P3');
  await press('x', 260); await sleep(900);
  const f2 = await est();
  reg('F2 B com seta visível reinicia os 5 s', f2?.farejo?.ativo && f2.farejo.restanteMs > 3000, `restante=${f2?.farejo?.restanteMs}`);
  await limparTextos(page);
  await press('h', 300); await sleep(300);
  const td = await textos();
  reg('D3 dica parte3 acordado', ['Procure em outro cômodo.', 'Aperte X e o Nick fareja.'].every((x) => td.includes(x)), `texto: "${td.slice(0, 140)}"`);
  await press('z', 260);
});

console.log(`\nTempo do roteiro: ${((Date.now() - T0) / 1000).toFixed(0)} s`);
console.log('Erros:', erros.length ? erros : 'nenhum');
writeFileSync(join(EVID, 'resultados.json'), JSON.stringify({ resultados, erros }, null, 2));
await browser.close();
