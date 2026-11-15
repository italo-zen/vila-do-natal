// GERADOR DO PERFIL gba-240x160 (v1), ADR-003 seção 11. Não é usado para perfis novos.
// Gera os sprites PROVISÓRIOS (pixel art) em assets/gba-240x160/ com nomes `tipo_nome_variacao.png` (style-guide),
// e o sprites.json do perfil (tipo e quadro de cada PNG, ADR-003 seção 4).
// Não são arte final: a Arte e o Diretor substituem os PNG mantendo os mesmos nomes e tamanhos.
// Os finais dos Sobrinhos ficam em assets/sobrinhos_final/ (fora do perfil) e são copiados para a pasta do perfil.
// Uso: npm run gen:assets
import { copyFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateSync } from 'node:zlib';
import { TILES, COLUNAS_DO_TILESET } from './tiles.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(RAIZ, 'assets');
const PASTA = join(ASSETS, 'gba-240x160');
const FINAIS = join(ASSETS, 'sobrinhos_final');

// ---------- Tela RGBA mínima ----------
class Tela {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.d = new Uint8Array(w * h * 4);
  }
  pixel(x, y, cor) {
    if (!cor || x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const [r, g, b, a = 255] = cor;
    const i = (y * this.w + x) * 4;
    this.d[i] = r;
    this.d[i + 1] = g;
    this.d[i + 2] = b;
    this.d[i + 3] = a;
  }
  rect(x, y, w, h, cor) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.pixel(i, j, cor);
  }
  circulo(cx, cy, r, cor) {
    for (let j = cy - r; j <= cy + r; j++) for (let i = cx - r; i <= cx + r; i++) {
      if ((i - cx) ** 2 + (j - cy) ** 2 <= r * r) this.pixel(i, j, cor);
    }
  }
  /** Copia `outra` para (dx, dy) (usado para montar as tiras de frames). */
  colar(outra, dx, dy) {
    for (let j = 0; j < outra.h; j++) for (let i = 0; i < outra.w; i++) {
      const s = (j * outra.w + i) * 4;
      if (outra.d[s + 3] === 0) continue;
      this.pixel(dx + i, dy + j, [outra.d[s], outra.d[s + 1], outra.d[s + 2], outra.d[s + 3]]);
    }
  }
}

const hex = (s) => {
  const n = parseInt(s.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
};

function codificarPng(tela) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(tela.w, 0);
  ihdr.writeUInt32BE(tela.h, 4);
  ihdr[8] = 8; // profundidade
  ihdr[9] = 6; // RGBA
  const linhas = Buffer.alloc((tela.w * 4 + 1) * tela.h);
  for (let y = 0; y < tela.h; y++) {
    linhas[y * (tela.w * 4 + 1)] = 0; // filtro "nenhum"
    Buffer.from(tela.d.buffer, y * tela.w * 4, tela.w * 4).copy(linhas, y * (tela.w * 4 + 1) + 1);
  }
  const chunk = (tipo, dados) => {
    const t = Buffer.from(tipo, 'ascii');
    const len = Buffer.alloc(4);
    len.writeUInt32BE(dados.length, 0);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, dados])) >>> 0, 0);
    return Buffer.concat([len, t, dados, crc]);
  };
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(linhas)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function salvar(nome, tela) {
  writeFileSync(join(PASTA, `${nome}.png`), codificarPng(tela));
  console.log(`assets/gba-240x160/${nome}.png (${tela.w}×${tela.h})`);
}

/**
 * Sprites dos Sobrinhos: se a Arte entregou o final em assets/sobrinhos_final/ (mesmo nome),
 * copia o final e NÃO desenha o provisório. Os finais nunca são sobrescritos pelo gerador.
 */
function salvarSobrinho(nome, criarTela) {
  const final = join(FINAIS, `${nome}.png`);
  if (existsSync(final)) {
    copyFileSync(final, join(PASTA, `${nome}.png`));
    console.log(`assets/gba-240x160/${nome}.png (final da Arte)`);
    return;
  }
  salvar(nome, criarTela());
}

// ---------- Tiles 16×16 ----------
function desenharTile(nome) {
  const t = new Tela(16, 16);
  switch (nome) {
    case 'madeira':
      t.rect(0, 0, 16, 16, hex('#a0673a'));
      for (let y = 0; y < 16; y += 4) t.rect(0, y + 3, 16, 1, hex('#8a5630'));
      break;
    case 'cozinha':
      for (let y = 0; y < 16; y += 4) for (let x = 0; x < 16; x += 4) {
        t.rect(x, y, 4, 4, ((x + y) / 4) % 2 ? hex('#d9d3c4') : hex('#f4f1ea'));
      }
      break;
    case 'pedra':
      t.rect(0, 0, 16, 16, hex('#7d8590'));
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if ((x * 7 + y * 3) % 11 === 0) t.pixel(x, y, hex('#6a727c'));
      break;
    case 'parede':
      t.rect(0, 0, 16, 16, hex('#d8c9a8'));
      t.rect(0, 0, 16, 3, hex('#efe3c8'));
      t.rect(0, 14, 16, 2, hex('#b9a67f'));
      break;
    case 'fachada':
      t.rect(0, 0, 16, 16, hex('#8b3a2f'));
      for (let y = 0; y < 16; y += 4) t.rect(0, y, 16, 1, hex('#c9b59a'));
      for (let y = 0; y < 16; y += 4) for (let x = (y / 4) % 2 ? 4 : 0; x < 16; x += 8) t.rect(x, y, 1, 4, hex('#c9b59a'));
      break;
    case 'sofa':
      t.rect(0, 2, 16, 14, hex('#b3262f'));
      t.rect(0, 2, 3, 14, hex('#8f1c24'));
      t.rect(13, 2, 3, 14, hex('#8f1c24'));
      t.rect(3, 8, 10, 1, hex('#8f1c24'));
      break;
    case 'mesa':
      t.rect(0, 2, 16, 8, hex('#8a5a33'));
      t.rect(0, 2, 16, 1, hex('#5a3a20'));
      t.rect(0, 9, 16, 1, hex('#5a3a20'));
      t.rect(1, 10, 2, 6, hex('#5a3a20'));
      t.rect(13, 10, 2, 6, hex('#5a3a20'));
      break;
    case 'geladeira':
      t.rect(0, 0, 16, 16, hex('#eef2f5'));
      t.rect(0, 9, 16, 1, hex('#b0bcc6'));
      t.rect(12, 4, 1, 3, hex('#7d8590'));
      t.rect(12, 11, 1, 3, hex('#7d8590'));
      break;
    case 'balcao':
      t.rect(0, 0, 16, 16, hex('#b7a58a'));
      t.rect(0, 0, 16, 4, hex('#8c7a62'));
      break;
    case 'elevador_esq':
      t.rect(0, 0, 16, 16, hex('#9aa5b1'));
      t.rect(0, 0, 1, 16, hex('#5d6873'));
      t.rect(15, 0, 1, 16, hex('#c7ced6'));
      t.rect(8, 0, 1, 16, hex('#5d6873'));
      break;
    case 'elevador_dir':
      t.rect(0, 0, 16, 16, hex('#9aa5b1'));
      t.rect(0, 0, 1, 16, hex('#c7ced6'));
      t.rect(15, 0, 1, 16, hex('#5d6873'));
      t.rect(7, 0, 1, 16, hex('#5d6873'));
      t.rect(12, 7, 2, 2, hex('#f4d35e'));
      break;
    default:
      break; // vazio: transparente
  }
  return t;
}

function gerarTiles() {
  const colunas = COLUNAS_DO_TILESET;
  const linhas = Math.ceil(TILES.length / colunas);
  const t = new Tela(colunas * 16, linhas * 16);
  TILES.forEach((nome, i) => t.colar(desenharTile(nome), (i % colunas) * 16, Math.floor(i / colunas) * 16));
  salvar('tiles_casa', t);
}

// ---------- Sobrinhos: 16×24, mesma estrutura ----------
const SOBRINHOS = {
  lolo: { pele: '#f5cba7', cabelo: '#5a3217', roupa: '#d7263d', calca: '#2d4059', estilo: 'longo' },
  bibi: { pele: '#f1c27d', cabelo: '#f2b705', roupa: '#3da35d', calca: '#5b3a29', estilo: 'coque' },
  dandan: { pele: '#e0ac69', cabelo: '#2a1b0d', roupa: '#1e5aa8', calca: '#444444', estilo: 'curto' },
  tutu: { pele: '#c68642', cabelo: '#c97b2a', roupa: '#f4d35e', calca: '#7a1c2b', estilo: 'bone' },
};
const OLHO = hex('#222222');
const SAPATO = hex('#2b1b10');

/**
 * Um frame do sobrinho. dir: baixo|cima|esquerda|direita. pose: parado|andar|alto.
 * passo: 0|1 (só andar). subir: 1px de pulo na comemoração.
 */
function frameDoSobrinho(p, { dir = 'baixo', pose = 'parado', passo = 0, subir = 0 } = {}) {
  const c = SOBRINHOS[p];
  const t = new Tela(16, 24);
  const pele = hex(c.pele);
  const cabelo = hex(c.cabelo);
  const roupa = hex(c.roupa);
  const calca = hex(c.calca);
  const oy = -subir;
  const r = (x, y, w, h, cor) => t.rect(x, y + oy, w, h, cor);

  // Cabeça
  r(4, 2, 8, 8, pele);
  if (c.estilo === 'longo') {
    if (dir === 'cima') r(3, 1, 10, 9, cabelo);
    else {
      r(3, 1, 10, 4, cabelo);
      r(3, 5, 2, 9, cabelo);
      r(11, 5, 2, 9, cabelo);
    }
  } else if (c.estilo === 'coque') {
    r(6, 0, 4, 2, cabelo);
    r(4, 1, 8, dir === 'cima' ? 8 : 3, cabelo);
  } else if (c.estilo === 'curto') {
    r(4, 1, 8, dir === 'cima' ? 8 : 3, cabelo);
    if (dir !== 'cima') {
      r(3, 2, 1, 3, cabelo);
      r(12, 2, 1, 3, cabelo);
    }
  } else if (c.estilo === 'bone') {
    r(4, 0, 8, 3, roupa);
    if (dir === 'cima') r(4, 3, 8, 5, cabelo);
    else r(3, 3, 10, 1, roupa);
  }
  if (dir === 'baixo') {
    r(6, 6, 1, 1, OLHO);
    r(9, 6, 1, 1, OLHO);
  } else if (dir === 'esquerda') r(5, 6, 1, 1, OLHO);
  else if (dir === 'direita') r(10, 6, 1, 1, OLHO);

  // Corpo e braços
  r(4, 10, 8, 7, roupa);
  if (pose === 'alto') {
    r(2, 6, 2, 5, roupa);
    r(12, 6, 2, 5, roupa);
    r(2, 5, 2, 1, pele);
    r(12, 5, 2, 1, pele);
  } else {
    r(2, 10, 2, 6, roupa);
    r(12, 10, 2, 6, roupa);
    r(2, 16, 2, 2, pele);
    r(12, 16, 2, 2, pele);
  }

  // Pernas e sapatos
  if (pose === 'andar' && passo === 1) {
    r(4, 17, 2, 5, calca);
    r(10, 17, 2, 5, calca);
    r(4, 22, 2, 2, SAPATO);
    r(10, 22, 2, 2, SAPATO);
  } else {
    r(5, 17, 2, 5, calca);
    r(9, 17, 2, 5, calca);
    r(5, 22, 2, 2, SAPATO);
    r(9, 22, 2, 2, SAPATO);
  }
  return t;
}

function gerarSobrinhos() {
  for (const p of Object.keys(SOBRINHOS)) {
    salvarSobrinho(`spr_${p}_idle`, () => frameDoSobrinho(p));
    salvarSobrinho(`spr_${p}_interact`, () => frameDoSobrinho(p, { pose: 'alto' }));
    salvarSobrinho(`spr_${p}_celebrate`, () => frameDoSobrinho(p, { pose: 'alto', subir: 1 }));
    const sufixo = { baixo: 'down', cima: 'up', esquerda: 'left', direita: 'right' };
    for (const dir of Object.keys(sufixo)) {
      const tira = new Tela(32, 24);
      tira.colar(frameDoSobrinho(p, { dir, pose: 'andar', passo: 0 }), 0, 0);
      tira.colar(frameDoSobrinho(p, { dir, pose: 'andar', passo: 1 }), 16, 0);
      salvarSobrinho(`spr_${p}_walk_${sufixo[dir]}`, () => tira);
    }
  }
}

// ---------- Objetos do cenário ----------
function gerarObjetos() {
  const arvore = new Tela(32, 48);
  arvore.rect(15, 14, 2, 22, hex('#6b4226')); // tronco
  arvore.rect(10, 8, 12, 2, hex('#2e7d32'));
  arvore.rect(6, 20, 8, 2, hex('#2e7d32'));
  arvore.rect(18, 26, 8, 2, hex('#2e7d32'));
  arvore.rect(22, 30, 6, 3, hex('#2e7d32')); // galho caído
  arvore.rect(7, 34, 18, 3, hex('#b8860b')); // aro do vaso
  arvore.rect(8, 37, 16, 10, hex('#d4a017')); // vaso
  salvar('spr_arvore_desmontada', arvore);

  const bilhete = new Tela(16, 16);
  bilhete.rect(3, 3, 10, 11, hex('#f7e27a'));
  for (const y of [6, 8, 10]) bilhete.rect(5, y, 6, 1, hex('#b59b2a'));
  salvar('spr_bilhete', bilhete);

  const interruptor = new Tela(16, 16);
  interruptor.rect(3, 2, 10, 12, hex('#e8dcc4'));
  interruptor.rect(3, 2, 10, 1, hex('#9a8d74'));
  interruptor.rect(3, 13, 10, 1, hex('#9a8d74'));
  interruptor.rect(7, 5, 2, 6, hex('#333333'));
  salvar('spr_interruptor', interruptor);

  const porta = new Tela(16, 32);
  porta.rect(0, 0, 16, 32, hex('#4a2c14'));
  porta.rect(1, 0, 14, 32, hex('#7a4a24'));
  porta.rect(4, 4, 8, 8, hex('#8f5c2e'));
  porta.rect(4, 16, 8, 8, hex('#8f5c2e'));
  porta.rect(11, 22, 2, 2, hex('#f4d35e')); // maçaneta
  porta.rect(3, 14, 10, 1, hex('#c9c9c9')); // placa do painel
  salvar('spr_porta', porta);

  const lampada = new Tela(32, 32);
  lampada.circulo(16, 13, 9, hex('#fff3a3'));
  lampada.circulo(16, 13, 6, hex('#ffffff'));
  lampada.rect(11, 22, 10, 4, hex('#888888'));
  lampada.rect(12, 26, 8, 3, hex('#666666'));
  salvar('spr_lampada', lampada);
}

gerarTiles();
gerarSobrinhos();
gerarObjetos();
escreverSpritesJson();

/** sprites.json do perfil: tileset (quadro = tile), folhas de andar (2 quadros de 16×24) e imagens únicas. */
function escreverSpritesJson() {
  const imagens = readdirSync(PASTA)
    .filter((n) => n.endsWith('.png'))
    .sort()
    .map((arquivo) => {
      if (arquivo.startsWith('tiles_')) return { arquivo, tipo: 'tileset', quadro: { w: 16, h: 16 } };
      if (arquivo.includes('_walk_')) return { arquivo, tipo: 'folhas', quadro: { w: 16, h: 24 }, quadros: 2 };
      return { arquivo, tipo: 'imagem' };
    });
  writeFileSync(join(PASTA, 'sprites.json'), JSON.stringify({ schemaVersion: 1, perfil: 'gba-240x160', imagens }, null, 2) + '\n');
  console.log(`assets/gba-240x160/sprites.json (${imagens.length} imagens)`);
}
