// QA Marco 1: sala escura e penumbra (G-01..G-08), interruptor e fade (G-09..G-13), conquista 1 (G-12..G-22),
// árvore (G-16..G-19, G-27), passagem (E-14..E-15, G-20, G-26), movimento e colisão (E-03..E-11) e os 4 sobrinhos (G-21).
// Medidas por pixel do canvas: o brilho de um ponto escuro (fora do círculo de luz) é a referência.
// Uso: node qa/scripts/casa.mjs [dist|playtest]
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  CODIGOS, NOMES, RAIZ, abrirJogo, caso, capturar, contemFrase, contemLinha, criarRelatorio, dialogoAberto, digitar, gravacoes,
  irAteBilhete, irAteHall, lancar, lerTextos, limparTextos, novoContexto, pixel, segurar, servirPasta, sleep, tecla,
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
const rel = criarRelatorio(`casa-${alvo}`);
const browser = await lancar();

const ESCURO = 'Está tudo escuro! Procure o interruptor.';
const CONQUISTA = 'Parabéns, você conseguiu acender as luzes.';
const ARVORE = 'A árvore ainda está desmontada. Vamos procurar as partes!';
/** Pontos de medida (quadro 240x160): DENTRO do círculo de luz (perto do jogador no nascimento) e FORA (canto). */
const PONTO_DENTRO = [30, 76];
const PONTO_FORA = [200, 20];
/** Ponto longe do jogador na sala (fora do círculo mesmo com o jogador junto ao interruptor, em (28,2)). */
const PONTO_LONGE = [120, 60];

const brilho = ([r, g, b]) => r + g + b;
async function quadro(page) {
  return page.evaluate(() => Array.from(document.querySelector('canvas').getContext('2d').getImageData(0, 0, 240, 160).data));
}
function diferenca(a, b) {
  let n = 0;
  for (let p = 0; p < a.length; p += 4) if (a[p] !== b[p] || a[p + 1] !== b[p + 1] || a[p + 2] !== b[p + 2]) n++;
  return n;
}
function brilhoEm(q, [x, y]) {
  const i = (y * 240 + x) * 4;
  return brilho([q[i], q[i + 1], q[i + 2]]);
}
/** Referência de escuro: brilho do canto fora do círculo na sala escura (medido em G-03). */
let escuroFora = null;

/** Do título até a sala escura (porta aberta). Devolve os textos do momento em que a sala aparece. */
async function chegarNaSala(page, i, { fecharEscuro = true } = {}) {
  await irAteHall(page, i);
  await irAteBilhete(page);
  await tecla(page, 'x');
  await tecla(page, 'ArrowRight', { ms: 60 });
  await tecla(page, 'z');
  await sleep(250);
  await digitar(page, CODIGOS[NOMES[i]]);
  await tecla(page, 'Enter');
  await sleep(250);
  await tecla(page, 'z'); // fecha "Clique! A porta abriu." -> entra -> "Está tudo escuro!"
  await sleep(350);
  const aoEntrar = await lerTextos(page);
  if (fecharEscuro) {
    await tecla(page, 'z');
    await sleep(300);
  }
  return aoEntrar;
}
/** Da entrada da sala (15,4): sobe 2 tiles, anda até (28,2), de frente para o interruptor (29,2), e Z. */
async function examinarInterruptor(page) {
  await segurar(page, 'ArrowUp', 500);
  await segurar(page, 'ArrowRight', 3300);
  await tecla(page, 'z');
}

// ================ SESSÃO 1: LoLô — penumbra, movimento, interruptor, fade, conquista, árvore, passagem ================
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'casa-LoLô' });
  const page = await abrirJogo(ctx, url);
  const aoEntrar = await chegarNaSala(page, 0);
  await caso(rel, 'G-01', async () => {
    rel.caso('G-01', contemFrase(aoEntrar, ESCURO) ? 'OK' : 'FALHOU', `ao entrar na sala escura: "${ESCURO}" = ${contemFrase(aoEntrar, ESCURO)}`);
  });

  // G-03/G-04: penumbra. Fora do círculo a sala escurece sem preto total; dentro do círculo (perto do jogador) é mais clara.
  await caso(rel, 'G-03-G-04', async () => {
    const q = await quadro(page);
    escuroFora = brilhoEm(q, PONTO_FORA);
    const dentro = brilhoEm(q, PONTO_DENTRO);
    rel.caso('G-03', escuroFora > 0 && escuroFora < 330 ? 'OK' : 'FALHOU', `camada escura fora do círculo: brilho ${escuroFora} (nunca preto total)`);
    rel.caso('G-04', dentro > escuroFora + 40 ? 'OK' : 'FALHOU', `círculo de luz ao redor do jogador: brilho dentro ${dentro} vs fora ${escuroFora}; borda em degraus: conferir captura G03`);
    await capturar(page, `${alvo}-G03-penumbra`);
  });

  // G-05 / E-01: as 4 direções movem o jogador com penumbra.
  await caso(rel, 'G-05-E-01', async () => {
    const dirs = ['ArrowRight', 'ArrowDown', 'ArrowUp', 'ArrowLeft'];
    const mudou = [];
    let q0 = await quadro(page);
    for (const d of dirs) {
      await segurar(page, d, 300);
      const q1 = await quadro(page);
      mudou.push(diferenca(q0, q1));
      q0 = q1;
    }
    const ok = mudou.every((n) => n > 0);
    rel.caso('G-05', ok ? 'OK' : 'FALHOU', `direita/baixo/cima/esquerda: pixels mudados ${mudou.join(', ')} (círculo acompanha o jogador)`);
    rel.caso('E-01', ok ? 'OK' : 'FALHOU', 'setas movem nas 4 direções na sala');
  });
  // E-04: ao soltar, para (direção para a direita: não sai da sala pela porta, que está aberta).
  await caso(rel, 'E-04', async () => {
    await page.keyboard.down('ArrowRight');
    await sleep(200);
    await page.keyboard.up('ArrowRight');
    await sleep(60);
    const q0 = await quadro(page);
    await sleep(400);
    const q1 = await quadro(page);
    rel.caso('E-04', diferenca(q0, q1) === 0 ? 'OK' : 'FALHOU', 'ao soltar a tecla, para (sem deslizar)');
  });

  rel.caso('G-08', 'OK', 'mapa: entrada da sala (15,4), interruptor (29,2): 14 tiles de distância, parede do fundo (última coluna da sala)');
  rel.caso('G-09', 'N/T', 'brilho fraco do interruptor não medido por pixel nesta rodada (ver captura G10)');

  // G-10 / G-11: examinar o interruptor -> "Clique!" -> Z fecha -> fade ~0,5 s.
  await caso(rel, 'G-10-G-11', async () => {
    await limparTextos(page);
    await examinarInterruptor(page);
    const t = await lerTextos(page);
    const clique = contemFrase(t, 'Clique!');
    rel.caso('G-10', clique ? 'OK' : 'FALHOU', `examinar o interruptor mostra "Clique!": ${clique}`);
    await capturar(page, `${alvo}-G10-clique`);
    // Ponto longe do jogador, fora da caixa de diálogo: lido com o diálogo aberto (escuro) e logo após fechar (fade).
    const escuro = brilhoEm(await quadro(page), PONTO_LONGE);
    await page.keyboard.down('z');
    await sleep(40);
    await page.keyboard.up('z');
    const seq = [escuro];
    for (let k = 0; k < 4; k++) {
      await sleep(45);
      seq.push(brilhoEm(await quadro(page), PONTO_LONGE));
    }
    rel.dado('G-11 brilho do ponto longe: escuro e depois do Z (amostras)', seq);
    rel.caso('G-11', seq[seq.length - 1] > seq[0] + 40 ? 'OK' : 'FALHOU', `escuro some com fade: brilho ${seq[0]} -> ${seq[seq.length - 1]} (amostras ~0,2 s depois do Z; fade de 0,5 s)`);
  });
  await caso(rel, 'G-12-G-13-K2-10', async () => {
    const t = await lerTextos(page);
    await capturar(page, `${alvo}-G13-conquista-1`);
    rel.caso('G-12', contemFrase(t, CONQUISTA) ? 'OK' : 'FALHOU', 'após o fade, a tela de conquista 1 aparece');
    rel.caso('G-13', contemFrase(t, CONQUISTA) && contemFrase(t, 'Continuar') ? 'OK' : 'FALHOU', `texto exato "${CONQUISTA}" e "Continuar"`);
    rel.caso('K2-10', contemLinha(t, 'Z ou X: continuar') ? 'OK' : 'FALHOU', 'barra "Z ou X: continuar"');
  });
  // G-14 / K2-16: 30 s na conquista sem apertar nada.
  await caso(rel, 'G-14-K2-16', async () => {
    await limparTextos(page);
    await sleep(30000);
    const t = await lerTextos(page);
    rel.caso('G-14', t.length === 0 ? 'OK' : 'FALHOU', `30 s na conquista sem apertar: redesenhos=${t.length} (não avança sozinha)`);
    rel.caso('K2-16', t.length === 0 ? 'OK' : 'FALHOU', 'barra e tela fixas por 30 s');
  });
  // G-16 / G-23 / K2-11: continuar -> nasce ao lado da árvore, com luzes; sem o aviso de escuro; barra da exploração.
  await caso(rel, 'G-16-G-23-K2-11', async () => {
    await limparTextos(page);
    await tecla(page, 'z');
    await sleep(350);
    const t = await lerTextos(page);
    const semEscuro = !contemFrase(t, ESCURO);
    const q = await quadro(page);
    const luzes = brilhoEm(q, PONTO_FORA) > escuroFora + 60;
    rel.caso('G-16', luzes ? 'OK' : 'FALHOU', `continuar: luzes acesas (brilho fora ${brilhoEm(q, PONTO_FORA)} vs escuro ${escuroFora})`);
    rel.caso('G-23', semEscuro ? 'OK' : 'FALHOU', 'controle volta na hora; "Está tudo escuro!" não reaparece');
    rel.caso('K2-11', contemLinha(t, 'Setas: andar  Z: examinar') && !t.some((x) => /X: voltar|X: fechar/.test(x.t)) ? 'OK' : 'FALHOU', 'barra da exploração "Setas: andar  Z: examinar", sem X');
    await capturar(page, `${alvo}-G16-nasce-ao-lado-arvore`);
  });
  // G-18 / G-27 / G-17: a árvore.
  await caso(rel, 'G-18', async () => {
    await limparTextos(page);
    await tecla(page, 'z');
    await sleep(250);
    const t = await lerTextos(page);
    rel.caso('G-18', contemFrase(t, ARVORE) ? 'OK' : 'FALHOU', `examinar a árvore: "${ARVORE}"`);
  });
  await caso(rel, 'G-27', async () => {
    // Cada Z abre a caixa (medido pela borda; texto igual não é redesenhado). A caixa fecha no Z seguinte.
    const abertas = [];
    for (let k = 0; k < 3; k++) {
      if (k > 0) await tecla(page, 'z');
      await sleep(200);
      abertas.push(await dialogoAberto(page));
      await tecla(page, 'z');
      await sleep(250);
    }
    rel.caso('G-27', abertas.every(Boolean) ? 'OK' : 'FALHOU', `árvore examinada 3 vezes: caixa abre em todas = ${abertas.map((b) => (b ? 'sim' : 'NÃO')).join(' ')}; fala igual (G-18)`);
  });
  rel.caso('G-17', 'OK', 'árvore em (22..23, 4..6): centro-direita da sala 15..29 (dados do mapa; conferir captura G16)');
  // G-19: interruptor de novo com luzes acesas: sem conquista nova e sem "Clique!". Da árvore (21,5) até (28,2).
  await caso(rel, 'G-19', async () => {
    await segurar(page, 'ArrowUp', 750);
    await segurar(page, 'ArrowRight', 1800);
    await limparTextos(page);
    await tecla(page, 'z');
    await sleep(300);
    const t = await lerTextos(page);
    const nova = t.some((x) => x.t === CONQUISTA || x.t === 'Clique!');
    await capturar(page, `${alvo}-G19-interruptor-depois`);
    rel.caso('G-19', !nova ? 'OK' : 'FALHOU', 'interruptor de novo, luzes acesas: sem conquista nova e sem "Clique!" (alcance na captura G19)');
  });
  // E-14 / G-20: passagem sala -> cozinha (câmera troca, sem rolagem) e cozinha clara.
  await caso(rel, 'E-14-G-20', async () => {
    // Do interruptor (28,2) até a passagem (linhas 6-7 do mapa; árvore ocupa 22-23 x 4-6): volta a x=21, desce até y≈7, Direita.
    await segurar(page, 'ArrowLeft', 1800);
    await segurar(page, 'ArrowDown', 1200);
    const antes = await quadro(page);
    await segurar(page, 'ArrowRight', 2400);
    await sleep(300);
    const depois = await quadro(page);
    await capturar(page, `${alvo}-E14-cozinha-clara`);
    rel.caso('E-14', diferenca(antes, depois) > 2000 ? 'OK' : 'FALHOU', `passagem sala->cozinha: quadro trocou (${diferenca(antes, depois)} pixels); sem rolagem (captura E14)`);
    rel.caso('G-20', brilhoEm(depois, PONTO_FORA) > escuroFora + 60 ? 'OK' : 'FALHOU', `cozinha após as luzes, sem camada escura (brilho ${brilhoEm(depois, PONTO_FORA)} vs escuro ${escuroFora})`);
  });
  // E-15 / G-26: volta à sala, que continua acesa.
  await caso(rel, 'E-15-G-26', async () => {
    const antes = await quadro(page);
    await segurar(page, 'ArrowLeft', 2400);
    await sleep(300);
    const depois = await quadro(page);
    await capturar(page, `${alvo}-E15-sala-voltou`);
    rel.caso('E-15', diferenca(antes, depois) > 2000 ? 'OK' : 'FALHOU', `volta cozinha->sala sem ficar preso na passagem (${diferenca(antes, depois)} pixels)`);
    rel.caso('G-26', brilhoEm(depois, PONTO_FORA) > escuroFora + 60 ? 'OK' : 'FALHOU', `de volta à sala após a troca de cômodo: continua acesa (brilho ${brilhoEm(depois, PONTO_FORA)} vs escuro ${escuroFora})`);
  });
  rel.dado('gravações sessão 1', await gravacoes(page));
  await ctx.close();
}

// ================ SESSÃO 2: Z em rajada no fade (G-22) e X na conquista (G-15) ================
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'casa-X' });
  const page = await abrirJogo(ctx, url);
  await chegarNaSala(page, 1);
  await examinarInterruptor(page);
  await limparTextos(page);
  await tecla(page, 'z'); // fecha "Clique!" -> fade (~0,5 s)
  await caso(rel, 'G-22', async () => {
    for (let k = 0; k < 4; k++) await tecla(page, 'z', { ms: 30, pausa: 20 });
    await sleep(1000);
    const t = await lerTextos(page);
    // O Phaser quebra o texto da conquista em 2 linhas: conta-se a 1ª linha ("Parabéns...") de cada tela de conquista.
    // Cada Text é desenhado 2x ao criar (Phaser); 2 desenhos = 1 tela de conquista. Mais que isso = tela duplicada.
    const n = t.filter((x) => x.t.startsWith('Parabéns')).length;
    rel.caso('G-22', n === 2 ? 'OK' : 'FALHOU', `Z em rajada durante o fade: linhas de "Parabéns" desenhadas ${n} (2 = uma tela de conquista; mais = duplicada)`);
  });
  await caso(rel, 'G-15-X', async () => {
    await limparTextos(page);
    await tecla(page, 'x');
    await sleep(350);
    const t = await lerTextos(page);
    const q = await quadro(page);
    const acesa = brilhoEm(q, PONTO_FORA) > 300;
    rel.caso('G-15-X', !t.some((x) => x.t === CONQUISTA) && acesa ? 'OK' : 'FALHOU', `X na conquista: continua para a sala com luzes acesas (brilho ${brilhoEm(q, PONTO_FORA)}); sem repetir a conquista`);
  });
  await ctx.close();
}

// ================ SESSÃO 3: Esc na conquista (G-15, outra rodada) ================
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'casa-Esc' });
  const page = await abrirJogo(ctx, url);
  await chegarNaSala(page, 2);
  await examinarInterruptor(page);
  await tecla(page, 'z');
  await sleep(1500);
  await limparTextos(page);
  await tecla(page, 'Escape');
  await sleep(350);
  const t = await lerTextos(page);
  const q = await quadro(page);
  rel.caso('G-15-Esc', !t.some((x) => x.t === CONQUISTA) && brilhoEm(q, PONTO_FORA) > 300 ? 'OK' : 'FALHOU', `Esc na conquista (DanDan): continua, sala acesa (brilho ${brilhoEm(q, PONTO_FORA)})`);
  await ctx.close();
}

// ================ SESSÕES 4..6: BiBi, DanDan, TuTu — fluxo completo (G-21 / G-31) ================
for (const i of [1, 2, 3]) {
  const nome = NOMES[i];
  const ctx = await novoContexto(browser, { url, origem, rotulo: `G21-${nome}` });
  const page = await abrirJogo(ctx, url);
  await chegarNaSala(page, i);
  await caso(rel, `G-21-${nome}`, async () => {
    await limparTextos(page);
    await examinarInterruptor(page);
    const clique = contemFrase(await lerTextos(page), 'Clique!');
    await tecla(page, 'z');
    await sleep(1500);
    const conquista = contemFrase(await lerTextos(page), CONQUISTA);
    await capturar(page, `${alvo}-G21-conquista-${nome}`);
    rel.caso(`G-21-${nome}`, clique && conquista ? 'OK' : 'FALHOU', `${nome}: interruptor "Clique!"=${clique}; conquista 1=${conquista}`);
    await tecla(page, 'z'); // Continuar
    await sleep(350);
    await limparTextos(page);
    await tecla(page, 'z'); // examinar a árvore
    await sleep(250);
    const arvore = contemFrase(await lerTextos(page), ARVORE);
    await capturar(page, `${alvo}-G21-arvore-${nome}`);
    rel.caso(`G-18-${nome}`, arvore ? 'OK' : 'FALHOU', `${nome} nasce ao lado da árvore e a examina (captura G21)`);
  });
  await ctx.close();
}

// ================ SESSÃO 7: diálogo aberto, movimento, colisão, Z sem objeto, sair e voltar pela porta ================
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'casa-livre' });
  const page = await abrirJogo(ctx, url);
  await chegarNaSala(page, 0, { fecharEscuro: false });
  await caso(rel, 'E-11', async () => {
    // O aviso "escuro" está aberto: setas não movem o jogador.
    const q0 = await quadro(page);
    await segurar(page, 'ArrowLeft', 500);
    const mov = diferenca(q0, await quadro(page));
    rel.caso('E-11', mov === 0 ? 'OK' : 'FALHOU', `com diálogo aberto, não anda (mudanças=${mov})`);
  });
  await caso(rel, 'E-10', async () => {
    await tecla(page, 'x');
    await sleep(300);
    await limparTextos(page);
    await tecla(page, 'x');
    await sleep(200);
    const t = await lerTextos(page);
    rel.caso('E-10', t.length === 0 && !(await dialogoAberto(page)) ? 'OK' : 'FALHOU', 'X fecha o diálogo "Está tudo escuro!"; X de novo não abre nada');
  });
  await caso(rel, 'E-08', async () => {
    await limparTextos(page);
    await tecla(page, 'z');
    await sleep(150);
    const t = await lerTextos(page);
    rel.caso('E-08', t.length === 0 ? 'OK' : 'FALHOU', 'Z sem objeto em frente: nada acontece');
  });
  await caso(rel, 'G-02', async () => {
    // Sair pela porta aberta para o hall e voltar à sala: o aviso "escuro" não repete.
    await segurar(page, 'ArrowLeft', 1100);
    await sleep(200);
    await limparTextos(page);
    await segurar(page, 'ArrowRight', 1100);
    await sleep(300);
    const t = await lerTextos(page);
    rel.caso('G-02', !t.some((x) => x.t.includes('Está tudo escuro')) ? 'OK' : 'FALHOU', 'sair pela porta e voltar: o aviso "Está tudo escuro!" não repete');
  });
  await caso(rel, 'E-05-E-06', async () => {
    // Encostar na parede de cima e segurar: não atravessa; depois consegue descer.
    await segurar(page, 'ArrowUp', 900);
    const q0 = await quadro(page);
    await segurar(page, 'ArrowUp', 600);
    const q1 = await quadro(page);
    await segurar(page, 'ArrowDown', 400);
    const q2 = await quadro(page);
    rel.caso('E-05', diferenca(q0, q1) === 0 ? 'OK' : 'FALHOU', `encostado na parede (cima), não atravessa (mudanças=${diferenca(q0, q1)})`);
    rel.caso('E-06', diferenca(q1, q2) > 0 ? 'OK' : 'FALHOU', `não fica preso: consegue andar para o lado oposto (mudanças=${diferenca(q1, q2)})`);
  });
  await caso(rel, 'E-03', async () => {
    const q0 = await quadro(page);
    await page.keyboard.down('ArrowRight');
    await page.keyboard.down('ArrowUp');
    await sleep(350);
    const q1 = await quadro(page);
    await page.keyboard.up('ArrowUp');
    await page.keyboard.up('ArrowRight');
    await sleep(200);
    rel.caso('E-03', diferenca(q0, q1) > 0 ? 'OK' : 'FALHOU', `direita+cima seguradas: movimento (${diferenca(q0, q1)} pixels). Sem diagonal: conferir captura`);
  });
  rel.caso('E-12', 'OK', 'bilhete com 2 páginas, uma por Z, última fecha (porta.mjs F-02/K2-06)');
  rel.caso('E-13', 'N/T', 'Z segurado ao abrir diálogo exige objeto em frente; não automatizado (Controles usa JustDown: leitura de código)');
  rel.dado('gravações sessão 7', await gravacoes(page));
  await ctx.close();
}

await browser.close();
if (srv) srv.close();
rel.salvar();
