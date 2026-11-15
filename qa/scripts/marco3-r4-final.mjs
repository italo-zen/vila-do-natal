// QA Marco 3 (v0.7.0), rodada 4 (final): condução com Nick acompanhando (N7), barra na condução (B4),
// "Au!" e reação na chegada (N8), dormir ao fim da chegada (N9), nova partida (N13), F6 depois da parte 3,
// F8 (B sem efeito em condução e dica), F9 (passar pelo gatilho com seta). Build: dist-qa. Teclado.
// Uso: node qa/scripts/marco3-r4-final.mjs
import { lancar, novoContexto, lerTextos, limparTextos, juntar, sleep, tecla, irAteHall, irAtePainel, digitar } from './lib.mjs';
import { irPara, estado, apertarA, objeto } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco3-r4');
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const resultados = [];
const reg = (id, ok, nota) => { resultados.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`); };
const T0 = Date.now();
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'm3r4' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`));
const est = () => estado(page);
const textos = async () => juntar(await lerTextos(page));
const ver = () => page.evaluate(() => window.__textos.map((x) => x.t).join(' '));
const press = async (k, ms = 260) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); await sleep(220); };
const fechar = async () => { for (let i = 0; i < 12; i++) { const q = await est(); if (!q?.travado) return; await press('x', 300); await sleep(300); } };
async function capturar(nome) {
  const d = await page.evaluate(() => { const c = document.querySelector('canvas'); const o = document.createElement('canvas'); o.width = c.width * 3; o.height = c.height * 3; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height); return o.toDataURL('image/png'); });
  writeFileSync(join(EVID, `${nome}.png`), Buffer.from(d.split(',')[1], 'base64'));
}
const seguro = async (rotulo, fn) => { try { await fn(); } catch (err) { reg(rotulo, false, `exceção: ${err.message.slice(0, 160)}`); } };

await page.goto(url);
await page.waitForSelector('canvas');
await sleep(2000);
await tecla(page, 'z'); await sleep(300); await tecla(page, 'z'); await sleep(300);
const IDX = Number(process.env.IDX ?? 0);
await irAteHall(page, IDX);
await sleep(800);
await seguro('setup', async () => {
  const fa = await page.evaluate(() => window.__irParaFase('parte1'));
  reg('setup __irParaFase("parte1") (luzes concluídas)', fa === 'parte1', `retorno=${fa}`);
  await page.evaluate(() => window.__teleportar('cozinha', 'P7'));
  await sleep(600);
  await fechar();
  const e = await est();
  reg('N1 Nick dorme na Cozinha (5,3) na fase 1', e?.nick?.mapa === 'cozinha' && e?.nick?.tileX === 5 && e?.nick?.tileY === 3 && e?.nick?.estado === 'dormindo', `nick=${JSON.stringify(e?.nick)}`);
});

// N2 acordar na Cozinha a partir de (4,3)
await seguro('N2 cozinha', async () => {
  await irPara(page, 'cozinha', 4, 3).catch((er) => console.log('irPara 4,3:', er.message.slice(0, 100)));
  await press('ArrowRight', 260);
  await apertarA(page); await sleep(1500);
  const e = await est();
  reg('N2 A de (4,3) acorda o Nick na Cozinha', e?.nick?.estado === 'acordado', `nick=${JSON.stringify(e?.nick)}`);
  await limparTextos(page);
  await sleep(200);
});

// F9 + troca de área com o Nick junto: X (seta na P7), anda para o gatilho (0,0)
await seguro('F9 e troca de área', async () => {
  await fechar();
  await limparTextos(page);
  await press('x', 260); await sleep(1400);
  let s = await est();
  if (!s?.farejo?.ativo) { await press('x', 260); await sleep(1400); s = await est(); }
  reg('F4 seta na Cozinha (alvo Sala): P7 saída esquerda', s?.farejo?.porta?.id === 'P7' && s?.farejo?.porta?.saida === 'esquerda', `farejo=${JSON.stringify(s?.farejo)}`);
  await irPara(page, 'cozinha', 1, 0).catch((er) => console.log('irPara 1,0:', er.message.slice(0, 100)));
  await press('ArrowLeft', 900);
  await sleep(600);
  const e = await est();
  reg('F9 andar sobre o gatilho com seta visível leva à Sala; Nick acordado vem junto', e?.mapa === 'sala' && e?.nick?.mapa === 'sala' && e?.nick?.estado === 'acordado', `jogador=${e?.mapa}(${e?.tileX},${e?.tileY}) nick=${JSON.stringify(e?.nick)}`);
  await capturar('01-sala-nick-vem-junto');
});

// B4/N7/N8: condução da peça 1 com Nick acordado acompanhando; barra e texto durante a condução
await seguro('N7 condução com Nick', async () => {
  await fechar();
  await irPara(page, 'sala', 2, 4).catch((er) => console.log('irPara 2,4:', er.message.slice(0, 100)));
  await press('ArrowLeft', 260);
  await apertarA(page); await sleep(500);
  await limparTextos(page);
  await apertarA(page); // Continuar: condução
  const amostras = []; let barraNaConducao = false; let auNaChegada = false; let nickSeguiu = false;
  const t0 = Date.now();
  while (Date.now() - t0 < 12000) {
    const q = await est();
    if (q?.emConducao) {
      const txt = await ver();
      if (txt.includes('Setas:') || txt.includes('farejar')) barraNaConducao = true;
      if (txt.includes('Au!')) auNaChegada = true;
      amostras.push(`${q.tileX},${q.tileY}/n${q.nick.tileX},${q.nick.tileY}`);
      if (amostras.length === 3) await capturar('02-conducao-meio');
    } else if (amostras.length && !q?.emFade) break;
    await sleep(120);
  }
  const movimentoNick = new Set(amostras.map((a) => a.split('/')[1])).size;
  nickSeguiu = movimentoNick > 1;
  reg('N7 Nick acompanha a condução (muda de tile)', nickSeguiu, `amostras (jogador/nick): ${amostras.slice(0, 8).join(' ')}`);
  reg('B4 barra vazia durante a condução (sem "Setas:")', amostras.length > 0 && !barraNaConducao, `amostras=${amostras.length}`);
  // N8 chegada: "Au!" e diálogo de encaixe
  const fim = Date.now();
  while (Date.now() - fim < 2500) { const txt = await ver(); if (txt.includes('Au!')) auNaChegada = true; if (txt.includes('Agora a árvore')) break; await sleep(100); }
  reg('N8 "Au!" na chegada com conquista', auNaChegada, 'texto "Au!" lido no buffer (sem consumir) durante a condução e a chegada');
  await fechar();
  await sleep(600);
  const e = await est();
  reg('N9 ao fim do diálogo, Nick dorme no Quarto (4,3) (fumacinha: ver captura)', e?.nick?.mapa === 'quarto' && e?.nick?.estado === 'dormindo', `nick=${JSON.stringify(e?.nick)}`);
  await capturar('03-depois-chegada');
});

// F8: B sem efeito durante condução e dica (já na exploração; testar a dica)
await seguro('F8 B na condução e na dica', async () => {
  // Condução: X não faz nada (o Nick não muda de estado; sem seta)
  await irPara(page, 'sala', 2, 4).catch(() => {});
  await press('ArrowLeft', 260);
  await apertarA(page); await sleep(500);
  await apertarA(page);
  await sleep(250);
  await press('x', 200);
  const durante = await est();
  reg('F8 B durante a condução: sem seta', durante?.farejo?.ativo === false, `emConducao=${durante?.emConducao} farejo=${JSON.stringify(durante?.farejo)}`);
  for (let i = 0; i < 40; i++) { const q = await est(); if (!q?.travado && !q?.emConducao) break; await sleep(200); }
  for (let i = 0; i < 10; i++) { const q = await est(); if (!q?.travado) break; await tecla(page, 'z', { ms: 90, pausa: 400 }); }
  // Dica: H abre, X fecha (16.8.3: Z, X, Esc e Voltar fecham; H não)
  await limparTextos(page);
  await press('h', 300); await sleep(300);
  await press('h', 260); await sleep(200);
  const q = await est();
  reg('F8 H não fecha a dica (D2)', q?.dicaAberta === true, `dicaAberta=${q?.dicaAberta}`);
  await press('x', 260); await sleep(300);
  reg('F8 X fecha a dica (16.8.3)', (await est())?.dicaAberta === false, 'fechou com X');
});

// N13 nova partida: reload e volta a dormir na Sala (8,5) com o diálogo de primeira vez
await seguro('N13 nova partida', async () => {
  await page.reload(); await page.waitForSelector('canvas'); await sleep(2000);
  await tecla(page, 'z'); await sleep(300); await tecla(page, 'z'); await sleep(300);
  await irAteHall(page, IDX); await sleep(800);
  await page.evaluate(() => window.__teleportar('sala', 'P7'));
  await sleep(600);
  await fechar();
  const e = await est();
  reg('N13 nova partida: Nick dorme na Sala (8,5) de novo', e?.nick?.mapa === 'sala' && e?.nick?.tileX === 8 && e?.nick?.tileY === 5 && e?.nick?.estado === 'dormindo', `nick=${JSON.stringify(e?.nick)} fase=${e?.fase}`);
});

// F6 (depois da parte 3): __irParaFase('livre') se existir; Nick dorme na Sala, B mostra zzz, A acorda sem diálogo, B abana
await seguro('F6 depois da parte 3', async () => {
  const fa = await page.evaluate(() => window.__irParaFase('enfeites'));
  reg('F6 __irParaFase("enfeites") (depois da parte 3, fase livre)', fa === 'enfeites', `retorno=${fa}`);
  await page.evaluate(() => window.__teleportar('sala', 'P7'));
  await sleep(600); await fechar();
  let e = await est();
  reg('F6 depois da parte 3: Nick dorme na Sala (8,5)', e?.nick?.mapa === 'sala' && e?.nick?.estado === 'dormindo', `nick=${JSON.stringify(e?.nick)}`);
  await limparTextos(page);
  await press('x', 260); await sleep(400);
  reg('F6 B com Nick dormindo: zzz, sem seta', (await est())?.farejo?.ativo === false, `farejo=${JSON.stringify((await est())?.farejo)}`);
  await irPara(page, 'sala', 9, 5).catch(() => {});
  await press('ArrowLeft', 260);
  await limparTextos(page);
  await apertarA(page); await sleep(1500);
  const acord = await ver();
  reg('F6 A acorda o Nick (o diálogo de primeira vez aparece: é a primeira vez desta partida)', (await est())?.nick?.estado === 'acordado' && /Nick acordou/.test(acord), `buffer="${acord.slice(0, 60)}"`);
  await fechar();
  await limparTextos(page);
  await press('x', 260); await sleep(1400);
  const abana = await ver();
  reg('F6 B com Nick acordado sem alvo: abana "Au!" e sem seta', abana.includes('Au!') && (await est())?.farejo?.ativo === false, `buffer="${abana.slice(0, 60)}"`);
});

console.log(`\nTempo: ${((Date.now() - T0) / 1000).toFixed(0)} s`);
console.log('Erros:', erros.length ? erros : 'nenhum');
writeFileSync(join(EVID, 'resultados-final.json'), JSON.stringify({ resultados, erros }, null, 2));
await browser.close();
