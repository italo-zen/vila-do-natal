// Leitor de PNG para as ferramentas (sem dependência externa): dimensões, decodificação RGBA e cores distintas.
// Cobre o que o projeto usa: 8 bits, não entrelaçado, tipos RGB (2) e RGBA (6).
import { deflateSync, inflateSync, crc32 } from 'node:zlib';

/** Largura e altura do IHDR. */
export function dimensoesDoPng(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) throw new Error('não é PNG');
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

/** Decodifica para RGBA (Uint8Array de w×h×4). */
export function decodificarPng(buf) {
  let pos = 8;
  let w;
  let h;
  let bitDepth;
  let colorType;
  let interlace;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const tipo = buf.toString('ascii', pos + 4, pos + 8);
    const dados = buf.subarray(pos + 8, pos + 8 + len);
    if (tipo === 'IHDR') {
      w = dados.readUInt32BE(0);
      h = dados.readUInt32BE(4);
      bitDepth = dados[8];
      colorType = dados[9];
      interlace = dados[12];
    }
    if (tipo === 'IDAT') idat.push(dados);
    pos += 12 + len;
  }
  if (bitDepth !== 8 || interlace !== 0 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`PNG não suportado (bitDepth ${bitDepth}, colorType ${colorType}, entrelaçado ${interlace})`);
  }
  const bpp = colorType === 6 ? 4 : 3;
  const stride = w * bpp;
  const raw = inflateSync(Buffer.concat(idat));
  const out = Buffer.alloc(stride * h);
  let anterior = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const filtro = raw[y * (stride + 1)];
    const linha = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const atual = out.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? atual[x - bpp] : 0;
      const b = anterior[x];
      const c = x >= bpp ? anterior[x - bpp] : 0;
      const v = linha[x];
      let r;
      if (filtro === 0) r = v;
      else if (filtro === 1) r = v + a;
      else if (filtro === 2) r = v + b;
      else if (filtro === 3) r = v + ((a + b) >> 1);
      else {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        r = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      }
      atual[x] = r & 255;
    }
    anterior = atual;
  }
  const rgba = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = out[i * bpp];
    rgba[i * 4 + 1] = out[i * bpp + 1];
    rgba[i * 4 + 2] = out[i * bpp + 2];
    rgba[i * 4 + 3] = bpp === 4 ? out[i * bpp + 3] : 255;
  }
  return { w, h, rgba };
}

/** Cores distintas entre pixels opacos (alfa > 0). Pixel transparente não conta na paleta. */
export function coresDistintas(rgba, conjunto = new Set()) {
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] === 0) continue;
    conjunto.add((rgba[i] << 24) | (rgba[i + 1] << 16) | (rgba[i + 2] << 8) | rgba[i + 3]);
  }
  return conjunto;
}

/** Codifica RGBA 8 bits, não entrelaçado (PNG mínimo para os placeholders). */
export function codificarPng(w, h, rgba) {
  const linhas = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    linhas[y * (w * 4 + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(linhas, y * (w * 4 + 1) + 1);
  }
  const chunk = (tipo, dados) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(dados.length);
    const td = Buffer.concat([Buffer.from(tipo, 'ascii'), dados]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(linhas)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
