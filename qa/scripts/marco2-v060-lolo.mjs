// QA Marco 2 (v0.6.0), roteiro LoLô de ponta a ponta (GDD 15.10 E1 a E20, prioridades 1 a 8 de qa/checklist-marco2.md).
// Build: dist-qa/index.html (npm run build:qa). Capturas em qa/evidencias/marco2/.
// Uso: node qa/scripts/marco2-v060-lolo.mjs
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
const CODIGO_LOLO = ['0', '1', '7'];

const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'm2' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') erros.push(`console: ${m.text()}`); });

const resultados = [];
const reg = (id, ok, nota) => {
  resultados.push({ id, ok, nota });
  console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`);
};
const textos = async () => juntar(await lerTextos(page));
const pos = async () => {
  const e = await estado(page);
  return e ? `${e.mapa}(${e.tileX},${e.tileY}) dir=${e.direcao} trav=${e.travado} conducao=${e.emConducao} fade=${e.emFade} fase=${e.fase}` : 'null';
};
const pressionar = async (k, ms = 90) => { await page.keyboard.down(k); await dormir(ms); await page.keyboard.up(k); await dormir(160); };
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
/** Espera até o texto `frase` aparecer (até `ms`). Devolve o texto acumulado. */
async function esperarTexto(frase, ms = 3000) {
  let acum = '';
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { acum += ' ' + (await textos()); if (acum.includes(frase)) return acum; await dormir(60); }
  return acum;
}
/** Passa pelo gatilho de porta: fica ao lado, anda em direção ao gatilho e espera o fade. */
async function atravessarPorta(mapa, tipo, id, destinoEsperado, ladoFixo = null) {
  const g = objeto(mapa, tipo, id);
  const lado = ladoFixo ?? ladosDe(mapa, tipo, id).find((l) => l.y === g.y + 1) ?? ladosDe(mapa, tipo, id)[0];
  await irPara(page, mapa, lado.x, lado.y);
  const e = await estado(page);
  for (let t = 0; t < 2; t++) {
    const cur = await estado(page);
    if (cur?.mapa !== mapa) break;
    await pressionar(seta[`${Math.sign(g.x - cur.tileX)},${Math.sign(g.y - cur.tileY)}`], 260);
    await esperarFade(page).catch(() => null);
    await dormir(300);
  }
  const d = await estado(page);
  return d?.mapa === destinoEsperado;
}
/** Condução: mede duração, passos (mudanças de tile) e se o fade apareceu. */
async function medirConducao(rotulo) {
  let passos = 0; let ultimo = null; let viuFade = false; let t0 = null; let t1 = null;
  const limite = Date.now() + 40000;
  let dentro = false;
  while (Date.now() < limite) {
    const e = await estado(page);
    if (!e) { await dormir(30); continue; }
    if (e.emFade) viuFade = true;
    if (e.emConducao && !dentro) { dentro = true; t0 = Date.now(); ultimo = `${e.mapa}:${e.tileX},${e.tileY}`; }
    if (dentro && e.emConducao) {
      const k = `${e.mapa}:${e.tileX},${e.tileY}`;
      if (k !== ultimo) { passos++; ultimo = k; }
    }
    if (dentro && !e.emConducao && !e.emFade) { t1 = Date.now(); break; }
    await dormir(20);
  }
  const dur = t0 && t1 ? t1 - t0 : null;
  return { rotulo, passos, dur, viuFade, pos: await pos() };
}

// ===== 1. Título, Começar, LoLô, introdução, P8 (código 017) =====
await page.goto(url);
await dormir(2000);
const tituloTxt = await textos();
reg('P1-01 titulo-versao', null, `texto lido: "${tituloTxt.slice(0, 80)}"; versão conferir na captura 01-titulo`);
await capturar('01-titulo');
await apertarA(page); await dormir(300); // Começar
await apertarA(page); await dormir(300); // confirma LoLô (seleção com índice 0)
for (let i = 0; i < 6; i++) await apertarA(page);
await dormir(400);
await fecharTudo();
await limparTextos(page);
const p8 = objeto('hall', 'porta', 'P8');
const ladoP8 = ladosDe('hall', 'porta', 'P8').find((l) => l.y === p8.y + 1) ?? ladosDe('hall', 'porta', 'P8')[0];
await irPara(page, 'hall', ladoP8.x, ladoP8.y);
{ const e1 = await estado(page); await pressionar(seta[`${Math.sign(p8.x - e1.tileX)},${Math.sign(p8.y - e1.tileY)}`], 60); }
await apertarA(page); await dormir(300);
await capturar('02-senha');
for (const ch of CODIGO_LOLO) await pressionar(ch, 80);
await pressionar('Enter', 80);
await dormir(500);
await fecharTudo();
await esperarFade(page).catch(() => null);
await dormir(400);
reg('P1-02a senha-entra-sala', (await estado(page))?.mapa === 'sala', `código 017 → Sala | ${await pos()}`);

// ===== 2. Luzes e condução até a árvore (E4, E1 parcial) =====
await limparTextos(page);
const inter = objeto('sala', 'interruptor');
const lI = ladosDe('sala', 'interruptor').find((l) => l.y === inter.y + 1) ?? ladosDe('sala', 'interruptor')[0];
await irPara(page, 'sala', lI.x, lI.y);
{ const e = await estado(page); await pressionar(seta[`${Math.sign(inter.x - e.tileX)},${Math.sign(inter.y - e.tileY)}`], 60); }
await apertarA(page); await dormir(400);
let tl = await textos();
for (let i = 0; i < 4 && !tl.includes('Parabéns'); i++) { await apertarA(page); await dormir(200); tl += ' ' + (await textos()); }
reg('P1-02b luzes', tl.includes('Parabéns, você conseguiu acender as luzes.'), `"${tl.slice(0, 100)}"`);
await capturar('03-luzes-sala');
await limparTextos(page);
await apertarA(page); // Continuar: condução automática
const cond1 = await medirConducao('luzes->arvore');
reg('P1-03 conducao-luzes-arvore', cond1.pos.includes('(3,7)') && cond1.pos.includes('dir=baixo') && !cond1.viuFade, `passos=${cond1.passos} dur=${cond1.dur}ms | ${cond1.pos}`);
const fala0 = await esperarTexto('árvore', 2500);
reg('P1-04 dialogo-chegada-estado0', fala0.length > 0, `"${fala0.slice(0, 160)}"`);
await capturar('04-chegada-arvore-estado0');
await fecharTudo();

// ===== 3. Escritório pela P3 (ida e volta), fechadas (E14, E17, E19) =====
await limparTextos(page);
const ida = await atravessarPorta('sala', 'porta', 'P3', 'escritorio');
reg('P3-01 P3-ida-escritorio', ida, `P3 leva ao Escritório | ${await pos()}`);
await capturar('05-escritorio');
const volta = await atravessarPorta('escritorio', 'porta', 'P3', 'sala').catch(() => false);
reg('P3-02 P3-volta-sala-7-2', volta, `volta pela mesma porta | ${await pos()}`);
// P1 e P2 fechadas, a partir da Sala
await limparTextos(page);
await irPara(page, 'sala', 5, 2);
await pressionar('ArrowRight', 90); // encosta na P1 (6,2)
await apertarA(page); await dormir(300);
const tP1 = await textos();
reg('P3-04a P1-fechada', tP1.includes('Essa porta está fechada.'), `"${tP1.slice(0, 120)}" | ${await pos()}`);
await capturar('06-P1-fechada');
await fecharTudo();
await irPara(page, 'sala', 7, 2);
await pressionar('ArrowUp', 90); // encosta na P2 (7,1)
await apertarA(page); await dormir(500);
const tP2 = await textos();
await capturar('06b-P2-fechada');
reg('P3-04b P2-fechada (pedido do Orquestrador)', tP2.includes('Essa porta está fechada.'), `"${tP2.slice(0, 120)}" | ${await pos()}`);
await fecharTudo();
// Nota de conteúdo: sala.json tem P2 como portaFechada (não gatilho do Quarto, GDD 15.3.4 e item 059).
reg('E17-quarto-por-P2 (059 opção B)', false, 'sala.json: P2 = portaFechada (7,1), sem gatilho/vão do Quarto. Quarto não acessível nesta build (ver bugs.md).');

// ===== 4. Peça 2 e 3 escondidas: aviso ANTES da parte 1 (E15, E16) =====
// Vai à Cozinha pela P7 (10,5) da Sala.
await limparTextos(page);
await irPara(page, 'sala', 9, 5);
const ida7 = await atravessarPorta('sala', 'porta', 'P7', 'cozinha', { x: 9, y: 5 });
reg('P3-03 P7-sala-cozinha', ida7, `P7 leva à Cozinha | ${await pos()}`);
await capturar('07-cozinha-sem-pecas');

// peça 3 escondida (3,5): aviso variante "antes1" e "antes2" (sem parte 1 encaixada, a 1 não existe na Cozinha, o aviso da peça 3 é "antes da 1")
await limparTextos(page);
await irPara(page, 'cozinha', 3, 3);
await pressionar('ArrowDown', 90); // (3,4), olhando para baixo, peça (3,5) na frente
await apertarA(page); await dormir(350);
const av3p1 = await textos();
await apertarA(page); await dormir(350);
const av3p2 = await textos();
const av3a = av3p1 + ' || ' + av3p2;
reg('E16-aviso-peca3-antes1', av3p1.includes('Ainda não!') && av3p2.includes('Essa é a parte de cima. Encontre as outras antes.'), `p1="${av3p1.slice(0, 90)}" p2="${av3p2.slice(0, 120)}" | ${await pos()}`);
await capturar('08-aviso-peca3-antes1');
const av3Pos = await pos();
await apertarA(page); await dormir(300); // fecha/avança
await fecharTudo();
await limparTextos(page);
await apertarA(page); await dormir(300); // repete A (teste "uma vez ou sempre")
const av3b = await textos();
reg('E16-aviso-peca3-repetido', null, `A de novo depois de fechar: "${av3b.slice(0, 120)}" (registrar: aparece sempre?)`);
await fecharTudo();

// peça 2 escondida (4,1): aviso E15 (a 1 não encaixada)
await limparTextos(page);
await irPara(page, 'cozinha', 4, 3);
await pressionar('ArrowUp', 90); // (4,2) de frente para (4,1)
await apertarA(page); await dormir(350);
const av2p1 = await textos();
await apertarA(page); await dormir(350);
const av2p2 = await textos();
reg('E15-aviso-peca2', av2p1.includes('Ainda não!') && av2p2.includes('Essa é a parte do meio. Encontre a base antes.'), `p1="${av2p1.slice(0, 90)}" p2="${av2p2.slice(0, 120)}" | ${await pos()}`);
await capturar('09-aviso-peca2-antes1');
await fecharTudo();
// teste de "escondida não bloqueia": anda sobre (4,1)
await limparTextos(page);
await pressionar('ArrowUp', 400);
const sobre = await estado(page);
reg('P5-02 escondida-nao-bloqueia', sobre?.tileX === 4 && sobre?.tileY === 1, `ArrowUp 400 ms de (4,2) sobre peça escondida | ${await pos()}`);
await capturar('09b-escondida-tentativa');
if (sobre?.tileY === 2) { await pressionar('ArrowUp', 400); const s2 = await estado(page); reg('P5-02b repetido', s2?.tileY === 1, `segunda tentativa | ${await pos()}`); }
await fecharTudo();
await dormir(300);
await dormir(200);

// ===== 5. Voltar à Sala pela P7 e pegar a peça 1 (E1, E2, E3) =====
await limparTextos(page);
await irPara(page, 'cozinha', 1, 0);
const volta7 = await atravessarPorta('cozinha', 'porta', 'P7', 'sala', { x: 1, y: 0 });
reg('P3-03b P7-cozinha-sala', volta7, `volta à Sala | ${await pos()}`);
await limparTextos(page);
await irPara(page, 'sala', 2, 4);
await pressionar('ArrowLeft', 90); // frente da peça 1 (1,4)
await capturar('10-peca1-frente-antes-A');
await apertarA(page); await dormir(400);
const conq1 = await textos();
reg('E2-pegar-peca1', conq1.includes('primeira parte da árvore de Natal'), `conquista 1 | "${conq1.slice(0, 160)}"`);
await capturar('11-conquista-1');
await apertarA(page); await dormir(300); // Continuar (Z/A)
await fecharTudo();
await dormir(200);
// condução à árvore (E4, E5)
const cond2 = await medirConducao('peca1->arvore');
reg('E4-conducao-peca1', cond2.pos.includes('(3,7)') && cond2.pos.includes('dir=baixo'), `passos=${cond2.passos} dur=${cond2.dur}ms fade=${cond2.viuFade} | ${cond2.pos}`);
const fala1 = await esperarTexto('Agora a árvore tem 1 parte', 2500);
reg('E5-dialogo-encaixe1', fala1.includes('Agora a árvore tem 1 parte. Faltam 2 partes!'), `"${fala1.slice(0, 160)}"`);
await capturar('12-arvore-estado1');
await fecharTudo();
// pisca: duas capturas com 300 ms de diferença (P6-01)
await capturar('13-arvore-pisca-a');
await dormir(300);
await capturar('14-arvore-pisca-b');
// E6: A na árvore, estado 1
await limparTextos(page);
await apertarA(page); await dormir(350);
const e6 = await textos();
reg('E6-exame-estado1', e6.includes('Ela já tem 1 parte. Faltam 2 partes.'), `"${e6.slice(0, 140)}"`);
await fecharTudo();
await apertarA(page); await dormir(300);
const e6b = await textos();
reg('E6-exame-repetivel-sem-chegada', !e6b.includes('Agora a árvore tem 1 parte'), `A de novo: "${e6b.slice(0, 120)}"`);
await fecharTudo();

// ===== 6. Peça 2 visível (encaixada a 1), 2 vezes, fade, conquista 2 (E7, E8) =====
await limparTextos(page);
await irPara(page, 'sala', 9, 5);
await atravessarPorta('sala', 'porta', 'P7', 'cozinha', { x: 9, y: 5 });
await limparTextos(page);
await irPara(page, 'cozinha', 2, 3);
await pressionar('ArrowRight', 260); // (3,3)
await pressionar('ArrowRight', 260); // (4,3)
await pressionar('ArrowUp', 260); // (4,2), de frente para a peça 2 visível
await pressionar('ArrowUp', 400); // deve ficar em (4,2): bloqueada
const bloq = await estado(page);
reg('P5-01 peca-visivel-bloqueia', bloq?.tileX === 4 && bloq?.tileY === 2, `(4,2) depois de ArrowUp contra peça 2 visível | ${await pos()}`);
await capturar('15-peca2-visivel-cozinha');
await apertarA(page); await dormir(400);
const conq2 = await textos();
reg('E7-conquista2', conq2.includes('segunda parte'), `conquista 2 | "${conq2.slice(0, 160)}"`);
await capturar('16-conquista-2');
await apertarA(page); await dormir(300);
await fecharTudo();
await dormir(200);
const cond3 = await medirConducao('peca2->arvore 2x');
reg('E7-conducao-2x-fade', cond3.viuFade && cond3.passos > 0, `passos=${cond3.passos} (esperado 12-13; medido pela Dev 15), dur=${cond3.dur}ms, fade=${cond3.viuFade} | ${cond3.pos}`);
const fala2 = await esperarTexto('Agora a árvore tem 2 partes', 2500);
reg('E5-dialogo-encaixe2', fala2.length > 0, `"${fala2.slice(0, 160)}"`);
await capturar('17-arvore-estado2');
await fecharTudo();

// ===== 7. Peça 3 (Cozinha (3,5)), conquista 3, condução 2x com fade (E8, E20) =====
await limparTextos(page);
await irPara(page, 'sala', 9, 5);
await atravessarPorta('sala', 'porta', 'P7', 'cozinha', { x: 9, y: 5 });
await limparTextos(page);
await irPara(page, 'cozinha', 3, 3);
await pressionar('ArrowDown', 90);
await apertarA(page); await dormir(400);
const conq3 = await textos();
reg('E8-conquista3', conq3.includes('última parte'), `conquista 3 | "${conq3.slice(0, 160)}"`);
await capturar('18-conquista-3');
await apertarA(page); await dormir(300);
await fecharTudo();
await dormir(200);
const cond4 = await medirConducao('peca3->arvore 2x');
reg('E20-conducao-2x-fade', cond4.viuFade && cond4.passos > 0, `passos=${cond4.passos} (esperado 17-18), dur=${cond4.dur}ms, fade=${cond4.viuFade} | ${cond4.pos}`);
const fala3 = await esperarTexto('árvore está montada', 2500);
reg('E8-arvore-montada', fala3.includes('A árvore está montada! Que linda!'), `"${fala3.slice(0, 160)}"`);
await capturar('19-arvore-montada-estado3');
await fecharTudo();
await limparTextos(page);
await apertarA(page); await dormir(300);
const e9 = await textos();
reg('E9-exame-estado3', e9.length > 0, `A na árvore estado 3: "${e9.slice(0, 120)}"`);
await fecharTudo();

// ===== 8. Pedido: parede contra (4,4) da Cozinha (P7-01, travamento de 2 px) =====
await limparTextos(page);
await irPara(page, 'cozinha', 4, 3);
const antes = await estado(page);
await page.keyboard.down('ArrowDown'); await dormir(900); await page.keyboard.up('ArrowDown'); await dormir(200);
const dep = await estado(page);
reg('P7-01 parede-4-4', dep?.centroY === antes?.centroY, `centroY antes=${antes?.centroY?.toFixed?.(2)} depois=${dep?.centroY?.toFixed?.(2)} | tile ${dep?.tileX},${dep?.tileY}`);

reg('erros-console', erros.length === 0, erros.length ? erros.slice(0, 5).join(' | ') : 'sem erros de página/console');
console.log('---- fim ----', await pos());
await browser.close();
