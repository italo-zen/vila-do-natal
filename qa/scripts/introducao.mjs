// QA Marco 1: introdução (D-01..D-18) para os 4 sobrinhos, e C-09/D-11 (nada gravado).
// Uso: node qa/scripts/introducao.mjs [dist|playtest]
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  NOMES, RAIZ, abrirJogo, cartaoFocado, caso, capturar, contemFrase, criarRelatorio, digitar, emDestaque, gravacoes, irAteIntro,
  irAteHall, lancar, lerTextos, limparTextos, novoContexto, servirPasta, sleep, tecla, segurar,
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
const rel = criarRelatorio(`introducao-${alvo}`);
const browser = await lancar();

const PAGINAS = (n) => [
  `Oi, ${n}!`,
  'O tio Ítalo e a tia Nath não estão em casa.',
  'Eles precisam de ajuda para montar a árvore de Natal.',
  'A casa está bagunçada. Vamos entrar?',
];

for (let i = 0; i < 4; i++) {
  const nome = NOMES[i];
  const ctx = await novoContexto(browser, { url, origem, rotulo: `intro-${nome}` });
  const page = await abrirJogo(ctx, url);

  await caso(rel, `D-0${i + 1}-${nome}`, async () => {
    await irAteIntro(page, i);
    const p1 = await lerTextos(page);
    await capturar(page, `${alvo}-D01-intro-p1-${nome}`);
    rel.caso(`D-0${i + 1}`, contemFrase(p1, PAGINAS(nome)[0]) ? 'OK' : 'FALHOU', `"${PAGINAS(nome)[0]}" na página 1`);
  });

  // D-08: teclas que não avançam (setas, WASD e outras) na página 1.
  await caso(rel, `D-08-${nome}`, async () => {
    await limparTextos(page);
    for (const k of ['ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'q', ' ']) await tecla(page, k, { pausa: 120 });
    await sleep(200);
    const extra = await lerTextos(page);
    rel.caso(`D-08-${nome}`, extra.length === 0 ? 'OK' : 'FALHOU', `teclas que não avançam: nenhum texto novo (${extra.length})`);
  });

  // D-05: avançar com Z, uma página por vez, texto exato.
  await caso(rel, `D-05-${nome}`, async () => {
    const achados = [];
    for (let p = 1; p < 4; p++) {
      await limparTextos(page);
      await tecla(page, 'z');
      await sleep(150);
      const t = await lerTextos(page);
      achados.push(contemFrase(t, PAGINAS(nome)[p]));
    }
    rel.caso(`D-05-${nome}`, achados.every(Boolean) ? 'OK' : 'FALHOU', `páginas 2 a 4 exatas: ${achados.map((a) => (a ? 'ok' : 'NÃO')).join(', ')}`);
  });

  // Página 4 -> X volta página a página até a seleção (D-07, D-16, D-18). Cartão escolhido em foco (D-15).
  await caso(rel, `D-16-${nome}`, async () => {
    const trilha = [];
    for (const k of [2, 1, 0]) {
      await limparTextos(page);
      await tecla(page, 'x');
      await sleep(180);
      const t = await lerTextos(page);
      trilha.push(contemFrase(t, PAGINAS(nome)[k]) ? `p${k + 1}` : `?${k + 1}`);
    }
    await limparTextos(page);
    await tecla(page, 'x');
    await sleep(300);
    const t = await lerTextos(page);
    const emSelecao = contemFrase(t, 'Quem vai jogar?');
    const foco = await cartaoFocado(page);
    await capturar(page, `${alvo}-D15-volta-selecao-${nome}`);
    rel.dado(`D-16-${nome} trilha`, trilha);
    rel.caso(`D-16-${nome}`, trilha.join(' ') === 'p3 p2 p1' && emSelecao ? 'OK' : 'FALHOU', `X na página 4 -> 3 -> 2 -> 1 -> seleção: ${trilha.join(' ')} -> seleção=${emSelecao}`);
    rel.caso(`D-15-${nome}`, emSelecao && foco === i ? 'OK' : 'FALHOU', `volta à seleção com cartão ${nome} em foco (cartão ${foco}, esperado ${i})`);
  });

  // D-18: confirmar de novo com Z: a introdução recomeça na página 1.
  await caso(rel, `D-18-${nome}`, async () => {
    await limparTextos(page);
    await tecla(page, 'z');
    await sleep(350);
    const t = await lerTextos(page);
    rel.caso(`D-18-${nome}`, contemFrase(t, PAGINAS(nome)[0]) ? 'OK' : 'FALHOU', 'Z de novo: introdução recomeça na página 1');
  });

  // D-17: Esc no lugar de X, páginas 4 -> 3 -> 2 -> 1 -> seleção.
  await caso(rel, `D-17-${nome}`, async () => {
    for (let k = 0; k < 3; k++) await tecla(page, 'z');
    await sleep(200);
    const trilha = [];
    for (const k of [2, 1, 0]) {
      await limparTextos(page);
      await tecla(page, 'Escape');
      await sleep(180);
      const t = await lerTextos(page);
      trilha.push(contemFrase(t, PAGINAS(nome)[k]) ? `p${k + 1}` : '?');
    }
    await limparTextos(page);
    await tecla(page, 'Escape');
    await sleep(250);
    const sel = contemFrase(await lerTextos(page), 'Quem vai jogar?');
    rel.caso(`D-17-${nome}`, trilha.join(' ') === 'p3 p2 p1' && sel ? 'OK' : 'FALHOU', `Esc: ${trilha.join(' > ')} > seleção=${sel}`);
    await tecla(page, 'z');
    await sleep(350);
  });

  // D-09/D-10/D-11/D-14: terminar a introdução e conferir o hall.
  await caso(rel, `D-09-${nome}`, async () => {
    // Já está na página 1: Z x4 até o hall.
    for (let k = 0; k < 4; k++) await tecla(page, 'z');
    await sleep(300);
    await limparTextos(page);
    await tecla(page, 'ArrowDown');
    await sleep(300);
    const mov = await lerTextos(page);
    rel.caso(`D-09-${nome}`, !mov.some((x) => /tio|casa|Oi,/i.test(x.t)) ? 'OK' : 'FALHOU', 'após a p.4 (Z), a introdução fecha e o controle volta ao jogador (sem diálogo residual)');
    await capturar(page, `${alvo}-D10-hall-${nome}`);
    await capturar(page, `${alvo}-D14-intro-p4-${nome}`, 3);
  });

  await caso(rel, `D-11-${nome}`, async () => {
    const g = await gravacoes(page);
    rel.caso(`D-11-${nome}`, g.gravacoes.length === 0 && g.local === 0 && g.sessao === 0 && g.cookies === '' ? 'OK' : 'FALHOU', `escritas=${JSON.stringify(g.gravacoes)} local=${g.local} sessao=${g.sessao} cookies="${g.cookies}"`);
  });
  await ctx.close();
}

// D-06: esperar 30 s sem apertar nada: nenhuma página avança (LoLô, 1 vez).
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'D-06' });
  const page = await abrirJogo(ctx, url);
  await irAteIntro(page, 0);
  await limparTextos(page);
  await sleep(30000);
  const t = await lerTextos(page);
  rel.caso('D-06', t.length === 0 ? 'OK' : 'FALHOU', `30 s sem apertar: textos novos=${t.length} (nenhuma página avançou)`);
  await ctx.close();
}

// D-13: recarregar no meio da introdução (página 2) volta ao título; nova partida começa na página 1.
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'D-13' });
  const page = await abrirJogo(ctx, url);
  await irAteIntro(page, 1);
  await tecla(page, 'z');
  await sleep(200);
  await page.reload();
  await page.waitForSelector('canvas');
  await sleep(2200);
  const t1 = await lerTextos(page);
  const titulo = contemFrase(t1, 'Começar') && contemFrase(t1, 'Como jogar') && !t1.some((x) => /Continuar/.test(x.t));
  await irAteIntro(page, 1);
  const t2 = await lerTextos(page);
  rel.caso('D-13', titulo && contemFrase(t2, 'Oi, BiBi!') ? 'OK' : 'FALHOU', `recarga na página 2: título sem Continuar=${titulo}; nova introdução começa em "Oi, BiBi!"=${contemFrase(t2, 'Oi, BiBi!')}`);
  await ctx.close();
}

// C-09: nenhuma chave gravada depois de escolher e percorrer a introdução (LoLô).
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'C-09' });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, 0);
  const g = await gravacoes(page);
  rel.caso('C-09', g.gravacoes.length === 0 && g.local === 0 ? 'OK' : 'FALHOU', `escritas=${JSON.stringify(g.gravacoes)} localStorage.length=${g.local}`);
  await ctx.close();
}

await browser.close();
if (srv) srv.close();
rel.salvar();
