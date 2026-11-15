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

// ===== A. LoLô: peças 1, 2 e 3 =====
await iniciarSobrinho(0, ['0', '1', '7']);
await capturar('r2-01-sala-antes-luzes');
const cL = await luzesECondução();
reg('chegada árvore', cL.pos.includes('(3,7)') && cL.pos.includes('dir=baixo'), `${cL.pos} | passos=${cL.passos}`);
await fecharTudo();

// peça 1
await irPara(page, 'sala', 2, 4);
await pressionar('ArrowLeft', 260);
await pegarPeca('r2-peca1', 'primeira parte da árvore de Natal', 'Agora a árvore tem 1 parte. Faltam 2 partes!', 'P1');

// pisca: 4 quadros 250 ms apart depois do encaixe 1 (árvore estado 1)
const quadros = [];
for (let i = 0; i < 4; i++) { quadros.push(await page.evaluate(() => document.querySelector('canvas').toDataURL('image/png').length)); await dormir(250); }
reg('pisca após peça 1 (P6-01)', null, `tamanhos dos quadros da tela: ${quadros.join(', ')} (0 = iguais; capturas em r2-peca1-arvore)`);

// exame estado 1
await limparTextos(page); await apertarA(page); await dormir(350);
reg('exame estado 1', (await textos()).includes('Ela já tem 1 parte. Faltam 2 partes.'), 'A na árvore');
await fecharTudo();

// peça 2: teleporte até a Cozinha, peça visível bloqueia
await teleportar('cozinha', 'P7');
await irPara(page, 'cozinha', 3, 1);
await pressionar('ArrowRight', 400);
const bl = await estado(page);
reg('peça 2 visível bloqueia (4,1)', bl?.tileX === 3 && bl?.tileY === 1, `ArrowRight contra peça 2 | ${await pos()}`);
await capturar('r2-peca2-bloqueia');
await pegarPeca('r2-peca2', 'segunda parte', 'Agora a árvore tem 2 partes. Falta 1 parte!', 'P2');
reg('P2 condução 2x (esperado 15 passos)', null, `ver linha "P2 condução" acima; esperado 15 passos e fade`);

// peça 3: Lavanderia (3,5) = Cozinha, teleporte
await teleportar('cozinha', 'P7');
await irPara(page, 'cozinha', 3, 4);
await pressionar('ArrowDown', 400);
const bl3 = await estado(page);
reg('peça 3 visível bloqueia (3,5)', bl3?.tileX === 3 && bl3?.tileY === 4, `ArrowDown contra peça 3 | ${await pos()}`);
await capturar('r2-peca3-bloqueia');
await pegarPeca('r2-peca3', 'última parte', 'A árvore está montada! Que linda!', 'P3');

// exame estado 3
await limparTextos(page); await apertarA(page); await dormir(350);
reg('exame estado 3', (await textos()).includes('A árvore está montada! Que linda!'), 'A na árvore');
await fecharTudo();
await capturar('r2-arvore-estado3');

// parede (4,4) com teclado real
await teleportar('cozinha', 'P7');
await irPara(page, 'cozinha', 4, 3);
const antes = await estado(page);
await page.keyboard.down('ArrowDown'); await dormir(900); await page.keyboard.up('ArrowDown'); await dormir(200);
const dep = await estado(page);
reg('parede (4,4) travamento', null, `centroY antes=${antes?.centroY?.toFixed?.(2)} depois=${dep?.centroY?.toFixed?.(2)} tile ${dep?.tileX},${dep?.tileY}`);

// ===== B. Nova partida (E11) e BiBi =====
await page.goto(url); await dormir(2000);
await capturar('r2-02-nova-partida-titulo');
reg('nova partida: título', null, 'ver captura r2-02-nova-partida-titulo (v0.6.0)');
await iniciarSobrinho(1, ['0', '2', '0']);
const cB = await luzesECondução();
reg('BiBi chegada', cB.pos.includes('(3,7)'), cB.pos);
await fecharTudo();
await irPara(page, 'sala', 2, 4);
await pressionar('ArrowLeft', 260);
await pegarPeca('r2-bibi-peca1', 'primeira parte da árvore de Natal', 'Agora a árvore tem 1 parte. Faltam 2 partes!', 'BiBi P1');

reg('erros', erros.length === 0, erros.length ? erros.slice(0, 4).join(' | ') : 'sem erros');
await browser.close();
