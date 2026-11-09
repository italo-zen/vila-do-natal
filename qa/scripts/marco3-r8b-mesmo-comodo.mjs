// QA Marco 3 v0.7.1 (rodada 8b): B no mesmo cômodo do alvo (Cozinha, parte 2): "Au!" sem seta, repetido; e travessia
// Quarto -> Sala -> Cozinha com o Nick acordado. Uso: node qa/scripts/marco3-r8b-mesmo-comodo.mjs
import { lancar, novoContexto, sleep, tecla, irAteHall } from './lib.mjs';
import { irPara, estado, apertarA, objeto } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;
const reg = (id, ok, nota) => console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`);
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'r8b' });
const page = await ctx.newPage();
const est = async () => { try { return await estado(page); } catch { await sleep(120); return null; } };
const ver = () => page.evaluate(() => window.__textos.map((x) => x.t).join(' '));
const press = async (k, ms = 260) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); await sleep(200); };
const fechar = async () => { for (let i = 0; i < 14; i++) { const q = await est(); if (!q?.travado) return; await tecla(page, 'z', { ms: 90, pausa: 400 }); } };
const esperarMapa = async (m) => { for (let i = 0; i < 30; i++) { const q = await est(); if (q?.mapa === m && !q.emFade && !q.travado) return q; await sleep(150); } return await est(); };
await page.goto(url); await page.waitForSelector('canvas'); await sleep(2000);
await tecla(page, 'z'); await sleep(300); await tecla(page, 'z'); await sleep(300);
await irAteHall(page, 0); await sleep(800);
const fa = await page.evaluate(() => window.__irParaFase('parte2'));
await page.evaluate(() => window.__teleportar('quarto', 'P2')); await sleep(600); await fechar();
reg('setup __irParaFase(parte2): Nick dorme no Quarto (4,3)', fa === 'parte2' && (await est())?.nick?.mapa === 'quarto', `retorno=${fa} nick=${JSON.stringify((await est())?.nick)}`);
await irPara(page, 'quarto', 4, 4).catch(() => {});
await press('ArrowUp', 260); await apertarA(page); await sleep(1500); await fechar();
reg('pré: Nick acordado no Quarto', (await est())?.nick?.estado === 'acordado', `nick=${JSON.stringify((await est())?.nick)}`);
// Quarto -> Sala pela P2 (vizinho (1,7), empurra para a esquerda)
for (const [x, y, dir] of [[0, 6, 'ArrowDown'], [1, 7, 'ArrowLeft'], [1, 6, 'ArrowDown']]) { try { await irPara(page, 'quarto', x, y); } catch { continue; } await press(dir, 320); if ((await est())?.mapa !== 'quarto') break; }
let q = await esperarMapa('sala');
reg('N6 P2 Quarto->Sala: Nick acordado oculto na chegada e visível no 1º passo', q?.mapa === 'sala' && q?.nick?.mapa === 'sala', `jogador=(${q?.tileX},${q?.tileY}) nick=${JSON.stringify(q?.nick)}`);
await press('ArrowDown', 260); await sleep(200);
q = await est();
reg('N6 após o 1º passo: Nick visível e 1 tile atrás', q?.nick?.oculto === false && Math.abs(q.nick.tileX - q.tileX) + Math.abs(q.nick.tileY - q.tileY) === 1, `jogador=(${q?.tileX},${q?.tileY}) nick=(${q?.nick?.tileX},${q?.nick?.tileY}) oculto=${q?.nick?.oculto}`);
// Sala -> Cozinha pela P7 (vizinho (9,5))
await irPara(page, 'sala', 9, 5).catch((er) => console.log('irPara 9,5:', er.message.slice(0, 100)));
await press('ArrowRight', 320);
q = await esperarMapa('cozinha');
reg('N6 P7 Sala->Cozinha com Nick acordado', q?.mapa === 'cozinha' && q?.nick?.mapa === 'cozinha', `nick=${JSON.stringify(q?.nick)}`);
await press('ArrowRight', 260); await sleep(200);
// Cozinha, alvo = Cozinha (parte 2): B = "Au!" sem seta, e repetido
await limpar();
await press('x', 200);
const s1 = await est();
await sleep(1400);
const txt1 = await ver();
const s2 = await est();
reg('F3 B no mesmo cômodo do alvo: sem seta', s2?.farejo?.ativo === false, `farejo=${JSON.stringify(s2?.farejo)} sniff=${s1?.sniffando}`);
reg('F3 B no mesmo cômodo: "Au!" (balão)', txt1.includes('Au!'), `texto="${txt1.slice(0, 40)}"`);
await limpar();
await press('x', 200); await sleep(200);
const sn = await est();
await sleep(1400);
const txt2 = await ver();
reg('F3 B repetido no mesmo cômodo refaz o farejando e o "Au!"', sn?.sniffando === true && txt2.includes('Au!'), `sniffando no 2º B=${sn?.sniffando}; texto="${txt2.slice(0, 40)}"`);
console.log('FIM');
await browser.close();
async function limpar() { await page.evaluate(() => { window.__textos.length = 0; }); }
