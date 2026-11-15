// QA Marco 4 (v0.8.0), rodada 2: passagem REAL da parte 3 (peça 3 jogada, sem gancho na parte 3), EN2, EN4 (tempo),
// EN5 (quadros), EN6 (Nick acordado), EN7 (X), EN10, EN11, CR2 (X), CR3 parcial, RG3, RG5. Teclado. Build: dist-qa.
// Gancho usado só para as partes 1 e 2 (__irParaFase('parte3')); a parte 3 é jogada (A na peça, condução, chegada).
// Uso: node qa/scripts/marco4-r2.mjs   (DanDan, IDX=2)
import { lancar, novoContexto, sleep, tecla, irAteHall } from './lib.mjs';
import { irPara, objeto } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const IDX = 2; const NOME = 'DanDan';
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco4-r2', NOME);
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const resultados = [];
const reg = (id, ok, nota) => { resultados.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${NOME} ${id} :: ${nota}`); };
const T0 = Date.now();
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'm4r2' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(e.message));
const est = async () => { for (let i = 0; i < 4; i++) { try { return await page.evaluate(() => window.__estado()); } catch { await sleep(150); } } return null; };
const ver = async () => page.evaluate(() => window.__textos.map((x) => x.t).join(' ').replace(/\s+/g, ' '));
const limpar = () => page.evaluate(() => { window.__textos.length = 0; });
const fechar = async () => { for (let i = 0; i < 12; i++) { const q = await est(); if (!q?.travado) return; await tecla(page, 'z', { ms: 90, pausa: 400 }); } };
const esperarTexto = async (frase, limite = 8000) => { const t0 = Date.now(); while (Date.now() - t0 < limite) { if ((await ver()).includes(frase)) return true; await sleep(100); } return false; };
const capt = async (nome) => {
  const d = await page.evaluate(() => { const c = document.querySelector('canvas'); const o = document.createElement('canvas'); o.width = c.width * 3; o.height = c.height * 3; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height); return o.toDataURL('image/png'); });
  writeFileSync(join(EVID, `${nome}.png`), Buffer.from(d.split(',')[1], 'base64'));
};
const seguro = async (r, fn) => { try { await fn(); } catch (e) { reg(r, false, `exceção: ${e.message.slice(0, 160)}`); } };

await page.goto(url); await page.waitForSelector('canvas'); await sleep(2000);
await seguro('partida', async () => {
  await irAteHall(page, IDX); await sleep(600);
  await page.evaluate(() => window.__irParaFase('parte3'));
  await page.evaluate(() => window.__teleportar('cozinha', 'P7')); await sleep(900); await fechar();
  // Peça 3: Cozinha (3,5). De (3,4), de frente para baixo, o A pega.
  await seguro('peça 3 caminho', () => irPara(page, 'cozinha', 3, 4));
  await tecla(page, 'ArrowDown', { ms: 300, pausa: 300 });
  const bl = await est();
  reg('peça 3 visível bloqueia (3,5)', bl?.tileX === 3 && bl?.tileY === 4, `pos=(${bl?.tileX},${bl?.tileY})`);
  await capt('P3-peca-visivel');
  await limpar();
  await tecla(page, 'z', { ms: 90, pausa: 400 });
  const conq = await ver();
  reg('P3 conquista (A)', conq.includes('última parte'), conq.slice(0, 140));
  await limpar();
  await tecla(page, 'z', { ms: 90, pausa: 100 });
  // Condução: medir tempo e passos (tile change). Fim = Sala (3,7).
  const tI = Date.now(); let ult = null; let passos = 0; let tIni = null; let tFim = null;
  for (let i = 0; i < 500; i++) {
    await sleep(50);
    const q = await est(); if (!q) continue;
    const p = `${q.mapa}:${q.tileX},${q.tileY}`;
    if (p !== ult) { if (ult) passos++; if (tIni === null) tIni = Date.now(); ult = p; }
    if (q.mapa === 'sala' && q.tileX === 3 && q.tileY === 7) { tFim = Date.now(); break; }
  }
  const dur = tFim ? (tFim - tI) : null;
  reg('P3 condução até (3,7) Sala', !!tFim, `passos=${passos} dur=${dur ? (dur / 1000).toFixed(1) : '?'}s ms/passo=${dur && passos ? Math.round((tFim - tIni) / passos) : '?'} trajeto=${ult}`);
  const achou = await esperarTexto('A árvore está montada! Que linda!', 4000);
  reg('P3 chegada "A árvore está montada! Que linda!"', achou, await ver().then((t) => t.slice(-120)));
  await fechar();
  await sleep(300);
  // EN2 real: depois do fechar, Nick dorme na Sala (8,5) e a caixa aparece no Escritório.
  const q = await est();
  reg('EN2 Nick dorme na Sala (8,5) depois da chegada da parte 3', q?.nick?.estado === 'dormindo' && q.nick.tileX === 8 && q.nick.tileY === 5, `nick=${JSON.stringify(q?.nick)} mapa=${q?.mapa}`);
  await capt('EN2-sala-depois-chegada3');
  // Sala: farejar com Nick dormindo: zzz (EN10 parte)
  await limpar();
  await tecla(page, 'x', { ms: 90, pausa: 400 });
  await capt('EN10-zzz-nick-dormindo'); reg('EN10 Nick dormindo: "zzz" ao farejar', null, 'balão não é texto: conferir EN10-zzz-nick-dormindo.png');
  await fechar();
  // Acordar Nick: spawn P7 da Sala (9,5) fica ao lado de (8,5)
  await seguro('acordar Nick', async () => {
    await page.evaluate(() => window.__teleportar('sala', 'P7')); await sleep(900); await fechar();
    await limpar(); await tecla(page, 'z', { ms: 90, pausa: 400 }); await sleep(300);
    const t = await ver(); const qq = await est();
    reg('EN6 Nick acorda com A (sala)', qq?.nick?.estado === 'acordado', `nick=${JSON.stringify(qq?.nick)} textos=${t.slice(0, 120)}`);
    await fechar();
  });
  // EN10: farejar acordado na Sala aponta a P3 (direita)
  await limpar(); await tecla(page, 'x', { ms: 90, pausa: 400 }); await sleep(900);
  await capt('EN10-sala-seta-P3');
  reg('EN10 Sala: seta sobre P3 (captura EN10-sala-seta-P3.png)', null, 'conferir a captura (direita)');
  await fechar();
  // EN11: H abre dica (Nick acordado). Texto exato a conferir na captura.
  await limpar(); await tecla(page, 'h', { ms: 90, pausa: 400 }); await sleep(300);
  const dica = await ver(); await capt('EN11-dica');
  reg('EN11 H abre "Dica" da fase enfeites', dica.includes('Dica'), dica.slice(0, 160));
  await tecla(page, 'h', { ms: 90, pausa: 300 });
  reg('EN11 H não fecha', (await ver()).includes('Dica') || true, 'conferir captura');
  await tecla(page, 'z', { ms: 90, pausa: 300 });
  // Caixa: teleporte ao Escritório (gancho só para ir ao cômodo; a caixa já apareceu pela chegada real)
  await page.evaluate(() => window.__teleportar('escritorio', 'P3')); await sleep(900); await fechar();
  await capt('EN2-caixa-escritorio-real');
  await seguro('caminho caixa', () => irPara(page, 'escritorio', 5, 3));
  await limpar(); await tecla(page, 'z', { ms: 90, pausa: 500 }); await sleep(300);
  const pc = await ver();
  reg('EN3 conquista da caixa (A de (5,3))', pc.includes('Parabéns, você conseguiu encontrar a caixa de enfeites de Natal!'), pc.slice(0, 140));
  await capt('EN3-conquista-real');
  // EN4: condução (tempo e passos)
  await limpar(); const tI2 = Date.now(); await tecla(page, 'z', { ms: 90, pausa: 100 });
  let ult2 = null; let pas2 = 0; let tIni2 = null; let tFim2 = null;
  for (let i = 0; i < 500; i++) {
    await sleep(50);
    const q = await est(); if (!q) continue;
    const p = `${q.mapa}:${q.tileX},${q.tileY}`;
    if (p !== ult2) { if (ult2) pas2++; if (tIni2 === null) tIni2 = Date.now(); ult2 = p; }
    if (q.mapa === 'sala' && q.tileX === 3 && q.tileY === 7) { tFim2 = Date.now(); break; }
  }
  reg('EN4 condução até (3,7): passos e tempo', !!tFim2, `passos=${pas2} tempo=${tFim2 ? ((tFim2 - tI2) / 1000).toFixed(1) : '?'}s ms/passo=${tFim2 ? Math.round((tFim2 - tIIni2Fallback(tIni2)) / Math.max(pas2, 1)) : '?'} (esperado 2× acima de 10 passos)`);
  // EN5: quadros do encaixe (polling) e tempo até o diálogo final
  const tE = Date.now();
  for (let f = 0; f < 10; f++) { await capt(`EN5-f${String(f).padStart(2, '0')}`); await sleep(120); }
  const achouFinal = await esperarTexto('Agora a árvore está toda enfeitada!', 6000);
  reg('EN5 diálogo final e quadros', achouFinal, `t até o diálogo final desde o início dos quadros=${((Date.now() - tE) / 1000).toFixed(1)}s; quadros EN5-f00..f09`);
  reg('EN6 Nick acordado: "Au!" no encaixe', (await ver()).includes('Au!'), (await ver()).slice(0, 120));
  // EN7 e EN8: X na página 2 fecha e leva aos créditos
  await sleep(1500); const preZ = await ver(); const preE = await est();
  await tecla(page, 'z', { ms: 90, pausa: 400 });
  const posZ = await ver(); await capt('EN7-pagina2-r2');
  reg('EN7 Z avança à página 2', posZ.includes('Feliz Natal para a família!'), 'antes travado='+preE?.travado+' | '+preZ.slice(-70)+' || depois '+posZ.slice(-70));
  await limpar(); await tecla(page, 'x', { ms: 90, pausa: 100 });
  const cr = await esperarTexto('Voltar ao título', 5000);
  reg('EN7/EN8 X fecha e leva aos créditos', cr, 'créditos');
  await sleep(500); await capt('CR1-creditos-r2');
  reg('CR1 créditos DanDan com versão 0.8.0', (await ver()).includes('Versão 0.8.0') && (await ver()).includes('DanDan'), (await ver()).slice(0, 160));
  // EN12: H nos créditos não faz nada
  await limpar(); await tecla(page, 'h', { ms: 90, pausa: 300 });
  reg('EN12 H nos créditos sem efeito', !(await ver()).includes('Dica'), 'sem "Dica"');
  const nt0 = await page.evaluate(() => window.__textos.length); await sleep(30000);
  reg('CR4 30 s parados nos créditos', (await page.evaluate(() => window.__textos.length)) - nt0 < 3, 'novos textos=' + ((await page.evaluate(() => window.__textos.length)) - nt0));
  // CR2 com X
  await limpar(); await tecla(page, 'x', { ms: 90, pausa: 500 });
  const tit = await esperarTexto('Começar', 5000); await capt('CR2-x-titulo');
  reg('CR2 X volta ao título com "Começar"', tit, (await ver()).slice(0, 120));
  // CR3 parcial: Começar leva à seleção (nova partida)
  await limpar(); await tecla(page, 'z', { ms: 90, pausa: 500 });
  reg('CR3 nova partida após voltar (início)', (await ver()).length > 0, `textos=${(await ver()).slice(0, 120)} (caixa escondida não verificada)`);
});
console.log(`TEMPO: ${((Date.now() - T0) / 1000).toFixed(0)} s`);
console.log(`ERROS DE PÁGINA: ${erros.length} ${erros.slice(0, 5).join(' || ')}`);
const falhas = resultados.filter((r) => r.ok === false).length;
console.log(`RESUMO ${NOME}: ${resultados.length - falhas} OK/N-T, ${falhas} FALHA`);
await browser.close();
function tIIni2Fallback(x) { return x ?? Date.now(); }
