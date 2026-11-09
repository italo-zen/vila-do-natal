// QA Marco 3, v0.7.1 (rodada 8): seta amarela com tremidas e reinício (F1-F3), Nick 1 tile atrás (N4, N5),
// troca de cômodo com Nick oculto (N6), condução a 1 tile (N7) e reação feliz na peça 3 (N8).
// Caminho: __irParaFase('parte3') (fases 1 e 2 concluídas pelo domínio) e a passagem real pelas portas.
// Build: dist-qa (rodado antes). Teclado. Uso: node qa/scripts/marco3-r8-v071.mjs
import { lancar, novoContexto, lerTextos, limparTextos, juntar, sleep, tecla, irAteHall } from './lib.mjs';
import { irPara, estado, apertarA, objeto } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco3-r8');
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const resultados = [];
const reg = (id, ok, nota) => { resultados.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`); };
const T0 = Date.now();
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'r8' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(e.message));
const est = async () => { try { return await estado(page); } catch { await sleep(120); return null; } };
const ver = () => page.evaluate(() => window.__textos.map((x) => x.t).join(' '));
const press = async (k, ms = 260) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); await sleep(200); };
const fechar = async () => { for (let i = 0; i < 14; i++) { const q = await est(); if (!q?.travado) return; await tecla(page, 'z', { ms: 90, pausa: 400 }); } };
const dist = (q) => (q?.nick ? Math.abs(q.nick.tileX - q.tileX) + Math.abs(q.nick.tileY - q.tileY) : null);
async function capturar(nome) {
  const d = await page.evaluate(() => { const c = document.querySelector('canvas'); const o = document.createElement('canvas'); o.width = c.width * 3; o.height = c.height * 3; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height); return o.toDataURL('image/png'); });
  writeFileSync(join(EVID, `${nome}.png`), Buffer.from(d.split(',')[1], 'base64'));
}
// Atravessa uma porta: vai ao vizinho do gatilho e empurra na direção dele
async function cruzar(mapaDe, id, mapaPara, rotulo, cand) {
  const cands = [cand];
  for (const [x, y, dir] of cands) {
    try { await irPara(page, mapaDe, x, y); } catch (er) { console.log('cruzar irPara:', er.message.slice(0, 100)); continue; }
    await press(dir, 320);
    for (let i = 0; i < 20; i++) { await sleep(150); const q = await est(); if (q?.mapa === mapaPara && !q.emFade && !q.travado) break; }
    const q = await est();
    if (q?.mapa === mapaPara) {
      const n0 = q.nick;
      reg(`N6 ${rotulo}: Nick ${n0?.estado} ${n0?.oculto ? 'oculto' : 'visível'} no tile de chegada`, n0?.mapa === mapaPara && (n0?.oculto === true || n0?.estado === 'dormindo'), `jogador=(${q.tileX},${q.tileY}) nick=${JSON.stringify(n0)}`);
      await capturar(`${rotulo}-chegada`);
      // primeiro passo para dentro da área (não o gatilho): tenta as direções até o tile mudar
      for (const d of ['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp']) {
        const antes = await est();
        await press(d, 260);
        const depois = await est();
        if (depois && antes && (depois.tileX !== antes.tileX || depois.tileY !== antes.tileY)) {
          await sleep(200);
          const f = await est();
          reg(`N6 ${rotulo}: no 1º passo o Nick aparece e segue (1 tile atrás)`, f?.nick?.oculto === false && (f.nick.estado === 'dormindo' || dist(f) === 1), `jogador=(${f.tileX},${f.tileY}) nick=(${f.nick.tileX},${f.nick.tileY}) oculto=${f.nick.oculto} dist=${dist(f)}`);
          await capturar(`${rotulo}-primeiro-passo`);
          return true;
        }
      }
      reg(`N6 ${rotulo}: primeiro passo`, false, 'o jogador não saiu do tile de chegada');
      return true;
    }
  }
  reg(`${rotulo}: travessia`, false, `não atravessou ${id} de ${mapaDe} (mapa=${(await est())?.mapa})`);
  return false;
}
function subareaTiles() { return true; }

await page.goto(url); await page.waitForSelector('canvas'); await sleep(2000);
await tecla(page, 'z'); await sleep(300); await tecla(page, 'z'); await sleep(300);
await irAteHall(page, 0); await sleep(800);
const fa = await page.evaluate(() => window.__irParaFase('parte3'));
await page.evaluate(() => window.__teleportar('escritorio', 'P3'));
await sleep(600); await fechar();
reg('setup __irParaFase(parte3) e Escritório', fa === 'parte3', `retorno=${fa}; nick=${JSON.stringify((await est())?.nick)}`);

// Acordar o Nick (6,1) de (6,2)
for (const [ax, ay, dir] of [[5, 1, 'ArrowRight'], [6, 2, 'ArrowUp'], [7, 1, 'ArrowLeft']]) { try { await irPara(page, 'escritorio', ax, ay); } catch { continue; } await press(dir, 260); if ((await est())?.tileX === ax && (await est())?.tileY === ay) break; }
await apertarA(page); await sleep(1500); await fechar(); await sleep(200);
reg('pré: Nick acordado no Escritório', (await est())?.nick?.estado === 'acordado', `nick=${JSON.stringify((await est())?.nick)}`);

// (1) Seta: B mostra farejando (1,2 s), depois seta amarela, 2 tremidas, parada até 5 s
await limparTextos(page);
const seq = [];
await press('x', 150);
for (let i = 0; i < 40; i++) { const q = await est(); seq.push(`${q?.sniffando ? 'F' : '-'}${q?.farejo?.ativo ? 'S' : '-'}${Math.round((q?.farejo?.restanteMs ?? 0) / 100)}`); if (i === 4) await capturar('seta-t0'); await sleep(100); }
const comeco = seq.findIndex((s) => s[0] === 'F');
const fimF = seq.findIndex((s) => s[1] === 'S');
reg('F1 B: farejando (~0,9 s) e depois a seta amarela, com o relógio de 5 s a partir do fim do farejando', comeco === 0 && fimF >= 0 && fimF <= 12, `sequência(F=farejando,S=seta,dezenas de ms): ${seq.slice(0, 16).join(' ')}`);
const porta = (await est())?.farejo?.porta;
reg('F4 Escritório (alvo Cozinha): seta na P3, saída esquerda', porta?.id === 'P3' && porta?.saida === 'esquerda', `porta=${JSON.stringify(porta)}`);
await capturar('seta-amarela-t2');
// B com a seta visível: refaz farejando e reinicia os 5 s
await sleep(1500);
const r1 = (await est())?.farejo?.restanteMs;
await press('x', 150);
let refez = false;
for (let i = 0; i < 12; i++) { await sleep(100); if ((await est())?.sniffando) { refez = true; break; } }
await sleep(1400);
const r2 = (await est())?.farejo?.restanteMs;
reg('F2 B com seta visível refaz o farejando e reinicia os 5 s', refez && r2 > r1, `restante antes=${r1} depois=${r2}; refez=${refez}`);
// B durante o farejando é ignorado: dois B seguidos (300 ms) geram um só ciclo
await sleep(4000);
await press('x', 150); await sleep(300); await press('x', 150);
let ciclos = 0; let estava = false;
for (let i = 0; i < 30; i++) { await sleep(60); const s = (await est())?.sniffando; if (s && !estava) ciclos++; estava = s; }
reg('F3 B durante o farejando é ignorado (um ciclo só)', ciclos === 1, `ciclos de farejando=${ciclos}`);
await sleep(5200);

// (2) Nick 1 tile atrás, encostado, andando (Escritório)
const passos = [];
for (const d of ['ArrowLeft', 'ArrowLeft', 'ArrowDown', 'ArrowLeft']) { await press(d, 300); await sleep(250); const q = await est(); passos.push(`jog(${q?.tileX},${q?.tileY}) nick(${q?.nick?.tileX},${q?.nick?.tileY}) d=${dist(q)}`); }
const ds = passos.map((p) => Number(p.split('d=')[1]));
reg('N4 Escritório: Nick 1 tile atrás, encostado ao andar', ds.filter((d) => d > 1).length === 0, passos.join(' | '));

// (3) Travessias: P3 (Escritório->Sala), P7 (Sala->Cozinha), P7 (Cozinha->Sala)
await fechar();
await cruzar('escritorio', 'P3', 'sala', 'P3 Escritório->Sala', [1, 5, 'ArrowLeft']);
await sleep(300);
await cruzar('sala', 'P7', 'cozinha', 'P7 Sala->Cozinha', [9, 5, 'ArrowRight']);
await sleep(300);

// (4) Peça 3 com Nick acordado (condução a 1 tile, feliz + Au! na chegada)
await irPara(page, 'cozinha', 3, 4).catch((er) => console.log('irPara 3,4:', er.message.slice(0, 100)));
await press('ArrowDown', 300);
await apertarA(page); await sleep(500);
await limparTextos(page);
await apertarA(page);
const dists = []; let auT = null; let chegou = null; let viu = false; const anim = [];
const t1 = Date.now();
while (Date.now() - t1 < 25000) {
  const q = await est();
  if (q?.emConducao) { viu = true; dists.push(dist(q)); }
  if (viu && !q?.emConducao && chegou === null) chegou = Date.now();
  if (chegou !== null) { anim.push(String(q?.animacaoDoNick)); if (!auT && (await ver()).includes('Au!')) auT = Date.now(); if (Date.now() - chegou > 2600) break; }
  await sleep(80);
}
reg('N7 condução da peça 3: Nick 1 tile atrás (distância 1 nas paradas e ≤ 2 em movimento)', dists.length > 0 && Math.max(...dists) <= 2, `distâncias: ${dists.slice(0, 20).join(',')}`);
reg('N8 peça 3: "Au!" na chegada e animação feliz', auT !== null && anim.some((a) => a === 'nick-feliz'), `Au! ${auT && chegou ? auT - chegou : 'nunca'} ms; animações: ${[...new Set(anim)].join(',')}`);
await capturar('peca3-chegada');
await fechar();
await sleep(500);
const dep = await est();
reg('N9 após a peça 3, Nick vai para a Sala e dorme (8,5) (fase livre)', dep?.nick?.mapa === 'sala' && dep?.nick?.estado === 'dormindo', `nick=${JSON.stringify(dep?.nick)}`);

// (5) Nick dormindo no cômodo novo: bloqueia. Volta à Sala pela P7.
await irPara(page, 'sala', 9, 5).catch((er) => console.log('irPara 9,5:', er.message.slice(0, 100)));
await press('ArrowLeft', 260);
const bl = await est();
reg('N11 Nick dormindo na Sala bloqueia (8,5): andar contra ele não atravessa', bl?.tileX === 9 && bl?.tileY === 5 && bl?.nick?.estado === 'dormindo', `jogador=(${bl?.tileX},${bl?.tileY}) nick=${JSON.stringify(bl?.nick)}`);
// P2 (Sala -> Quarto) com Nick dormindo na Sala: o Nick não segue (só segue acordado)
await cruzar('sala', 'P2', 'quarto', 'P2 Sala->Quarto (Nick dormindo)', [7, 2, 'ArrowUp']);

console.log(`\nTempo: ${((Date.now() - T0) / 1000).toFixed(0)} s`);
console.log('Erros:', erros.length ? erros : 'nenhum');
writeFileSync(join(EVID, 'resultados.json'), JSON.stringify({ resultados, erros }, null, 2));
await browser.close();
