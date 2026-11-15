// QA ao vivo da rodada 13 (itens 038 a 045, planta girada, GDD 14.12.3). Build de QA: dist-qa/index.html.
// Usa lib.mjs (textos, capturas) e lib-rota.mjs (rota real pela grade do conversor). Não altera src/.
// Uso: npm run build:qa && node qa/scripts/marco1-r13-vivo.mjs
import { lancar, novoContexto, lerTextos, limparTextos, juntar, capturar, bboxDestaque, EVID } from './lib.mjs';
import { irPara, ladosDe, estado, esperarFade, esperarParado, apertarA, subarea, objeto } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(join(AQUI, '..', '..', 'dist-qa', 'index.html')).href;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'r13' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
const resultados = [];
const reg = (id, ok, nota) => { resultados.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T   ' : ok ? 'OK    ' : 'FALHOU'} ${id} ${nota}`); };
const pos = async () => { const e = await estado(page); return e ? `${e.mapa}(${e.tileX},${e.tileY}) dir=${e.direcao} trav=${e.travado} fade=${e.emFade} conducao=${e.emConducao} fase=${e.fase}` : 'null'; };
const textos = async () => juntar(await lerTextos(page));
const seta = { '1,0': 'ArrowRight', '-1,0': 'ArrowLeft', '0,1': 'ArrowDown', '0,-1': 'ArrowUp' };
const pressionar = async (k, ms = 90) => { await page.keyboard.down(k); await dormir(ms); await page.keyboard.up(k); await dormir(160); };
async function fecharTudo() { for (let i = 0; i < 8; i++) { const e = await estado(page); if (!e?.travado) return; await apertarA(page); } }
/** Vira para o objeto adjacente (aperta a direção; se o tile da frente é bloqueado, só vira). */
async function virar(estadoOuTile, o) {
  const de = estadoOuTile.tileX !== undefined ? { x: estadoOuTile.tileX, y: estadoOuTile.tileY } : estadoOuTile;
  const k = seta[`${Math.sign(o.x - de.x)},${Math.sign(o.y - de.y)}`];
  await pressionar(k, 60);
}
const tentar = async (id, fn) => { try { await fn(); } catch (e) { reg(id, false, `exceção: ${e.message.slice(0, 200)}`); } };

// ---------- Início: título -> seleção (LoLô) -> introdução -> hall ----------
await page.goto(url); await dormir(2000);
await apertarA(page); await apertarA(page); await dormir(300);
for (let i = 0; i < 4; i++) await apertarA(page);
for (let i = 0; i < 2; i++) await apertarA(page);
await dormir(400);
await fecharTudo();
let e = await estado(page);
reg('G0', e?.mapa === 'hall', `casa carregada no Hall | ${await pos()}`);

// (j) captura do Hall com Elevador
await tentar('J-hall', async () => { await capturar(page, 'r13-j-hall-elevador', 3); reg('J-hall', true, 'captura r13-j-hall-elevador.png'); });

// ---------- (d) Bilhete na parede do Hall ----------
await tentar('D-bilhete', async () => {
  const hall = subarea('hall');
  const bil = objeto('hall', 'bilhete', 'bilhete.pista');
  const lados = ladosDe('hall', 'bilhete', 'bilhete.pista');
  reg('D-info', true, `bilhete em (${bil.x},${bil.y}); vizinhos livres ${JSON.stringify(lados)}`);
  const lado = lados.find((l) => l.x === bil.x && l.y === bil.y + 1) ?? lados[0];
  await irPara(page, 'hall', lado.x, lado.y);
  const antes = await estado(page);
  await virar(antes, bil);
  await limparTextos(page);
  await apertarA(page);
  await dormir(300);
  const t1 = await textos();
  await capturar(page, 'r13-d-bilhete-p1', 3);
  reg('D-bilhete-p1', t1.includes('Um bilhete para você.'), `A no tile vizinho mostra p1 | texto="${t1.slice(0, 160)}"`);
  await apertarA(page); await dormir(200);
  const t2 = await textos();
  await capturar(page, 'r13-d-bilhete-p2', 3);
  reg('D-bilhete-p2', t2.length > 0 && t2 !== t1, `p2 aparece após A | texto="${t2.slice(0, 200)}"`);
  await fecharTudo();
  // andar sobre a parede (o bilhete) é impossível: pressiona para cima a partir do vizinho
  const p0 = await estado(page);
  await pressionar('ArrowUp', 400);
  const p1 = await estado(page);
  reg('D-parede', p1.tileX === p0.tileX && p1.tileY === p0.tileY && p1.mapa === 'hall', `andar contra o bilhete não move | ${await pos()}`);
});

// ---------- (c, b, a) Painel da porta P8 ----------
await tentar('PAINEL', async () => {
  await fecharTudo();
  const p8 = objeto('hall', 'porta', 'P8');
  const lado = ladosDe('hall', 'porta', 'P8').find((l) => l.y === p8.y + 1) ?? ladosDe('hall', 'porta', 'P8')[0];
  await irPara(page, 'hall', lado.x, lado.y);
  await virar(await estado(page), p8);
  await limparTextos(page);
  await apertarA(page); await dormir(300);
  const tp = await textos();
  await capturar(page, 'r13-b-painel-senha', 3);
  reg('B-senha-texto', tp.includes('Senha') && !/dica|últimos dígitos/i.test(tp), `painel: "Senha" presente; sem "Dica"/"últimos dígitos" | texto="${tp.slice(0, 300)}"`);
  // (a) foco: setas e WASD precisam mover igual
  // Cada par: a partir do mesmo foco inicial, a tecla WASD e a seta levam ao mesmo foco.
  // Foco do painel: pixels de borda/destaque amarelo (244,211,94) ou similar, na região das teclas.
  // O destaque pisca: amostra até 6 vezes e devolve a primeira leitura com destaque.
  const foco = async () => { for (let i = 0; i < 6; i++) { const f = await focoUma(); if (f) return JSON.stringify(f); await dormir(120); } return 'null'; };
  const focoUma = async () => (await page.evaluate(() => {
    // Canvas pode ser 240×160 (perfil v1) ou 480×352 (HD): lê na resolução real e converte para tiles-px 240 base.
    const c = document.querySelector('canvas');
    const s = c.width / 240;
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let mnx = 999, mny = 999, mxx = -1, mxy = -1;
    for (let y = Math.round(60 * s); y < Math.round(132 * s); y++) for (let x = Math.round(30 * s); x < Math.round(215 * s); x++) {
      const i = (y * c.width + x) * 4;
      if (d[i] > 200 && d[i + 1] > 160 && d[i + 2] < 140) { mnx = Math.min(mnx, x); mny = Math.min(mny, y); mxx = Math.max(mxx, x); mxy = Math.max(mxy, y); }
    }
    return mxx < 0 ? null : { x0: Math.round(mnx / s), y0: Math.round(mny / s), x1: Math.round(mxx / s), y1: Math.round(mxy / s) };
  }));
  const par = async (seta_, wasd, inversa) => {
    const s0 = await foco();
    await pressionar(seta_, 120); const r1 = await foco();
    await pressionar(inversa, 120); const back = await foco();
    await pressionar(wasd, 120); const r2 = await foco();
    await pressionar(inversa, 120); const back2 = await foco();
    return { ok: r1 === r2 && r1 !== s0 && back === s0 && back2 === s0, r1: r1.slice(0, 60), r2: r2.slice(0, 60), s0: s0.slice(0, 60) };
  };
  const pR = await par('ArrowRight', 'd', 'ArrowLeft');
  reg('A-d-igual-seta', pR.ok, `d e ArrowRight levam ao mesmo foco (direita) | seta=${pR.r1} wasd=${pR.r2}`);
  const pD = await par('ArrowDown', 's', 'ArrowUp');
  reg('A-s-igual-seta', pD.ok, `s e ArrowDown levam ao mesmo foco (baixo) | seta=${pD.r1} wasd=${pD.r2}`);
  const pL = await par('ArrowLeft', 'a', 'ArrowRight');
  reg('A-a-igual-seta', pL.ok, `a e ArrowLeft levam ao mesmo foco (esquerda) | seta=${pL.r1} wasd=${pL.r2}`);
  const pU = await par('ArrowUp', 'w', 'ArrowDown');
  reg('A-w-igual-seta', pU.ok, `w e ArrowUp levam ao mesmo foco (cima) | seta=${pU.r1} wasd=${pU.r2}`);
  // dígitos digitam sem mover o foco (o campo muda; o foco do teclado não)
  await capturar(page, 'r13-a-painel-antes-digitos', 3);
  const bd0 = await foco();
  for (const ch of ['0', '1', '7']) await pressionar(ch, 80);
  await capturar(page, 'r13-a-painel-digitos', 3);
  const bd1 = await foco();
  reg('A-digitos', bd0 === bd1, `dígitos 0,1,7 não movem o foco (bbox do destaque igual; conferir captura r13-a-painel-digitos)`);
  await capturar(page, 'r13-a-painel-digitos', 3);
  // Apagar: limpa e volta a 017
  await pressionar('Escape', 120);
  await dormir(200);
  await fecharTudo();
  // reabre e digita 017, Enter
  await apertarA(page); await dormir(300);
  await limparTextos(page);
  for (const ch of ['0', '1', '7']) await pressionar(ch, 80);
  await pressionar('Enter', 80);
  await dormir(500);
  const tAbre = await textos();
  await fecharTudo();
  await esperarFade(page).catch(() => null);
  await dormir(400);
  const eSala = await estado(page);
  reg('C-porta-P8', eSala?.mapa === 'sala', `código 017 abre a P8 e leva à Sala | ${await pos()}`);
  reg('C-abriu-texto', tAbre.includes('Clique! A porta abriu.'), `texto "Clique! A porta abriu." antes da Sala | "${tAbre.slice(0, 120)}"`);
});

/** Volta à Sala pela P7 quando o personagem está na Cozinha. */
async function voltarSala() {
  if ((await estado(page)).mapa === 'sala') return;
  await irPara(page, 'cozinha', 1, 0);
  await pressionar('ArrowLeft', 300); await esperarFade(page); await dormir(150);
}

// ---------- (e) P1 e P2 e P3 com uma só entrada e a mensagem de fechada ----------
await tentar('PORTAS-FECHADAS', async () => {
  await fecharTudo();
  await dormir(300);
  // Sala começa escura: (j) captura da Sala inteira
  await capturar(page, 'r13-j-sala-entrada', 3);
  // Na grade do conversor, P1 (6,2) e P3 (8,2) têm o tile de baixo parede; o lado livre é (5,2)/(7,2). P2 (7,1) é atingida de (7,2).
  const cima = [['P1', 5, 2], ['P2', 7, 2], ['P3', 7, 2]];
  for (const [id, x, y] of cima) {
    await tentar(`E-${id}`, async () => {
      await irPara(page, 'sala', x, y);
      await virar(await estado(page), objeto('sala', 'portaFechada', id));
      await limparTextos(page);
      const antesA = await estado(page);
      await apertarA(page); await dormir(400);
      const t = await textos();
      if (!t.includes('Essa porta')) await capturar(page, `r13-e-${id}-sem-texto`, 3);
      console.log(`   debug ${id}: de=(${antesA.tileX},${antesA.tileY}) dir=${antesA.direcao} | ${await pos()}`);
      await fecharTudo();
      reg(`E-${id}`, t.includes('Essa porta está fechada.'), `A em ${id} mostra "Essa porta está fechada." | "${t.slice(0, 120)}"`);
    });
  }
  await irPara(page, 'sala', 5, 2);
  await capturar(page, 'r13-e-sala-parede-cima', 3);
});

// ---------- (i) Sala: linha de baixo e coluna da esquerda andáveis ----------
await tentar('I-sala-andavel', async () => {
  await irPara(page, 'sala', 0, 9);
  const e1 = await estado(page);
  reg('I-coluna-esq-baixo', e1.tileX === 0 && e1.tileY === 9, `(0,9) alcançado (canto inferior esquerdo) | ${await pos()}`);
  await irPara(page, 'sala', 0, 0);
  const e2 = await estado(page);
  reg('I-coluna-esq', e2.tileX === 0 && e2.tileY === 0, `coluna da esquerda andável até (0,0) | ${await pos()}`);
  await irPara(page, 'sala', 6, 6);
});

// ---------- (f) Passagem P7 Sala <-> Cozinha ----------
await tentar('F-passagem', async () => {
  await irPara(page, 'sala', 9, 5);
  await capturar(page, 'r13-f-sala-passagem-p7', 3);
  await pressionar('ArrowRight', 300);
  await esperarFade(page);
  await dormir(200);
  const c = await estado(page);
  reg('F-ida', c?.mapa === 'cozinha', `Sala -> Cozinha pela P7 | ${await pos()}`);
  await capturar(page, 'r13-f-cozinha', 3);
  await pressionar('ArrowLeft', 300);
  await esperarFade(page);
  await dormir(200);
  const s = await estado(page);
  reg('F-volta', s?.mapa === 'sala', `Cozinha -> Sala pela P7 | ${await pos()}`);
});

// ---------- (h) Móveis bloqueiam (Sala e Cozinha) ----------
await tentar('H-moveis', async () => {
  const lista = [['sala', 'rack_tv'], ['sala', 'sofa'], ['sala', 'mesa'], ['sala', 'estante'], ['cozinha', 'fogao'], ['cozinha', 'forno'], ['cozinha', 'geladeira'], ['cozinha', 'pia']];
  for (const [mapa, id] of lista) {
    await tentar(`H-${id}`, async () => {
      if ((await estado(page)).mapa !== mapa) {
        if (mapa === 'cozinha') { await irPara(page, 'sala', 9, 5); await pressionar('ArrowRight', 300); await esperarFade(page); await dormir(150); }
        else { await irPara(page, 'cozinha', 1, 0); await pressionar('ArrowLeft', 300); await esperarFade(page); await dormir(150); }
      }
      const alvo = objeto(mapa, 'movel', id);
      const lados = ladosDe(mapa, 'movel', id);
      if (!lados.length) { reg(`H-${id}`, null, `N/T: ${id} em (${alvo.x},${alvo.y}) não tem tile livre ao lado (cercado por colisão e pelo examinável); não dá para testar o bloqueio por andar contra ele`); return; }
      const lado = lados[0];
      await irPara(page, mapa, lado.x, lado.y);
      const antes = await estado(page);
      await pressionar(seta[`${Math.sign(alvo.x - lado.x)},${Math.sign(alvo.y - lado.y)}`], 300);
      const dep = await estado(page);
      reg(`H-${id}`, dep.tileX === antes.tileX && dep.tileY === antes.tileY, `${id} em (${alvo.x},${alvo.y}) bloqueia a partir de (${lado.x},${lado.y}) | ${await pos()}`);
    });
  }
  await capturar(page, 'r13-h-moveis-sala', 3);
});

// ---------- (g) Interruptor, luzes, condução ----------
await tentar('G-interruptor', async () => {
  await fecharTudo();
  await voltarSala();
  await irPara(page, 'sala', 6, 6);
  const inter = objeto('sala', 'interruptor');
  const lados = ladosDe('sala', 'interruptor');
  reg('G-info', true, `interruptor em (${inter.x},${inter.y}); lados ${JSON.stringify(lados)}`);
  const lado = lados.find((l) => l.y === inter.y + 1) ?? lados[0];
  await irPara(page, 'sala', lado.x, lado.y);
  await virar(await estado(page), inter);
  await limparTextos(page);
  await apertarA(page); await dormir(400);
  let t = await textos();
  await capturar(page, 'r13-g-luz-acende', 3);
  for (let i = 0; i < 4 && !t.includes('Parabéns'); i++) { await apertarA(page); await dormir(200); t = await textos(); }
  reg('G-conquista', t.includes('Parabéns, você conseguiu acender as luzes.'), `tela de conquista: "${t.slice(0, 120)}"`);
  await capturar(page, 'r13-g-conquista', 3);
  // Continua: a condução começa. Botões devem estar inativos.
  await apertarA(page); await dormir(400);
  const c0 = await estado(page);
  reg('G-conducao-inicio', c0?.emConducao === true, `condução começou | ${await pos()}`);
  await capturar(page, 'r13-g-conducao-meio', 3);
  const tx = await textos();
  reg('G-barra-vazia', !/Setas|Z:|X:/.test(tx), `sem barra de controles durante a condução | texto="${tx.slice(0, 120)}"`);
  const pa = await estado(page);
  await pressionar('ArrowLeft', 200); await apertarA(page); await pressionar('x', 100);
  const pb = await estado(page);
  reg('G-botoes-inativos', pb.mapa === pa.mapa, `teclas durante a condução não mudam o trajeto (mapa/tiles) | ${await pos()}`);
  // espera chegar
  let e2 = null;
  for (let i = 0; i < 60; i++) { await dormir(150); e2 = await estado(page); if (!e2?.emConducao) break; }
  await dormir(300);
  reg('G-chegada', e2?.tileX === 3 && e2?.tileY === 7 && e2?.direcao === 'baixo', `chegou em (3,7) olhando para baixo | ${await pos()}`);
  await capturar(page, 'r13-g-chegada', 3);
  const tc = await textos();
  reg('G-arvore-dialogo', e2?.travado === true || tc.length > 0, `diálogo da árvore só na chegada (registro) | "${tc.slice(0, 120)}"`);
  await fecharTudo();
  // uma vez só: não há nova condução depois
  await dormir(600);
  const e3 = await estado(page);
  reg('G-uma-vez', e3?.emConducao !== true && e3?.tileX === 3 && e3?.tileY === 7, `sem nova condução depois da chegada | ${await pos()}`);
});

// ---------- Exploração final: captura da Cozinha e do Hall ----------
await tentar('J-final', async () => {
  await fecharTudo();
  await irPara(page, 'sala', 6, 6);
  await capturar(page, 'r13-j-sala-final', 3);
});

const falhas = resultados.filter((r) => r.ok === false);
console.log(`\nTOTAL ${resultados.length} | falhas ${falhas.length} | erros de console/página: ${erros.length}`);
if (erros.length) console.log(erros.slice(0, 10).join('\n'));
await browser.close();
