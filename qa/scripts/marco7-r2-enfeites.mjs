// EN2/EN4: A em cada enfeite examinável (Sala: luz (3,3), guirlanda (10,6), vela (10,7); Escritório: luz (6,2), meias (6,3)) e num enfeite não examinável. Captura por cômodo. Só observa.
import { lancar, novoContexto, abrirJogo, tecla, sleep, lerTextos } from './lib.mjs';
import { irPara, estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco7-r2'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'en' });
const p = await abrirJogo(c, url);
const est = async () => { try { return await estado(p); } catch { return null; } };
const T = async () => (await lerTextos(p)).map((t) => t.t).join(' ').replace(/\s+/g, ' ');
await tecla(p, 'KeyZ', { ms: 90, pausa: 400 });
await p.evaluate(() => window.__partidaConcluida('lolo', true)); await sleep(100);
await p.evaluate(() => window.__irPara('Fim', {})); await sleep(3000);
await tecla(p, 'KeyZ', { ms: 90, pausa: 900 }); await tecla(p, 'ArrowDown', { ms: 90, pausa: 400 }); await tecla(p, 'KeyZ', { ms: 90, pausa: 1500 });
const casos = [
  ['sala', 'P8', 3, 3, 'ArrowDown', 3, 2, 'luz (3,3)'],
  ['sala', 'P8', 10, 6, 'ArrowRight', 9, 6, 'guirlanda (10,6)'],
  ['sala', 'P8', 10, 7, 'ArrowRight', 9, 7, 'vela (10,7)'],
  ['sala', 'P8', 0, 0, 'ArrowUp', 0, 1, 'árvore pequena (0,0), não examinável'],
  ['escritorio', 'P3', 6, 2, 'ArrowRight', 5, 2, 'luz (6,2)'],
  ['escritorio', 'P3', 6, 3, 'ArrowRight', 5, 3, 'meias (6,3)'],
];
for (const [m, s, ex, ey, dir, px, py, nome] of casos) {
  await p.evaluate(([a, sp]) => window.__teleportar(a, sp), [m, s]); await sleep(700);
  try { await irPara(p, m, px, py); } catch (e) { console.log('rota', nome, e.message.slice(0, 60)); }
  await tecla(p, dir, { ms: 90, pausa: 200 });
  await lerTextos(p);
  await tecla(p, 'KeyZ', { ms: 90, pausa: 500 });
  const t = await T();
  await p.screenshot({ path: join(EVID, `EN4-${m}-${ex}-${ey}.png`) });
  const resp = t.replace(/\s+/g, ' ').length > 0;
  const esperaTexto = !nome.includes('não examinável');
  console.log(`${esperaTexto ? (resp ? 'OK   ' : 'FALHA') : (resp ? 'FALHA' : 'OK   ')} EN4 ${m} ${nome}: ${esperaTexto ? 'responde ao A' : 'não responde'} :: "${t.slice(0, 90)}"`);
  for (let i = 0; i < 4; i++) { const q = await est(); if (!q?.travado) break; await tecla(p, 'KeyZ', { ms: 90, pausa: 300 }); }
}
await p.screenshot({ path: join(EVID, 'EN2-escritorio-final.png') });
await c.close(); await b.close();
