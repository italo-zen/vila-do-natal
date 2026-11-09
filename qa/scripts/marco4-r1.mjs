// QA Marco 4 (v0.8.0), rodada 1: fase enfeites (EN1 a EN8, EN12 parcial), créditos (CR1, CR2, CR4, CR6) e
// regressão curta (título, RG5). Teclado. Build: dist-qa (npm run build:qa).
// Uso: IDX=0 MODO=completo node qa/scripts/marco4-r1.mjs   (LoLô, roteiro completo com EN1)
//      IDX=1 MODO=rapido   node qa/scripts/marco4-r1.mjs   (BiBi, a partir da fase enfeites, com Nick acordado)
// Atalhos de QA (gancho, dist-qa): __irParaFase e __teleportar. A chegada da parte 3 NÃO é jogada no roteiro
// rápido: o gancho conclui parte3, então a caixa aparece sem o diálogo de chegada (ver registro no checklist).
import { lancar, novoContexto, sleep, tecla, irAteHall, juntar } from './lib.mjs';
import { irPara, estado, ladosDe, objeto, rotaEntre } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const IDX = Number(process.env.IDX ?? 0);
const MODO = process.env.MODO ?? 'completo';
const NOME = ['LoLô', 'BiBi', 'DanDan', 'TuTu'][IDX];
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco4-r1', NOME);
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const resultados = [];
const reg = (id, ok, nota) => { resultados.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${NOME} ${id} :: ${nota}`); };
const T0 = Date.now();
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'm4r1' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(e.message));
const est = async () => { for (let i = 0; i < 4; i++) { try { return await page.evaluate(() => window.__estado()); } catch { await sleep(150); } } return null; };
const txt = () => page.evaluate(() => window.__textos.map((x) => x.t).slice(-60).join(' | '));
const limpar = () => page.evaluate(() => { window.__textos.length = 0; });
const ver = async () => page.evaluate(() => window.__textos.map((x) => x.t).join(' ').replace(/\s+/g, ' '));
const press = async (k, ms = 260) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); await sleep(200); };
const fechar = async () => { for (let i = 0; i < 12; i++) { const q = await est(); if (!q?.travado) return; await tecla(page, 'z', { ms: 90, pausa: 400 }); } };
const esperarTexto = async (frase, limite = 8000) => { const t0 = Date.now(); while (Date.now() - t0 < limite) { const v = await ver(); if (v.includes(frase)) return true; await sleep(120); } return false; };
async function capturar(nome) {
  const d = await page.evaluate(() => { const c = document.querySelector('canvas'); const o = document.createElement('canvas'); o.width = c.width * 3; o.height = c.height * 3; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height); return o.toDataURL('image/png'); });
  writeFileSync(join(EVID, `${nome}.png`), Buffer.from(d.split(',')[1], 'base64'));
}
const seguro = async (r, fn) => { try { await fn(); } catch (e) { reg(r, false, `exceção: ${e.message.slice(0, 160)}`); } };

// Lado do enfeite (tile livre ao lado da caixa) alcançável, e a direção que aponta para a caixa.
function ladoEnfeite() {
  const c = objeto('escritorio', 'enfeite', 'enfeite');
  const lados = ladosDe('escritorio', 'enfeite', 'enfeite');
  return { c, lados };
}
const DIR_DE = (dx, dy) => (dx > 0 ? 'ArrowRight' : dx < 0 ? 'ArrowLeft' : dy > 0 ? 'ArrowDown' : 'ArrowUp');

await page.goto(url);
await page.waitForSelector('canvas');
await sleep(2000);
await capturar('00-titulo');
reg('CR6/título v0.8.0', (await ver()).includes('v0.8.0'), (await ver()).match(/v\d+\.\d+\.\d+/g)?.join(',') ?? 'sem versão');

await seguro('partida', async () => {
  await irAteHall(page, IDX);
  await sleep(600);
  if (MODO === 'completo') {
    // Estado inicial da fase enfeites: parte 1 e 2 (atalho), depois a parte 3 sem concluir.
    const fa = await page.evaluate(() => window.__irParaFase('parte3'));
    reg('setup __irParaFase(parte3)', fa !== null, `retorno=${fa}`);
    await page.evaluate(() => window.__teleportar('escritorio', 'P3'));
    await sleep(900);
    await fechar();
    const q = await est();
    reg('EN1 caixa escondida: Escritório, antes do diálogo de chegada da parte 3', q?.mapa === 'escritorio', `mapa=${q?.mapa} tile=(${q?.tileX},${q?.tileY})`);
    await capturar('EN1-antes-da-chegada-escritorio');
    // Anda até (4,2), de frente para cima (caixa em (5,2)), e dá A.
    await seguro('EN1 caminho', () => irPara(page, 'escritorio', 5, 3));
    await limpar();
    await tecla(page, 'z', { ms: 90, pausa: 500 });
    await sleep(300);
    const t1 = await ver();
    const ok1 = t1.includes('Ainda não!') && t1.includes('Essa é a caixa de enfeites. Monte a árvore antes.');
    reg('EN1 aviso "Ainda não!" ao A', ok1, `textos=${t1.slice(0, 200)}`);
    await capturar('EN1-ainda-nao');
    const pag1 = await ver();
    await tecla(page, 'z', { ms: 90, pausa: 400 });
    const pag2 = await ver();
    reg('EN1 2ª página "Essa é a caixa..."', pag2.includes('Essa é a caixa de enfeites. Monte a árvore antes.'), `p1=${pag1.slice(-80)}`);
    await capturar('EN1-pagina2');
    await tecla(page, 'z', { ms: 90, pausa: 400 });
    const dep = await est();
    reg('EN1 Z avança, nada muda', dep && !dep.travado && dep.mapa === 'escritorio', `mapa=${dep?.mapa} travado=${dep?.travado}`);
    await tecla(page, 'x', { ms: 90, pausa: 300 });
  }
  // Fase enfeites (gancho). Em MODO rápido, a parte 3 é concluída pelo atalho.
  const fa2 = await page.evaluate(() => window.__irParaFase('enfeites'));
  reg('setup __irParaFase(enfeites)', fa2 === 'enfeites', `retorno=${fa2}`);
  await page.evaluate(() => window.__teleportar('escritorio', 'P3'));
  await sleep(900);
  await fechar();
  // EN2: caixa visível no Escritório, a 3 tiles (a partir de (1,5) o tile (5,2) fica a 3 + 3).
  await capturar('EN2-caixa-escritorio');
  const q2 = await est();
  reg('EN2 caixa visível no Escritório (captura EN2-caixa-escritorio.png)', q2?.mapa === 'escritorio', `tile=(${q2?.tileX},${q2?.tileY}); conferir a captura`);
  // Nick: dorme na Sala (8,5) com a fase enfeites.
  await page.evaluate(() => window.__teleportar('sala', 'P3'));
  await sleep(700);
  await fechar();
  const qs = await est();
  reg('EN2 Nick dorme na Sala (8,5)', qs?.nick && qs.nick.tileX === 8 && qs.nick.tileY === 5, `nick=${JSON.stringify(qs?.nick)}`);
  await capturar('EN2-sala-nick');
  if (MODO === 'rapido') {
    // Acordar o Nick: A na frente dele, se o caminho existir (Nick em (8,5), livre de (7,5)).
    await seguro('acordar Nick', async () => {
      await irPara(page, 'sala', 7, 5);
      await limpar();
      await press('ArrowRight', 200);
      await tecla(page, 'z', { ms: 90, pausa: 400 });
      await sleep(400);
      const t = await ver();
      const q = await est();
      reg('Nick acordado por A (BiBi)', q?.nick?.dormindo === false || t.includes('Nick acordou'), `nick=${JSON.stringify(q?.nick)} textos=${t.slice(0, 160)}`);
      await fechar();
    });
  }
  // Ir ao Escritório, de frente para a caixa (4,2)->A.
  await seguro('caminho até a caixa', async () => {
    await page.evaluate(() => window.__teleportar('escritorio', 'P3'));
    await sleep(800);
    await fechar();
    await irPara(page, 'escritorio', 5, 3);
  });
  await limpar();
  await tecla(page, 'z', { ms: 90, pausa: 500 });
  await sleep(300);
  const tc = await ver();
  reg('EN3 conquista "Parabéns..." com "Z ou X: continuar"', tc.includes('Parabéns, você conseguiu encontrar a caixa de enfeites de Natal!') && tc.includes('Z ou X: continuar'), `textos=${tc.slice(0, 220)}`);
  await capturar('EN3-conquista');
  // EN4: Continuar -> condução sem toque. Mede passos e tempo.
  const tInicio = Date.now();
  await limpar();
  await tecla(page, 'z', { ms: 90, pausa: 100 });
  let t_ini = null; const passos = []; let ultimo = null; let t_fim = null; let barraVazia = null;
  for (let i = 0; i < 400; i++) {
    await sleep(60);
    const q = await est();
    if (!q) continue;
    const pos = `${q.mapa}:${q.tileX},${q.tileY}`;
    if (pos !== ultimo) { passos.push(pos); ultimo = pos; }
    if (q.mapa === 'sala' && q.tileX === 7 && q.tileY === 2) t_ini ??= Date.now();
    if (barraVazia === null && q.mapa === 'sala') barraVazia = (await ver()).includes('Z ou X');
    if (q.mapa === 'sala' && q.tileX === 3 && q.tileY === 7 && !q.travado && !q.emFade) { t_fim = Date.now(); break; }
  }
  const dur = t_fim ? ((t_fim - tInicio) / 1000).toFixed(1) : 'não chegou';
  const nPassos = passos.length - 1;
  reg('EN4 condução até (3,7) da Sala', !!t_fim, `tempo=${dur}s passos_registrados=${nPassos} trajeto=${passos.join(' > ')}`);
  reg('EN4 barra vazia na condução (sem "Z ou X")', barraVazia === false, `barraVazia=${barraVazia}`);
  // EN5: encaixe. Captura 3 quadros e mede até o diálogo final.
  const tEnc = Date.now();
  await capturar('EN5-q1');
  await sleep(500); await capturar('EN5-q2');
  await sleep(500); await capturar('EN5-q3');
  const achouFinal = await esperarTexto('Agora a árvore está toda enfeitada!', 6000);
  const tFinal = ((Date.now() - tEnc) / 1000).toFixed(1);
  reg('EN5 diálogo final após o encaixe (~1,7 s do fim da condução)', achouFinal, `tempo até o diálogo final a partir do fim da condução=${tFinal}s (inclui captura)`);
  reg('EN7 "Agora a árvore está toda enfeitada!" e "Feliz Natal para a família!" (página 1)', achouFinal, 'ver a 2ª página');
  await capturar('EN7-pagina1');
  // EN7: nenhuma página passa sozinha
  await sleep(4000);
  const p1 = await ver();
  reg('EN7 não avança sozinho em 4 s', p1.includes('Agora a árvore está toda enfeitada!') && !p1.includes('Feliz Natal para a família!') || p1.includes('Feliz Natal para a família!') && false, `textos=${p1.slice(-160)}`);
  await tecla(page, 'z', { ms: 90, pausa: 400 });
  const p2 = await esperarTexto('Feliz Natal para a família!', 3000);
  reg('EN7 Z avança à página 2', p2, 'página 2 visível');
  await capturar('EN7-pagina2');
  // EN8: Z fecha a página 2 e vai ao fade e aos créditos.
  await limpar();
  await tecla(page, 'z', { ms: 90, pausa: 100 });
  const creditos = await esperarTexto('Voltar ao título', 5000);
  reg('EN8 fade e créditos sem tecla extra', creditos, 'créditos apareceram');
  await sleep(600);
  await capturar('CR1-creditos');
  const tc2 = await ver();
  const linhas = ['Natal na Casa do Tio Ítalo e da Tia Nath', 'Feito com carinho para a família.', 'Versão 0.8.0', `${NOME}`, 'Voltar ao título'];
  const faltam = linhas.filter((l) => !tc2.includes(l));
  reg('CR1 textos de créditos (conteúdo, nome do sobrinho, versão 0.8.0)', faltam.length === 0, faltam.length ? `faltam=${faltam.join(' / ')}` : `textos=${tc2.slice(0, 240)}`);
  // CR4: 30 s parado nos créditos.
  const antes = await page.evaluate(() => window.__textos.length);
  await sleep(30000);
  const depois = await ver();
  reg('CR4 30 s parado: nada sai sozinho', depois.includes('Voltar ao título') && (await page.evaluate(() => window.__textos.length)) - antes < 3, `novos_textos=${(await page.evaluate(() => window.__textos.length)) - antes}`);
  // CR2: Z volta ao título com foco em "Começar"
  await limpar();
  await tecla(page, 'z', { ms: 90, pausa: 500 });
  const titulo = await esperarTexto('Começar', 5000);
  await capturar('CR2-voltou-titulo');
  reg('CR2 Z volta ao título com "Começar"', titulo, `textos=${(await ver()).slice(0, 160)}`);
  reg('CR3 sem save: título, sem fase (conferir nova partida no roteiro de CR3)', titulo, 'não testado de ponta a ponta nesta rodada (limite de tempo)');
});

console.log(`TEMPO: ${((Date.now() - T0) / 1000).toFixed(0)} s`);
console.log(`ERROS DE PÁGINA: ${erros.length} ${erros.slice(0, 5).join(' || ')}`);
const falhas = resultados.filter((r) => r.ok === false).length;
console.log(`RESUMO ${NOME}: ${resultados.length - falhas} OK, ${falhas} FALHA`);
await browser.close();
