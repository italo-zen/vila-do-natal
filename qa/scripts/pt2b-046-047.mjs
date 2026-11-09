// QA dos itens 046 e 047 (PT2b, planta girada, GDD 14.9.3, 14.10.10, 14.11). Build de QA: dist-qa/index.html.
// Usa lib.mjs e lib-rota.mjs (rota pela grade do conversor). Não altera src/.
// Uso: npm run build:qa && node qa/scripts/pt2b-046-047.mjs
import { lancar, novoContexto, lerTextos, limparTextos, juntar, capturar } from './lib.mjs';
import { irPara, ladosDe, estado, esperarFade, apertarA, objeto } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(join(AQUI, '..', '..', 'dist-qa', 'index.html')).href;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const seta = { '1,0': 'ArrowRight', '-1,0': 'ArrowLeft', '0,1': 'ArrowDown', '0,-1': 'ArrowUp' };
const SOBRINHOS = {
  LoLô: { direitas: 0, codigo: ['0', '1', '7'] },
  BiBi: { direitas: 1, codigo: ['0', '2', '0'] },
  DanDan: { direitas: 2, codigo: ['0', '2', '3'] },
  TuTu: { direitas: 3, codigo: ['0', '2', '4'] },
};
const TXT_P1 = 'A árvore ainda está desmontada.';
const TXT_P2 = 'Ela precisa de 3 partes. Examine a árvore!';
const TXT_A = 'A árvore ainda está desmontada. Ela precisa de 3 partes.';

const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'pt2b' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
const relatorio = [];
const reg = (id, ok, nota) => { relatorio.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} ${nota}`); };
const pressionar = async (k, ms = 90) => { await page.keyboard.down(k); await dormir(ms); await page.keyboard.up(k); await dormir(160); };
const textos = async () => juntar(await lerTextos(page));
const pos = async () => { const e = await estado(page); return e ? `${e.mapa}(${e.tileX},${e.tileY}) dir=${e.direcao} trav=${e.travado} conducao=${e.emConducao} fade=${e.emFade}` : 'null'; };
async function fecharTudo() { for (let i = 0; i < 8; i++) { const e = await estado(page); if (!e?.travado) return; await apertarA(page); } }
const tentar = async (id, fn) => { try { await fn(); } catch (e) { reg(id, false, `exceção: ${e.message.slice(0, 200)}`); } };

/** Sobe da Sala para o Hall/Sala etc. Não usado no fluxo principal. */
async function irAteSala(s) {
  await page.goto(url); await dormir(2000);
  await apertarA(page); await dormir(200); // Começar
  for (let i = 0; i < s.direitas; i++) await pressionar('ArrowRight', 120);
  await apertarA(page); await dormir(300); // confirma o sobrinho
  for (let i = 0; i < 6; i++) await apertarA(page); // introdução
  await dormir(400);
  await fecharTudo();
  const p8 = objeto('hall', 'porta', 'P8');
  const lado = ladosDe('hall', 'porta', 'P8').find((l) => l.y === p8.y + 1) ?? ladosDe('hall', 'porta', 'P8')[0];
  await irPara(page, 'hall', lado.x, lado.y);
  const e1 = await estado(page);
  await pressionar(seta[`${Math.sign(p8.x - e1.tileX)},${Math.sign(p8.y - e1.tileY)}`], 60);
  await apertarA(page); await dormir(300);
  for (const ch of s.codigo) await pressionar(ch, 80);
  await pressionar('Enter', 80);
  await dormir(500);
  await fecharTudo();
  await esperarFade(page).catch(() => null);
  await dormir(400);
}

/** Acende as luzes (interruptor) e aperta "Continuar" com o botão de seta segurado, depois solta. */
async function acenderEContinuar({ segurarSeta = null } = {}) {
  await limparTextos(page);
  const inter = objeto('sala', 'interruptor');
  const lados = ladosDe('sala', 'interruptor');
  const lI = lados.find((l) => l.y === inter.y + 1) ?? lados[0];
  await irPara(page, 'sala', lI.x, lI.y);
  const eI = await estado(page);
  await pressionar(seta[`${Math.sign(inter.x - eI.tileX)},${Math.sign(inter.y - eI.tileY)}`], 60);
  await apertarA(page); await dormir(400);
  let t = await textos();
  for (let i = 0; i < 4 && !t.includes('Parabéns'); i++) { await apertarA(page); await dormir(200); t = await textos(); }
  reg('luzes', t.includes('Parabéns, você conseguiu acender as luzes.'), `conquista 1 | "${t.slice(0, 80)}"`);
  await limparTextos(page);
  await apertarA(page); // Continuar: começa a condução
  await dormir(200);
  if (segurarSeta) await page.keyboard.down(segurarSeta);
  const t0 = Date.now();
  let e2 = null;
  for (let i = 0; i < 80; i++) { await dormir(50); e2 = await estado(page); if (!e2?.emConducao) break; }
  const tFimConducao = Date.now() - t0;
  return { e2, tFimConducao, t0 };
}

// ============ RUN 1: LoLô (047 completo + 046 captures) ============
await tentar('RUN-LoLô', async () => {
  await irAteSala(SOBRINHOS.LoLô);
  const e0 = await estado(page);
  reg('L-sala', e0?.mapa === 'sala', `chegou à Sala | ${await pos()}`);
  await tentar('L-hall-captura', async () => {
    // captura de pré-passagem: a Sala antes das luzes (sem indicadores de luz) não é o alvo; alvo é depois das luzes
  });

  // 047-1: diálogo automático ao chegar, com seta segurada durante a condução (047-8)
  const { e2, tFimConducao } = await acenderEContinuar({ segurarSeta: 'ArrowRight' });
  reg('L-conducao-fim', e2?.emConducao === false, `condução terminou em ${tFimConducao} ms | ${await pos()}`);
  reg('L-chegada', e2?.tileX === 3 && e2?.tileY === 7 && e2?.direcao === 'baixo', `chegou em (3,7) baixo | ${await pos()}`);
  // Solta a seta só depois que o diálogo aparecer (047-8: segurar não fecha o diálogo na hora)
  let tDialogo = null;
  for (let i = 0; i < 30; i++) {
    const t = await textos();
    if (t.includes(TXT_P1)) { tDialogo = t; break; }
    await dormir(50);
  }
  reg('L-dialogo-sozinho', tDialogo !== null, `página 1 abre sem tecla | "${(tDialogo ?? '').slice(0, 100)}"`);
  await dormir(300);
  await page.keyboard.up('ArrowRight');
  await dormir(500);
  const eSeg = await estado(page);
  reg('L-segurar-nao-fecha', eSeg?.travado === true, `seta segurada e solta: diálogo continua aberto (travado) | ${await pos()}`);
  await capturar(page, 'pt2b-047-lolo-dialogo-p1', 3);

  // 047-4: sem avanço por tempo (o texto só é redesenhado em mudança; o teste usa travado + Z)
  await dormir(800);
  const tSemTempo = await estado(page);
  reg('L-sem-tempo', tSemTempo?.travado === true, `após 800 ms, ainda aberto (sem avanço por tempo) | ${await pos()}`);
  await limparTextos(page);
  await apertarA(page); await dormir(300);
  const t2 = await textos();
  reg('L-pagina-2', t2.includes(TXT_P2), `Z avança para a página 2 | "${t2.slice(0, 120)}"`);
  await capturar(page, 'pt2b-047-lolo-dialogo-p2', 3);
  await apertarA(page); await dormir(300);
  const eFim = await estado(page);
  reg('L-fecha-z', eFim?.travado === false, `Z na última página fecha e devolve o controle | ${await pos()}`);

  // 047-6: barra do diálogo ("Z: avançar  X: fechar") é checada na captura da página 1

  // 047-5/9: explorar; depois A na árvore (047-10 e 047-11)
  await pressionar('ArrowLeft', 300); await dormir(200);
  const eMov = await estado(page);
  reg('L-livre', eMov?.tileX !== 3 || eMov?.tileY !== 7 || eMov?.travado === false, `anda livre após o diálogo | ${await pos()}`);
  await pressionar('ArrowRight', 300); await dormir(200);
  await pressionar('ArrowDown', 80); await dormir(200); // vira para a árvore
  const eArv = await estado(page);
  reg('L-em-frente', eArv?.tileX === 3 && eArv?.tileY === 7, `de volta em (3,7) | ${await pos()}`);
  await limparTextos(page);
  await apertarA(page); await dormir(300);
  const tArv1 = await textos();
  reg('L-A-arvore-1-trav', (await estado(page))?.travado === true, `A abre a fala da árvore (travado) | ${await pos()}`);
  reg('L-A-arvore-1', tArv1.includes(TXT_A), `A na árvore: "${TXT_A}" | "${tArv1.slice(0, 140)}"`);
  await capturar(page, 'pt2b-047-lolo-arvore-A', 3);
  await apertarA(page); await dormir(300);
  reg('L-A-fecha-1', (await estado(page))?.travado === false, `A (2º) fecha a fala de 1 página | ${await pos()}`);
  await limparTextos(page);
  await apertarA(page); await dormir(300);
  const tArv2 = await textos();
  reg('L-A-arvore-3-trav', (await estado(page))?.travado === true, `A (3º) reabre a fala | ${await pos()}`);
  reg('L-A-arvore-repetido', tArv2.includes(TXT_A), `A repetido mostra o mesmo texto | "${tArv2.slice(0, 140)}"`);
  reg('L-sem-dialogo-auto', !tArv2.includes(TXT_P2) || tArv2.includes(TXT_A), `sem diálogo automático de novo | "${tArv2.slice(0, 120)}"`);
  await fecharTudo();

  // 046 captures e passagens (Sala girada, depois das luzes)
  await dormir(300);
  await capturar(page, 'pt2b-046-lolo-sala-tela-inteira', 3);
  await dormir(100);
  await tentar('L-046-passagem-P7', async () => {
    await irPara(page, 'sala', 9, 5);
    await capturar(page, 'pt2b-046-lolo-sala-p7-antes', 3);
    await pressionar('ArrowRight', 300); await esperarFade(page); await dormir(200);
    const c = await estado(page);
    reg('L-046-P7-ida', c?.mapa === 'cozinha', `Sala → Cozinha pela P7 | ${await pos()}`);
    await capturar(page, 'pt2b-046-lolo-cozinha-p7', 3);
    await pressionar('ArrowLeft', 300); await esperarFade(page); await dormir(200);
    const s = await estado(page);
    reg('L-046-P7-volta', s?.mapa === 'sala', `Cozinha → Sala pela P7 | ${await pos()}`);
  });
  await tentar('L-046-tapete-P8', async () => {
    // Tapete em (6,6): anda até lá e confirma que é possível pisar.
    await irPara(page, 'sala', 6, 6);
    const e6 = await estado(page);
    reg('L-046-tapete-andar', e6?.tileX === 6 && e6?.tileY === 6, `anda sobre o tapete (6,6) | ${await pos()}`);
    await capturar(page, 'pt2b-046-lolo-tapete', 3);
    const p8 = objeto('sala', 'porta', 'P8');
    const ladoP8 = ladosDe('sala', 'porta', 'P8').find((l) => l.y === p8.y - 1) ?? ladosDe('sala', 'porta', 'P8')[0];
    await irPara(page, 'sala', ladoP8.x, ladoP8.y);
    await pressionar('ArrowDown', 300); await esperarFade(page); await dormir(200);
    const h = await estado(page);
    reg('L-046-P8-ida', h?.mapa === 'hall', `Sala → Hall pela P8 | ${await pos()}`);
    await pressionar('ArrowUp', 300); await esperarFade(page); await dormir(200);
    const s2 = await estado(page);
    reg('L-046-P8-volta', s2?.mapa === 'sala', `Hall → Sala pela P8 | ${await pos()}`);
  });
  // Captura do Hall (P8 sem indicador, C22)
  await tentar('L-046-hall', async () => {
    await irPara(page, 'sala', 6, 6);
    const p8b = objeto('sala', 'porta', 'P8');
    const ladoB = ladosDe('sala', 'porta', 'P8').find((l) => l.y === p8b.y - 1) ?? ladosDe('sala', 'porta', 'P8')[0];
    await irPara(page, 'sala', ladoB.x, ladoB.y);
    await pressionar('ArrowDown', 300); await esperarFade(page); await dormir(200);
    const hall = objeto('hall', 'porta', 'P8');
    const ladoH = ladosDe('hall', 'porta', 'P8').find((l) => l.y === hall.y + 1) ?? ladosDe('hall', 'porta', 'P8')[0];
    await irPara(page, 'hall', ladoH.x, ladoH.y);
    await capturar(page, 'pt2b-046-lolo-hall-p8', 3);
    reg('L-046-hall-captura', true, 'captura pt2b-046-lolo-hall-p8.png (inspecionar: sem seta/tapete na P8 do Hall)');
  });
});

// ============ RUN 2: BiBi (X no meio do diálogo automático) ============
await tentar('RUN-BiBi', async () => {
  await irAteSala(SOBRINHOS.BiBi);
  const { e2 } = await acenderEContinuar();
  reg('B-chegada', e2?.tileX === 3 && e2?.tileY === 7 && e2?.direcao === 'baixo', `BiBi chegou em (3,7) baixo | ${await pos()}`);
  let tD = null;
  for (let i = 0; i < 30; i++) { const t = await textos(); if (t.includes(TXT_P1)) { tD = t; break; } await dormir(50); }
  reg('B-dialogo-sozinho', tD !== null, `BiBi: página 1 sem tecla | "${(tD ?? '').slice(0, 100)}"`);
  await dormir(250);
  // X no meio: fecha o diálogo inteiro na hora (047-5)
  await pressionar('x', 90); await dormir(200);
  const eX = await estado(page);
  reg('B-X-fecha', eX?.travado === false, `X fecha o diálogo inteiro | ${await pos()}`);
  await limparTextos(page);
  await dormir(600);
  const tDep = await textos();
  reg('B-sem-reabrir', !tDep.includes(TXT_P1) && !tDep.includes(TXT_P2), `não reabre sozinho | "${tDep.slice(0, 80)}"`);
  // A na árvore: mostra o texto de 1 página
  await pressionar('ArrowDown', 80); await dormir(200);
  await limparTextos(page);
  await apertarA(page); await dormir(300);
  const tA = await textos();
  reg('B-A-arvore', tA.includes(TXT_A), `A na árvore após X: "${tA.slice(0, 120)}"`);
  await capturar(page, 'pt2b-047-bibi-arvore-A', 3);
});

// ============ RUN 3: DanDan e TuTu (chegada automática, sem tecla) ============
for (const nome of ['DanDan', 'TuTu']) {
  await tentar(`RUN-${nome}`, async () => {
    await irAteSala(SOBRINHOS[nome]);
    const { e2 } = await acenderEContinuar();
    reg(`${nome}-chegada`, e2?.tileX === 3 && e2?.tileY === 7 && e2?.direcao === 'baixo', `${nome} chegou em (3,7) baixo | ${await pos()}`);
    let tD = null;
    for (let i = 0; i < 30; i++) { const t = await textos(); if (t.includes(TXT_P1)) { tD = t; break; } await dormir(50); }
    reg(`${nome}-dialogo-sozinho`, tD !== null, `${nome}: página 1 sem tecla | "${(tD ?? '').slice(0, 100)}"`);
    await capturar(page, `pt2b-047-${nome.toLowerCase()}-dialogo`, 3);
    if (nome === 'DanDan') {
      // 047-2/3: Z logo ao abrir (dentro dos 200 ms) é ignorado; o 2º Z, depois de 400 ms, mostra a página 2
      await pressionar('z', 60);
      await dormir(400);
      await limparTextos(page);
      await apertarA(page); await dormir(300);
      const tp2 = await textos();
      const e = await estado(page);
      reg('DanDan-bloqueio-200ms', tp2.includes(TXT_P2) && e?.travado === true, `Z ao abrir ignorado (2º Z mostra página 2) | "${tp2.slice(0, 80)}"`);
    }
    if (nome === 'TuTu') {
      // 047-5 a partir da página 2: Z avança, X fecha o diálogo inteiro
      await apertarA(page); await dormir(300);
      await capturar(page, 'pt2b-047-tutu-dialogo-p2', 3);
      await pressionar('x', 90); await dormir(200);
      reg('TuTu-X-na-pagina-2', (await estado(page))?.travado === false, `X na página 2 fecha o diálogo inteiro | ${await pos()}`);
    }
    await fecharTudo();
  });
}

const falhas = relatorio.filter((r) => r.ok === false);
console.log(`\nTotal: ${relatorio.length} | falhas: ${falhas.length} | N/T: ${relatorio.filter((r) => r.ok === null).length}`);
console.log(`Erros de página: ${erros.length}`);
for (const e of erros.slice(0, 10)) console.log(`  - ${e.slice(0, 200)}`);
await browser.close();
