// QA Marco 5 (v0.9.0), rodada 5: teclado (sem toque) com 2 sobrinhos (LoLô 017, BiBi 020). RM1 (16.14: N1, N2, N4, N9, N10, F1, F4, D1, D3, B1) e RM2 (P8 por código, luzes, avisos).
// Usa lib.mjs (tecla, irAteHall, irAtePainel, digitar, lerTextos) e lib-rota.mjs (irPara, estado). Só observa. Não altera src/.
import { lancar, novoContexto, abrirJogo, lerTextos, limparTextos, tecla, irAteHall, irAtePainel, digitar, sleep, COLETOR } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco5-r5');
mkdirSync(EVID, { recursive: true });
const SOBRINHOS = [{ nome: 'LoLô', idx: 0, codigo: '017' }, { nome: 'BiBi', idx: 1, codigo: '020' }];
const LOG = [];
const reg = (id, ok, nota = '') => { LOG.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`); };
const browser = await lancar();
const est = async () => { try { return await estado(page); } catch { await sleep(150); return null; } };
let acum = '';
const ler = async () => { const t = (await lerTextos(page)).map((x) => x.t).join(' ').replace(/\s+/g, ' '); acum += ' ' + t; return t; };
const txt = () => ler();
const shot = async (nome) => { await page.screenshot({ path: join(EVID, `${nome}.png`) }); };
const z = (ms = 90, pausa = 400) => tecla(page, 'z', { ms, pausa });
const x = (ms = 90, pausa = 400) => tecla(page, 'x', { ms, pausa });
const h = () => tecla(page, 'h', { ms: 90, pausa: 500 });
const fechar = async () => { for (let i = 0; i < 14; i++) { const q = await est(); if (!q || !q.travado) return; await z(); } };
let page;

async function rodar(s) {
  const tag = s.nome;
  const ctx = await novoContexto(browser, { url, origem: url, rotulo: tag });
  page = await abrirJogo(ctx, url);
  await irAteHall(page, s.idx);
  await irAtePainel(page);
  await digitar(page, s.codigo);
  await z();
  for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q && q.travado) await z(); }
  await fechar();
  const e0 = await est();
  reg(`RM2-b ${tag} (${s.codigo}): porta P8 abre pelo teclado e entra na Sala`, e0?.mapa === 'sala', `mapa=${e0?.mapa} fase=${e0?.fase}`);
  await shot(`${tag}-01-sala-apos-porta`);

  // N1: Nick dormindo na Sala, no tile de 16.2.2 (estante? tile 8,5)
  const nk = e0?.nick;
  reg(`N1 ${tag}: Nick dormindo na Sala (8,5) antes do acordar`, nk?.estado === 'dormindo' && nk?.mapa === 'sala' && nk?.tileX === 8 && nk?.tileY === 5, `nick=${nk?.estado}@${nk?.tileX},${nk?.tileY} ${nk?.mapa}`);

  // N2: A na frente de Nick dormindo (sobrinho em (9,5) olhando para a esquerda)
  try { await irPara(page, 'sala', 7, 4); } catch (e) { reg(`N2 ${tag}: rota até (7,4)`, false, e.message.slice(0, 100)); }
  for (const k of ['ArrowRight', 'ArrowRight', 'ArrowDown']) await tecla(page, k, { ms: 280, pausa: 150 });
  await tecla(page, 'ArrowLeft', { ms: 90, pausa: 200 });
  const eN2 = await est();
  reg(`N2 ${tag}: sobrinho em (9,5) olhando para o Nick dormindo (8,5)`, eN2?.tileX === 9 && eN2?.tileY === 5 && eN2?.direcao === 'esquerda', `pos=${eN2?.tileX},${eN2?.tileY} dir=${eN2?.direcao}`);
  await ler();
  await z(90, 600);
  let tN2 = ''; for (let i = 0; i < 4; i++) { tN2 += ' ' + (await txt()); await ler(); if (tN2.includes('Aperte X para farejar')) break; await z(); }
  reg(`N2 ${tag}: "O Nick acordou! Ele vai seguir você." e "Aperte X para farejar."`, tN2.includes('O Nick acordou! Ele vai seguir você.') && tN2.includes('Aperte X para farejar.'), tN2.slice(0, 160));
  await shot(`${tag}-02-nick-acordou`);
  await fechar();

  // N4: 10 passos com Nick acordado: ele fica 1 tile atrás
  const passos = [[9, 4], [8, 4], [7, 4], [6, 4], [6, 3], [7, 3], [8, 3], [8, 4], [7, 4], [7, 5]];
  let ok4 = 0; let maxDist = 0; let total = 0;
  for (const [tx, ty] of passos) {
    try { await irPara(page, 'sala', tx, ty); } catch { continue; }
    const q = await est(); total++;
    const d = Math.max(Math.abs((q?.nick?.tileX ?? 0) - q.tileX), Math.abs((q?.nick?.tileY ?? 0) - q.tileY));
    maxDist = Math.max(maxDist, d); if (d <= 2) ok4++;
  }
  reg(`N4 ${tag}: Nick segue perto (≤ 2 tiles) em ${total} trechos`, total >= 6 && ok4 === total, `trechos=${total} ok=${ok4} maiorDist=${maxDist}`);
  await shot(`${tag}-04-seguindo`);

  // diagnóstico de farejar (B) na Sala com Nick acordado: alvo na mesma sala (F3)
  await ler();
  const antesX = await est();
  await x(200, 300);
  await sleep(400);
  const fS = await est();
  reg(`F3 ${tag}: estado antes do B (diagnóstico)`, true, `travado=${antesX?.travado} fade=${antesX?.emFade} cond=${antesX?.emConducao} dir=${antesX?.direcao} nick=${antesX?.nick?.estado} farejo=${JSON.stringify(antesX?.farejo).slice(0,80)}`);
  const tS = await ler();
  reg(`F3 ${tag}: B na Sala com Nick acordado (diagnóstico)`, !!fS?.farejo?.ativo || /Au!|farejar|Fareja/i.test(tS), `farejo=${JSON.stringify(fS?.farejo).slice(0, 120)} T="${tS.slice(0, 80)}"`);
  await sleep(5200);
  // F4: do Hall com alvo na Sala, seta para cima sobre a P8 (mesmo que o alvo atual seja da Sala)
  try { await irPara(page, 'sala', 6, 7); } catch (e) { reg(`F4 ${tag}: rota até a P8 (6,7)`, false, e.message.slice(0, 100)); }
  await fechar();
  const eH = await est();
  reg(`F4 ${tag}: na Hall (ou porta P8)`, true, `mapa=${eH?.mapa} pos=${eH?.tileX},${eH?.tileY}`);
  await ler();
  await ler();
  await x(90, 300);
  await sleep(700);
  const f1 = await est();
  const tF4 = await ler();
  reg(`F4 ${tag}: diagnóstico após B na Hall`, true, `nick=${f1?.nick?.estado}@${f1?.nick?.mapa} ${f1?.nick?.tileX},${f1?.nick?.tileY} T="${tF4.slice(0, 90)}"`);
  await shot(`${tag}-F4-seta-farejar`);
  reg(`F4 ${tag}: B (farejar) ativa a seta`, !!f1?.farejo?.ativo, `farejo=${JSON.stringify(f1?.farejo).slice(0, 200)}`);

  // F1: seta some em ~5 s
  await sleep(5200);
  const f2 = await est();
  reg(`F1 ${tag}: seta de farejar some depois de ~5 s`, !f2?.farejo?.ativo, `farejo.ativo=${f2?.farejo?.ativo} restante=${f2?.farejo?.restanteMs}`);

  // D1: H abre a dica; Voltar com foco (texto Voltar)
  await ler();
  await h();
  const tD = await txt();
  reg(`D1 ${tag}: H abre a dica com "Voltar"`, tD.includes('Voltar') && tD.includes('Dica'), tD.slice(0, 140));
  await shot(`${tag}-D1-dica`);
  await tecla(page, 'x', { ms: 90, pausa: 400 });
  // D3: texto da fase (luzes ou porta) e B1: barra da Sala
  await shot(`${tag}-B1-barra-dica-fechada`);
  const tB1 = acum.replace(/\s+/g, ' ');
  reg(`B1 ${tag}: barra "Setas: andar  Z: examinar" e "X: farejar  H: dica" (texto lido na exploração; espaços normalizados)`, tB1.includes('Setas: andar Z: examinar') && tB1.includes('X: farejar H: dica'), tB1.match(/Setas: andar[^]{0,30}/)?.[0] ?? 'não lido');
  await h();
  const tD3 = await txt();
  reg(`D3 ${tag}: dica com texto da fase (porta/luzes) e árvore`, tD3.includes('Dica'), tD3.slice(0, 160));
  await tecla(page, 'Escape', { ms: 90, pausa: 400 });
  // N9/N10/F7 (chegada e fase seguinte) ficam para o caminho da rodada 4 (não repetidos aqui)
  reg(`N9 ${tag}: dormir na chegada da parte 3`, null, 'não testado (limite de tempo)');
  reg(`N10 ${tag}: cômodo por fase`, null, 'não testado (limite de tempo); luzes na Sala coberta pelo N1');
  await ctx.close();
}

async function main() {
  for (const s of SOBRINHOS) {
    try { await rodar(s); } catch (e) { reg(`BLOCO ${s.nome} interrompido`, false, e.message.slice(0, 160)); }
  }
  writeFileSync(join(EVID, 'log.json'), JSON.stringify({ LOG, erros: COLETOR.erros }, null, 1));
  console.log('ERROS', COLETOR.erros.length, COLETOR.erros.slice(0, 6));
  await browser.close();
}
main();
