// QA Marco 1.1, item 016: diálogo de orientação no hall (GDD 14.9.1). Playtest por file://.
// Uso: node qa/scripts/marco11-016.mjs
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ, abrirJogo, contemFrase, dialogoAberto, irAteHall, juntar, lancar, lerTextos, novoContexto, tecla, sleep } from './lib.mjs';

const url = pathToFileURL(join(RAIZ, 'dist-playtest', 'index.html')).href;
const browser = await lancar();
const saida = {};
try {
  // Caso 1: Z avança, Z fecha, controle no hall; 2 páginas com texto exato.
  let ctx = await novoContexto(browser, { url, rotulo: 'c1' });
  let page = await abrirJogo(ctx, url);
  await irAteHall(page, 0);
  const l1 = await lerTextos(page);
  saida.p1_texto_exato = contemFrase(l1, 'Vamos montar a árvore de Natal, LoLô!');
  saida.p1_barra = contemFrase(l1, 'Z: avançar X: fechar');
  saida.p1_aberto = await dialogoAberto(page);
  await tecla(page, 'z');
  const l2 = await lerTextos(page);
  saida.p2_texto_exato = contemFrase(l2, 'Abra a porta. Há um bilhete perto dela, com a dica.');
  saida.p2_barra = contemFrase(l2, 'Z: avançar X: fechar');
  saida.p2_textos = l2.map((x) => x.t).slice(-8);
  await (await import('node:fs')).promises.mkdir(join(RAIZ, 'qa', 'evidencias', 'marco11'), { recursive: true });
  await page.screenshot({ path: join(RAIZ, 'qa', 'evidencias', 'marco11', '016-orientacao-p2.png') });
  await tecla(page, 'z');
  await sleep(400);
  saida.apos_z_fecha = !(await dialogoAberto(page));
  await ctx.close();

  // Caso 2: X na primeira página fecha tudo e dá o controle.
  ctx = await novoContexto(browser, { url, rotulo: 'c2' });
  page = await abrirJogo(ctx, url);
  await irAteHall(page, 1);
  const lb = await lerTextos(page);
  saida.bibi_p1_texto_exato = contemFrase(lb, 'Vamos montar a árvore de Natal, BiBi!');
  await tecla(page, 'x');
  await sleep(400);
  saida.x_fecha_p1 = !(await dialogoAberto(page));
  await ctx.close();
} catch (e) {
  saida.erro = String(e && e.message ? e.message : e);
} finally {
  await browser.close();
}
console.log(JSON.stringify(saida, null, 2));
