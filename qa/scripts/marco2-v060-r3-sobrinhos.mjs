// QA Marco 2 (v0.6.0), rodada 3: BiBi, DanDan e TuTu até a conquista 1 e o encaixe 1 (checklist P2-01 a P2-03).
// Uso: node qa/scripts/marco2-v060-r3-sobrinhos.mjs
import { lancar, novoContexto, lerTextos, juntar, sleep } from './lib.mjs';
import { irPara, ladosDe, objeto, estado, esperarFade, apertarA } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco2-r3');
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const dormir = sleep;
const seta = { '1,0': 'ArrowRight', '-1,0': 'ArrowLeft', '0,1': 'ArrowDown', '0,-1': 'ArrowUp' };
const ELENCO = [
  { i: 1, nome: 'BiBi', codigo: ['0', '2', '0'] },
  { i: 2, nome: 'DanDan', codigo: ['0', '2', '3'] },
  { i: 3, nome: 'TuTu', codigo: ['0', '2', '4'] },
];

const browser = await lancar();
const reg = (id, ok, nota) => console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`);
const textos = async (page) => juntar(await lerTextos(page));
const pressionar = async (page, k, ms = 260) => { await page.keyboard.down(k); await dormir(ms); await page.keyboard.up(k); await dormir(220); };
async function esperarTexto(page, frase, ms = 3000) {
  let acum = ''; const t0 = Date.now();
  while (Date.now() - t0 < ms) { acum += ' ' + (await textos(page)); if (acum.includes(frase)) return acum; await dormir(60); }
  return acum;
}
async function fecharTudo(page) {
  for (let i = 0; i < 8; i++) { const e = await estado(page); if (!e?.travado) break; await apertarA(page); await dormir(250); }
  await dormir(450);
}

for (const s of ELENCO) {
  const ctx = await novoContexto(browser, { url, origem: url, rotulo: `m2r3-${s.nome}` });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  await page.goto(url);
  await dormir(2000);
  await apertarA(page); await dormir(300); // Começar
  for (let k = 0; k < s.i; k++) await pressionar(page, 'ArrowRight', 120);
  await apertarA(page); await dormir(350); // confirma o sobrinho
  for (let k = 0; k < 6; k++) await apertarA(page);
  await dormir(400);
  await fecharTudo(page);
  const p8 = objeto('hall', 'porta', 'P8');
  const ladoP8 = ladosDe('hall', 'porta', 'P8').find((l) => l.y === p8.y + 1) ?? ladosDe('hall', 'porta', 'P8')[0];
  await irPara(page, 'hall', ladoP8.x, ladoP8.y);
  { const e1 = await estado(page); await pressionar(page, seta[`${Math.sign(p8.x - e1.tileX)},${Math.sign(p8.y - e1.tileY)}`], 60); }
  await apertarA(page); await dormir(300);
  for (const ch of s.codigo) await pressionar(page, ch, 80);
  await pressionar(page, 'Enter', 80);
  await dormir(500);
  await fecharTudo(page);
  await esperarFade(page).catch(() => null);
  await dormir(400);
  reg(`${s.nome} entra na Sala`, (await estado(page))?.mapa === 'sala', JSON.stringify(await estado(page)).slice(0, 120));

  const inter = objeto('sala', 'interruptor');
  const lI = ladosDe('sala', 'interruptor').find((l) => l.y === inter.y + 1) ?? ladosDe('sala', 'interruptor')[0];
  await irPara(page, 'sala', lI.x, lI.y);
  { const e = await estado(page); await pressionar(page, seta[`${Math.sign(inter.x - e.tileX)},${Math.sign(inter.y - e.tileY)}`], 60); }
  await apertarA(page); await dormir(400);
  let tl = await textos(page);
  for (let i = 0; i < 4 && !tl.includes('Parabéns'); i++) { await apertarA(page); await dormir(200); tl += ' ' + (await textos(page)); }
  await fecharTudo(page);
  reg(`${s.nome} luzes`, tl.includes('Parabéns, você conseguiu acender as luzes.'), `"${tl.slice(0, 60)}"`);

  // Peça 1 (1,4): pegar de frente
  const peca = objeto('sala', 'peca', 'peca1');
  const lP = ladosDe('sala', 'peca', 'peca1').find((l) => l.y === peca.y + 1) ?? ladosDe('sala', 'peca', 'peca1')[0];
  await irPara(page, 'sala', lP.x, lP.y);
  { const e = await estado(page); await pressionar(page, seta[`${Math.sign(peca.x - e.tileX)},${Math.sign(peca.y - e.tileY)}`], 60); }
  await apertarA(page); await dormir(300);
  const conq = await esperarTexto(page, 'primeira parte', 2000);
  reg(`${s.nome} conquista 1`, conq.includes('primeira parte da árvore de Natal'), `"${conq.slice(0, 80)}"`);
  await fecharTudo(page);
  await page.keyboard.down('z'); await dormir(80); await page.keyboard.up('z'); await dormir(200);
  await fecharTudo(page);
  await esperarFade(page).catch(() => null);
  await dormir(1200);
  const enc = await esperarTexto(page, 'Faltam 2 partes', 4000);
  reg(`${s.nome} encaixe 1`, enc.includes('Agora a árvore tem 1 parte. Faltam 2 partes!'), `"${enc.slice(0, 90)}" | ${JSON.stringify(await estado(page)).slice(0, 110)}`);
  await fecharTudo(page);
  await page.screenshot({ path: join(EVID, `sob-${s.nome}-encaixe1.png`) }).catch(() => null);
  reg(`${s.nome} erros`, erros.length === 0, erros.slice(0, 2).join(' | ') || 'nenhum');
  await ctx.close();
}
await browser.close();
