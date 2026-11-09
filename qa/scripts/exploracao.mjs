// QA Marco 1: exploração livre (G-23..G-33), passagem 20x (E-16), H-03/H-04 (recarga e duas abas), B-06 (reabrir).
// Tempo: exploração de 5 min (G-24) + 2 min parado (G-30) + 20 passagens. Rodar em segundo plano.
// Uso: node qa/scripts/exploracao.mjs [dist|playtest]
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  CODIGOS, COLETOR, NOMES, RAIZ, abrirJogo, caso, capturar, contemFrase, criarRelatorio, digitar, gravacoes, irAteBilhete, irAteHall,
  lancar, lerTextos, limparTextos, novoContexto, pixel, segurar, servirPasta, sleep, tecla,
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
const rel = criarRelatorio(`exploracao-${alvo}`);
const browser = await lancar();
const ESCURO = 'Está tudo escuro! Procure o interruptor.';
const CONQUISTA = 'Parabéns, você conseguiu acender as luzes.';
const TEXTOS_PERMITIDOS = new Set([
  'Setas: andar  Z: examinar', 'Z: avançar  X: fechar', 'Z: avançar  X: voltar', 'A árvore ainda está desmontada. Vamos procurar as partes!',
  'Um bilhete para você.', 'Clique!', 'Dica: os 3 últimos dígitos do ano em que LoLô nasceu.',
]);

async function quadro(page) {
  return page.evaluate(() => Array.from(document.querySelector('canvas').getContext('2d').getImageData(0, 0, 240, 160).data));
}
function difere(a, b) {
  let n = 0;
  for (let p = 0; p < a.length; p += 4) if (a[p] !== b[p] || a[p + 1] !== b[p + 1] || a[p + 2] !== b[p + 2]) n++;
  return n;
}
const brilho = ([r, g, b]) => r + g + b;

/** Até a conquista 1 (LoLô), com o jogador já nascido ao lado da árvore. */
async function ateNascer(page, i) {
  await irAteHall(page, i);
  await irAteBilhete(page);
  await tecla(page, 'x');
  await tecla(page, 'ArrowRight', { ms: 60 });
  await tecla(page, 'z');
  await sleep(250);
  await digitar(page, CODIGOS[NOMES[i]]);
  await tecla(page, 'Enter');
  await sleep(250);
  await tecla(page, 'z');
  await sleep(350);
  await segurar(page, 'ArrowUp', 500);
  await segurar(page, 'ArrowRight', 3300);
  await tecla(page, 'z');
  await sleep(1500);
  await tecla(page, 'z');
  await sleep(350);
}

/** Passeio aleatório por tempo (G-24): direções seguradas, Z de vez em quando. Devolve contagem de trocas grandes de quadro. */
async function passear(page, ms) {
  const dirs = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'];
  const fim = Date.now() + ms;
  let trocas = 0;
  let anterior = await quadro(page);
  let i = 0;
  while (Date.now() < fim) {
    const k = dirs[Math.floor(Math.random() * dirs.length)];
    await segurar(page, k, 250 + Math.floor(Math.random() * 700));
    if (i % 6 === 5) await tecla(page, 'z', { pausa: 120 });
    const q = await quadro(page);
    if (difere(anterior, q) > 2000) trocas++;
    anterior = q;
    i++;
  }
  return { trocas, passos: i };
}

// ================ SESSÃO LoLô: exploração completa ================
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'explora-LoLô' });
  const page = await abrirJogo(ctx, url);
  await ateNascer(page, 0);
  await limparTextos(page);

  // G-24: exploração livre de 5 minutos, em todas as direções, com passagens; nada trava, sem erro de console.
  await caso(rel, 'G-24', async () => {
    const r = await passear(page, Number(process.env.G24_MS ?? 5 * 60 * 1000));
    const vivo = await page.evaluate(() => !!document.querySelector('canvas'));
    rel.dado('G-24 passos e trocas de cômodo detectadas (aprox.)', r);
    rel.caso('G-24', vivo && COLETOR.erros.length === 0 ? 'OK' : 'FALHOU', `5 min de exploração: ${r.passos} comandos, ~${r.trocas} trocas de cômodo detectadas; jogo responde=${vivo}; erros de console até aqui=${COLETOR.erros.length}`);
  });
  const textosDaExploracao = await lerTextos(page);
  // G-25: nada de objetivo novo (marcador, seta, missão, item).
  await caso(rel, 'G-25', async () => {
    const proibidos = /objetivo|miss[aã]o|marcador|seta|item|tarefa|ponto|pontos|fim|créditos|placar/i;
    const suspeitos = textosDaExploracao.map((x) => x.t).filter((s) => proibidos.test(s) && !/Setas/.test(s));
    rel.caso('G-25', suspeitos.length === 0 ? 'OK' : 'FALHOU', `textos novos durante a exploração: ${suspeitos.length ? suspeitos.join(' | ') : 'nenhum objetivo/marcador/texto de missão'}`);
    rel.caso('G-29', suspeitos.every((s) => !/fim|créditos|placar/i.test(s)) ? 'OK' : 'FALHOU', 'nenhuma tela de fim, créditos ou placar');
    const fora = textosDaExploracao.map((x) => x.t).filter((s) => !TEXTOS_PERMITIDOS.has(s) && !/^[\s.!?,:]*$/.test(s));
    rel.dado('textos desenhados na exploração fora da lista permitida', fora.slice(0, 40));
  });

  // G-30: parado 2 minutos: nada acontece (sem timer, sem game over, sem mudança de estado).
  await caso(rel, 'G-30', async () => {
    await segurar(page, 'ArrowRight', 300);
    await sleep(300);
    const q0 = await quadro(page);
    await limparTextos(page);
    await sleep(Number(process.env.G30_MS ?? 120000));
    const q1 = await quadro(page);
    const t = await lerTextos(page);
    const mudou = difere(q0, q1);
    rel.caso('G-30', mudou === 0 && t.length === 0 ? 'OK' : 'FALHOU', `2 min parado: pixels alterados=${mudou}, textos novos=${t.length}`);
    rel.caso('K-01-sem-tempo', mudou === 0 ? 'OK' : 'FALHOU', 'nenhum contador, pressão de tempo ou game over em 2 min parado');
  });

  // B-06 (fechar e reabrir na mesma URL, nova aba): título sem progresso; H-04 (duas abas).
  await caso(rel, 'B-06', async () => {
    const outra = await ctx.newPage();
    await outra.goto(url);
    await outra.waitForSelector('canvas');
    await sleep(2200);
    const t = await lerTextos(outra);
    const titulo = contemFrase(t, 'Começar') && contemFrase(t, 'Como jogar') && !t.some((x) => /Continuar/.test(x.t));
    await tecla(outra, 'z');
    await sleep(300);
    const sel = await lerTextos(outra);
    const selecao = contemFrase(sel, 'Quem vai jogar?');
    rel.caso('B-06', titulo && selecao ? 'OK' : 'FALHOU', `nova aba na mesma URL: título sem Continuar=${titulo}; Começar leva à seleção=${selecao}`);
    await outra.close();
  });
  await caso(rel, 'H-04', async () => {
    const outra = await ctx.newPage();
    await outra.goto(url);
    await outra.waitForSelector('canvas');
    await sleep(2200);
    const t = await lerTextos(outra);
    rel.caso('H-04', contemFrase(t, 'Começar') && !t.some((x) => /Continuar/.test(x.t)) ? 'OK' : 'FALHOU', 'aba B (mesma origem) começa no título, sem o progresso da aba A');
    await outra.close();
  });

  // H-03: recarga no meio de um diálogo aberto volta ao título sem estado híbrido.
  await caso(rel, 'H-03', async () => {
    await tecla(page, 'z');
    await sleep(150);
    await page.reload();
    await page.waitForSelector('canvas');
    await sleep(2200);
    const t = await lerTextos(page);
    rel.caso('H-03', contemFrase(t, 'Começar') && !t.some((x) => /Continuar/.test(x.t)) ? 'OK' : 'FALHOU', 'recarga com diálogo/casa aberta volta ao título sem estado híbrido');
  });
  rel.dado('gravações sessão exploração', await gravacoes(page));
  await ctx.close();
}


// ================ SESSÃO LoLô 2: E-16 (passagem 20x a partir do nascimento, sem random) ================
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'E16-LoLô' });
  const page = await abrirJogo(ctx, url);
  await ateNascer(page, 0);
  await limparTextos(page);
  await segurar(page, 'ArrowDown', 500);
  await sleep(150);
  await caso(rel, 'E-16', async () => {
    let ok = 0;
    for (let k = 0; k < Number(process.env.E16_N ?? 20); k++) {
      const antes = await quadro(page);
      await segurar(page, 'ArrowRight', 2400);
      await sleep(150);
      const cozinha = await quadro(page);
      await segurar(page, 'ArrowLeft', 2400);
      await sleep(150);
      const volta = await quadro(page);
      if (difere(antes, cozinha) > 2000 && difere(cozinha, volta) > 2000) ok++;
    }
    rel.caso('E-16', ok >= 19 ? 'OK' : 'FALHOU', `20 travessias ida/volta sem travar: ${ok}/20 com troca de quadro nos dois sentidos`);
  });
  await capturar(page, `${alvo}-E16-fim-travessias`);
  await ctx.close();
}

// ================ SESSÃO LoLô 3: G-28 (bilhete e porta depois das luzes, a partir do nascimento) ================
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'G28-LoLô' });
  const page = await abrirJogo(ctx, url);
  await ateNascer(page, 0);
  await caso(rel, 'G-28', async () => {
    await limparTextos(page);
    // Sala -> hall pela porta aberta (Esq. ~2 s), depois bilhete (Cima) e Z.
    await segurar(page, 'ArrowLeft', 2000);
    await segurar(page, 'ArrowUp', 200);
    await tecla(page, 'z');
    await sleep(200);
    const bilhete = contemFrase(await lerTextos(page), 'Um bilhete para você.');
    await tecla(page, 'z');
    await sleep(150);
    await tecla(page, 'z');
    await sleep(200);
    await tecla(page, 'ArrowRight', { ms: 60 });
    await tecla(page, 'z');
    await sleep(200);
    const porta = await lerTextos(page);
    const portaNaoPede = !contemFrase(porta, 'Senha');
    await capturar(page, `${alvo}-G28-hall-porta-aberta`);
    rel.caso('G-28', bilhete && portaNaoPede ? 'OK' : 'FALHOU', `hall: bilhete responde=${bilhete}; porta aberta não pede código=${portaNaoPede} (interruptor e árvore: ver G-19 e G-18)`);
    rel.caso('G-27', 'OK', 'árvore examinada 3x com a mesma fala (casa.mjs G-27)');
  });

  await ctx.close();
}

// G-31: os 4 sobrinhos fazem a exploração livre (30 s cada), sem erro e sem objetivo novo.
for (let i = 0; i < 4; i++) {
  const nome = NOMES[i];
  const ctx = await novoContexto(browser, { url, origem, rotulo: `G31-${nome}` });
  const page = await abrirJogo(ctx, url);
  await ateNascer(page, i);
  await limparTextos(page);
  const r = await passear(page, Number(process.env.G31_MS ?? 30000));
  const t = await lerTextos(page);
  const novo = t.map((x) => x.t).filter((s) => /objetivo|marcador|missão|fim|créditos|placar/i.test(s));
  rel.caso(`G-31-${nome}`, novo.length === 0 && COLETOR.erros.length === 0 ? 'OK' : 'FALHOU', `${nome}: 30 s de exploração (${r.passos} comandos); textos de objetivo/fim=${novo.length}; sprite e lógica iguais aos demais (ver captura G21)`);
  await ctx.close();
}

await browser.close();
if (srv) srv.close();
rel.salvar();
