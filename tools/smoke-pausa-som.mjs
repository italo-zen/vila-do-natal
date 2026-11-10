// Roteiro do áudio e da pausa (ADR-008 9.3; GDD 19.9 AU1, AU2, AU4, PS1, PS3, PS6, PS7). Build de QA: __estado().audio e
// .pausa. Teclado (P, setas, Z, X, M) e um toque para liberar o som no título.
// Uso: npm run build:qa && node tools/smoke-pausa-som.mjs dist-qa/index.html
// Saída: código 1 se houver erro de console, exceção ou falha de conferência.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [, , arquivoArg, saidaArg] = process.argv;
const url = pathToFileURL(resolve(arquivoArg ?? 'dist-qa/index.html')).href;
const saida = resolve(saidaArg ?? 'dist-qa/capturas-pausa');
mkdirSync(saida, { recursive: true });
const real = (ms) => new Promise((r) => setTimeout(r, ms));
const erros = [];
const falhas = [];
const conferir = (nome, obtido, esperado) => {
  if (JSON.stringify(obtido) !== JSON.stringify(esperado)) falhas.push(`${nome}: obtido ${JSON.stringify(obtido)}, esperado ${JSON.stringify(esperado)}.`);
};

const navegador = await chromium.launch({ channel: 'chrome', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
try {
  const contexto = await navegador.newContext({ viewport: { width: 960, height: 640 } });
  const page = await contexto.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') erros.push(`console.${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`));
  await page.goto(url);
  await page.waitForSelector('canvas');
  await real(2500);

  const som = () => page.evaluate(() => window.__estado()?.audio ?? null);
  const pausa = () => page.evaluate(() => window.__estado()?.pausa ?? null);
  // Tecla segurada um pouco (como o QA): um press instantâneo pode não virar borda para o Phaser.
  const tecla = async (k, ms = 120) => {
    await page.keyboard.down(k);
    await real(90);
    await page.keyboard.up(k);
    await real(ms);
  };

  // AU1: sem gesto, nada libera. Depois, o primeiro clique no título libera e a música começa.
  const antes = await som();
  conferir('AU1: sem gesto, o som não está liberado', antes?.liberado, false);
  await page.mouse.click(5, 5);
  await real(1200);
  const depois = await som();
  conferir('AU1: o clique libera o som', depois?.liberado, true);
  conferir('AU2: a música toca no título', depois?.musica, 'tocando');
  conferir('AU9/decode: os 14 arquivos decodificam no boot', depois?.decodificado, true);

  // Entra na exploração pelo teclado (Z na seleção, depois Z até a casa livre).
  await tecla('z', 900);
  for (let i = 0; i < 30; i++) {
    const e = await page.evaluate(() => window.__estado());
    if (e && e.mapa && !e.travado) break;
    await tecla('z', 300);
  }
  const casa = await page.evaluate(() => window.__estado());
  await page.screenshot({ path: join(saida, 'exploracao-antes-da-pausa.png') });
  conferir('PS1: a casa está livre (pré-condição)', !!casa?.mapa && !casa.travado, true);

  // S01: um passo.
  // Anda numa direção livre (tenta as quatro): cada tile andado toca S01.
  const tInicio = await page.evaluate(() => Date.now());
  let andou = false;
  for (const k of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
    const a = await page.evaluate(() => window.__estado());
    await page.keyboard.down(k);
    await real(500);
    await page.keyboard.up(k);
    await real(150);
    const b = await page.evaluate(() => window.__estado());
    // S01 toca ao trocar de tile (ADR-008 5): conta a troca de tile, não o movimento dentro do tile.
    if (a && b && (a.tileX !== b.tileX || a.tileY !== b.tileY)) {
      andou = true;
      break;
    }
  }
  conferir('AU3: o sobrinho troca de tile (pré-condição do passo)', andou, true);
  const passos = ((await som())?.ultimosEventos ?? []).filter((e) => e.evento === 'S01' && e.instante >= tInicio);
  conferir('AU3: andar toca S01', passos.length > 0, true);

  // PS1: P abre a pausa, com foco em "Continuar"; a casa fica pausada.
  await tecla('p', 250);
  let p = await pausa();
  await page.screenshot({ path: join(saida, 'pausa-continuar.png') });
  conferir('PS1: P abre a pausa', p?.aberta, true);
  conferir('PS1: foco inicial em "Continuar" (visão pausa)', [p?.visao, p?.foco], ['pausa', 0]);
  conferir('PS4: a casa está pausada (sem estado de casa)', (await page.evaluate(() => window.__estado()))?.mapa, null);

  // PS4: setas não andam com a pausa aberta: a seta para baixo troca o foco do menu, e o sobrinho não anda.
  const parado = await page.evaluate(() => window.__estado());
  await tecla('ArrowDown', 300);
  p = await pausa();
  conferir('PS4: seta para baixo troca o foco da pausa', p?.foco, 1);
  const depoisSeta = await page.evaluate(() => window.__estado());
  conferir('PS4: a seta não anda o sobrinho com a pausa aberta', [depoisSeta?.centroX, depoisSeta?.centroY], [parado?.centroX, parado?.centroY]);

  // PS6: "Som" alterna com Z; M também alterna.
  // Desligar pelo item "Som" não toca S12 (ADR-008 R6): o último evento não muda para S12.
  const ultimoAntes = ((await som())?.ultimosEventos ?? []).at(-1)?.evento;
  await tecla('z', 200);
  conferir('PS6: Z em "Som" desliga o mudo', (await som())?.mudo, true);
  conferir('R6: desligar não toca S12', ((await som())?.ultimosEventos ?? []).at(-1)?.evento !== 'S12' || ultimoAntes === 'S12', true);
  await tecla('m', 200);
  conferir('AU4: M liga de novo', (await som())?.mudo, false);
  conferir('R6: ligar toca S12', ((await som())?.ultimosEventos ?? []).at(-1)?.evento, 'S12');

  // PS3: X fecha a pausa e a casa volta.
  await tecla('x', 300);
  p = await pausa();
  conferir('PS3: X fecha a pausa', p?.aberta, false);
  conferir('PS3: a casa volta', !!(await page.evaluate(() => window.__estado()))?.mapa, true);

  // PS6 e PS11: "Como jogar" dentro da pausa, com a linha nova; X volta à pausa com foco em "Como jogar".
  await tecla('p', 250);
  await tecla('ArrowDown', 200);
  await tecla('ArrowDown', 200);
  await tecla('z', 250);
  let cj = await pausa();
  await page.screenshot({ path: join(saida, 'pausa-como-jogar.png') });
  conferir('PS6: Como jogar abre dentro da pausa', [cj?.visao, cj?.foco], ['comoJogar', 0]);
  await tecla('x', 250);
  const volta = await pausa();
  conferir('PS6: X volta à pausa com foco em Como jogar', [volta?.visao, volta?.foco], ['pausa', 2]);

  // PS7: "Voltar ao título" pede confirmação com "Não" em foco; "Não" volta à pausa com foco em "Voltar ao título".
  await tecla('ArrowDown', 200);
  await tecla('z', 250);
  p = await pausa();
  conferir('PS7: "Voltar ao título" pede confirmação com "Não" em foco', [p?.visao, p?.foco], ['confirmacao', 1]);
  // 126 (fundo sólido): na confirmação, nem o "?" nem a casa nem a barra antiga aparecem. Lê os pixels do canvas (escala 1
  // em coordenadas do jogo). Faixa do topo (sem o título) e canto inferior direito (onde a barra antiga ocupava o texto).
  const fundoSolido = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const ctx = c.getContext('2d');
    const fora = (x, y, w, h) => {
      const d = ctx.getImageData(Math.round(x * c.width / 480), Math.round(y * c.height / 352), Math.round(w * c.width / 480), Math.round(h * c.height / 352)).data;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - 11) > 3 || Math.abs(d[i + 1] - 16) > 3 || Math.abs(d[i + 2] - 48) > 3) n++;
      return n;
    };
    return { topo: fora(280, 0, 200, 40), inferiorDireito: fora(420, 300, 60, 40) };
  });
  conferir('126: confirmação com fundo sólido no topo (sem "?" nem casa)', fundoSolido.topo, 0);
  conferir('126: confirmação com fundo sólido embaixo (sem barra antiga)', fundoSolido.inferiorDireito, 0);
  await page.screenshot({ path: join(saida, 'pausa-confirmacao.png') });
  await tecla('z', 250);
  p = await pausa();
  conferir('PS7: "Não" volta à pausa com foco em "Voltar ao título"', [p?.visao, p?.foco], ['pausa', 3]);

  // PS7: "Sim" vai ao título, sem save.
  await tecla('z', 250);
  await tecla('ArrowLeft', 200);
  await tecla('z', 900);
  const titulo = await page.evaluate(() => window.__alvosDeToque().some((a) => a.origem === 'canvas' && a.nome === 'Titulo:Zone'));
  conferir('PS7: "Sim" leva ao título', titulo, true);
  conferir('AU2: a música segue no título após sair da partida', (await som())?.musica, 'tocando');
} catch (erro) {
  falhas.push(`exceção: ${erro.message}`);
} finally {
  await navegador.close();
}
console.log(JSON.stringify({ erros, falhas }, null, 2));
if (erros.length > 0 || falhas.length > 0) process.exit(1);
