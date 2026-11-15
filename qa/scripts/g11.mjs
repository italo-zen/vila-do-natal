// QA: G-11 (fade das luzes ~0,5 s), medido por pixel fora do círculo de luz, com amostras rápidas.
import { join } from 'node:path';
import { CODIGOS, NOMES, RAIZ, abrirJogo, criarRelatorio, digitar, irAteBilhete, irAteHall, lancar, lerTextos, limparTextos, novoContexto, pixel, segurar, servirPasta, sleep, tecla } from './lib.mjs';
const { srv, url, origem } = await servirPasta(join(RAIZ, 'dist'));
const rel = criarRelatorio('g11-dist');
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem, rotulo: 'G11' });
const page = await abrirJogo(ctx, url);
await irAteHall(page, 0);
await irAteBilhete(page);
await tecla(page, 'x');
await tecla(page, 'ArrowRight', { ms: 60 });
await tecla(page, 'z');
await sleep(250);
await digitar(page, CODIGOS[NOMES[0]]);
await tecla(page, 'Enter');
await sleep(250);
await tecla(page, 'z');
await sleep(350);
await tecla(page, 'z'); // fecha "escuro"
await sleep(300);
await segurar(page, 'ArrowUp', 500);
await segurar(page, 'ArrowRight', 3300);
await tecla(page, 'z'); // "Clique!" aberto
await sleep(200);
const antes = await pixel(page, 120, 60);
await page.keyboard.down('z'); await sleep(40); await page.keyboard.up('z');
const seq = [antes[0] + antes[1] + antes[2]];
for (let k = 0; k < 4; k++) { await sleep(40); const p = await pixel(page, 120, 60); seq.push(p[0] + p[1] + p[2]); }
rel.dado('brilho antes e depois do Z (ponto longe)', seq);
rel.caso('G-11', seq[seq.length - 1] > seq[0] + 40 ? 'OK' : 'FALHOU', `brilho ${seq.join(' -> ')} nas amostras do fade`);
await browser.close(); srv.close(); rel.salvar();
