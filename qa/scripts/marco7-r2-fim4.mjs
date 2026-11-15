// FI2: captura da tela de fim com cada um dos 4 sobrinhos (um de cada vez), e TI2: título desenhado com a imagem bloqueada. Só observa.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { lancar, novoContexto, abrirJogo, tecla, sleep } from './lib.mjs';
import { estado } from './lib-rota.mjs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco7-r2'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const log = (id, ok, n = '') => console.log(`${ok ? 'OK   ' : 'FALHA'} ${id} :: ${n}`);
const b = await lancar();
for (const pers of ['lolo', 'bibi', 'dandan', 'tutu']) {
  const c = await novoContexto(b, { url, origem: url, rotulo: pers });
  const p = await abrirJogo(c, url);
  await tecla(p, 'KeyZ', { ms: 90, pausa: 400 });
  await p.evaluate((pe) => window.__partidaConcluida(pe, false), pers);
  await p.evaluate(() => window.__irPara('Fim', {})); await sleep(3500);
  await p.screenshot({ path: join(EVID, `FI2-fim-${pers}.png`) });
  log(`FI2 tela de fim com ${pers} (captura)`, true, 'conferir os 4 rostos e o corte em FI2-fim-*.png');
  await c.close();
}
// TI2: se a imagem do título estiver embutida, o bloqueio de rede não a afeta: registrar
const emb = await (await import('node:fs')).readFileSync(join(RAIZ, 'dist-qa', 'index.html'), 'utf8').match(/data:image\/(webp|png)/g);
log('TI2 imagem do título embutida no HTML (bloqueio de rede não se aplica)', false, `ocorrências de data:image no HTML: ${emb ? emb.length : 0}`);
await b.close();
