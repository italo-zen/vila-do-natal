// Biblioteca de rota para o QA (build de QA: dist-qa/index.html, ver tools/build-qa.md).
// Usa window.__estado() e os JSON de content/maps/casa-real/ (grade real do conversor).
//
// Exemplo:
//   import { irPara, ladoDe, esperarFade, estado } from './lib-rota.mjs';
//   await irPara(page, 'hall', 1, 0);            // anda até (1,0) da subárea 'hall', com setas
//   const alvo = ladoDe('sala', 'portaFechada', 'P1'); // tile livre ao lado da P1
//   await irPara(page, 'sala', alvo.x, alvo.y);
//   await page.keyboard.press('z');               // A na frente/ao lado do objeto
//   await esperarFade(page);                      // espera o fade de uma troca de subárea
//
// irPara confirma a posição com __estado() após cada trecho; se não bater, lança erro com o que foi lido.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CASA = join(RAIZ, 'content', 'maps', 'casa-real');
/** Tempo para andar 1 tile: velocidade do Sobrinho (4 tiles/s) = 250 ms; 255 ms dá um pouco de folga. */
export const MS_POR_TILE = 255;
const BLOQUEANTES = new Set(['arvore', 'portaFechada', 'examinavel']);
const DIRECAO = { '1,0': 'ArrowRight', '-1,0': 'ArrowLeft', '0,1': 'ArrowDown', '0,-1': 'ArrowUp' };
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

const cache = new Map();
/** Subárea do conversor (JSON de content/maps/casa-real/<id>.json). */
export function subarea(id) {
  if (!cache.has(id)) cache.set(id, JSON.parse(readFileSync(join(CASA, `${id}.json`), 'utf-8')));
  return cache.get(id);
}
/** Estado do jogo: { mapa, tileX, tileY, direcao, emFade, travado, fase } ou null antes da casa. */
export async function estado(page) {
  return page.evaluate(() => window.__estado());
}
/** Objeto de jogo da subárea. `ref` é o id (portas, portaFechada), o texto (examinável) ou o nome (spawn). */
export function objeto(mapa, tipo, ref) {
  const s = subarea(mapa);
  const o = s.objetos.find((x) => x.tipo === tipo && (x.id === ref || x.texto === ref || x.nome === ref || (ref === undefined && x.tipo === tipo)));
  if (!o) throw new Error(`Objeto ${tipo} ${ref ?? ''} não existe em "${mapa}".`);
  return o;
}
function livreParaAndar(s, x, y, alvo, bloqueados) {
  if (x < 0 || y < 0 || x >= s.largura || y >= s.altura) return false;
  const i = y * s.largura + x;
  if (s.chao[i] === 0 || s.colisao[i]) return false;
  if (x === alvo.x && y === alvo.y) return true;
  if (bloqueados.has(`${x},${y}`)) return false;
  return true;
}
/** Tiles que não se pisa numa rota: gatilhos de porta, árvore, porta fechada e examinável. */
function bloqueadosDaRota(s) {
  const b = new Set();
  for (const o of s.objetos) if (o.tipo === 'porta' || BLOQUEANTES.has(o.tipo)) b.add(`${o.x},${o.y}`);
  return b;
}
/** Rota em tiles (BFS) da posição `de` até `para`, na grade real da subárea. Lança se não há caminho. */
export function rotaEntre(mapa, de, para) {
  const s = subarea(mapa);
  const bloqueados = bloqueadosDaRota(s);
  const chave = (p) => `${p.x},${p.y}`;
  const antes = new Map([[chave(de), null]]);
  const fila = [de];
  while (fila.length) {
    const p = fila.shift();
    if (p.x === para.x && p.y === para.y) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const q = { x: p.x + dx, y: p.y + dy };
      if (antes.has(chave(q)) || !livreParaAndar(s, q.x, q.y, para, bloqueados)) continue;
      antes.set(chave(q), p);
      fila.push(q);
    }
  }
  if (!antes.has(chave(para))) throw new Error(`Sem rota em "${mapa}" de (${de.x},${de.y}) até (${para.x},${para.y}).`);
  const rota = [];
  for (let p = para; p; p = antes.get(chave(p))) rota.unshift(p);
  return rota;
}
/** Tiles livres ao lado (4 lados) de um objeto, sem outro objeto em cima, em ordem E, O, S, N. */
export function ladosDe(mapa, tipo, ref) {
  const s = subarea(mapa);
  const o = objeto(mapa, tipo, ref);
  // Spawn não ocupa o tile para o personagem (é só ponto de chegada); os demais objetos ocupam.
  const ocupados = new Set(s.objetos.filter((x) => x.tipo !== 'spawn').map((x) => `${x.x},${x.y}`));
  const out = [];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const x = o.x + dx;
    const y = o.y + dy;
    const i = y * s.largura + x;
    if (x < 0 || y < 0 || x >= s.largura || y >= s.altura) continue;
    if (s.chao[i] === 0 || s.colisao[i] || ocupados.has(`${x},${y}`)) continue;
    out.push({ x, y });
  }
  return out;
}
/** Primeiro lado de `tipo/ref` que tem rota a partir de `de` (ou lança). */
export function ladoDe(mapa, tipo, ref, de) {
  // `de` pode ser {x, y} ou o retorno de estado() ({tileX, tileY}).
  const origem = de && de.tileX !== undefined ? { x: de.tileX, y: de.tileY } : de;
  for (const lado of ladosDe(mapa, tipo, ref)) {
    try {
      if (!origem) return lado;
      rotaEntre(mapa, origem, lado);
      return lado;
    } catch {
      // próximo lado
    }
  }
  throw new Error(`Nenhum lado de ${tipo} ${ref ?? ''} em "${mapa}" é alcançável.`);
}
/** Espera o personagem parar: sem fade e sem diálogo/painel aberto. */
export async function esperarParado(page, limiteMs = 5000) {
  const fim = Date.now() + limiteMs;
  for (;;) {
    const e = await estado(page);
    if (e && !e.travado && !e.emFade) return e;
    if (Date.now() > fim) throw new Error(`Não parou em ${limiteMs} ms: ${JSON.stringify(e)}`);
    await dormir(5);
  }
}
/** Amostragem de emFade a cada 5 ms, até o fade acabar (uma troca de subárea dura ~500 ms). */
export async function esperarFade(page, limiteMs = 3000) {
  const fim = Date.now() + limiteMs;
  let viu = false;
  for (;;) {
    const e = await estado(page);
    if (e?.emFade) viu = true;
    if (viu && e && !e.emFade) return e;
    if (!viu && Date.now() > fim) return e;
    if (Date.now() > fim + limiteMs) throw new Error(`Fade não terminou: ${JSON.stringify(e)}`);
    await dormir(5);
  }
}
/**
 * Anda até (tx, ty) da subárea `mapa`, pela rota BFS, com setas. Para cada tile da rota: lê o centro dos
 * pés (centroX/centroY de __estado), mede a distância até o centro do próximo tile e segura a seta por
 * essa distância (velocidade do Sobrinho: 4 tiles por segundo). Assim o personagem fica sempre alinhado ao
 * centro do tile e não encosta na parede do tile vizinho. Confirma o tile após cada passo; se não chega,
 * tenta de novo e, depois de `tentativas` falhas, lança erro com a posição lida.
 * Ao pisar em gatilho de porta a troca de subárea é esperada: devolve o estado do mapa de chegada.
 */
export async function irPara(page, mapa, tx, ty, { tentativas = 8 } = {}) {
  const s = subarea(mapa);
  const T = s.tile;
  const centroDoTile = (p) => ({ x: p.x * T + T / 2, y: p.y * T + 0.75 * T });
  const VELOCIDADE_PX_S = 4 * T; // 4 tiles por segundo
  let e = await esperarParado(page);
  if (e.mapa !== mapa) throw new Error(`irPara: o personagem está em "${e.mapa}", não em "${mapa}".`);
  let falhas = 0;
  while (!(e.tileX === tx && e.tileY === ty)) {
    const rota = rotaEntre(mapa, { x: e.tileX, y: e.tileY }, { x: tx, y: ty });
    const proximo = rota[1];
    const alvo = centroDoTile(proximo);
    const dx = alvo.x - e.centroX;
    const dy = alvo.y - e.centroY;
    // Eixo do passo: o que tem a maior distância (a rota só tem passos retos de 1 tile).
    const tecla = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : dy > 0 ? 'ArrowDown' : 'ArrowUp';
    const distancia = Math.max(Math.abs(dx), Math.abs(dy));
    const ms = Math.round((distancia / VELOCIDADE_PX_S) * 1000);
    if (ms > 0) {
      await page.keyboard.down(tecla);
      await dormir(ms);
      await page.keyboard.up(tecla);
    }
    await dormir(60);
    let got = await estado(page);
    if (got.mapa !== mapa) return esperarFade(page);
    if (got.tileX === proximo.x && got.tileY === proximo.y) {
      falhas = 0;
    } else {
      falhas++;
      if (falhas > tentativas) {
        throw new Error(`irPara: não chegou a (${proximo.x},${proximo.y}) em "${mapa}" depois de ${tentativas} tentativas; li (${got.tileX},${got.tileY}) centro (${got.centroX?.toFixed?.(1)},${got.centroY?.toFixed?.(1)}).`);
      }
    }
    e = await esperarParado(page);
    // O fade pode terminar depois da leitura acima: se a subárea mudou, a troca de porta aconteceu.
    if (e.mapa !== mapa) return e;
  }
  return e;
}
/** Tecla A (z) com pausa, para interagir ou avançar diálogo. */
export async function apertarA(page) {
  await page.keyboard.down('z');
  await dormir(90);
  await page.keyboard.up('z');
  await dormir(260);
}
export { readdirSync };
