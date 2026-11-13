// Diagnóstico: __irPara('Fim') e __partidaConcluida + __irPara('Casa') — que cena fica ativa. Só observa.
import { lancar, novoContexto, abrirJogo, sleep } from './lib.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'd' });
const p = await abrirJogo(c, url);
const nomes = () => p.evaluate(() => window.__alvosDeToque().map((a) => a.nome).slice(0, 6).join(','));
await p.evaluate(() => { try { window.__irPara('Fim', {}); } catch (e) { window.__err = String(e); } });
await sleep(3000);
console.log('após __irPara(Fim):', await nomes(), 'err=', await p.evaluate(() => window.__err ?? null));
await p.evaluate(() => { window.__partidaConcluida('lolo', true); window.__irPara('Casa', {}); });
await sleep(2500);
console.log('após partidaConcluida+irPara(Casa):', await nomes(), 'estado mapa:', JSON.stringify(await p.evaluate(() => window.__estado()?.mapa)));
await c.close(); await b.close();
