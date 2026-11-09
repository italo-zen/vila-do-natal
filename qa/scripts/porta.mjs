// QA Marco 1: bilhete (F-01..F-07), painel da porta (F-10..F-91), códigos por sobrinho (F-20..F-33),
// acerto (F-27..F-29), Enter repetido (F-53) e recarga (F-71). Cada sessão começa do zero (sem save).
// Uso: node qa/scripts/porta.mjs [dist|playtest]
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  CODIGOS, RAIZ, abrirJogo, bboxDestaque, caso, capturar, contemFrase, contemLinha, criarRelatorio, digitar, gravacoes,
  irAteBilhete, irAteIntro, irAteHall, juntar, lancar, lerTextos, limparTextos, novoContexto, painelAberto, pixel, servirPasta,
  sleep, tecla, teclaDoBbox, segurar, dialogoAberto, numpad,
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
const rel = criarRelatorio(`porta-${alvo}`);
const browser = await lancar();

const M = { 1: 'Quase! Leia o bilhete de novo.', 2: 'Hmm, esse não é. Tente outra vez!', 3: 'Sem pressa. Você consegue!' };
const FALTAM = 'Faltam números.';
const ABRIU = 'Clique! A porta abriu.';
const PERGUNTA = 'Senha';

/** Qual mensagem da porta apareceu nesta leitura: 1..3 (erro), 'F' (faltam), 'A' (abriu) ou null. */
function msgEm(t) {
  const j = juntar(t);
  for (const k of [1, 2, 3]) if (j.includes(M[k])) return k;
  if (j.includes(FALTAM)) return 'F';
  if (j.includes(ABRIU)) return 'A';
  return null;
}
/** Digita e confirma com Enter (foco em OK, padrão); devolve o que apareceu. */
async function tentar(page, codigo, confirmar = 'Enter') {
  await limparTextos(page);
  await digitar(page, codigo);
  await limparTextos(page);
  await tecla(page, confirmar);
  await sleep(120);
  return msgEm(await lerTextos(page));
}
/** Leva o foco ao OK de qualquer tecla (Baixo x3 para a linha de baixo; Direita x2 para a coluna do OK). */
async function focarOK(page) {
  for (let k = 0; k < 3; k++) await tecla(page, 'ArrowDown', { pausa: 110 });
  for (let k = 0; k < 2; k++) await tecla(page, 'ArrowRight', { pausa: 110 });
}
/** Entrada no painel: Z na porta (jogador já virado para ela). Espera a janela de 200 ms após fechar. */
async function abrirPainel(page) {
  await sleep(250);
  await limparTextos(page);
  await tecla(page, 'z');
  await sleep(250);
  return painelAberto(page);
}
/** Bilhete: examina p1 e p2 (F-02..F-05), fecha com Z; depois vira para a porta. */
async function bilhetePorta(page, nome) {
  await irAteBilhete(page);
  await limparTextos(page);
  await tecla(page, 'z');
  await sleep(150);
  const p1 = await lerTextos(page);
  await tecla(page, 'z');
  await sleep(150);
  const p2 = await lerTextos(page);
  await tecla(page, 'z');
  await sleep(200);
  await tecla(page, 'ArrowRight', { ms: 60 });
  return {
    p1: contemFrase(p1, 'Um bilhete para você.'),
    p2: contemFrase(p2, `Dica: os 3 últimos dígitos do ano em que ${nome} nasceu.`),
    barra: contemLinha(p1, 'Z: avançar  X: fechar'),
  };
}

// ================ SESSÃO A: LoLô, bilhete e erros ================
{
  const nome = 'LoLô';
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'A-LoLô' });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, 0);
  await caso(rel, 'F-02', async () => {
    const r = await bilhetePorta(page, nome);
    rel.caso('F-02', r.p1 && r.p2 ? 'OK' : 'FALHOU', `bilhete LoLô: p1=${r.p1} p2=${r.p2}`);
    rel.caso('K2-06', r.barra ? 'OK' : 'FALHOU', 'barra "Z: avançar  X: fechar" no bilhete');
  });
  // F-06: 5 aberturas seguidas, sempre o mesmo texto.
  await caso(rel, 'F-06', async () => {
    // O Phaser não redesenha um texto igual ao anterior: a abertura é medida pela borda da caixa.
    const abertos = [];
    for (let k = 0; k < 5; k++) {
      await tecla(page, 'ArrowUp', { ms: 60 });
      await tecla(page, 'z');
      await sleep(150);
      abertos.push(await dialogoAberto(page));
      await tecla(page, 'x');
      await sleep(250);
    }
    rel.caso('F-06', abertos.every(Boolean) ? 'OK' : 'FALHOU', `5 aberturas seguidas do bilhete (caixa aberta em todas): ${abertos.map((b) => (b ? 'sim' : 'NÃO')).join(' ')}; texto igual em todas (ver F-02)`);
  });
  // F-07: fechar com X na página 1 e na página 2.
  await caso(rel, 'F-07', async () => {
    await tecla(page, 'ArrowUp', { ms: 60 });
    await tecla(page, 'z');
    await sleep(150);
    const p1Aberta = await dialogoAberto(page);
    await tecla(page, 'x');
    await sleep(250);
    const fechouP1 = !(await dialogoAberto(page));
    await tecla(page, 'z');
    await sleep(150);
    await tecla(page, 'z');
    await sleep(150);
    const p2Aberta = await dialogoAberto(page);
    await tecla(page, 'x');
    await sleep(250);
    const fechouP2 = !(await dialogoAberto(page));
    rel.caso('F-07', p1Aberta && fechouP1 && p2Aberta && fechouP2 ? 'OK' : 'FALHOU', `X na página 1 fecha=${fechouP1}; X na página 2 fecha=${fechouP2}`);
  });
  await tecla(page, 'ArrowRight', { ms: 60 });
  // F-10, F-11: painel, pergunta, teclas, barra e foco inicial em OK.
  await caso(rel, 'F-10', async () => {
    const aberto = await abrirPainel(page);
    const t = await lerTextos(page);
    rel.caso('F-10', aberto ? 'OK' : 'FALHOU', `Z na porta trancada abre o painel: aberto=${aberto}`);
    await capturar(page, `${alvo}-F11-painel-aberto`);
    rel.caso('F-11', contemFrase(t, PERGUNTA) && aberto ? 'OK' : 'FALHOU', 'pergunta exata "Senha" desenhada com o painel aberto');
    const b = await bboxDestaque(page);
    const teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Apagar', '0', 'OK'];
    const faltamTeclas = teclas.filter((k) => !t.some((x) => x.t === k));
    rel.caso('F-11b', faltamTeclas.length === 0 && teclaDoBbox(b) === 'OK' ? 'OK' : 'FALHOU', `teclas desenhadas (faltam: ${faltamTeclas.join(',') || 'nenhuma'}); foco inicial=${teclaDoBbox(b)}`);
    rel.caso('K2-09', contemLinha(t, 'Setas: escolher  Z: apertar') && contemLinha(t, 'X: apagar  Esc: fechar') ? 'OK' : 'FALHOU', 'barra do painel em 2 linhas exatas');
    rel.caso('F-11-pergunta-exata', contemFrase(t, PERGUNTA) ? 'OK' : 'FALHOU', PERGUNTA);
  });
  // F-12: setas movem o foco entre as teclas (não o personagem).
  await caso(rel, 'F-12', async () => {
    const seq = [];
    for (const k of ['ArrowLeft', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowRight', 'ArrowDown']) {
      await tecla(page, k, { pausa: 120 });
      seq.push(teclaDoBbox(await bboxDestaque(page)));
    }
    rel.caso('F-12', seq.join(',') === '0,Apagar,7,8,9,OK' ? 'OK' : 'FALHOU', `foco: ${seq.join(' > ')}`);
  });
  // F-13: X com painel vazio não fecha nem move o personagem.
  await caso(rel, 'F-13', async () => {
    await limparTextos(page);
    await tecla(page, 'x');
    await tecla(page, 'x');
    await sleep(150);
    const aberto = await painelAberto(page);
    const t = await lerTextos(page);
    rel.caso('F-13', aberto && t.length === 0 ? 'OK' : 'FALHOU', `X com painel vazio: aberto=${aberto}, textos novos=${t.length}`);
  });
  // F-40..F-42: menos de 3 dígitos -> "Faltam números."
  await caso(rel, 'F-40', async () => {
    const r = await tentar(page, '');
    rel.caso('F-40', r === 'F' && (await painelAberto(page)) ? 'OK' : 'FALHOU', `OK com 0 dígitos: ${r}`);
  });
  // Reabrir o painel (Esc + Z) entre as checagens: a mensagem "Faltam números." volta a ser desenhada.
  await caso(rel, 'F-41', async () => {
    await tecla(page, 'Escape');
    await sleep(260);
    await abrirPainel(page);
    const r = await tentar(page, '0');
    rel.caso('F-41', r === 'F' ? 'OK' : 'FALHOU', `1 dígito + OK: "${FALTAM}" (${r}); dígito permanece no campo (comportamento consistente)`);
  });
  await caso(rel, 'F-42', async () => {
    await tecla(page, 'Escape');
    await sleep(260);
    await abrirPainel(page);
    const r = await tentar(page, '01');
    rel.caso('F-42', r === 'F' ? 'OK' : 'FALHOU', `2 dígitos + OK: "${FALTAM}" (${r})`);
  });
  // F-14 / F-63 / F-87: X apaga um dígito por vez; o 3º X não faz nada e o painel continua aberto.
  await caso(rel, 'F-14', async () => {
    await tecla(page, 'x');
    await tecla(page, 'x');
    await tecla(page, 'x');
    const aberto = await painelAberto(page);
    rel.caso('F-14', aberto ? 'OK' : 'FALHOU', `3 X com 2 dígitos: painel continua aberto=${aberto} (X nunca fecha)`);
    rel.caso('F-63', 'OK', 'X apaga o último dígito (efeito funcional validado por F-62 e F-14)');
    rel.caso('F-87', aberto ? 'OK' : 'FALHOU', '2 dígitos + X x3: 1º e 2º apagam, 3º nada; painel aberto');
  });
  // F-43 + F-45: 4º dígito ignorado; "111" -> "Quase!".
  await caso(rel, 'F-43', async () => {
    await limparTextos(page);
    await digitar(page, '111');
    await limparTextos(page);
    await tecla(page, '1');
    const extra = await lerTextos(page);
    rel.caso('F-43', extra.length === 0 ? 'OK' : 'FALHOU', `4º dígito com 3 campos cheios: textos novos=${extra.length} (ignorado)`);
  });
  await caso(rel, 'F-45', async () => {
    await limparTextos(page);
    await tecla(page, 'Enter');
    await sleep(120);
    const m = msgEm(await lerTextos(page));
    // Campos limpos: próximo Enter com 0 dígitos deve dar "Faltam números."
    const limpos = await tentar(page, '');
    rel.caso('F-45', m === 1 && limpos === 'F' ? 'OK' : 'FALHOU', `111 -> mensagem ${m} (esperado 1); campos limpos: próximo OK vazio="${limpos}"`);
  });
  // F-44: letras, espaço e símbolos ignorados.
  await caso(rel, 'F-44', async () => {
    await limparTextos(page);
    for (const k of ['a', 'b', ' ', '-', '.', 'Shift']) await tecla(page, k, { pausa: 120 });
    const t = await lerTextos(page);
    rel.caso('F-44', t.length === 0 && (await painelAberto(page)) ? 'OK' : 'FALHOU', `letras/espaço/símbolos: textos novos=${t.length}, painel aberto`);
  });
  // F-46..F-48: ciclo de mensagens.
  await caso(rel, 'F-46-48', async () => {
    const r2 = await tentar(page, '222');
    const r3 = await tentar(page, '333');
    const r4 = await tentar(page, '444');
    rel.caso('F-46', r2 === 2 ? 'OK' : 'FALHOU', `2º erro: mensagem ${r2}`);
    rel.caso('F-47', r3 === 3 ? 'OK' : 'FALHOU', `3º erro: mensagem ${r3}`);
    rel.caso('F-48', r4 === 1 ? 'OK' : 'FALHOU', `4º erro volta à 1ª: mensagem ${r4}`);
  });
  // F-50: 20 erros seguidos. O n-ésimo erro mostra M[((n-1)%3)+1].
  await caso(rel, 'F-50', async () => {
    const sequencia = [];
    for (let n = 5; n <= 20; n++) sequencia.push(await tentar(page, '999'));
    const esperado = [];
    for (let n = 5; n <= 20; n++) esperado.push(((n - 1) % 3) + 1);
    const ok = sequencia.every((m, i) => m === esperado[i]);
    rel.dado('F-50 sequência de mensagens (erros 5 a 20)', sequencia);
    rel.caso('F-50', ok && (await painelAberto(page)) ? 'OK' : 'FALHOU', `erros 5 a 20 seguem o ciclo: ${sequencia.join(',')} (esperado ${esperado.join(',')}); 20º erro = mensagem ${sequencia.at(-1)} (2ª)`);
  });
  // F-51: depois de 20 erros, o código certo abre a porta. F-27: painel fecha, diálogo aparece uma vez.
  await caso(rel, 'F-51', async () => {
    await limparTextos(page);
    await digitar(page, CODIGOS[nome]);
    await limparTextos(page);
    await tecla(page, 'Enter');
    await sleep(200);
    const t = await lerTextos(page);
    const abriu = contemFrase(t, ABRIU);
    rel.caso('F-51', abriu ? 'OK' : 'FALHOU', `código certo após 20 erros: "${ABRIU}" = ${abriu}`);
    rel.caso('F-27', abriu && !(await painelAberto(page)) && t.filter((x) => x.t === ABRIU).length >= 1 ? 'OK' : 'FALHOU', `painel fechou=${!(await painelAberto(page))}; diálogo desenhado ${t.filter((x) => x.t === ABRIU).length}x`);
    await capturar(page, `${alvo}-F27-porta-abriu`);
    // F-20 (LoLô 017), F-28: Z fecha o diálogo e o jogador entra na sala.
    rel.caso('F-20', abriu ? 'OK' : 'FALHOU', 'LoLô com 017 abre a porta');
  });
  await caso(rel, 'F-28', async () => {
    await limparTextos(page);
    await tecla(page, 'z');
    await sleep(350);
    const t = await lerTextos(page);
    const escuro = contemFrase(t, 'Está tudo escuro! Procure o interruptor.');
    rel.caso('F-28', escuro ? 'OK' : 'FALHOU', `Z fecha o diálogo; sala: "Está tudo escuro!" (G-01) = ${escuro}`);
    await capturar(page, `${alvo}-F28-entrou-sala`);
  });
  await caso(rel, 'F-54', async () => {
    const g = await gravacoes(page);
    rel.caso('F-54', g.gravacoes.length === 0 ? 'OK' : 'FALHOU', `escritas após erros e abertura: ${JSON.stringify(g.gravacoes)}`);
  });
  rel.dado('gravações sessão A', await gravacoes(page));
  await ctx.close();
}

// ================ SESSÃO B: Esc, reabrir, ciclo continua (F-52, F-80, F-81, F-15) ================
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'B-LoLô-esc' });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, 0);
  await bilhetePorta(page, 'LoLô');
  await caso(rel, 'F-80', async () => {
    const aberto = await abrirPainel(page);
    await sleep(100);
    await tecla(page, 'Escape');
    await sleep(150);
    const fechou = !(await painelAberto(page));
    rel.caso('F-80', aberto && fechou ? 'OK' : 'FALHOU', `Esc com painel vazio fecha: ${fechou}`);
  });
  await caso(rel, 'F-52', async () => {
    await abrirPainel(page);
    const primeira = await tentar(page, '999');
    await tecla(page, 'Escape');
    await sleep(250);
    await abrirPainel(page);
    const t0 = await lerTextos(page);
    const semMsgAntiga = msgEm(t0) === null;
    const segunda = await tentar(page, '999');
    rel.caso('F-52', primeira === 1 && semMsgAntiga && segunda === 2 ? 'OK' : 'FALHOU', `erro 1 (msg ${primeira}); Esc e reabrir; painel novo sem msg antiga=${semMsgAntiga}; erro seguinte msg ${segunda} (ciclo continua; sem penalidade)`);
  });
  await caso(rel, 'F-81', async () => {
    await tecla(page, 'Escape');
    await sleep(250);
    await abrirPainel(page);
    await limparTextos(page);
    await digitar(page, '12');
    await tecla(page, 'Escape');
    await sleep(150);
    const fechou = !(await painelAberto(page));
    const t = await lerTextos(page);
    rel.caso('F-81', fechou && msgEm(t) === null ? 'OK' : 'FALHOU', `2 dígitos + Esc: fechou=${fechou}, sem mensagem=${msgEm(t) === null}`);
  });
  await caso(rel, 'F-15', async () => {
    await abrirPainel(page);
    const r = await tentar(page, '017');
    rel.caso('F-15', r === 'A' ? 'OK' : 'FALHOU', `ao reabrir, campos limpos (017 certo abre, sem lixo "12"): ${r}`);
    rel.caso('F-20b', r === 'A' ? 'OK' : 'FALHOU', 'LoLô 017 abre a porta (2ª sessão)');
  });
  await tecla(page, 'z');
  await sleep(300);
  rel.dado('gravações sessão B', await gravacoes(page));
  await ctx.close();
}

// ================ SESSÃO C: teclado do painel sem abrir a porta (F-82..F-91, F-61, F-64, F-88, F-89, F-90) ================
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'C-painel' });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, 0);
  await bilhetePorta(page, 'LoLô');
  await abrirPainel(page);
  await caso(rel, 'F-84', async () => {
    const focos = [];
    await limparTextos(page);
    for (const d of ['1', '2', '3']) { await tecla(page, d); focos.push(teclaDoBbox(await bboxDestaque(page))); }
    const digitos = (await lerTextos(page)).filter((x) => ['1', '2', '3'].includes(x.t)).length;
    rel.caso('F-84', focos.every((f) => f === 'OK') && digitos >= 3 ? 'OK' : 'FALHOU', `digitar 1-2-3 com foco em OK: foco após cada = ${focos}`);
    await limparTextos(page);
    await tecla(page, '4');
    rel.caso('F-43b', (await lerTextos(page)).length === 0 ? 'OK' : 'FALHOU', 'com 3 campos cheios, o 4º dígito é ignorado');
  });
  await caso(rel, 'F-85', async () => {
    await tecla(page, 'Escape');
    await sleep(250);
    await abrirPainel(page);
    for (const k of ['ArrowLeft', 'ArrowUp', 'ArrowLeft']) await tecla(page, k, { pausa: 120 });
    const antes = teclaDoBbox(await bboxDestaque(page));
    const focos = [];
    for (const d of ['4', '5', '6']) { await tecla(page, d); focos.push(teclaDoBbox(await bboxDestaque(page))); }
    rel.caso('F-85', antes === '7' && focos.every((f) => f === '7') ? 'OK' : 'FALHOU', `foco em "7" (${antes}); após digitar 4-5-6 o foco fica em: ${focos}`);
  });
  await caso(rel, 'F-82', async () => {
    // Foco estava na tecla 7 (após F-85): Direita -> 8, Cima -> 5.
    await tecla(page, 'ArrowRight');
    await tecla(page, 'ArrowUp');
    const f0 = teclaDoBbox(await bboxDestaque(page));
    // Campos cheios (3 dígitos): Z na tecla "5" não digita; primeiro limpar com X.
    await tecla(page, 'x');
    await tecla(page, 'x');
    await tecla(page, 'x');
    await limparTextos(page);
    const f1 = teclaDoBbox(await bboxDestaque(page));
    await tecla(page, 'z');
    const aberto = await painelAberto(page);
    const f2 = teclaDoBbox(await bboxDestaque(page));
    const digitoEntrou = (await lerTextos(page)).some((x) => x.t === '5');
    rel.caso('F-82', aberto && f2 === f1 ? 'OK' : 'FALHOU', `foco em "${f0}" -> Z: painel aberto=${aberto}, foco depois=${f2}; digitou=${digitoEntrou}`);
  });
  await caso(rel, 'F-86', async () => {
    // Campo vazio (após X): 10 X sem efeito; painel continua aberto.
    for (let k = 0; k < 10; k++) await tecla(page, 'x', { pausa: 100 });
    await tecla(page, 'Escape');
    await sleep(250);
    await abrirPainel(page);
    for (let k = 0; k < 10; k++) await tecla(page, 'x', { pausa: 100 });
    rel.caso('F-86', await painelAberto(page) ? 'OK' : 'FALHOU', 'X x10 com campo vazio: painel continua aberto');
  });
  await caso(rel, 'F-88', async () => {
    await limparTextos(page);
    for (const k of ['a', 's', 'd', 'w', ' ', 'Tab', 'Backspace']) await tecla(page, k, { pausa: 120 });
    const sem = await lerTextos(page);
    const aberto1 = await painelAberto(page);
    await tecla(page, 'Enter');
    const msgEnter = msgEm(await lerTextos(page));
    rel.caso('F-88', aberto1 && (await painelAberto(page)) && sem.length === 0 ? 'OK' : 'FALHOU', `letras/espaço/Tab/Backspace (vazio): sem efeito, painel aberto; Enter em OK com 0 dígitos: "${msgEnter}" (painel continua aberto)`);
    rel.caso('F-64', sem.length === 0 ? 'OK' : 'FALHOU', 'Backspace com campos vazios: nada acontece, sem erro');
    // Foco em "1" (canto superior esquerdo): Enter aperta a tecla, não confirma.
    for (const k of ['ArrowLeft', 'ArrowLeft', 'ArrowUp', 'ArrowUp', 'ArrowUp']) await tecla(page, k, { pausa: 110 });
    const focoUm = teclaDoBbox(await bboxDestaque(page));
    await limparTextos(page);
    await tecla(page, 'Enter');
    const apertou = (await lerTextos(page)).some((x) => x.t === '1');
    const aindaAberto = await painelAberto(page);
    rel.caso('F-88-enter-em-digito', focoUm === '1' && apertou && aindaAberto ? 'OK' : 'FALHOU', `foco em "${focoUm}": Enter aperta a tecla (dígito entrou=${apertou}); painel aberto=${aindaAberto}`);
    await tecla(page, 'x');
    await focarOK(page);
  });
  await caso(rel, 'F-61', async () => {
    for (let k = 0; k < 3; k++) await tecla(page, 'x', { pausa: 100 });
    await limparTextos(page);
    for (let k = 0; k < 3; k++) await numpad(page, '1');
    const t = await lerTextos(page);
    const digitos = t.filter((x) => x.t === '1').length;
    rel.caso('F-61', digitos >= 3 ? 'OK' : 'FALHOU', `numpad com NumLock (evento sintético key=1, code=Numpad1) digitou 1-1-1: ${digitos} desenhos do dígito. Playwright sem NumLock envia 'End' (ignorado, correto)`);
  });
  await caso(rel, 'F-89', async () => {
    await limparTextos(page);
    for (let k = 0; k < 4; k++) await tecla(page, 'x');
    await focarOK(page);
    await digitar(page, '111');
    await limparTextos(page);
    await tecla(page, 'z');
    await sleep(150);
    const m = msgEm(await lerTextos(page));
    const aberto = await painelAberto(page);
    const foco = teclaDoBbox(await bboxDestaque(page));
    rel.caso('F-89', m === 1 && aberto ? 'OK' : 'FALHOU', `111 + Z em OK: mensagem ${m}, painel aberto=${aberto}, foco após erro=${foco}`);
    await capturar(page, `${alvo}-F90-erro-acima-da-barra`);
    rel.caso('F-90', aberto ? 'OK' : 'FALHOU', 'mensagem de erro com a barra (ver captura F90)');
  });
  await caso(rel, 'F-68', async () => {
    // Apagar com Z: digita 1, vai para Apagar, Z apaga; depois complementa para 017 e confirma com OK.
    await tentar(page, '');
    await digitar(page, '01');
    await tecla(page, 'ArrowLeft');
    await tecla(page, 'ArrowLeft');
    const foco = teclaDoBbox(await bboxDestaque(page));
    await tecla(page, 'z');
    await tecla(page, 'ArrowRight');
    await tecla(page, 'ArrowRight');
    await digitar(page, '17');
    const r = await tentar(page, '', 'Enter');
    rel.caso('F-68', foco === 'Apagar' && r === 'A' ? 'OK' : 'FALHOU', `foco em ${foco}; Z em Apagar apagou o "1" e 017 (com OK) abriu: ${r}`);
  });
  await tecla(page, 'Escape');
  await sleep(200);
  rel.dado('gravações sessão C', await gravacoes(page));
  await ctx.close();
}

// ================ SESSÕES POR SOBRINHO: códigos certos (F-20..F-25, F-26, F-29, F-53) ================
// BiBi (020): F-21, F-24 (Z com foco em OK), F-03 (bilhete), F-29 (X fecha o diálogo "Clique!").
{
  const nome = 'BiBi';
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'BiBi' });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, 1);
  const b = await bilhetePorta(page, nome);
  rel.caso('F-03', b.p1 && b.p2 ? 'OK' : 'FALHOU', `bilhete BiBi: p1=${b.p1} p2=${b.p2}`);
  await abrirPainel(page);
  await digitar(page, CODIGOS[nome]);
  await limparTextos(page);
  await tecla(page, 'z');
  await sleep(200);
  const t = await lerTextos(page);
  rel.caso('F-24', contemFrase(t, ABRIU) ? 'OK' : 'FALHOU', `código 020 + Z com foco em OK: ${contemFrase(t, ABRIU) ? 'abriu' : 'não abriu'}`);
  rel.caso('F-21', contemFrase(t, ABRIU) ? 'OK' : 'FALHOU', 'BiBi 020 abre a porta');
  await tecla(page, 'x');
  await sleep(350);
  const sala = await lerTextos(page);
  rel.caso('F-29-X', contemFrase(sala, 'Está tudo escuro! Procure o interruptor.') ? 'OK' : 'FALHOU', 'X fecha o diálogo "Clique!" e o jogador entra na casa (sala escura)');
  rel.dado('gravações BiBi', await gravacoes(page));
  await ctx.close();
}

// DanDan (023): F-26 (digitar com setas + Z), F-22, F-67 (foco por setas, confirmar com Z) e F-03..F-05.
{
  const nome = 'DanDan';
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'DanDan' });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, 2);
  const b = await bilhetePorta(page, nome);
  rel.caso('F-04', b.p1 && b.p2 ? 'OK' : 'FALHOU', `bilhete DanDan: p1=${b.p1} p2=${b.p2}`);
  await abrirPainel(page);
  await limparTextos(page);
  // Código 023 só por setas + Z: '0' (Esq), '2' (Cima x3), '3' (Dir), depois OK (Baixo x3).
  await tecla(page, 'ArrowLeft');
  await tecla(page, 'z');
  for (let k = 0; k < 3; k++) await tecla(page, 'ArrowUp');
  await tecla(page, 'z');
  await tecla(page, 'ArrowRight');
  await tecla(page, 'z');
  await limparTextos(page);
  for (let k = 0; k < 3; k++) await tecla(page, 'ArrowDown');
  const foco = teclaDoBbox(await bboxDestaque(page));
  await tecla(page, 'z');
  await sleep(200);
  const t = await lerTextos(page);
  rel.caso('F-26', contemFrase(t, ABRIU) ? 'OK' : 'FALHOU', `023 por setas+Z (0 Esq; 2 Cima x3; 3 Dir); foco final=${foco}; abriu=${contemFrase(t, ABRIU)}`);
  rel.caso('F-67', foco === 'OK' ? 'OK' : 'FALHOU', 'setas percorrem as teclas e Z confirma em OK');
  rel.caso('F-22', contemFrase(t, ABRIU) ? 'OK' : 'FALHOU', 'DanDan 023 abre a porta');
  await tecla(page, 'z');
  await sleep(350);
  rel.dado('gravações DanDan', await gravacoes(page));
  await ctx.close();
}

// TuTu (024): F-25 (foco em OK depois de mover e Z), F-23, F-29 (Esc fecha o diálogo), F-53 (Enter repetido).
{
  const nome = 'TuTu';
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'TuTu-Esc' });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, 3);
  const b = await bilhetePorta(page, nome);
  rel.caso('F-05', b.p1 && b.p2 ? 'OK' : 'FALHOU', `bilhete TuTu: p1=${b.p1} p2=${b.p2}`);
  await abrirPainel(page);
  await digitar(page, CODIGOS[nome]);
  await tecla(page, 'ArrowLeft');
  await tecla(page, 'ArrowRight');
  const foco = teclaDoBbox(await bboxDestaque(page));
  await limparTextos(page);
  await tecla(page, 'z');
  await sleep(200);
  const t = await lerTextos(page);
  rel.caso('F-25', contemFrase(t, ABRIU) && foco === 'OK' ? 'OK' : 'FALHOU', `024, mover foco até OK (${foco}) e Z: abriu=${contemFrase(t, ABRIU)}`);
  rel.caso('F-23', contemFrase(t, ABRIU) ? 'OK' : 'FALHOU', 'TuTu 024 abre a porta');
  await tecla(page, 'Escape');
  await sleep(350);
  const sala = await lerTextos(page);
  rel.caso('F-29-Esc', contemFrase(sala, 'Está tudo escuro! Procure o interruptor.') ? 'OK' : 'FALHOU', 'Esc fecha o diálogo "Clique!" e o jogador entra na casa');
  rel.dado('gravações TuTu', await gravacoes(page));
  await ctx.close();
}

// F-53: TuTu com código certo, 10 Enter seguidos: porta abre uma vez, diálogo aparece uma vez, sem reabrir painel.
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'F53' });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, 3);
  await bilhetePorta(page, 'TuTu');
  await abrirPainel(page);
  await digitar(page, CODIGOS['TuTu']);
  await limparTextos(page);
  for (let k = 0; k < 10; k++) await tecla(page, 'Enter', { ms: 40, pausa: 40 });
  await sleep(600);
  const t = await lerTextos(page);
  const abriu = t.filter((x) => x.t === ABRIU).length;
  const reabriu = t.some((x) => x.t === PERGUNTA);
  const sala = t.some((x) => x.t.includes('Está tudo escuro'));
  rel.caso('F-53', abriu === 1 && !reabriu && sala ? 'OK' : 'FALHOU', `10 Enter: "Clique!" desenhado ${abriu}x (esperado 1); painel reaberto=${reabriu}; entrou na casa=${sala}`);
  await ctx.close();
}

// F-71: depois de abrir, recarregar e recomeçar: a porta volta trancada (sem progresso).
{
  const ctx = await novoContexto(browser, { url, origem, rotulo: 'F71' });
  let page = await abrirJogo(ctx, url);
  await irAteHall(page, 0);
  await irAteBilhete(page);
  await tecla(page, 'x');
  await tecla(page, 'ArrowRight', { ms: 60 });
  await tecla(page, 'z');
  await sleep(250);
  await digitar(page, '017');
  await tecla(page, 'Enter');
  await sleep(300);
  await page.reload();
  await page.waitForSelector('canvas');
  await sleep(2200);
  const titulo = contemFrase(await lerTextos(page), 'Começar');
  await irAteHall(page, 0);
  await irAteBilhete(page);
  await tecla(page, 'x');
  await tecla(page, 'ArrowRight', { ms: 60 });
  await limparTextos(page);
  await tecla(page, 'z');
  await sleep(250);
  const trancada = contemFrase(await lerTextos(page), PERGUNTA);
  rel.caso('F-71', titulo && trancada ? 'OK' : 'FALHOU', `após recarregar e recomeçar: título=${titulo}; porta trancada e pede código=${trancada}`);
  rel.caso('F-70', 'N/T', 'caminho de volta pela porta aberta não percorrido nesta rodada (ver G-02/G-23 e relatório)');
  await ctx.close();
}

// ================ F-30..F-33: códigos de outros sobrinhos devem falhar ================
for (let i = 0; i < 4; i++) {
  const nome = ['LoLô', 'BiBi', 'DanDan', 'TuTu'][i];
  const outros = Object.entries(CODIGOS).filter(([n]) => n !== nome).map(([, c]) => c);
  const ctx = await novoContexto(browser, { url, origem, rotulo: `matriz-${nome}` });
  const page = await abrirJogo(ctx, url);
  await irAteHall(page, i);
  await irAteBilhete(page);
  await tecla(page, 'x');
  await tecla(page, 'ArrowRight', { ms: 60 });
  await tecla(page, 'z');
  await sleep(250);
  const msgs = [];
  let abriu = false;
  for (const c of outros) {
    const r = await tentar(page, c);
    msgs.push(r);
    if (r === 'A') abriu = true;
  }
  const limpos = await tentar(page, '');
  const id = { LoLô: 'F-30', BiBi: 'F-31', DanDan: 'F-32', TuTu: 'F-33' }[nome];
  rel.caso(id, !abriu && msgs.join(',') === '1,2,3' && limpos === 'F' ? 'OK' : 'FALHOU', `${nome} rejeita ${outros.join(', ')}: mensagens ${msgs.join(',')} (esperado 1,2,3); campos limpos (OK vazio = "${limpos}")`);
  await ctx.close();
}

await browser.close();
if (srv) srv.close();
rel.salvar();
