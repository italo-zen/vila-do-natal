// QA Marco 1.1, rodada 2: 016 (DanDan e TuTu), 019 (Como jogar por teclado; "Começar" por mouse). Playtest por file://.
// Uso: node qa/scripts/marco11-r2.mjs
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ, abrirJogo, contemFrase, irAteHall, lancar, lerTextos, novoContexto, tecla, sleep } from './lib.mjs';

const url = pathToFileURL(join(RAIZ, 'dist-playtest', 'index.html')).href;
const browser = await lancar();
const saida = {};
try {
  for (const [i, nome] of [[2, 'DanDan'], [3, 'TuTu']]) {
    const ctx = await novoContexto(browser, { url, rotulo: nome });
    const page = await abrirJogo(ctx, url);
    await irAteHall(page, i);
    const l = await lerTextos(page);
    saida[`${nome}_texto_exato`] = contemFrase(l, `Vamos montar a árvore de Natal, ${nome}!`);
    saida[`${nome}_p2`] = contemFrase(await lerTextos(page), 'Abra a porta. Há um bilhete perto dela, com a dica.');
    await ctx.close();
  }

  // 019: Como jogar por teclado (seta para baixo, Z) e volta a Começar; mouse em "Começar" leva à seleção.
  let ctx = await novoContexto(browser, { url, rotulo: 'comojogar' });
  let page = await abrirJogo(ctx, url);
  await tecla(page, 'ArrowDown');
  await tecla(page, 'z');
  await sleep(300);
  const cj = await lerTextos(page);
  saida.comojogar_voltar = contemFrase(cj, 'Voltar');
  await page.screenshot({ path: join(RAIZ, 'qa', 'evidencias', 'marco11', '019-como-jogar.png') });
  await tecla(page, 'z'); // Voltar
  await sleep(300);
  await ctx.close();

  ctx = await novoContexto(browser, { url, rotulo: 'mouse' });
  page = await abrirJogo(ctx, url);
  const box = await page.locator('canvas').first().boundingBox();
  await page.mouse.click(box.x + (480 / 960) * box.width, box.y + (430 / 640) * box.height);
  await sleep(500);
  const ml = await lerTextos(page);
  saida.mouse_comecar_leva_selecao = contemFrase(ml, 'Quem vai jogar?');
  await ctx.close();
} catch (e) {
  saida.erro = String(e && e.message ? e.message : e);
} finally {
  await browser.close();
}
console.log(JSON.stringify(saida, null, 2));
