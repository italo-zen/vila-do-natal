// QA Marco 1: casos do painel que faltavam na rodada principal: F-62, F-65, F-70, F-83, F-91.
// Uso: node qa/scripts/porta-extra.mjs [dist|playtest]
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  RAIZ, abrirJogo, bboxDestaque, caso, criarRelatorio, digitar, irAteBilhete, irAteHall, lancar, lerTextos, limparTextos,
  novoContexto, painelAberto, segurar, servirPasta, sleep, tecla, teclaDoBbox, juntar,
} from './lib.mjs';

const alvo = process.argv[2] ?? 'dist';
let url;
let origem = null;
let srv = null;
if (alvo === 'dist') {
  const s = await servirPasta(join(RAIZ, 'dist'));
  srv = s.srv;
  url = s.url;
  origem = s.origem;
} else {
  url = pathToFileURL(join(RAIZ, 'dist-playtest', 'index.html')).href;
}
const rel = criarRelatorio(`porta-extra-${alvo}`);
const browser = await lancar();
const ABRIU = 'Clique! A porta abriu.';
const PERGUNTA = 'Senha';

/** Abre o painel da porta (LoLô) a partir do hall, com o bilhete já fechado. */
async function painelDaPorta(page) {
  await irAteBilhete(page);
  await tecla(page, 'x');
  await tecla(page, 'ArrowRight', { ms: 60 });
  await sleep(200);
  await limparTextos(page);
  await tecla(page, 'z');
  await sleep(250);
  return painelAberto(page);
}

// F-62, F-65: Backspace apaga; apagar tudo e digitar o código certo com foco em OK.
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'F62-F65' });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, 0);
  await painelDaPorta(page);
  await caso(rel, 'F-62', async () => {
    // "0","1" + Backspace -> sobra "0"; depois "1","7" -> "017" + OK (Enter). Se o Backspace não apagar, sai "0117"/"011".
    await digitar(page, '01');
    await tecla(page, 'Backspace');
    await digitar(page, '17');
    await limparTextos(page);
    await tecla(page, 'Enter');
    await sleep(250);
    const t = await lerTextos(page);
    const abriu = juntar(t).includes(ABRIU);
    rel.caso('F-62', abriu ? 'OK' : 'FALHOU', `2 dígitos + Backspace (apaga o 2º) e "17" -> 017 confirma: abriu=${abriu}`);
  });
  await ctx.close();
}
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'F65' });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, 0);
  await painelDaPorta(page);
  await caso(rel, 'F-65', async () => {
    // Digitar 999, apagar tudo com Backspace (3x), digitar 017, Enter com foco em OK (não mexido).
    await digitar(page, '999');
    for (let k = 0; k < 3; k++) await tecla(page, 'Backspace');
    const foco = teclaDoBbox(await bboxDestaque(page));
    await digitar(page, '017');
    await limparTextos(page);
    await tecla(page, 'Enter');
    await sleep(250);
    const abriu = juntar(await lerTextos(page)).includes(ABRIU);
    rel.caso('F-65', abriu && foco === 'OK' ? 'OK' : 'FALHOU', `apagar tudo (foco em ${foco}) e digitar 017 + Enter: abriu=${abriu}`);
  });
  await ctx.close();
}

// F-70: depois de abrir, voltar da sala ao hall e examinar a porta: não pede código de novo.
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'F70' });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, 0);
  await painelDaPorta(page);
  await digitar(page, '017');
  await tecla(page, 'Enter');
  await sleep(250);
  await tecla(page, 'z'); // fecha "Clique!"
  await sleep(350);
  await tecla(page, 'z'); // fecha "Está tudo escuro!"
  await sleep(350);
  // Sala -> hall pela porta aberta (Esq. 1,6 s) e de volta à sala atravessando a porta (Dir. 1,6 s).
  await segurar(page, 'ArrowLeft', 1600);
  await sleep(150);
  await limparTextos(page);
  await segurar(page, 'ArrowRight', 1600);
  await sleep(300);
  const t = await lerTextos(page);
  const pediu = juntar(t).includes(PERGUNTA);
  const escuroDeNovo = juntar(t).includes('Está tudo escuro');
  rel.caso('F-70', !pediu ? 'OK' : 'FALHOU', `porta aberta: atravessar nos dois sentidos sem pedir código (pede=${pediu}); diálogo "escuro" não repete=${!escuroDeNovo}`);
  await ctx.close();
}

// F-83 e F-91: cada abertura do painel começa com foco em OK, sem dígitos do uso anterior (10 ciclos Esc + Z).
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'F83-F91' });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, 0);
  await painelDaPorta(page);
  await digitar(page, '12');
  const focos = [];
  for (let k = 0; k < 10; k++) {
    await tecla(page, 'Escape');
    await sleep(260);
    await tecla(page, 'z');
    await sleep(250);
    focos.push(teclaDoBbox(await bboxDestaque(page)));
    if (k < 9) await tecla(page, 'Escape'); // fecha de novo (o ciclo seguinte reabre)
    await sleep(260);
    if (k < 9) await tecla(page, 'z');
    await sleep(250);
  }
  rel.caso('F-91', focos.every((f) => f === 'OK') ? 'OK' : 'FALHOU', `10 aberturas (Esc + Z): foco inicial em OK em todas = ${focos.every((f) => f === 'OK')} (${focos.join(',')})`);
  rel.caso('F-83', focos.slice(0, 3).every((f) => f === 'OK') ? 'OK' : 'FALHOU', 'as 3 primeiras aberturas com Esc entre elas: foco em OK');
  await ctx.close();
}

await browser.close();
if (srv) srv.close();
rel.salvar();
