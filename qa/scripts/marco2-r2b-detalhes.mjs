// QA Marco 2 (v0.6.0), rodada 2: peças 2 e 3, 2x com fade, árvore, nova partida, BiBi.
// Usa window.__teleportar nas passagens longas (não é o caminho do jogador). Build: dist-qa/index.html.
// Uso: node qa/scripts/marco2-r2-completo.mjs
import { lancar, novoContexto, lerTextos, limparTextos, juntar, sleep } from './lib.mjs';
import { irPara, ladosDe, objeto, estado, esperarFade, apertarA } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco2');
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const dormir = sleep;
const seta = { '1,0': 'ArrowRight', '-1,0': 'ArrowLeft', '0,1': 'ArrowDown', '0,-1': 'ArrowUp' };

const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'm2r2' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') erros.push(`console: ${m.text()}`); });

const reg = (id, ok, nota) => console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`);
const textos = async () => juntar(await lerTextos(page));
const pos = async () => { const e = await estado(page); return e ? `${e.mapa}(${e.tileX},${e.tileY}) dir=${e.direcao} trav=${e.travado} conducao=${e.emConducao} fade=${e.emFade} fase=${e.fase}` : 'null'; };
const pressionar = async (k, ms = 260) => { await page.keyboard.down(k); await dormir(ms); await page.keyboard.up(k); await dormir(200); };
const teleportar = async (m, s) => { await page.evaluate(([a, b]) => window.__teleportar(a, b), [m, s]); await dormir(400); };
async function capturar(nome, fator = 3) {
  const dataUrl = await page.evaluate((f) => {
    const c = document.querySelector('canvas');
    const o = document.createElement('canvas');
    o.width = c.width * f; o.height = c.height * f;
    const x = o.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height);
    return o.toDataURL('image/png');
  }, fator);
  writeFileSync(join(EVID, `${nome}.png`), Buffer.from(dataUrl.split(',')[1], 'base64'));
}
async function fecharTudo() {
  for (let i = 0; i < 8; i++) { const e = await estado(page); if (!e?.travado) break; await apertarA(page); await dormir(250); }
  await dormir(450);
}
async function esperarTexto(frase, ms = 3000) {
  let acum = ''; const t0 = Date.now();
  while (Date.now() - t0 < ms) { acum += ' ' + (await textos()); if (acum.includes(frase)) return acum; await dormir(60); }
  return acum;
}
/** Mede a condução: passos (mudança de tile), duração, fade. Começa quando emConducao vira verdadeiro. */
async function medirConducao(rotulo, esperarInicio = 2500) {
  let passos = 0; let ultimo = null; let fade = false; let t0 = null; let t1 = null; let inicioVisto = false;
  const limite = Date.now() + esperarInicio + 30000;
  while (Date.now() < limite) {
    const e = await estado(page);
    if (!e) { await dormir(15); continue; }
    if (e.emFade) fade = true;
    if (e.emConducao && t0 === null) { t0 = Date.now(); ultimo = `${e.mapa}:${e.tileX},${e.tileY}`; inicioVisto = true; }
    if (t0 !== null && e.emConducao) { const k = `${e.mapa}:${e.tileX},${e.tileY}`; if (k !== ultimo) { passos++; ultimo = k; } }
    if (inicioVisto && !e.emConducao && !e.emFade) { t1 = Date.now(); break; }
    if (!inicioVisto && Date.now() > Date.now() - 0 + 0 && (Date.now() - (limite - esperarInicio - 30000)) > esperarInicio) break;
    await dormir(15);
  }
  return { rotulo, passos, dur: t0 && t1 ? t1 - t0 : null, fade, inicioVisto, pos: await pos() };
}

/** Título → Começar → sobrinho (índice) → intro → P8 com código → Sala com luzes apagadas. */
async function iniciarSobrinho(direitas, codigo) {
  await page.goto(url); await dormir(2000);
  await apertarA(page); await dormir(300);
  for (let i = 0; i < direitas; i++) await pressionar('ArrowRight', 120);
  await apertarA(page); await dormir(300);
  for (let i = 0; i < 6; i++) await apertarA(page);
  await dormir(400); await fecharTudo();
  const p8 = objeto('hall', 'porta', 'P8');
  const lado = ladosDe('hall', 'porta', 'P8').find((l) => l.y === p8.y + 1) ?? ladosDe('hall', 'porta', 'P8')[0];
  await irPara(page, 'hall', lado.x, lado.y);
  { const e = await estado(page); await pressionar(seta[`${Math.sign(p8.x - e.tileX)},${Math.sign(p8.y - e.tileY)}`], 90); }
  await apertarA(page); await dormir(300);
  for (const ch of codigo) await pressionar(ch, 80);
  await pressionar('Enter', 80); await dormir(500); await fecharTudo();
  await esperarFade(page).catch(() => null); await dormir(400);
}
/** Luzes e Continuar: a condução leva à árvore (3,7). */
async function luzesECondução() {
  const inter = objeto('sala', 'interruptor');
  const lI = ladosDe('sala', 'interruptor').find((l) => l.y === inter.y + 1) ?? ladosDe('sala', 'interruptor')[0];
  await irPara(page, 'sala', lI.x, lI.y);
  { const e = await estado(page); await pressionar(seta[`${Math.sign(inter.x - e.tileX)},${Math.sign(inter.y - e.tileY)}`], 90); }
  await apertarA(page); await dormir(400);
  let tl = await textos();
  for (let i = 0; i < 4 && !tl.includes('Parabéns'); i++) { await apertarA(page); await dormir(200); tl += ' ' + (await textos()); }
  reg('luzes', tl.includes('Parabéns, você conseguiu acender as luzes.'), `"${tl.slice(0, 60)}"`);
  await limparTextos(page);
  await apertarA(page); // Continuar
  const c = await medirConducao('luzes->arvore');
  await fecharTudo();
  return c;
}
/** Pega a peça com A na frente (já posicionado) e mede a conquista e a condução. */
async function pegarPeca(id, tituloEsperado, textoEncaixe, rotulo) {
  await limparTextos(page);
  await apertarA(page); await dormir(400);
  const conq = await textos();
  reg(`${rotulo} conquista`, conq.includes(tituloEsperado), `"${conq.slice(0, 130)}"`);
  await capturar(`${id}-conquista`);
  await limparTextos(page);
  await apertarA(page); // Continuar: condução
  const c = await medirConducao(`${rotulo} condução`);
  reg(`${rotulo} condução`, c.inicioVisto, `passos=${c.passos} dur=${c.dur}ms fade=${c.fade} | ${c.pos}`);
  const fala = await esperarTexto(textoEncaixe, 2500);
  reg(`${rotulo} diálogo encaixe`, fala.includes(textoEncaixe), `"${fala.slice(0, 120)}"`);
  await capturar(`${id}-arvore`);
  await fecharTudo();
  return c;
}

// ===== C. LoLô: avisos repetidos, botões na condução, exame estado 3, parede comparada =====
await iniciarSobrinho(0, ['0', '1', '7']);
await luzesECondução();
await fecharTudo();
await teleportar('cozinha', 'P7');
// aviso peça 3 (antes da 1): A duas vezes
await irPara(page, 'cozinha', 3, 3);
await pressionar('ArrowDown', 260);
for (let k = 1; k <= 3; k++) {
  await limparTextos(page); await apertarA(page); await dormir(350);
  const a = await textos(); await apertarA(page); await dormir(350); const b = await textos();
  reg(`aviso peça 3 tentativa ${k}`, null, `p1="${a.slice(0, 50)}" p2="${b.slice(0, 80)}"`);
  await fecharTudo();
}
// aviso peça 2 (antes da 1): A três vezes com o fechamento entre elas
await irPara(page, 'cozinha', 4, 3);
await pressionar('ArrowUp', 260);
for (let k = 1; k <= 3; k++) {
  await limparTextos(page); await apertarA(page); await dormir(350);
  const a = await textos();
  reg(`aviso peça 2 tentativa ${k}`, null, `"${a.slice(0, 80)}"`);
  await fecharTudo();
}
// parede: a 'borda' de cima da Cozinha como comparação (topo, tile (1,0))
await irPara(page, 'cozinha', 1, 1);
const topo0 = await estado(page);
await page.keyboard.down('ArrowUp'); await dormir(900); await page.keyboard.up('ArrowUp'); await dormir(200);
const topo1 = await estado(page);
reg('parede de cima (comparação)', null, `centroY antes=${topo0?.centroY?.toFixed?.(2)} depois=${topo1?.centroY?.toFixed?.(2)} tile ${topo1?.tileX},${topo1?.tileY}`);
// (4,4): de (4,3) para baixo (já visto: 121.00). Repetir com tempo maior e uma passada curta
await irPara(page, 'cozinha', 4, 3);
const p0 = await estado(page);
await page.keyboard.down('ArrowDown'); await dormir(300); await page.keyboard.up('ArrowDown'); await dormir(200);
const p1 = await estado(page);
reg('parede (4,4) passada curta', null, `centroY ${p0?.centroY?.toFixed?.(2)} -> ${p1?.centroY?.toFixed?.(2)} tile ${p1?.tileX},${p1?.tileY}`);
await capturar('r2b-parede-44');

// botões na condução: teleporte até a Cozinha, peça 1 não encaixada? usa Sala: peça 1 já pega? (nova partida: sim, pegar)
await teleportar('sala', 'P7');
await limparTextos(page);
await irPara(page, 'sala', 2, 4);
await pressionar('ArrowLeft', 260);
await apertarA(page); await dormir(400); await limparTextos(page);
await apertarA(page); // Continuar
await dormir(150);
const durante = [];
for (const k of ['Escape', 'ArrowUp', 'ArrowRight', 'z', 'x', 'Enter']) { await page.keyboard.press(k); await dormir(60); durante.push(await textos()); }
const tDur = await page.evaluate(() => window.__textos.length);
await capturar('r2b-conducao-barra');
const cc = await medirConducao('condução com teclas', 2000);
reg('botões na condução: sem efeito', cc.pos.includes('(3,7)') && durante.every((t) => t.trim() === ''), `textos durante: ${JSON.stringify(durante.map(t=>t.slice(0,30)))}; ${cc.pos}`);
await fecharTudo();
// exame estado 3 (aqui o estado é 1: só a árvore com 1 peça); o exame do 3 vem depois do LoLô completo
await limparTextos(page); await apertarA(page); await dormir(350);
reg('exame da árvore (estado 1 aqui)', (await textos()).includes('Ela já tem 1 parte'), 'A na árvore');
await fecharTudo();

// ===== D. DanDan e TuTu: fluxo até a conquista 1 e encaixe 1 =====
for (const [nome, dir, cod] of [['DanDan', 2, ['0', '2', '3']], ['TuTu', 3, ['0', '2', '4']]]) {
  await iniciarSobrinho(dir, cod);
  await luzesECondução();
  await fecharTudo();
  await irPara(page, 'sala', 2, 4);
  await pressionar('ArrowLeft', 260);
  await pegarPeca(`r2-${nome}-peca1`, 'primeira parte da árvore de Natal', 'Agora a árvore tem 1 parte. Faltam 2 partes!', `${nome} P1`);
}
reg('erros', erros.length === 0, erros.length ? erros.slice(0, 4).join(' | ') : 'sem erros');
await browser.close();
