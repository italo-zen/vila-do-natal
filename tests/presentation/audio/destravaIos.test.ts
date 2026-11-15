import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Som, type EntradaDeAudio } from '../../../src/presentation/audio/Som';
import type { EstadoDoMotor, MotorDeAudio, VozDeAudio } from '../../../src/presentation/audio/motorDeAudio';
import { decodificarComCallbacks } from '../../../src/presentation/audio/motorWebAudio';

/** Destrava no iOS/WebKit (PT5, bug P1): decodificação isolada por arquivo, nova tentativa no gesto, WAV silencioso. */
const config = JSON.parse(readFileSync(join(__dirname, '..', '..', '..', 'content', 'audio.json'), 'utf-8'));
const laco = { atrasoInicial: 1105, preenchimentoFinal: 551, amostrasNoArquivo: 795456, amostras: 793800 };
const ids: string[] = [
  config.musica.id,
  ...Object.values(config.eventos as Record<string, { id?: string }>).map((e) => e.id).filter((id): id is string => !!id),
  ...Object.values(config.conquistas as Record<string, { id: string }>).map((c) => c.id),
  config.creditos.id,
];

function entrada(): EntradaDeAudio {
  const bytes: Record<string, ArrayBuffer> = {};
  ids.forEach((id, i) => (bytes[id] = new ArrayBuffer(10 + i)));
  return { config, laco, bytes };
}

/** Motor falso: `falhar` é o conjunto de ids cuja decodificação rejeita no boot (e opcionalmente no gesto). */
function motor(falhar: Set<string>, falharNoGesto = false) {
  const reg = { iniciou: 0, retomou: 0, tocadas: 0, decodificacoes: [] as { tamanho: number; aoVivo: boolean }[] };
  let estado: EstadoDoMotor = 'suspenso';
  const m: MotorDeAudio = {
    iniciar() {
      reg.iniciou++;
    },
    async decodificar(bytes, aoVivo = false) {
      reg.decodificacoes.push({ tamanho: bytes.byteLength, aoVivo });
      const id = ids.find((_, i) => bytes.byteLength === 10 + i);
      if (!aoVivo && id && falhar.has(id)) throw new Error(`erro de decodificação em ${id}`);
      if (aoVivo && falharNoGesto && id && falhar.has(id)) throw new Error(`ainda falha em ${id}`);
      return { length: bytes.byteLength === 10 ? 795456 : 4000, id: bytes.byteLength };
    },
    comprimento: (b) => (b as { length: number }).length,
    taxaDoBuffer: () => 22050,
    tocar(): VozDeAudio {
      reg.tocadas++;
      return { parar: () => undefined, fimEm: Infinity, pararEm: () => undefined };
    },
    definirMestre: () => undefined,
    barramentoDaTrilha: () => ({}),
    agora: () => 0,
    rampaGanho: () => undefined,
    estado: () => estado,
    async retomar() {
      reg.retomou++;
    },
  };
  return { m, reg };
}

describe('decodificação isolada por arquivo (iOS: uma falha não silencia o jogo)', () => {
  it('se um arquivo falha, os demais decodificam e tocam', async () => {
    const { m } = motor(new Set([ids[3]]));
    const som = new Som(m, entrada());
    await som.decodificarTudo();
    expect(som.estado().decodificados).toBe(ids.length - 1);
    expect(som.estado().erros.join(' ')).toMatch(new RegExp(ids[3]));
  });

  it('se a trilha falha no boot, os efeitos continuam disponíveis', async () => {
    const { m, reg } = motor(new Set([config.musica.id]));
    const som = new Som(m, entrada());
    await som.decodificarTudo();
    som.gesto('click');
    som.tocar('S05', 'exploracao');
    expect(reg.tocadas).toBe(1);
  });

  it('o gesto tenta de novo os arquivos que falharam, com o contexto real (aoVivo)', async () => {
    const { m, reg } = motor(new Set([ids[2]]));
    const som = new Som(m, entrada());
    await som.decodificarTudo();
    som.gesto('pointerdown');
    await new Promise((r) => setTimeout(r, 0));
    expect(reg.decodificacoes.some((d) => d.aoVivo)).toBe(true);
    expect(som.estado().decodificados).toBe(ids.length);
    expect(som.estado().erros).toEqual([]);
  });

  it('erro persistente depois do gesto fica registrado, e o resto segue', async () => {
    const { m } = motor(new Set([ids[2]]), true);
    const som = new Som(m, entrada());
    await som.decodificarTudo();
    som.gesto('click');
    await new Promise((r) => setTimeout(r, 0));
    expect(som.estado().erros.length).toBe(1);
  });
});

describe('destrava a cada gesto enquanto o contexto não estiver ativo (iOS)', () => {
  it('um gesto que não destravou é repetido no gesto seguinte', async () => {
    const { m, reg } = motor(new Set());
    const som = new Som(m, entrada());
    await som.decodificarTudo();
    som.gesto('pointerdown');
    som.gesto('touchend');
    som.gesto('click');
    expect(reg.iniciou).toBeGreaterThanOrEqual(2);
  });

  it('sem gesto, nada é iniciado (AU1)', async () => {
    const { m, reg } = motor(new Set());
    const som = new Som(m, entrada());
    await som.decodificarTudo();
    expect(reg.iniciou).toBe(0);
  });
});

describe('decodificação com callback e com promessa (WebKit)', () => {
  it('aceita a forma de callback (sem promessa)', async () => {
    const ctx = { decodeAudioData: (d: ArrayBuffer, ok: (b: unknown) => void) => { ok({ len: d.byteLength }); return undefined; } };
    const buf = await decodificarComCallbacks(ctx as unknown as BaseAudioContext, new ArrayBuffer(8));
    expect((buf as unknown as { len: number }).len).toBe(8);
  });

  it('aceita a forma de promessa, e a rejeição vira erro', async () => {
    const ok = { decodeAudioData: async () => ({ ok: true }) };
    expect(await decodificarComCallbacks(ok as unknown as BaseAudioContext, new ArrayBuffer(4))).toEqual({ ok: true });
    const ruim = { decodeAudioData: (_d: ArrayBuffer, _ok: unknown, err: (e: unknown) => void) => { err(new Error('EncodingError')); return undefined; } };
    await expect(decodificarComCallbacks(ruim as unknown as BaseAudioContext, new ArrayBuffer(4))).rejects.toThrow('EncodingError');
  });

  it('copia os bytes antes de decodificar (o WebKit transfere a posse)', async () => {
    let recebido: ArrayBuffer | null = null;
    const ctx = { decodeAudioData: async (d: ArrayBuffer) => { recebido = d; return {}; } };
    const original = new ArrayBuffer(4);
    await decodificarComCallbacks(ctx as unknown as BaseAudioContext, original);
    expect(recebido).not.toBe(original);
  });
});
