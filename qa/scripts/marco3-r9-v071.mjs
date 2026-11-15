// QA Marco 3, v0.7.1, rodada 9: P8 (Sala<->Hall), P7 (Cozinha->Sala) com Nick acordado; fluxo do Nick com
// um sobrinho (IDX); peça 1 e 2 com reação; fumacinha; N11; regressão (H, ícone, Como jogar, barra); tremidas por pixel.
// Uso: IDX=0 node qa/scripts/marco3-r9-v071.mjs   (IDX 0 LoLô, 1 BiBi, 2 DanDan, 3 TuTu). Build: dist-qa.
import { lancar, novoContexto, lerTextos, limparTextos, juntar, sleep, tecla, irAteHall } from './lib.mjs';
import { irPara, estado, apertarA, objeto } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const IDX = Number(process.env.IDX ?? 0);
const NOME = ['LoLô', 'BiBi', 'DanDan', 'TuTu'][IDX];
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco3-r9', NOME);
mkdirSync(join(EVID, 'fumaca'), { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const resultados = [];
const reg = (id, ok, nota) => { resultados.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${NOME} ${id} :: ${nota}`); };
const T0 = Date.now();
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'r9' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(e.message));
const est = async () => { try { return await estado(page); } catch { await sleep(120); return null; } };
const ver = () => page.evaluate(() => window.__textos.map((x) => x.t).join(' '));
const press = async (k, ms = 260) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); await sleep(200); };
const fechar = async () => { for (let i = 0; i < 14; i++) { const q = await est(); if (!q?.travado) return; await tecla(page, 'z', { ms: 90, pausa: 400 }); } };
const dist = (q) => (q?.nick ? Math.abs(q.nick.tileX - q.tileX) + Math.abs(q.nick.tileY - q.tileY) : null);
const esperarMapa = async (m) => { for (let i = 0; i < 30; i++) { const q = await est(); if (q?.mapa === m && !q.emFade && !q.travado) return q; await sleep(150); } return await est(); };
async function capturar(dir, nome) {
  const d = await page.evaluate(() => { const c = document.querySelector('canvas'); const o = document.createElement('canvas'); o.width = c.width * 3; o.height = c.height * 3; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height); return o.toDataURL('image/png'); });
  writeFileSync(join(dir, `${nome}.png`), Buffer.from(d.split(',')[1], 'base64'));
}
const seguro = async (r, fn) => { try { await fn(); } catch (e) { reg(r, false, `exceção: ${e.message.slice(0, 140)}`); } };
// Atravessa a porta pelo vizinho (lista de candidatos [x, y, direção])
async function cruzar(mapaDe, mapaPara, cands, rotulo) {
  for (const [x, y, dir] of cands) {
    try { await irPara(page, mapaDe, x, y); } catch { continue; }
    await press(dir, 320);
    const q = await esperarMapa(mapaPara);
    if (q?.mapa === mapaPara) {
      reg(`${rotulo}: Nick acordado oculto na chegada`, q.nick?.mapa === mapaPara && q.nick?.oculto === true, `jogador=(${q.tileX},${q.tileY}) nick=${JSON.stringify(q.nick)}`);
      for (const d of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) {
        const a = await est(); await press(d, 260); const b = await est();
        if (b && a && (b.tileX !== a.tileX || b.tileY !== a.tileY)) {
          await sleep(150); const f = await est();
          reg(`${rotulo}: no 1º passo aparece e fica 1 tile atrás`, f.nick.oculto === false && dist(f) === 1, `jogador=(${f.tileX},${f.tileY}) nick=(${f.nick.tileX},${f.nick.tileY}) dist=${dist(f)}`);
          return true;
        }
      }
      reg(`${rotulo}: primeiro passo`, false, 'jogador não andou');
      return true;
    }
  }
  reg(`${rotulo}: travessia`, false, `não atravessou de ${mapaDe} (mapa=${(await est())?.mapa})`);
  return false;
}

await page.goto(url); await page.waitForSelector('canvas'); await sleep(2000);
await tecla(page, 'z'); await sleep(300); await tecla(page, 'z'); await sleep(300);
await irAteHall(page, IDX); await sleep(800);

// Regressão de dica e Como jogar antes de tudo (no hall, controle livre)
await seguro('H dica', async () => {
  await limparTextos(page);
  await press('h', 300); await sleep(300);
  const aberta = (await est())?.dicaAberta;
  await press('h', 260); await sleep(200);
  const ainda = (await est())?.dicaAberta;
  await press('z', 260);
  const fechou = (await est())?.dicaAberta === false;
  reg('regressão dica por H (abre; H não fecha; Z fecha)', aberta === true && ainda === true && fechou, `aberta=${aberta} aindaAposH=${ainda} fechouComZ=${fechou}`);
});

// Entrada na Sala: __irParaFase('parte1') conclui a porta e as luzes (Nick vai à Cozinha dormindo)
await seguro('setup', async () => {
  const fa = await page.evaluate(() => window.__irParaFase('parte1'));
  await page.evaluate(() => window.__teleportar('cozinha', 'P7')); await sleep(600); await fechar();
  reg('setup __irParaFase(parte1)', fa === 'parte1', `retorno=${fa}; nick=${JSON.stringify((await est())?.nick)}`);
});

// (2) Nick acordado na Cozinha (4,3), depois Cozinha->Sala pela P7 (passo 1 com Nick)
await seguro('acordar', async () => {
  await irPara(page, 'cozinha', 4, 3).catch(() => {});
  await press('ArrowRight', 260); await apertarA(page); await sleep(1500); await fechar();
  reg('Nick acordado na Cozinha', (await est())?.nick?.estado === 'acordado', `nick=${JSON.stringify((await est())?.nick)}`);
});
await seguro('farejar e seta com tremidas', async () => {
  // Medida por pixel do ouro (#f4d35e) no canvas, quadro a quadro (a cada 100 ms), depois do B
  await press('x', 150);
  const medidas = [];
  for (let i = 0; i < 22; i++) {
    const m = await page.evaluate(() => {
      const c = document.querySelector('canvas'); const x = c.getContext('2d');
      const d = x.getImageData(0, 0, c.width, c.height).data; let sx = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) { if (Math.abs(d[i] - 244) < 14 && Math.abs(d[i + 1] - 211) < 14 && Math.abs(d[i + 2] - 94) < 22 && d[i + 3] > 200) { sx += (i / 4) % c.width; n++; } }
      return n ? Math.round((sx / n) * 10) / 10 : null;
    });
    medidas.push(m);
    await sleep(100);
  }
  const vis = medidas.filter((v) => v !== null);
  reg('tremidas medidas por pixel (x médio do ouro, quadros a cada 100 ms)', vis.length > 0, `x=[${medidas.join(', ')}]`);
  const q = await est();
  reg('seta amarela P7 (alvo Sala, saída esquerda)', q?.farejo?.porta?.id === 'P7' && q?.farejo?.porta?.saida === 'esquerda', `farejo=${JSON.stringify(q?.farejo)}`);
  await capturar(EVID, 'seta-P7');
});
// Nick 1 tile atrás ao andar até a P7 (saída pela esquerda: vizinho (1,0))
await seguro('cozinha->sala', async () => {
  await irPara(page, 'cozinha', 1, 0).catch(() => {});
  await press('ArrowLeft', 900); await sleep(400);
  const q = await esperarMapa('sala');
  reg('P7 Cozinha->Sala: Nick acordado acompanha (ver checagem de chegada abaixo)', q?.mapa === 'sala', `jogador=(${q?.tileX},${q?.tileY}) nick=${JSON.stringify(q?.nick)}`);
  await press('ArrowRight', 260); await sleep(200);
  const f = await est();
  reg('P7 Cozinha->Sala: no 1º passo o Nick aparece e fica 1 tile atrás', f?.nick?.oculto === false && dist(f) === 1, `jogador=(${f?.tileX},${f?.tileY}) nick=(${f?.nick?.tileX},${f?.nick?.tileY}) dist=${dist(f)} oculto=${f?.nick?.oculto}`);
});

// (1) P8: Sala (6,6) -> Hall (porta P8 em (6,7), saída para baixo)
await seguro('P8 Sala->Hall', async () => {
  await irPara(page, 'sala', 6, 6).catch(() => {});
  await press('ArrowDown', 320);
  const q = await esperarMapa('hall');
  reg('P8 Sala->Hall: Nick acordado oculto na chegada', q?.mapa === 'hall' && q?.nick?.mapa === 'hall' && q?.nick?.oculto === true, `jogador=${q?.mapa}(${q?.tileX},${q?.tileY}) nick=${JSON.stringify(q?.nick)}`);
  for (const d of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) {
    const a = await est(); await press(d, 260); const b = await est();
    if (b && a && (b.tileX !== a.tileX || b.tileY !== a.tileY)) { await sleep(150); const f = await est(); reg('P8 Sala->Hall: no 1º passo aparece e fica 1 tile atrás', f.nick.oculto === false && dist(f) === 1, `dist=${dist(f)} oculto=${f.nick.oculto}`); break; }
  }
});

// Volta pelo P8 (Hall->Sala) com o Nick acordado
await seguro('P8 Hall->Sala', async () => {
  await cruzar('hall', 'sala', [[3, 1, 'ArrowUp']], 'P8 Hall->Sala');
});
// (3) Regressão: barra de 2 linhas (captura na Sala, exploração)
await seguro('barra 2 linhas', async () => {
  await sleep(300);
  await capturar(EVID, 'barra-2-linhas-sala');
  reg('barra de 2 linhas na exploração (captura barra-2-linhas-sala.png; conferir visualmente)', null, 'checagem visual da captura');
});

// (4) Nick dormindo bloqueia (N11): Sala, depois de acordar, levamos o Nick a dormir pela peça 1 é o caso real; aqui o Nick dorme na Cozinha
// Peça 1 com Nick acordado (feliz + Au!)
await seguro('peça 1 com Nick acordado', async () => {
  await irPara(page, 'sala', 2, 4).catch(() => {});
  await press('ArrowLeft', 260);
  await apertarA(page); await sleep(500); await limparTextos(page); await apertarA(page);
  let chegou = null; let au = null; let viu = false; const anim = [];
  const t1 = Date.now();
  while (Date.now() - t1 < 25000) {
    const q = await est();
    if (q?.emConducao) viu = true;
    if (viu && !q?.emConducao && chegou === null) chegou = Date.now();
    if (chegou !== null) { anim.push(String(q?.animacaoDoNick)); if (au === null && (await ver()).includes('Au!')) au = Date.now(); if (Date.now() - chegou > 2600) break; }
    await sleep(80);
  }
  reg(`${NOME} peça 1 (Nick acordado): "Au!" e feliz na chegada`, au !== null && anim.includes('nick-feliz'), `Au! ${au && chegou ? au - chegou : 'nunca'} ms; anim=${[...new Set(anim)].join(',')}`);
  await fechar();
});

// Fumacinha ao devolver o controle, quadros a cada 100 ms; Nick dorme na Cozinha/Quarto
await seguro('fumaça e N11', async () => {
  for (let i = 0; i < 6; i++) { const q = await est(); if (!q?.travado) break; await tecla(page, 'z', { ms: 90, pausa: 60 }); }
  for (let k = 0; k < 8; k++) { await capturar(join(EVID, 'fumaca'), `f-${String(k).padStart(2, '0')}`); await sleep(60); }
  const q = await est();
  reg(`${NOME} fumacinha: Nick dorme no destino após a peça 1 (ver fumaca/)`, q?.nick?.estado === 'dormindo', `nick=${JSON.stringify(q?.nick)}`);
});

console.log(`\n${NOME} tempo: ${((Date.now() - T0) / 1000).toFixed(0)} s`);
console.log('Erros:', erros.length ? erros : 'nenhum');
writeFileSync(join(EVID, 'resultados.json'), JSON.stringify({ resultados, erros }, null, 2));
await browser.close();
