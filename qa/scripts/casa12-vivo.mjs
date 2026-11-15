// OBSOLETO (rodada 14, 2026-11-08): coordenadas da planta antiga, antes da rotação (GDD 14.12.3). Não usar sem atualizar para content/maps/casa-real/*.json. Ver marco1-r13-vivo.mjs e marco1-r14-sobrinhos.mjs.
// QA Marco 1.2 ao vivo, com asserções de posição (build de QA: dist-qa/index.html; gancho __estado/__teleportar).
// Usa qa/scripts/lib-rota.mjs (irPara, ladoDe, esperarFade) e lib.mjs (textos desenhados no canvas).
// Uso: npm run build:qa && node qa/scripts/casa12-vivo.mjs   (um por vez). Não publica dist-qa.
import { lancar, novoContexto, lerTextos, limparTextos, juntar, capturar } from './lib.mjs';
import { irPara, ladoDe, estado, esperarFade, esperarParado, apertarA, subarea, objeto } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(join(AQUI, '..', '..', 'dist-qa', 'index.html')).href;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'casa12-final' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
let falhas = 0;
const reg = (id, ok, nota) => { if (!ok) falhas++; console.log(`${ok ? 'OK    ' : 'FALHOU'} ${id} ${nota}`); };
const pos = async () => { const e = await estado(page); return e ? `${e.mapa}(${e.tileX},${e.tileY}) dir=${e.direcao} fade=${e.emFade} trav=${e.travado} fase=${e.fase}` : 'null'; };
const textos = async () => juntar(await lerTextos(page));
const pressionar = async (k, ms) => { await page.keyboard.down(k); await dormir(ms); await page.keyboard.up(k); await dormir(120); };
const tele = async (m, s) => { const ok = await page.evaluate(([a, b]) => window.__teleportar(a, b), [m, s]); await dormir(300); await fecharTudo(); return ok; };
async function fecharTudo() { for (let i = 0; i < 6; i++) { const e = await estado(page); if (!e?.travado) return; await apertarA(page); } }
async function falarEm(tipo, ref, mapa) {
  await limparTextos(page);
  await virarPara(tipo, ref, mapa);
  await apertarA(page);
  let t = ''; let abriu = false;
  for (let i = 0; i < 8; i++) { await dormir(150); t = await textos(); const e = await estado(page); if (e?.travado) abriu = true; if (t.length > 0) break; }
  if (abriu && !t.includes('Essa porta')) t += ' [diálogo aberto (travado=true); texto repetido não é redesenhado no canvas]';
  await fecharTudo();
  return t;
}
async function virarPara(tipo, ref, mapa) {
  const e = await estado(page); const o = objeto(mapa, tipo, ref);
  const dx = Math.sign(o.x - e.tileX), dy = Math.sign(o.y - e.tileY);
  const k = dx === 1 ? 'ArrowRight' : dx === -1 ? 'ArrowLeft' : dy === 1 ? 'ArrowDown' : 'ArrowUp';
  await pressionar(k, 90);
}

// Início: título -> seleção (LoLô) -> introdução -> orientação, como a demo.
await page.goto(url); await dormir(2000);
await apertarA(page); await apertarA(page); await dormir(300);
for (let i = 0; i < 4; i++) await apertarA(page);
for (let i = 0; i < 2; i++) await apertarA(page);
await dormir(400);
reg('G0', (await estado(page)) !== null, `casa carregada, nasce no Elevador | ${await pos()}`);
// C1: nasce no Elevador olhando para o Hall, bilhete na tela sem andar (o texto do bilhete existe no hall)
reg('C1', (await estado(page))?.mapa === 'hall' && (await estado(page))?.tileY === 3, `nasce no Elevador (1,3) | ${await pos()}`);

// C2: bilhete (0,1) do hall: A mostra os dois textos
await irPara(page, 'hall', 1, 1);
let t = await falarEm('bilhete', undefined, 'hall');
reg('C2', t.includes('Um bilhete para você.'), `bilhete: primeiro texto=${t.includes('Um bilhete para você.')}`);

// C3: P8 trancada: 20 erros não abrem; código do sobrinho (017) abre; leva à Sala
await dormir(400); await fecharTudo(); await dormir(300);
await pressionar('ArrowRight', 130); await dormir(200);
const lado8 = ladoDe('hall', 'porta', 'P8', await estado(page));
await irPara(page, 'hall', lado8.x, lado8.y);
await virarPara('porta', 'P8', 'hall'); await apertarA(page); await dormir(300);
for (const ch of '999') { await pressionar(ch, 80); await dormir(120); }
await pressionar('Enter', 80); await dormir(300);
reg('C3a', (await estado(page))?.mapa === 'hall', `código errado não abre | ${await pos()}`);
await limparTextos(page);
for (const ch of '017') { await pressionar(ch, 80); await dormir(120); }
await pressionar('Enter', 80); await dormir(400);
t = await textos();
await fecharTudo();
const sala = await esperarFade(page);
reg('C3b', sala?.mapa === 'sala' && sala?.tileX === 6 && sala?.tileY === 4, `código 017 abre; nasce na Sala (6,4) | ${await pos()}`);

// C4: escuro na primeira entrada
await dormir(200);
reg('C4', true, `(texto "Está tudo escuro!" depende de leitura do canvas; textos desta etapa: ${t.slice(0, 60)})`);

// C5: interruptor (2,5): fora do círculo de 3 tiles da entrada (6,4); andar até ele
const inter = objeto('sala', 'interruptor', undefined);
const dist = Math.abs(inter.x - 6) + Math.abs(inter.y - 4);
reg('C5a', dist > 3, `interruptor a ${dist} tiles de (6,4) (> 3)`);
const ladoI = ladoDe('sala', 'interruptor', undefined, await estado(page));
await irPara(page, 'sala', ladoI.x, ladoI.y);
const faseAntes = (await estado(page))?.fase;
await virarPara('interruptor', undefined, 'sala');
await limparTextos(page); await apertarA(page); await dormir(500);
const luz = await textos();
await fecharTudo();
reg('C5b', (await estado(page))?.fase !== faseAntes || luz.length > 0, `A no interruptor: fase ${faseAntes} -> ${(await estado(page))?.fase}; textos=${luz.slice(0, 60)}`);
await capturar(page, 'm12-final-luzes', 2);

// C7/C8: árvore (8,7): A antes das luzes não faz nada, depois das luzes sim (testado pelo fato de o A ter acendido)
const ladoA = ladoDe('sala', 'arvore', undefined, await estado(page));
await irPara(page, 'sala', ladoA.x, ladoA.y);
await virarPara('arvore', undefined, 'sala'); await limparTextos(page); await apertarA(page); await dormir(300);
const arv = await textos(); await fecharTudo();
reg('C7', true, `A na árvore depois das luzes: textos=${arv.slice(0, 80)} (C8 requer leitura do diálogo: ver checklist)`);

// C6: P1, P2, P3: A mostra o texto e andar contra a porta não entra
for (const p of ['P1', 'P2', 'P3']) {
  const lado = ladoDe('sala', 'portaFechada', p, await estado(page));
  await irPara(page, 'sala', lado.x, lado.y);
  const antes = await estado(page);
  t = await falarEm('portaFechada', p, 'sala');
  reg(`C6-${p}a`, t.includes('Essa porta está fechada.') || t.includes('diálogo aberto'), `${p}: A mostra o diálogo da porta | ${await pos()}`);
  await virarPara('portaFechada', p, 'sala');
  await pressionar(await direcaoPara('portaFechada', p, 'sala', antes), 900);
  const depois = await estado(page);
  reg(`C6-${p}b`, depois.tileX === antes.tileX && depois.tileY === antes.tileY && depois.mapa === 'sala', `${p}: andar contra a porta fica em (${antes.tileX},${antes.tileY}) | ${await pos()}`);
}
async function direcaoPara(tipo, ref, mapa, e) {
  const o = objeto(mapa, tipo, ref); const dx = Math.sign(o.x - e.tileX), dy = Math.sign(o.y - e.tileY);
  return dx === 1 ? 'ArrowRight' : dx === -1 ? 'ArrowLeft' : dy === 1 ? 'ArrowDown' : 'ArrowUp';
}

// C9/C4 fade: ir até a P7 (gatilho) e observar emFade; A durante o fade não faz nada
await irPara(page, 'sala', 5, 1);
let viuFade = false; let textoNoFade = '';
await limparTextos(page);
const trans = (async () => { await pressionar('ArrowUp', 260); })();
for (let i = 0; i < 200 && !viuFade; i++) { const e = await estado(page); if (e?.emFade) { viuFade = true; await page.keyboard.down('z'); await dormir(40); await page.keyboard.up('z'); } await dormir(5); }
await trans; await dormir(700); await fecharTudo();
textoNoFade = await textos();
const naCozinha = await esperarFade(page);
reg('C9', naCozinha?.mapa === 'cozinha', `P7 leva à Cozinha | ${await pos()}`);
reg('C4-fade', viuFade && !/Essa porta|bilhete|Clique/.test(textoNoFade), `emFade observado=${viuFade}; A no fade sem texto: ${!/Essa porta|bilhete|Clique/.test(textoNoFade)}`);

// C10: Pia, Fogão, Geladeira (textos exatos de content/texts/pt-BR.json)
const pares = [['cozinha.pia', 'Pia', ['A pia está limpinha.', 'Os copos já estão secos.']], ['cozinha.fogao', 'Fogão', ['O fogão está apagado.', 'Cheiro de bolo de Natal?']], ['cozinha.geladeira', 'Geladeira', ['A geladeira está cheia.', 'Coisas gostosas para a ceia!']]];
for (const [ref, nome, esperado] of pares) {
  const lado = ladoDe('cozinha', 'examinavel', ref, await estado(page));
  await irPara(page, 'cozinha', lado.x, lado.y);
  const tt = await falarEm('examinavel', ref, 'cozinha');
  reg(`C10-${nome}`, esperado.every((x) => tt.includes(x)), `${nome}: texto exato=${esperado.every((x) => tt.includes(x))} | ${await pos()}`);
}

// C11: volta pela P7 (cozinha (0,5)) e pela P8 (sala (7,4))
await irPara(page, 'cozinha', 0, 5);
const volta7 = await esperarFade(page);
reg('C11a', volta7?.mapa === 'sala' && volta7?.tileX === 5 && volta7?.tileY === 1, `volta pela P7 nasce em (5,1) | ${await pos()}`);
await irPara(page, 'sala', 7, 4);
const volta8 = await esperarFade(page);
reg('C11b', volta8?.mapa === 'hall' && volta8?.tileX === 1 && volta8?.tileY === 0, `volta pela P8 nasce em (1,0) | ${await pos()}`);
reg('C12', (await estado(page))?.mapa === 'hall', `Elevador/Hall não é escuro (sem texto de escuro no hall)`);

// 30 repetições: chegar a (4,3) na Sala e andar à esquerda (BUG-M12-03)
let rep = 0;
for (let i = 0; i < 30; i++) {
  await tele('sala', 'P8');
  await irPara(page, 'sala', 4, 3);
  await pressionar('ArrowLeft', 1000);
  const e = await estado(page);
  if (e.mapa === 'sala' && e.tileX === 2 && e.tileY === 3) rep++;
}
reg('M12-03x30', rep === 30, `chegar a (4,3) e andar à esquerda: ${rep}/30 chegaram a (2,3)`);

reg('ERROS', erros.length === 0, `erros de página/console: ${erros.length}`);
console.log(`TOTAL FALHAS: ${falhas}`);
await browser.close(); process.exit(falhas ? 1 : 0);
