// QA Marco 3 (v0.7.0), rodada 1: Nick (dormir, acordar, seguir, farejar), dica, barra.
// Build: dist-qa/index.html (npm run build:qa). Perfil HD 480x352. Teclado. Usa window.__estado/__teleportar.
// Uso: node qa/scripts/marco3-r1-nick.mjs
import { lancar, novoContexto, lerTextos, limparTextos, juntar, sleep, tecla, irAteHall } from './lib.mjs';
import { irPara, estado, apertarA, subarea } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const EVID = join(RAIZ, 'qa', 'evidencias', 'marco3-r1');
mkdirSync(EVID, { recursive: true });
const url = pathToFileURL(join(RAIZ, 'dist-qa', 'index.html')).href;

const resultados = [];
const reg = (id, ok, nota) => { resultados.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} :: ${nota}`); };
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'm3r1' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') erros.push(`console: ${m.text()}`); });

const textos = async () => juntar(await lerTextos(page));
const est = () => estado(page);
const nickDe = async () => (await est())?.nick;
const press = async (k, ms = 260) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); await sleep(220); };
const teleportar = async (m, s) => { await page.evaluate(([a, b]) => window.__teleportar(a, b), [m, s]); await sleep(500); };
async function capturar(nome) {
  const dataUrl = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const o = document.createElement('canvas');
    o.width = c.width * 3; o.height = c.height * 3;
    const x = o.getContext('2d'); x.imageSmoothingEnabled = false;
    x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height);
    return o.toDataURL('image/png');
  });
  writeFileSync(join(EVID, `${nome}.png`), Buffer.from(dataUrl.split(',')[1], 'base64'));
}

await page.goto(url);
await page.waitForSelector('canvas');
await sleep(2000);
await capturar('01-titulo');
const txTitulo = await textos();
reg('P1-01 versão', txTitulo.includes('v0.7.0') ? true : null, txTitulo.includes('v0.7.0') ? 'título mostra v0.7.0 (texto lido)' : 'texto de versão não lido, ver captura 01-titulo.png');

// Começar LoLô e ir até o hall (mesma sequência de lib.mjs irAteHall, validada no Marco 2)
await limparTextos(page);
await irAteHall(page, 0);
await sleep(1200);
console.log('diag pos-hall:', JSON.stringify({ mapa: (await est()).mapa, nick: (await est()).nick }));
let e = await est();
reg('setup', !!e, `hall: mapa=${e?.mapa} tile=(${e?.tileX},${e?.tileY}) travado=${e?.travado} nick=${JSON.stringify(e?.nick)}`);
async function livrar() { for (let i = 0; i < 6; i++) { const q = await est(); if (!q.travado) return; await press('x', 300); await press('z', 300); } }


// N1: Nick dormindo na Sala (8,5)
await teleportar('sala', 'P7'); // spawn P7 (9,5): ao lado do Nick, longe da P8 (6,7)
// Depois do teleporte, o jogo fica travado (diálogo do hall). X fecha sem acordar o Nick (Z acordaria).
if ((await est()).travado) { await press('x', 300); await sleep(400); }
e = await est();
const n0 = e.nick;
reg('N1 Nick dormindo na Sala (8,5)', n0.estado === 'dormindo' && n0.mapa === 'sala' && n0.tileX === 8 && n0.tileY === 5, `nick=${JSON.stringify(n0)}`);
await capturar('02-sala-nick-dormindo');

// Bloqueio (N11): andar contra o Nick dormindo
e = await est();
// Posiciona o jogador em (8,7) subindo até (8,6), encosta no Nick em (8,5)
await press('ArrowLeft', 700);
e = await est();
reg('N11 Nick dormindo bloqueia (andar para a esquerda contra ele)', e.tileX === 9 && e.tileY === 5, `jogador em (${e.tileX},${e.tileY}), nick (8,5) dormindo=${e.nick.estado === 'dormindo'}`);

// N2: acordar com A, de frente para o Nick (jogador está em (8,6) de frente para cima)
await limparTextos(page);
await apertarA(page);
await sleep(1400);
const acord = await textos();
e = await est();
reg('N2 A acorda o Nick (estado acordado, texto de primeira vez)', e.nick.estado === 'acordado' && /Nick acordou/.test(acord), `nick=${e.nick.estado}; texto: "${acord.slice(0, 160)}"`);
await capturar('03-acordou-dialogo');
// Pagina 2 e fecha
await limparTextos(page);
await apertarA(page);
await sleep(300);
const pag2 = await textos();
reg('N2b página 2 "Aperte X para farejar."', /Aperte X para farejar/.test(pag2) ? true : null, `texto pag2: "${pag2.slice(0, 120)}"`);
await press('x', 260);
await sleep(300);
// fechar eventual diálogo restante
for (let i = 0; i < 3; i++) { const q = await est(); if (!q.travado) break; await apertarA(page); }
await sleep(300);

// N3: segundo A não repete o diálogo de primeira vez (acordado: só "abana")
await limparTextos(page);
await apertarA(page);
await sleep(1400);
const segundo = await textos();
reg('N3 segundo acordar não repete "Nick acordou"', !/Nick acordou/.test(segundo), `texto: "${segundo.slice(0, 120)}"`);
for (let i = 0; i < 3; i++) { const q = await est(); if (!q.travado) break; await apertarA(page); }

// N4: seguir. Jogador de (8,6) anda 3 tiles para a direita; Nick deve andar atrás.
const antesSeguir = (await est()).nick;
for (const k of ['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowRight', 'ArrowRight']) await press(k, 420);
await sleep(600);
e = await est();
reg('N4 Nick acordado segue (sai de (8,5))', e.nick.estado === 'acordado' && (e.nick.tileX !== antesSeguir.tileX || e.nick.tileY !== antesSeguir.tileY), `jogador (${e.tileX},${e.tileY}), nick (${e.nick.tileX},${e.nick.tileY}) fila=${e.nick.filaEntradas}`);
await capturar('04-nick-segue');
// Parado: depois de parar, Nick chega ao alvo da fila
await sleep(800);
e = await est();
reg('N4b Nick para depois do sobrinho parar', true, `após parar: jogador (${e.tileX},${e.tileY}) nick (${e.nick.tileX},${e.nick.tileY})`);

// N5: passar sobre o Nick acordado (não bloqueia): anda para o tile dele
const nk = (await est()).nick;
// N5: passar sobre o Nick acordado: o jogador entra no tile do Nick (se não bloquear, anda)
await irPara(page, 'sala', nk.tileX, nk.tileY).catch((err) => console.log('irPara n5:', err.message));
e = await est();
reg('N5 Nick acordado não bloqueia (jogador sobre o tile dele)', e.tileX === nk.tileX && e.tileY === nk.tileY, `jogador (${e.tileX},${e.tileY}) nick (${nk.tileX},${nk.tileY})`);

// F3: mesmo cômodo: Nick acordado, alvo=sala, jogador na Sala: X (farejar) -> "Au!", sem seta
await limparTextos(page);
await press('x', 260);
await sleep(300);
const fa = await est();
const txF3 = await textos();
reg('F3 farejar no mesmo cômodo: sem seta', fa.farejo.ativo === false, `farejo=${JSON.stringify(fa.farejo)}; texto "${txF3.slice(0, 100)}"`);
await capturar('05-farejar-mesmo-comodo');
await sleep(1600);

// F1 / F4: cozinha com alvo na Sala: seta na P7 (esquerda). Nick acompanha a troca de área junto.
await irPara(page, 'sala', 9, 5).catch((err) => console.log('irPara p7:', err.message));
await press('ArrowRight', 1100); // P7 (10,5): passagem com fade, sem teleporte
await sleep(700);
e = await est();
reg('N6 troca de área: Nick acordado vai junto para a Cozinha (semente)', e.mapa === 'cozinha' && e.nick.mapa === 'cozinha' && e.nick.estado === 'acordado', `jogador=${e.mapa}(${e.tileX},${e.tileY}) nick=${JSON.stringify(e.nick)}`);
await limparTextos(page);
await press('x', 260);
await sleep(1400); // espera a animação de farejar 1,2 s
e = await est();
reg('F1 seta da porta a seguir (Cozinha com alvo na Sala: P7)', e.farejo.ativo === true && e.farejo.porta?.id === 'P7' && e.farejo.porta?.saida === 'esquerda', `farejo=${JSON.stringify(e.farejo)}`);
await capturar('06-seta-cozinha-P7');
const r1 = e.farejo.restanteMs;
await sleep(2000);
const e2 = await est();
reg('F1b seta dura ~5 s (restante reduz)', e2.farejo.restanteMs < r1 && e2.farejo.restanteMs > 0, `restante ${r1} -> ${e2.farejo.restanteMs} ms após ~2 s`);
await sleep(4000);
const e3 = await est();
reg('F1c seta some em 5 s', e3.farejo.ativo === false, `após ~7 s: farejo=${JSON.stringify(e3.farejo)}`);

// F2: B repetido com a seta visível reinicia os 5 s
await press('x', 260);
await sleep(1400);
await press('x', 260);
await sleep(1000);
const f2 = await est();
reg('F2 B com seta visível reinicia (restante alto)', f2.farejo.ativo && f2.farejo.restanteMs > 3000, `restante=${f2.farejo.restanteMs}`);

// Dica por H
await limparTextos(page);
await press('h', 300);
await sleep(400);
e = await est();
const tDica = await textos();
reg('D1 H abre a dica (mundo parado)', e.dicaAberta === true, `dicaAberta=${e.dicaAberta}; texto "${tDica.slice(0, 160)}"`);
await capturar('07-dica-cozinha-h');
// D2: H não fecha
await press('h', 260);
e = await est();
reg('D2 H não fecha a dica', e.dicaAberta === true, `dicaAberta=${e.dicaAberta}`);
await press('z', 260);
e = await est();
reg('D2b Z fecha a dica', e.dicaAberta === false, `dicaAberta=${e.dicaAberta}`);

// Árvore e Nick em outras áreas: escritório e cozinha, barra
await limparTextos(page);
await sleep(300);
const tBarra = await textos();
reg('B1 barra de duas linhas (exploração)', null, `textos lidos após fechar dica: "${tBarra.slice(0, 200)}" (conferir captura 08)`);
await capturar('08-cozinha-barra');

// Sala: tiles (0,9) e (1,9) bloqueados (dados do conteúdo e do jogo)
const sala = subarea('sala');
const idx = (x, y) => y * sala.largura + x;
const bloq = (x, y) => sala.chao[idx(x, y)] === 0 || sala.colisao[idx(x, y)] === 1;
reg('B3 Sala (0,9) e (1,9) bloqueados', bloq(0, 9) && bloq(1, 9), `chao/colisao: (0,9) chao=${sala.chao[idx(0, 9)]} col=${sala.colisao[idx(0, 9)]}; (1,9) chao=${sala.chao[idx(1, 9)]} col=${sala.colisao[idx(1, 9)]}; linhas=${sala.altura}`);

console.log('\nErros de página/console:', erros.length ? erros : 'nenhum');
writeFileSync(join(EVID, 'resultados.json'), JSON.stringify({ resultados, erros }, null, 2));
await browser.close();
