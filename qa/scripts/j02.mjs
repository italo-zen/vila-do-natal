// QA: J-02 (maiúsculas movem o cartão na seleção), medido pela borda amarela do cartão.
import { join } from 'node:path';
import { RAIZ, abrirJogo, cartaoFocado, criarRelatorio, lancar, novoContexto, servirPasta, tecla } from './lib.mjs';
const { srv, url, origem } = await servirPasta(join(RAIZ, 'dist'));
const rel = criarRelatorio('j02-dist');
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem, rotulo: 'J02' });
const page = await abrirJogo(ctx, url);
await tecla(page, 'z');
const a = await cartaoFocado(page);
await tecla(page, 'D');
await tecla(page, 'D');
const b = await cartaoFocado(page);
await tecla(page, 'A');
const c = await cartaoFocado(page);
rel.caso('J-02', a === 0 && b === 2 && c === 1 ? 'OK' : 'FALHOU', `D,D,A (maiúsculas): cartão ${a} -> ${b} -> ${c} (esperado 0 -> 2 -> 1)`);
await browser.close(); srv.close(); rel.salvar();
