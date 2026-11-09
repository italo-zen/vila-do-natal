// QA Marco 4 (v0.8.1), rodada 4: plot twist da parte 3 (3 páginas da chegada), controle durante o diálogo,
// H/Backspace/X durante o diálogo, final (caixa, encaixe, créditos 0.8.1), exame da árvore no estado 3, regressão
// rápida de Nick (seguir e farejar). Partida REAL até a parte 3: só __irParaFase('parte2') e a parte 3 é jogada
// (sem __irParaFase('parte3')). Teclado. Build: dist-qa.
// Uso: IDX=0 NOME=LoLô MODO=Z node qa/scripts/marco4-r4.mjs   (Z: avança pelas 3 páginas; X: fecha na página 2)
import { lancar, novoContexto, sleep, tecla, irAteHall } from './lib.mjs';
import { irPara, objeto } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const IDX = Number(process.env.IDX ?? 0);
const NOME = process.env.NOME ?? 'LoLô';
const MODO = process.env.MODO ?? 'Z';
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco4-r4', NOME);
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const T0 = Date.now();
const reg = (id, ok, nota) => console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${NOME} ${id} :: ${nota}`);
const P1 = 'A árvore está montada! Que linda!';
const P2 = 'Mas tem algo estranho... Ainda falta alguma coisa.';
const P3 = 'Deve estar perdida pela casa.';

const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'm4r4' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(e.message));
const est = async () => { for (let i = 0; i < 4; i++) { try { return await page.evaluate(() => window.__estado()); } catch { await sleep(150); } } return null; };
const ver = async () => page.evaluate(() => window.__textos.map((x) => x.t).join(' ').replace(/\s+/g, ' '));
const limpar = () => page.evaluate(() => { window.__textos.length = 0; });
const fechar = async () => { for (let i = 0; i < 12; i++) { const q = await est(); if (!q?.travado) return; await tecla(page, 'z', { ms: 90, pausa: 400 }); } };
const esperarTexto = async (f, lim = 8000) => { const t0 = Date.now(); while (Date.now() - t0 < lim) { if ((await ver()).includes(f)) return true; await sleep(80); } return false; };
const capt = async (nome) => {
  const d = await page.evaluate(() => { const c = document.querySelector('canvas'); const o = document.createElement('canvas'); o.width = c.width * 3; o.height = c.height * 3; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height); return o.toDataURL('image/png'); });
  writeFileSync(join(EVID, `${nome}.png`), Buffer.from(d.split(',')[1], 'base64'));
};
const seguro = async (id, fn) => { try { await fn(); } catch (e) { reg(id, false, `exceção: ${e.message.slice(0, 160)}`); } };

await page.goto(url); await page.waitForSelector('canvas'); await sleep(1800);
await capt('00-titulo');
const tit = await ver();
reg('CR6 título mostra v0.8.1', tit.includes('0.8.1'), tit.slice(0, 80));

await seguro('partida', async () => {
  await irAteHall(page, IDX); await sleep(600);
  // Gancho só para concluir a peça 1 (sem __irParaFase('parte3')). Peça 2 e peça 3 são jogadas de verdade.
  await page.evaluate(() => window.__irParaFase('parte2'));
  await page.evaluate(() => window.__teleportar('cozinha', 'P7')); await sleep(900); await fechar();
  // Peça 2 (cozinha (4,1)): de (3,1), de frente para a direita, A
  await seguro('peça 2', async () => {
    await irPara(page, 'cozinha', 3, 1);
    await tecla(page, 'ArrowRight', { ms: 300, pausa: 300 });
    await limpar(); await tecla(page, 'z', { ms: 90, pausa: 400 });
    reg('P2 conquista da segunda parte (A)', await esperarTexto('segunda parte', 3000), (await ver()).slice(0, 100));
    await tecla(page, 'z', { ms: 90, pausa: 100 });
    const c2 = await esperarTexto('Agora a árvore tem 2 partes', 15000);
    reg('P2 chegada "Agora a árvore tem 2 partes"', c2, '');
    await fechar();
  });
  // Movimento de cômodo (teleporte, não conclui fase) para a peça 3 na Cozinha
  await page.evaluate(() => window.__teleportar('cozinha', 'P7')); await sleep(900); await fechar();
  // Peça 3 (cozinha (3,5)): de (3,4), de frente para baixo, A
  await seguro('caminho peça 3', () => irPara(page, 'cozinha', 3, 4));
  await tecla(page, 'ArrowDown', { ms: 300, pausa: 300 });
  await limpar(); await tecla(page, 'z', { ms: 90, pausa: 400 });
  const conq = await esperarTexto('última parte', 3000);
  reg('P3 conquista da última parte (A)', conq, (await ver()).slice(0, 120));
  await tecla(page, 'z', { ms: 90, pausa: 100 });
  // Condução até (3,7) da Sala
  let chegou = false;
  for (let i = 0; i < 500; i++) {
    await sleep(50);
    const q = await est(); if (!q) continue;
    if (q.mapa === 'sala' && q.tileX === 3 && q.tileY === 7) { chegou = true; break; }
  }
  reg('condução até (3,7) Sala', chegou, '');
  // Caso 1: 3 páginas, uma de cada vez
  await limpar();
  const p1 = await esperarTexto(P1, 6000);
  reg('CASO1 página 1 da chegada', p1, (await ver()).slice(0, 140));
  await sleep(1500); await capt(`CASO1-p1-${MODO}`);
  // Caso 2: durante o diálogo, controle travado, Nick sem dormir, caixa ausente (não visível daqui)
  const durante = [];
  for (let i = 0; i < 12; i++) { await sleep(100); const q = await est(); durante.push({ travado: q?.travado, nick: q?.nick?.estado, t: `${q?.nick?.mapa}:${q?.nick?.tileX},${q?.nick?.tileY}` }); }
  const travadoP1 = durante.every((d) => d.travado === true); console.log('DIAG nick durante', [...new Set(durante.map((d) => d.t))].join(' / '));
  const nickNaoDormiu = !durante.some((d) => d.t.startsWith('sala:8,5'));
  reg('CASO2 durante a página 1: controle travado e Nick não vai à Sala (8,5)', travadoP1 && nickNaoDormiu, `travado=${travadoP1} nick=${[...new Set(durante.map((d) => d.nick))].join('/')}`);
  // H durante a página 1: sem efeito (Dica não abre, página não muda)
  await limpar(); await tecla(page, 'h', { ms: 90, pausa: 300 });
  const hP1 = await ver();
  reg('CASO3 H na página 1: sem "Dica"', !hP1.includes('Dica') && (await est())?.travado === true, hP1.slice(0, 100));
  await tecla(page, 'z', { ms: 90, pausa: 400 });
  const p2 = await esperarTexto(P2, 4000);
  reg('CASO1 página 2 da chegada (Z avança)', p2, (await ver()).slice(-120));
  await sleep(1500); await capt(`CASO1-p2-${MODO}`);
  // Página 2: H e Backspace (B alternativo) sem efeito
  await limpar(); await tecla(page, 'h', { ms: 90, pausa: 300 });
  const hP2 = await ver();
  reg('CASO3 H na página 2: sem "Dica" e sem avanço', !hP2.includes('Dica') && !hP2.includes(P3) && (await est())?.travado === true, hP2.slice(0, 100));
  await limpar(); await tecla(page, 'Backspace', { ms: 90, pausa: 300 });
  const bsP2 = await ver();
  reg('CASO3 Backspace (B) na página 2: sem efeito', !bsP2.includes('Dica') && !bsP2.includes(P3) && (await est())?.travado === true, bsP2.slice(0, 100));
  if (MODO === 'Z') {
    await limpar(); await tecla(page, 'z', { ms: 90, pausa: 400 });
    const p3 = await esperarTexto(P3, 4000);
    reg('CASO1 página 3 da chegada (Z avança)', p3, (await ver()).slice(-100));
    await sleep(1500); await capt(`CASO1-p3-${MODO}`);
    // Página 3: X fecha tudo (caso 1)
    await limpar(); await tecla(page, 'x', { ms: 90, pausa: 500 });
    const q = await est();
    reg('CASO1 X na página 3 fecha o diálogo inteiro', q?.travado === false, `travado=${q?.travado}`);
  } else {
    // Página 2: X fecha tudo (caso 1); a página 3 não deve aparecer
    await limpar(); await tecla(page, 'x', { ms: 90, pausa: 500 });
    await sleep(400);
    const q = await est();
    const viu3 = (await ver()).includes(P3);
    reg('CASO1 X na página 2 fecha tudo (sem página 3)', q?.travado === false && !viu3, `travado=${q?.travado} p3=${viu3}`);
  }
  // Caso 2 depois: controle volta, Nick dorme na Sala (8,5)
  let dorme = null;
  for (let i = 0; i < 30; i++) { await sleep(150); dorme = await est(); if (dorme?.nick?.estado === 'dormindo' && !dorme.travado) break; }
  reg('CASO2 depois do diálogo: controle volta e Nick dorme na Sala (8,5)', dorme?.nick?.estado === 'dormindo' && dorme.nick.mapa === 'sala' && dorme.nick.tileX === 8 && dorme.nick.tileY === 5 && dorme.travado === false, `nick=${JSON.stringify(dorme?.nick)} travado=${dorme?.travado}`);
  await capt('CASO2-sala-depois');
  // Caso 5: exame da árvore no estado 3 (a árvore está em (3,8), o sobrinho em (3,7) olhando para baixo)
  await seguro('exame', async () => {
    await tecla(page, 'ArrowDown', { ms: 200, pausa: 250 });
    await limpar(); await tecla(page, 'z', { ms: 90, pausa: 400 });
    const ex = await ver();
    await limpar(); await tecla(page, 'z', { ms: 90, pausa: 400 }); const ex2 = await ver(); reg('CASO5 exame da árvore no estado 3', ex.includes('A árvore está montada!') && ex2.includes('Falta a caixa de enfeites.'), 'p1=' + ex.slice(0, 60) + ' | p2=' + ex2.slice(0, 80));
    await capt('CASO5-exame-estado3');
    await fechar();
  });
  // Caso 6: Nick acorda com A (Sala), passa a seguir e farejar (X) aponta P3
  await seguro('caso6 Nick', async () => {
    await irPara(page, 'sala', 7, 5);
    await tecla(page, 'ArrowRight', { ms: 200, pausa: 300 });
    await limpar(); await tecla(page, 'z', { ms: 90, pausa: 400 }); await sleep(1800);
    const ac = await ver(); const qa = await est();
    reg('CASO6 Nick acorda com A e diálogo de primeira vez', ac.includes('O Nick acordou') || qa?.nick?.estado === 'acordado', `nick=${qa?.nick?.estado} txt=${ac.slice(0, 100)}`);
    await capt('CASO6-nick-acordou');
    await fechar();
    await tecla(page, 'ArrowLeft', { ms: 200, pausa: 300 });
    const seg = await est();
    reg('CASO6 Nick segue o sobrinho', seg?.nick?.filaEntradas > 0 || seg?.nick?.estado === 'seguindo' || seg?.nick?.estado === 'acordado', `nick=${JSON.stringify(seg?.nick)}`);
    await limpar(); await tecla(page, 'x', { ms: 90, pausa: 300 }); await sleep(700);
    const fj = await est();
    reg('CASO6 X (farejar) aponta P3 (direita) na Sala', fj?.farejo?.ativo === true && fj?.farejo?.porta?.id === 'P3', `farejo=${JSON.stringify(fj?.farejo)}`);
    await capt('CASO6-farejar-P3');
    await sleep(5200);
  });
  // Caso 4: caixa no Escritório (porta P3 da Sala, pela direita) e encaixe
  await seguro('porta P3', async () => {
    const p3o = objeto('sala', 'porta', 'P3');
    await irPara(page, 'sala', p3o.x - 1, p3o.y);
    await tecla(page, 'ArrowRight', { ms: 300, pausa: 900 });
    const q = await est();
    reg('porta P3 leva ao Escritório', q?.mapa === 'escritorio', `mapa=${q?.mapa}`);
  });
  await seguro('caixa', async () => {
    await irPara(page, 'escritorio', 5, 3);
    await limpar(); await tecla(page, 'z', { ms: 90, pausa: 500 });
    const cx = await esperarTexto('Parabéns, você conseguiu encontrar a caixa de enfeites de Natal!', 3000);
    reg('CASO2 caixa aparece no Escritório (conquista A em (5,3))', cx, (await ver()).slice(0, 120));
    await capt('CASO2-caixa-escritorio');
  });
  await seguro('encaixe', async () => {
    await tecla(page, 'z', { ms: 90, pausa: 100 });
    let chegou2 = false;
    for (let i = 0; i < 500; i++) {
      await sleep(50);
      const q = await est(); if (!q) continue;
      if (q.mapa === 'sala' && q.tileX === 3 && q.tileY === 7) { chegou2 = true; break; }
    }
    reg('condução da caixa até (3,7) Sala', chegou2, '');
    const fin = await esperarTexto('Agora a árvore está toda enfeitada!', 6000);
    reg('CASO4 diálogo final "Agora a árvore está toda enfeitada!"', fin, (await ver()).slice(0, 120));
    await sleep(1500); await capt('CASO4-final-p1');
    await limpar(); await tecla(page, 'z', { ms: 90, pausa: 400 });
    await sleep(1500); await capt('CASO4-final-p2'); console.log('DIAG após Z final p1', (await ver()).slice(-140)); const f2 = await esperarTexto('Feliz Natal para a família!', 4000);
    reg('CASO4 diálogo final página 2', f2, '');
    await limpar(); await tecla(page, 'x', { ms: 90, pausa: 400 });
    const cr = await esperarTexto('Voltar ao título', 6000);
    await sleep(1500);
    const tc = await ver();
    reg('CASO4 créditos com Versão 0.8.1', cr && tc.includes('Versão 0.8.1') && tc.includes(NOME), tc.slice(0, 160));
    await capt('CASO4-creditos');
    await limpar(); await tecla(page, 'z', { ms: 90, pausa: 500 }); await sleep(1500); await capt('CASO4-apos-Z-creditos');
    console.log('DIAG após Z créditos', (await ver()).slice(0, 140)); const ti = await esperarTexto('Começar', 4000);
    reg('CASO4 "Voltar ao título" leva ao título', ti, (await ver()).slice(0, 100));
  });
});
console.log(`TEMPO: ${((Date.now() - T0) / 1000).toFixed(0)} s; ERROS DE PÁGINA: ${erros.length} ${erros.slice(0, 3).join(' || ')}`);
await browser.close();
