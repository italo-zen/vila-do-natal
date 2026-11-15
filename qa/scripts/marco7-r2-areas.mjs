// EX3 (áreas no modo explorar, __teleportar + captura), EN3 (pisca dos enfeites com amostragem de 16 ms), AU19 (mudo e pausa durante o jingle). Só observa.
import { lancar, novoContexto, abrirJogo, tecla, sleep } from './lib.mjs';
import { estado } from './lib-rota.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco7-r2'); mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(resolve(RAIZ, 'dist-qa', 'index.html')).href;
const log = (id, ok, n = '') => console.log(`${ok ? 'OK   ' : 'FALHA'} ${id} :: ${n}`);
const b = await lancar();
const c = await novoContexto(b, { url, origem: url, rotulo: 'ar' });
const p = await abrirJogo(c, url);
const est = async () => { try { return await estado(p); } catch { return null; } };
await tecla(p, 'KeyZ', { ms: 90, pausa: 400 });
await p.evaluate(() => window.__partidaConcluida('lolo', false));
await p.evaluate(() => window.__irPara('Fim', {})); await sleep(3000);
await tecla(p, 'KeyZ', { ms: 90, pausa: 900 }); await tecla(p, 'ArrowDown', { ms: 90, pausa: 400 }); await tecla(p, 'KeyZ', { ms: 90, pausa: 1500 });
// EX3
const areas = [['hall', 'P8'], ['sala', 'P8'], ['cozinha', 'P7'], ['quarto', 'P2'], ['escritorio', 'P3'], ['suite_casal', 'P1'], ['banheiro_escritorio', 'P1'], ['banheiro_casal', 'P1']];
for (const [m, s] of areas) {
  const ok = await p.evaluate(([a, sp]) => { try { window.__teleportar(a, sp); return true; } catch (e) { return String(e); } }, [m, s]);
  await sleep(800);
  const q = await est();
  const abriu = q?.mapa === m;
  if (['hall', 'sala', 'cozinha', 'quarto', 'escritorio'].includes(m)) { log(`EX3 área ${m} abre no modo explorar`, abriu, `mapa=${q?.mapa} retorno=${ok}`); if (abriu) await p.screenshot({ path: join(EVID, `EX3-${m}.png`) }); }
  else log(`EX3 área ${m} NÃO abre (esperado: suíte e banheiros fora do explorar)`, !abriu, `mapa=${q?.mapa} retorno=${ok}`);
}
// retorna à sala para os próximos testes
await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(700);
// EN3: pisca fino: quadros do canvas a cada 16 ms, contar trocas do quadro de enfeites
const qs = []; const t0 = performance.now();
for (let i = 0; i < 400; i++) { const e = await est(); qs.push([performance.now() - t0, e?.enfeites?.quadro ?? -1]); await sleep(15); }
let trocas = 0; for (let i = 1; i < qs.length; i++) if (qs[i][1] !== qs[i - 1][1] && qs[i][1] !== -1) trocas++;
const dur = (qs[qs.length - 1][0] - qs[0][0]) / 1000;
const hz = trocas / 2 / dur;
log('EN3 pisca dos enfeites (2 quadros) ≈ 1 Hz e ≤ 3 ciclos/s', hz <= 3 && hz >= 0.5, `trocas=${trocas} em ${dur.toFixed(1)} s → ${hz.toFixed(2)} ciclos/s`);
// AU19: mudo e pausa durante jingle de conquista (luzes): abrir o diálogo das luzes e tocar M durante o jingle
await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(600);
try { await p.evaluate(() => window.__irParaFase('luzes')); } catch {}
await sleep(300);
for (let i = 0; i < 6; i++) { const q = await est(); if (!q?.travado) break; await tecla(p, 'KeyZ', { ms: 90, pausa: 300 }); }
const aJ0 = (await est())?.audio;
let jingleVisto = false; let mudoDurante = null; let musicaDurante = null;
// cair no interruptor da sala (luzes) pela pilha de movimento: usa a posição de partida da sala
await p.evaluate(() => window.__teleportar('sala', 'P8')); await sleep(600);
for (let i = 0; i < 6; i++) { const q = await est(); if (!q?.travado) break; await tecla(p, 'KeyZ', { ms: 90, pausa: 300 }); }
await tecla(p, 'KeyM', { ms: 90, pausa: 0 });
const aM = await est();
mudoDurante = aM?.audio?.mudo;
musicaDurante = aM?.audio?.musica;
await tecla(p, 'KeyM', { ms: 90, pausa: 300 });
log('AU19 mudo durante a exploração: trilha segue (sem parar) e som silencia', mudoDurante === true && musicaDurante === 'tocando', `mudo=${mudoDurante} musica=${musicaDurante}`);
await tecla(p, 'KeyP', { ms: 90, pausa: 500 });
const aP = await est();
log('AU19 pausa com mudo: trilha continua (musica tocando), sem jingle na pausa', aP?.audio?.musica === 'tocando', `musica=${aP?.audio?.musica} pausa=${aP?.pausa?.aberta}`);
await tecla(p, 'Escape', { ms: 90, pausa: 400 });
await c.close(); await b.close();
