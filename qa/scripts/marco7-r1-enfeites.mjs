// Marco 7 (0.13.0), rodada 1: enfeites no modo explorar por cômodo (gancho `enfeites()`: total, visíveis, piscando) e pisca (EN3). Só observa.
import { lancar, novoContexto, abrirJogo, tecla, sleep } from './lib.mjs';
import { estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco7-r1');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'enf' });
const p = await abrirJogo(c, url);
const est = async () => { try { return await estado(p); } catch { return null; } };
await tecla(p, 'KeyZ', { ms: 90, pausa: 400 });
await p.evaluate(() => window.__partidaConcluida('lolo', false));
await p.evaluate(() => window.__irPara('Fim', {})); await sleep(3000);
await tecla(p, 'KeyZ', { ms: 90, pausa: 900 }); await tecla(p, 'ArrowDown', { ms: 90, pausa: 400 }); await tecla(p, 'KeyZ', { ms: 90, pausa: 1500 });
const contagem = async (m, s) => { await p.evaluate(([a, sp]) => window.__teleportar(a, sp), [m, s]); await sleep(700); const q = await est(); return q?.enfeites ?? q; };
const res = [];
for (const [m, s] of [['hall', 'P8'], ['sala', 'P8'], ['cozinha', 'P7'], ['quarto', 'P2'], ['escritorio', 'P3']]) {
  const q = await contagem(m, s);
  res.push(`${m}: ${JSON.stringify(q)?.slice(0, 120)}`);
  await p.screenshot({ path: join(EVID, `enfeites-${m}.png`) });
}
console.log(res.join('\n'));
await p.evaluate(([a, sp]) => window.__teleportar(a, sp), ['sala', 'P8']); await sleep(700);
const q = []; for (let i = 0; i < 120; i++) { const e = await est(); q.push(e?.enfeites?.quadro ?? -1); await sleep(50); }
let tog = 0; for (let i = 1; i < q.length; i++) if (q[i] !== q[i - 1]) tog++;
console.log(`${tog / 2 <= 1.5 ? 'OK   ' : 'FALHA'} EN3 pisca dos enfeites (Sala, 6 s): trocas de quadro=${tog} => ${(tog / 2 / 6).toFixed(2)} ciclos/s (limite 1 Hz; ciclo = 2 trocas)`);
const e = await est();
console.log('enfeites no estado (chave):', JSON.stringify(e?.enfeites)?.slice(0, 200), 'keys', Object.keys(e ?? {}).join(','));
await c.close(); await b.close();
