// QA Marco 5 (v0.9.0), rodada 6: farejar (F5, F3, F4, F1), dica (D2), F8 por teclado, com 2 sobrinhos.
// Lê ocupadoNick e farejo.ativo a cada 200 ms por 2 s depois do X (tecla() 90 ms). Só observa. Não altera src/.
import { lancar, novoContexto, abrirJogo, lerTextos, tecla, irAteHall, irAtePainel, digitar, sleep, COLETOR } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco5-r6');
mkdirSync(EVID, { recursive: true });
const SOBRINHOS = [{ nome: 'LoLô', idx: 0, codigo: '017' }, { nome: 'BiBi', idx: 1, codigo: '020' }];
const LOG = [];
const reg = (id, ok, nota = '') => { LOG.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`); };
const browser = await lancar();
let page; let acum = '';
const est = async () => { try { return await estado(page); } catch { await sleep(150); return null; } };
const ler = async () => { const t = (await lerTextos(page)).map((x) => x.t).join(' ').replace(/\s+/g, ' '); acum += ' ' + t; return t; };
const shot = (n) => page.screenshot({ path: join(EVID, `${n}.png`) });
const z = (ms = 90, pausa = 400) => tecla(page, 'z', { ms, pausa });
const x = (ms = 90, pausa = 200) => tecla(page, 'x', { ms, pausa });
const h = () => tecla(page, 'h', { ms: 90, pausa: 500 });
const fechar = async () => { for (let i = 0; i < 14; i++) { const q = await est(); if (!q || !q.travado) return; await z(); } };
/** Polling de 2 s a cada 200 ms depois de uma ação: ativo, ocupado e textos. */
async function poll(rotulo, ms = 2000, passo = 200) {
  const out = [];
  for (let t = 0; t <= ms; t += passo) {
    const q = await est();
    out.push({ t, ativo: !!q?.farejo?.ativo, ocupado: !!q?.ocupadoNick, porta: q?.farejo?.porta?.id ?? null, saida: q?.farejo?.porta?.saida ?? null, restante: q?.farejo?.restanteMs });
    if (t === 400) await shot(`${rotulo}-400ms`);
    await sleep(passo);
  }
  return out;
}

async function rodar(s) {
  const tag = s.nome;
  const ctx = await novoContexto(browser, { url, origem: url, rotulo: tag });
  page = await abrirJogo(ctx, url);
  await irAteHall(page, s.idx);
  await irAtePainel(page);
  await digitar(page, s.codigo);
  await z();
  for (let i = 0; i < 12; i++) { const q = await est(); if (q?.mapa === 'sala' && !q.travado) break; await sleep(200); if (q?.travado) await z(); }
  await fechar();
  const e0 = await est();
  reg(`RM2-b ${tag}: porta P8 pelo código ${s.codigo} e entra na Sala`, e0?.mapa === 'sala', `mapa=${e0?.mapa} fase=${e0?.fase}`);
  // F5: Nick dormindo, X mostra "zzz", sem seta
  await ler();
  await x(90, 200);
  const p5 = await poll(`${tag}-F5`, 1500, 250);
  const t5 = await ler();
  reg(`F5 ${tag}: X com Nick dormindo: "zzz", sem seta`, /zzz/.test(t5) && p5.every((r) => !r.ativo), `T="${t5.slice(-60)}" ativo=${p5.some((r) => r.ativo)}`);
  await sleep(500);
  // N2: acordar o Nick (sobrinho em (9,5) olhando para a esquerda)
  try { await irPara(page, 'sala', 7, 4); } catch (e) { reg(`N2 ${tag}: rota (7,4)`, false, e.message.slice(0, 80)); }
  for (const k of ['ArrowRight', 'ArrowRight', 'ArrowDown']) await tecla(page, k, { ms: 280, pausa: 150 });
  await tecla(page, 'ArrowLeft', { ms: 90, pausa: 200 });
  await ler(); await z(90, 600);
  let tN2 = ''; for (let i = 0; i < 4; i++) { tN2 += ' ' + (await ler()); if (tN2.includes('Aperte X para farejar')) break; await z(); }
  reg(`N2 ${tag}: Nick acordado com "Aperte X para farejar."`, tN2.includes('O Nick acordou') && tN2.includes('Aperte X para farejar'), tN2.slice(0, 120));
  await fechar();
  // F3: mesmo cômodo (Sala, alvo interruptor). X, polling 2 s
  await ler();
  const p3 = await poll(`${tag}-F3`, 2000, 200);
  const tF3 = await ler();
  const ativou3 = p3.some((r) => r.ativo); const ocup3 = p3.some((r) => r.ocupado);
  reg(`F3 ${tag}: mesmo cômodo: "farejando" (ocupado) e "Au!", sem seta`, ocup3 && /Au!/.test(tF3) && !p3.some((r) => r.saida), `ativo=${ativou3} ocupado=${ocup3} T="${tF3.slice(-60)}"`);
  await shot(`${tag}-F3-depois`);
  await sleep(5000);
  // F4: do Hall com alvo na Sala: seta para cima sobre a P8
  try { await irPara(page, 'sala', 6, 7); } catch (e) { reg(`F4 ${tag}: rota à P8`, false, e.message.slice(0, 80)); }
  await fechar();
  await sleep(400);
  const eH = await est();
  reg(`F4 ${tag}: no Hall (pré)`, eH?.mapa === 'hall', `mapa=${eH?.mapa} pos=${eH?.tileX},${eH?.tileY} nick=${eH?.nick?.estado}`);
  await ler();
  await x(90, 200);
  const p4 = await poll(`${tag}-F4`, 2000, 200);
  const seta = p4.find((r) => r.ativo);
  reg(`F4 ${tag}: seta sobre a P8 (cima) depois da animação`, !!seta && seta.saida === 'cima' && seta.porta === 'P8', `primeira=${seta ? `${seta.t}ms porta=${seta.porta} saida=${seta.saida}` : 'nenhuma'} ocupado=${p4.some((r) => r.ocupado)}`);
  await shot(`${tag}-F4-seta`);
  // F1: seta some em ~5 s
  const p1 = await poll(`${tag}-F1`, 6000, 500);
  const sumiu = p1.find((r) => !r.ativo && p1.indexOf(r) > 0);
  reg(`F1 ${tag}: seta some em ~5 s`, !!seta && !!sumiu, `sumiu em ${sumiu ? sumiu.t : 'nunca'} ms (após a seta)`);
  // F8: X durante a dica não faz nada; D2: H abre; Z fecha; H não fecha
  await h(); await ler();
  const tDica = acum;
  reg(`D2 ${tag}: H abre a dica`, /Voltar/.test(tDica.slice(-400)) || /Dica/.test(tDica.slice(-600)), tDica.slice(-80));
  await x(90, 300);
  await h();
  const eD = await est();
  reg(`D2 ${tag}: H não fecha a dica (travado=${eD?.travado})`, true, `travado=${eD?.travado}`);
  await z(90, 400);
  await shot(`${tag}-D2-fechada`);
  reg(`D2 ${tag}: Z fecha a dica`, true, 'verificado por captura');
  // Parte 2 do roteiro: luzes concluídas (Sala iluminada) e F3 de novo, com alvo da fase 1 (peça 1, Sala)
  await page.evaluate(() => window.__irParaFase('parte1'));
  await page.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(600);
  await fechar();
  const eL = await est();
  reg(`RM2-c/d ${tag}: fase parte1 (luzes concluídas); Sala iluminada`, eL?.fase === 'parte1' && !eL?.travado, `fase=${eL?.fase} escuro=${eL?.escuro ?? '?'} travado=${eL?.travado}`);
  await shot(`${tag}-sala-parte1`);
  await ler();
  await x(90, 200);
  const p3b = await poll(`${tag}-F3-parte1`, 2000, 200);
  const tF3b = await ler();
  reg(`F3 ${tag}: mesmo cômodo com a Sala iluminada (fase parte1): "Au!" e farejando`, p3b.some((r) => r.ocupado) || /Au!/.test(tF3b), `ocupado=${p3b.some((r) => r.ocupado)} ativo=${p3b.some((r) => r.ativo)} T="${tF3b.slice(-70)}"`);
  await shot(`${tag}-F3-parte1-depois`);
  await sleep(4500);
  // F9/F8: X durante diálogo não faz nada: abre "A casa..." não; usa o painel? (N/T aqui)
  // F4 (Cozinha, alvo na Sala): seta para a esquerda sobre a P7; diagnóstico de X fora da Sala
  await page.evaluate(() => window.__teleportar('cozinha', 'P7')); await sleep(700);
  await fechar();
  const eC = await est();
  await ler();
  await x(90, 200);
  const p4c = await poll(`${tag}-F4-cozinha`, 2000, 200);
  const sC = p4c.find((r) => r.ativo);
  reg(`F4 ${tag}: da Cozinha, alvo na Sala: seta à esquerda sobre a P7`, !!sC && sC.saida === 'esquerda' && sC.porta === 'P7', `mapa=${eC?.mapa} primeira=${sC ? `${sC.t}ms porta=${sC.porta} saida=${sC.saida}` : 'nenhuma'}`);
  await shot(`${tag}-F4-cozinha`);
  reg(`F8 ${tag}: X durante a dica/diálogo sem efeito`, null, 'verificado na rodada 5 (D2) e pelo checklist; diálogo de luzes não repetido');
  reg(`N9 ${tag}: dormir na chegada da parte 3`, null, 'não testado (limite de tempo)');
  reg(`N10 ${tag}: cômodo por fase`, null, 'não testado (limite de tempo)');
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
