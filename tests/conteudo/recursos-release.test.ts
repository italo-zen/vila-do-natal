import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { nomeComHash, ordemDeCarga, IMAGENS_DE_TELA } from '../../vite.recursos';
import { criarRecursos } from '../../src/presentation/recursos/recursos';

/** ADR-009 2 (nomes com hash), 4.1 (ordem de carga), 4.6 (modos). Usa os arquivos reais do repositório. */
const RAIZ = join(__dirname, '..', '..');
const config = JSON.parse(readFileSync(join(RAIZ, 'content', 'audio.json'), 'utf-8'));

describe('nomes com hash (ADR-009 2)', () => {
  it('<base>.<8 hex de SHA-256><ext>, e muda quando o conteúdo muda', () => {
    const a = nomeComHash('mus_natal', '.mp3', new Uint8Array([1, 2, 3]));
    const b = nomeComHash('mus_natal', '.mp3', new Uint8Array([1, 2, 4]));
    expect(a).toMatch(/^mus_natal\.[0-9a-f]{8}\.mp3$/);
    expect(a).not.toBe(b);
    expect(nomeComHash('mus_natal', '.mp3', new Uint8Array([1, 2, 3]))).toBe(a);
  });
});

describe('ordem de carga da release (ADR-009 4.1)', () => {
  it('título, trilha, 12 efeitos, 5 jingles, JC e fim: 21 itens, nessa ordem', () => {
    const arquivos: Record<string, { bytes: Uint8Array; origem: string }> = {};
    const nomes: Record<string, string> = {};
    const ids = [config.musica.id, ...Object.values(config.eventos).map((e: any) => e.id).filter(Boolean), ...Object.values(config.conquistas).map((c: any) => c.id), config.creditos.id];
    for (const id of ids) {
      arquivos[`audio:${id}`] = { bytes: new Uint8Array([1]), origem: `/x/${id}.mp3` };
      nomes[`audio:${id}`] = `audio/${id}.00000000.mp3`;
    }
    for (const chave of Object.keys(IMAGENS_DE_TELA)) {
      arquivos[`imagem:${chave}`] = { bytes: new Uint8Array([2]), origem: `/x/${chave}.png` };
      nomes[`imagem:${chave}`] = `imagens/${chave}.00000000.png`;
    }
    const ordem = ordemDeCarga(config, arquivos, nomes);
    expect(ordem).toHaveLength(21);
    expect(ordem[0]).toMatchObject({ tipo: 'imagem', id: 'titulo' });
    expect(ordem[1]).toMatchObject({ tipo: 'audio', id: 'mus_natal' });
    expect(ordem.slice(2, 14).every((i) => i.tipo === 'audio' && i.id.startsWith('sfx_'))).toBe(true);
    expect(ordem.slice(14, 19).every((i) => i.id.startsWith('jin_j0'))).toBe(true);
    expect(ordem[19]).toMatchObject({ tipo: 'audio', id: 'jin_jc_natal' });
    expect(ordem[20]).toMatchObject({ tipo: 'imagem', id: 'fim' });
  });
});

describe('fachada de recursos (ADR-009 4.6)', () => {
  it('embutido: tudo pronto, nada baixa, e o título recebe os bytes da data URL', () => {
    const dataUrl = 'data:image/png;base64,' + Buffer.from([137, 80, 78, 71]).toString('base64');
    const r = criarRecursos({ modo: 'embutido', imagens: { titulo: dataUrl }, ordem: [] }, 'https://x/', async () => {
      throw new Error('não deveria baixar');
    });
    let tamanho = 0;
    r.aoChegar('titulo', (b) => (tamanho = b.byteLength));
    r.iniciar();
    expect(tamanho).toBe(4);
    expect(r.estado('titulo')).toBe('pronta');
    expect(r.falhas()).toEqual([]);
  });

  it('externo: só começa a baixar em iniciar(), na ordem, com URLs relativas à base (subcaminho)', async () => {
    const pedidos: string[] = [];
    const r = criarRecursos(
      {
        modo: 'externo',
        imagens: {},
        ordem: [
          { tipo: 'imagem', id: 'titulo', arquivo: 'imagens/titulo.11111111.png' },
          { tipo: 'audio', id: 'mus_natal', arquivo: 'audio/mus_natal.22222222.mp3' },
        ],
      },
      'https://italo-zen.github.io/vila-do-natal/',
      async (url) => {
        pedidos.push(url);
        return new ArrayBuffer(1);
      },
    );
    expect(pedidos).toEqual([]);
    r.iniciar();
    r.iniciar();
    await new Promise((res) => setTimeout(res, 10));
    expect(pedidos).toEqual(['https://italo-zen.github.io/vila-do-natal/imagens/titulo.11111111.png', 'https://italo-zen.github.io/vila-do-natal/audio/mus_natal.22222222.mp3']);
  });
});
