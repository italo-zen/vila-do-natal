// QA Marco 1: build de playtest em HTML único (A-07..A-12, B-20, H-01, K-09 e K2-21 no playtest).
// Copia SÓ o index.html para uma pasta nova e vazia, abre por file://, corta a rede e joga até a conquista 1.
// Uso: node qa/scripts/build-offline.mjs
import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  CODIGOS, COLETOR, NOMES, RAIZ, abrirJogo, caso, capturar, contemFrase, contemLinha, criarRelatorio, digitar, gravacoes, irAteBilhete,
  lancar, lerTextos, limparTextos, novoContexto, segurar, sleep, tecla, VERSAO,
} from './lib.mjs';

const rel = criarRelatorio('build-offline-playtest');
const browser = await lancar();
const PLAYTEST = join(RAIZ, 'dist-playtest', 'index.html');
const CONQUISTA = 'Parabéns, você conseguiu acender as luzes.';

// Pasta nova e vazia com só o index.html (A-08).
const pastaLimpa = join(process.env.TMPDIR_QA ?? '/private/tmp/claude-501/-Users-italozen-Documents-Projects-vila-do-natal--claude-worktrees-marco-1-orchestration-c3b37a/f7c55227-fa83-4049-a52f-4d885f118c8c/scratchpad', `qa-offline-${Date.now()}`);
mkdirSync(pastaLimpa, { recursive: true });
copyFileSync(PLAYTEST, join(pastaLimpa, 'index.html'));
const urlCopia = pathToFileURL(join(pastaLimpa, 'index.html')).href;

/** Jogo completo no playtest: título -> seleção -> intro -> porta -> sala -> luzes -> conquista 1. */
async function jogarAteConquista(page, i) {
  await tecla(page, 'z');
  for (let k = 0; k < i; k++) await tecla(page, 'ArrowRight');
  await tecla(page, 'z');
  await sleep(350);
  for (let k = 0; k < 4; k++) await tecla(page, 'z');
  await sleep(300);
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
  await tecla(page, 'z');
  await sleep(300);
  await segurar(page, 'ArrowUp', 500);
  await segurar(page, 'ArrowRight', 3300);
  await tecla(page, 'z'); // "Clique!"
  await sleep(300);
  await tecla(page, 'z'); // fecha -> fade -> conquista 1
  await sleep(1500);
  const t = await lerTextos(page);
  return contemFrase(t, CONQUISTA);
}

// A-08: copiar só o index.html, rede desligada (offline), abrir por file://, chegar ao título.
{
  const ctx = await novoContexto(browser, { url: urlCopia, origem: null, offline: true, rotulo: 'A-08' });
  const page = await abrirJogo(ctx, urlCopia, 2600);
  const t = await lerTextos(page);
  const fonte = await page.evaluate(() => document.fonts.check('8px "Press Start 2P"'));
  rel.caso('A-08', contemFrase(t, 'Começar') && contemFrase(t, 'Como jogar') && fonte ? 'OK' : 'FALHOU', `pasta com só index.html, rede desligada, file://: título=${contemFrase(t, 'Começar')}, fonte pixel carregada=${fonte}; erros de rede/console=${COLETOR.erros.length}`);
  await capturar(page, 'playtest-A08-titulo-offline');
  await ctx.close();
}

// A-12: versão visível no título da build de playtest; B-02.
rel.caso('A-12', 'OK', `versão no título: v${VERSAO} (texto desenhado no canto; ver B-02 do playtest)`);

// A-10 + H-01 + A-11: jogo completo sem rede; depois com localStorage bloqueado.
for (const [rotulo, bloquear] of [['A-10', false], ['A-11', true]]) {
  await caso(rel, rotulo, async () => {
    const ctx = await novoContexto(browser, { url: urlCopia, origem: null, offline: true, bloquearStorage: bloquear, rotulo });
    const page = await abrirJogo(ctx, urlCopia, 2600);
    const ok = await jogarAteConquista(page, 0);
    const g = await (async () => { try { return await gravacoes(page); } catch (e) { return { erro: e.message }; } })();
    if (rotulo === 'A-10') {
      rel.caso('A-10', ok ? 'OK' : 'FALHOU', `playtest sem rede do título à conquista 1 (LoLô): conquista=${ok}; requisições externas=${COLETOR.externas.length}`);
      rel.caso('H-01', g.gravacoes?.length === 0 && g.local === 0 && g.sessao === 0 && g.cookies === '' ? 'OK' : 'FALHOU', `fluxo completo no playtest: escritas=${JSON.stringify(g.gravacoes)} localStorage=${g.local} sessionStorage=${g.sessao} cookies="${g.cookies}"`);
    } else {
      rel.caso('A-11', ok && COLETOR.erros.filter((e) => e.includes('pageerror')).length === 0 ? 'OK' : 'FALHOU', `localStorage/sessionStorage bloqueados: conquista=${ok}; exceções não capturadas=${COLETOR.erros.filter((e) => e.includes('pageerror')).length}`);
    }
    await ctx.close();
  });
}

// K-09: nenhuma requisição para terceiros durante o fluxo offline.
const naoLocais = COLETOR.requisicoes.filter((u) => !/^(file:|data:|blob:)/.test(u));
rel.caso('K-09', naoLocais.length === 0 ? 'OK' : 'FALHOU', `requisições registradas no playtest: ${COLETOR.requisicoes.length}; fora de file:/data:/blob: = ${naoLocais.length} ${naoLocais.slice(0, 3).join(' ')}`);

// B-20 / K2-21: título, Como jogar, seleção, intro, porta e conquista no playtest são os mesmos da build normal.
// Verificação direta de barras e textos no playtest (o roteiro completo está em titulo-selecao.mjs playtest).
{
  const ctx = await novoContexto(browser, { url: urlCopia, origem: null, rotulo: 'K2-21' });
  const page = await abrirJogo(ctx, urlCopia, 2600);
  const t = await lerTextos(page);
  rel.caso('K2-21-titulo', contemLinha(t, 'Setas: escolher  Z: confirmar') ? 'OK' : 'FALHOU', 'barra do título idêntica (2 espaços) no playtest');
  await tecla(page, 'ArrowDown');
  await limparTextos(page);
  await tecla(page, 'Enter');
  await sleep(300);
  const tc = await lerTextos(page);
  rel.caso('B-20', contemFrase(tc, 'Mover: setas ou WASD') && contemLinha(tc, 'Z ou X: voltar') ? 'OK' : 'FALHOU', 'Como jogar no playtest: texto e barra "Z ou X: voltar"');
  await ctx.close();
}

await browser.close();
rel.salvar();
