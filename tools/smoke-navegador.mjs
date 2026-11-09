// Verificação headless (Chrome instalado): joga o fluxo completo com os 4 sobrinhos e confere o console.
// Uso: npm run smoke:playtest   (ou node tools/smoke-navegador.mjs <index.html> <pasta-de-capturas>)
// Saída: código 1 se houver qualquer erro ou aviso de console / exceção não capturada.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const [, , arquivoArg, saidaArg] = process.argv;
const arquivo = arquivoArg ?? 'dist-playtest/index.html';
const saida = saidaArg ?? 'dist-playtest/capturas';
mkdirSync(saida, { recursive: true });
const url = pathToFileURL(resolve(arquivo)).href;
const real = (ms) => new Promise((r) => setTimeout(r, ms));
/** Página atual: o tempo do jogo só anda por `esperar`, dentro da página (relógio virtual abaixo). */
let pagina = null;
const esperar = (ms) => pagina.evaluate((n) => window.__avancar(n), ms);

/**
 * Relógio virtual injetado antes de qualquer script da página. Date, performance.now, setTimeout,
 * setInterval e requestAnimationFrame passam a usar uma fila controlada: o tempo só anda em
 * `__avancar(ms)`, que roda os quadros (16 ms) e os temporizadores vencidos, de forma síncrona.
 * Sem tempo real, as capturas do smoke saem idênticas entre execuções (tween, pisca e pressionado).
 */
const RELOGIO_VIRTUAL = `(() => {
  let agora = 0;
  let seq = 1;
  const temporizadores = new Map();
  let quadros = new Map();
  window.setTimeout = (cb, ms = 0, ...args) => {
    const id = seq++;
    temporizadores.set(id, { vence: agora + Math.max(0, Number(ms) || 0), id, cb, args, intervalo: null });
    return id;
  };
  window.setInterval = (cb, ms = 0, ...args) => {
    const id = seq++;
    const passo = Math.max(1, Number(ms) || 0);
    temporizadores.set(id, { vence: agora + passo, id, cb, args, intervalo: passo });
    return id;
  };
  window.clearTimeout = (id) => temporizadores.delete(id);
  window.clearInterval = (id) => temporizadores.delete(id);
  window.requestAnimationFrame = (cb) => {
    const id = seq++;
    quadros.set(id, cb);
    return id;
  };
  window.cancelAnimationFrame = (id) => quadros.delete(id);
  Date.now = () => agora;
  performance.now = () => agora;
  const dispararVencidos = () => {
    for (;;) {
      let proximo = null;
      for (const t of temporizadores.values()) if (t.vence <= agora && (!proximo || t.vence < proximo.vence || (t.vence === proximo.vence && t.id < proximo.id))) proximo = t;
      if (!proximo) return;
      if (proximo.intervalo === null) temporizadores.delete(proximo.id);
      else proximo.vence += proximo.intervalo;
      proximo.cb(...proximo.args);
    }
  };
  const quadro = () => {
    const fila = quadros;
    quadros = new Map();
    for (const cb of fila.values()) cb(agora);
  };
  window.__avancar = (ms) => {
    const fim = agora + ms;
    while (agora < fim) {
      agora = Math.min(fim, agora + 16);
      dispararVencidos();
      quadro();
    }
  };
})();`;

const erros = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });

/**
 * Boot: espera o jogo ser criado (canvas no DOM, depois das promessas reais de fontes e conteúdo) e roda
 * 300 quadros, com uma pausa real entre eles para as imagens carregarem. Depois confere o título.
 */
async function aguardarTitulo(page) {
  for (let i = 0; i < 400; i++) {
    if (await page.evaluate(() => !!document.querySelector('canvas'))) break;
    await real(15);
  }
  for (let i = 0; i < 300; i++) {
    await esperar(16);
    await real(15);
  }
  const pronto = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    if (!c) return false;
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    for (let i = 0; i < d.length; i += 4) if (d[i] !== 11 || d[i + 1] !== 16 || d[i + 2] !== 48) return true;
    return false;
  });
  if (!pronto) throw new Error('O título não apareceu no canvas.');
}

async function novaPagina(rotulo) {
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  pagina = page;
  await page.addInitScript(RELOGIO_VIRTUAL);
  page.on('console', (m) => {
    if (m.type() === 'error') erros.push(`[${rotulo}] console.error: ${m.text()}`);
    if (m.type() === 'warning') erros.push(`[${rotulo}] console.warning: ${m.text()}`);
  });
  page.on('pageerror', (e) => erros.push(`[${rotulo}] pageerror: ${e.message}`));
  page.on('requestfailed', (r) => erros.push(`[${rotulo}] requestfailed: ${r.url()}`));
  await page.goto(url);
  await aguardarTitulo(page);
  await esperar(2500);
  return page;
}

/** Joga uma partida inteira com um sobrinho pelo fluxo do Marco 1 na casa real (ADR-004; GDD 14.10.8). */
// Conteúdo lido do repositório: a rota é calculada pela grade real de cada subárea, e o tempo de cada
// trecho sai da velocidade do Sobrinho (4 tiles por segundo, quadros de 16 ms).
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const lerJson = (c) => JSON.parse(readFileSync(join(RAIZ, c), 'utf-8'));
const manifesto = lerJson('content/manifest.json');
const perfil = lerJson(`content/art-profiles/${manifesto.artProfile}.json`);
const T = perfil.tile;
const TELA = perfil.sala;
const VELOCIDADE_TILES_S = 4;
const PX_POR_QUADRO = (VELOCIDADE_TILES_S * T * 16) / 1000;
const subareas = Object.fromEntries(manifesto.maps.map((m) => [m.id, lerJson(`content/${m.file}`)]));
const missao = lerJson('content/missions/marco1.json');
const deslocamentoDe = (s) => ({ x: Math.floor((TELA.colunas - s.largura) / 2), y: Math.floor((TELA.linhas - s.altura) / 2) });
const BLOQUEANTES = new Set(['arvore', 'portaFechada', 'examinavel']);
/** Estado da partida no smoke (espelho do jogo): luzes acesas e quantas peças já foram encaixadas (1, 2 ou 3). */
const partida = { luzes: false, encaixadas: 0 };
/** Peça visível bloqueia o tile (GDD 15.2.3): é a próxima da sequência; a peça 1 depois das luzes. */
const pecaVisivel = (o) => o.tipo === 'peca' && o.ordem === partida.encaixadas + 1 && (o.ordem !== 1 || partida.luzes);

/** Estado do personagem no mundo do smoke (espelho do jogo): subárea atual e centro dos pés, em px globais. */
const jog = { mapa: null, centro: { x: 0, y: 0 } };
const tileGlobalDe = (c) => ({ x: Math.floor(c.x / T), y: Math.floor(c.y / T) });
const centroDoTile = (gx, gy) => ({ x: gx * T + T / 2, y: gy * T + 24 });
/** Posiciona o modelo do smoke num tile local (usado depois de uma condução, que o próprio jogo faz). */
function posicionarEmTile(mapa, x, y, dir) {
  const d = deslocamentoDe(subareas[mapa]);
  jog.mapa = mapa;
  jog.centro = centroDoTile(x + d.x, y + d.y);
  void dir;
}
function posicionarNoSpawn(mapa, nome) {
  const s = subareas[mapa];
  const d = deslocamentoDe(s);
  const sp = s.objetos.find((o) => o.tipo === 'spawn' && o.nome === nome);
  jog.mapa = mapa;
  jog.centro = centroDoTile(sp.x + d.x, sp.y + d.y);
}
/** Caminho em tiles locais (BFS) até `alvo`, sem atravessar bloqueios, gatilhos ou objetos de interação. */
function caminho(alvo) {
  const s = subareas[jog.mapa];
  const d = deslocamentoDe(s);
  const ini = tileGlobalDe(jog.centro);
  const start = { x: ini.x - d.x, y: ini.y - d.y };
  const porta = new Set(s.objetos.filter((o) => o.tipo === 'porta').map((o) => `${o.x},${o.y}`));
  const livre = (x, y) => {
    if (x < 0 || y < 0 || x >= s.largura || y >= s.altura) return false;
    if (s.chao[y * s.largura + x] === 0 || s.colisao[y * s.largura + x]) return false;
    if (porta.has(`${x},${y}`) && !(x === alvo.x && y === alvo.y)) return false;
    if (s.objetos.some((o) => BLOQUEANTES.has(o.tipo) && o.x === x && o.y === y)) return false;
    if (s.objetos.some((o) => pecaVisivel(o) && o.x === x && o.y === y)) return false;
    return true;
  };
  const chave = (p) => `${p.x},${p.y}`;
  const antes = new Map([[chave(start), null]]);
  const fila = [start];
  while (fila.length) {
    const p = fila.shift();
    if (p.x === alvo.x && p.y === alvo.y) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const q = { x: p.x + dx, y: p.y + dy };
      if (antes.has(chave(q)) || !livre(q.x, q.y)) continue;
      antes.set(chave(q), p);
      fila.push(q);
    }
  }
  if (!antes.has(chave(alvo))) throw new Error(`Sem caminho em "${jog.mapa}" até (${alvo.x}, ${alvo.y}) a partir de (${start.x}, ${start.y}).`);
  const rota = [];
  for (let p = alvo; p; p = antes.get(chave(p))) rota.unshift(p);
  return { rota, d };
}
const TECLA_DA_DIR = { '1,0': 'ArrowRight', '-1,0': 'ArrowLeft', '0,1': 'ArrowDown', '0,-1': 'ArrowUp' };

/** Anda pelo caminho até o tile local `alvo`, segmento reto por segmento reto, com a mesma velocidade do jogo. */
async function andarPara(alvo, passo) {
  const { rota, d } = caminho(alvo);
  const segmentos = [];
  for (let i = 1; i < rota.length; i++) {
    const dx = rota[i].x - rota[i - 1].x;
    const dy = rota[i].y - rota[i - 1].y;
    const ult = segmentos[segmentos.length - 1];
    if (ult && ult.dx === dx && ult.dy === dy) ult.n++;
    else segmentos.push({ dx, dy, n: 1 });
  }
  for (const sg of segmentos) {
    const alvoGlobal = { x: rota[0].x + d.x, y: rota[0].y + d.y };
    void alvoGlobal;
    const fim = { x: jog.centro.x + sg.dx * sg.n * T, y: jog.centro.y + sg.dy * sg.n * T };
    const distancia = Math.abs(fim.x - jog.centro.x) + Math.abs(fim.y - jog.centro.y);
    const quadros = Math.round(distancia / PX_POR_QUADRO);
    const tecla = TECLA_DA_DIR[`${sg.dx},${sg.dy}`];
    await passo.segurar(tecla, quadros * 16);
    jog.centro = { x: jog.centro.x + sg.dx * quadros * PX_POR_QUADRO, y: jog.centro.y + sg.dy * quadros * PX_POR_QUADRO };
  }
}

/** Anda até um tile vizinho (4 lados) do objeto de jogo `tipo`/`id` ou `texto`, pelo primeiro vizinho alcançável. */
async function andarAoLado(tipo, chaveDoObjeto, passo) {
  const s = subareas[jog.mapa];
  const o = s.objetos.find((x) => x.tipo === tipo && (x.dados?.id ?? x.texto ?? x.nome) === chaveDoObjeto || (x.tipo === tipo && x.id === chaveDoObjeto) || (x.tipo === tipo && x.texto === chaveDoObjeto));
  if (!o) throw new Error(`Objeto ${tipo} ${chaveDoObjeto} não existe em "${jog.mapa}".`);
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const c = { x: o.x + dx, y: o.y + dy };
    // Não pisa em outro objeto (ex.: o interruptor ao lado da P1): só em tile livre de objeto.
    if (s.objetos.some((x) => x.x === c.x && x.y === c.y && x.tipo !== 'peca')) continue;
    try {
      await andarPara(c, passo);
      return;
    } catch {
      // vizinho bloqueado ou fora do piso: tenta o próximo lado
    }
  }
  throw new Error(`Nenhum lado de ${tipo} ${chaveDoObjeto} é alcançável em "${jog.mapa}".`);
}

/** Atravessa um gatilho que o personagem acabou de pisar: a subárea e o spawn vêm do JSON da porta. */
function depoisDeAtravessar(gatilho) {
  posicionarNoSpawn(gatilho.destino, gatilho.spawnDestino);
}
function gatilhoEm(tile) {
  const s = subareas[jog.mapa];
  const d = deslocamentoDe(s);
  return s.objetos.find((o) => o.tipo === 'porta' && o.x + d.x === tile.x && o.y + d.y === tile.y);
}
/** Tile local onde o personagem está, na subárea atual. */
function tileLocal() {
  const d = deslocamentoDe(subareas[jog.mapa]);
  const g = tileGlobalDe(jog.centro);
  return { x: g.x - d.x, y: g.y - d.y };
}

async function jogar(nome, indice, codigo, opcoes) {
  const page = await novaPagina(nome);
  const foto = (n) => page.screenshot({ path: `${saida}/${nome}-${n}.png` });
  const tecla = async (k, ms = 120) => {
    await page.keyboard.down(k);
    await esperar(ms);
    await page.keyboard.up(k);
    await esperar(260);
  };
  const passo = {
    segurar: async (k, ms) => {
      await page.keyboard.down(k);
      await esperar(ms);
      await page.keyboard.up(k);
      await esperar(160);
    },
  };
  const digitar = async (s) => {
    for (const ch of s) await tecla(ch, 80);
  };
  const ampliada = async (arquivo) => {
    const dataUrl = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      const o = document.createElement('canvas');
      o.width = c.width * 3;
      o.height = c.height * 3;
      const x = o.getContext('2d');
      x.imageSmoothingEnabled = false;
      x.drawImage(c, 0, 0, c.width, c.height, 0, 0, o.width, o.height);
      return o.toDataURL('image/png');
    });
    writeFileSync(`${saida}/${arquivo}`, Buffer.from(dataUrl.split(',')[1], 'base64'));
  };
  const teclaTransicao = () => esperar(800);

  // Título -> seleção -> introdução (4 páginas) -> orientação (2 páginas).
  if (nome === 'lolo') await page.screenshot({ path: `${saida}/titulo.png` });
  await tecla('z');
  for (let i = 0; i < indice; i++) await tecla('ArrowRight');
  await foto('01-selecao');
  await tecla('z');
  await esperar(300);
  for (let i = 0; i < 4; i++) await tecla('z');
  await esperar(300);
  await tecla('z');
  await tecla('z');
  await esperar(300);
  posicionarNoSpawn('hall', 'elevador');
  await foto('02-hall');
  if (nome === 'lolo') await ampliada(`${nome}-hall-3x.png`);

  // Bilhete no Hall: tile de parede em (2, 0), lido de (2, 1), virado para cima (GDD 14.10.2, item 2). 2 páginas.
  await andarPara({ x: 2, y: 1 }, passo);
  await tecla('ArrowUp', 60);
  await tecla('z');
  await foto('03-bilhete');
  await tecla('z');
  await tecla('z');

  // P8 trancada (gatilho em (3, 0)): de (3, 1), virado para cima, A abre o painel do código (GDD 14.10.2, item 3).
  await andarPara({ x: 3, y: 1 }, passo);
  await tecla('ArrowUp', 60);
  await tecla('z');
  await esperar(200);
  if (nome === 'lolo') await page.screenshot({ path: `${saida}/painel-teclas-foco-ok.png` });
  if (opcoes.testaErroDoCodigo) {
    await digitar('999');
    await tecla('Enter');
    await foto('04-painel-erro');
    for (let i = 0; i < 3; i++) await tecla('Backspace', 80);
  }
  await digitar(codigo);
  await tecla('Enter');
  await esperar(400);
  await foto('05-porta-abriu');
  await tecla('z');
  await teclaTransicao();
  posicionarNoSpawn('sala', 'P8');

  // Sala escura: o aviso da primeira entrada (GDD 14.1).
  await tecla('z');
  await foto('06-sala-escura');
  // P1 (porta fechada, em (6, 2)): de (5, 2), virado para a direita, A mostra o texto de 14.10.3.
  // Andar contra a porta (ArrowRight) não muda nada.
  await andarPara({ x: 5, y: 2 }, passo);
  await tecla('ArrowRight', 60);
  await tecla('z');
  await foto('07-porta-fechada');
  await tecla('z');
  // Interruptor (5, 3): de (5, 4), virado para cima, acende a casa e abre a conquista 1.
  await andarPara({ x: 5, y: 5 }, passo);
  await andarPara({ x: 5, y: 4 }, passo);
  await tecla('z');
  await tecla('z');
  partida.luzes = true;
  await esperar(1500);
  await foto('08-conquista');
  await tecla('z');
  await esperar(500);
  // Condução automática (GDD 14.11): o jogo leva o Sobrinho ao tile (3, 7) da Sala, de frente para baixo, para a árvore (3, 8).
  // Da frente de baixo do interruptor são 5 passos (velocidade normal): espera o trajeto, sem tecla.
  await esperar(4000);
  posicionarEmTile('sala', 3, 7, 'baixo');
  // Chegou sozinho (decisão do Diretor, PT2b; GDD 14.9.3): o diálogo da árvore (2 páginas) já está aberto, sem tecla.
  // A captura sai antes de qualquer tecla. Z avança para a página 2; Z na última fecha.
  await foto('09-chegada-dialogo-forcado');
  // BUG-R15-01: com o diálogo aberto, 4 capturas a cada 400 ms cobrem o ciclo de 2 s do halo (há um quadro no pico).
  for (let i = 1; i <= 4; i++) {
    await esperar(400);
    await foto(`09h-halo-${i}`);
  }
  await tecla('z');
  await foto('09a-chegada-pagina-2');
  await tecla('z');
  await foto('09b-depois-da-chegada');
  // Depois da chegada o jogador fica livre: A para baixo (bloqueio) mostra o texto da árvore (primeiro exame).
  await tecla('ArrowDown', 60);
  await tecla('z');
  await tecla('z');

  // Passagem P7 (gatilho (10, 5), parede da direita da Sala): anda até o spawn (9, 5) e segue para a direita.
  await andarPara({ x: 9, y: 5 }, passo);
  await passo.segurar('ArrowRight', 16 * 16);
  await teclaTransicao();
  posicionarNoSpawn('cozinha', 'P7');
  await foto('10-cozinha');
  // Pia (5, 1): de (4, 1), virado para a direita, A ao lado dela.
  await andarAoLado('examinavel', 'cozinha.pia', passo);
  await tecla('z');
  await foto('11-pia');
  await tecla('z');
  // Volta pela P7 (gatilho (0, 0)): anda até o spawn (1, 0) e segue para a esquerda.
  await andarPara({ x: 1, y: 0 }, passo);
  await passo.segurar('ArrowLeft', 16 * 16);
  await teclaTransicao();
  posicionarNoSpawn('sala', 'P7');
  await foto('12-sala-voltou');

  // Marco 2 (GDD 15; backlog 052 a 055, 059): um sobrinho percorre as três partes, os dois avisos "ainda não" alcançáveis
  // e o Escritório pela P3. Cada peça: A encostado, conquista, Continuar, condução até a Sala (3, 7), encaixe, diálogo.
  if (opcoes.marco2) {
    // Antes da parte 1 (peça 1 ainda no chão): a peça 2 (escondida, chão livre) mostra "ainda não" de (3, 1), encostado.
    // Pela Cozinha, pela P7 (gatilho (10, 5) da Sala, sai em (1, 0) da Cozinha).
    await andarPara({ x: 9, y: 5 }, passo);
    await passo.segurar('ArrowRight', 16 * 16);
    await teclaTransicao();
    posicionarNoSpawn('cozinha', 'P7');
    await andarPara({ x: 3, y: 1 }, passo);
    await tecla('z');
    await foto('13-m2-aviso-peca2-pagina1');
    await tecla('z');
    await foto('13b-m2-aviso-peca2-pagina2');
    await tecla('z');
    // Peça 3 (escondida, Lavanderia (3, 5)): "ainda não", de (3, 4), encostado por cima (GDD 15.2.7, E16 primeiro caso).
    await andarPara({ x: 3, y: 4 }, passo);
    await tecla('z');
    await foto('14-m2-aviso-peca3-pagina1');
    await tecla('z');
    await foto('14b-m2-aviso-peca3-pagina2');
    await tecla('z');
    // Volta pela P7 à Sala (9, 5) e pega a peça 1 (Sala (1, 4)), de (2, 4), encostada.
    // Antes do corredor (3, 3) → (4, 3), um toque curto para cima alinha a altura: sem ele, a deriva de ~2 px deixa os pés
    // encostados na parede (4, 4) e o movimento lateral trava (achado do QA de 2026-11-08; ver relatório do Desenvolvedor).
    await passo.segurar('ArrowUp', 16);
    await andarPara({ x: 1, y: 0 }, passo);
    await passo.segurar('ArrowLeft', 16 * 16);
    await teclaTransicao();
    posicionarNoSpawn('sala', 'P7');
    await andarPara({ x: 2, y: 4 }, passo);
    await tecla('z');
    await esperar(300);
    await foto('15-m2-conquista-parte1');
    await tecla('z');
    await esperar(3000);
    partida.encaixadas = 1;
    await esperar(1000);
    await foto('16-m2-encaixe-parte1-dialogo');
    await tecla('z');
    posicionarEmTile('sala', 3, 7, 'baixo');
    await foto('16b-m2-arvore-estado1-sem-dialogo');
    await tecla('z');
    await esperar(400);
    await foto('16c-m2-arvore-estado1-exame');
    await tecla('z');
    await foto('17-m2-arvore-estado1');

    // Parte 2: peça 2 em (4, 1), de (3, 1), encostada. Condução de 15 passos (2×), pela P7.
    await andarPara({ x: 9, y: 5 }, passo);
    await passo.segurar('ArrowRight', 16 * 16);
    await teclaTransicao();
    posicionarNoSpawn('cozinha', 'P7');
    await andarPara({ x: 3, y: 1 }, passo);
    await tecla('z');
    await esperar(300);
    await foto('18-m2-conquista-parte2');
    await tecla('z');
    await esperar(5000);
    partida.encaixadas = 2;
    await esperar(1000);
    await foto('19-m2-encaixe-parte2-dialogo');
    await tecla('z');
    posicionarEmTile('sala', 3, 7, 'baixo');
    await foto('19b-m2-arvore-estado2-sem-dialogo');
    await tecla('z');
    await esperar(400);
    await foto('19c-m2-arvore-estado2-exame');
    await tecla('z');
    await foto('20-m2-arvore-estado2');

    // Parte 3: peça 3 em (3, 5), de (3, 4), encostada. Condução de 20 passos (2×), pela P7.
    await andarPara({ x: 9, y: 5 }, passo);
    await passo.segurar('ArrowRight', 16 * 16);
    await teclaTransicao();
    posicionarNoSpawn('cozinha', 'P7');
    await andarPara({ x: 3, y: 4 }, passo);
    await tecla('z');
    await esperar(300);
    await foto('21-m2-conquista-parte3');
    await tecla('z');
    await esperar(7000);
    partida.encaixadas = 3;
    await esperar(1000);
    await foto('22-m2-encaixe-parte3-dialogo');
    await tecla('z');
    posicionarEmTile('sala', 3, 7, 'baixo');
    await foto('22b-m2-arvore-estado3-sem-dialogo');
    await tecla('z');
    await esperar(400);
    await foto('22c-m2-arvore-estado3-exame');
    await tecla('z');
    await foto('23-m2-arvore-estado3');

    // Escritório pela P3 (GDD 15.3.3): de (7, 2), andar para a direita entra no gatilho (8, 2); volta pelo gatilho (0, 5).
    await andarPara({ x: 7, y: 2 }, passo);
    await passo.segurar('ArrowRight', 16 * 16);
    await teclaTransicao();
    posicionarNoSpawn('escritorio', 'P3');
    await foto('24-m2-escritorio-pela-p3');
    await passo.segurar('ArrowLeft', 16 * 16);
    await teclaTransicao();
    posicionarNoSpawn('sala', 'P3');
    await foto('25-m2-sala-volta-pela-p3');
    console.log(`${nome}: Marco 2 percorrido (partes 1 a 3 e Escritório)`);

    // Quarto pela P2 (ADR-004 seção 13; GDD 15.3.3): de (7, 2), a seta da P2 em (7, 1) aponta para a direita. Sobe ao gatilho:
    // a travessia custa 3 passos e chega em (0, 6) do Quarto, olhando para cima (fora do gatilho (0, 7), que tem seta à esquerda).
    // Passeia pelo Quarto e volta pelo gatilho (0, 7) à Sala, chegada (7, 2) olhando para baixo.
    await andarPara({ x: 7, y: 2 }, passo);
    await foto('26-m2-sala-seta-p2');
    await passo.segurar('ArrowUp', 16 * 16);
    await teclaTransicao();
    posicionarNoSpawn('quarto', 'P2');
    await foto('27-m2-quarto-chegada');
    await andarPara({ x: 4, y: 4 }, passo);
    await foto('28-m2-quarto-passeio');
    await andarPara({ x: 0, y: 6 }, passo);
    await foto('28b-m2-quarto-antes-da-volta');
    await passo.segurar('ArrowDown', 16 * 16);
    await teclaTransicao();
    posicionarNoSpawn('sala', 'P2');
    await foto('29-m2-sala-volta-pela-p2');
    console.log(`${nome}: Marco 2, ida e volta pelo Quarto (P2) feitas`);
  }

  await page.close();
  console.log(`${nome}: partida concluída`);
}

await jogar('lolo', 0, '017', { testaErroDoCodigo: true, marco2: true });
await jogar('bibi', 1, '020', {});
await jogar('dandan', 2, '023', {});
await jogar('tutu', 3, '024', {});

await browser.close();
console.log(JSON.stringify({ erros }, null, 2));
process.exitCode = erros.length > 0 ? 1 : 0;
