import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { criarRecursos } from '../../../src/presentation/recursos/recursos';
import { bytesDaDataUrl } from '../../../src/presentation/recursos/recursos';

/**
 * BUG P1 da 1.0.0 (imagem do título ausente no playtest): no modo `embutido` a chegada é síncrona, dentro do create. Este
 * teste fixa o ramo embutido com o deploy real: data URL do PNG de verdade → bytes idênticos ao arquivo, 480×352.
 * A textura no Phaser é conferida pelo smoke (tools/smoke-imagem-de-tela.mjs), que mede pixels.
 */
const RAIZ = join(__dirname, '..', '..', '..');
const titulo = readFileSync(join(RAIZ, 'assets', 'hd-480x352', 'tela_titulo.png'));
const fim = readFileSync(join(RAIZ, 'assets', 'hd-480x352', 'tela_fim.png'));
const dataUrl = (b: Buffer) => `data:image/png;base64,${b.toString('base64')}`;

describe('ramo embutido: deploy real (BUG P1 da 1.0.0)', () => {
  const deploy = { modo: 'embutido' as const, imagens: { titulo: dataUrl(titulo), fim: dataUrl(fim) }, ordem: [] };

  it('a chegada é síncrona e entrega os bytes do PNG do título', () => {
    const r = criarRecursos(deploy, 'https://x/', async () => {
      throw new Error('não baixa no embutido');
    });
    let recebido: Uint8Array | null = null;
    r.aoChegar('titulo', (b) => (recebido = new Uint8Array(b)));
    expect(recebido).not.toBeNull();
    expect(Buffer.from(recebido!).equals(titulo)).toBe(true);
    expect(r.estado('titulo')).toBe('pronta');
  });

  it('o PNG entregue é 480×352 (perfil hd, GDD 20.3)', () => {
    const bytes = bytesDaDataUrl(dataUrl(titulo));
    const png = Buffer.from(bytes);
    expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(480);
    expect(png.readUInt32BE(20)).toBe(352);
  });

  it('a imagem de fim também chega de forma síncrona (mesmo caminho)', () => {
    const r = criarRecursos(deploy, 'https://x/', async () => new ArrayBuffer(0));
    let tamanho = 0;
    r.aoChegar('fim', (b) => (tamanho = b.byteLength));
    expect(tamanho).toBe(fim.length);
  });

  it('o embutido nunca marca falha nem baixa nada', () => {
    const r = criarRecursos(deploy, 'https://x/', async () => {
      throw new Error('não');
    });
    r.iniciar();
    expect(r.falhas()).toEqual([]);
  });
});
