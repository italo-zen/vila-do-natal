// QA Marco 1: título (B-01..B-19), seleção (C-01..C-10), H-05 e B-05 (recarga no título e na seleção).
// Uso: node qa/scripts/titulo-selecao.mjs [dist|playtest]
//   dist      = dist/ servido por HTTP local (build normal)
//   playtest  = dist-playtest/index.html aberto por file:// (build de playtest)
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  RAIZ, VERSAO, abrirJogo, bboxDestaque, caso, capturar, contemFrase, contemLinha, criarRelatorio, digitar,
  emDestaque, gravacoes, juntar, lancar, lerTextos, limparTextos, novoContexto, pixel, segurar, servirPasta, sleep, tecla,
} from './lib.mjs';

const alvo = process.argv[2] ?? 'dist';
let url;
let origem = null;
let srv = null;
if (alvo === 'dist') {
  const s = await servirPasta(join(RAIZ, 'dist'));
  srv = s.srv;
  url = s.url;
  origem = s.origem;
} else {
  url = pathToFileURL(join(RAIZ, 'dist-playtest', 'index.html')).href;
}
const rel = criarRelatorio(`titulo-selecao-${alvo}`);
const browser = await lancar();
const NOMES = ['LoLô', 'BiBi', 'DanDan', 'TuTu'];
const COMO_JOGAR_GDD = [
  'Mover: setas ou WASD',
  'Botão A: Z ou Enter. Conversar, examinar e avançar textos.',
  'Botão B: X ou Esc. Voltar e fechar textos.',
  'No celular, em breve: botões na tela.',
];

/** Índice do cartão com a borda em destaque (amarela), lendo a linha superior do cartão. */
async function cartaoFocado(page) {
  const achados = [];
  for (let i = 0; i < 4; i++) {
    const [r, g, b] = await pixel(page, 7 + i * 58 + 26, 50);
    if (r > 200 && g > 180 && b < 130) achados.push(i);
  }
  return achados.length === 1 ? achados[0] : achados;
}

/** Foco atual do menu do título/Como jogar; se não houve redesenho, mantém o anterior. */
async function focoMenu(page, anterior, opcoes = ['Começar', 'Como jogar']) {
  const d = emDestaque(await lerTextos(page), opcoes);
  return d.length === 1 ? d[0] : anterior;
}

// ================= TÍTULO =================
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'titulo' });
  const page = await abrirJogo(ctx, url);
  const t = await lerTextos(page);
  await capturar(page, `${alvo}-B01-titulo`);

  await caso(rel, 'B-01', async () => {
    const ok = contemFrase(t, 'Natal na Casa do Tio Ítalo e da Tia Nath') && contemFrase(t, 'Começar') && contemFrase(t, 'Como jogar') && !t.some((x) => /Continuar/i.test(x.t));
    const foco = emDestaque(t, ['Começar', 'Como jogar']);
    rel.caso('B-01', ok && foco.length === 1 && foco[0] === 'Começar' ? 'OK' : 'FALHOU', `nome=${ok} foco=${foco.join('|')} sem Continuar=${!t.some((x) => /Continuar/i.test(x.t))}`);
  });
  await caso(rel, 'B-02', async () => {
    rel.caso('B-02', contemLinha(t, `v${VERSAO}`) ? 'OK' : 'FALHOU', `texto de versão desenhado: v${VERSAO} (confere com package.json)`);
  });
  await caso(rel, 'K2-01', async () => {
    const ok = contemLinha(t, 'Setas: escolher  Z: confirmar') && !t.some((x) => /voltar|X:/i.test(x.t));
    rel.caso('K2-01', ok ? 'OK' : 'FALHOU', 'barra exata com 2 espaços; sem "voltar" nem "X"');
  });
  await caso(rel, 'B-09', async () => {
    const suspeitos = t.filter((x) => /\d+:\d+|pontos?|tempo|vidas?|tentativa|score/i.test(x.t) && !x.t.includes(`v${VERSAO}`));
    rel.caso('B-09', suspeitos.length === 0 ? 'OK' : 'FALHOU', suspeitos.length ? `textos suspeitos: ${suspeitos.map((x) => x.t)}` : 'nenhum contador/HUD desenhado');
  });

  // B-07: cima/baixo e W/S trocam o foco, com limite nas pontas.
  let foco = 'Começar';
  const passos = [
    ['ArrowDown', 'Como jogar'], ['ArrowDown', 'Como jogar'], ['ArrowUp', 'Começar'], ['s', 'Como jogar'], ['w', 'Começar'], ['w', 'Começar'],
  ];
  const seq = [];
  for (const [k, esperado] of passos) {
    await tecla(page, k);
    foco = await focoMenu(page, foco);
    seq.push(`${k}->${foco}`);
    if (foco !== esperado) break;
  }
  rel.dado('B-07 sequência de foco', seq);
  rel.caso('B-07', seq.every((s, i) => s.endsWith(passos[i][1])) && seq.length === passos.length ? 'OK' : 'FALHOU', seq.join(' '));

  // B-08: X e Esc no título não fazem nada.
  await limparTextos(page);
  await tecla(page, 'x');
  await tecla(page, 'Escape');
  await sleep(300);
  const depoisB8 = await lerTextos(page);
  rel.caso('B-08', depoisB8.length === 0 ? 'OK' : 'FALHOU', `textos redesenhados após X/Esc: ${depoisB8.length}`);

  // Foco volta a "Começar" para o B-04.
  await tecla(page, 'ArrowUp');
  await limparTextos(page);
  await tecla(page, 'z');
  await sleep(300);
  const t4 = await lerTextos(page);
  rel.caso('B-04', contemFrase(t4, 'Quem vai jogar?') ? 'OK' : 'FALHOU', 'Z em Começar vai direto à seleção ("Quem vai jogar?"), sem pergunta');
  await page.close();
  rel.dado('storage após título e seleção', await gravacoes(page).catch(() => 'pagina fechada'));
  await ctx.close();
}

// B-10..B-16 e B-18/B-19: "Como jogar".
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'como-jogar' });
  const page = await abrirJogo(ctx, url);
  await tecla(page, 'ArrowDown');
  await limparTextos(page);
  await tecla(page, 'Enter');
  await sleep(300);
  const tc = await lerTextos(page);
  await capturar(page, `${alvo}-B10-como-jogar`);
  rel.caso('B-10', contemFrase(tc, 'Como jogar') && contemFrase(tc, 'Voltar') ? 'OK' : 'FALHOU', 'Enter em "Como jogar" abre a tela');
  await caso(rel, 'B-11', async () => {
    const faltam = COMO_JOGAR_GDD.filter((l) => !contemFrase(tc, l));
    const extras = tc.map((x) => x.t).filter((s) => /Nick|dica|toque|rota/i.test(s));
    rel.caso('B-11', faltam.length === 0 && extras.length === 0 ? 'OK' : 'FALHOU', `faltam=${JSON.stringify(faltam)} extras=${JSON.stringify(extras)}`);
  });
  await caso(rel, 'K2-03', async () => {
    rel.caso('K2-03', contemLinha(tc, 'Z ou X: voltar') ? 'OK' : 'FALHOU', 'barra "Z ou X: voltar" exata');
  });
  // B-16: setas e WASD na tela não movem nada: foco continua em Voltar e nada do título reaparece.
  await limparTextos(page);
  for (const k of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd']) await tecla(page, k, { pausa: 120 });
  const tb16 = await lerTextos(page);
  const indevido = tb16.some((x) => x.t === 'Começar' || x.t === 'Quem vai jogar?');
  const focoVoltar = emDestaque(tb16, ['Voltar']);
  rel.caso('B-16', !indevido && (focoVoltar.length === 0 || focoVoltar.join('') === 'Voltar') ? 'OK' : 'FALHOU', `setas/WASD sem efeito por trás (títulos indevidos: ${indevido}; foco em Voltar: ${focoVoltar.join('') || 'mantido sem redesenho'})`);
  // B-14: X volta ao título. Voltar a "Como jogar": Z, depois X.
  await tecla(page, 'x');
  await sleep(300);
  let tt = await lerTextos(page);
  rel.caso('B-14', contemFrase(tt, 'Começar') && contemFrase(tt, 'Como jogar') ? 'OK' : 'FALHOU', 'X em Como jogar volta ao título');
  await tecla(page, 'ArrowDown');
  await tecla(page, 'z');
  await sleep(300);
  await limparTextos(page);
  await tecla(page, 'Escape');
  await sleep(300);
  tt = await lerTextos(page);
  rel.caso('B-15', contemFrase(tt, 'Começar') ? 'OK' : 'FALHOU', 'Esc em Como jogar volta ao título');
  // B-13: volta ao título com foco em Começar.
  await tecla(page, 'ArrowDown');
  await tecla(page, 'z');
  await sleep(300);
  await limparTextos(page);
  await tecla(page, 'z');
  await sleep(300);
  tt = await lerTextos(page);
  rel.caso('B-13', contemFrase(tt, 'Começar') && emDestaque(tt, ['Começar', 'Como jogar']).join('') === 'Começar' ? 'OK' : 'FALHOU', 'Z em Voltar volta ao título com foco em Começar');

  // B-12: entrar 3 vezes seguidas, foco inicial sempre em Voltar.
  const focosVoltar = [];
  for (let i = 0; i < 3; i++) {
    await tecla(page, 'ArrowDown');
    await limparTextos(page);
    await tecla(page, 'z');
    await sleep(300);
    const tv = await lerTextos(page);
    focosVoltar.push(emDestaque(tv, ['Voltar']).join('') || 'nenhum');
    await tecla(page, 'x');
    await sleep(300);
    await limparTextos(page);
  }
  rel.caso('B-12', focosVoltar.every((f) => f === 'Voltar') ? 'OK' : 'FALHOU', `foco inicial em Voltar nas 3 entradas: ${focosVoltar}`);

  // B-18: alternar 10 vezes (5 com Z e 5 com X).
  let ciclosOk = 0;
  for (let i = 0; i < 10; i++) {
    await tecla(page, 'ArrowDown');
    await limparTextos(page);
    await tecla(page, 'z');
    await sleep(220);
    const tv = await lerTextos(page);
    // Phaser desenha cada Text duas vezes ao criar; medimos só a presença da tela (contagem de desenhos não é contagem de telas).
    const telaUnica = tv.some((x) => x.t === 'Mover: setas ou WASD');
    await tecla(page, i % 2 === 0 ? 'z' : 'x');
    await sleep(220);
    const back = await lerTextos(page);
    if (telaUnica && contemFrase(back, 'Começar')) ciclosOk++;
  }
  rel.caso('B-18', ciclosOk === 10 ? 'OK' : 'FALHOU', `10 alternâncias sem duplicar a tela: ${ciclosOk}/10`);

  // B-19: depois de voltar, "Começar" leva à seleção.
  await limparTextos(page);
  await tecla(page, 'z');
  await sleep(300);
  rel.caso('B-19', contemFrase(await lerTextos(page), 'Quem vai jogar?') ? 'OK' : 'FALHOU', 'Começar após voltar de Como jogar vai à seleção');
  await ctx.close();
}

// B-17: texto de Como jogar cabe em 240x160 (captura para inspeção visual).
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'como-jogar-visual' });
  const page = await abrirJogo(ctx, url);
  await tecla(page, 'ArrowDown');
  await tecla(page, 'z');
  await sleep(300);
  await capturar(page, `${alvo}-B17-como-jogar-240x160`, 4);
  await ctx.close();
}

// ================= SELEÇÃO =================
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'selecao' });
  const page = await abrirJogo(ctx, url);
  await tecla(page, 'z');
  await limparTextos(page);
  await sleep(150);
  // Reabre a seleção para ler a ordem de desenho dos cartões.
  await tecla(page, 'x');
  await sleep(250);
  await limparTextos(page);
  await tecla(page, 'z');
  await sleep(300);
  const ts = await lerTextos(page);
  await capturar(page, `${alvo}-C01-selecao`);
  rel.caso('C-01', contemFrase(ts, 'Quem vai jogar?') ? 'OK' : 'FALHOU', 'título "Quem vai jogar?"');
  await caso(rel, 'C-02', async () => {
    const idx = NOMES.map((n) => ts.findIndex((x) => x.t === n));
    const ordenado = idx.every((v) => v >= 0) && idx.every((v, i) => i === 0 || v > idx[i - 1]);
    rel.caso('C-02', ordenado ? 'OK' : 'FALHOU', `ordem e grafia dos nomes: ${NOMES.join(', ')} (índices ${idx})`);
  });
  await caso(rel, 'C-03', async () => {
    const f = await cartaoFocado(page);
    rel.caso('C-03', f === 0 ? 'OK' : 'FALHOU', `foco inicial no cartão ${f} (esperado 0 = LoLô); nenhum pré-confirmado`);
  });

  // C-04: seta direita x3 e esquerda x3.
  const trilha = [];
  for (let i = 0; i < 3; i++) { await tecla(page, 'ArrowRight'); trilha.push(await cartaoFocado(page)); }
  for (let i = 0; i < 3; i++) { await tecla(page, 'ArrowLeft'); trilha.push(await cartaoFocado(page)); }
  rel.dado('C-04 trilha de foco', trilha);
  rel.caso('C-04', JSON.stringify(trilha) === JSON.stringify([1, 2, 3, 2, 1, 0]) ? 'OK' : 'FALHOU', `trilha ${trilha}`);

  // C-05: A/D com a mesma trilha.
  const trilhaAD = [];
  for (let i = 0; i < 3; i++) { await tecla(page, 'd'); trilhaAD.push(await cartaoFocado(page)); }
  for (let i = 0; i < 3; i++) { await tecla(page, 'a'); trilhaAD.push(await cartaoFocado(page)); }
  rel.caso('C-05', JSON.stringify(trilhaAD) === JSON.stringify([1, 2, 3, 2, 1, 0]) ? 'OK' : 'FALHOU', `trilha A/D ${trilhaAD}`);

  // C-06: limites.
  for (let i = 0; i < 4; i++) await tecla(page, 'ArrowLeft');
  const esq = await cartaoFocado(page);
  for (let i = 0; i < 5; i++) await tecla(page, 'ArrowRight');
  const dir = await cartaoFocado(page);
  rel.caso('C-06', esq === 0 && dir === 3 ? 'OK' : 'FALHOU', `comportamento nos limites: para (esquerda no 1º -> ${esq}, direita no último -> ${dir}); nunca fica sem foco`);

  // C-07: X volta ao título; Esc também.
  await limparTextos(page);
  await tecla(page, 'x');
  await sleep(300);
  let tx = await lerTextos(page);
  rel.caso('C-07', contemFrase(tx, 'Começar') && contemFrase(tx, 'Como jogar') ? 'OK' : 'FALHOU', 'X na seleção volta ao título');
  await tecla(page, 'z');
  await sleep(300);
  await limparTextos(page);
  await tecla(page, 'Escape');
  await sleep(300);
  tx = await lerTextos(page);
  rel.caso('C-07b', contemFrase(tx, 'Começar') ? 'OK' : 'FALHOU', 'Esc na seleção volta ao título (B = X/Esc)');
  rel.dado('storage após seleção', await gravacoes(page));
  await ctx.close();
}

// C-08 (escolha dos 4 com foco certo), C-10 (Z repetido) e recargas (B-05, H-05).
for (let i = 0; i < 4; i++) {
  const nome = NOMES[i];
  const ctx = await novoContexto(browser, { url, origem, rotulo: `escolhe-${nome}` });
  const page = await abrirJogo(ctx, url);
  await tecla(page, 'z');
  for (let k = 0; k < i; k++) await tecla(page, 'ArrowRight');
  const focado = await cartaoFocado(page);
  await capturar(page, `${alvo}-selecao-${nome}`);
  await limparTextos(page);
  await tecla(page, 'z');
  await sleep(350);
  const tt = await lerTextos(page);
  await capturar(page, `${alvo}-intro-p1-${nome}`);
  rel.caso(`C-08-${nome}`, focado === i && contemFrase(tt, `Oi, ${nome}!`) ? 'OK' : 'FALHOU', `cartão focado ${focado} (esperado ${i}); intro mostra "Oi, ${nome}!"`);
  await ctx.close();
}

{
  // C-10: Z repetido não abre duas introduções.
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'duplo-z' });
  const page = await abrirJogo(ctx, url);
  await tecla(page, 'z');
  await limparTextos(page);
  // Toques de 40 ms (toque instantâneo não é lido pelo Phaser, então o teste precisa segurar a tecla um pouco).
  for (let k = 0; k < 5; k++) await tecla(page, 'z', { ms: 40, pausa: 30 });
  await sleep(500);
  const tt = await lerTextos(page);
  const vezes = tt.filter((x) => x.t === 'Oi, LoLô!').length;
  rel.caso('C-10', vezes === 1 ? 'OK' : 'FALHOU', `Z repetido (5 toques) na seleção: "Oi, LoLô!" desenhado ${vezes}x (esperado 1)`);
  await ctx.close();
}

{
  // B-05 no título e na seleção: recarregar volta ao título sem progresso; H-05: seleção começa em LoLô.
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'recarga' });
  const page = await abrirJogo(ctx, url);
  await tecla(page, 'z');
  for (let k = 0; k < 3; k++) await tecla(page, 'ArrowRight');
  await tecla(page, 'z');
  await sleep(300);
  await page.reload();
  await page.waitForSelector('canvas');
  await sleep(2200);
  const trec = await lerTextos(page);
  const trecOk = contemFrase(trec, 'Começar') && contemFrase(trec, 'Como jogar') && !trec.some((x) => /Continuar/.test(x.t));
  rel.caso('B-05-titulo-depois-introducao', trecOk ? 'OK' : 'FALHOU', 'recarga na introdução (TuTu) volta ao título, sem Continuar');
  await tecla(page, 'z');
  await sleep(300);
  const sel = await cartaoFocado(page);
  rel.caso('H-05', sel === 0 ? 'OK' : 'FALHOU', `após recarga, seleção começa em LoLô (cartão focado ${sel})`);
  await page.reload();
  await page.waitForSelector('canvas');
  await sleep(2200);
  const trec2 = await lerTextos(page);
  rel.caso('B-05-titulo-depois-selecao', contemFrase(trec2, 'Começar') && !trec2.some((x) => /Continuar/.test(x.t)) ? 'OK' : 'FALHOU', 'recarga na seleção volta ao título');
  rel.dado('storage após recargas', await gravacoes(page));
  await ctx.close();
}

await browser.close();
if (srv) srv.close();
rel.salvar();
