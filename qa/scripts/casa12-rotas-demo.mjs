// OBSOLETO (rodada 14, 2026-11-08): coordenadas da planta antiga, antes da rotação (GDD 14.12.3). Não usar sem atualizar para content/maps/casa-real/*.json. Ver marco1-r13-vivo.mjs e marco1-r14-sobrinhos.mjs.
// Demonstração de rota (Marco 1.2, casa real): Elevador -> P8 -> Sala -> P1, P2, P3 -> Cozinha (Pia, Fogão, Geladeira).
// Precisa do build de QA: `npm run build:qa`, e Chrome instalado. Uso: node qa/scripts/casa12-rotas-demo.mjs
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { irPara, ladoDe, estado, esperarParado, esperarFade, apertarA, subarea, objeto } from './lib-rota.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(join(AQUI, '..', '..', 'dist-qa', 'index.html')).href;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);
const posicao = async (page, rotulo) => {
  const e = await estado(page);
  log(`${rotulo.padEnd(34)} mapa=${e.mapa} tile=(${e.tileX},${e.tileY}) dir=${e.direcao} travado=${e.travado} fase=${e.fase}`);
  return e;
};
/** Vira o personagem para o objeto vizinho (seta na direção dele: como o objeto bloqueia, só muda a direção). */
async function virarPara(page, tipo, ref, mapa) {
  const e = await estado(page);
  const o = objeto(mapa, tipo, ref);
  const dx = Math.sign(o.x - e.tileX);
  const dy = Math.sign(o.y - e.tileY);
  const tecla = dx === 1 ? 'ArrowRight' : dx === -1 ? 'ArrowLeft' : dy === 1 ? 'ArrowDown' : 'ArrowUp';
  await page.keyboard.down(tecla);
  await dormir(90);
  await page.keyboard.up(tecla);
  await dormir(120);
}
/** Fecha diálogos abertos (A avança/fecha). */
async function fecharDialogos(page) {
  for (let i = 0; i < 6; i++) {
    const e = await estado(page);
    if (!e?.travado) return;
    await apertarA(page);
    await dormir(120);
  }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
const erros = [];
page.on('pageerror', (e) => erros.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
await page.goto(url);
await dormir(2000);
// Título -> seleção (LoLô) -> introdução (4 páginas) -> orientação (2 páginas).
await apertarA(page);
await apertarA(page);
await dormir(300);
for (let i = 0; i < 4; i++) await apertarA(page);
for (let i = 0; i < 2; i++) await apertarA(page);
await dormir(400);
await posicao(page, 'Elevador (nascimento)');

// Hall: até a P8 (trancada); A na frente abre o painel; código 017 abre a porta.
const aoLadoP8 = ladoDe('hall', 'porta', 'P8', (await estado(page)));
await irPara(page, 'hall', aoLadoP8.x, aoLadoP8.y);
await posicao(page, 'Hall, ao lado da P8');
await apertarA(page);
await dormir(300);
for (const ch of '017') {
  await page.keyboard.down(ch);
  await dormir(90);
  await page.keyboard.up(ch);
  await dormir(200);
}
await page.keyboard.down('Enter');
await dormir(90);
await page.keyboard.up('Enter');
await dormir(900);
await fecharDialogos(page);
await esperarFade(page);
await posicao(page, 'Depois da P8 (chegada)');

// Sala: P1, P2 e P3 (portas fechadas) e o diálogo de cada uma.
for (const p of ['P1', 'P2', 'P3']) {
  const e = await estado(page);
  const lado = ladoDe('sala', 'portaFechada', p, { x: e.tileX, y: e.tileY });
  await irPara(page, 'sala', lado.x, lado.y);
  await posicao(page, `Sala, ao lado da ${p}`);
  await virarPara(page, 'portaFechada', p, 'sala');
  await posicao(page, `Virado para a ${p}`);
  await apertarA(page);
  await dormir(200);
  await posicao(page, `${p}: após A (travado=diálogo)`);
  await fecharDialogos(page);
  await esperarParado(page);
}

// Cozinha: pela P7 (gatilho na Sala), depois Pia, Fogão e Geladeira.
await posicao(page, 'Antes da P7 (sala)');
const e7 = await estado(page);
const alvoP7 = ladoDe('sala', 'porta', 'P7', { x: e7.tileX, y: e7.tileY });
void alvoP7;
const gatilhoP7 = subarea('sala').objetos.find((o) => o.tipo === 'porta' && o.id === 'P7');
const acesso = { x: gatilhoP7.x, y: gatilhoP7.y + 1 };
await irPara(page, 'sala', acesso.x, acesso.y);
await irPara(page, 'sala', gatilhoP7.x, gatilhoP7.y);
await esperarFade(page);
await posicao(page, 'Cozinha (nascimento pela P7)');
for (const [ref, nome] of [['cozinha.pia', 'Pia'], ['cozinha.fogao', 'Fogão'], ['cozinha.geladeira', 'Geladeira']]) {
  const e = await estado(page);
  const lado = ladoDe('cozinha', 'examinavel', ref, { x: e.tileX, y: e.tileY });
  await irPara(page, 'cozinha', lado.x, lado.y);
  await posicao(page, `Cozinha, ao lado da ${nome}`);
  await virarPara(page, 'examinavel', ref, 'cozinha');
  await posicao(page, `Virado para a ${nome}`);
  await apertarA(page);
  await dormir(200);
  await fecharDialogos(page);
  await esperarParado(page);
}
await posicao(page, 'Fim da demonstração');
await browser.close();
log(erros.length ? `Erros de página/console: ${JSON.stringify(erros)}` : 'Sem erros de página ou console.');
process.exitCode = erros.length ? 1 : 0;
