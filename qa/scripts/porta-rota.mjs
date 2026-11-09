// OBSOLETO (rodada 14, 2026-11-08): coordenadas da planta antiga, antes da rotação (GDD 14.12.3). Não usar sem atualizar para content/maps/casa-real/*.json. Ver marco1-r13-vivo.mjs e marco1-r14-sobrinhos.mjs.
// Roteiro da porta (F-02..F-05, F-20..F-29, K2-06) com rota real: lib-rota.mjs + build de QA (dist-qa/index.html).
// Não depende de coordenadas fixas: o destino de cada passo sai de content/maps/casa-real/hall.json.
// Uso: node qa/scripts/porta-rota.mjs
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  CODIGOS, RAIZ, abrirJogo, capturar, contemFrase, contemLinha, criarRelatorio, digitar, lancar, lerTextos,
  limparTextos, novoContexto, painelAberto, sleep, tecla, teclaDoBbox, bboxDestaque, irAteHall,
} from './lib.mjs';
import { estado, irPara, ladoDe, esperarParado, esperarFade, objeto } from './lib-rota.mjs';

const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const rel = criarRelatorio('m13-porta-rota');
const browser = await lancar();

const ABRIU = 'Clique! A porta abriu.';
const PERGUNTA = 'Senha';
const BARRA_BILHETE = 'Z: avançar  X: fechar';

/** Tecla de direção do tile `de` até o tile do objeto `o` (adjacente). */
function direcaoPara(de, o) {
  return o.x < de.x ? 'ArrowLeft' : o.x > de.x ? 'ArrowRight' : o.y < de.y ? 'ArrowUp' : 'ArrowDown';
}

/** Vai até o bilhete e examina p1, p2 (barra em ambas); fecha com Z. Devolve textos e barras. */
async function examinarBilhete(page, nome) {
  const e = await esperarParado(page);
  const lado = ladoDe('hall', 'bilhete', 'bilhete.pista', e);
  // Chega ao lado do bilhete andando em direção a ele (a última tecla já vira o personagem; sem toque extra,
  // que deslocaria o personagem para dentro do tile do bilhete, que é andável).
  const obj = objeto('hall', 'bilhete', 'bilhete.pista');
  const antes = { x: lado.x + (obj.x - lado.x) * -1, y: lado.y + (obj.y - lado.y) * -1 };
  if (antes.x >= 0 && antes.x < 3 && antes.y >= 0 && antes.y < 4) await irPara(page, 'hall', antes.x, antes.y);
  await irPara(page, 'hall', lado.x, lado.y);
  await limparTextos(page);
  await tecla(page, 'z');
  await sleep(150);
  const p1 = await lerTextos(page);
  await tecla(page, 'z');
  await sleep(150);
  const p2 = await lerTextos(page);
  await tecla(page, 'z');
  await sleep(200);
  return {
    p1: contemFrase(p1, 'Um bilhete para você.'),
    p2: contemFrase(p2, `Dica: os 3 últimos dígitos do ano em que ${nome} nasceu.`),
    barraP1: contemLinha(p1, BARRA_BILHETE),
    textosP1: p1.map((x) => x.t).filter((t) => /Z:|X:/.test(t)),
    textosP2: p2.map((x) => x.t).filter((t) => /Z:|X:/.test(t)),
    barraP2: contemLinha(p2, BARRA_BILHETE),
    fechou: (await esperarParado(page)).travado === false,
  };
}

/** Vai até a P8 pelo lado livre (rota real) e vira para a porta. Devolve o lado usado. */
async function irAtePortaP8(page) {
  const e = await esperarParado(page);
  const lado = ladoDe('hall', 'porta', 'P8', e);
  // Chega andando em direção à porta (última tecla = direção da porta), sem toque extra.
  const porta = objeto('hall', 'porta', 'P8');
  const antes = { x: lado.x + (lado.x - porta.x), y: lado.y };
  if (antes.x >= 0 && antes.x < 3) await irPara(page, 'hall', antes.x, antes.y);
  await irPara(page, 'hall', lado.x, lado.y);
  await sleep(150);
  return lado;
}

/** Digita pelas setas + Z (grade 3×4: 1 2 3 / 4 5 6 / 7 8 9 / Apagar 0 OK; foco inicial em OK). */
const POS = { 1: [0, 0], 2: [0, 1], 3: [0, 2], 4: [1, 0], 5: [1, 1], 6: [1, 2], 7: [2, 0], 8: [2, 1], 9: [2, 2], Apagar: [3, 0], 0: [3, 1], OK: [3, 2] };
async function digitarPorSetas(page, codigo) {
  let [r, c] = POS.OK;
  for (const ch of [...codigo, 'OK']) {
    const [tr, tc] = POS[ch];
    while (c > tc) { await tecla(page, 'ArrowLeft', { ms: 60, pausa: 150 }); c--; }
    while (c < tc) { await tecla(page, 'ArrowRight', { ms: 60, pausa: 150 }); c++; }
    while (r > tr) { await tecla(page, 'ArrowUp', { ms: 60, pausa: 150 }); r--; }
    while (r < tr) { await tecla(page, 'ArrowDown', { ms: 60, pausa: 150 }); r++; }
    if (ch === 'OK') {
      await capturar(page, 'm13-DanDan-setas-antes-OK').catch(() => {});
      rel.dado('DanDan foco antes de OK (bbox)', teclaDoBbox(await bboxDestaque(page)));
      rel.dado('DanDan posição de foco rastreada', { r, c });
      await page.keyboard.down('z'); await sleep(120); await page.keyboard.up('z');
      await sleep(500);
      await capturar(page, 'm13-DanDan-setas-depois-OK').catch(() => {});
      rel.dado('DanDan estado depois de Z em OK', await estado(page));
      continue;
    }
    await tecla(page, 'z');
  }
}

async function sessao(nome, modo) {
  const i = ['LoLô', 'BiBi', 'DanDan', 'TuTu'].indexOf(nome);
  const ctx = await novoContexto(browser, { url, rotulo: nome });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, i);
  const est0 = await estado(page);
  rel.dado(`${nome} estado após intro`, est0);
  if (est0?.mapa !== 'hall') {
    rel.caso(`${nome}-hall`, 'FALHOU', `não chegou ao hall: ${JSON.stringify(est0)}`);
    await ctx.close();
    return;
  }
  const b = await examinarBilhete(page, nome);
  if (nome === 'LoLô') {
    rel.caso('K2-06', b.barraP1 && b.barraP2 ? 'OK' : 'FALHOU', `barra "${BARRA_BILHETE}" em p1=${b.barraP1} e na última p2=${b.barraP2}; Z fecha=${b.fechou}`);
    rel.dado('K2-06 textos de barra p1', b.textosP1);
    rel.dado('K2-06 textos de barra p2', b.textosP2);
  }
  rel.caso(`F-0x-bilhete-${nome}`, b.p1 && b.p2 ? 'OK' : 'FALHOU', `${nome}: p1=${b.p1} p2=${b.p2}`);
  const lado = await irAtePortaP8(page);
  rel.dado(`${nome} lado da porta`, lado);
  await limparTextos(page);
  await tecla(page, 'z');
  await sleep(250);
  const abriuTextos = await lerTextos(page);
  const aberto = contemFrase(abriuTextos, PERGUNTA) || (await painelAberto(page));
  rel.dado(`${nome} textos ao abrir painel`, abriuTextos.map((x) => x.t).slice(0, 12));
  rel.caso(`${nome}-painel`, aberto ? 'OK' : 'FALHOU', `Z na P8 abre o painel: ${aberto}`);
  if (modo === 'digitar') {
    await digitar(page, CODIGOS[nome]);
  } else {
    await digitarPorSetas(page, CODIGOS[nome]);
  }
  await limparTextos(page);
  if (modo === 'digitar') await tecla(page, 'z');
  await sleep(200);
  const e1 = await estado(page);
  await sleep(700);
  const e2 = await estado(page);
  rel.dado(`${nome} estado 0,2 s e 0,9 s após o último Z`, { a: e1?.mapa, b: e2?.mapa, travado: e2?.travado });
  const t = await lerTextos(page);
  rel.dado(`${nome} textos após código`, t.map((x) => x.t).slice(0, 12));
  const abriu = contemFrase(t, ABRIU) || (await lerTextos(page)).some((x) => x.t.includes('Clique'));
  rel.caso(`${nome}-porta`, abriu || e2?.mapa === 'sala' ? 'OK' : 'FALHOU', `código ${CODIGOS[nome]} (${modo}) abriu=${abriu}; mapa após código=${e2?.mapa}`);
  await tecla(page, 'x');
  await sleep(350);
  const sala = await lerTextos(page);
  const est = await esperarFade(page).catch(() => null);
  rel.caso(`${nome}-entrou`, contemFrase(sala, 'Está tudo escuro! Procure o interruptor.') || est?.mapa === 'sala' ? 'OK' : 'FALHOU', `mapa=${est?.mapa} fade=${est?.emFade}`);
  await capturar(page, `m13-${nome}-porta-aberta`).catch(() => {});
  await ctx.close();
}

await sessao('LoLô', 'digitar');
await sessao('BiBi', 'digitar');
await sessao('DanDan', 'setas');
await sessao('TuTu', 'digitar');

rel.salvar();
await browser.close();
