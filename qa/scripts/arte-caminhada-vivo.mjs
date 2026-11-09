// OBSOLETO (rodada 14, 2026-11-08): coordenadas da planta antiga, antes da rotação (GDD 14.12.3). Não usar sem atualizar para content/maps/casa-real/*.json. Ver marco1-r13-vivo.mjs e marco1-r14-sobrinhos.mjs.
// QA Marco 1.3 (arte): capturas dos 4 Sobrinhos no hall, parado e andando nos 4 lados (build de QA). Um por vez.
import { lancar, novoContexto, capturar } from './lib.mjs';
import { irAteHall, tecla, sleep } from './lib.mjs';
import { estado } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(join(AQUI, '..', '..', 'dist-qa', 'index.html')).href;
const NOMES = ['lolo', 'bibi', 'dandan', 'tutu'];
const browser = await lancar();
const erros = [];
for (let i = 0; i < 4; i++) {
  const ctx = await novoContexto(browser, { url, origem: url, rotulo: `arte-${NOMES[i]}` });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => erros.push(`${NOMES[i]}: ${e.message}`));
  await page.goto(url);
  await sleep(2000);
  await irAteHall(page, i);
  await sleep(300);
  await capturar(page, `arte-${NOMES[i]}-parado`, 3);
  for (const [nome, k] of [['baixo', 'ArrowDown'], ['cima', 'ArrowUp'], ['esquerda', 'ArrowLeft'], ['direita', 'ArrowRight']]) {
    await page.keyboard.down(k); await sleep(260);
    await capturar(page, `arte-${NOMES[i]}-andar-${nome}`, 3);
    await page.keyboard.up(k); await sleep(200);
  }
  const e = await estado(page);
  console.log(NOMES[i], 'ultimo estado', JSON.stringify({ mapa: e?.mapa, t: [e?.tileX, e?.tileY], dir: e?.direcao }));
  await ctx.close();
}
console.log('erros de página:', erros.length, erros.slice(0, 3).join(' | '));
await browser.close(); process.exit(0);
